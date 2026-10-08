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
        aria-label="Visualização da Árvore Binária de Busca">
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
              [attr.transform]="'translate(' + node.x + ',' + node.y + ')'"
            >
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
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      min-height: 280px;
    }

    .tree-container {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
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
        transition: fill 0.2s ease, stroke 0.2s ease, transform 0.2s ease;
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
