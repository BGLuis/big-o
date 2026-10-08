# Migração do legado — o que morre, em que ordem, e como o novo se protege

| Campo | Valor |
|-------|-------|
| **Status** | ❌ Não iniciado — nada foi apagado |
| **Cobertura** | 3.148 linhas de TypeScript em 26 arquivos, das quais ~100% são descartadas |
| **Esforço [modelado]** | 2–3 dias-dev próprios; o restante é o sequenciamento dos outros dois relatórios |
| **Depende de** | Nada para começar; a exclusão em si acontece dentro das fases dos outros dois |
| **⚠️ Atenção** | O projeto **não** é um repositório git. A exclusão é irreversível |

---

## 1. Estado atual — evidências

### 1.1 Não existe histórico

```bash
git status
# → fatal: not a git repository (or any parent up to mount point /)
```

Foi recomendado rodar `git init` antes de qualquer exclusão. O usuário decidiu
o contrário, de forma explícita, e a decisão é registrada aqui — não para ser
reaberta, mas porque muda o perfil de risco de todas as fases: **não há
`git checkout` para desfazer engano nenhum**, e nenhuma fase abaixo pode ser
revertida parcialmente.

`.gitignore` existe e já cobre o que deveria (`/dist` na linha 4,
`/.angular/cache` na linha 32), o que só reforça que a ausência de repositório
é acidental, não intencional.

### 1.2 Inventário do que é descartado

| Caminho | Linhas | Arquivos | Por que morre |
|---|---|---|---|
| `src/app/visualization/` | 673 | 5 | PixiJS/WebGL; substrato trocado por SVG/DOM |
| `src/app/features/visualizer/` | 1.358 | 5 | Layout de três painéis fixos, sem `@media` |
| `src/app/core/algorithms/` | 518 | 5 | `Snapshot` completo por passo; vira gerador de deltas |
| `src/app/shared/components/` | 353 | 2 | `custom-select` inacessível; `side-nav-bar` não responsivo |
| `src/app/core/models/` | 97 | 4 | Tipos do modelo antigo (`Snapshot`, `ArrayState`, …) |
| `src/app/core/services/playback.service.ts` | 78 | 1 | Relógio por `setInterval`, dessincronizado da animação |
| `src/app/app.*.ts` | 71 | 4 | Shell, rotas e config do modelo antigo |
| `src/styles/_variables.scss` | 24 | 1 | Variáveis SCSS de build → *custom properties* de runtime |
| **Total TypeScript** | **3.148** | **26** | — |

### 1.3 O que é preservado — e apenas como dado

Dois ativos sobrevivem, extraídos como conteúdo, **nunca** como código:

**Os textos didáticos em português.** `core/algorithms/algorithms-list.ts` tem
76 linhas, das quais a maior parte é `AlgorithmExplanation` com descrições
escritas à mão. A de bubble sort (`:16`) e a de quick sort (`:33`) são boas e
custaram tempo. A de BST (`:50`) idem. A de linked list (`:67`) **está em
inglês** e precisa ser traduzida — é a evidência do problema de idioma
misturado.

**A paleta**, com as três correções que `FUNDACAO-APP-RESPONSIVA.md` seção 1.6
mediu como obrigatórias.

### 1.4 ⚠️ Defeito de processo: sete cópias do mesmo arquivo de instruções

```bash
for f in AGENTS.md .claude/CLAUDE.md .gemini/GEMINI.md \
         .github/copilot-instructions.md .junie/guidelines.md \
         .windsurf/rules/guidelines.md; do md5sum < "$f"; done
# → seis vezes o mesmo hash 13df50d9…
```

Seis arquivos byte a byte idênticos, com 56 linhas cada, mais
`.cursor/rules/cursor.mdc` com 61 linhas e conteúdo já divergente
(hash `3ea2329a…`). A divergência já começou.

Isso importa diretamente para este projeto porque o guia de autoria de
algoritmos — decidido como uma das três camadas de proteção do modelo — corre o
risco de virar a **oitava** cópia e divergir do mesmo jeito. Um documento que
contradiz o código é pior do que documento nenhum: ele é seguido.

### 1.5 Dependências externas em tempo de execução

```bash
grep -n "fonts.googleapis" src/styles.scss
# → 3:@import url('https://fonts.googleapis.com/css2?family=Inter…')
```

Além das 20 URLs de ícone do Figma (inventariadas em
`FUNDACAO-APP-RESPONSIVA.md` seção 1.5), as fontes vêm de CDN por `@import`
dentro do CSS — a forma mais lenta possível, porque só começa a baixar depois
que a folha de estilo é analisada. Para um site que será prerenderizado e
consultado por alunos em rede móvel, as fontes devem ser auto-hospedadas.

---

## 2. As quatro decisões de migração

### 2.1 Reescrita completa, não migração incremental

| Opção | O que é | Custo | Veredito |
|---|---|---|---|
| Apagar e reescrever | `src/app` inteiro sai; shell Angular 21 fica | Nenhum código reaproveitado | **Recomendada** |
| Refatorar no lugar | Corrigir substrato, modelo de passo, layout e a11y no código atual | As quatro premissas se sustentam mutuamente: trocar uma quebra as outras três. Na prática é reescrever com o custo extra de manter tudo funcionando durante | Rejeitada |
| Reescrever em paralelo | Novo app ao lado, troca no fim | Dois apps para manter, sem usuários hoje que justifiquem | Rejeitada: não há produção a proteger |

O que **fica**: `angular.json` (com acréscimos de prerender), `package.json`
menos `pixi.js`, os `tsconfig.*`, `public/`, `.editorconfig`, `.gitignore`.

### 2.2 A exclusão acontece dentro das fases, não antes delas

Apagar `src/app` inteiro no primeiro dia deixa o projeto sem compilar por uma
semana e sem nada para comparar. Cada caminho é apagado no fim da fase que o
substitui, conforme a coluna "Arquivos tocados" dos outros dois relatórios.

Ordem de exclusão, com a fase que a autoriza:

| Caminho | Apagado ao fim de | Relatório |
|---|---|---|
| `core/models/snapshot.model.ts` | F0 | Modelo de animação |
| `core/services/playback.service.ts` | F1 | Modelo de animação |
| `visualization/` · `core/algorithms/` | F4 | Modelo de animação |
| `styles/_variables.scss` | G0 | Fundação do app |
| `features/visualizer/` · `shared/components/side-nav-bar/` | G1 | Fundação do app |
| `shared/components/custom-select/` | G5 | Fundação do app |
| `pixi.js` do `package.json` | F4 | Modelo de animação |

**Antes da primeira exclusão**, extrair os textos didáticos de
`algorithms-list.ts` para `src/app/conteudo/`. É o único ativo insubstituível
do repositório, e a decisão de não usar git significa que perdê-lo é definitivo.

### 2.3 Conteúdo didático mora fora dos componentes

Português puro, sem `@angular/localize` — a camada de i18n é custo sem retorno
enquanto o público for brasileiro. Mas **nenhum** texto didático dentro de
template:

```
src/app/conteudo/
  quick-sort.ts          → título, descrição, complexidades, pseudocódigo, referências Python/C++/Java
  bst-insercao.ts
  _tipos.ts              → o formato que todo conteúdo obedece
```

Adicionar inglês depois passa a ser preencher um segundo arquivo, não refatorar
quarenta componentes. É o mesmo raciocínio da decisão de tokens: separar agora
custa quase nada, separar depois custa uma varredura.

O pseudocódigo canônico vive aqui, e é a **única** fonte da numeração de linha
que os eventos destacam. Python, C++ e Java entram como referência estática, sem
destaque sincronizado — três mapeamentos por evento quebrariam em silêncio a
cada edição de código.

### 2.4 Três camadas de proteção para quem escrever o próximo algoritmo

1. **Tipos.** União discriminada fecha o vocabulário; exaustividade verificada
   pelo compilador em todo `switch`. Um `tipo` novo quebra a compilação de todos
   os consumidores — que é o comportamento desejado.
2. **Teste de contrato reutilizável.** Uma função que qualquer algoritmo novo
   invoca no seu `.spec.ts`, verificando os invariantes de
   `MODELO-ANIMACAO-DIDATICA.md` seção 5: narração em todo evento, replay
   consistente com avanço, determinismo, estado final correto.
3. **Guia curto**, em `docs/AUTORIA-DE-ALGORITMOS.md` — **um** arquivo, com
   ponteiro a partir de `AGENTS.md`, nunca copiado para os outros seis. Ver 1.4.

A ordem importa: o teste de contrato é a camada que realmente segura, porque é a
única executada. O guia explica o porquê; os tipos impedem o erro grosseiro.

### 2.5 O que não fazer

- **Não apagar `src/app` de uma vez.** Ver 2.2.
- **Não extrair os textos didáticos depois de apagar.** Sem git, não há depois.
- **Não copiar o guia de autoria para `.claude/`, `.gemini/`, `.cursor/` etc.**
  Um arquivo, seis ponteiros.
- **Não manter `pixi.js` "por via das dúvidas".** Ele mascara importação
  esquecida e infla o bundle sem aviso.
- **Não portar `AlgorithmDef` como está.** `generateSteps: (data: number[]) => Snapshot[]`
  (`core/models/algorithm.model.ts`) codifica no tipo a premissa de que o passo é
  estado completo — exatamente o que muda.

---

## 3. Plano de implementação

O sequenciamento combina as fases dos outros dois relatórios. `F*` vem de
`MODELO-ANIMACAO-DIDATICA.md`, `G*` de `FUNDACAO-APP-RESPONSIVA.md`, `M*` é
próprio deste.

| Etapa | Conteúdo | Esforço [modelado] |
|---|---|---|
| **M0** | Extrair textos didáticos para `src/app/conteudo/`; traduzir o de linked list; remover `pixi.js`; auto-hospedar as fontes | 0,5–1 d |
| **G0** | Tokens CSS, dois temas, três pares de contraste corrigidos | 1–1,5 d |
| **F0 + F1** | Tipos de evento; motor com checkpoints e replay | 2,5–3,5 d |
| **F2** | Relógio WAAPI | 1,5–2 d |
| **F3** | Família linear + quick sort | 2–3 d |
| **G1** | Shell responsivo, gavetas em 360 px | 2–3 d |
| **F4** | Família hierárquica + inserção em BST | 2–3 d |
| **G2 + G3** | Rotas por algoritmo, catálogo | 2–3 d |
| **F5** | Medição do modo performance | 0,5–1 d |
| **G4** | Prerender estático | 1 d |
| **F6 + M1** | Teste de contrato, guia de autoria, ponteiro em `AGENTS.md` | 1,5–2 d |
| **G5 + G6** | Acessibilidade final e AXE em CI | 2–3 d |

**Mínimo viável** — uma visualização acessível e responsiva, sem SEO nem segunda
família: M0 + G0 + F0 + F1 + F2 + F3 + G1 ≈ 9,5–14 d.
**Escopo completo:** ≈ 18,5–26 d.

Três pontos onde a ordem não é negociável. **M0 primeiro**, porque é a extração
do único ativo insubstituível e não há git. **F2 antes de F3**, senão o
renderizador nasce com laço de animação próprio e reproduz o defeito que a
reescrita existe para eliminar. **F3 antes de G1**, porque o shell responsivo só
é testável quando existe algo dentro dele que responda à largura.

---

## 4. Armadilhas

| Armadilha | Mitigação |
|---|---|
| Sem git, um `rm -rf` errado é o fim do projeto. | Antes de cada exclusão da tabela de 2.2, copiar o caminho para fora do repositório. É a substituição pobre do que `git` faria de graça — e foi a escolha feita. |
| Os textos didáticos estão embutidos num arquivo que também define `generateSteps` (`algorithms-list.ts`). Apagar o arquivo leva os textos junto. | M0 extrai antes de qualquer coisa. É a primeira etapa por esse motivo. |
| Remover `pixi.js` do `package.json` sem remover as importações quebra o build de forma confusa. | Remover a dependência **depois** de F4, quando `visualization/` já não existe. |
| O guia de autoria vira a oitava cópia divergente do arquivo de instruções. | Um arquivo em `docs/`, referenciado por linha única em `AGENTS.md`. Nunca copiado. |
| `dist/` tem 936 kB de build antigo, incluindo `prerendered-routes.json` que sugere configuração que não existe. | Apagar `dist/` em M0. Já está no `.gitignore` linha 4, para quando houver git. |
| A tradução do texto de linked list é fácil de esquecer, porque o algoritmo não está entre as duas referências. | Traduzir em M0, junto da extração, mesmo que a lista encadeada só seja implementada depois. |
| O `.cursor/rules/cursor.mdc` já divergiu dos outros seis. Decisões desta reescrita registradas só ali ficam invisíveis. | Nenhuma decisão de arquitetura mora em arquivo de instrução de ferramenta. Moram nestes três relatórios. |

---

## 5. Verificação

**Automatizável em CI (`ng test`):**

- [ ] Nenhum `import` de `pixi.js` resta no código — o teste falha se alguém
      reintroduzir a dependência.
- [ ] Todo conteúdo em `src/app/conteudo/` satisfaz o tipo comum: título,
      descrição, três complexidades, pseudocódigo e ao menos uma referência de
      linguagem, todos não vazios.
- [ ] Nenhum texto didático aparece literal em template de componente.
- [ ] Todo algoritmo registrado no catálogo tem entrada de conteúdo
      correspondente, e vice-versa.
- [ ] Todo conteúdo está em português — verificação frouxa, mas suficiente para
      pegar o caso do linked list, que hoje está em inglês.

**Manual, declarado como não verificado até ser feito:**

- [ ] Os textos didáticos foram copiados para fora do repositório antes da
      primeira exclusão.
- [ ] `AGENTS.md` aponta para `docs/AUTORIA-DE-ALGORITMOS.md`, e o guia não foi
      copiado para nenhum dos outros seis arquivos de instrução.
- [ ] Um algoritmo novo, escrito por alguém que não participou desta conversa,
      passa no teste de contrato sem ajuda. **É o único teste real do modelo** —
      e é o que decide se estes relatórios valeram alguma coisa.

---

## 6. Riscos

1. **A ausência de git é o maior risco do projeto, e é estrutural.** Ele não
   afeta uma fase: afeta todas, o tempo todo, e cresce conforme mais código novo
   se acumula sem histórico. A cópia manual da armadilha 1 mitiga a exclusão do
   legado, mas não protege o código novo contra nada.
2. **~18,5–26 dias-dev é um intervalo largo porque nenhum número foi medido.**
   Todos os esforços são `[modelado]`, derivados do inventário de linhas e da
   quantidade de decisões, não de execução. Tratá-los como cronograma seria erro.
3. **A reescrita pode terminar com menos funcionalidade visível do que hoje.**
   O app atual tem quatro algoritmos; a entrega tem dois. Isso é deliberado — os
   dois são as referências que provam o contrato — mas se a métrica de sucesso
   for "quantos algoritmos aparecem na tela", a reescrita parecerá um retrocesso
   até que o terceiro e o quarto sejam adicionados, o que só então será barato.
4. **O guia de autoria é a camada mais frágil das três.** Documento não executa.
   Se ele divergir, o teste de contrato ainda segura os invariantes, mas a
   explicação do porquê se perde — e é o porquê que faz alguém escrever um
   evento com boa granularidade em vez de um evento correto e inútil.

---

## 7. Arquivos tocados

| Arquivo | Mudança |
|---|---|
| `src/app/conteudo/_tipos.ts` | **novo** — formato do conteúdo didático (M0) |
| `src/app/conteudo/quick-sort.ts` | **novo** — texto extraído de `algorithms-list.ts:16-30` |
| `src/app/conteudo/bst-insercao.ts` | **novo** — texto extraído de `:50-64` |
| `src/app/conteudo/lista-encadeada.ts` | **novo** — extraído de `:67-79` e **traduzido** |
| `src/app/conteudo/bubble-sort.ts` | **novo** — texto extraído de `:16-30`, guardado para uso posterior |
| `docs/AUTORIA-DE-ALGORITMOS.md` | **novo** — guia curto (M1) |
| `AGENTS.md` | uma linha apontando para o guia; sem cópia do conteúdo |
| `package.json` | remove `pixi.js` (**apagado** ao fim de F4) |
| `src/assets/fontes/` | **novo** — Inter e JetBrains Mono auto-hospedadas |
| `src/styles.scss` | remove o `@import` de `fonts.googleapis.com` (linha 3) |
| `dist/` | **apagado** em M0 — 936 kB de build obsoleto |
| `src/app/` | **apagado** por partes, conforme a tabela de 2.2 — 3.148 linhas, 26 arquivos |

---

## 8. O que não foi verificado

- **Nenhum esforço foi medido.** Os ~18,5–26 dias-dev, e cada linha da tabela de
  fases, são `[modelado]` a partir da contagem de linhas e do número de decisões.
  Nenhuma fase foi executada nem cronometrada.
- **Não foi verificado se `pixi.js` é a única dependência a remover.** A
  varredura foi feita sobre `package.json`; não foi feita análise de dependências
  transitivas nem verificação de qual parte dos 369 MB de `node_modules` é
  realmente usada.
- **Não foi verificado se os textos didáticos estão corretos.** Foram lidos e
  julgados como bem escritos; a exatidão técnica das descrições de complexidade
  não foi conferida contra a literatura.
- **`ng build` e `ng test` não foram executados** em momento algum desta análise,
  nem antes nem depois. Não há prova de que o projeto compile no estado atual.
- **A hipótese de que parte do legado poderia ser aproveitada está refutada** e
  fica registrada para não voltar: o inventário de 1.2 percorreu os 26 arquivos,
  e cada um depende de pelo menos uma das quatro premissas invertidas —
  substrato canvas, passo como estado completo, layout em constante fixa, ou
  relógio independente da animação.

---

> Nenhum item deste relatório foi executado. O projeto não é um repositório git
> (`git status` → `fatal: not a git repository`), e por decisão explícita do
> usuário permanecerá assim durante a reescrita; não há commit a citar. A
> análise vem do inventário de `src/app` e da raiz do projeto em 28/08/2026. A
> validação está listada na seção 5 como pendente, e a etapa M0 — a única que
> protege conteúdo insubstituível — ainda não foi realizada.
