import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TreeState } from './tree-state';
import { HierarchicalEvent } from '../../engine/events';
import { computeTreeLayout, TreeLayoutResult } from './tree-layout';

@Component({
  selector: 'app-tree-renderer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tree-container">
      <svg
        class="tree-svg"
        [attr.viewBox]="viewBox()"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Visualização de Árvore Binária">
        <!-- Edges Layer -->
        <g class="edges-layer">
          @for (edge of layout().edges; track edge.id) {
            <line
              class="tree-edge"
              [attr.x1]="edge.x1"
              [attr.y1]="edge.y1"
              [attr.x2]="edge.x2"
              [attr.y2]="edge.y2"
            />
          }
        </g>

        <!-- Nodes Layer -->
        <g class="nodes-layer">
          @for (node of layout().nodes; track node.id) {
            <g
              class="node-group"
              [class.node-comparing]="node.state === 'comparing'"
              [class.node-highlighted]="node.state === 'highlighted'"
              [class.node-inserted]="node.state === 'inserted'"
              [class.node-matched]="node.state === 'matched'"
              [class.node-deleted]="node.state === 'deleted'"
              [class.node-balance-target]="node.state === 'balance-target'"
              [class.node-red]="node.color === 'red'"
              [class.node-black]="node.color === 'black'"
              [attr.transform]="'translate(' + node.x + ',' + node.y + ')'"
              (click)="nodeClicked.emit({ id: node.id, value: node.value })"
            >
              @if (node.balanceFactor !== undefined) {
                <!-- Balance Factor Pill/Badge -->
                <g class="bf-badge-group" [attr.transform]="'translate(0, ' + (-node.radius - 8) + ')'">
                  <rect
                    class="bf-badge-bg"
                    x="-20"
                    y="-8"
                    width="40"
                    height="16"
                    rx="8"
                  />
                  <text
                    class="bf-badge-text"
                    text-anchor="middle"
                    dominant-baseline="central"
                  >
                    BF: {{ node.balanceFactor >= 0 ? '+' : '' }}{{ node.balanceFactor }}
                  </text>
                </g>
              }

              <circle
                class="node-circle"
                r="0"
                [attr.r]="node.radius"
              />
              <text
                class="node-label"
                text-anchor="middle"
                dominant-baseline="central"
              >
                {{ node.value }}
              </text>
            </g>
          }
        </g>
      </svg>

      @if (state().traversalOutput && state().traversalOutput!.length > 0) {
        <div class="traversal-buffer" aria-label="Ordem de visita">
          <span class="buffer-label">Saída:</span>
          <div class="buffer-items">
            @for (val of state().traversalOutput; track $index) {
              <span class="buffer-chip">{{ val }}</span>
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
      min-height: 280px;
      position: relative;
    }

    .tree-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      position: relative;
      background: var(--board, #26332c);
      border-radius: 14px 18px 14px 18px / 16px 14px 18px 14px;
      padding: 16px;
      box-sizing: border-box;
      color: var(--chalk, #f4f1e6);
    }

    .tree-svg {
      width: 100%;
      height: 100%;
      max-height: 100%;
      display: block;
    }

    .tree-edge {
      stroke: var(--edge, #6f7d74);
      stroke-width: 2.5;
      stroke-linecap: round;
      transition: all 0.25s ease;
    }

    .node-group {
      transition: transform 0.3s ease;
      cursor: default;

      .node-circle {
        fill: var(--board-deep, #1f2a24);
        stroke: var(--chalk-soft, #d7ded6);
        stroke-width: 2.5;
        transition: fill 0.2s ease, stroke 0.2s ease, transform 0.2s ease, filter 0.2s ease;
      }

      .node-label {
        fill: var(--chalk, #f4f1e6);
        font-family: var(--mono, 'IBM Plex Mono', monospace);
        font-size: 0.85rem;
        font-weight: 700;
        pointer-events: none;
        user-select: none;
      }

      &.node-comparing .node-circle {
        fill: var(--o-lt, #e8c14a);
        stroke: var(--chalk, #f4f1e6);
        filter: drop-shadow(0 0 6px rgba(232, 193, 74, 0.6));
      }

      &.node-comparing .node-label {
        fill: #1c2621;
      }

      &.node-highlighted .node-circle {
        fill: var(--coral-lt, #f0a99d);
        stroke: #ffffff;
        filter: drop-shadow(0 0 8px rgba(240, 169, 157, 0.7));
      }

      &.node-highlighted .node-label {
        fill: #1c2621;
      }

      &.node-inserted .node-circle {
        fill: #8ad9ab;
        stroke: #ffffff;
        filter: drop-shadow(0 0 8px rgba(138, 217, 171, 0.6));
      }

      &.node-inserted .node-label {
        fill: #1c2621;
      }

      &.node-matched .node-circle {
        fill: #8ad9ab;
        stroke: #ffffff;
        filter: drop-shadow(0 0 10px rgba(138, 217, 171, 0.8));
      }

      &.node-matched .node-label {
        fill: #1c2621;
      }

      &.node-deleted .node-circle {
        fill: #ef4444;
        stroke: #fca5a5;
        opacity: 0.5;
        filter: drop-shadow(0 0 6px rgba(239, 68, 68, 0.7));
      }

      &.node-balance-target .node-circle {
        fill: #c084fc;
        stroke: #f3e8ff;
        filter: drop-shadow(0 0 8px rgba(192, 132, 252, 0.8));
      }

      &.node-red .node-circle {
        fill: #dc2626;
        stroke: #f87171;
        filter: drop-shadow(0 0 6px rgba(220, 38, 38, 0.6));
      }

      &.node-red .node-label {
        fill: #ffffff;
      }

      &.node-black .node-circle {
        fill: #0f172a;
        stroke: var(--edge, #6f7d74);
      }

      &.node-black .node-label {
        fill: var(--chalk, #f4f1e6);
      }
    }

    .bf-badge-bg {
      fill: rgba(31, 42, 36, 0.9);
      stroke: var(--o-lt, #e8c14a);
      stroke-width: 1;
    }

    .bf-badge-text {
      fill: var(--o-lt, #e8c14a);
      font-family: var(--mono, 'IBM Plex Mono', monospace);
      font-size: 0.65rem;
      font-weight: 700;
    }

    .traversal-buffer {
      position: absolute;
      bottom: 12px;
      left: 16px;
      right: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      background: rgba(31, 42, 36, 0.85);
      border: 1px solid var(--frame-soft, #c3d0c7);
      border-radius: 9999px;
      backdrop-filter: blur(8px);
      z-index: 5;
      overflow-x: auto;
    }

    .buffer-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--chalk-dim, #b7c2b9);
      font-weight: 700;
      white-space: nowrap;
    }

    .buffer-items {
      display: flex;
      gap: 6px;
      align-items: center;
    }

    .buffer-chip {
      padding: 2px 8px;
      border-radius: 9999px;
      background: var(--board-deep, #1f2a24);
      color: var(--o-lt, #e8c14a);
      border: 1px solid var(--edge, #6f7d74);
      font-family: var(--mono, 'IBM Plex Mono', monospace);
      font-size: 0.8rem;
      font-weight: 700;
      white-space: nowrap;
      animation: chipPop 0.2s ease-out;
    }

    @keyframes chipPop {
      0% {
        transform: scale(0.6);
        opacity: 0;
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }
  `]
})
export class TreeRendererComponent implements OnInit, OnDestroy {
  private readonly elementRef = inject(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  public readonly state = input.required<TreeState>();
  public readonly currentEvent = input<HierarchicalEvent | null>(null);
  public readonly nodeClicked = output<{ id: string; value: number }>();

  protected readonly containerWidth = signal<number>(600);
  protected readonly containerHeight = signal<number>(360);

  private resizeObserver?: ResizeObserver;

  public readonly layout = computed<TreeLayoutResult>(() => {
    return computeTreeLayout(this.state(), this.containerWidth(), this.containerHeight());
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
