# Modelo de animação didática — contrato de eventos, motor e renderização

| Campo | Valor |
|-------|-------|
| **Status** | ❌ Não iniciado — o motor atual é incompatível com todas as decisões fechadas |
| **Cobertura** | ~0% (0 de 8 decisões implementadas); o código existente é descartado, não migrado |
| **Esforço [modelado]** | 9–13 dias-dev no escopo completo; 4–5 d no mínimo viável (motor + 1 família) |
| **Depende de** | Nada — pode começar já. É a fundação dos outros dois relatórios |
| **Bloqueia** | `FUNDACAO-APP-RESPONSIVA.md` (seção de renderização) e todo conteúdo novo |

---

## 1. Estado atual — evidências

O projeto tem 3.148 linhas de TypeScript em `src/app`, com quatro algoritmos
implementados em `core/algorithms/`. O motor de reprodução existe e funciona,
mas foi construído sobre quatro premissas que as decisões desta entrega
invertem. Não é um caso de refatoração incremental: as quatro premissas são
estruturais e sustentam umas às outras.

### 1.1 O passo carrega o estado inteiro, clonado

`bubble-sort.ts:8` define `clone` e o aplica em **todos** os cinco pontos de
emissão do algoritmo (`:14`, `:28`, `:40`, `:57`, `:71`):

```ts
// core/algorithms/bubble-sort.ts:8
const clone = (arr: ArrayElement[]) => arr.map(e => ({ ...e }));
```

O tipo obriga a isso: `AlgorithmDef.generateSteps` (`core/models/algorithm.model.ts`)
devolve `Snapshot[]`, e `Snapshot.state` (`core/models/snapshot.model.ts`) é o
estado completo, não uma diferença.

**Consequência dimensionada [modelado]:** bubble sort é O(n²) em comparações e
emite ~3 eventos por comparação. Com n = 500, são ~125.000 comparações →
~375.000 passos, cada um clonando 500 objetos. São ~187 milhões de objetos
materializados antes do primeiro quadro aparecer. O `plan.md` na raiz do
repositório promete exatamente esse regime — *"60fps mesmo visualizando arrays
de tamanho médio-grande (ex: 500 a 1000 elementos)"* — e o modelo de dados
atual o torna inalcançável por ordens de grandeza, não por ajuste fino.

### 1.2 A posição de tela é calculada com constantes fixas em pixels

Os três visualizadores fixam suas dimensões como constantes de classe:

| Arquivo | Constantes |
|---|---|
| `visualization/array.visualizer.ts:14-16` | `BAR_WIDTH = 40` · `BAR_MARGIN = 8` · `MAX_BAR_HEIGHT = 400` |
| `visualization/tree.visualizer.ts:19-20` | `NODE_RADIUS = 25` · `LEVEL_HEIGHT = 80` |
| `visualization/linked-list.visualizer.ts:19-21` | `NODE_WIDTH = 78` · `NODE_HEIGHT = 44` · `NODE_GAP = 30` |

O `viewport` é lido (`array.visualizer.ts:75-76`) apenas para **centralizar** o
conjunto (`:88`, `startX`), nunca para dimensioná-lo. A largura total é uma
função exclusiva da contagem de elementos (`:87`):

```ts
// core/../array.visualizer.ts:87
const totalWidth = Math.max(elements.length * (this.BAR_WIDTH + this.BAR_MARGIN) - this.BAR_MARGIN, 0);
```

Doze elementos ocupam 12 × 48 − 8 = **568 px** de largura fixa. Em uma viewport
de 360 px o conjunto simplesmente transborda; `startX` é grampeado em 16
(`:88`) e o restante sai da tela. Não existe caminho de código que reduza
`BAR_WIDTH` conforme o espaço.

### 1.3 A animação é um lerp por quadro, sem fim determinado

`array.visualizer.ts:60-68` roda dentro do *ticker* do PixiJS:

```ts
// visualization/array.visualizer.ts:61-64
const lerpSpeed = 0.15;
container.x += (container.targetX - container.x) * lerpSpeed;
```

Três defeitos num bloco de quatro linhas. **Primeiro:** é interpolação
exponencial — `x` aproxima-se de `targetX` assintoticamente e nunca chega, então
não existe o instante "a transição terminou". **Segundo:** o passo é proporcional
ao quadro, não ao tempo; a mesma animação é mais rápida a 144 Hz do que a 60 Hz.
**Terceiro:** não há easing controlável nem cancelamento.

### 1.4 ⚠️ O relógio do playback é independente da animação

`core/services/playback.service.ts:26-30` avança por `setInterval` fixo:

```ts
// core/services/playback.service.ts:28-30
const interval = setInterval(() => {
  this.next();
}, this.speed());
```

`speed` tem valor inicial de 1.000 ms (`:11`). O lerp de 1.3 leva um número
indefinido de quadros para convergir. Os dois relógios não se conhecem: quando
o usuário reduz `speed`, os passos passam a ultrapassar as transições e as
barras aparecem teleportando. **Este é o defeito que mais degrada o valor
didático** — o movimento é justamente o que explica a troca, e ele é o primeiro
a ser perdido sob velocidade alta.

### 1.5 Prova de ausência

```bash
grep -rn "ResizeObserver\|matchMedia\|pointerdown\|touchstart\|prefers-reduced-motion" src/
# → 0 resultados

grep -rn "aria-live\|role=" src/
# → 0 resultados
```

Não existe **nenhuma** adaptação a redimensionamento, **nenhum** tratamento de
toque, **nenhum** respeito a `prefers-reduced-motion` e **nenhuma** região viva
para leitor de tela. A narração por passo — decidida como parte obrigatória do
contrato — não tem hoje nem o campo que a carregue: `Snapshot.description`
existe (`snapshot.model.ts`) e é preenchido em português nos algoritmos
(`bubble-sort.ts:13,26,38,55,70`), mas nunca é anunciado por tecnologia
assistiva, apenas exibido.

Nenhum destes defeitos é causado pelo pedido atual — mas todos vivem no código
que será descartado, e nenhum deles sobrevive ao contrato da seção 2.

---

## 2. As oito decisões de design

### 2.1 O algoritmo é um gerador, escrito uma única vez

`function*` que emite eventos e cede o controle. É a fonte única de verdade
consumida por dois clientes com taxas diferentes: o modo tutor consome um
evento por transição, com narração; o modo performance drena N eventos por
quadro e pinta apenas o estado resultante.

| Opção | O que é | Custo | Veredito |
|---|---|---|---|
| Gerador único, dois consumidores | `function*` emite eventos; consumidores diferem só na taxa de drenagem | Autor precisa pensar em granularidade de evento | **Recomendada** |
| Duas implementações | Uma versão narrada, uma versão crua otimizada | Divergem com o tempo e passam a ensinar coisas diferentes | Rejeitada: o risco é pedagógico, não técnico |
| Motor único síncrono | Uma implementação servindo os dois modos sem gerador | Não dá para pausar no meio de uma recursão | Rejeitada: quick sort é recursivo e o passo a passo exige suspensão |

### 2.2 O passo é um delta semântico tipado, com vocabulário fechado

Um núcleo comum que toda família entende, mais um dialeto por família. União
discriminada, com exaustividade garantida pelo compilador em cada `switch`:

```ts
interface EventoBase {
  narracao: string;            // obrigatório — anunciado via aria-live
  linhaPseudocodigo?: number;  // índice no pseudocódigo canônico
}

type EventoNucleo =
  | { tipo: 'destacar';  ids: string[] }
  | { tipo: 'comparar';  ids: [string, string]; resultado: -1 | 0 | 1 }
  | { tipo: 'visitar';   id: string }
  | { tipo: 'concluir';  ids: string[] };

type EventoLinear =
  | { tipo: 'trocar';    ids: [string, string] }
  | { tipo: 'inserir';   id: string; valor: number; posicao: number }
  | { tipo: 'remover';   id: string }
  | { tipo: 'definir-pivo';     id: string | null }
  | { tipo: 'delimitar-escopo'; de: number; ate: number };

type EventoHierarquico =
  | { tipo: 'criar-no';  id: string; valor: number }
  | { tipo: 'ligar';     pai: string; filho: string; lado: 'esq' | 'dir' }
  | { tipo: 'desligar';  pai: string; lado: 'esq' | 'dir' }
  | { tipo: 'rotacionar'; pivo: string; sentido: 'esq' | 'dir' };
```

**Toda referência é por `id`, nunca por índice.** O código atual mistura os dois
critérios — `ArrayState.elements` tem `id` (`visualization-state.model.ts`), mas
os destaques usam posição (`comparingIndices`, `swappingIndices`, `pivotIndex`).
Índice é ambíguo no exato instante em que o elemento se move, que é o instante
que a animação precisa representar.

### 2.3 A narração é campo obrigatório do evento, não um extra

`narracao` não é opcional em `EventoBase`. Um algoritmo que emita evento sem
narração não compila. Isso decorre da exigência de que um aluno cego acompanhe
o algoritmo inteiro só pelo teclado: se a narração for opcional, ela será
esquecida no terceiro algoritmo e a promessa de acessibilidade se dissolve em
silêncio.

**Consequência para o modo performance:** narrar 375.000 eventos é impossível e
inútil. O modo performance ignora o campo — ele continua obrigatório na
emissão, e é o consumidor que decide anunciá-lo ou não.

### 2.4 O estado é reconstruído por checkpoints + replay

O motor mantém o estado corrente e aplica deltas. A cada K eventos, grava uma
cópia completa. Para ir ao passo X: parte do último checkpoint ≤ X e reaplica
os deltas intermediários.

| Opção | O que é | Custo | Veredito |
|---|---|---|---|
| Checkpoints + replay | Estado completo a cada K eventos; deltas reaplicados | Memória de `⌈total/K⌉` estados; até K aplicações por salto | **Recomendada** |
| Eventos invertíveis | Todo evento sabe se desfazer | Cada autor tem que acertar o inverso; um inverso errado corrompe o estado **em silêncio** | Rejeitada: transfere o risco para quem menos pode carregá-lo |
| Guardar todos os estados | Materializar cada estado | É exatamente o defeito de 1.1 | Rejeitada |

**Valor inicial sugerido: K = 64 [modelado].** Não foi medido. O critério de
ajuste é que o replay do pior caso caiba em um quadro (~16 ms); K deve ser
calibrado depois que o custo real de aplicar um delta for medido.

### 2.5 O layout é do renderizador, e é função pura

Assinatura obrigatória, uma por família:

```ts
type Layout<E> = (estado: E, largura: number, altura: number) => Map<string, Caixa>;
interface Caixa { x: number; y: number; largura: number; altura: number; }
```

O gerador **nunca** conhece a tela. Redimensionar a janela ou girar o celular
recalcula posições sem tocar no algoritmo e sem regerar evento nenhum. É a
decisão que separa este modelo do atual, onde a geometria vive dentro do
visualizador acoplada ao estado (1.2).

Dimensionar em pixels reais, não escalar por `viewBox`: em 360 px as barras
ficam mais estreitas e os rótulos mantêm ~14 px legíveis. Escala proporcional
tornaria o texto ilegível exatamente no dispositivo mais usado pelo aluno.

### 2.6 A animação comanda o relógio, via Web Animations API

O passo seguinte só é liberado quando a transição termina:

```ts
const animacoes = alvos.map(({ el, de, para }) =>
  el.animate([de, para], { duration: duracaoMs, easing: 'ease-in-out', fill: 'forwards' })
);
await Promise.all(animacoes.map(a => a.finished));
```

`Animation.finished` é o sinal que os defeitos 1.3 e 1.4 não conseguem
produzir. A velocidade escolhida pelo aluno define `duracaoMs` — não existe um
segundo relógio para dessincronizar.

**`prefers-reduced-motion`:** `duracaoMs = 0`. A `Promise` ainda resolve, o
estado troca instantaneamente e **a narração continua**. O contrato não muda.

**Retroceder e saltar:** `animation.cancel()` em tudo que estiver em voo, depois
reposiciona no estado alvo. `transitionend` do CSS não dispara de forma
confiável quando a transição é interrompida — e interromper é precisamente o
que o retroceder faz, o tempo todo.

### 2.7 SVG/DOM é o substrato, inclusive no modo performance

Cada nó é elemento real: recebe `role`, `aria-label`, foco de teclado, é lido
por leitor de tela e acompanha o zoom do navegador. Com PixiJS nada disso
existe no DOM, e o `MUST pass all AXE checks` de `.claude/CLAUDE.md` só seria
atendível construindo uma árvore DOM paralela espelhando o canvas — trabalho
dobrado e permanentemente sujeito a dessincronizar.

O modo performance usa o **mesmo** renderizador, degradado: sem rótulos, sem
transição individual por elemento, drenando N eventos por quadro. Canvas só
entra se a medição da fase F5 provar necessidade.

### 2.8 O que não fazer

- **Não colocar coordenadas no evento.** Reintroduz o acoplamento de 1.2 e
  quebra o redimensionamento.
- **Não usar índice como identidade.** Ver 2.2.
- **Não construir o renderizador canvas por especulação.** Dois renderizadores
  para manter em sincronia desde o primeiro dia, sem número que justifique.
- **Não deixar `narracao` opcional** para "preencher depois".
- **Não reaproveitar `PlaybackService`.** Ele é `providedIn: 'root'`
  (`playback.service.ts:5-6`), assim como `PixiService`
  (`pixi.service.ts:5`) — singletons globais que impedem duas visualizações na
  mesma página, o que a home catálogo vai querer.

---

## 3. Plano de implementação

| Fase | Conteúdo | Esforço [modelado] |
|---|---|---|
| **F0** | Tipos do núcleo e dos dois dialetos; `EventoBase` com `narracao` obrigatória | 0,5 d |
| **F1** | Motor: estado corrente, aplicação de delta, checkpoints, replay, `irParaPasso` | 2–3 d |
| **F2** | Relógio: integração WAAPI, `duracaoMs` a partir da velocidade, cancelamento, `prefers-reduced-motion` | 1,5–2 d |
| **F3** | Família linear: layout puro, renderizador SVG, quick sort como gerador | 2–3 d |
| **F4** | Família hierárquica: layout de árvore, renderizador, inserção em BST | 2–3 d |
| **F5** | Medição do modo performance: SVG degradado com ~500 elementos, número registrado neste relatório | 0,5–1 d |
| **F6** | Teste de contrato reutilizável + guia curto de autoria | 1 d |

**Mínimo viável** (motor provado por uma família): F0 + F1 + F2 + F3 ≈ 6–8,5 d.
**Escopo completo:** F0–F6 ≈ 9,5–13,5 d.

A ordem importa em dois pontos. F2 **antes** de F3: se o renderizador nascer
com um laço de animação próprio, ele vai reproduzir o defeito 1.4 e a correção
depois custa reescrevê-lo. E F4 **antes** de F6: o teste de contrato só é
honesto depois que duas famílias diferentes o tiverem exercitado — escrito
sobre uma só, ele codifica as suposições daquela família.

---

## 4. Armadilhas

| Armadilha | Mitigação |
|---|---|
| A linha do tempo arrastável exige lista de eventos finita e materializada, para saber o total. O modo performance drena preguiçosamente e **não tem** total conhecido. | Declarar no contrato: timeline é recurso do modo tutor. O modo performance expõe apenas play/pausa/reiniciar. Não tentar unificar. |
| `Animation.finished` **rejeita** com `AbortError` quando `cancel()` é chamado. Um `await` sem `catch` derruba o motor a cada retroceder. | Envolver todo `await` de animação em tratamento que trate cancelamento como fluxo normal, não como erro. |
| Com `duracaoMs = 0`, `Promise.all` resolve no microtask seguinte e o motor pode drenar centenas de passos antes de um quadro pintar. | Piso de espera de um `requestAnimationFrame` entre passos, mesmo com duração zero. |
| Elementos criados em runtime (`criar-no` na BST) não têm posição anterior para animar a partir de. | O layout devolve a caixa do nó; o renderizador anima de opacidade 0 + escala 0,8 na posição final. Definir isso no contrato, não em cada renderizador. |
| Replay a partir de checkpoint precisa produzir estado **idêntico** ao avanço passo a passo. Qualquer delta não determinístico quebra isso sem aviso. | Proibir `Math.random` e `Date.now` dentro de geradores. Os dados de entrada vêm prontos do preset. É o invariante testado em F6. |
| `Snapshot.timestamp` hoje é `Date.now()` (`bubble-sort.ts:12,25,37,54,69`), o que torna a saída não determinística e intestável. | Não existe campo de tempo no novo evento. |

---

## 5. Verificação

**Automatizável em CI (`ng test`):**

- [ ] Para cada gerador, a sequência de eventos emitida bate com a esperada — é
      isso que impede que uma "otimização" no algoritmo mude silenciosamente o
      que o aluno vê.
- [ ] Aplicar deltas do início até o passo X produz estado **idêntico** ao
      replay a partir do checkpoint anterior a X. Rodado para todo X, não só
      para alguns.
- [ ] Todo evento emitido por todo gerador tem `narracao` não vazia.
- [ ] O estado final de quick sort é um array ordenado; o da BST satisfaz a
      invariante de busca binária. Guarda o algoritmo em si, não a animação.
- [ ] `Layout` linear com 12 elementos em 360 px devolve caixas cuja soma de
      largura cabe em 360 px — o teste falha se alguém reintroduzir constante fixa.
- [ ] `Layout` é puro: mesma entrada, mesma saída, sem leitura de `window`.
- [ ] Exaustividade — um `tipo` novo no dialeto quebra a compilação de todo
      `switch` que o consome.

**Só no navegador, declarado como não verificado até rodar:**

- [ ] Retroceder no meio de uma transição não deixa elemento parado fora de lugar.
- [ ] Com `prefers-reduced-motion: reduce` ativo no SO, os passos avançam e a
      narração continua sendo anunciada.
- [ ] Leitor de tela real (NVDA ou Orca) anuncia cada passo uma única vez.
- [ ] Modo performance com ~500 elementos: quadros por segundo medidos e
      registrados. **É o número que decide se canvas entra no projeto.**

---

## 6. Riscos

1. **O número da fase F5 pode invalidar a decisão de renderizador único.** Se o
   SVG degradado não sustentar ~500 elementos, o modo performance exige um
   segundo renderizador em canvas — mais 3–4 dias-dev [modelado] e uma
   superfície permanente de sincronização. O risco está contido por F5 vir
   cedo e ser barata, mas ele existe.
2. **A granularidade do evento é uma decisão pedagógica disfarçada de técnica.**
   Se `comparar` e `trocar` forem finos demais, o aluno se perde em ruído; se
   forem grossos demais, o passo esconde o mecanismo. Isso não se resolve no
   código — resolve-se olhando a animação rodando, e provavelmente vai exigir
   ajuste depois de F3.
3. **Quick sort como primeira referência é deliberadamente o caso difícil.**
   Recursão, pivô, partição e escopo de sub-array exercitam o dialeto linear
   inteiro. Se o contrato tiver um furo, ele aparece em F3 — que é o objetivo,
   mas significa que F3 pode transbordar para revisão do contrato.
4. **Não há histórico em git.** Decisão do usuário, registrada em
   `MIGRACAO-LEGADO-E-FASES.md`. Enquanto valer, qualquer erro durante a
   reescrita é irreversível.

---

## 7. Arquivos tocados

| Arquivo | Mudança |
|---|---|
| `src/app/motor/eventos.ts` | **novo** — núcleo, dialetos, `EventoBase` |
| `src/app/motor/motor-reproducao.ts` | **novo** — estado corrente, deltas, checkpoints, replay |
| `src/app/motor/relogio-animacao.ts` | **novo** — WAAPI, duração, cancelamento, reduced-motion |
| `src/app/motor/contrato.spec.ts` | **novo** — teste de contrato reutilizável (F6) |
| `src/app/familias/linear/layout-linear.ts` | **novo** — função pura de layout |
| `src/app/familias/linear/renderizador-linear.ts` | **novo** — SVG |
| `src/app/familias/linear/quick-sort.ts` | **novo** — gerador |
| `src/app/familias/hierarquica/layout-arvore.ts` | **novo** |
| `src/app/familias/hierarquica/renderizador-arvore.ts` | **novo** |
| `src/app/familias/hierarquica/bst-insercao.ts` | **novo** |
| `src/app/visualization/` | **apagado** ao fim de F4 — 673 linhas, 5 arquivos |
| `src/app/core/algorithms/` | **apagado** ao fim de F4 — 518 linhas, 5 arquivos |
| `src/app/core/services/playback.service.ts` | **apagado** ao fim de F1 |
| `src/app/core/models/snapshot.model.ts` | **apagado** ao fim de F0 |
| `docs/AUTORIA-DE-ALGORITMOS.md` | **novo** — guia curto (F6) |

---

## 8. O que não foi verificado

- **Nenhum número de desempenho foi medido.** Os ~375.000 passos de 1.1, os
  ~187 milhões de objetos, o K = 64 de 2.4 e todos os esforços em dias-dev são
  `[modelado]`. A contagem de eventos vem da complexidade assintótica de bubble
  sort, não de execução.
- **O SVG não foi testado com ~500 elementos.** É exatamente por isso que F5
  existe como fase, e não como suposição.
- **Nenhum leitor de tela foi executado.** A afirmação de que PixiJS impede
  acessibilidade decorre de o canvas não expor nós ao DOM — verificável por
  leitura, mas nenhum teste com NVDA ou Orca foi rodado neste projeto.
- **A API `Animation.finished` não foi exercitada neste código.** A busca
  `grep -rn "\.animate(\|getAnimations" src/` retorna 0 resultados; todo o
  comportamento descrito em 2.6 vem da especificação da Web Animations API,
  não de código rodando aqui.
- **A hipótese de que `Snapshot` poderia ser mantido e otimizado está refutada**
  e fica registrada para não voltar: o campo `state` é o estado completo por
  definição do tipo, e todo consumidor depende disso. Aliviar o clone sem
  trocar o tipo apenas move o custo.

---

> Nenhum item deste relatório foi executado. O projeto não é um repositório git
> (`git status` → `fatal: not a git repository`), então não há commit a citar;
> toda a análise vem da leitura do código presente em `src/app` em 28/08/2026,
> com `ng build` e `ng test` **não executados**. A validação está listada na
> seção 5 como pendente.
