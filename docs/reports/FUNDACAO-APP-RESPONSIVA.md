# Fundação do app — responsividade, rotas indexáveis, tema e acessibilidade

| Campo | Valor |
|-------|-------|
| **Status** | ❌ Não iniciado — o app atual é desktop-only por construção |
| **Cobertura** | ~0% (0 de 6 frentes); zero `@media` no projeto inteiro |
| **Esforço [modelado]** | 7–10 dias-dev no escopo completo; 3–4 d no mínimo viável |
| **Depende de** | `MODELO-ANIMACAO-DIDATICA.md` F0–F3 — o renderizador SVG precisa existir antes do layout responsivo ser testável |
| **Fecha requisito** | `MUST pass all AXE checks` e `WCAG AA` de `.claude/CLAUDE.md` |

---

## 1. Estado atual — evidências

### 1.1 Não existe uma única regra responsiva

```bash
grep -rn "@media" src/
# → 0 resultados

grep -rn "ResizeObserver\|matchMedia\|pointerdown\|touchstart" src/
# → 0 resultados
```

O app não é apenas "pouco responsivo": ele não tem **nenhum** mecanismo de
adaptação. `src/styles.scss` fecha a porta explicitamente:

```scss
/* src/styles.scss */
body, html { height: 100%; width: 100%; overflow: hidden; }
.app-shell { height: 100vh; width: 100vw; display: flex; }
```

`overflow: hidden` no `body` significa que qualquer conteúdo que não caiba é
descartado sem rolagem. `100vh` no `.app-shell` é o valor que quebra em
navegadores móveis, onde a barra de endereços entra e sai do cálculo.

A estrutura é três painéis fixos lado a lado — barra lateral
(`app.html`), toolbar de 64 px de altura fixa
(`features/visualizer/visualizer.component.ts`, regra `.contextual-toolbar`) e
painel direito com explicação e código. Em 360 px isso não reflui: transborda.

### 1.2 O estado da visualização não é endereçável

`app.routes.ts` tem duas rotas, e ambas carregam o **mesmo** componente:

```ts
// src/app/app.routes.ts
{ path: 'algorithms',      loadComponent: () => …VisualizerComponent, data: { category: 'algorithm' } },
{ path: 'data-structures', loadComponent: () => …VisualizerComponent, data: { category: 'data-structure' } },
{ path: '', redirectTo: 'algorithms', pathMatch: 'full' }
```

Qual algoritmo está sendo visto é estado interno do componente, escolhido por um
`app-custom-select` na toolbar (`visualizer.component.ts:80-85`). Um professor
não consegue mandar link de um algoritmo específico para a turma, e o Google não
tem o que indexar além de duas páginas genéricas.

### 1.3 Não há SSR nem prerender

```bash
grep -n '"server"\|prerender\|"ssr"\|outputMode' angular.json
# → 0 resultados

grep -rn "provideClientHydration" src/
# → 0 resultados
```

`app.config.ts` tem apenas `provideBrowserGlobalErrorListeners()` e
`provideRouter(routes)`. O arquivo `dist/big-o-viz/prerendered-routes.json` é
resíduo de build antigo e **não** corresponde a configuração presente.

Nota lateral verificada: não há `provideZoneChangeDetection` nem `zone.js`
(`grep -rn "provideZoneChangeDetection\|zone.js" src/ package.json` → 0
resultados). O app **já é *zoneless***, o que combina bem com a Web Animations
API do outro relatório — nada de `NgZone` para escapar.

### 1.4 ⚠️ Defeito encontrado: o select customizado é inacessível

```bash
grep -n 'role=\|aria-\|tabindex\|keydown' src/app/shared/components/custom-select/custom-select.component.ts
# → 0 resultados
```

O componente é construído com `<div>` e `(click)`:

```html
<!-- shared/components/custom-select/custom-select.component.ts:12-14 -->
<div class="select-container" (click)="toggleOpen($event)">
  <div class="selected-value">
    <span>{{ selectedOption()?.label || placeholder() }}</span>
```

Não é focável por `Tab`, não responde a `Enter`, `Espaço` ou setas, não anuncia
estado de expansão e não tem `role="listbox"`. É o controle **principal** de
navegação entre algoritmos — um aluno que usa teclado não consegue trocar de
algoritmo. Isso reprova em AXE e viola WCAG 2.1.1 (Teclado). Não foi causado
pelo pedido atual, mas é reescrito de qualquer forma.

### 1.5 ⚠️ Ícones apontam para URLs efêmeras do Figma

Vinte ocorrências de `https://www.figma.com/api/mcp/asset/…` em seis
componentes:

| Arquivo | Ocorrências |
|---|---|
| `features/visualizer/components/control-panel/control-panel.component.ts` | `:11,16,18,23,51` |
| `shared/components/side-nav-bar/side-nav-bar.component.ts` | `:35,45,52,56` |
| `features/visualizer/components/explanation-panel/explanation-panel.component.ts` | `:11,35,41,48` |
| `features/visualizer/visualizer.component.ts` | `:98,99` |
| `features/visualizer/components/code-panel/code-panel.component.ts` | `:15` |
| `shared/components/custom-select/custom-select.component.ts` | `:15` |

São endpoints de sessão do servidor MCP do Figma, não CDN. Em produção
retornam erro e a interface fica sem ícone algum. Vários deles também têm texto
alternativo inútil — `alt="V"` no select (`:15`), `alt=""` nos botões de
operação da lista (`visualizer.component.ts:108-111`), onde o botão inteiro
depende do ícone para ser compreendido.

### 1.6 A paleta: o que realmente falha AA

A auditoria foi **medida**, não estimada — razões de contraste calculadas pela
fórmula WCAG 2.x sobre os valores de `src/styles/_variables.scss`:

| Par | Razão | Veredito |
|---|---|---|
| `$text-main` `#d8e3fb` sobre `$bg-main` `#081425` | 14,34:1 | ✅ Passa AA |
| `$secondary` `#c0c1ff` sobre `$bg-main` | 10,83:1 | ✅ Passa AA |
| `$accent-warning` `#ffb95f` sobre `$bg-main` | 10,87:1 | ✅ Passa AA |
| `$accent-success` `#4edea3` sobre `$bg-main` | 10,82:1 | ✅ Passa AA |
| `$text-muted` `#94a3b8` sobre `$bg-card` `#152031` | 6,38:1 | ✅ Passa AA |
| `$text-muted` sobre `$bg-card-alt` `#1f2a3c` | 5,63:1 | ✅ Passa AA |
| `$primary` `#6366f1` sobre `$bg-main` | 4,13:1 | ⚠️ Só AA-large — reprova em texto normal |
| `$text-dim` `#464554` sobre `$bg-main` | 1,97:1 | ❌ Falha AA |
| `$border-color` `#464554` sobre `$bg-card` | 1,75:1 | ❌ Falha WCAG 1.4.11 (mínimo 3:1 para componente de interface) |

**Correção de registro:** durante a entrevista de desenho foi afirmado que
`$text-muted` sobre `$bg-card` estaria "no limite de 4,5:1". A medição mostra
6,38:1 — a afirmação estava errada e a decisão de auditar a paleta foi tomada
com essa premissa incorreta. A decisão continua válida, por outro motivo: as
três últimas linhas da tabela falham de verdade, e `$border-color` é o pior
caso porque delimita **todos** os cartões e campos da interface.

---

## 2. As seis decisões de design

### 2.1 O layout é recalculado em pixels reais, não escalado por `viewBox`

O renderizador SVG recebe a largura real disponível e a repassa à função pura de
layout (contrato em `MODELO-ANIMACAO-DIDATICA.md`, decisão 2.5).

| Opção | O que é | Custo | Veredito |
|---|---|---|---|
| Layout em px reais | A função dimensiona conforme o espaço; rótulos mantêm ~14 px | Cada família precisa de regra de degradação | **Recomendada** |
| `viewBox` escala tudo | Desenho em resolução fixa, encolhido proporcionalmente | Em 360 px um array de 12 vira texto de ~5 px, **ilegível** | Rejeitada: destrói o valor didático justamente no dispositivo mais usado |
| Faixas de breakpoint | Escala proporcional dentro de faixas | Saltos visíveis nas fronteiras | Rejeitada: complexidade sem ganho sobre a primeira |

Regra de degradação da família linear, em ordem: reduzir largura da barra até um
piso → ocultar o rótulo numérico sob a barra → quebrar em múltiplas linhas.
Nunca encolher a fonte abaixo do piso legível.

A largura chega por `ResizeObserver` sobre o contêiner, não por `window.resize`:
o painel muda de tamanho quando uma gaveta abre, sem a janela mudar.

### 2.2 Celular é modo consulta, não paridade

Em 360 px: animação em tela cheia, controles de reprodução fixos na base com
alvo de toque ≥ 44 px, explicação e código em gavetas deslizantes. A edição
livre de dados fica disponível, com teclado numérico (`inputmode="numeric"`),
mas os presets são o caminho primário.

Três painéis simultâneos em 360 px são três painéis inúteis. O canvas didático
precisa de área — essa é a restrição física que decide o layout, não uma
preferência estética.

### 2.3 Rota por algoritmo, com preset e passo na URL

```
/ordenacao/quick-sort?dados=invertido&passo=42
/estruturas/arvore-binaria-de-busca?dados=aleatorio
```

O professor manda o link já no passo exato que quer discutir. É viável porque
os presets são nomeados e serializáveis, e porque o motor expõe `irParaPasso`.

`passo` é restaurado **sem** animar a sequência inteira: o motor salta pelo
checkpoint mais próximo. Sem isso, abrir um link no passo 400 rodaria 400
transições antes de mostrar qualquer coisa.

### 2.4 Prerender estático por rota

Cada rota de algoritmo vira HTML estático com `<title>`, `meta description` e o
texto didático completo já no documento. A hospedagem continua estática — sem
servidor Node — e a animação hidrata no cliente.

| Opção | O que é | Custo | Veredito |
|---|---|---|---|
| Prerender estático | `outputMode: 'static'` + rotas conhecidas em build | Build mais lento; conteúdo precisa ser estático | **Recomendada** |
| SPA pura | Como hoje | O site só é achado por quem já tem o link | Rejeitada: contradiz "ponte de aprendizado" |
| SSR completo | Servidor Node renderizando sob demanda | Infra e custo sem conteúdo dinâmico que a justifique | Rejeitada por ora |

O texto didático precisa estar no HTML servido, não injetado por JavaScript —
é o que o indexador lê e o que aparece no resultado de busca.

### 2.5 Tokens CSS com dois temas, contraste verificado

Migrar de variáveis SCSS (`_variables.scss`, resolvidas em build) para
*custom properties* CSS, que trocam em runtime:

```css
:root { --superficie: …; --texto: …; --borda: …; }
@media (prefers-color-scheme: dark) { :root:not([data-tema="claro"]) { … } }
:root[data-tema="escuro"] { … }
```

Tema segue o sistema por padrão, com alternador manual que vence nos dois
sentidos. Importa aqui de verdade: aluno estudando de dia, sala de aula com
projetor, celular no sol.

Os três pares reprovados em 1.6 são corrigidos na origem. `$border-color` sobe
para ≥ 3:1 contra **todas** as superfícies onde é usado, não só contra
`$bg-main` — é o erro fácil de cometer numa paleta com quatro fundos diferentes.

### 2.6 Acessibilidade é estrutural, não uma camada

- Cada elemento da estrutura é um nó SVG com `role="img"` e `aria-label`
  descrevendo valor e papel corrente.
- A narração de cada passo vai para uma região `aria-live="polite"` única, fora
  do SVG. Uma só região no app — múltiplas competem e o leitor de tela atropela.
- Controles de reprodução são `<button>` reais, com `aria-keyshortcuts` e
  atalhos: espaço para reproduzir/pausar, setas para passo a passo.
- O select de algoritmo é reconstruído como `<select>` nativo ou combobox com
  padrão ARIA completo. O `<div>` clicável de 1.4 não volta.
- `prefers-reduced-motion` zera a duração da transição sem suprimir a narração.

### 2.7 O que não fazer

- **Não usar `100vh`.** Usar `100dvh` com fallback — `100vh` quebra em móvel
  quando a barra de endereços recolhe.
- **Não manter `overflow: hidden` no `body`.** Ele existe hoje para esconder o
  transbordo de 1.1; some junto com a causa.
- **Não reintroduzir `<img>` remoto para ícones.** Ícones SVG inline, no bundle.
- **Não criar mais de uma região `aria-live`.**
- **Não usar `NgOptimizedImage` para os ícones.** `.claude/CLAUDE.md` manda usá-la
  para imagens estáticas, mas ícones de interface devem ser SVG inline — a
  diretiva não se aplica e forçá-la aqui seria seguir a regra contra o motivo dela.

---

## 3. Plano de implementação

| Fase | Conteúdo | Esforço [modelado] |
|---|---|---|
| **G0** | Tokens CSS nos dois temas, com os três pares reprovados corrigidos; alternador de tema | 1–1,5 d |
| **G1** | Shell responsivo: `100dvh`, remoção de `overflow: hidden`, gavetas em 360 px, navegação lateral em desktop | 2–3 d |
| **G2** | Rotas por algoritmo + `?dados=` e `?passo=`; catálogo de algoritmos como fonte das rotas | 1–1,5 d |
| **G3** | Home catálogo agrupada por família — a página que o buscador indexa | 1–1,5 d |
| **G4** | Prerender: `outputMode: 'static'`, `provideClientHydration`, títulos e meta por rota | 1 d |
| **G5** | Acessibilidade: região `aria-live`, combobox acessível, atalhos, `ResizeObserver` no contêiner | 1,5–2 d |
| **G6** | AXE em CI sobre cada rota prerenderizada | 0,5–1 d |

**Mínimo viável** (utilizável em celular e desktop, sem SEO): G0 + G1 + G5 ≈ 4,5–6,5 d.
**Escopo completo:** G0–G6 ≈ 8,5–11,5 d.

A ordem importa em dois pontos. G2 **antes** de G3 e G4: o catálogo é a fonte
das rotas, e o prerender precisa da lista de rotas para existir. E G0 **antes**
de tudo: cada componente escrito antes dos tokens carrega cor codificada que
depois precisa ser caçada.

---

## 4. Armadilhas

| Armadilha | Mitigação |
|---|---|
| Prerender executa o código no Node, onde `window`, `document` e `ResizeObserver` não existem. O renderizador SVG toca nos três. | Renderizar no servidor apenas o texto didático e o esqueleto; a visualização monta após hidratação, com estado inicial vindo da URL. |
| Web Animations API não existe no Node. Se o motor iniciar no prerender, o build quebra. | O relógio de animação só é instanciado depois de `afterNextRender`. |
| `100dvh` não é suportado em navegadores antigos e degrada para altura zero se usado sem fallback. | `height: 100vh; height: 100dvh;` na ordem — a segunda declaração é ignorada por quem não entende. |
| `ResizeObserver` disparado pela própria mudança que ele causa gera laço infinito (redimensiona → relayout → redimensiona). | O layout escreve apenas dentro do SVG, nunca no contêiner observado. |
| Restaurar `?passo=42` animando 42 transições deixa a página travada por dezenas de segundos. | Salto por checkpoint, sem animação, no carregamento inicial. Ver decisão 2.3. |
| AXE em CI passa numa página estática e ainda assim o teclado não funciona — ele não navega a interface. | Complementar com teste de foco: percorrer a ordem de tabulação e verificar que todo controle é alcançável e acionável. |
| Alternador de tema que grava preferência lê `localStorage` durante o prerender e quebra. | Ler a preferência apenas no cliente; o HTML servido nasce no tema do sistema. |

---

## 5. Verificação

**Automatizável em CI (`ng test`):**

- [ ] Todo par de token texto-sobre-superfície, nos dois temas, atinge ≥ 4,5:1;
      todo par de borda atinge ≥ 3:1. O teste calcula, não confia na paleta.
- [ ] O catálogo de algoritmos gera exatamente a lista de rotas que o prerender
      consome — falha se alguém adicionar algoritmo sem rota, ou vice-versa.
- [ ] Serialização de `?dados=` e `?passo=` faz ida e volta sem perda.
- [ ] Nenhum componente contém cor literal em hexadecimal — só tokens.
- [ ] Nenhum `<img>` com `src` remoto (guarda contra a regressão de 1.5).

**Automatizável em CI com navegador headless (G6):**

- [ ] AXE sem violação em cada rota prerenderizada, nos dois temas.
- [ ] Toda rota prerenderizada contém o texto didático no HTML servido, antes de
      qualquer JavaScript — é isso que o indexador lê.
- [ ] Ordem de tabulação alcança todos os controles de reprodução e o seletor
      de algoritmo, e cada um é acionável por teclado.

**Só em dispositivo real, declarado como não verificado até rodar:**

- [ ] Em 360 px de largura, um array de 12 elementos cabe com rótulos legíveis.
- [ ] Gavetas abrem e fecham sem que a animação perca o dimensionamento.
- [ ] Alvos de toque medem ≥ 44 px em telefone físico.
- [ ] Rotação de retrato para paisagem relayouta sem regerar a sequência.
- [ ] Leitor de tela móvel (TalkBack ou VoiceOver) anuncia os passos na ordem.

---

## 6. Riscos

1. **O prerender é a frente com maior chance de custar mais do que o estimado.**
   Toda dependência de `window` no caminho de renderização inicial vira erro de
   build, e eles aparecem um por vez. O risco é contido por G4 vir depois do
   shell estar estável, mas não é eliminado.
2. **AXE em CI vai reprovar coisas que o desenho visual quer.** Contraste de
   estado desabilitado, foco visível sobre superfície escura, e o próprio
   destaque de "comparando" no SVG. Quando isso acontecer, a exigência de AA
   vence — foi decidida explicitamente, e reabri-la caso a caso a esvazia.
3. **Tema claro não é a paleta escura invertida.** Sombras, brilhos e as cores
   de estado da animação (`ARRAY_STATE_COLORS` em
   `core/models/visualization-state.model.ts`) precisam de valores próprios no
   tema claro. Tratar como "inverter" produz um tema claro ruim.
4. **A regra de degradação em 360 px é decisão pedagógica.** Onde exatamente
   ocultar o rótulo não se decide no código — decide-se olhando a tela, e
   provavelmente muda depois do primeiro contato com alunos.

---

## 7. Arquivos tocados

| Arquivo | Mudança |
|---|---|
| `src/styles/tokens.css` | **novo** — custom properties, dois temas |
| `src/styles.scss` | reescrito — sai `overflow: hidden`, sai `100vh`, sai o `@import` de fonte remota |
| `src/styles/_variables.scss` | **apagado** ao fim de G0 |
| `src/app/app.routes.ts` | reescrito — rotas por algoritmo, derivadas do catálogo |
| `src/app/app.config.ts` | `provideClientHydration` + configuração de rotas para prerender |
| `angular.json` | `outputMode: 'static'`, `server`, `prerender` |
| `src/app/shell/` | **novo** — shell responsivo, gavetas, navegação |
| `src/app/shell/tema.service.ts` | **novo** — preferência de tema, só no cliente |
| `src/app/shell/narracao-viva.ts` | **novo** — a região `aria-live` única |
| `src/app/paginas/catalogo/` | **novo** — home indexável |
| `src/app/shared/components/custom-select/` | **apagado** ao fim de G5 — 134 linhas |
| `src/app/shared/components/side-nav-bar/` | **apagado** ao fim de G1 — 219 linhas |
| `src/app/features/visualizer/` | **apagado** ao fim de G1 — 1.358 linhas, 5 arquivos |
| `src/assets/icones/` | **novo** — SVG inline substituindo as 20 URLs do Figma |
| `.github/workflows/ci.yml` | **novo** — testes + AXE (G6) |

---

## 8. O que não foi verificado

- **Nada foi executado em dispositivo real.** As afirmações sobre 360 px vêm da
  aritmética de 1.1 (12 × 48 − 8 = 568 px contra 360 px disponíveis), não de um
  telefone.
- **`ng build` e `ng test` não foram rodados.** O tamanho do bundle, o tempo de
  build com prerender e a viabilidade do `outputMode: 'static'` neste projeto
  são todos não verificados.
- **As razões de contraste foram calculadas, não medidas em tela.** A fórmula
  WCAG 2.x foi aplicada aos hexadecimais de `_variables.scss`; nenhuma
  ferramenta de auditoria rodou sobre a interface renderizada, e AXE nunca foi
  executado neste projeto.
- **Só o `custom-select` foi auditado quanto a teclado.** Os demais componentes
  interativos — `control-panel`, `side-nav-bar`, `code-panel` — não foram
  examinados individualmente, porque todos serão reescritos.
- **A hipótese de que a paleta atual estaria amplamente reprovada em AA está
  refutada** e fica registrada para não voltar: seis dos nove pares medidos
  passam. O problema é concentrado em `$text-dim`, `$border-color` e `$primary`
  como texto normal.

---

> Nenhum item deste relatório foi executado em navegador ou dispositivo móvel. O
> projeto não é um repositório git (`git status` → `fatal: not a git
> repository`), então não há commit a citar; a análise vem da leitura de `src/`
> e `angular.json` em 28/08/2026, das buscas com resultado zero reproduzidas na
> seção 1, e do cálculo de contraste sobre `src/styles/_variables.scss`. A
> validação está listada na seção 5 como pendente.
