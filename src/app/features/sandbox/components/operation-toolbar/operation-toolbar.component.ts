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
      class="operation-toolbar card"
      aria-label="Barra de Operações do Sandbox"
    >
      <!-- LINHA 1: CONTROLES ESPECÍFICOS DA ESTRUTURA SELECIONADA -->
      <div class="toolbar-primary-row">
        @switch (structureType()) {
          @case ('bst') {
            <!-- ÁRVORE BST -->
            <div class="structure-ops-group">
              <label for="tree-val-input" class="field-label">Valor:</label>
              <input
                id="tree-val-input"
                type="number"
                [value]="numericValue()"
                [disabled]="disabled()"
                (input)="onNumericInput($event)"
                class="toolbar-input val-input mono"
                aria-label="Valor numérico para operação na árvore"
              />

              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerTreeInsert()"
                class="btn-op btn-op-primary"
                aria-label="Inserir valor na árvore"
              >
                <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Inserir</span>
              </button>

              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerTreeSearch()"
                class="btn-op btn-op-secondary"
                aria-label="Pesquisar valor na árvore"
              >
                <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span>Pesquisar</span>
              </button>

              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerTreeDelete()"
                class="btn-op btn-op-danger"
                aria-label="Excluir valor da árvore"
              >
                <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                <span>Excluir</span>
              </button>

              <div class="toolbar-divider" aria-hidden="true"></div>

              <!-- Rotações Manuais com badge de nó selecionado -->
              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerRotateLeft()"
                class="btn-op btn-op-rotate"
                aria-label="Rotacionar à esquerda"
                [title]="selectedNode() ? 'Rotacionar à esquerda nó ' + selectedNode()!.value : 'Rotacionar à esquerda raiz/valor'"
              >
                <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
                <span>Rotacionar Esq</span>
              </button>

              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerRotateRight()"
                class="btn-op btn-op-rotate"
                aria-label="Rotacionar à direita"
                [title]="selectedNode() ? 'Rotacionar à direita nó ' + selectedNode()!.value : 'Rotacionar à direita raiz/valor'"
              >
                <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                <span>Rotacionar Dir</span>
              </button>

              @if (selectedNode(); as sel) {
                <span class="target-node-pill mono">
                  <span class="target-node-dot" aria-hidden="true"></span>
                  Nó Alvo: {{ sel.value }}
                </span>
              }

              <div class="toolbar-divider" aria-hidden="true"></div>

              <!-- Travessias -->
              <div class="traversals-group">
                <span class="field-label-sm">Travessia:</span>
                <button type="button" [disabled]="disabled()" (click)="triggerTraverse('in-order')" class="btn-op btn-op-traversal" title="Em-Ordem (In-Order: Esq, Raiz, Dir)">
                  Em-Ordem
                </button>
                <button type="button" [disabled]="disabled()" (click)="triggerTraverse('pre-order')" class="btn-op btn-op-traversal" title="Pré-Ordem (Pre-Order: Raiz, Esq, Dir)">
                  Pré-Ordem
                </button>
                <button type="button" [disabled]="disabled()" (click)="triggerTraverse('post-order')" class="btn-op btn-op-traversal" title="Pós-Ordem (Post-Order: Esq, Dir, Raiz)">
                  Pós-Ordem
                </button>
                <button type="button" [disabled]="disabled()" (click)="triggerTraverse('bfs')" class="btn-op btn-op-traversal" title="Em-Largura (BFS por Nível)">
                  BFS
                </button>
              </div>
            </div>
          }

          @case ('avl-tree') {
            <!-- ÁRVORE AVL -->
            <div class="structure-ops-group">
              <label for="avl-val-input" class="field-label">Valor:</label>
              <input
                id="avl-val-input"
                type="number"
                [value]="numericValue()"
                [disabled]="disabled()"
                (input)="onNumericInput($event)"
                class="toolbar-input val-input mono"
                aria-label="Valor numérico para operação na AVL"
              />

              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerTreeInsert()"
                class="btn-op btn-op-primary"
                aria-label="Inserir valor na árvore AVL"
              >
                <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Inserir</span>
              </button>

              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerTreeSearch()"
                class="btn-op btn-op-secondary"
                aria-label="Pesquisar valor na árvore AVL"
              >
                <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span>Pesquisar</span>
              </button>

              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerTreeDelete()"
                class="btn-op btn-op-danger"
                aria-label="Excluir valor da árvore AVL"
              >
                <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                <span>Excluir</span>
              </button>

              <div class="toolbar-divider" aria-hidden="true"></div>

              <!-- Rotações AVL -->
              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerRotateLeft()"
                class="btn-op btn-op-rotate"
                aria-label="Rotacionar à esquerda nó na AVL"
              >
                <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
                <span>Rotacionar Esq</span>
              </button>

              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerRotateRight()"
                class="btn-op btn-op-rotate"
                aria-label="Rotacionar à direita nó na AVL"
              >
                <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                <span>Rotacionar Dir</span>
              </button>

              @if (selectedNode(); as sel) {
                <span class="target-node-pill mono">
                  <span class="target-node-dot" aria-hidden="true"></span>
                  Nó Alvo: {{ sel.value }}
                </span>
              }

              <div class="toolbar-divider" aria-hidden="true"></div>

              <!-- Travessias -->
              <div class="traversals-group">
                <button type="button" [disabled]="disabled()" (click)="triggerTraverse('in-order')" class="btn-op btn-op-traversal" title="Em-Ordem">
                  Em-Ordem
                </button>
                <button type="button" [disabled]="disabled()" (click)="triggerTraverse('pre-order')" class="btn-op btn-op-traversal" title="Pré-Ordem">
                  Pré-Ordem
                </button>
                <button type="button" [disabled]="disabled()" (click)="triggerTraverse('post-order')" class="btn-op btn-op-traversal" title="Pós-Ordem">
                  Pós-Ordem
                </button>
                <button type="button" [disabled]="disabled()" (click)="triggerTraverse('bfs')" class="btn-op btn-op-traversal" title="Em-Largura (BFS)">
                  BFS
                </button>
              </div>
            </div>
          }

          @case ('red-black-tree') {
            <!-- ÁRVORE RUBRO-NEGRA -->
            <div class="structure-ops-group">
              <label for="rb-val-input" class="field-label">Valor:</label>
              <input
                id="rb-val-input"
                type="number"
                [value]="numericValue()"
                [disabled]="disabled()"
                (input)="onNumericInput($event)"
                class="toolbar-input val-input mono"
                aria-label="Valor numérico para árvore Rubro-Negra"
              />

              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerTreeInsert()"
                class="btn-op btn-op-primary"
                aria-label="Inserir valor na árvore Rubro-Negra"
              >
                <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Inserir</span>
              </button>

              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerTreeSearch()"
                class="btn-op btn-op-secondary"
                aria-label="Pesquisar valor na árvore Rubro-Negra"
              >
                <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span>Pesquisar</span>
              </button>

              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerTreeDelete()"
                class="btn-op btn-op-danger"
                aria-label="Excluir valor da árvore Rubro-Negra"
              >
                <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                <span>Excluir</span>
              </button>

              <div class="toolbar-divider" aria-hidden="true"></div>

              <!-- Rotações Rubro-Negra -->
              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerRotateLeft()"
                class="btn-op btn-op-rotate"
                aria-label="Rotacionar à esquerda"
              >
                <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
                <span>Rotacionar Esq</span>
              </button>

              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerRotateRight()"
                class="btn-op btn-op-rotate"
                aria-label="Rotacionar à direita"
              >
                <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                <span>Rotacionar Dir</span>
              </button>

              @if (selectedNode(); as sel) {
                <span class="target-node-pill mono">
                  <span class="target-node-dot" aria-hidden="true"></span>
                  Nó Alvo: {{ sel.value }}
                </span>
              }

              <div class="toolbar-divider" aria-hidden="true"></div>

              <!-- Travessias -->
              <div class="traversals-group">
                <button type="button" [disabled]="disabled()" (click)="triggerTraverse('in-order')" class="btn-op btn-op-traversal" title="Em-Ordem">
                  Em-Ordem
                </button>
                <button type="button" [disabled]="disabled()" (click)="triggerTraverse('pre-order')" class="btn-op btn-op-traversal" title="Pré-Ordem">
                  Pré-Ordem
                </button>
                <button type="button" [disabled]="disabled()" (click)="triggerTraverse('post-order')" class="btn-op btn-op-traversal" title="Pós-Ordem">
                  Pós-Ordem
                </button>
                <button type="button" [disabled]="disabled()" (click)="triggerTraverse('bfs')" class="btn-op btn-op-traversal" title="Em-Largura (BFS)">
                  BFS
                </button>
              </div>
            </div>
          }

          @case ('array') {
            <!-- ARRAY -->
            <div class="structure-ops-group">
              <label for="arr-val-input" class="field-label">Valor:</label>
              <input
                id="arr-val-input"
                type="number"
                [value]="numericValue()"
                [disabled]="disabled()"
                (input)="onNumericInput($event)"
                class="toolbar-input val-input mono"
                aria-label="Valor numérico para o Array"
              />

              <label for="arr-idx-input" class="field-label">Índice:</label>
              <input
                id="arr-idx-input"
                type="number"
                min="0"
                [value]="indexValue()"
                [disabled]="disabled()"
                (input)="onIndexInput($event)"
                class="toolbar-input idx-input mono"
                aria-label="Índice para inserção no Array"
              />

              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerArrayInsertEnd()"
                class="btn-op btn-op-primary"
                title="Inserir elemento no final do array em O(1)"
              >
                <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Inserir no Fim</span>
              </button>

              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerArrayInsertAt()"
                class="btn-op btn-op-secondary"
                title="Inserir elemento deslocando vizinhos em O(n)"
              >
                <span>Inserir no Índice</span>
              </button>

              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerArrayRemove()"
                class="btn-op btn-op-danger"
                title="Remover elemento do array"
              >
                <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                <span>Remover Valor</span>
              </button>

              <div class="toolbar-divider" aria-hidden="true"></div>

              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerArrayLinearSearch()"
                class="btn-op btn-op-action"
                title="Busca sequencial percorrendo todo o array O(n)"
              >
                <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span>Busca Linear O(n)</span>
              </button>

              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerArrayBinarySearch()"
                class="btn-op btn-op-action"
                title="Busca binária em array ordenado com divisão e conquista O(log n)"
              >
                <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span>Busca Binária O(log n)</span>
              </button>
            </div>
          }

          @case ('linked-list') {
            <!-- LISTA ENCADEADA -->
            <div class="structure-ops-group">
              <label for="ll-val-input" class="field-label">Valor:</label>
              <input
                id="ll-val-input"
                type="number"
                [value]="numericValue()"
                [disabled]="disabled()"
                (input)="onNumericInput($event)"
                class="toolbar-input val-input mono"
                aria-label="Valor numérico para a Lista Encadeada"
              />

              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerLinkedListInsertHead()"
                class="btn-op btn-op-primary"
                title="Inserir na cabeça da lista em tempo constante O(1)"
              >
                <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Inserir Cabeça O(1)</span>
              </button>

              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerLinkedListInsertTail()"
                class="btn-op btn-op-secondary"
                title="Percorrer até a cauda e inserir em tempo linear O(n)"
              >
                <span>Inserir Cauda O(n)</span>
              </button>

              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerLinkedListSearch()"
                class="btn-op btn-op-action"
                title="Buscar nó percorrendo ponteiros O(n)"
              >
                <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span>Buscar</span>
              </button>

              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerLinkedListDelete()"
                class="btn-op btn-op-danger"
                title="Remover nó da lista"
              >
                <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                <span>Remover</span>
              </button>
            </div>
          }

          @case ('stack') {
            <!-- PILHA (LIFO) -->
            <div class="structure-ops-group">
              <label for="stack-val-input" class="field-label">Valor:</label>
              <input
                id="stack-val-input"
                type="number"
                [value]="numericValue()"
                [disabled]="disabled()"
                (input)="onNumericInput($event)"
                class="toolbar-input val-input mono"
                aria-label="Valor para a Pilha"
              />

              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerStackPush()"
                class="btn-op btn-op-primary"
                title="Push: Empilhar elemento no topo em O(1)"
              >
                <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Push (Empilhar)</span>
              </button>

              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerStackPop()"
                class="btn-op btn-op-danger"
                title="Pop: Desempilhar elemento do topo em O(1)"
              >
                <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                <span>Pop (Desempilhar)</span>
              </button>

              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerStackPeek()"
                class="btn-op btn-op-action"
                title="Peek: Visualizar elemento do topo em O(1)"
              >
                <span>Peek (Topo)</span>
              </button>
            </div>
          }

          @case ('queue') {
            <!-- FILA (FIFO) -->
            <div class="structure-ops-group">
              <label for="queue-val-input" class="field-label">Valor:</label>
              <input
                id="queue-val-input"
                type="number"
                [value]="numericValue()"
                [disabled]="disabled()"
                (input)="onNumericInput($event)"
                class="toolbar-input val-input mono"
                aria-label="Valor para a Fila"
              />

              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerQueueEnqueue()"
                class="btn-op btn-op-primary"
                title="Enqueue: Adicionar elemento ao final da fila em O(1)"
              >
                <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Enqueue (Enfileirar)</span>
              </button>

              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerQueueDequeue()"
                class="btn-op btn-op-danger"
                title="Dequeue: Remover elemento da frente da fila em O(1)"
              >
                <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                <span>Dequeue (Desenfileirar)</span>
              </button>

              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerQueuePeek()"
                class="btn-op btn-op-action"
                title="Peek: Visualizar primeiro elemento da fila em O(1)"
              >
                <span>Peek (Início)</span>
              </button>
            </div>
          }

          @case ('hash-map') {
            <!-- TABELA HASH -->
            <div class="structure-ops-group">
              <label for="hm-key-input" class="field-label">Chave:</label>
              <input
                id="hm-key-input"
                type="number"
                [value]="numericValue()"
                [disabled]="disabled()"
                (input)="onNumericInput($event)"
                class="toolbar-input key-input mono"
                aria-label="Chave numérica para a Tabela Hash"
              />

              <label for="hm-val-input" class="field-label">Valor:</label>
              <input
                id="hm-val-input"
                type="text"
                [value]="textValue()"
                [disabled]="disabled()"
                (input)="onTextInput($event)"
                class="toolbar-input text-input"
                aria-label="Conteúdo textual associado à chave"
              />

              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerHashMapPut()"
                class="btn-op btn-op-primary"
                title="Inserir par chave/valor com cálculo de hash e tratamento de colisão"
              >
                <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Inserir (Put)</span>
              </button>

              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerHashMapGet()"
                class="btn-op btn-op-secondary"
                title="Buscar valor pela chave na Tabela Hash"
              >
                <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span>Buscar (Get)</span>
              </button>

              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerHashMapDelete()"
                class="btn-op btn-op-danger"
                title="Remover par chave/valor da Tabela Hash"
              >
                <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                <span>Remover</span>
              </button>
            </div>
          }

          @case ('graph') {
            <!-- GRAFO -->
            <div class="structure-ops-group">
              <label for="graph-vertex-select" class="field-label">Vértice Inicial:</label>
              <div class="select-wrapper select-wrapper-sm">
                <select
                  id="graph-vertex-select"
                  [value]="selectedVertex()"
                  [disabled]="disabled()"
                  (change)="onVertexSelect($event)"
                  class="select-input select-sm mono"
                  aria-label="Selecione o vértice inicial para travessia no grafo"
                >
                  @for (v of graphVertices; track v) {
                    <option [value]="v">Vértice {{ v }}</option>
                  }
                </select>
                <svg class="select-chevron" viewBox="0 0 24 24" aria-hidden="true">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>

              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerGraphBfs()"
                class="btn-op btn-op-primary"
                title="Busca em Largura (BFS) com fila FIFO explorando em anéis concêntricos"
              >
                <span>Executar BFS (Largura)</span>
              </button>

              <button
                type="button"
                [disabled]="disabled()"
                (click)="triggerGraphDfs()"
                class="btn-op btn-op-secondary"
                title="Busca em Profundidade (DFS) com pilha LIFO explorando ramificações completas"
              >
                <span>Executar DFS (Profundidade)</span>
              </button>
            </div>
          }
        }
      </div>

      <!-- LINHA 2: PRESETS, LIMPAR, MODO DESAFIO E TOGGLE DE LOTE -->
      <div class="toolbar-secondary-row">
        <!-- Presets Didáticos -->
        <div class="presets-group">
          <label for="preset-select" class="field-label">Presets Didáticos:</label>
          <div class="select-wrapper">
            <select
              id="preset-select"
              [value]="selectedPresetId()"
              [disabled]="disabled()"
              (change)="onPresetChange($event)"
              class="select-input select-sm"
              aria-label="Selecione um preset didático"
            >
              @for (preset of presets; track preset.id) {
                <option [value]="preset.id">
                  {{ preset.title }} ({{ preset.badge }})
                </option>
              }
            </select>
            <svg class="select-chevron" viewBox="0 0 24 24" aria-hidden="true">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>

          <button
            type="button"
            [disabled]="disabled()"
            (click)="applyCurrentPreset()"
            class="btn-op btn-op-secondary btn-sm"
            aria-label="Carregar preset selecionado"
          >
            Carregar
          </button>
        </div>

        <!-- Ações Globais -->
        <div class="global-actions-group">
          <!-- Toggle Modo Desafio -->
          <button
            type="button"
            role="switch"
            [attr.aria-checked]="challengeMode()"
            (click)="toggleChallengeMode()"
            class="challenge-mode-toggle"
            [class.is-active]="challengeMode()"
            aria-label="Alternar Modo Desafio com perguntas sobre o próximo passo"
          >
            <span class="challenge-dot" aria-hidden="true"></span>
            <svg class="challenge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <span>Modo Desafio (Preveja o Passo)</span>
          </button>

          <!-- Toggle Barra Retrátil de Lote / Receita -->
          <button
            type="button"
            [attr.aria-expanded]="showBatchPanel()"
            (click)="toggleBatchPanel()"
            class="btn-op btn-op-secondary btn-sm"
            aria-label="Abrir ou fechar painel de execução em lote"
          >
            <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
            <span>Executar Lote / Receita</span>
            <svg class="chevron-toggle" [class.is-open]="showBatchPanel()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          <!-- Botão Limpar -->
          <button
            type="button"
            [disabled]="disabled()"
            (click)="triggerClear()"
            class="btn-op btn-op-danger btn-sm"
            aria-label="Limpar estrutura atual"
            title="Limpar todos os elementos da estrutura"
          >
            <svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            <span>Limpar</span>
          </button>
        </div>
      </div>

      <!-- PAINEL RETRÁTIL: EXECUTAR LOTE / RECEITA -->
      @if (showBatchPanel()) {
        <div
          class="batch-panel"
          role="region"
          aria-label="Painel de Execução em Lote"
        >
          <div class="batch-header">
            <div>
              <h4 class="batch-title">Execução em Lote · Script de Operações</h4>
              <p class="batch-subtitle">
                Digite comandos como <code class="mono-code">I 30, I 20, I 10, S 20, D 30</code> ou apenas números <code class="mono-code">30, 20, 10, 40, 25</code>.
              </p>
            </div>
            <!-- Botões de preenchimento rápido -->
            <div class="batch-snippets">
              <button
                type="button"
                (click)="fillBatchSnippet('30, 20, 10, 40, 50')"
                class="snippet-btn mono"
              >
                Sequência 5
              </button>
              <button
                type="button"
                (click)="fillBatchSnippet('I 40, I 20, I 60, I 10, I 30, S 20, D 40')"
                class="snippet-btn mono"
              >
                Receita Mista
              </button>
              <button
                type="button"
                (click)="fillBatchSnippet('10, 20, 30, 40, 50, 60')"
                class="snippet-btn mono"
              >
                Degenerada
              </button>
            </div>
          </div>

          <div class="batch-input-row">
            <input
              type="text"
              [value]="batchScript()"
              [disabled]="disabled()"
              (input)="onBatchScriptInput($event)"
              placeholder="Ex: I 30, I 20, I 10, S 20, D 30  ou  42, 15, 78, 23"
              class="toolbar-input batch-text-input mono"
              aria-label="Comandos para execução em lote"
            />
            <button
              type="button"
              [disabled]="disabled() || !batchScript().trim()"
              (click)="triggerBatchExecution()"
              class="btn-op btn-op-primary"
              aria-label="Executar receita de operações"
            >
              <span>Executar Receita</span>
            </button>
          </div>
        </div>
      }
    </nav>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .operation-toolbar {
      padding: 14px 18px;
      gap: 12px;
      display: flex;
      flex-direction: column;
      background: var(--panel, #ffffff);
      border: 1.5px solid var(--frame-soft, #c3d0c7);
      border-radius: 16px 24px 16px 24px / 22px 16px 24px 16px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
    }

    .toolbar-primary-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px;
    }

    .structure-ops-group {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      width: 100%;
    }

    .field-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--ink-dim, #5a6660);
      font-family: var(--mono, monospace);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .field-label-sm {
      font-size: 10px;
      font-weight: 600;
      color: var(--ink-dim, #5a6660);
      font-family: var(--mono, monospace);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-right: 2px;
    }

    .toolbar-input {
      height: 38px;
      padding: 0 10px;
      border: 1.5px solid var(--edge, #6f7d74);
      border-radius: 10px;
      background: var(--panel, #ffffff);
      color: var(--ink, #1c2621);
      font-size: 13px;
      font-weight: 600;
      font-family: var(--mono, monospace);
      transition: border-color 0.15s ease;

      &:focus-visible {
        outline: 2px solid var(--pine, #17603e);
        outline-offset: 1px;
      }

      &:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }

      &.val-input { width: 84px; }
      &.idx-input { width: 72px; }
      &.key-input { width: 78px; }
      &.text-input { width: 120px; }
    }

    .btn-op {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 38px;
      padding: 0 13px;
      border-radius: 10px;
      font-family: var(--sans, sans-serif);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
      white-space: nowrap;

      &:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }

      &:focus-visible {
        outline: 2px solid var(--pine, #17603e);
        outline-offset: 2px;
      }

      &.btn-sm {
        height: 32px;
        padding: 0 10px;
        font-size: 12px;
      }
    }

    .btn-op-primary {
      background: var(--pine, #17603e);
      color: #ffffff;
      border: 1.5px solid var(--pine, #17603e);

      &:hover:not(:disabled) {
        background: var(--pine-strong, #0f4a2f);
        border-color: var(--pine-strong, #0f4a2f);
      }
    }

    .btn-op-secondary {
      background: var(--panel, #ffffff);
      color: var(--ink, #1c2621);
      border: 1.5px solid var(--edge, #6f7d74);

      &:hover:not(:disabled) {
        background: var(--wall-tint, #f3f6f3);
      }
    }

    .btn-op-danger {
      background: var(--panel, #ffffff);
      color: #b91c1c;
      border: 1.5px solid #fca5a5;

      &:hover:not(:disabled) {
        background: #fef2f2;
        border-color: #dc2626;
      }
    }

    .btn-op-rotate {
      background: var(--panel, #ffffff);
      color: var(--omega, #2160b0);
      border: 1.5px solid rgba(33, 96, 176, 0.45);

      &:hover:not(:disabled) {
        background: rgba(33, 96, 176, 0.08);
      }
    }

    .btn-op-traversal {
      background: var(--wall-tint, #f3f6f3);
      color: var(--ink-soft, #3f4c45);
      border: 1.5px solid var(--frame-soft, #c3d0c7);
      border-radius: 6px;
      height: 32px;
      padding: 0 9px;
      font-size: 11.5px;
      font-family: var(--mono, monospace);

      &:hover:not(:disabled) {
        background: var(--panel, #ffffff);
        color: var(--pine, #17603e);
        border-color: var(--pine, #17603e);
      }
    }

    .btn-op-action {
      background: var(--panel, #ffffff);
      color: var(--ink, #1c2621);
      border: 1.5px solid var(--edge, #6f7d74);

      &:hover:not(:disabled) {
        background: var(--wall-tint, #f3f6f3);
      }
    }

    .op-icon {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
    }

    .toolbar-divider {
      width: 1px;
      height: 22px;
      background: var(--rule, #d8e0da);
      margin: 0 4px;
    }

    .target-node-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 9999px;
      background: var(--wall-tint, #f3f6f3);
      border: 1px solid var(--frame-soft, #c3d0c7);
      font-size: 11.5px;
      font-weight: 600;
      color: var(--pine, #17603e);
    }

    .target-node-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--pine, #17603e);
    }

    .traversals-group {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-wrap: wrap;
    }

    /* Linha 2 */
    .toolbar-secondary-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding-top: 10px;
      border-top: 1px solid var(--rule, #d8e0da);
    }

    .presets-group {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
    }

    .global-actions-group {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
    }

    .select-wrapper {
      position: relative;
      display: inline-flex;
      align-items: center;

      &.select-wrapper-sm {
        height: 36px;
      }
    }

    .select-input {
      height: 38px;
      padding: 0 30px 0 12px;
      border: 1.5px solid var(--edge, #6f7d74);
      border-radius: 10px;
      background: var(--panel, #ffffff);
      color: var(--ink, #1c2621);
      font-size: 13px;
      font-weight: 600;
      font-family: var(--sans, sans-serif);
      appearance: none;
      cursor: pointer;

      &:focus-visible {
        outline: 2px solid var(--pine, #17603e);
        outline-offset: 1px;
      }

      &.select-sm {
        height: 34px;
      }
    }

    .select-chevron {
      position: absolute;
      right: 10px;
      width: 13px;
      height: 13px;
      fill: none;
      stroke: var(--ink-dim, #5a6660);
      stroke-width: 2;
      pointer-events: none;
    }

    .challenge-mode-toggle {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      height: 38px;
      padding: 0 12px;
      border-radius: 10px;
      border: 1.5px solid var(--frame-soft, #c3d0c7);
      background: var(--panel, #ffffff);
      color: var(--ink-soft, #3f4c45);
      font-size: 12.5px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;

      .challenge-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--ink-dim, #5a6660);
      }

      .challenge-icon {
        width: 14px;
        height: 14px;
      }

      &.is-active {
        border-color: var(--pine, #17603e);
        background: rgba(23, 96, 62, 0.08);
        color: var(--pine, #17603e);

        .challenge-dot {
          background: var(--pine, #17603e);
          box-shadow: 0 0 6px rgba(23, 96, 62, 0.5);
        }
      }

      &:focus-visible {
        outline: 2px solid var(--pine, #17603e);
        outline-offset: 2px;
      }
    }

    .chevron-toggle {
      width: 12px;
      height: 12px;
      transition: transform 0.2s ease;

      &.is-open {
        transform: rotate(180deg);
      }
    }

    /* Painel Lote */
    .batch-panel {
      background: var(--wall-tint, #f3f6f3);
      border: 1.5px solid var(--frame-soft, #c3d0c7);
      border-radius: 10px;
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .batch-header {
      display: flex;
      flex-direction: column;
      gap: 6px;

      @media (min-width: 720px) {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }
    }

    .batch-title {
      margin: 0;
      font-size: 13px;
      font-weight: 700;
      color: var(--ink, #1c2621);
    }

    .batch-subtitle {
      margin: 2px 0 0;
      font-size: 11.5px;
      color: var(--ink-dim, #5a6660);
    }

    .mono-code {
      font-family: var(--mono, monospace);
      background: var(--panel, #ffffff);
      padding: 1px 5px;
      border-radius: 4px;
      border: 1px solid var(--rule, #d8e0da);
      color: var(--pine, #17603e);
      font-weight: 600;
    }

    .batch-snippets {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

    .snippet-btn {
      padding: 3px 8px;
      border-radius: 4px;
      border: 1px solid var(--edge, #6f7d74);
      background: var(--panel, #ffffff);
      color: var(--ink-soft, #3f4c45);
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;

      &:hover {
        background: var(--wall-tint, #f3f6f3);
        color: var(--pine, #17603e);
        border-color: var(--pine, #17603e);
      }
    }

    .batch-input-row {
      display: flex;
      gap: 8px;
      flex-direction: column;

      @media (min-width: 600px) {
        flex-direction: row;
      }
    }

    .batch-text-input {
      flex: 1;
      height: 36px;
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
