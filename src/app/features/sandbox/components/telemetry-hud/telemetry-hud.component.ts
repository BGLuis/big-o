import {
  Component,
  input,
  computed,
  ChangeDetectionStrategy
} from '@angular/core';
import { TelemetrySnapshot } from '../../sandbox.types';

@Component({
  selector: 'app-telemetry-hud',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="telemetry-hud" role="region" aria-label="Placar de Eficiência em Tempo Real">
      <!-- HUD Title & Competitors Header -->
      <div class="hud-header">
        <div class="hud-title-badge">
          <svg class="hud-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          <h3 class="hud-title">Placar de Eficiência em Tempo Real</h3>
        </div>
        <div class="hud-competitors-header">
          <span class="comp-badge comp-left">{{ leftTitle() }}</span>
          <span class="vs-text" aria-hidden="true">VS</span>
          <span class="comp-badge comp-right">{{ rightTitle() }}</span>
        </div>
      </div>

      <div class="hud-metrics-grid">
        <!-- 1. Comparações Realizadas -->
        <article class="metric-card" aria-labelledby="metric-comparisons-title">
          <div class="metric-header">
            <svg class="metric-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span id="metric-comparisons-title" class="metric-title">Comparações Realizadas</span>
            @if (comparisonsWinner() === 'left') {
              <span class="winner-tag tag-left">✓ Menos comparações ({{ leftTitle() }})</span>
            } @else if (comparisonsWinner() === 'right') {
              <span class="winner-tag tag-right">✓ Menos comparações ({{ rightTitle() }})</span>
            } @else if (leftTelemetry().comparisons > 0 && leftTelemetry().comparisons === rightTelemetry().comparisons) {
              <span class="winner-tag tag-tie">Empate</span>
            }
          </div>

          <div class="metric-values-row">
            <div class="val-box val-left" [class.is-winner]="comparisonsWinner() === 'left'">
              <span class="val-number">{{ leftTelemetry().comparisons }}</span>
              <span class="val-sub">{{ leftTitle() }}</span>
            </div>

            <div class="val-progress-wrapper" aria-hidden="true">
              <div class="proportional-bar-track">
                <div
                  class="proportional-bar bar-left"
                  [class.is-better]="comparisonsWinner() === 'left'"
                  [style.width.%]="compLeftPercent()"
                ></div>
                <div
                  class="proportional-bar bar-right"
                  [class.is-better]="comparisonsWinner() === 'right'"
                  [style.width.%]="compRightPercent()"
                ></div>
              </div>
            </div>

            <div class="val-box val-right" [class.is-winner]="comparisonsWinner() === 'right'">
              <span class="val-number">{{ rightTelemetry().comparisons }}</span>
              <span class="val-sub">{{ rightTitle() }}</span>
            </div>
          </div>
        </article>

        <!-- 2. Trocas / Rotações / Mutações -->
        <article class="metric-card" aria-labelledby="metric-swaps-title">
          <div class="metric-header">
            <svg class="metric-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="16 3 21 3 21 8" />
              <line x1="4" y1="20" x2="21" y2="3" />
              <polyline points="21 16 21 21 16 21" />
              <line x1="15" y1="15" x2="21" y2="21" />
            </svg>
            <span id="metric-swaps-title" class="metric-title">Trocas / Rotações / Mutações</span>
            @if (swapsWinner() === 'left') {
              <span class="winner-tag tag-left">✓ Menos mutações ({{ leftTitle() }})</span>
            } @else if (swapsWinner() === 'right') {
              <span class="winner-tag tag-right">✓ Menos mutações ({{ rightTitle() }})</span>
            } @else if (leftTelemetry().swapsOrMutations > 0 && leftTelemetry().swapsOrMutations === rightTelemetry().swapsOrMutations) {
              <span class="winner-tag tag-tie">Empate</span>
            }
          </div>

          <div class="metric-values-row">
            <div class="val-box val-left" [class.is-winner]="swapsWinner() === 'left'">
              <span class="val-number">{{ leftTelemetry().swapsOrMutations }}</span>
              <span class="val-sub">{{ leftTitle() }}</span>
            </div>

            <div class="val-progress-wrapper" aria-hidden="true">
              <div class="proportional-bar-track">
                <div
                  class="proportional-bar bar-left"
                  [class.is-better]="swapsWinner() === 'left'"
                  [style.width.%]="swapsLeftPercent()"
                ></div>
                <div
                  class="proportional-bar bar-right"
                  [class.is-better]="swapsWinner() === 'right'"
                  [style.width.%]="swapsRightPercent()"
                ></div>
              </div>
            </div>

            <div class="val-box val-right" [class.is-winner]="swapsWinner() === 'right'">
              <span class="val-number">{{ rightTelemetry().swapsOrMutations }}</span>
              <span class="val-sub">{{ rightTitle() }}</span>
            </div>
          </div>
        </article>

        <!-- 3. Métrica Estrutural -->
        <article class="metric-card" aria-labelledby="metric-structural-title">
          <div class="metric-header">
            <svg class="metric-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21.3 8.7 8.7 21.3c-.4.4-1 .4-1.4 0l-4.6-4.6c-.4-.4-.4-1 0-1.4L15.3 2.7c.4-.4 1-.4 1.4 0l4.6 4.6c.4.4.4 1 0 1.4z" />
              <line x1="9" y1="9" x2="11" y2="11" />
              <line x1="12" y1="6" x2="14" y2="8" />
              <line x1="6" y1="12" x2="8" y2="14" />
            </svg>
            <span id="metric-structural-title" class="metric-title">{{ leftTelemetry().structuralLabel }}</span>
            @if (structuralWinner() === 'left') {
              <span class="winner-tag tag-left">✓ Mais balanceado ({{ leftTitle() }})</span>
            } @else if (structuralWinner() === 'right') {
              <span class="winner-tag tag-right">✓ Mais balanceado ({{ rightTitle() }})</span>
            }
          </div>

          <div class="metric-values-row">
            <div class="val-box val-left" [class.is-winner]="structuralWinner() === 'left'">
              <span class="val-number">{{ leftTelemetry().structuralDepthOrSize }}</span>
              <span class="val-sub">{{ leftTitle() }}</span>
            </div>

            <div class="structural-info-wrapper">
              <div class="structural-comparison-text">
                <span class="struct-item">{{ leftTitle() }}: {{ leftTelemetry().structuralDepthOrSize }}</span>
                <span class="struct-divider" aria-hidden="true">·</span>
                <span class="struct-item">{{ rightTitle() }}: {{ rightTelemetry().structuralDepthOrSize }}</span>
              </div>
              @if (leftTelemetry().auxiliaryOps > 0 || rightTelemetry().auxiliaryOps > 0) {
                <div class="aux-ops-badge">
                  Escritas Auxiliares: {{ leftTelemetry().auxiliaryOps }} vs {{ rightTelemetry().auxiliaryOps }}
                </div>
              }
            </div>

            <div class="val-box val-right" [class.is-winner]="structuralWinner() === 'right'">
              <span class="val-number">{{ rightTelemetry().structuralDepthOrSize }}</span>
              <span class="val-sub">{{ rightTitle() }}</span>
            </div>
          </div>
        </article>

        <!-- 4. Progresso de Passos -->
        <article class="metric-card metric-card-steps" aria-labelledby="metric-steps-title">
          <div class="metric-header">
            <svg class="metric-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span id="metric-steps-title" class="metric-title">Progresso de Passos</span>
          </div>

          <div class="metric-values-row steps-row">
            <!-- Left Steps Box -->
            <div class="val-box val-left steps-box" [class.is-winner]="leftFinishedFirst()">
              <div class="steps-progress-header">
                <span class="val-number">{{ leftTelemetry().currentStep }} / {{ leftTelemetry().totalSteps }}</span>
                <span class="steps-pct">({{ leftStepPercent() }}%)</span>
              </div>
              <span class="val-sub">{{ leftTitle() }}</span>
              @if (leftFinishedFirst()) {
                <span class="finished-first-badge" role="status">Concluiu primeiro!</span>
              }
            </div>

            <div class="steps-visual-divider" aria-hidden="true">
              <div class="steps-bar-dual">
                <div class="step-line step-line-left" [style.width.%]="leftStepPercent()"></div>
                <div class="step-line step-line-right" [style.width.%]="rightStepPercent()"></div>
              </div>
            </div>

            <!-- Right Steps Box -->
            <div class="val-box val-right steps-box" [class.is-winner]="rightFinishedFirst()">
              <div class="steps-progress-header">
                <span class="val-number">{{ rightTelemetry().currentStep }} / {{ rightTelemetry().totalSteps }}</span>
                <span class="steps-pct">({{ rightStepPercent() }}%)</span>
              </div>
              <span class="val-sub">{{ rightTitle() }}</span>
              @if (rightFinishedFirst()) {
                <span class="finished-first-badge" role="status">Concluiu primeiro!</span>
              }
            </div>
          </div>
        </article>
      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .telemetry-hud {
      background: var(--panel, #ffffff);
      border: 1.5px solid var(--frame-soft, #c3d0c7);
      border-radius: 16px 24px 16px 24px / 22px 16px 24px 16px;
      padding: 16px 20px;
      color: var(--ink, #1c2621);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* Header */
    .hud-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      border-bottom: 1.5px solid var(--rule, #d8e0da);
      padding-bottom: 12px;
    }

    .hud-title-badge {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .hud-icon-svg {
      width: 18px;
      height: 18px;
      color: var(--pine, #17603e);
      flex-shrink: 0;
    }

    .hud-title {
      margin: 0;
      font-family: var(--sans, system-ui, sans-serif);
      font-size: 1.15rem;
      font-weight: 700;
      letter-spacing: -0.01em;
      color: var(--ink, #1c2621);
    }

    .hud-competitors-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: var(--mono, monospace);
      font-size: 0.85rem;
    }

    .comp-badge {
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: 600;
      background: var(--wall-tint, #f3f6f3);
      border: 1px solid var(--frame-soft, #c3d0c7);
      color: var(--ink-soft, #3f4c45);

      &.comp-left {
        color: var(--o, #8a6a12);
        background: rgba(138, 106, 18, 0.1);
        border-color: rgba(138, 106, 18, 0.3);
      }

      &.comp-right {
        color: var(--omega, #2160b0);
        background: rgba(33, 96, 176, 0.1);
        border-color: rgba(33, 96, 176, 0.3);
      }
    }

    .vs-text {
      font-size: 0.75rem;
      font-weight: 800;
      color: var(--ink-dim, #5a6660);
      letter-spacing: 0.05em;
    }

    /* Grid */
    .hud-metrics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;

      @media (max-width: 840px) {
        grid-template-columns: 1fr;
      }
    }

    .metric-card {
      background: var(--wall-tint, #f3f6f3);
      border: 1.5px solid var(--frame-soft, #c3d0c7);
      border-radius: 12px;
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      box-sizing: border-box;
      transition: border-color 0.2s ease;

      &.metric-card-steps {
        grid-column: 1 / -1;
      }
    }

    .metric-header {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .metric-icon-svg {
      width: 15px;
      height: 15px;
      color: var(--ink-dim, #5a6660);
      flex-shrink: 0;
    }

    .metric-title {
      font-family: var(--sans, system-ui, sans-serif);
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--ink, #1c2621);
      flex: 1;
    }

    .winner-tag {
      font-family: var(--sans, system-ui, sans-serif);
      font-size: 0.72rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 9999px;

      &.tag-left,
      &.tag-right {
        background: rgba(23, 96, 62, 0.12);
        border: 1px solid var(--pine, #17603e);
        color: var(--pine, #17603e);
      }

      &.tag-tie {
        background: rgba(111, 125, 116, 0.12);
        border: 1px solid var(--edge, #6f7d74);
        color: var(--ink-dim, #5a6660);
      }
    }

    /* Values Row */
    .metric-values-row {
      display: grid;
      grid-template-columns: 110px 1fr 110px;
      align-items: center;
      gap: 12px;

      @media (max-width: 580px) {
        grid-template-columns: 1fr;
        text-align: center;
      }
    }

    .val-box {
      display: flex;
      flex-direction: column;
      padding: 6px 10px;
      border-radius: 8px;
      background: var(--panel, #ffffff);
      border: 1.5px solid var(--frame-soft, #c3d0c7);
      transition: all 0.2s ease;

      &.val-left {
        text-align: left;
      }

      &.val-right {
        text-align: right;
      }

      &.is-winner {
        border-color: var(--pine, #17603e);
        background: rgba(23, 96, 62, 0.08);

        .val-number {
          color: var(--pine, #17603e);
        }
      }
    }

    .val-number {
      font-family: var(--mono, monospace);
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--ink, #1c2621);
      line-height: 1.2;
    }

    .val-sub {
      font-size: 0.72rem;
      color: var(--ink-dim, #5a6660);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Proportional Bar */
    .val-progress-wrapper {
      display: flex;
      align-items: center;
      width: 100%;
    }

    .proportional-bar-track {
      width: 100%;
      height: 12px;
      background: var(--rule, #d8e0da);
      border-radius: 9999px;
      overflow: hidden;
      display: flex;
      border: 1px solid var(--frame-soft, #c3d0c7);
    }

    .proportional-bar {
      height: 100%;
      transition: width 0.3s ease-out, background-color 0.2s ease;

      &.bar-left {
        background: var(--o-lt, #e8c14a);
      }

      &.bar-right {
        background: var(--omega, #2160b0);
      }

      &.is-better {
        background: var(--pine, #17603e) !important;
      }
    }

    /* Structural Info */
    .structural-info-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      text-align: center;
    }

    .structural-comparison-text {
      font-family: var(--mono, monospace);
      font-size: 0.8rem;
      color: var(--ink-soft, #3f4c45);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .struct-divider {
      color: var(--ink-dim, #5a6660);
    }

    .aux-ops-badge {
      font-family: var(--mono, monospace);
      font-size: 0.72rem;
      color: var(--ink-dim, #5a6660);
      background: var(--panel, #ffffff);
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid var(--frame-soft, #c3d0c7);
    }

    /* Steps Progress & Badge */
    .steps-row {
      grid-template-columns: 180px 1fr 180px;

      @media (max-width: 700px) {
        grid-template-columns: 1fr;
      }
    }

    .steps-box {
      position: relative;
      gap: 4px;
    }

    .steps-progress-header {
      display: flex;
      align-items: baseline;
      gap: 6px;
    }

    .steps-pct {
      font-family: var(--mono, monospace);
      font-size: 0.75rem;
      color: var(--ink-dim, #5a6660);
    }

    .steps-visual-divider {
      width: 100%;
      padding: 0 8px;
      box-sizing: border-box;
    }

    .steps-bar-dual {
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 100%;
    }

    .step-line {
      height: 6px;
      border-radius: 9999px;
      background: var(--rule, #d8e0da);
      transition: width 0.25s ease-out;

      &.step-line-left {
        background: var(--o-lt, #e8c14a);
      }

      &.step-line-right {
        background: var(--omega, #2160b0);
      }
    }

    .finished-first-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--pine, #17603e);
      background: rgba(23, 96, 62, 0.1);
      border: 1px solid var(--pine, #17603e);
      padding: 2px 6px;
      border-radius: 4px;
      margin-top: 4px;
      width: fit-content;
    }

    @keyframes pulseGlow {
      0%, 100% {
        transform: scale(1);
        box-shadow: 0 0 8px rgba(78, 222, 163, 0.4);
      }
      50% {
        transform: scale(1.03);
        box-shadow: 0 0 14px rgba(78, 222, 163, 0.7);
      }
    }
  `]
})
export class TelemetryHudComponent {
  public readonly leftTitle = input.required<string>();
  public readonly rightTitle = input.required<string>();
  public readonly leftTelemetry = input.required<TelemetrySnapshot>();
  public readonly rightTelemetry = input.required<TelemetrySnapshot>();

  protected readonly comparisonsWinner = computed<'left' | 'right' | 'tie' | 'none'>(() => {
    const left = this.leftTelemetry().comparisons;
    const right = this.rightTelemetry().comparisons;
    if (left === 0 && right === 0) return 'none';
    if (left < right) return 'left';
    if (right < left) return 'right';
    return 'tie';
  });

  protected readonly swapsWinner = computed<'left' | 'right' | 'tie' | 'none'>(() => {
    const left = this.leftTelemetry().swapsOrMutations;
    const right = this.rightTelemetry().swapsOrMutations;
    if (left === 0 && right === 0) return 'none';
    if (left < right) return 'left';
    if (right < left) return 'right';
    return 'tie';
  });

  protected readonly structuralWinner = computed<'left' | 'right' | 'none'>(() => {
    const label = this.leftTelemetry().structuralLabel;
    const left = this.leftTelemetry().structuralDepthOrSize;
    const right = this.rightTelemetry().structuralDepthOrSize;
    if (label.toLowerCase().includes('altura')) {
      if (left > 0 && right > 0 && left < right) return 'left';
      if (left > 0 && right > 0 && right < left) return 'right';
    }
    return 'none';
  });

  protected readonly compLeftPercent = computed<number>(() => {
    const left = this.leftTelemetry().comparisons;
    const right = this.rightTelemetry().comparisons;
    const total = left + right;
    if (total === 0) return 50;
    return Math.round((left / total) * 100);
  });

  protected readonly compRightPercent = computed<number>(() => {
    return 100 - this.compLeftPercent();
  });

  protected readonly swapsLeftPercent = computed<number>(() => {
    const left = this.leftTelemetry().swapsOrMutations;
    const right = this.rightTelemetry().swapsOrMutations;
    const total = left + right;
    if (total === 0) return 50;
    return Math.round((left / total) * 100);
  });

  protected readonly swapsRightPercent = computed<number>(() => {
    return 100 - this.swapsLeftPercent();
  });

  protected readonly leftStepPercent = computed<number>(() => {
    const { currentStep, totalSteps } = this.leftTelemetry();
    if (totalSteps <= 0) return 0;
    return Math.min(100, Math.round((currentStep / totalSteps) * 100));
  });

  protected readonly rightStepPercent = computed<number>(() => {
    const { currentStep, totalSteps } = this.rightTelemetry();
    if (totalSteps <= 0) return 0;
    return Math.min(100, Math.round((currentStep / totalSteps) * 100));
  });

  protected readonly leftFinishedFirst = computed<boolean>(() => {
    const left = this.leftTelemetry();
    const right = this.rightTelemetry();
    if (!left.isCompleted) return false;
    if (!right.isCompleted) return true;
    return left.totalSteps < right.totalSteps;
  });

  protected readonly rightFinishedFirst = computed<boolean>(() => {
    const left = this.leftTelemetry();
    const right = this.rightTelemetry();
    if (!right.isCompleted) return false;
    if (!left.isCompleted) return true;
    return right.totalSteps < left.totalSteps;
  });
}
