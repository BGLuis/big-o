import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal
} from '@angular/core';
import {
  DatasetPresetId,
  SandboxOperationInput,
  SandboxPreset,
  SandboxStructureType,
  TreeTraversalOrder
} from '../../sandbox.types';
import { SANDBOX_PRESETS } from '../../sandbox-presets.data';

@Component({
  selector: 'app-operation-toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav
      class="operation-toolbar bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-4 text-slate-100"
      aria-label="Barra de Operações do Sandbox"
    >
      <!-- LINHA 1: CONTROLES ESPECÍFICOS DA ESTRUTURA SELECIONADA -->
      <div class="flex flex-wrap items-center gap-3">
        @switch (structureType()) {
          @case ('bst') {
            <!-- ÁRVORE BST -->
            <div class="flex flex-wrap items-center gap-2">
              <label for="tree-val-input" class="text-xs font-semibold text-slate-300">Valor:</label>
              <input
                id="tree-val-input"
                type="number"
                [value]="numericValue()"
                [disabled]="disabled()"
                (input)="onNumericInput($event)"
                class="w-20 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
                aria-label="Valor numérico para operação na árvore"
              />

              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerTreeInsert()"
                class="btn-primary"
                aria-label="Inserir valor na árvore"
              >
                + Inserir
              </button>
              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerTreeSearch()"
                class="btn-secondary"
                aria-label="Pesquisar valor na árvore"
              >
                🔍 Pesquisar
              </button>
              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerTreeDelete()"
                class="btn-danger"
                aria-label="Excluir valor da árvore"
              >
                ✕ Excluir
              </button>

              <div class="h-6 w-px bg-slate-700 mx-1 hidden sm:block" aria-hidden="true"></div>

              <!-- Rotações Manuais com badge de nó selecionado -->
              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerRotateLeft()"
                class="btn-rotate"
                aria-label="Rotacionar à esquerda"
                [title]="selectedNode() ? 'Rotacionar à esquerda nó ' + selectedNode()!.value : 'Rotacionar à esquerda raiz/valor'"
              >
                Rotacionar Esq ↺
              </button>
              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerRotateRight()"
                class="btn-rotate"
                aria-label="Rotacionar à direita"
                [title]="selectedNode() ? 'Rotacionar à direita nó ' + selectedNode()!.value : 'Rotacionar à direita raiz/valor'"
              >
                Rotacionar Dir ↻
              </button>

              @if (selectedNode(); as sel) {
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-amber-400/10 text-amber-300 border border-amber-400/30">
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                  Nó Alvo: {{ sel.value }}
                </span>
              }

              <div class="h-6 w-px bg-slate-700 mx-1 hidden sm:block" aria-hidden="true"></div>

              <!-- Travessias -->
              <div class="flex items-center gap-1">
                <span class="text-xs text-slate-400 mr-1 hidden md:inline">Travessia:</span>
                <button type="button" [disabled]="disabled()" (click)="triggerTraverse('in-order')" class="btn-traversal" title="Em-Ordem (In-Order: Esq, Raiz, Dir)">
                  Em-Ordem
                </button>
                <button type="button" [disabled]="disabled()" (click)="triggerTraverse('pre-order')" class="btn-traversal" title="Pré-Ordem (Pre-Order: Raiz, Esq, Dir)">
                  Pré-Ordem
                </button>
                <button type="button" [disabled]="disabled()" (click)="triggerTraverse('post-order')" class="btn-traversal" title="Pós-Ordem (Post-Order: Esq, Dir, Raiz)">
                  Pós-Ordem
                </button>
                <button type="button" [disabled]="disabled()" (click)="triggerTraverse('bfs')" class="btn-traversal" title="Em-Largura (BFS por Nível)">
                  BFS
                </button>
              </div>
            </div>
          }

          @case ('avl-tree') {
            <!-- ÁRVORE AVL -->
            <div class="flex flex-wrap items-center gap-2">
              <label for="avl-val-input" class="text-xs font-semibold text-slate-300">Valor:</label>
              <input
                id="avl-val-input"
                type="number"
                [value]="numericValue()"
                [disabled]="disabled()"
                (input)="onNumericInput($event)"
                class="w-20 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50"
                aria-label="Valor numérico para operação na AVL"
              />

              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerTreeInsert()"
                class="btn-primary"
                aria-label="Inserir valor na árvore AVL"
              >
                + Inserir
              </button>
              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerTreeSearch()"
                class="btn-secondary"
                aria-label="Pesquisar valor na árvore AVL"
              >
                🔍 Pesquisar
              </button>
              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerTreeDelete()"
                class="btn-danger"
                aria-label="Excluir valor da árvore AVL"
              >
                ✕ Excluir
              </button>

              <div class="h-6 w-px bg-slate-700 mx-1 hidden sm:block" aria-hidden="true"></div>

              <!-- Rotações AVL -->
              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerRotateLeft()"
                class="btn-rotate"
                aria-label="Rotacionar à esquerda nó na AVL"
              >
                Rotacionar Esq ↺
              </button>
              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerRotateRight()"
                class="btn-rotate"
                aria-label="Rotacionar à direita nó na AVL"
              >
                Rotacionar Dir ↻
              </button>

              @if (selectedNode(); as sel) {
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-400/10 text-emerald-300 border border-emerald-400/30">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Nó Alvo: {{ sel.value }}
                </span>
              }

              <div class="h-6 w-px bg-slate-700 mx-1 hidden sm:block" aria-hidden="true"></div>

              <!-- Travessias -->
              <div class="flex items-center gap-1">
                <button type="button" [disabled]="disabled()" (click)="triggerTraverse('in-order')" class="btn-traversal" title="Em-Ordem">
                  Em-Ordem
                </button>
                <button type="button" [disabled]="disabled()" (click)="triggerTraverse('pre-order')" class="btn-traversal" title="Pré-Ordem">
                  Pré-Ordem
                </button>
                <button type="button" [disabled]="disabled()" (click)="triggerTraverse('post-order')" class="btn-traversal" title="Pós-Ordem">
                  Pós-Ordem
                </button>
                <button type="button" [disabled]="disabled()" (click)="triggerTraverse('bfs')" class="btn-traversal" title="Em-Largura (BFS)">
                  BFS
                </button>
              </div>
            </div>
          }

          @case ('red-black-tree') {
            <!-- ÁRVORE RUBRO-NEGRA -->
            <div class="flex flex-wrap items-center gap-2">
              <label for="rb-val-input" class="text-xs font-semibold text-slate-300">Valor:</label>
              <input
                id="rb-val-input"
                type="number"
                [value]="numericValue()"
                [disabled]="disabled()"
                (input)="onNumericInput($event)"
                class="w-20 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-rose-400 disabled:opacity-50"
                aria-label="Valor numérico para árvore Rubro-Negra"
              />

              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerTreeInsert()"
                class="btn-primary"
                aria-label="Inserir valor na árvore Rubro-Negra"
              >
                + Inserir
              </button>
              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerTreeSearch()"
                class="btn-secondary"
                aria-label="Pesquisar valor na árvore Rubro-Negra"
              >
                🔍 Pesquisar
              </button>
              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerTreeDelete()"
                class="btn-danger"
                aria-label="Excluir valor da árvore Rubro-Negra"
              >
                ✕ Excluir
              </button>

              <div class="h-6 w-px bg-slate-700 mx-1 hidden sm:block" aria-hidden="true"></div>

              <!-- Rotações Rubro-Negra -->
              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerRotateLeft()"
                class="btn-rotate"
                aria-label="Rotacionar à esquerda"
              >
                Rotacionar Esq ↺
              </button>
              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerRotateRight()"
                class="btn-rotate"
                aria-label="Rotacionar à direita"
              >
                Rotacionar Dir ↻
              </button>

              @if (selectedNode(); as sel) {
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-rose-400/10 text-rose-300 border border-rose-400/30">
                  <span class="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                  Nó Alvo: {{ sel.value }}
                </span>
              }

              <div class="h-6 w-px bg-slate-700 mx-1 hidden sm:block" aria-hidden="true"></div>

              <!-- Travessias -->
              <div class="flex items-center gap-1">
                <button type="button" [disabled]="disabled()" (click)="triggerTraverse('in-order')" class="btn-traversal" title="Em-Ordem">
                  Em-Ordem
                </button>
                <button type="button" [disabled]="disabled()" (click)="triggerTraverse('pre-order')" class="btn-traversal" title="Pré-Ordem">
                  Pré-Ordem
                </button>
                <button type="button" [disabled]="disabled()" (click)="triggerTraverse('post-order')" class="btn-traversal" title="Pós-Ordem">
                  Pós-Ordem
                </button>
                <button type="button" [disabled]="disabled()" (click)="triggerTraverse('bfs')" class="btn-traversal" title="Em-Largura (BFS)">
                  BFS
                </button>
              </div>
            </div>
          }

          @case ('array') {
            <!-- ARRAY -->
            <div class="flex flex-wrap items-center gap-2">
              <label for="arr-val-input" class="text-xs font-semibold text-slate-300">Valor:</label>
              <input
                id="arr-val-input"
                type="number"
                [value]="numericValue()"
                [disabled]="disabled()"
                (input)="onNumericInput($event)"
                class="w-20 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50"
                aria-label="Valor numérico para o Array"
              />

              <label for="arr-idx-input" class="text-xs font-semibold text-slate-300 ml-1">Índice:</label>
              <input
                id="arr-idx-input"
                type="number"
                min="0"
                [value]="indexValue()"
                [disabled]="disabled()"
                (input)="onIndexInput($event)"
                class="w-16 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50"
                aria-label="Índice para inserção no Array"
              />

              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerArrayInsertEnd()"
                class="btn-primary"
                title="Inserir elemento no final do array em O(1)"
              >
                + Inserir no Fim
              </button>
              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerArrayInsertAt()"
                class="btn-secondary"
                title="Inserir elemento deslocando vizinhos em O(n)"
              >
                Inserir no Índice
              </button>
              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerArrayRemove()"
                class="btn-danger"
                title="Remover elemento do array"
              >
                ✕ Remover Valor
              </button>

              <div class="h-6 w-px bg-slate-700 mx-1 hidden sm:block" aria-hidden="true"></div>

              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerArrayLinearSearch()"
                class="btn-action"
                title="Busca sequencial percorrendo todo o array O(n)"
              >
                Busca Linear O(n)
              </button>
              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerArrayBinarySearch()"
                class="btn-action"
                title="Busca binária em array ordenado com divisão e conquista O(log n)"
              >
                Busca Binária O(log n)
              </button>
            </div>
          }

          @case ('linked-list') {
            <!-- LISTA ENCADEADA -->
            <div class="flex flex-wrap items-center gap-2">
              <label for="ll-val-input" class="text-xs font-semibold text-slate-300">Valor:</label>
              <input
                id="ll-val-input"
                type="number"
                [value]="numericValue()"
                [disabled]="disabled()"
                (input)="onNumericInput($event)"
                class="w-20 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:opacity-50"
                aria-label="Valor numérico para a Lista Encadeada"
              />

              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerLinkedListInsertHead()"
                class="btn-primary"
                title="Inserir na cabeça da lista em tempo constante O(1)"
              >
                + Inserir Cabeça O(1)
              </button>
              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerLinkedListInsertTail()"
                class="btn-secondary"
                title="Percorrer até a cauda e inserir em tempo linear O(n)"
              >
                + Inserir Cauda O(n)
              </button>
              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerLinkedListSearch()"
                class="btn-action"
                title="Buscar nó percorrendo ponteiros O(n)"
              >
                🔍 Buscar
              </button>
              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerLinkedListDelete()"
                class="btn-danger"
                title="Remover nó da lista"
              >
                ✕ Remover
              </button>
            </div>
          }

          @case ('stack') {
            <!-- PILHA (LIFO) -->
            <div class="flex flex-wrap items-center gap-2">
              <label for="stack-val-input" class="text-xs font-semibold text-slate-300">Valor:</label>
              <input
                id="stack-val-input"
                type="number"
                [value]="numericValue()"
                [disabled]="disabled()"
                (input)="onNumericInput($event)"
                class="w-20 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50"
                aria-label="Valor para a Pilha"
              />

              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerStackPush()"
                class="btn-primary"
                title="Push: Empilhar elemento no topo em O(1)"
              >
                Push (Empilhar)
              </button>
              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerStackPop()"
                class="btn-danger"
                title="Pop: Desempilhar elemento do topo em O(1)"
              >
                Pop (Desempilhar)
              </button>
              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerStackPeek()"
                class="btn-action"
                title="Peek: Visualizar elemento do topo em O(1)"
              >
                Peek (Topo)
              </button>
            </div>
          }

          @case ('queue') {
            <!-- FILA (FIFO) -->
            <div class="flex flex-wrap items-center gap-2">
              <label for="queue-val-input" class="text-xs font-semibold text-slate-300">Valor:</label>
              <input
                id="queue-val-input"
                type="number"
                [value]="numericValue()"
                [disabled]="disabled()"
                (input)="onNumericInput($event)"
                class="w-20 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:opacity-50"
                aria-label="Valor para a Fila"
              />

              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerQueueEnqueue()"
                class="btn-primary"
                title="Enqueue: Adicionar elemento ao final da fila em O(1)"
              >
                Enqueue (Enfileirar)
              </button>
              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerQueueDequeue()"
                class="btn-danger"
                title="Dequeue: Remover elemento da frente da fila em O(1)"
              >
                Dequeue (Desenfileirar)
              </button>
              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerQueuePeek()"
                class="btn-action"
                title="Peek: Visualizar primeiro elemento da fila em O(1)"
              >
                Peek (Início)
              </button>
            </div>
          }

          @case ('hash-map') {
            <!-- TABELA HASH -->
            <div class="flex flex-wrap items-center gap-2">
              <label for="hm-key-input" class="text-xs font-semibold text-slate-300">Chave:</label>
              <input
                id="hm-key-input"
                type="number"
                [value]="numericValue()"
                [disabled]="disabled()"
                (input)="onNumericInput($event)"
                class="w-20 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
                aria-label="Chave numérica para a Tabela Hash"
              />

              <label for="hm-val-input" class="text-xs font-semibold text-slate-300 ml-1">Valor:</label>
              <input
                id="hm-val-input"
                type="text"
                [value]="textValue()"
                [disabled]="disabled()"
                (input)="onTextInput($event)"
                class="w-28 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
                aria-label="Conteúdo textual associado à chave"
              />

              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerHashMapPut()"
                class="btn-primary"
                title="Inserir par chave/valor com cálculo de hash e tratamento de colisão"
              >
                Inserir (Put)
              </button>
              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerHashMapGet()"
                class="btn-secondary"
                title="Buscar valor pela chave na Tabela Hash"
              >
                🔍 Buscar (Get)
              </button>
              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerHashMapDelete()"
                class="btn-danger"
                title="Remover par chave/valor da Tabela Hash"
              >
                ✕ Remover
              </button>
            </div>
          }

          @case ('graph') {
            <!-- GRAFO -->
            <div class="flex flex-wrap items-center gap-2">
              <label for="graph-vertex-select" class="text-xs font-semibold text-slate-300">Vértice Inicial:</label>
              <select
                id="graph-vertex-select"
                [value]="selectedVertex()"
                [disabled]="disabled()"
                (change)="onVertexSelect($event)"
                class="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-sm font-mono font-bold text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
                aria-label="Selecione o vértice inicial para travessia no grafo"
              >
                @for (v of graphVertices; track v) {
                  <option [value]="v">Vértice {{ v }}</option>
                }
              </select>

              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerGraphBfs()"
                class="btn-primary"
                title="Busca em Largura (BFS) com fila FIFO explorando em anéis concêntricos"
              >
                Executar BFS (Largura)
              </button>
              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerGraphDfs()"
                class="btn-secondary"
                title="Busca em Profundidade (DFS) com pilha LIFO explorando ramificações completas"
              >
                Executar DFS (Profundidade)
              </button>
            </div>
          }
        }
      </div>

      <!-- LINHA 2: PRESETS, LIMPAR, MODO DESAFIO E TOGGLE DE LOTE -->
      <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
        <!-- Presets Didáticos -->
        <div class="flex flex-wrap items-center gap-2">
          <label for="preset-select" class="text-xs font-semibold text-slate-400">Presets Didáticos:</label>
          <select
            id="preset-select"
            [value]="selectedPresetId()"
            [disabled]="disabled()"
            (change)="onPresetChange($event)"
            class="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
            aria-label="Selecione um preset didático"
          >
            @for (preset of presets; track preset.id) {
              <option [value]="preset.id">
                {{ preset.title }} ({{ preset.badge }})
              </option>
            }
          </select>
          <button
            type="button"
            [disabled]="disabled()"
            (click)="applyCurrentPreset()"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 active:bg-slate-650 text-slate-200 border border-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
            aria-label="Carregar preset selecionado"
          >
            Carregar
          </button>
        </div>

        <!-- Ações Globais -->
        <div class="flex flex-wrap items-center gap-3">
          <!-- Toggle Modo Desafio -->
          <button
            type="button"
            role="switch"
            [attr.aria-checked]="challengeMode()"
            (click)="toggleChallengeMode()"
            class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-amber-400"
            [class.border-amber-400]="challengeMode()"
            [class.bg-amber-400/15]="challengeMode()"
            [class.text-amber-300]="challengeMode()"
            [class.border-slate-700]="!challengeMode()"
            [class.bg-slate-800]="!challengeMode()"
            [class.text-slate-300]="!challengeMode()"
            aria-label="Alternar Modo Desafio com perguntas sobre o próximo passo"
          >
            <span
              class="w-2.5 h-2.5 rounded-full"
              [class.bg-amber-400]="challengeMode()"
              [class.bg-slate-500]="!challengeMode()"
              [class.animate-pulse]="challengeMode()"
              aria-hidden="true"
            ></span>
            <span>Modo Desafio (Preveja o Passo)</span>
          </button>

          <!-- Toggle Barra Retrátil de Lote / Receita -->
          <button
            type="button"
            [attr.aria-expanded]="showBatchPanel()"
            (click)="toggleBatchPanel()"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
            aria-label="Abrir ou fechar painel de execução em lote"
          >
            <span>📜 Executar Lote / Receita</span>
            <span class="text-[10px] transform transition-transform" [class.rotate-180]="showBatchPanel()">
              ▼
            </span>
          </button>

          <!-- Botão Limpar -->
          <button
            type="button"
            [disabled]="disabled()"
            (click)="triggerClear()"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-300 hover:text-rose-200 hover:bg-rose-950/40 border border-rose-900/40 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-400 disabled:opacity-50"
            aria-label="Limpar estrutura atual"
            title="Limpar todos os elementos da estrutura"
          >
            🗑 Limpar
          </button>
        </div>
      </div>

      <!-- PAINEL RETRÁTIL: EXECUTAR LOTE / RECEITA -->
      @if (showBatchPanel()) {
        <div
          class="batch-panel bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 transition-all animate-fadeIn"
          role="region"
          aria-label="Painel de Execução em Lote"
        >
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 class="text-sm font-bold text-slate-200">Execução em Lote · Script de Operações</h4>
              <p class="text-xs text-slate-400">
                Digite comandos como <code class="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">I 30, I 20, I 10, S 20, D 30</code> ou apenas números <code class="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">30, 20, 10, 40, 25</code>.
              </p>
            </div>
            <!-- Botões de preenchimento rápido -->
            <div class="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                (click)="fillBatchSnippet('30, 20, 10, 40, 50')"
                class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700"
              >
                Sequência 5
              </button>
              <button
                type="button"
                (click)="fillBatchSnippet('I 40, I 20, I 60, I 10, I 30, S 20, D 40')"
                class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700"
              >
                Receita Mista
              </button>
              <button
                type="button"
                (click)="fillBatchSnippet('10, 20, 30, 40, 50, 60')"
                class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700"
              >
                Degenerada
              </button>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              [value]="batchScript()"
              [disabled]="disabled()"
              (input)="onBatchScriptInput($event)"
              placeholder="Ex: I 30, I 20, I 10, S 20, D 30  ou  42, 15, 78, 23"
              class="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm font-mono text-amber-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
              aria-label="Comandos para execução em lote"
            />
            <button
              type="button"
              [disabled]="disabled() || !batchScript().trim()"
              (click)="triggerBatchExecution()"
              class="px-5 py-2 rounded-lg font-bold text-xs bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 transition-all shadow-md shadow-amber-400/20 disabled:opacity-50 cursor-pointer"
              aria-label="Executar receita de operações"
            >
              Executar Receita
            </button>
          </div>
        </div>
      }
    </nav>
  `,
  styles: [`
    .btn-primary {
      @apply px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-400/20 transition-all cursor-pointer disabled:opacity-50;
    }
    .btn-secondary {
      @apply px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer disabled:opacity-50;
    }
    .btn-danger {
      @apply px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/60 hover:bg-rose-900 text-rose-200 border border-rose-800/50 transition-colors cursor-pointer disabled:opacity-50;
    }
    .btn-rotate {
      @apply px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-950/70 hover:bg-indigo-900 text-indigo-200 border border-indigo-800/60 transition-colors cursor-pointer disabled:opacity-50;
    }
    .btn-traversal {
      @apply px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer disabled:opacity-50;
    }
    .btn-action {
      @apply px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-cyan-800/40 transition-colors cursor-pointer disabled:opacity-50;
    }
  `]
})
export class OperationToolbarComponent {
  public readonly structureType = input.required<SandboxStructureType>();
  public readonly selectedNode = input<{ id: string; value: number } | null>(null);
  public readonly challengeMode = input<boolean>(false);
  public readonly disabled = input<boolean>(false);

  public readonly operationTriggered = output<SandboxOperationInput>();
  public readonly presetSelected = output<DatasetPresetId>();
  public readonly challengeModeToggled = output<boolean>();
  public readonly batchScriptExecuted = output<string>();

  public readonly presets: readonly SandboxPreset[] = SANDBOX_PRESETS;
  public readonly graphVertices: readonly string[] = ['A', 'B', 'C', 'D', 'E', 'F'];

  public readonly numericValue = signal<number>(25);
  public readonly indexValue = signal<number>(0);
  public readonly textValue = signal<string>('Item');
  public readonly selectedVertex = signal<string>('A');
  public readonly selectedPresetId = signal<DatasetPresetId>('random');
  public readonly showBatchPanel = signal<boolean>(false);
  public readonly batchScript = signal<string>('');

  public onNumericInput(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    if (!isNaN(val)) {
      this.numericValue.set(val);
    }
  }

  public onIndexInput(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    if (!isNaN(val)) {
      this.indexValue.set(Math.max(0, val));
    }
  }

  public onTextInput(event: Event): void {
    this.textValue.set((event.target as HTMLInputElement).value);
  }

  public onVertexSelect(event: Event): void {
    this.selectedVertex.set((event.target as HTMLSelectElement).value);
  }

  public onPresetChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as DatasetPresetId;
    this.selectedPresetId.set(val);
  }

  public onBatchScriptInput(event: Event): void {
    this.batchScript.set((event.target as HTMLInputElement).value);
  }

  public toggleBatchPanel(): void {
    this.showBatchPanel.update((v) => !v);
  }

  public toggleChallengeMode(): void {
    this.challengeModeToggled.emit(!this.challengeMode());
  }

  public applyCurrentPreset(): void {
    this.presetSelected.emit(this.selectedPresetId());
  }

  public fillBatchSnippet(snippet: string): void {
    this.batchScript.set(snippet);
  }

  public triggerBatchExecution(): void {
    const script = this.batchScript().trim();
    if (script) {
      this.batchScriptExecuted.emit(script);
    }
  }

  public triggerClear(): void {
    this.operationTriggered.emit({ type: 'clear' });
  }

  // --- Operações de Árvores ---
  public triggerTreeInsert(): void {
    this.operationTriggered.emit({
      type: 'insert',
      value: this.numericValue()
    });
  }

  public triggerTreeSearch(): void {
    this.operationTriggered.emit({
      type: 'search',
      value: this.numericValue()
    });
  }

  public triggerTreeDelete(): void {
    this.operationTriggered.emit({
      type: 'delete',
      value: this.numericValue()
    });
  }

  public triggerRotateLeft(): void {
    const node = this.selectedNode();
    this.operationTriggered.emit({
      type: 'rotate-left',
      targetNodeId: node?.id,
      value: node?.value ?? this.numericValue()
    });
  }

  public triggerRotateRight(): void {
    const node = this.selectedNode();
    this.operationTriggered.emit({
      type: 'rotate-right',
      targetNodeId: node?.id,
      value: node?.value ?? this.numericValue()
    });
  }

  public triggerTraverse(order: TreeTraversalOrder): void {
    this.operationTriggered.emit({
      type: 'traverse',
      traversalOrder: order
    });
  }

  // --- Operações de Array ---
  public triggerArrayInsertEnd(): void {
    this.operationTriggered.emit({
      type: 'insert',
      value: this.numericValue()
    });
  }

  public triggerArrayInsertAt(): void {
    this.operationTriggered.emit({
      type: 'insert-at',
      value: this.numericValue(),
      secondaryValue: this.indexValue()
    });
  }

  public triggerArrayRemove(): void {
    this.operationTriggered.emit({
      type: 'delete',
      value: this.numericValue()
    });
  }

  public triggerArrayLinearSearch(): void {
    this.operationTriggered.emit({
      type: 'search',
      value: this.numericValue()
    });
  }

  public triggerArrayBinarySearch(): void {
    this.operationTriggered.emit({
      type: 'binary-search',
      value: this.numericValue()
    });
  }

  // --- Operações de Lista Encadeada ---
  public triggerLinkedListInsertHead(): void {
    this.operationTriggered.emit({
      type: 'insert-head',
      value: this.numericValue()
    });
  }

  public triggerLinkedListInsertTail(): void {
    this.operationTriggered.emit({
      type: 'insert-tail',
      value: this.numericValue()
    });
  }

  public triggerLinkedListSearch(): void {
    this.operationTriggered.emit({
      type: 'search',
      value: this.numericValue()
    });
  }

  public triggerLinkedListDelete(): void {
    this.operationTriggered.emit({
      type: 'delete',
      value: this.numericValue()
    });
  }

  // --- Operações de Pilha (Stack) ---
  public triggerStackPush(): void {
    this.operationTriggered.emit({
      type: 'push',
      value: this.numericValue()
    });
  }

  public triggerStackPop(): void {
    this.operationTriggered.emit({
      type: 'pop'
    });
  }

  public triggerStackPeek(): void {
    this.operationTriggered.emit({
      type: 'peek'
    });
  }

  // --- Operações de Fila (Queue) ---
  public triggerQueueEnqueue(): void {
    this.operationTriggered.emit({
      type: 'enqueue',
      value: this.numericValue()
    });
  }

  public triggerQueueDequeue(): void {
    this.operationTriggered.emit({
      type: 'dequeue'
    });
  }

  public triggerQueuePeek(): void {
    this.operationTriggered.emit({
      type: 'peek'
    });
  }

  // --- Operações de Hash Map ---
  public triggerHashMapPut(): void {
    this.operationTriggered.emit({
      type: 'insert',
      value: this.numericValue(),
      secondaryValue: this.textValue()
    });
  }

  public triggerHashMapGet(): void {
    this.operationTriggered.emit({
      type: 'search',
      value: this.numericValue()
    });
  }

  public triggerHashMapDelete(): void {
    this.operationTriggered.emit({
      type: 'delete',
      value: this.numericValue()
    });
  }

  // --- Operações de Grafo ---
  public triggerGraphBfs(): void {
    this.operationTriggered.emit({
      type: 'bfs',
      targetNodeId: this.selectedVertex()
    });
  }

  public triggerGraphDfs(): void {
    this.operationTriggered.emit({
      type: 'dfs',
      targetNodeId: this.selectedVertex()
    });
  }
}
