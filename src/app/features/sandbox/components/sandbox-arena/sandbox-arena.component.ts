import {
  Component,
  signal,
  computed,
  input,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject
} from '@angular/core';
import { DualPlaybackCoordinator } from '../../../../engine/dual-playback-coordinator';
import { PlaybackEngine } from '../../../../engine/playback-engine';
import { computeTelemetry } from '../../../../engine/telemetry-tracker';
import { generateSortingArenaEvents } from '../../../../families/linear/algorithms/linear-sandbox.generator';
import { generateTreeBatchComparisonEvents } from '../../../../families/hierarchical/algorithms/tree-sandbox.generator';
import {
  createInitialLinearState,
  linearReducer,
  LinearState
} from '../../../../families/linear/linear-state';
import {
  createInitialTreeState,
  treeReducer,
  TreeState
} from '../../../../families/hierarchical/tree-state';
import { LinearRendererComponent } from '../../../../families/linear/linear-renderer.component';
import { TreeRendererComponent } from '../../../../families/hierarchical/tree-renderer.component';
import { TelemetryHudComponent } from '../telemetry-hud/telemetry-hud.component';
import { SANDBOX_PRESETS, generateDatasetByPreset } from '../../sandbox-presets.data';
import {
  ALL_ALGORITHM_CONTENTS,
  getAlgorithmContent,
  AlgorithmContent
} from '../../../../content';
import {
  ArenaCategory,
  DatasetPresetId,
  TelemetrySnapshot,
  TreeKind
} from '../../sandbox.types';
import { LinearEvent, HierarchicalEvent } from '../../../../engine/events';

@Component({
  selector: 'app-sandbox-arena',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LinearRendererComponent,
    TreeRendererComponent,
    TelemetryHudComponent
  ],
  template: `
    <div class="sandbox-arena" role="region" aria-label="Arena Comparativa de Algoritmos">
      <!-- 1. Seletor de Categoria da Arena -->
      <nav class="arena-category-nav" role="tablist" aria-label="Categoria da Arena">
        <button
          type="button"
          role="tab"
          class="cat-btn"
          [class.is-active]="category() === 'sorting'"
          [attr.aria-selected]="category() === 'sorting'"
          (click)="setCategory('sorting')"
        >
          <svg class="cat-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="6" y1="18" x2="18" y2="6" />
            <polyline points="10 6 18 6 18 14" />
            <line x1="6" y1="6" x2="18" y2="18" />
            <polyline points="14 18 6 18 6 10" />
          </svg>
          <span>Duelo de Ordenação</span>
        </button>
        <button
          type="button"
          role="tab"
          class="cat-btn"
          [class.is-active]="category() === 'trees'"
          [attr.aria-selected]="category() === 'trees'"
          (click)="setCategory('trees')"
        >
          <svg class="cat-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="5" r="3" />
            <circle cx="6" cy="19" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="12" y1="8" x2="6" y2="16" />
            <line x1="12" y1="8" x2="18" y2="16" />
          </svg>
          <span>Duelo de Árvores</span>
        </button>
      </nav>

      <!-- 2. Barra de Configuração do Duelo & Dados Compartilhados -->
      <section class="arena-config-card" aria-label="Configuração dos competidores e dados">
        <!-- Linha 1: Seletores dos Competidores e Inversão -->
        <div class="competitors-row">
          <div class="competitor-select-group left-group">
            <label for="left-algo-select" class="field-label">Competidor A (Esquerda):</label>
            <select
              id="left-algo-select"
              class="select-control"
              [value]="leftAlgoId()"
              (change)="onLeftAlgoChange($event)"
            >
              @for (opt of currentAlgorithmOptions(); track opt.id) {
                <option [value]="opt.id" [selected]="opt.id === leftAlgoId()">{{ opt.name }}</option>
              }
            </select>
          </div>

          <div class="swap-action-wrapper">
            <button
              type="button"
              class="btn-swap"
              (click)="swapSides()"
              aria-label="Inverter lados dos competidores"
              title="Inverter competidores"
            >
              <svg class="swap-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="16 3 21 3 21 8" />
                <line x1="4" y1="20" x2="21" y2="3" />
                <polyline points="8 21 3 21 3 16" />
                <line x1="20" y1="4" x2="3" y2="21" />
              </svg>
              <span class="swap-text">Inverter Lados</span>
            </button>
          </div>

          <div class="competitor-select-group right-group">
            <label for="right-algo-select" class="field-label">Competidor B (Direita):</label>
            <select
              id="right-algo-select"
              class="select-control"
              [value]="rightAlgoId()"
              (change)="onRightAlgoChange($event)"
            >
              @for (opt of currentAlgorithmOptions(); track opt.id) {
                <option [value]="opt.id" [selected]="opt.id === rightAlgoId()">{{ opt.name }}</option>
              }
            </select>
          </div>
        </div>

        <!-- Linha 2: Presets & Dados Customizados -->
        <div class="dataset-row">
          <div class="preset-field-group">
            <label for="preset-select" class="field-label">Presets Comparativos:</label>
            <select
              id="preset-select"
              class="select-control preset-select"
              (change)="onPresetChange($event)"
            >
              <option value="" disabled selected>Selecione um cenário pedagógico...</option>
              @for (p of availablePresets(); track p.id) {
                <option [value]="p.id">{{ p.badge }} — {{ p.title }}</option>
              }
            </select>
          </div>

          <div class="custom-data-field-group">
            <label for="custom-data-input" class="field-label">Dados Compartilhados:</label>
            <div class="input-actions-bar">
              <input
                id="custom-data-input"
                type="text"
                class="text-control"
                [value]="customDataText()"
                (input)="onCustomDataInput($event)"
                (keyup.enter)="applyCustomData()"
                placeholder="ex: 42, 15, 78, 23, 91, 11, 64, 37, 55, 19"
              />
              <button
                type="button"
                class="btn-action btn-apply"
                (click)="applyCustomData()"
              >
                Aplicar Dados
              </button>
              <button
                type="button"
                class="btn-action btn-random"
                (click)="randomSample()"
              >
                Sorteio Aleatório
              </button>
            </div>
          </div>
        </div>

        <!-- Linha 3 Opcional: Campos Extras para Árvores (Busca e Deleção) -->
        @if (category() === 'trees') {
          <div class="tree-ops-row">
            <div class="tree-subfield">
              <label for="tree-search-input" class="field-label">Pesquisar após montar (ex: 50, 70):</label>
              <input
                id="tree-search-input"
                type="text"
                class="text-control mini-control"
                [value]="treeSearchText()"
                (input)="onTreeSearchInput($event)"
                (keyup.enter)="applyCustomData()"
                placeholder="ex: 50, 70"
              />
            </div>

            <div class="tree-subfield">
              <label for="tree-delete-input" class="field-label">Excluir após montar (ex: 30):</label>
              <input
                id="tree-delete-input"
                type="text"
                class="text-control mini-control"
                [value]="treeDeleteText()"
                (input)="onTreeDeleteInput($event)"
                (keyup.enter)="applyCustomData()"
                placeholder="ex: 30"
              />
            </div>

            <button
              type="button"
              class="btn-action btn-tree-apply"
              (click)="applyCustomData()"
            >
              Atualizar Árvores
            </button>
          </div>
        }
      </section>

      <!-- 3. Quadros Visuais Lado a Lado (.arena-boards-grid) -->
      <section class="arena-boards-grid" aria-label="Visualização lado a lado dos competidores">
        <!-- Quadro Esquerdo (Competidor A) -->
        <article class="board-panel board-left" aria-labelledby="board-left-title">
          <header class="board-header">
            <div class="board-title-group">
              <h4 id="board-left-title" class="board-title">{{ leftTitle() }}</h4>
              <div class="board-complexity-badges">
                @if (leftContent()?.timeComplexity?.best; as bestComp) {
                  <span class="mono comp-badge comp-omega">{{ bestComp }}</span>
                }
                @if (leftContent()?.timeComplexity?.worst; as worstComp) {
                  <span class="mono comp-badge comp-o">{{ worstComp }}</span>
                }
              </div>
            </div>

            <div class="board-status-group">
              <span class="board-step-counter mono">Passo {{ leftStep() }} / {{ leftTotalSteps() }}</span>
              @if (leftCompleted()) {
                <span class="badge-completed">Concluído</span>
              }
            </div>
          </header>

          <div class="board-renderer-slot">
            @if (category() === 'sorting') {
              <app-linear-renderer
                [state]="leftLinearState()"
                [currentEvent]="leftLinearEvent()"
              />
            } @else {
              <app-tree-renderer
                [state]="leftTreeState()"
                [currentEvent]="leftTreeEvent()"
              />
            }
          </div>

          <footer class="board-narration" aria-live="polite" aria-atomic="true">
            <svg class="narration-speaker" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span class="narration-text">{{ leftNarration() }}</span>
          </footer>
        </article>

        <!-- Quadro Direito (Competidor B) -->
        <article class="board-panel board-right" aria-labelledby="board-right-title">
          <header class="board-header">
            <div class="board-title-group">
              <h4 id="board-right-title" class="board-title">{{ rightTitle() }}</h4>
              <div class="board-complexity-badges">
                @if (rightContent()?.timeComplexity?.best; as bestComp) {
                  <span class="mono comp-badge comp-omega">{{ bestComp }}</span>
                }
                @if (rightContent()?.timeComplexity?.worst; as worstComp) {
                  <span class="mono comp-badge comp-o">{{ worstComp }}</span>
                }
              </div>
            </div>

            <div class="board-status-group">
              <span class="board-step-counter mono">Passo {{ rightStep() }} / {{ rightTotalSteps() }}</span>
              @if (rightCompleted()) {
                <span class="badge-completed">Concluído</span>
              }
            </div>
          </header>

          <div class="board-renderer-slot">
            @if (category() === 'sorting') {
              <app-linear-renderer
                [state]="rightLinearState()"
                [currentEvent]="rightLinearEvent()"
              />
            } @else {
              <app-tree-renderer
                [state]="rightTreeState()"
                [currentEvent]="rightTreeEvent()"
              />
            }
          </div>

          <footer class="board-narration" aria-live="polite" aria-atomic="true">
            <svg class="narration-speaker" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span class="narration-text">{{ rightNarration() }}</span>
          </footer>
        </article>
      </section>

      <!-- 4. Controles de Reprodução Sincronizados (Master Controls) -->
      <section class="master-controls-card" aria-label="Controles sincronizados de reprodução">
        <div class="controls-toolbar">
          <div class="button-controls-group">
            <button
              type="button"
              class="btn-ctrl"
              (click)="resetDuel()"
              aria-label="Resetar Duelo"
              title="Resetar Duelo"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M1 4v6h6M23 20v-6h-6" />
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
              </svg>
            </button>
            <button
              type="button"
              class="btn-ctrl"
              (click)="stepBackward()"
              [disabled]="!canStepBackward()"
              aria-label="Passo Anterior (Ambos)"
              title="Passo Anterior"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
                <polygon points="19 20 9 12 19 4 19 20" />
                <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" stroke-width="2" />
              </svg>
            </button>
            <button
              type="button"
              class="btn-ctrl btn-play"
              (click)="togglePlay()"
              [attr.aria-label]="isPlaying() ? 'Pausar Duelo' : 'Play Simultâneo'"
              [title]="isPlaying() ? 'Pausar' : 'Play Simultâneo'"
            >
              @if (isPlaying()) {
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
            <button
              type="button"
              class="btn-ctrl"
              (click)="stepForward()"
              [disabled]="!canStepForward()"
              aria-label="Próximo Passo (Ambos)"
              title="Próximo Passo"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
                <polygon points="5 4 19 12 5 20 5 4" />
                <line x1="20" y1="5" x2="20" y2="19" stroke="currentColor" stroke-width="2" />
              </svg>
            </button>
          </div>

          <div class="scrubber-wrapper">
            <label for="master-scrubber" class="sr-only">Linha do tempo mestre do duelo</label>
            <input
              id="master-scrubber"
              type="range"
              class="master-scrubber"
              min="0"
              [max]="maxSteps()"
              [value]="currentStepIndex()"
              (input)="onScrubberChange($event)"
              [style.--scrubber-fill]="progressPercent() + '%'"
              aria-label="Progresso sincronizado do duelo"
            />
            <span class="scrubber-counter mono" aria-hidden="true">
              {{ currentStepIndex() }} / {{ maxSteps() }} ({{ progressPercent() }}%)
            </span>
          </div>

          <div class="speed-selector-group" role="group" aria-label="Velocidade da simulação">
            @for (s of speedOptions; track s) {
              <button
                type="button"
                class="btn-speed"
                [class.is-active]="currentSpeed() === s"
                [attr.aria-pressed]="currentSpeed() === s"
                (click)="setSpeed(s)"
              >
                {{ s }}x
              </button>
            }
          </div>
        </div>
      </section>

      <!-- 5. Placar Comparativo (<app-telemetry-hud>) -->
      <app-telemetry-hud
        [leftTitle]="leftTitle()"
        [rightTitle]="rightTitle()"
        [leftTelemetry]="leftTelemetry()"
        [rightTelemetry]="rightTelemetry()"
      />
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .sandbox-arena {
      display: flex;
      flex-direction: column;
      gap: 16px;
      width: 100%;
    }

    /* Common Interactive States */
    button, select, input {
      &:focus-visible {
        outline: 2px solid var(--pine, #17603e);
        outline-offset: 2px;
      }
      &:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }
    }

    /* 1. Category Tabs */
    .arena-category-nav {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .cat-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      border-radius: 12px 16px 12px 16px / 14px 12px 16px 14px;
      font-size: 0.92rem;
      font-weight: 600;
      cursor: pointer;
      border: 1.5px solid var(--frame-soft, #c3d0c7);
      background: var(--panel, #ffffff);
      color: var(--ink-soft, #3f4c45);
      transition: all 0.15s ease;

      &:hover {
        background: var(--wall-tint, #f3f6f3);
        border-color: var(--pine, #17603e);
        color: var(--ink, #1c2621);
      }

      &.is-active {
        background: var(--pine, #17603e);
        color: #ffffff;
        border-color: var(--pine, #17603e);
        box-shadow: 0 2px 8px rgba(23, 96, 62, 0.2);
      }
    }

    .cat-btn-icon, .swap-icon {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
    }

    /* 2. Config Card */
    .arena-config-card {
      background: var(--panel, #ffffff);
      border: 1.5px solid var(--frame-soft, #c3d0c7);
      border-radius: 16px 24px 16px 24px / 22px 16px 24px 16px;
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
    }

    .competitors-row {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: end;
      gap: 14px;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .competitor-select-group,
    .preset-field-group,
    .custom-data-field-group,
    .tree-subfield {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .field-label {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--ink-dim, #5a6660);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      font-family: var(--mono, monospace);
    }

    .select-control, .text-control {
      height: 40px;
      padding: 0 12px;
      border-radius: 10px;
      border: 1.5px solid var(--edge, #6f7d74);
      background: var(--panel, #ffffff);
      color: var(--ink, #1c2621);
      font-size: 0.9rem;
      font-weight: 600;
      outline: none;
      transition: border-color 0.15s ease;

      &:focus-visible {
        outline: 2px solid var(--pine, #17603e);
        outline-offset: 1px;
      }
    }

    .select-control { cursor: pointer; }

    .swap-action-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-swap, .btn-action {
      height: 40px;
      padding: 0 14px;
      border-radius: 10px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
      white-space: nowrap;
    }

    .btn-swap {
      border: 1.5px solid var(--edge, #6f7d74);
      background: var(--panel, #ffffff);
      color: var(--ink-soft, #3f4c45);

      &:hover {
        background: var(--wall-tint, #f3f6f3);
        color: var(--pine, #17603e);
        border-color: var(--pine, #17603e);
      }
    }

    .dataset-row {
      display: grid;
      grid-template-columns: 280px 1fr;
      align-items: end;
      gap: 14px;

      @media (max-width: 800px) {
        grid-template-columns: 1fr;
      }
    }

    .input-actions-bar {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
    }

    .text-control {
      flex: 1;
      min-width: 180px;
      font-family: var(--mono, monospace);
      font-size: 0.88rem;
    }

    .btn-action {
      border: 1.5px solid transparent;

      &.btn-apply,
      &.btn-tree-apply {
        background: var(--pine, #17603e);
        color: #ffffff;
        border-color: var(--pine, #17603e);

        &:hover {
          background: var(--pine-strong, #0f4a2f);
        }
      }

      &.btn-random {
        background: var(--panel, #ffffff);
        border-color: var(--edge, #6f7d74);
        color: var(--ink-soft, #3f4c45);

        &:hover {
          background: var(--wall-tint, #f3f6f3);
          color: var(--ink, #1c2621);
        }
      }
    }

    .tree-ops-row {
      display: grid;
      grid-template-columns: 1fr 1fr auto;
      align-items: end;
      gap: 12px;
      padding-top: 10px;
      border-top: 1px dashed var(--rule, #d8e0da);

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    /* 3. Boards Grid */
    .arena-boards-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
      }
    }

    .board-panel {
      background: var(--board, #26332c);
      border: 1.5px solid var(--rule, #2a3830);
      border-radius: 16px 24px 16px 24px / 22px 16px 24px 16px;
      padding: 18px 20px 14px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      min-height: 380px;

      &.board-left {
        border-top: 4px solid var(--o-lt, #e8c14a);
      }

      &.board-right {
        border-top: 4px solid var(--omega, #2160b0);
      }
    }

    .board-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
      border-bottom: 1px dashed rgba(244, 241, 230, 0.15);
      padding-bottom: 10px;
    }

    .board-title-group,
    .board-complexity-badges,
    .board-status-group {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .board-title {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--chalk, #f4f1e6);
    }

    .comp-badge {
      font-size: 0.8rem;
      font-weight: 600;
      padding: 2px 7px;
      border-radius: 4px;

      &.comp-omega {
        color: #93c5fd;
        background: rgba(33, 96, 176, 0.25);
        border: 1px solid rgba(147, 197, 253, 0.3);
      }

      &.comp-o {
        color: #fde047;
        background: rgba(138, 106, 18, 0.25);
        border: 1px solid rgba(253, 224, 71, 0.3);
      }
    }

    .board-step-counter {
      font-size: 0.82rem;
      color: var(--chalk-dim, #b7c2b9);
    }

    .badge-completed {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 9999px;
      background: rgba(28, 115, 80, 0.3);
      border: 1px solid var(--theta, #1c7350);
      color: #4edea3;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .board-renderer-slot {
      flex: 1;
      width: 100%;
      min-height: 280px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .board-narration {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: var(--board-deep, #1f2a24);
      border: 1px solid rgba(244, 241, 230, 0.12);
      border-radius: 8px;
      font-size: 0.85rem;
      color: var(--chalk-soft, #d7ded6);
      line-height: 1.35;
      min-height: 38px;
    }

    .narration-speaker {
      flex-shrink: 0;
      width: 16px;
      height: 16px;
      color: var(--o-lt, #e8c14a);
    }

    .narration-text {
      flex: 1;
    }

    /* 4. Master Controls */
    .master-controls-card {
      background: var(--panel, #ffffff);
      border: 1.5px solid var(--frame-soft, #c3d0c7);
      border-radius: 16px 24px 16px 24px / 22px 16px 24px 16px;
      padding: 12px 18px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
    }

    .controls-toolbar {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .button-controls-group {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .btn-ctrl {
      width: 42px;
      height: 42px;
      border-radius: 11px 15px 12px 14px / 14px 12px 15px 11px;
      border: 1.5px solid var(--edge, #6f7d74);
      background: var(--panel, #ffffff);
      color: var(--pine, #17603e);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;

      svg {
        width: 18px;
        height: 18px;
      }

      &:hover:not(:disabled) {
        background: var(--wall-tint, #f3f6f3);
      }

      &.btn-play {
        background: var(--pine, #17603e);
        color: #ffffff;
        border-color: var(--pine, #17603e);

        &:hover:not(:disabled) {
          background: var(--pine-strong, #0f4a2f);
        }
      }
    }

    .scrubber-wrapper {
      flex: 1;
      min-width: 200px;
      display: flex;
      align-items: center;
      gap: 12px;

      @media (max-width: 640px) {
        order: 3;
        width: 100%;
        flex-basis: 100%;
      }
    }

    %scrubber-thumb {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: var(--pine, #17603e);
      border: 2px solid var(--panel, #ffffff);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
      cursor: pointer;
    }

    .master-scrubber {
      flex: 1;
      height: 8px;
      border-radius: 4px;
      appearance: none;
      background: linear-gradient(to right, var(--pine, #17603e) var(--scrubber-fill, 0%), var(--rule, #d8e0da) 0);
      cursor: pointer;
      outline: none;

      &::-webkit-slider-thumb {
        appearance: none;
        @extend %scrubber-thumb;
      }

      &::-moz-range-thumb {
        @extend %scrubber-thumb;
      }
    }

    .scrubber-counter {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--ink-soft, #3f4c45);
      white-space: nowrap;
    }

    .speed-selector-group {
      display: flex;
      border-radius: 8px;
      overflow: hidden;
      border: 1.5px solid var(--frame-soft, #c3d0c7);
    }

    .btn-speed {
      height: 38px;
      padding: 0 10px;
      background: var(--wall, #ffffff);
      border: none;
      border-right: 1px solid var(--frame-soft, #c3d0c7);
      font-family: var(--mono, monospace);
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--ink-soft, #3f4c45);
      cursor: pointer;
      transition: 0.15s ease;

      &:last-child {
        border-right: none;
      }

      &:hover {
        background: var(--wall-tint, #f3f6f3);
      }

      &.is-active {
        background: var(--pine, #17603e);
        color: #ffffff;
      }
    }
  `]
})
export class SandboxArenaComponent implements OnInit, OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);

  // Inputs opcionais
  public readonly initialCategory = input<ArenaCategory>('sorting');
  public readonly initialLeftId = input<string>('heap-sort');
  public readonly initialRightId = input<string>('quick-sort');

  // Estado local gerenciado por Signals
  protected readonly category = signal<ArenaCategory>('sorting');
  protected readonly leftAlgoId = signal<string>('heap-sort');
  protected readonly rightAlgoId = signal<string>('quick-sort');
  protected readonly dataset = signal<number[]>([42, 15, 78, 23, 91, 11, 64, 37, 55, 19]);
  protected readonly customDataText = signal<string>('42, 15, 78, 23, 91, 11, 64, 37, 55, 19');
  protected readonly treeSearchText = signal<string>('');
  protected readonly treeDeleteText = signal<string>('');

  protected readonly leftEvents = signal<readonly (LinearEvent | HierarchicalEvent)[]>([]);
  protected readonly rightEvents = signal<readonly (LinearEvent | HierarchicalEvent)[]>([]);

  // Instância do coordenador mestre mantida em signal reativo
  protected readonly coordinator = signal<DualPlaybackCoordinator<any, any, any, any> | null>(null);
  private currentCoordinator: DualPlaybackCoordinator<any, any, any, any> | null = null;

  // Estados padrão seguros
  private readonly defaultLinearState: LinearState = createInitialLinearState([10, 20, 30]);
  private readonly defaultTreeState: TreeState = createInitialTreeState();

  // Opções de algoritmos
  protected readonly sortingOptions = [
    { id: 'quick-sort', name: 'Quick Sort' },
    { id: 'heap-sort', name: 'Heap Sort' },
    { id: 'merge-sort', name: 'Merge Sort' },
    { id: 'dual-pivot-quick-sort', name: 'Dual-Pivot QuickSort' },
    { id: 'timsort', name: 'Timsort' },
    { id: 'introsort', name: 'Introsort' },
    { id: 'bubble-sort', name: 'Bubble Sort' },
    { id: 'selection-sort', name: 'Selection Sort' },
    { id: 'insertion-sort', name: 'Insertion Sort' },
    { id: 'counting-sort', name: 'Counting Sort' },
    { id: 'radix-sort', name: 'Radix Sort' }
  ] as const;

  protected readonly treeOptions = [
    { id: 'bst', name: 'Árvore Binária de Busca (BST)' },
    { id: 'avl-tree', name: 'Árvore AVL (Auto-Balanceada)' },
    { id: 'red-black-tree', name: 'Árvore Rubro-Negra' }
  ] as const;

  protected readonly speedOptions = [0.5, 1, 2, 4] as const;

  protected readonly currentAlgorithmOptions = computed(() => {
    return this.category() === 'sorting' ? this.sortingOptions : this.treeOptions;
  });

  protected readonly availablePresets = computed(() => {
    const cat = this.category();
    if (cat === 'sorting') {
      return SANDBOX_PRESETS.filter((p) => p.category === 'sorting' || p.category === 'general');
    }
    return SANDBOX_PRESETS.filter((p) => p.category === 'tree');
  });

  // Metadados dos algoritmos selecionados
  protected readonly leftContent = computed<AlgorithmContent | undefined>(() => {
    return getAlgorithmContent(this.leftAlgoId());
  });

  protected readonly rightContent = computed<AlgorithmContent | undefined>(() => {
    return getAlgorithmContent(this.rightAlgoId());
  });

  protected readonly leftTitle = computed<string>(() => {
    const content = this.leftContent();
    if (content) return content.title;
    const found = this.currentAlgorithmOptions().find((o) => o.id === this.leftAlgoId());
    return found ? found.name : this.leftAlgoId();
  });

  protected readonly rightTitle = computed<string>(() => {
    const content = this.rightContent();
    if (content) return content.title;
    const found = this.currentAlgorithmOptions().find((o) => o.id === this.rightAlgoId());
    return found ? found.name : this.rightAlgoId();
  });

  // Passos e status dos competidores individuais
  protected readonly leftStep = computed<number>(() => {
    return this.coordinator()?.leftEngine.currentStepIndex() ?? 0;
  });

  protected readonly leftTotalSteps = computed<number>(() => {
    return this.coordinator()?.leftEngine.totalSteps() ?? 0;
  });

  protected readonly leftCompleted = computed<boolean>(() => {
    const step = this.leftStep();
    const total = this.leftTotalSteps();
    return total > 0 && step >= total;
  });

  protected readonly rightStep = computed<number>(() => {
    return this.coordinator()?.rightEngine.currentStepIndex() ?? 0;
  });

  protected readonly rightTotalSteps = computed<number>(() => {
    return this.coordinator()?.rightEngine.totalSteps() ?? 0;
  });

  protected readonly rightCompleted = computed<boolean>(() => {
    const step = this.rightStep();
    const total = this.rightTotalSteps();
    return total > 0 && step >= total;
  });

  // Narração individual
  protected readonly leftNarration = computed<string>(() => {
    const coord = this.coordinator();
    if (!coord) return 'Carregando duelo...';
    const ev = coord.leftEngine.currentEvent();
    if (ev?.narration) return ev.narration;
    if (this.leftCompleted()) return `${this.leftTitle()} concluiu a execução!`;
    return 'Pronto para iniciar.';
  });

  protected readonly rightNarration = computed<string>(() => {
    const coord = this.coordinator();
    if (!coord) return 'Carregando duelo...';
    const ev = coord.rightEngine.currentEvent();
    if (ev?.narration) return ev.narration;
    if (this.rightCompleted()) return `${this.rightTitle()} concluiu a execução!`;
    return 'Pronto para iniciar.';
  });

  // Estados dos renderizadores lineares
  protected readonly leftLinearState = computed<LinearState>(() => {
    const coord = this.coordinator();
    if (this.category() === 'sorting' && coord) {
      return (coord.leftEngine.currentState() as LinearState) ?? this.defaultLinearState;
    }
    return this.defaultLinearState;
  });

  protected readonly leftLinearEvent = computed<LinearEvent | null>(() => {
    const coord = this.coordinator();
    if (this.category() === 'sorting' && coord) {
      return (coord.leftEngine.currentEvent() as LinearEvent) ?? null;
    }
    return null;
  });

  protected readonly rightLinearState = computed<LinearState>(() => {
    const coord = this.coordinator();
    if (this.category() === 'sorting' && coord) {
      return (coord.rightEngine.currentState() as LinearState) ?? this.defaultLinearState;
    }
    return this.defaultLinearState;
  });

  protected readonly rightLinearEvent = computed<LinearEvent | null>(() => {
    const coord = this.coordinator();
    if (this.category() === 'sorting' && coord) {
      return (coord.rightEngine.currentEvent() as LinearEvent) ?? null;
    }
    return null;
  });

  // Estados dos renderizadores de árvores
  protected readonly leftTreeState = computed<TreeState>(() => {
    const coord = this.coordinator();
    if (this.category() === 'trees' && coord) {
      return (coord.leftEngine.currentState() as TreeState) ?? this.defaultTreeState;
    }
    return this.defaultTreeState;
  });

  protected readonly leftTreeEvent = computed<HierarchicalEvent | null>(() => {
    const coord = this.coordinator();
    if (this.category() === 'trees' && coord) {
      return (coord.leftEngine.currentEvent() as HierarchicalEvent) ?? null;
    }
    return null;
  });

  protected readonly rightTreeState = computed<TreeState>(() => {
    const coord = this.coordinator();
    if (this.category() === 'trees' && coord) {
      return (coord.rightEngine.currentState() as TreeState) ?? this.defaultTreeState;
    }
    return this.defaultTreeState;
  });

  protected readonly rightTreeEvent = computed<HierarchicalEvent | null>(() => {
    const coord = this.coordinator();
    if (this.category() === 'trees' && coord) {
      return (coord.rightEngine.currentEvent() as HierarchicalEvent) ?? null;
    }
    return null;
  });

  // Controles mestre do coordenador
  protected readonly isPlaying = computed<boolean>(() => this.coordinator()?.isPlaying() ?? false);
  protected readonly canStepForward = computed<boolean>(() => this.coordinator()?.canStepForward() ?? false);
  protected readonly canStepBackward = computed<boolean>(() => this.coordinator()?.canStepBackward() ?? false);
  protected readonly currentStepIndex = computed<number>(() => this.coordinator()?.currentStepIndex() ?? 0);
  protected readonly maxSteps = computed<number>(() => this.coordinator()?.maxSteps() ?? 0);
  protected readonly progressPercent = computed<number>(() => this.coordinator()?.progressPercent() ?? 0);
  protected readonly currentSpeed = computed<number>(() => this.coordinator()?.speed() ?? 1);

  // Telemetria em tempo real
  protected readonly leftTelemetry = computed<TelemetrySnapshot>(() => {
    const coord = this.coordinator();
    const engine = coord?.leftEngine;
    const events = this.leftEvents();
    const cat = this.category();
    const family = cat === 'sorting' ? 'linear' : 'hierarchical';

    if (!coord || !engine) {
      return {
        comparisons: 0,
        swapsOrMutations: 0,
        auxiliaryOps: 0,
        structuralDepthOrSize: 0,
        structuralLabel: cat === 'trees' ? 'Altura da Árvore' : 'Elementos (N)',
        currentStep: 0,
        totalSteps: events.length,
        isCompleted: false
      };
    }

    const step = engine.currentStepIndex();
    const state = engine.currentState();
    return computeTelemetry(events, step, state, family);
  });

  protected readonly rightTelemetry = computed<TelemetrySnapshot>(() => {
    const coord = this.coordinator();
    const engine = coord?.rightEngine;
    const events = this.rightEvents();
    const cat = this.category();
    const family = cat === 'sorting' ? 'linear' : 'hierarchical';

    if (!coord || !engine) {
      return {
        comparisons: 0,
        swapsOrMutations: 0,
        auxiliaryOps: 0,
        structuralDepthOrSize: 0,
        structuralLabel: cat === 'trees' ? 'Altura da Árvore' : 'Elementos (N)',
        currentStep: 0,
        totalSteps: events.length,
        isCompleted: false
      };
    }

    const step = engine.currentStepIndex();
    const state = engine.currentState();
    return computeTelemetry(events, step, state, family);
  });

  public ngOnInit(): void {
    if (this.initialCategory()) {
      this.category.set(this.initialCategory());
    }
    if (this.initialLeftId()) {
      this.leftAlgoId.set(this.initialLeftId());
    }
    if (this.initialRightId()) {
      this.rightAlgoId.set(this.initialRightId());
    }
    this.setupDuel();
  }

  public ngOnDestroy(): void {
    if (this.currentCoordinator) {
      this.currentCoordinator.destroy();
    }
  }

  // Ações de configuração
  protected setCategory(newCat: ArenaCategory): void {
    if (this.category() === newCat) return;
    this.category.set(newCat);

    if (newCat === 'sorting') {
      this.leftAlgoId.set('heap-sort');
      this.rightAlgoId.set('quick-sort');
      const defaultSortingPreset = SANDBOX_PRESETS.find((p) => p.id === 'random');
      const vals = defaultSortingPreset ? [...defaultSortingPreset.values] : [42, 15, 78, 23, 91, 11, 64, 37, 55, 19];
      this.dataset.set(vals);
      this.customDataText.set(vals.join(', '));
    } else {
      this.leftAlgoId.set('bst');
      this.rightAlgoId.set('avl-tree');
      const defaultTreePreset = SANDBOX_PRESETS.find((p) => p.id === 'degenerate-bst');
      const vals = defaultTreePreset ? [...defaultTreePreset.values] : [10, 20, 30, 40, 50, 60, 70];
      this.dataset.set(vals);
      this.customDataText.set(vals.join(', '));
    }

    this.setupDuel();
  }

  protected onLeftAlgoChange(event: Event): void {
    const sel = event.target as HTMLSelectElement;
    this.leftAlgoId.set(sel.value);
    this.setupDuel();
  }

  protected onRightAlgoChange(event: Event): void {
    const sel = event.target as HTMLSelectElement;
    this.rightAlgoId.set(sel.value);
    this.setupDuel();
  }

  protected swapSides(): void {
    const left = this.leftAlgoId();
    const right = this.rightAlgoId();
    this.leftAlgoId.set(right);
    this.rightAlgoId.set(left);
    this.setupDuel();
  }

  protected onPresetChange(event: Event): void {
    const sel = event.target as HTMLSelectElement;
    const presetId = sel.value as DatasetPresetId;
    const found = SANDBOX_PRESETS.find((p) => p.id === presetId);
    if (!found) return;

    this.dataset.set([...found.values]);
    this.customDataText.set(found.values.join(', '));

    if (found.recommendedLeft && found.recommendedRight) {
      this.leftAlgoId.set(found.recommendedLeft);
      this.rightAlgoId.set(found.recommendedRight);
    }

    this.setupDuel();
  }

  protected onCustomDataInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.customDataText.set(input.value);
  }

  protected onTreeSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.treeSearchText.set(input.value);
  }

  protected onTreeDeleteInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.treeDeleteText.set(input.value);
  }

  protected applyCustomData(): void {
    const parsed = this.parseNumbers(this.customDataText());
    if (parsed.length >= 2) {
      this.dataset.set(parsed);
      this.setupDuel();
    }
  }

  protected randomSample(): void {
    const randoms = generateDatasetByPreset('random', 10);
    this.customDataText.set(randoms.join(', '));
    this.dataset.set(randoms);
    this.setupDuel();
  }

  // Ações de reprodução
  protected resetDuel(): void {
    this.coordinator()?.reset();
  }

  protected stepBackward(): void {
    this.coordinator()?.stepBackward();
  }

  protected togglePlay(): void {
    this.coordinator()?.togglePlay();
  }

  protected stepForward(): void {
    this.coordinator()?.stepForward();
  }

  protected setSpeed(mult: number): void {
    this.coordinator()?.setSpeed(mult);
  }

  protected onScrubberChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const targetStep = Number(input.value);
    this.coordinator()?.goToStep(targetStep);
  }

  private parseNumbers(raw: string): number[] {
    if (!raw || !raw.trim()) return [];
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !isNaN(Number(s)))
      .map(Number);
  }

  private mapTreeIdToKind(id: string): TreeKind {
    if (id === 'avl-tree' || id === 'avl') return 'avl';
    if (id === 'red-black-tree' || id === 'rb') return 'rb';
    return 'bst';
  }

  private setupDuel(): void {
    if (this.currentCoordinator) {
      this.currentCoordinator.destroy();
    }

    const cat = this.category();
    const values = this.dataset();
    const leftId = this.leftAlgoId();
    const rightId = this.rightAlgoId();

    if (cat === 'sorting') {
      const leftEvs = generateSortingArenaEvents(leftId, values);
      const rightEvs = generateSortingArenaEvents(rightId, values);
      this.leftEvents.set(leftEvs);
      this.rightEvents.set(rightEvs);

      const leftInit = createInitialLinearState([...values]);
      const rightInit = createInitialLinearState([...values]);

      const leftEng = new PlaybackEngine<LinearState, LinearEvent>({
        initialState: leftInit,
        events: leftEvs,
        reducer: linearReducer
      });

      const rightEng = new PlaybackEngine<LinearState, LinearEvent>({
        initialState: rightInit,
        events: rightEvs,
        reducer: linearReducer
      });

      this.currentCoordinator = new DualPlaybackCoordinator({
        leftEngine: leftEng,
        rightEngine: rightEng,
        onStep: () => this.cdr.markForCheck()
      });
    } else {
      const searchTargets = this.parseNumbers(this.treeSearchText());
      const deleteTargets = this.parseNumbers(this.treeDeleteText());
      const leftKind = this.mapTreeIdToKind(leftId);
      const rightKind = this.mapTreeIdToKind(rightId);

      const leftEvs = generateTreeBatchComparisonEvents(values, leftKind, searchTargets, deleteTargets);
      const rightEvs = generateTreeBatchComparisonEvents(values, rightKind, searchTargets, deleteTargets);
      this.leftEvents.set(leftEvs);
      this.rightEvents.set(rightEvs);

      const leftInit = createInitialTreeState();
      const rightInit = createInitialTreeState();

      const leftEng = new PlaybackEngine<TreeState, HierarchicalEvent>({
        initialState: leftInit,
        events: leftEvs,
        reducer: treeReducer
      });

      const rightEng = new PlaybackEngine<TreeState, HierarchicalEvent>({
        initialState: rightInit,
        events: rightEvs,
        reducer: treeReducer
      });

      this.currentCoordinator = new DualPlaybackCoordinator({
        leftEngine: leftEng,
        rightEngine: rightEng,
        onStep: () => this.cdr.markForCheck()
      });
    }

    this.coordinator.set(this.currentCoordinator);
    this.cdr.markForCheck();
  }
}
