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
import { StackState, StackItem } from './stack-state';
import { StackEvent } from '../../engine/events';

@Component({
  selector: 'app-stack-renderer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stack-renderer-container">

      <svg
        class="stack-svg"
        [attr.viewBox]="viewBox()"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Visualização gráfica de Pilha (LIFO)">
        
        <defs>
          <marker
            id="stack-top-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--o-lt, #e8c14a)" />
          </marker>
        </defs>

        <!-- Stack Container Graphic (Bucket / Tube) -->
        <path
          class="stack-tube"
          [attr.d]="tubePath()"
          fill="none"
          stroke="var(--edge, #6f7d74)"
          stroke-width="3"
        />

        <!-- Empty indicator if 0 items -->
        @if (state().items.length === 0) {
          <text
            [attr.x]="tubeCenterX()"
            [attr.y]="tubeBottomY() - 30"
            text-anchor="middle"
            class="empty-label">
            (Pilha Vazia)
          </text>
        }

        <!-- Stack Items (stacked bottom-up) -->
        @for (item of renderedItems(); track item.id; let idx = $index) {
          <g
            class="stack-item-group"
            [class.is-pushed]="item.state === 'pushed'"
            [class.is-peeked]="item.state === 'peeked'"
            [class.is-active]="item.state === 'active'"
            [style.transform]="'translate(' + item.x + 'px, ' + item.y + 'px)'">
            <rect
              class="stack-item-rect"
              [attr.width]="itemWidth"
              [attr.height]="itemHeight"
              rx="6"
            />
            <text
              class="stack-item-text"
              [attr.x]="itemWidth / 2"
              [attr.y]="itemHeight / 2 + 5"
              text-anchor="middle">
              {{ item.value }}
            </text>
            <text
              class="stack-item-idx"
              [attr.x]="-14"
              [attr.y]="itemHeight / 2 + 4"
              text-anchor="end">
              [{{ idx }}]
            </text>
          </g>
        }

        <!-- Top Pointer -->
        @if (topPointerInfo(); as top) {
          <g class="top-pointer-group" [style.transform]="'translate(' + top.x + 'px, ' + top.y + 'px)'">
            <text class="top-pointer-text" x="-10" y="4" text-anchor="end">
              TOPO
            </text>
            <line
              x1="-8"
              y1="0"
              x2="10"
              y2="0"
              stroke="var(--o-lt, #e8c14a)"
              stroke-width="2.5"
              marker-end="url(#stack-top-arrow)"
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

    .stack-renderer-container {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      background: var(--board, #26332c);
      border-radius: 14px 18px 14px 18px / 16px 14px 18px 14px;
      padding: 16px;
      box-sizing: border-box;
      color: var(--chalk, #f4f1e6);
    }

    .stack-svg {
      width: 100%;
      height: 100%;
      display: block;
      user-select: none;
    }

    .stack-tube {
      stroke-dasharray: 6 3;
    }

    .empty-label {
      fill: var(--chalk-dim, #b7c2b9);
      font-family: var(--mono, 'IBM Plex Mono', monospace);
      font-size: 13px;
    }

    .stack-item-group {
      transition: transform 0.25s ease-out;

      .stack-item-rect {
        fill: var(--board-deep, #1f2a24);
        stroke: var(--chalk-soft, #d7ded6);
        stroke-width: 1.5;
        transition: fill 0.2s ease;
      }

      .stack-item-text {
        fill: var(--chalk, #f4f1e6);
        font-family: var(--mono, 'IBM Plex Mono', monospace);
        font-size: 14px;
        font-weight: 700;
      }

      .stack-item-idx {
        fill: var(--chalk-dim, #b7c2b9);
        font-family: var(--mono, 'IBM Plex Mono', monospace);
        font-size: 11px;
      }

      &.is-pushed .stack-item-rect {
        fill: #8ad9ab;
        stroke: #ffffff;
      }

      &.is-pushed .stack-item-text {
        fill: #1c2621;
      }

      &.is-peeked .stack-item-rect {
        fill: var(--o-lt, #e8c14a);
        stroke: #ffffff;
      }

      &.is-peeked .stack-item-text {
        fill: #1c2621;
      }

      &.is-active .stack-item-rect {
        fill: var(--coral-lt, #f0a99d);
        stroke: #ffffff;
      }

      &.is-active .stack-item-text {
        fill: #1c2621;
      }
    }

    .top-pointer-group {
      transition: transform 0.25s ease-out;

      .top-pointer-text {
        fill: var(--o-lt, #e8c14a);
        font-family: var(--mono, 'IBM Plex Mono', monospace);
        font-size: 12px;
        font-weight: 700;
      }
    }
  `]
})
export class StackRendererComponent implements OnInit, OnDestroy {
  private readonly hostRef = inject(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private resizeObserver: ResizeObserver | null = null;

  public readonly state = input.required<StackState>();
  public readonly currentEvent = input<StackEvent | null>(null);

  protected readonly containerWidth = signal<number>(600);
  protected readonly containerHeight = signal<number>(360);

  protected readonly itemWidth = 140;
  protected readonly itemHeight = 36;
  protected readonly itemGap = 8;

  protected readonly viewBox = computed<string>(() => {
    return `0 0 ${this.containerWidth()} ${this.containerHeight()}`;
  });

  protected readonly tubeCenterX = computed<number>(() => this.containerWidth() / 2);
  protected readonly tubeBottomY = computed<number>(() => this.containerHeight() - 30);
  protected readonly tubeTopY = computed<number>(() => 40);

  protected readonly tubePath = computed<string>(() => {
    const cx = this.tubeCenterX();
    const bottomY = this.tubeBottomY();
    const topY = this.tubeTopY();
    const halfWidth = this.itemWidth / 2 + 16;

    const leftX = cx - halfWidth;
    const rightX = cx + halfWidth;

    return `M ${leftX} ${topY} L ${leftX} ${bottomY} L ${rightX} ${bottomY} L ${rightX} ${topY}`;
  });

  protected readonly renderedItems = computed(() => {
    const items = this.state().items;
    const cx = this.tubeCenterX();
    const bottomY = this.tubeBottomY() - 6;

    return items.map((item, idx) => {
      const x = cx - this.itemWidth / 2;
      const y = bottomY - (idx + 1) * (this.itemHeight + this.itemGap) + this.itemGap;
      return {
        ...item,
        x: Math.round(x),
        y: Math.round(y)
      };
    });
  });

  protected readonly topPointerInfo = computed(() => {
    const rendered = this.renderedItems();
    if (rendered.length === 0) return null;
    const topItem = rendered[rendered.length - 1];
    const halfWidth = this.itemWidth / 2 + 16;
    const cx = this.tubeCenterX();
    return {
      x: cx + halfWidth + 14,
      y: topItem.y + this.itemHeight / 2
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
