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
    }

    .tree-svg {
      width: 100%;
      height: 100%;
      max-height: 100%;
      display: block;
    }

    .tree-edge {
      stroke: var(--color-border, #64748b);
      stroke-width: 2.5;
      stroke-linecap: round;
      transition: all 0.25s ease;
    }

    .node-group {
      transition: transform 0.3s ease;
      cursor: default;

      .node-circle {
        fill: var(--color-bg-surface, #152031);
        stroke: var(--color-primary, #818cf8);
        stroke-width: 2.5;
        transition: fill 0.2s ease, stroke 0.2s ease, transform 0.2s ease, filter 0.2s ease;
      }

      .node-label {
        fill: var(--color-text-main, #d8e3fb);
        font-family: var(--font-family-mono, monospace);
        font-size: 0.85rem;
        font-weight: 700;
        pointer-events: none;
        user-select: none;
      }

      &.node-comparing .node-circle {
        fill: var(--color-warning, #f59e0b);
        stroke: #ffffff;
        filter: drop-shadow(0 0 6px rgba(245, 158, 11, 0.6));
      }

      &.node-comparing .node-label {
        fill: #000000;
      }

      &.node-highlighted .node-circle {
        fill: var(--color-accent, #38bdf8);
        stroke: #ffffff;
        filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.7));
      }

      &.node-inserted .node-circle {
        fill: var(--color-success, #10b981);
        stroke: #ffffff;
        filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.6));
      }

      &.node-matched .node-circle {
        fill: #10b981;
        stroke: #a7f3d0;
        filter: drop-shadow(0 0 10px rgba(16, 185, 129, 0.8));
      }

      &.node-deleted .node-circle {
        fill: #ef4444;
        stroke: #fca5a5;
        opacity: 0.5;
        filter: drop-shadow(0 0 6px rgba(239, 68, 68, 0.7));
      }

      &.node-balance-target .node-circle {
        fill: #8b5cf6;
        stroke: #ede9fe;
        filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.8));
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
        stroke: #94a3b8;
      }

      &.node-black .node-label {
        fill: #f1f5f9;
      }
    }

    .bf-badge-bg {
      fill: rgba(15, 23, 42, 0.85);
      stroke: var(--color-accent, #38bdf8);
      stroke-width: 1;
    }

    .bf-badge-text {
      fill: #38bdf8;
      font-family: var(--font-family-mono, monospace);
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
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid var(--color-border, #334155);
      border-radius: 9999px;
      backdrop-filter: blur(8px);
      z-index: 5;
      overflow-x: auto;
    }

    .buffer-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #94a3b8;
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
      background: #1e293b;
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.3);
      font-family: var(--font-family-mono, monospace);
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
