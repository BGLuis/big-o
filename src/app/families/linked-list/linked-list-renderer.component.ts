import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  computed,
  inject,
  input,
  signal,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LinkedListState } from './linked-list-state';
import { LinearEvent } from '../../engine/events';
import { computeLinkedListLayout, LinkedListLayoutResult } from './linked-list-layout';

@Component({
  selector: 'app-linked-list-renderer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="list-container">
      <svg
        class="list-svg"
        [attr.viewBox]="viewBox()"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Visualização da Lista Encadeada Simples">
        
        <defs>
          <marker
            id="list-arrowhead"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--color-primary, #818cf8)" />
          </marker>
          <marker
            id="list-head-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--color-accent, #38bdf8)" />
          </marker>
        </defs>

        <!-- HEAD Pointer -->
        @if (layout().headPointer; as hp) {
          <g class="head-pointer-group">
            <text
              [attr.x]="hp.textX"
              [attr.y]="hp.textY"
              text-anchor="middle"
              class="head-label"
            >
              CABEÇA
            </text>
            <line
              [attr.x1]="hp.textX"
              [attr.y1]="hp.textY + 4"
              [attr.x2]="hp.x"
              [attr.y2]="hp.y"
              class="head-arrow"
              marker-end="url(#list-head-arrow)"
            />
          </g>
        }

        <!-- Arrows Layer -->
        <g class="arrows-layer">
          @for (arrow of layout().arrows; track arrow.id) {
            <line
              class="list-arrow"
              [attr.x1]="arrow.x1"
              [attr.y1]="arrow.y1"
              [attr.x2]="arrow.x2"
              [attr.y2]="arrow.y2"
              marker-end="url(#list-arrowhead)"
            />
          }
        </g>

        <!-- Nodes Layer -->
        <g class="nodes-layer">
          @for (node of layout().nodes; track node.id) {
            <g
              class="node-box"
              [class.node-active]="node.state === 'active'"
              [class.node-highlighted]="node.state === 'highlighted'"
              [class.node-inserted]="node.state === 'inserted'"
              [attr.transform]="'translate(' + node.x + ',' + node.y + ')'"
            >
              <!-- Data Compartment -->
              <rect
                class="data-box"
                x="0"
                y="0"
                [attr.width]="node.dataWidth"
                [attr.height]="node.height"
                rx="6"
              />
              <text
                class="data-text"
                [attr.x]="node.dataWidth / 2"
                [attr.y]="node.height / 2"
                text-anchor="middle"
                dominant-baseline="central"
              >
                {{ node.value }}
              </text>

              <!-- Pointer Compartment -->
              <rect
                class="pointer-box"
                [attr.x]="node.dataWidth"
                y="0"
                [attr.width]="node.pointerWidth"
                [attr.height]="node.height"
                rx="6"
              />
              <circle
                class="pointer-bullet"
                [attr.cx]="node.dataWidth + node.pointerWidth / 2"
                [attr.cy]="node.height / 2"
                r="4"
              />
            </g>
          }
        </g>

        <!-- NULL Box -->
        @if (layout().nullBox; as nb) {
          <g
            class="null-group"
            [attr.transform]="'translate(' + nb.x + ',' + nb.y + ')'"
          >
            <rect
              class="null-box"
              x="0"
              y="0"
              [attr.width]="nb.width"
              [attr.height]="nb.height"
              rx="6"
            />
            <text
              class="null-text"
              [attr.x]="nb.width / 2"
              [attr.y]="nb.height / 2"
              text-anchor="middle"
              dominant-baseline="central"
            >
              NULO
            </text>
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
      min-height: 280px;
    }

    .list-container {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .list-svg {
      width: 100%;
      height: 100%;
      max-height: 100%;
      display: block;
    }

    .list-arrow {
      stroke: var(--color-primary, #818cf8);
      stroke-width: 2.5;
      stroke-linecap: round;
      transition: all 0.25s ease;
    }

    .head-arrow {
      stroke: var(--color-accent, #38bdf8);
      stroke-width: 2;
      stroke-linecap: round;
    }

    .head-label {
      fill: var(--color-accent, #38bdf8);
      font-family: var(--font-family-mono, monospace);
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    .node-box {
      transition: transform 0.3s ease;
      cursor: default;

      .data-box {
        fill: var(--color-bg-surface, #152031);
        stroke: var(--color-border, #64748b);
        stroke-width: 2;
        transition: all 0.2s ease;
      }

      .pointer-box {
        fill: var(--color-bg-surface-alt, #1f2a3c);
        stroke: var(--color-border, #64748b);
        stroke-width: 2;
        transition: all 0.2s ease;
      }

      .pointer-bullet {
        fill: var(--color-primary, #818cf8);
      }

      .data-text {
        fill: var(--color-text-main, #d8e3fb);
        font-family: var(--font-family-mono, monospace);
        font-size: 0.9rem;
        font-weight: 700;
        pointer-events: none;
        user-select: none;
      }

      &.node-active {
        .data-box,
        .pointer-box {
          border-color: var(--color-warning, #f59e0b);
          stroke: var(--color-warning, #f59e0b);
          filter: drop-shadow(0 0 6px rgba(245, 158, 11, 0.6));
        }

        .data-text {
          fill: var(--color-warning, #f59e0b);
        }
      }

      &.node-highlighted {
        .data-box,
        .pointer-box {
          stroke: var(--color-accent, #38bdf8);
          filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.7));
        }
      }

      &.node-inserted {
        .data-box,
        .pointer-box {
          stroke: var(--color-success, #10b981);
          filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.6));
        }
      }
    }

    .null-box {
      fill: var(--color-bg-surface-alt, #1f2a3c);
      stroke: var(--color-border, #64748b);
      stroke-width: 2;
      stroke-dasharray: 4 2;
    }

    .null-text {
      fill: var(--color-text-dim, #8b9bb4);
      font-family: var(--font-family-mono, monospace);
      font-size: 0.75rem;
      font-weight: 700;
    }
  `]
})
export class LinkedListRendererComponent implements OnInit, OnDestroy {
  private readonly elementRef = inject(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  public readonly state = input.required<LinkedListState>();
  public readonly currentEvent = input<LinearEvent | null>(null);

  protected readonly containerWidth = signal<number>(600);
  protected readonly containerHeight = signal<number>(300);

  private resizeObserver?: ResizeObserver;

  public readonly layout = computed<LinkedListLayoutResult>(() => {
    return computeLinkedListLayout(this.state(), this.containerWidth(), this.containerHeight());
  });

  public readonly viewBox = computed<string>(() => {
    return `0 0 ${this.layout().width} ${this.layout().height}`;
  });

  public ngOnInit(): void {
    if (this.isBrowser && typeof ResizeObserver !== 'undefined') {
      const el = this.elementRef.nativeElement as HTMLElement;
      this.resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            this.containerWidth.set(Math.round(width));
            this.containerHeight.set(Math.round(height));
          }
        }
      });
      this.resizeObserver.observe(el);
    }
  }

  public ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }
}
