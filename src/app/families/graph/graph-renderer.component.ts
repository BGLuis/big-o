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
import { GraphState, GraphVertex, GraphEdge } from './graph-state';
import { GraphEvent } from '../../engine/events';

@Component({
  selector: 'app-graph-renderer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="graph-renderer-container">

      <svg
        class="graph-svg"
        [attr.viewBox]="viewBox()"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Visualização gráfica de Grafo e Busca em Largura (BFS)">
        
        <defs>
          <radialGradient id="vertex-visiting-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#cc5544" stop-opacity="0.8" />
            <stop offset="100%" stop-color="#cc5544" stop-opacity="0" />
          </radialGradient>
        </defs>

        <!-- Edges Layer -->
        <g class="edges-layer">
          @for (edge of renderedEdges(); track edge.id) {
            <line
              class="graph-edge"
              [class.is-traversed]="edge.state === 'traversed'"
              [attr.x1]="edge.x1"
              [attr.y1]="edge.y1"
              [attr.x2]="edge.x2"
              [attr.y2]="edge.y2"
            />
          }
        </g>

        <!-- Vertices Layer -->
        <g class="vertices-layer">
          @for (vertex of renderedVertices(); track vertex.id) {
            <g
              class="vertex-group"
              [class.is-visiting]="vertex.state === 'visiting'"
              [class.is-visited]="vertex.state === 'visited'"
              [class.is-in-queue]="vertex.state === 'in-queue'"
              [style.transform]="'translate(' + vertex.renderX + 'px, ' + vertex.renderY + 'px)'"
              role="img"
              [attr.aria-label]="'Vértice ' + vertex.label + ', estado: ' + vertex.state">
              
              @if (vertex.state === 'visiting') {
                <circle r="34" fill="url(#vertex-visiting-glow)" class="visiting-pulse" />
              }

              <circle
                class="vertex-circle"
                r="22"
              />
              <text
                class="vertex-label"
                text-anchor="middle"
                y="5">
                {{ vertex.label }}
              </text>
            </g>
          }
        </g>

        <!-- Info HUD at bottom of SVG -->
        <g class="graph-hud" [style.transform]="'translate(20px, ' + (containerHeight() - 50) + 'px)'">
          <!-- Queue Display -->
          <text class="hud-label" x="0" y="16">Fila FIFO (Fronteira):</text>
          <g transform="translate(140, 4)">
            @if (state().frontierQueue.length === 0) {
              <text class="hud-empty" x="0" y="12">(vazia)</text>
            } @else {
              @for (nodeId of state().frontierQueue; track nodeId; let idx = $index) {
                <rect [attr.x]="idx * 28" y="-4" width="24" height="20" rx="4" class="queue-pill-rect" />
                <text [attr.x]="idx * 28 + 12" y="11" text-anchor="middle" class="queue-pill-text">{{ nodeId }}</text>
              }
            }
          </g>

          <!-- Visited List Display -->
          <text class="hud-label" x="320" y="16">Visitados:</text>
          <text class="hud-visited-text" x="390" y="16">
            {{ state().visitedOrder.join(' -> ') || '(nenhum ainda)' }}
          </text>
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

    .graph-renderer-container {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      background: var(--board, #26332c);
      border-radius: var(--radius-md, 8px);
      border: 1px solid var(--grid, #334038);
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

    .graph-svg {
      width: 100%;
      height: 100%;
      display: block;
      user-select: none;
    }

    .graph-edge {
      stroke: var(--edge, #8b9bb4);
      stroke-width: 2.5;
      stroke-linecap: round;
      transition: stroke 0.25s ease, stroke-width 0.25s ease;

      &.is-traversed {
        stroke: var(--theta, #44aa77);
        stroke-width: 3.5;
      }
    }

    .vertex-group {
      transition: transform 0.25s ease-out;

      .vertex-circle {
        fill: var(--board-deep, #16221c);
        stroke: var(--chalk, #eceae2);
        stroke-width: 2.5;
        transition: fill 0.2s ease, stroke 0.2s ease;
      }

      .vertex-label {
        fill: var(--chalk, #eceae2);
        font-family: var(--font-family-mono, monospace);
        font-size: 14px;
        font-weight: 700;
      }

      &.is-in-queue .vertex-circle {
        fill: rgba(233, 180, 76, 0.25);
        stroke: var(--o-lt, #f4d38c);
        stroke-width: 3;
      }

      &.is-visiting .vertex-circle {
        fill: var(--coral, #cc5544);
        stroke: var(--coral-lt, #e8867a);
        stroke-width: 3.5;
      }

      &.is-visited .vertex-circle {
        fill: rgba(68, 170, 119, 0.35);
        stroke: var(--theta, #44aa77);
      }
    }

    .hud-label {
      fill: var(--chalk-dim, #a4ab9e);
      font-family: var(--font-family-mono, monospace);
      font-size: 11px;
      font-weight: 700;
    }

    .hud-empty {
      fill: var(--chalk-faint, #4e584f);
      font-family: var(--font-family-mono, monospace);
      font-size: 11px;
      font-style: italic;
    }

    .queue-pill-rect {
      fill: rgba(233, 180, 76, 0.25);
      stroke: var(--o-lt, #f4d38c);
      stroke-width: 1.5;
    }

    .queue-pill-text {
      fill: var(--chalk, #eceae2);
      font-family: var(--font-family-mono, monospace);
      font-size: 11px;
      font-weight: 700;
    }

    .hud-visited-text {
      fill: var(--theta, #44aa77);
      font-family: var(--font-family-mono, monospace);
      font-size: 12px;
      font-weight: 700;
    }
  `]
})
export class GraphRendererComponent implements OnInit, OnDestroy {
  private readonly hostRef = inject(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private resizeObserver: ResizeObserver | null = null;

  public readonly state = input.required<GraphState>();
  public readonly currentEvent = input<GraphEvent | null>(null);

  protected readonly containerWidth = signal<number>(600);
  protected readonly containerHeight = signal<number>(360);

  protected readonly viewBox = computed<string>(() => {
    return `0 0 ${this.containerWidth()} ${this.containerHeight()}`;
  });

  protected readonly scaleFactors = computed(() => {
    // Base coordinate space is 600x300 for vertices
    const baseW = 600;
    const baseH = 280;
    const scaleX = this.containerWidth() / baseW;
    const scaleY = (this.containerHeight() - 60) / baseH;
    return { scaleX, scaleY };
  });

  protected readonly renderedVertices = computed(() => {
    const { scaleX, scaleY } = this.scaleFactors();
    return this.state().vertices.map((v) => ({
      ...v,
      renderX: Math.round(v.x * scaleX),
      renderY: Math.round(v.y * scaleY)
    }));
  });

  protected readonly renderedEdges = computed(() => {
    const vMap = new Map(this.renderedVertices().map((v) => [v.id, v]));
    return this.state().edges.map((e) => {
      const vFrom = vMap.get(e.from);
      const vTo = vMap.get(e.to);
      return {
        id: e.id,
        state: e.state,
        x1: vFrom?.renderX ?? 0,
        y1: vFrom?.renderY ?? 0,
        x2: vTo?.renderX ?? 0,
        y2: vTo?.renderY ?? 0
      };
    });
  });

  public ngOnInit(): void {
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
