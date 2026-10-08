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
import { QueueState, QueueItem } from './queue-state';
import { QueueEvent } from '../../engine/events';

@Component({
  selector: 'app-queue-renderer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="queue-renderer-container">
      <div class="sr-only" aria-live="polite" aria-atomic="true">
        {{ currentEvent()?.narration }}
      </div>

      <svg
        class="queue-svg"
        [attr.viewBox]="viewBox()"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Visualização gráfica de Fila (FIFO)">
        
        <defs>
          <marker
            id="queue-arrow-marker"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--color-accent, #38bdf8)" />
          </marker>
        </defs>

        <!-- Horizontal Conveyor / Pipe Track -->
        <path
          class="queue-track"
          [attr.d]="trackPath()"
          fill="none"
          stroke="var(--color-border, #64748b)"
          stroke-width="3"
        />

        <!-- Empty indicator if 0 items -->
        @if (state().items.length === 0) {
          <text
            [attr.x]="containerWidth() / 2"
            [attr.y]="trackCenterY() + 5"
            text-anchor="middle"
            class="empty-label">
            (Fila Vazia)
          </text>
        }

        <!-- Flow Direction Indicators -->
        <g class="flow-indicator">
          <text [attr.x]="trackLeftX() - 10" [attr.y]="trackCenterY() - 36" text-anchor="middle" class="port-label">
            SAÍDA (DEQUEUE)
          </text>
          <text [attr.x]="trackRightX() + 10" [attr.y]="trackCenterY() - 36" text-anchor="middle" class="port-label">
            ENTRADA (ENQUEUE)
          </text>
        </g>

        <!-- Queue Items (aligned horizontally from front to rear) -->
        @for (item of renderedItems(); track item.id; let idx = $index) {
          <g
            class="queue-item-group"
            [class.is-enqueued]="item.state === 'enqueued'"
            [class.is-peeked]="item.state === 'peeked'"
            [class.is-active]="item.state === 'active'"
            [style.transform]="'translate(' + item.x + 'px, ' + item.y + 'px)'">
            <rect
              class="queue-item-rect"
              [attr.width]="itemWidth"
              [attr.height]="itemHeight"
              rx="6"
            />
            <text
              class="queue-item-text"
              [attr.x]="itemWidth / 2"
              [attr.y]="itemHeight / 2 + 5"
              text-anchor="middle">
              {{ item.value }}
            </text>
            <text
              class="queue-item-idx"
              [attr.x]="itemWidth / 2"
              [attr.y]="itemHeight + 16"
              text-anchor="middle">
              pos {{ idx }}
            </text>
          </g>
        }

        <!-- Front Pointer (pointing to first item) -->
        @if (frontPointerInfo(); as front) {
          <g class="pointer-group" [style.transform]="'translate(' + front.x + 'px, ' + front.y + 'px)'">
            <text class="pointer-text" x="0" y="-12" text-anchor="middle">
              INÍCIO (FRONT)
            </text>
            <line
              x1="0"
              y1="-8"
              x2="0"
              y2="10"
              stroke="var(--color-accent, #38bdf8)"
              stroke-width="2.5"
              marker-end="url(#queue-arrow-marker)"
            />
          </g>
        }

        <!-- Rear Pointer (pointing to last item) -->
        @if (rearPointerInfo(); as rear) {
          <g class="pointer-group" [style.transform]="'translate(' + rear.x + 'px, ' + rear.y + 'px)'">
            <text class="pointer-text" x="0" y="30" text-anchor="middle">
              FIM (REAR)
            </text>
            <line
              x1="0"
              y1="24"
              x2="0"
              y2="6"
              stroke="var(--color-secondary, #c0c1ff)"
              stroke-width="2.5"
              marker-end="url(#queue-arrow-marker)"
            />
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
      min-height: 260px;
    }

    .queue-renderer-container {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
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

    .queue-svg {
      width: 100%;
      height: 100%;
      display: block;
      user-select: none;
    }

    .queue-track {
      stroke-dasharray: 6 3;
    }

    .empty-label {
      fill: var(--color-text-dim, #8b9bb4);
      font-family: var(--font-family-mono, monospace);
      font-size: 13px;
    }

    .port-label {
      fill: var(--color-text-muted, #94a3b8);
      font-family: var(--font-family-mono, monospace);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    .queue-item-group {
      transition: transform 0.25s ease-out;

      .queue-item-rect {
        fill: var(--color-primary, #6366f1);
        stroke: var(--color-border-active, #818cf8);
        stroke-width: 1.5;
        transition: fill 0.2s ease;
      }

      .queue-item-text {
        fill: #ffffff;
        font-family: var(--font-family-mono, monospace);
        font-size: 14px;
        font-weight: 700;
      }

      .queue-item-idx {
        fill: var(--color-text-dim, #8b9bb4);
        font-family: var(--font-family-mono, monospace);
        font-size: 10px;
      }

      &.is-enqueued .queue-item-rect {
        fill: var(--color-accent-success, #4edea3);
      }

      &.is-peeked .queue-item-rect {
        fill: var(--color-accent-warning, #ffb95f);
      }

      &.is-active .queue-item-rect {
        fill: #ec4899;
      }
    }

    .pointer-group {
      transition: transform 0.25s ease-out;

      .pointer-text {
        fill: var(--color-accent, #38bdf8);
        font-family: var(--font-family-mono, monospace);
        font-size: 11px;
        font-weight: 700;
      }
    }
  `]
})
export class QueueRendererComponent implements OnInit, OnDestroy {
  private readonly hostRef = inject(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private resizeObserver: ResizeObserver | null = null;

  public readonly state = input.required<QueueState>();
  public readonly currentEvent = input<QueueEvent | null>(null);

  protected readonly containerWidth = signal<number>(600);
  protected readonly containerHeight = signal<number>(360);

  protected readonly itemWidth = 64;
  protected readonly itemHeight = 44;
  protected readonly itemGap = 10;

  protected readonly viewBox = computed<string>(() => {
    return `0 0 ${this.containerWidth()} ${this.containerHeight()}`;
  });

  protected readonly trackCenterY = computed<number>(() => this.containerHeight() / 2);
  protected readonly trackLeftX = computed<number>(() => Math.max(20, this.containerWidth() * 0.1));
  protected readonly trackRightX = computed<number>(() => Math.min(this.containerWidth() - 20, this.containerWidth() * 0.9));

  protected readonly trackPath = computed<string>(() => {
    const y = this.trackCenterY();
    const halfH = this.itemHeight / 2 + 10;
    const topY = y - halfH;
    const bottomY = y + halfH;
    const leftX = this.trackLeftX();
    const rightX = this.trackRightX();

    return `M ${leftX} ${topY} L ${rightX} ${topY} M ${leftX} ${bottomY} L ${rightX} ${bottomY}`;
  });

  protected readonly renderedItems = computed(() => {
    const items = this.state().items;
    const count = items.length;
    const totalW = count * this.itemWidth + Math.max(0, count - 1) * this.itemGap;
    const startX = Math.max(this.trackLeftX() + 20, (this.containerWidth() - totalW) / 2);
    const y = this.trackCenterY() - this.itemHeight / 2;

    return items.map((item, idx) => {
      const x = startX + idx * (this.itemWidth + this.itemGap);
      return {
        ...item,
        x: Math.round(x),
        y: Math.round(y)
      };
    });
  });

  protected readonly frontPointerInfo = computed(() => {
    const rendered = this.renderedItems();
    if (rendered.length === 0) return null;
    const first = rendered[0];
    return {
      x: first.x + this.itemWidth / 2,
      y: first.y - 6
    };
  });

  protected readonly rearPointerInfo = computed(() => {
    const rendered = this.renderedItems();
    if (rendered.length === 0) return null;
    const last = rendered[rendered.length - 1];
    return {
      x: last.x + this.itemWidth / 2,
      y: last.y + this.itemHeight + 6
    };
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
