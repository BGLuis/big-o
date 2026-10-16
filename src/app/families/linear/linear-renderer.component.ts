import {
  Component,
  input,
  computed,
  ChangeDetectionStrategy
} from '@angular/core';
import { LinearState, LinearElement, LinearAuxElement } from './linear-state';
import { LinearEvent, PointerInfo } from '../../engine/events';
import { LegendItem } from '../../content/content.types';

@Component({
  selector: 'app-linear-renderer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="renderer-container" role="region" aria-label="Quadro de visualização do algoritmo">
      <!-- Chalkboard Container -->
      <div class="chalkboard-container" [style.--col-count]="state().elements.length">
        <!-- Pointers Row (i, j) -->
        <div class="barrow pointer-row" aria-hidden="true">
          @for (el of state().elements; track el.id; let idx = $index) {
            <div class="pointer-slot">
              @if (pointersMap().get(idx); as ptr) {
                <span class="pointer-badge" [style.color]="ptr.color || 'var(--o-lt)'">
                  {{ ptr.label }}
                </span>
              }
            </div>
          }
        </div>

        <!-- Bars Row -->
        <div class="barrow bars-row" role="list" aria-label="Elementos do array">
          @for (el of state().elements; track el.id; let idx = $index) {
            <div class="bar-column" role="listitem">
              <div
                class="bar-item"
                [class.is-comparing]="el.state === 'comparing'"
                [class.is-swapping]="el.state === 'swapping'"
                [class.is-pivot]="el.state === 'pivot' || state().pivotId === el.id"
                [class.is-completed]="el.state === 'completed'"
                [class.is-highlighted]="el.state === 'highlighted'"
                [style.height.%]="getBarHeightPercent(el.value)"
                [attr.aria-label]="'Elemento ' + el.value + ' no índice ' + idx + ', estado: ' + el.state"
              ></div>
            </div>
          }
        </div>

        <!-- Values Row -->
        <div class="barrow values-row" aria-hidden="true">
          @for (el of state().elements; track el.id; let idx = $index) {
            <div
              class="value-slot"
              [class.is-comparing]="el.state === 'comparing'"
              [class.is-pivot]="el.state === 'pivot' || state().pivotId === el.id"
              [class.is-completed]="el.state === 'completed'"
            >
              {{ el.value }}
            </div>
          }
        </div>

        <!-- Legend Row -->
        <div class="legend-row" aria-label="Legenda das cores">
          @for (item of effectiveLegend(); track item.label) {
            <span class="legend-item">
              <span class="legend-box" [class]="item.colorClass" aria-hidden="true"></span>
              <span>{{ item.label }}</span>
            </span>
          }
        </div>
      </div>

      <!-- Auxiliary Buffer Section (for Merge Sort, Counting Sort, etc.) -->
      @if (state().auxElements && state().auxElements.length > 0) {
        <div class="aux-wrapper">
          @if (state().auxTitle) {
            <div class="aux-title">{{ state().auxTitle }}</div>
          }
          <div class="aux-cells-row">
            @for (aux of state().auxElements; track aux.id) {
              <div
                class="aux-cell-item"
                [class.is-comparing]="aux.state === 'comparing'"
                [class.is-completed]="aux.state === 'completed'"
              >
                <span class="aux-cell-val">{{ aux.value !== null ? aux.value : '-' }}</span>
                @if (aux.label) {
                  <span class="aux-cell-lbl">{{ aux.label }}</span>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .renderer-container {
      position: relative;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 12px;
      box-sizing: border-box;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    }

    /* Chalkboard Container */
    .chalkboard-container {
      background: var(--board, #26332c);
      border-radius: 14px 18px 14px 18px / 16px 14px 18px 14px;
      padding: 22px 22px 16px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      color: var(--chalk, #f4f1e6);
      width: 100%;
      box-sizing: border-box;
    }

    .barrow {
      display: grid;
      grid-template-columns: repeat(var(--col-count, 10), minmax(0, 1fr));
      gap: 12px;
      width: 100%;
      box-sizing: border-box;
    }

    /* Pointer Row */
    .pointer-row {
      height: 16px;
    }

    .pointer-slot {
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 16px;
    }

    .pointer-badge {
      font-family: var(--mono, 'IBM Plex Mono', monospace);
      font-size: 11px;
      font-weight: 600;
      line-height: 1;
    }

    /* Bars Row */
    .bars-row {
      height: 210px;
      align-items: end;
    }

    .bar-column {
      height: 100%;
      display: flex;
      align-items: flex-end;
      width: 100%;
    }

    .bar-item {
      width: 100%;
      background: #5c6d61;
      border-radius: 4px 4px 0 0;
      transition: height 0.25s ease-out, background-color 0.2s ease, border-color 0.2s ease;
      min-height: 12px;
      box-sizing: border-box;

      &.is-completed {
        background: #8ad9ab;
      }

      &.is-comparing {
        background: var(--o-lt, #e8c14a);
        box-shadow: 0 0 0 2px var(--chalk, #f4f1e6);
      }

      &.is-pivot {
        background: transparent;
        border: 1.5px dashed var(--coral-lt, #f0a99d);
      }

      &.is-swapping {
        background: #ec4899;
      }

      &.is-highlighted {
        background: var(--o-lt, #e8c14a);
      }
    }

    /* Values Row */
    .values-row {
      border-top: 1.5px dashed rgba(244, 241, 230, 0.28);
      padding-top: 8px;
    }

    .value-slot {
      text-align: center;
      font-family: var(--mono, 'IBM Plex Mono', monospace);
      font-size: 12px;
      color: var(--chalk-dim, #b7c2b9);
      transition: color 0.15s ease;

      &.is-comparing {
        font-weight: 700;
        color: var(--o-lt, #e8c14a);
      }

      &.is-pivot {
        font-weight: 700;
        color: var(--coral-lt, #f0a99d);
      }

      &.is-completed {
        color: #8ad9ab;
      }
    }

    /* Legend Row */
    .legend-row {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      padding-top: 2px;
      font-size: 11px;
      color: var(--chalk-dim, #b7c2b9);
      font-family: var(--sans, 'IBM Plex Sans', sans-serif);
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .legend-box {
      display: inline-block;
      width: 11px;
      height: 11px;
      border-radius: 3px;
      flex-shrink: 0;

      &.box-completed {
        background: #8ad9ab;
      }

      &.box-comparing {
        background: var(--o-lt, #e8c14a);
      }

      &.box-pivot {
        border: 1px dashed var(--coral-lt, #f0a99d);
        background: transparent;
      }

      &.box-normal {
        background: #5c6d61;
      }
    }

    /* Auxiliary Buffer */
    .aux-wrapper {
      padding: 10px 16px;
      background: var(--board-deep, #1f2a24);
      border-radius: 8px;
      border: 1px solid var(--frame-soft, #c3d0c7);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .aux-title {
      font-family: var(--mono, 'IBM Plex Mono', monospace);
      font-size: 11px;
      font-weight: 600;
      color: var(--chalk-soft, #d7ded6);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .aux-cells-row {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .aux-cell-item {
      min-width: 32px;
      height: 32px;
      border: 1.5px solid var(--edge, #6f7d74);
      border-radius: 6px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2px 6px;
      background: var(--board, #26332c);
      color: var(--chalk-soft, #d7ded6);
      font-family: var(--mono, 'IBM Plex Mono', monospace);
      font-size: 12px;

      &.is-comparing {
        border-color: var(--o-lt, #e8c14a);
        color: var(--o-lt, #e8c14a);
      }

      &.is-completed {
        border-color: #8ad9ab;
        color: #8ad9ab;
      }
    }

    .aux-cell-lbl {
      font-size: 9px;
      color: var(--chalk-dim, #b7c2b9);
    }
  `]
})
export class LinearRendererComponent {
  public readonly state = input.required<LinearState>();
  public readonly currentEvent = input<LinearEvent | null>(null);
  public readonly legend = input<readonly LegendItem[]>();

  protected readonly effectiveLegend = computed<readonly LegendItem[]>(() => {
    return (
      this.legend() ?? [
        { label: 'partição ≤ pivô', colorClass: 'box-completed' },
        { label: 'elemento em j', colorClass: 'box-comparing' },
        { label: 'pivô', colorClass: 'box-pivot' },
        { label: 'não visitado', colorClass: 'box-normal' }
      ]
    );
  });

  protected readonly pointersMap = computed<Map<number, PointerInfo>>(() => {
    const map = new Map<number, PointerInfo>();
    const ev = this.currentEvent();
    if (ev?.pointers) {
      for (const p of ev.pointers) {
        map.set(p.index, p);
      }
    }
    return map;
  });

  protected readonly maxValue = computed<number>(() => {
    const elements = this.state().elements;
    if (!elements || elements.length === 0) return 1;
    return Math.max(...elements.map((e) => e.value), 1);
  });

  protected getBarHeightPercent(val: number): number {
    const max = this.maxValue();
    return Math.max(14, Math.round((val / max) * 100));
  }
}
