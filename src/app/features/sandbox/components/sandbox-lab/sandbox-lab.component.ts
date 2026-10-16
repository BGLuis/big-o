import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import { SandboxSessionService } from '../../services/sandbox-session.service';
import { OperationToolbarComponent } from '../operation-toolbar/operation-toolbar.component';
import { StepPredictorQuizComponent } from '../step-predictor-quiz/step-predictor-quiz.component';
import { TreeRendererComponent } from '../../../../families/hierarchical/tree-renderer.component';
import { LinearRendererComponent } from '../../../../families/linear/linear-renderer.component';
import { LinkedListRendererComponent } from '../../../../families/linked-list/linked-list-renderer.component';
import { StackRendererComponent } from '../../../../families/stack/stack-renderer.component';
import { QueueRendererComponent } from '../../../../families/queue/queue-renderer.component';
import { GraphRendererComponent } from '../../../../families/graph/graph-renderer.component';
import { HashMapRendererComponent } from '../../../../families/hash-map/hash-map-renderer.component';
import { SandboxStructureType } from '../../sandbox.types';

interface StructureCategoryItem {
  readonly type: SandboxStructureType;
  readonly label: string;
  readonly badge: string;
  readonly complexity: string;
}

interface StructureCategory {
  readonly title: string;
  readonly description: string;
  readonly items: readonly StructureCategoryItem[];
}

@Component({
  selector: 'app-sandbox-lab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    OperationToolbarComponent,
    StepPredictorQuizComponent,
    TreeRendererComponent,
    LinearRendererComponent,
    LinkedListRendererComponent,
    StackRendererComponent,
    QueueRendererComponent,
    GraphRendererComponent,
    HashMapRendererComponent
  ],
  template: `
    <div class="sandbox-lab-page">
      <!-- 1. SELETOR DE ESTRUTURA DO LABORATÓRIO (PILLS / TABS CATEGORIZADAS) -->
      <section class="card category-selector-card" aria-label="Seletor de Estrutura de Dados">
        <div class="selector-header">
          <div>
            <span class="tagline">Laboratório Interativo · Estrutura Única</span>
            <h2 class="selector-title hand">Escolha a Estrutura para Experimentar</h2>
          </div>
          <span class="active-structure-pill mono">
            Ativa: <strong>{{ activeStructureLabel() }}</strong>
          </span>
        </div>

        <div class="categories-grid">
          @for (cat of categories; track cat.title) {
            <div class="category-group" role="region" [attr.aria-label]="cat.title">
              <div class="category-heading">
                <span class="cat-title">{{ cat.title }}</span>
                <span class="cat-desc">{{ cat.description }}</span>
              </div>

              <div class="pills-row" role="tablist" [attr.aria-label]="cat.title">
                @for (item of cat.items; track item.type) {
                  <button
                    type="button"
                    role="tab"
                    [id]="'tab-' + item.type"
                    [attr.aria-selected]="session.structureType() === item.type"
                    [attr.aria-controls]="'lab-canvas-viewport'"
                    [class.is-active]="session.structureType() === item.type"
                    class="structure-pill"
                    (click)="selectStructure(item.type)"
                  >
                    <span class="pill-label">{{ item.label }}</span>
                    <span class="pill-complexity mono">{{ item.complexity }}</span>
                  </button>
                }
              </div>
            </div>
          }
        </div>
      </section>

      <!-- 2. BARRA DE OPERAÇÕES DINÂMICA -->
      <section class="toolbar-section" aria-label="Controles e Operações da Estrutura">
        <app-operation-toolbar
          [structureType]="session.structureType()"
          [selectedNode]="session.selectedTreeNode()"
          [challengeMode]="session.challengeMode()"
          [disabled]="session.isPlaying()"
          (operationTriggered)="session.executeOperation($event)"
          (presetSelected)="session.applyPreset($event)"
          (challengeModeToggled)="session.challengeMode.set($event)"
          (batchScriptExecuted)="session.executeBatchScript($event)"
        />
      </section>

      <!-- 3. QUIZ INTERATIVO (MODO DESAFIO) -->
      @if (session.activeQuiz(); as quiz) {
        <aside class="quiz-container" aria-label="Desafio de predição de passo">
          <app-step-predictor-quiz
            [prompt]="quiz"
            (dismissed)="session.dismissQuiz()"
          />
        </aside>
      }

      <!-- 4. GRID PRINCIPAL DO LABORATÓRIO (CANVAS + HISTÓRICO TIME-TRAVEL) -->
      <div class="lab-main-grid">
        <!-- COLUNA PRINCIPAL: LOUSA INTERATIVA + TELEMETRIA + PLAYBACK -->
        <main class="card canvas-card" aria-label="Lousa de visualização interativa">
          <!-- CABEÇALHO DA LOUSA: TELEMETRIA DA OPERAÇÃO + DICA CONTEXTUAL -->
          <header class="chalkboard-header">
            <div class="telemetry-chips" role="status" aria-label="Métricas da operação atual">
              <div class="telemetry-chip">
                <span class="chip-label">Comparações:</span>
                <span class="chip-val mono">{{ session.telemetry().comparisons }}</span>
              </div>
              <div class="telemetry-chip">
                <span class="chip-label">Mutações / Rotações:</span>
                <span class="chip-val mono">{{ session.telemetry().swapsOrMutations }}</span>
              </div>
              <div class="telemetry-chip highlight">
                <span class="chip-label">{{ session.telemetry().structuralLabel }}:</span>
                <span class="chip-val mono">{{ session.telemetry().structuralDepthOrSize }}</span>
              </div>
            </div>

            <!-- Dica contextual didática -->
            <div class="contextual-tip-banner" role="note" aria-label="Dica didática contextual">
              <span class="tip-icon" aria-hidden="true">💡</span>
              <p class="tip-text">{{ contextualTip() }}</p>
            </div>
          </header>

          <!-- ÁREA DE RENDERIZAÇÃO DA ESTRUTURA ATIVA -->
          <div
            id="lab-canvas-viewport"
            class="canvas-viewport chalkboard"
            role="region"
            aria-label="Quadro de giz com visualização viva da estrutura"
          >
            @switch (session.structureType()) {
              @case ('avl-tree') {
                <app-tree-renderer
                  [state]="session.renderedTreeState()"
                  [currentEvent]="$any(session.currentEvent())"
                  (nodeClicked)="onTreeNodeClicked($event)"
                />
              }
              @case ('bst') {
                <app-tree-renderer
                  [state]="session.renderedTreeState()"
                  [currentEvent]="$any(session.currentEvent())"
                  (nodeClicked)="onTreeNodeClicked($event)"
                />
              }
              @case ('red-black-tree') {
                <app-tree-renderer
                  [state]="session.renderedTreeState()"
                  [currentEvent]="$any(session.currentEvent())"
                  (nodeClicked)="onTreeNodeClicked($event)"
                />
              }
              @case ('array') {
                <app-linear-renderer
                  [state]="session.renderedLinearState()"
                  [currentEvent]="$any(session.currentEvent())"
                />
              }
              @case ('linked-list') {
                <app-linked-list-renderer
                  [state]="session.renderedLinkedListState()"
                  [currentEvent]="$any(session.currentEvent())"
                />
              }
              @case ('stack') {
                <app-stack-renderer
                  [state]="session.renderedStackState()"
                  [currentEvent]="$any(session.currentEvent())"
                />
              }
              @case ('queue') {
                <app-queue-renderer
                  [state]="session.renderedQueueState()"
                  [currentEvent]="$any(session.currentEvent())"
                />
              }
              @case ('hash-map') {
                <app-hash-map-renderer
                  [state]="session.renderedHashMapState()"
                  [currentEvent]="$any(session.currentEvent())"
                />
              }
              @case ('graph') {
                <app-graph-renderer
                  [state]="session.renderedGraphState()"
                  [currentEvent]="$any(session.currentEvent())"
                />
              }
            }
          </div>

          <!-- BARRA DE NARRAÇÃO PASSO A PASSO -->
          <div class="narration-bar" role="status" aria-live="polite">
            <span class="narration-step hand">
              passo {{ session.currentStepIndex() }} / {{ session.totalSteps() }}
            </span>
            <span class="narration-text">
              {{ session.currentEvent()?.narration || session.lastSummary() }}
            </span>
          </div>

          <!-- BARRA DE CONTROLES DE REPRODUÇÃO (PLAYBACK BAR) -->
          <div class="playback-bar" role="toolbar" aria-label="Controles de reprodução do laboratório">
            <div class="playback-buttons">
              <!-- Resetar Operação -->
              <button
                type="button"
                class="ctrl"
                (click)="onReset()"
                [disabled]="session.totalSteps() === 0 || session.currentStepIndex() === 0"
                aria-label="Resetar Operação"
                title="Resetar para o passo inicial da operação (passo 0)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M1 4v6h6M23 20v-6h-6"/>
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                </svg>
              </button>

              <!-- Passo Anterior -->
              <button
                type="button"
                class="ctrl"
                (click)="session.stepBackward()"
                [disabled]="!session.canStepBackward()"
                aria-label="Passo Anterior"
                title="Passo Anterior"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
                  <polygon points="19 20 9 12 19 4 19 20"/>
                  <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>

              <!-- Play / Pause -->
              <button
                type="button"
                class="ctrl play"
                (click)="session.togglePlay()"
                [disabled]="session.totalSteps() === 0"
                [attr.aria-label]="session.isPlaying() ? 'Pausar reprodução' : 'Iniciar reprodução passo a passo'"
                [title]="session.isPlaying() ? 'Pausar' : 'Reproduzir'"
              >
                @if (session.isPlaying()) {
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <rect x="6" y="4" width="4" height="16" rx="1"/>
                    <rect x="14" y="4" width="4" height="16" rx="1"/>
                  </svg>
                } @else {
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <polygon points="6 4 20 12 6 20 6 4"/>
                  </svg>
                }
              </button>

              <!-- Próximo Passo -->
              <button
                type="button"
                class="ctrl"
                (click)="session.stepForward()"
                [disabled]="!session.canStepForward()"
                aria-label="Próximo Passo"
                title="Próximo Passo"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
                  <polygon points="5 4 19 12 5 20 5 4"/>
                  <line x1="20" y1="5" x2="20" y2="19" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>
            </div>

            <!-- Scrubber Linha do Tempo -->
            <div class="scrubber-wrapper">
              <label for="lab-scrubber" class="sr-only">Linha do tempo de passos</label>
              <input
                id="lab-scrubber"
                type="range"
                class="scrubber-range"
                min="0"
                [max]="session.totalSteps()"
                [value]="session.currentStepIndex()"
                [style.--scrubber-fill]="session.progressPercent() + '%'"
                [disabled]="session.totalSteps() === 0"
                (input)="onScrub($event)"
                aria-label="Linha do tempo da operação atual"
              />
              <span class="scrubber-counter mono" aria-hidden="true">
                {{ session.currentStepIndex() }} / {{ session.totalSteps() }}
              </span>
            </div>

            <!-- Seletor de Velocidade -->
            <div class="speed-buttons" role="group" aria-label="Velocidade de reprodução">
              @for (spd of speedOptions; track spd) {
                <button
                  type="button"
                  class="speed-btn mono"
                  [class.is-active]="currentSpeed() === spd"
                  (click)="setSpeed(spd)"
                  [attr.aria-pressed]="currentSpeed() === spd"
                  [title]="'Velocidade ' + spd + 'x'"
                >
                  {{ spd }}×
                </button>
              }
            </div>
          </div>
        </main>

        <!-- COLUNA LATERAL DIREITA: FITA DE HISTÓRICO & REPLAY TIME-TRAVEL -->
        <aside class="card history-panel" aria-label="Histórico e Fita de Operações">
          <header class="history-header">
            <div class="history-title-row">
              <h3 class="history-title">
                <span class="history-icon" aria-hidden="true">📜</span>
                <span>Fita de Operações</span>
              </h3>
              <span class="history-count-badge mono">
                {{ session.history().length }} {{ session.history().length === 1 ? 'op' : 'ops' }}
              </span>
            </div>
            <p class="history-subtitle">
              Time-Travel: reveja passos passados ou reverta o estado da estrutura.
            </p>
          </header>

          <div class="history-scroll-list" role="list" aria-label="Lista cronológica de operações">
            @if (session.history().length === 0) {
              <div class="history-empty">
                <span class="empty-icon" aria-hidden="true">🧪</span>
                <p class="empty-text">Nenhuma operação realizada ainda.</p>
                <p class="empty-hint">
                  Insira novos valores, execute buscas ou carregue um preset didático para iniciar seu roteiro.
                </p>
              </div>
            } @else {
              @for (record of session.history(); track record.id; let idx = $index) {
                <div
                  class="history-item"
                  [class.is-active]="session.activeRecordIndex() === idx"
                  role="listitem"
                >
                  <div class="item-meta">
                    <span class="item-badge mono">#{{ idx + 1 }}</span>
                    <div class="item-info">
                      <span class="item-label">{{ record.label }}</span>
                      <span class="item-steps mono">
                        {{ record.events.length }} {{ record.events.length === 1 ? 'passo' : 'passos' }}
                      </span>
                    </div>
                  </div>

                  <div class="item-actions">
                    <button
                      type="button"
                      class="history-btn btn-replay"
                      (click)="session.replayHistoryRecord(idx)"
                      title="Rever passos desta operação"
                      aria-label="Rever passos da operação {{ record.label }}"
                    >
                      <span aria-hidden="true">▶</span>
                      <span>Rever</span>
                    </button>
                    <button
                      type="button"
                      class="history-btn btn-restore"
                      (click)="session.restoreToHistoryIndex(idx)"
                      title="Restaurar a estrutura para o estado exato após esta operação"
                      aria-label="Restaurar estrutura para este ponto após {{ record.label }}"
                    >
                      <span aria-hidden="true">↺</span>
                      <span>Voltar Aqui</span>
                    </button>
                  </div>
                </div>
              }
            }
          </div>

          <!-- RODAPÉ DO HISTÓRICO COM EXPORTAÇÃO DE RECEITA E LIMPEZA -->
          <footer class="history-footer">
            <button
              type="button"
              class="btn btn-copy-recipe"
              (click)="copyRecipe()"
              [disabled]="session.history().length === 0"
              aria-label="Copiar receita de comandos executados para a área de transferência"
            >
              @if (copied()) {
                <span class="copied-feedback">
                  <span aria-hidden="true">✓</span>
                  <span>Copiado!</span>
                </span>
              } @else {
                <span class="copy-default">
                  <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  <span>Copiar Receita de Operações</span>
                </span>
              }
            </button>

            <button
              type="button"
              class="btn-clear-structure"
              (click)="session.clearStructure()"
              [disabled]="session.history().length === 0"
              aria-label="Limpar estrutura e histórico de operações"
            >
              Limpar Estrutura
            </button>
          </footer>
        </aside>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .sandbox-lab-page {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding-bottom: 32px;
    }

    /* CARD BASE STYLES */
    .card {
      background: var(--panel, #ffffff);
      border: 1px solid var(--frame-soft, #c3d0c7);
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
      transition: all 0.2s ease;
    }

    /* 1. SELETOR DE ESTRUTURA (PILLS) */
    .category-selector-card {
      padding: 18px 22px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .selector-header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      border-bottom: 1px solid var(--rule, #d8e0da);
      padding-bottom: 12px;
    }

    .tagline {
      font-family: var(--mono, 'IBM Plex Mono', monospace);
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--pine, #17603e);
      display: block;
      margin-bottom: 2px;
    }

    .selector-title {
      font-family: var(--hand, 'Caveat', cursive);
      font-size: 1.6rem;
      font-weight: 700;
      color: var(--ink, #1c2621);
      margin: 0;
      line-height: 1.2;
    }

    .active-structure-pill {
      font-size: 12px;
      padding: 5px 12px;
      border-radius: 9999px;
      background: var(--wall-tint, #f3f6f3);
      border: 1px solid var(--frame-soft, #c3d0c7);
      color: var(--ink-soft, #3f4c45);

      strong {
        color: var(--pine, #17603e);
      }
    }

    .categories-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;

      @media (min-width: 900px) {
        grid-template-columns: 1fr 1.6fr;
      }
    }

    .category-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .category-heading {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .cat-title {
      font-size: 13px;
      font-weight: 700;
      color: var(--ink, #1c2621);
    }

    .cat-desc {
      font-size: 11px;
      color: var(--ink-dim, #5a6660);
    }

    .pills-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .structure-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 12px;
      border-radius: 8px;
      background: var(--wall-tint, #f3f6f3);
      border: 1px solid var(--frame-soft, #c3d0c7);
      color: var(--ink, #1c2621);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover:not(.is-active) {
        border-color: var(--pine, #17603e);
        background: #ffffff;
      }

      &:focus-visible {
        outline: 2px solid var(--pine, #17603e);
        outline-offset: 2px;
      }

      &.is-active {
        background: var(--pine, #17603e);
        border-color: var(--pine, #17603e);
        color: #ffffff;
        box-shadow: 0 2px 8px rgba(23, 96, 62, 0.25);

        .pill-complexity {
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
        }
      }
    }

    .pill-complexity {
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
      background: rgba(0, 0, 0, 0.06);
      color: var(--ink-dim, #5a6660);
    }

    /* 2. TOOLBAR SECTION */
    .toolbar-section {
      width: 100%;
    }

    /* 3. QUIZ CONTAINER */
    .quiz-container {
      width: 100%;
      animation: fadeIn 0.25s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-6px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* 4. MAIN GRID */
    .lab-main-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
      align-items: start;

      @media (min-width: 1100px) {
        grid-template-columns: 1fr 340px;
      }
    }

    /* CANVAS CARD */
    .canvas-card {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    /* CHALKBOARD HEADER & TELEMETRY */
    .chalkboard-header {
      padding: 14px 18px;
      background: var(--board-deep, #1f2a24);
      border-bottom: 1px solid var(--frame-soft, #384d41);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .telemetry-chips {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px;
    }

    .telemetry-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 6px;
      font-size: 12px;
      color: var(--chalk-soft, #d7ded6);

      .chip-val {
        font-weight: 700;
        color: #ffffff;
      }

      &.highlight {
        border-color: rgba(78, 222, 163, 0.4);
        background: rgba(78, 222, 163, 0.1);

        .chip-val {
          color: var(--pine, #4edea3);
        }
      }
    }

    .contextual-tip-banner {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-size: 12px;
      color: var(--chalk-dim, #b7c2b9);
      background: rgba(0, 0, 0, 0.2);
      padding: 8px 12px;
      border-radius: 6px;
      border-left: 3px solid var(--o-lt, #e8c14a);
      line-height: 1.4;

      .tip-icon {
        flex-shrink: 0;
        font-size: 14px;
      }

      .tip-text {
        margin: 0;
      }
    }

    /* CHALKBOARD VIEWPORT */
    .canvas-viewport.chalkboard {
      background-color: var(--board, #26332c);
      background-image:
        radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.03) 0%, transparent 80%),
        repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255, 255, 255, 0.02) 40px);
      min-height: 380px;
      height: 420px;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.4);
    }

    /* NARRATION BAR */
    .narration-bar {
      padding: 12px 18px;
      background: var(--board-deep, #1f2a24);
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      gap: 14px;
      min-height: 48px;
    }

    .narration-step {
      font-family: var(--hand, 'Caveat', cursive);
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--o-lt, #e8c14a);
      white-space: nowrap;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    }

    .narration-text {
      font-size: 13px;
      color: var(--chalk, #f4f1e6);
      line-height: 1.4;
      flex: 1;
    }

    /* PLAYBACK BAR */
    .playback-bar {
      padding: 10px 18px;
      background: var(--panel, #ffffff);
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 14px;
    }

    .playback-buttons {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .ctrl {
      width: 36px;
      height: 36px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      background: var(--wall-tint, #f3f6f3);
      border: 1px solid var(--frame-soft, #c3d0c7);
      color: var(--ink, #1c2621);
      cursor: pointer;
      transition: all 0.15s ease;

      svg {
        width: 16px;
        height: 16px;
      }

      &:hover:not(:disabled) {
        background: #ffffff;
        border-color: var(--pine, #17603e);
        color: var(--pine, #17603e);
      }

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      &:focus-visible {
        outline: 2px solid var(--pine, #17603e);
        outline-offset: 2px;
      }

      &.play {
        background: var(--pine, #17603e);
        border-color: var(--pine, #17603e);
        color: #ffffff;
        width: 42px;

        &:hover:not(:disabled) {
          background: #124d31;
          color: #ffffff;
        }
      }
    }

    .scrubber-wrapper {
      flex: 1;
      min-width: 180px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .scrubber-range {
      flex: 1;
      height: 6px;
      -webkit-appearance: none;
      appearance: none;
      background: #e2e8f0;
      border-radius: 9999px;
      outline: none;
      cursor: pointer;
      background-image: linear-gradient(var(--pine, #17603e), var(--pine, #17603e));
      background-size: var(--scrubber-fill, 0%) 100%;
      background-repeat: no-repeat;

      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: var(--pine, #17603e);
        border: 2px solid #ffffff;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
        cursor: pointer;
        transition: transform 0.1s ease;

        &:hover {
          transform: scale(1.15);
        }
      }

      &::-moz-range-thumb {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: var(--pine, #17603e);
        border: 2px solid #ffffff;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
        cursor: pointer;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .scrubber-counter {
      font-size: 11px;
      font-weight: 600;
      color: var(--ink-dim, #5a6660);
      min-width: 50px;
      text-align: right;
    }

    .speed-buttons {
      display: flex;
      align-items: center;
      gap: 4px;
      background: var(--wall-tint, #f3f6f3);
      padding: 3px;
      border-radius: 6px;
      border: 1px solid var(--frame-soft, #c3d0c7);
    }

    .speed-btn {
      padding: 3px 7px;
      font-size: 11px;
      font-weight: 600;
      border: none;
      border-radius: 4px;
      background: transparent;
      color: var(--ink-soft, #3f4c45);
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover:not(.is-active) {
        color: var(--ink, #1c2621);
      }

      &.is-active {
        background: #ffffff;
        color: var(--pine, #17603e);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }
    }

    /* RIGHT COLUMN: HISTORY PANEL */
    .history-panel {
      display: flex;
      flex-direction: column;
      max-height: 600px;
    }

    .history-header {
      padding: 14px 18px;
      border-bottom: 1px solid var(--rule, #d8e0da);
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .history-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .history-title {
      margin: 0;
      font-size: 14px;
      font-weight: 700;
      color: var(--ink, #1c2621);
      display: flex;
      align-items: center;
      gap: 6px;

      .history-icon {
        font-size: 16px;
      }
    }

    .history-count-badge {
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 9999px;
      background: var(--wall-tint, #f3f6f3);
      border: 1px solid var(--frame-soft, #c3d0c7);
      color: var(--ink-soft, #3f4c45);
    }

    .history-subtitle {
      margin: 0;
      font-size: 11px;
      color: var(--ink-dim, #5a6660);
      line-height: 1.3;
    }

    .history-scroll-list {
      flex: 1;
      overflow-y: auto;
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-height: 240px;
    }

    .history-empty {
      padding: 24px 12px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      color: var(--ink-dim, #5a6660);

      .empty-icon {
        font-size: 28px;
        opacity: 0.7;
      }

      .empty-text {
        font-weight: 600;
        font-size: 13px;
        margin: 0;
        color: var(--ink-soft, #3f4c45);
      }

      .empty-hint {
        font-size: 11px;
        margin: 0;
        line-height: 1.4;
      }
    }

    .history-item {
      padding: 10px 12px;
      border-radius: 8px;
      background: var(--wall-tint, #f3f6f3);
      border: 1px solid var(--frame-soft, #c3d0c7);
      display: flex;
      flex-direction: column;
      gap: 8px;
      transition: all 0.15s ease;

      &.is-active {
        border-color: var(--pine, #17603e);
        background: #ffffff;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

        .item-badge {
          background: var(--pine, #17603e);
          color: #ffffff;
        }
      }
    }

    .item-meta {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .item-badge {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      background: var(--frame-soft, #c3d0c7);
      color: var(--ink, #1c2621);
    }

    .item-info {
      display: flex;
      flex-direction: column;
      gap: 1px;
      flex: 1;
      min-width: 0;
    }

    .item-label {
      font-size: 12px;
      font-weight: 700;
      color: var(--ink, #1c2621);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .item-steps {
      font-size: 10px;
      color: var(--ink-dim, #5a6660);
    }

    .item-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .history-btn {
      flex: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 5px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.15s ease;

      &.btn-replay {
        background: #ffffff;
        border-color: var(--frame-soft, #c3d0c7);
        color: var(--ink, #1c2621);

        &:hover {
          border-color: var(--pine, #17603e);
          color: var(--pine, #17603e);
        }
      }

      &.btn-restore {
        background: var(--wall-tint, #f3f6f3);
        border-color: var(--frame-soft, #c3d0c7);
        color: var(--ink-soft, #3f4c45);

        &:hover {
          background: #ffffff;
          border-color: var(--o, #8a6a12);
          color: var(--o, #8a6a12);
        }
      }
    }

    .history-footer {
      padding: 12px 14px;
      border-top: 1px solid var(--rule, #d8e0da);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .btn-copy-recipe {
      width: 100%;
      height: 38px;
      border-radius: 6px;
      background: var(--pine, #17603e);
      color: #ffffff;
      border: 1px solid var(--pine, #17603e);
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;

      .btn-icon {
        width: 14px;
        height: 14px;
      }

      &:hover:not(:disabled) {
        background: #124d31;
        border-color: #124d31;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .copied-feedback {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #ffffff;
      }

      .copy-default {
        display: flex;
        align-items: center;
        gap: 6px;
      }
    }

    .btn-clear-structure {
      background: transparent;
      border: none;
      color: #dc2626;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      padding: 4px;
      text-align: center;
      transition: color 0.15s ease;

      &:hover:not(:disabled) {
        color: #b91c1c;
        text-decoration: underline;
      }

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }

    /* DARK THEME STYLING OVERRIDES */
    :host-context([data-theme='dark']) {
      .card {
        background: var(--panel, #16221c);
        border-color: var(--frame-soft, #384d41);
      }

      .structure-pill {
        background: var(--wall-tint, #16241d);
        border-color: var(--frame-soft, #384d41);
        color: var(--ink, #e5ece7);

        &.is-active {
          background: var(--pine, #4edea3);
          border-color: var(--pine, #4edea3);
          color: #0f1713;

          .pill-complexity {
            background: rgba(0, 0, 0, 0.25);
            color: #0f1713;
          }
        }
      }

      .playback-bar {
        background: var(--panel, #16221c);
      }

      .ctrl {
        background: var(--wall-tint, #16241d);
        border-color: var(--frame-soft, #384d41);
        color: var(--ink, #e5ece7);

        &.play {
          background: var(--pine, #4edea3);
          border-color: var(--pine, #4edea3);
          color: #0f1713;

          &:hover:not(:disabled) {
            background: #6fe5b5;
          }
        }
      }

      .history-item {
        background: var(--wall-tint, #16241d);
        border-color: var(--frame-soft, #384d41);

        &.is-active {
          background: #1a2a22;
          border-color: var(--pine, #4edea3);
        }
      }

      .history-btn.btn-replay {
        background: #1a2a22;
        border-color: var(--frame-soft, #384d41);
        color: var(--ink, #e5ece7);
      }

      .history-btn.btn-restore {
        background: var(--wall-tint, #16241d);
        border-color: var(--frame-soft, #384d41);
        color: var(--ink-soft, #c3d0c7);
      }

      .btn-copy-recipe {
        background: var(--pine, #4edea3);
        border-color: var(--pine, #4edea3);
        color: #0f1713;

        &:hover:not(:disabled) {
          background: #6fe5b5;
          border-color: #6fe5b5;
        }
      }
    }
  `]
})
export class SandboxLabComponent {
  public readonly session = inject(SandboxSessionService);

  public readonly currentSpeed = signal<number>(1);
  public readonly speedOptions: readonly number[] = [0.5, 1, 2, 4];
  public readonly copied = signal<boolean>(false);
  private copyTimeout?: ReturnType<typeof setTimeout>;

  public readonly categories: readonly StructureCategory[] = [
    {
      title: 'Árvores Auto-Balanceáveis e Binárias',
      description: 'Hierarquias ordenadas com busca binária e rebalanceamento automático',
      items: [
        {
          type: 'avl-tree',
          label: 'Árvore AVL',
          badge: 'Auto-balanceável |FB| ≤ 1',
          complexity: 'O(log n)'
        },
        {
          type: 'bst',
          label: 'Árvore Binária (BST)',
          badge: 'Busca Binária Clássica',
          complexity: 'O(h)'
        },
        {
          type: 'red-black-tree',
          label: 'Árvore Rubro-Negra',
          badge: 'Balanceamento por Cores',
          complexity: 'O(log n)'
        }
      ]
    },
    {
      title: 'Estruturas Lineares e Associativas',
      description: 'Coleções contíguas, ligadas, restritas e tabelas com função de espalhamento',
      items: [
        {
          type: 'array',
          label: 'Array Dinâmico',
          badge: 'Acesso Indexado O(1)',
          complexity: 'O(1) / O(n)'
        },
        {
          type: 'linked-list',
          label: 'Lista Encadeada',
          badge: 'Nós Encadeados por Ponteiro',
          complexity: 'O(1) / O(n)'
        },
        {
          type: 'stack',
          label: 'Pilha (LIFO)',
          badge: 'Último a Entrar, Primeiro a Sair',
          complexity: 'O(1)'
        },
        {
          type: 'queue',
          label: 'Fila (FIFO)',
          badge: 'Primeiro a Entrar, Primeiro a Sair',
          complexity: 'O(1)'
        },
        {
          type: 'hash-map',
          label: 'Tabela Hash',
          badge: 'Espalhamento com Encadeamento',
          complexity: 'O(1) médio'
        },
        {
          type: 'graph',
          label: 'Grafo (BFS/DFS)',
          badge: 'Vértices e Arestas Adjacentes',
          complexity: 'O(V + E)'
        }
      ]
    }
  ];

  public readonly activeStructureLabel = computed<string>(() => {
    const currentType = this.session.structureType();
    for (const cat of this.categories) {
      const match = cat.items.find((item) => item.type === currentType);
      if (match) return match.label;
    }
    return currentType;
  });

  public readonly contextualTip = computed<string>(() => {
    const type = this.session.structureType();
    switch (type) {
      case 'avl-tree':
        return 'Dica: Clique diretamente em um nó da árvore para selecioná-lo para exclusão, busca ou rotação manual! O Fator de Balanceamento (|FB| ≤ 1) é recalculado após cada inserção ou exclusão.';
      case 'bst':
        return 'Dica: Clique diretamente em um nó da árvore para selecioná-lo para exclusão, busca ou rotação manual! Em sequências ordenadas, a BST degenera para O(n).';
      case 'red-black-tree':
        return 'Dica: Clique diretamente em um nó da árvore para inspecioná-lo! As propriedades rubro-negras mantêm a altura preta invariante, recolorindo ou rotacionando nós.';
      case 'array':
        return 'Dica: O acesso direto pelo índice é O(1). Inserções no início ou intermediárias exigem deslocamento dos elementos para a direita O(n).';
      case 'linked-list':
        return 'Dica: Inserção na cabeça (prepend) é O(1) pois atualiza apenas o ponteiro Head. Inserção na cauda ou busca exige percorrer O(n) nós.';
      case 'stack':
        return 'Dica: Estrutura LIFO (Last-In, First-Out). Todas as operações ocorrem exclusivamente no topo em tempo constante O(1).';
      case 'queue':
        return 'Dica: Estrutura FIFO (First-In, First-Out). Novos elementos entram pelo fim e saem pelo início em tempo constante O(1).';
      case 'hash-map':
        return 'Dica: A função hash calcula o bucket em tempo constante O(1). Em caso de colisões de chave, usamos encadeamento separado.';
      case 'graph':
        return 'Dica: Busca em Largura (BFS) explora vértices por níveis concêntricos usando uma fila FIFO. Selecione o vértice de partida na barra superior.';
      default:
        return 'Dica: Escolha uma operação na barra ou clique em um Preset didático para iniciar a animação passo a passo.';
    }
  });

  public selectStructure(type: SandboxStructureType): void {
    this.session.selectStructure(type);
  }

  public onTreeNodeClicked(node: { id: string; value: number }): void {
    this.session.selectedTreeNode.set(node);
  }

  public onReset(): void {
    const eng = this.session.engine();
    if (eng) {
      eng.reset();
    } else {
      this.session.goToStep(0);
    }
  }

  public onScrub(event: Event): void {
    const input = event.target as HTMLInputElement;
    const val = Number(input.value);
    if (!isNaN(val)) {
      this.session.goToStep(val);
    }
  }

  public setSpeed(speed: number): void {
    this.currentSpeed.set(speed);
    this.session.setSpeed(speed);
  }

  public async copyRecipe(): Promise<void> {
    const script = this.session.exportScriptString();
    if (!script) {
      return;
    }

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(script);
        this.copied.set(true);
        if (this.copyTimeout) {
          clearTimeout(this.copyTimeout);
        }
        this.copyTimeout = setTimeout(() => {
          this.copied.set(false);
        }, 2500);
      }
    } catch (err) {
      console.warn('Não foi possível copiar automaticamente para a área de transferência:', err);
    }
  }
}
