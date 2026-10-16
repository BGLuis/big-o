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
      <!-- 1. SELETOR DE ESTRUTURA DO LABORATÓRIO (COMPACTO & ELEGANTE) -->
      <section class="card category-selector-card" aria-label="Seletor de Estrutura de Dados">
        <div class="selector-header">
          <div class="selector-title-col">
            <span class="tagline">Laboratório Interativo · Estrutura Única</span>
            <h2 class="selector-title hand">Estrutura de Dados em Foco</h2>
          </div>
          <span class="active-structure-pill mono">
            Ativa: <strong>{{ activeStructureLabel() }}</strong>
          </span>
        </div>

        <div class="categories-row">
          @for (cat of categories; track cat.title) {
            <div class="category-group" role="region" [attr.aria-label]="cat.title">
              <span class="cat-label">{{ cat.title }}</span>
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

            <!-- Dica contextual didática com SVG limpo -->
            <div class="contextual-tip-banner" role="note" aria-label="Dica didática contextual">
              <svg class="tip-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
                <path d="M9 18h6" />
                <path d="M10 22h4" />
              </svg>
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
                title="Resetar para o passo inicial (passo 0)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M1 4v6h6M23 20v-6h-6" />
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
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
                  <polygon points="19 20 9 12 19 4 19 20" />
                  <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" stroke-width="2" />
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
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                } @else {
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <polygon points="6 4 20 12 6 20 6 4" />
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
                  <polygon points="5 4 19 12 5 20 5 4" />
                  <line x1="20" y1="5" x2="20" y2="19" stroke="currentColor" stroke-width="2" />
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
                <svg class="history-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 14 14" />
                </svg>
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
                <svg class="empty-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M10 2v7.31M14 2v7.31M8.5 2h7M14 9.3a6.5 6.5 0 1 1-4 0" />
                  <path d="M5.52 16h12.96" />
                </svg>
                <p class="empty-text">Nenhuma operação realizada ainda.</p>
                <p class="empty-hint">
                  Insira novos valores, execute buscas ou carregue um preset didático.
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
                      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <polygon points="6 4 20 12 6 20 6 4" />
                      </svg>
                      <span>Rever</span>
                    </button>
                    <button
                      type="button"
                      class="history-btn btn-restore"
                      (click)="session.restoreToHistoryIndex(idx)"
                      title="Restaurar a estrutura para o estado exato após esta operação"
                      aria-label="Restaurar estrutura para este ponto após {{ record.label }}"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <polyline points="1 4 1 10 7 10" />
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                      </svg>
                      <span>Voltar</span>
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
              class="btn-copy-recipe"
              (click)="copyRecipe()"
              [disabled]="session.history().length === 0"
              aria-label="Copiar receita de comandos executados para a área de transferência"
            >
              @if (copied()) {
                <span class="copied-feedback">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Copiado!</span>
                </span>
              } @else {
                <span class="copy-default">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  <span>Copiar Receita</span>
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
    :host { display: block; width: 100%; }

    .sandbox-lab-page {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-bottom: 24px;
    }

    .card {
      background: var(--panel);
      border: 1.5px solid var(--frame-soft);
      border-radius: 16px 24px 16px 24px / 22px 16px 24px 16px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
    }

    button, input[type="range"] {
      &:focus-visible { outline: 2px solid var(--pine); outline-offset: 2px; }
      &:disabled { opacity: 0.45; cursor: not-allowed; }
    }

    .tip-text, .empty-text, .empty-hint, .history-subtitle, .history-title, .selector-title { margin: 0; }
    .cat-label, .pill-complexity, .item-badge, .item-steps, .scrubber-counter { font-family: var(--mono); }

    /* 1. SELETOR DE ESTRUTURA */
    .category-selector-card {
      padding: 14px 18px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .selector-header, .history-title-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .selector-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--ink);
      line-height: 1;
    }

    .active-structure-pill, .history-count-badge {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 9999px;
      background: var(--wall-tint);
      border: 1px solid var(--frame-soft);
      color: var(--ink-soft);
      strong { color: var(--pine); }
    }

    .categories-row {
      display: flex;
      flex-wrap: wrap;
      gap: 14px;
      align-items: flex-start;
    }

    .category-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
      min-width: 260px;
    }

    .cat-label {
      font-size: 11px;
      font-weight: 700;
      color: var(--ink-dim);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .pills-row, .telemetry-chips, .playback-buttons {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
    }

    .structure-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 11px;
      border-radius: 8px;
      background: var(--wall-tint);
      border: 1.5px solid var(--frame-soft);
      color: var(--ink);
      font-size: 12.5px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover:not(.is-active) {
        border-color: var(--pine);
        background: var(--panel);
      }

      &.is-active {
        background: var(--pine);
        border-color: var(--pine);
        color: #ffffff;

        .pill-complexity {
          background: rgba(255, 255, 255, 0.22);
          color: #ffffff;
        }
      }
    }

    .pill-complexity {
      font-size: 10px;
      padding: 1px 5px;
      border-radius: 3px;
      background: rgba(0, 0, 0, 0.06);
      color: var(--ink-dim);
    }

    .toolbar-section, .quiz-container { width: 100%; }

    /* 4. MAIN GRID */
    .lab-main-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
      align-items: start;

      @media (min-width: 1060px) {
        grid-template-columns: 1fr 340px;
      }
    }

    .canvas-card {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-height: 480px;
      justify-content: space-between;
    }

    .chalkboard-header {
      padding: 10px 16px;
      background: var(--wall-tint);
      border-bottom: 1.5px solid var(--rule);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .telemetry-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 8px;
      background: var(--panel);
      border: 1px solid var(--frame-soft);
      border-radius: 6px;
      font-size: 11.5px;
      color: var(--ink-soft);

      &.highlight {
        border-color: var(--pine);
        background: rgba(23, 96, 62, 0.08);
        color: var(--pine);
        .chip-val { color: var(--pine); }
      }
    }

    .chip-val {
      font-weight: 700;
      color: var(--ink);
    }

    .contextual-tip-banner {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-size: 12px;
      color: var(--ink-soft);
      background: var(--panel);
      padding: 7px 11px;
      border-radius: 6px;
      border: 1px solid var(--frame-soft);
      border-left: 3px solid var(--o-lt);
      line-height: 1.4;
    }

    .tip-icon-svg, .history-icon-svg {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
    }

    .tip-icon-svg {
      color: var(--o);
      margin-top: 1px;
    }

    .canvas-viewport {
      min-height: 380px;
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 16px;
      position: relative;
      overflow: hidden;
    }

    .narration-bar, .playback-bar {
      padding: 11px 18px;
      border-top: 1.5px solid var(--rule);
      background: var(--panel);
      display: flex;
    }

    .narration-bar {
      gap: 10px;
      align-items: baseline;
    }

    .narration-step {
      font-size: 20px;
      color: var(--pine);
      white-space: nowrap;
    }

    .narration-text {
      font-size: 13.5px;
      color: var(--ink-soft);
      line-height: 1.45;
      flex: 1;
    }

    .playback-bar {
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
    }

    .ctrl {
      width: 42px;
      height: 42px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 11px 15px 12px 14px / 14px 12px 15px 11px;
      background: var(--panel);
      border: 1.5px solid var(--edge);
      color: var(--pine);
      cursor: pointer;
      transition: all 0.15s ease;

      svg { width: 18px; height: 18px; }
      &:hover:not(:disabled) { background: var(--wall-tint); }

      &.play {
        background: var(--pine);
        border-color: var(--pine);
        color: #ffffff;
        &:hover:not(:disabled) { background: var(--pine-strong); }
      }
    }

    .scrubber-wrapper {
      flex: 1;
      min-width: 160px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    %lab-thumb {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: var(--pine);
      border: 2px solid #ffffff;
      cursor: pointer;
    }

    .scrubber-range {
      flex: 1;
      height: 8px;
      border-radius: 4px;
      appearance: none;
      background: linear-gradient(to right, var(--pine) var(--scrubber-fill, 0%), var(--rule) 0);
      cursor: pointer;
      outline: none;

      &::-webkit-slider-thumb {
        appearance: none;
        @extend %lab-thumb;
      }
      &::-moz-range-thumb {
        @extend %lab-thumb;
      }
    }

    .scrubber-counter {
      font-size: 12px;
      font-weight: 600;
      color: var(--ink-dim);
      min-width: 52px;
      text-align: right;
    }

    .speed-buttons {
      display: flex;
      align-items: center;
      gap: 3px;
      background: var(--wall-tint);
      padding: 3px;
      border-radius: 8px;
      border: 1px solid var(--frame-soft);
    }

    .speed-btn {
      padding: 4px 8px;
      font-size: 11px;
      font-weight: 600;
      border: none;
      background: transparent;
      color: var(--ink-soft);
      cursor: pointer;
      transition: 0.15s ease;

      &.is-active {
        background: var(--panel);
        color: var(--pine);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
      }
    }

    /* RIGHT COLUMN: HISTORY PANEL */
    .history-panel {
      display: flex;
      flex-direction: column;
      min-height: 480px;
    }

    .history-header, .history-footer {
      padding: 12px 16px;
      display: flex;
    }

    .history-header {
      border-bottom: 1.5px solid var(--rule);
      flex-direction: column;
      gap: 4px;
    }

    .history-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--ink);
      display: flex;
      align-items: center;
      gap: 7px;
    }

    .history-icon-svg { color: var(--pine); }

    .history-subtitle {
      font-size: 11.5px;
      color: var(--ink-dim);
      line-height: 1.35;
    }

    .history-scroll-list {
      flex: 1;
      overflow-y: auto;
      padding: 10px 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      max-height: 420px;
    }

    .history-empty {
      padding: 32px 16px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: var(--ink-dim);

      svg { width: 32px; height: 32px; }
      .empty-text { font-weight: 600; color: var(--ink); }
      .empty-hint { max-width: 240px; }
    }

    .history-item {
      padding: 8px 12px;
      border-radius: 10px;
      border: 1.5px solid var(--frame-soft);
      background: var(--panel);
      display: flex;
      flex-direction: column;
      gap: 6px;
      transition: all 0.15s ease;

      &.is-active {
        border-color: var(--pine);
        background: var(--wall-tint);
      }
    }

    .item-meta, .item-actions, .copy-default, .copied-feedback {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .item-badge, .item-steps { font-size: 11px; }
    .item-badge { font-weight: 700; color: var(--pine); }
    .item-label { font-size: 13px; font-weight: 600; color: var(--ink); }
    .item-steps { color: var(--ink-dim); }
    .item-actions { justify-content: flex-end; }

    .item-info {
      flex: 1;
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 6px;
    }

    .history-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 9px;
      border-radius: 6px;
      font-size: 11.5px;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid var(--frame-soft);
      background: var(--panel);
      color: var(--ink-soft);
      transition: all 0.15s ease;

      svg { width: 12px; height: 12px; }

      &:hover {
        background: var(--wall-tint);
        color: var(--pine);
        border-color: var(--pine);
      }

      &.btn-restore:hover {
        color: var(--omega);
        border-color: var(--omega);
      }
    }

    .history-footer {
      border-top: 1.5px solid var(--rule);
      gap: 8px;
      align-items: center;
    }

    .btn-copy-recipe,
    .btn-clear-structure {
      flex: 1;
      height: 36px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      background: var(--panel);
    }

    .btn-copy-recipe {
      border: 1.5px solid var(--edge);
      color: var(--ink);
      svg { width: 14px; height: 14px; }

      &:hover:not(:disabled) {
        background: var(--wall-tint);
      }
    }

    .copied-feedback {
      color: var(--pine);
    }

    .btn-clear-structure {
      border: 1.5px solid #fca5a5;
      color: #b91c1c;

      &:hover:not(:disabled) {
        background: #fef2f2;
        border-color: #dc2626;
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
      title: 'Árvores Balanceadas & BST',
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
          label: 'Árvore BST',
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
      title: 'Estruturas Lineares & Hash',
      description: 'Coleções contíguas, ligadas, restritas e tabelas com função de espalhamento',
      items: [
        {
          type: 'array',
          label: 'Array',
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
          complexity: 'O(1)'
        },
        {
          type: 'graph',
          label: 'Grafo',
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
