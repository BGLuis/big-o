import {
  Component,
  input,
  computed,
  signal,
  ElementRef,
  inject,
  AfterViewInit,
  OnDestroy,
  ChangeDetectionStrategy,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LinearState, LinearElement, LinearAuxElement } from './linear-state';
import { computeLinearLayout, LinearLayoutResult } from './linear-layout';
import { LinearEvent } from '../../engine/events';
import { BoundingBox } from '../../engine/engine.types';

@Component({
  selector: 'app-linear-renderer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="renderer-container">
      <!-- Accessible Live Region for Screen Readers -->
      <div class="sr-only" aria-live="polite" aria-atomic="true">
        {{ currentEvent()?.narration }}
      </div>

      <svg
        class="linear-svg"
        [attr.viewBox]="viewBox()"
        [attr.width]="containerWidth()"
        [attr.height]="containerHeight()"
        role="region"
        aria-label="Visualização gráfica do array linear">
        <defs>
          <clipPath id="bar-clip">
            <rect x="0" y="0" width="100%" height="100%" rx="4" />
          </clipPath>
        </defs>

        <!-- Scope indicators if active -->
        @if (scopeBox(); as sBox) {
          <rect
            class="scope-highlight"
            [attr.x]="sBox.x"
            [attr.y]="sBox.y"
            [attr.width]="sBox.width"
            [attr.height]="sBox.height"
            rx="6"
            aria-hidden="true"
          />
        }

        <!-- Element Bars -->
        @for (item of renderedElements(); track item.element.id) {
          <g
            class="bar-group"
            [class.is-comparing]="item.element.state === 'comparing'"
            [class.is-swapping]="item.element.state === 'swapping'"
            [class.is-pivot]="item.element.state === 'pivot'"
            [class.is-completed]="item.element.state === 'completed'"
            [class.is-highlighted]="item.element.state === 'highlighted'"
            [style.transform]="'translate(' + item.box.x + 'px, ' + item.box.y + 'px)'"
            role="img"
            [attr.aria-label]="'Elemento com valor ' + item.element.value + ', estado: ' + item.element.state">
            <!-- Bar Rectangle -->
            <rect
              class="bar-rect"
              [attr.width]="item.box.width"
              [attr.height]="item.box.height"
              rx="4"
            />

            <!-- Value Label (inside / above bar if visible) -->
            @if (layoutResult().showValueLabels) {
              <text
                class="bar-value-text"
                [attr.x]="item.box.width / 2"
                [attr.y]="item.box.height > 26 ? 18 : -6"
                text-anchor="middle">
                {{ item.element.value }}
              </text>
            }

            <!-- Index Label (below bar) -->
            @if (layoutResult().showIndexLabels) {
              <text
                class="bar-index-text"
                [attr.x]="item.box.width / 2"
                [attr.y]="item.box.height + 18"
                text-anchor="middle"
                aria-hidden="true">
                {{ item.index }}
              </text>
            }
          </g>
        }

        <!-- Auxiliary Elements Section -->
        @if (layoutResult().hasAux) {
          <g class="aux-container">
            @if (state().auxTitle) {
              <text
                class="aux-title-text"
                [attr.x]="containerWidth() / 2"
                [attr.y]="layoutResult().auxTitleY"
                text-anchor="middle">
                {{ state().auxTitle }}
              </text>
            }

            @for (auxItem of renderedAuxElements(); track auxItem.element.id) {
              <g
                class="aux-cell-group"
                [class.is-comparing]="auxItem.element.state === 'comparing'"
                [class.is-swapping]="auxItem.element.state === 'swapping'"
                [class.is-pivot]="auxItem.element.state === 'pivot'"
                [class.is-completed]="auxItem.element.state === 'completed'"
                [class.is-highlighted]="auxItem.element.state === 'highlighted'"
                [style.transform]="'translate(' + auxItem.box.x + 'px, ' + auxItem.box.y + 'px)'"
                role="img"
                [attr.aria-label]="'Elemento auxiliar ' + (auxItem.element.value !== null ? auxItem.element.value : 'vazio')">
                <rect
                  class="aux-cell-rect"
                  [attr.width]="auxItem.box.width"
                  [attr.height]="auxItem.box.height"
                  rx="4"
                />
                <text
                  class="aux-cell-value"
                  [attr.x]="auxItem.box.width / 2"
                  [attr.y]="auxItem.box.height / 2 + 4"
                  text-anchor="middle">
                  {{ auxItem.element.value !== null ? auxItem.element.value : '-' }}
                </text>
                @if (auxItem.element.label !== undefined) {
                  <text
                    class="aux-cell-label"
                    [attr.x]="auxItem.box.width / 2"
                    [attr.y]="auxItem.box.height + 12"
                    text-anchor="middle">
                    {{ auxItem.element.label }}
                  </text>
                }
              </g>
            }
          </g>
        }
      </svg>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      min-height: 240px;
    }

    .renderer-container {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
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

    .linear-svg {
      display: block;
      user-select: none;
    }

    .scope-highlight {
      fill: var(--color-bg-active-link, rgba(99, 102, 241, 0.12));
      stroke: var(--color-border-active, #818cf8);
      stroke-width: 1.5;
      stroke-dasharray: 4 2;
    }

    .bar-group {
      transition: transform 0.25s ease-out;

      .bar-rect {
        fill: var(--color-primary, #6366f1);
        transition: fill 0.2s ease, height 0.2s ease;
      }

      .bar-value-text {
        fill: #ffffff;
        font-family: var(--font-family-mono, monospace);
        font-size: 11px;
        font-weight: 600;
      }

      .bar-index-text {
        fill: var(--color-text-muted, #94a3b8);
        font-family: var(--font-family-mono, monospace);
        font-size: 10px;
      }

      &.is-comparing .bar-rect {
        fill: var(--color-accent-warning, #ffb95f);
      }

      &.is-swapping .bar-rect {
        fill: #ec4899;
      }

      &.is-pivot .bar-rect {
        fill: var(--color-secondary, #c0c1ff);
      }

      &.is-completed .bar-rect {
        fill: var(--color-accent-success, #4edea3);
      }

      &.is-highlighted .bar-rect {
        fill: var(--color-primary-light, #818cf8);
      }
    }

    .aux-title-text {
      fill: var(--color-text-muted, #94a3b8);
      font-family: var(--font-family-mono, monospace);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .aux-cell-group {
      transition: transform 0.25s ease-out;

      .aux-cell-rect {
        fill: var(--color-bg-surface-alt, #1f2a3c);
        stroke: var(--color-border, #64748b);
        stroke-width: 1.5;
        transition: fill 0.2s ease, stroke 0.2s ease;
      }

      .aux-cell-value {
        fill: var(--color-text-main, #d8e3fb);
        font-family: var(--font-family-mono, monospace);
        font-size: 11px;
        font-weight: 600;
      }

      .aux-cell-label {
        fill: var(--color-text-muted, #94a3b8);
        font-family: var(--font-family-mono, monospace);
        font-size: 9px;
      }

      &.is-comparing .aux-cell-rect {
        fill: rgba(255, 185, 95, 0.25);
        stroke: var(--color-accent-warning, #ffb95f);
      }

      &.is-swapping .aux-cell-rect {
        fill: rgba(236, 72, 153, 0.25);
        stroke: #ec4899;
      }

      &.is-pivot .aux-cell-rect {
        fill: rgba(192, 193, 255, 0.25);
        stroke: var(--color-secondary, #c0c1ff);
      }

      &.is-completed .aux-cell-rect {
        fill: rgba(78, 222, 163, 0.25);
        stroke: var(--color-accent-success, #4edea3);
      }

      &.is-highlighted .aux-cell-rect {
        fill: rgba(129, 140, 248, 0.25);
        stroke: var(--color-primary-light, #818cf8);
      }
    }
  `]
})
export class LinearRendererComponent implements AfterViewInit, OnDestroy {
  private readonly hostRef = inject(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private resizeObserver: ResizeObserver | null = null;

  public readonly state = input.required<LinearState>();
  public readonly currentEvent = input<LinearEvent | null>(null);

  protected readonly containerWidth = signal<number>(600);
  protected readonly containerHeight = signal<number>(360);

  protected readonly viewBox = computed<string>(() => {
    return `0 0 ${this.containerWidth()} ${this.containerHeight()}`;
  });

  protected readonly layoutResult = computed<LinearLayoutResult>(() => {
    return computeLinearLayout(
      this.state(),
      this.containerWidth(),
      this.containerHeight()
    );
  });

  protected readonly renderedElements = computed<
    Array<{ element: LinearElement; box: BoundingBox; index: number }>
  >(() => {
    const layout = this.layoutResult();
    return this.state().elements.map((element, index) => {
      const box = layout.elementBoxes.get(element.id) ?? {
        x: 0,
        y: 0,
        width: layout.barWidth,
        height: 20
      };
      return { element, box, index };
    });
  });

  protected readonly renderedAuxElements = computed<
    Array<{ element: LinearAuxElement; box: BoundingBox; index: number }>
  >(() => {
    const layout = this.layoutResult();
    const aux = this.state().auxElements;
    if (!aux || aux.length === 0) return [];
    return aux.map((element, index) => {
      const box = layout.auxBoxes.get(element.id) ?? {
        x: 0,
        y: 0,
        width: 24,
        height: 24
      };
      return { element, box, index };
    });
  });

  protected readonly scopeBox = computed<BoundingBox | null>(() => {
    const scope = this.state().scope;
    if (!scope) return null;

    const rendered = this.renderedElements();
    if (scope.from >= rendered.length || scope.to < 0) return null;

    const startIdx = Math.max(0, scope.from);
    const endIdx = Math.min(rendered.length - 1, scope.to);

    const firstBox = rendered[startIdx]?.box;
    const lastBox = rendered[endIdx]?.box;

    if (!firstBox || !lastBox) return null;

    const padding = 6;
    const x = firstBox.x - padding;
    const width = lastBox.x + lastBox.width - firstBox.x + padding * 2;
    const y = 8;
    const totalHeight = this.layoutResult().hasAux
      ? this.layoutResult().mainAreaHeight
      : this.containerHeight();
    const height = Math.max(20, totalHeight - 16);

    return { x, y, width, height };
  });

  public ngAfterViewInit(): void {
    if (this.isBrowser && typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0) this.containerWidth.set(Math.round(width));
          if (height > 0) this.containerHeight.set(Math.round(height));
        }
      });
      this.resizeObserver.observe(this.hostRef.nativeElement);
    }
  }

  public ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }
}
