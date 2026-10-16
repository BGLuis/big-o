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
import { HashMapState, HashBucket, HashEntry } from './hash-map-state';
import { HashMapEvent } from '../../engine/events';

@Component({
  selector: 'app-hash-map-renderer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="hash-map-renderer-container">

      <svg
        class="hash-svg"
        [attr.viewBox]="viewBox()"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Visualização gráfica de Tabela Hash com Encadeamento Separado">
        
        <defs>
          <marker
            id="hash-chain-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--o-lt, #f4d38c)" />
          </marker>
        </defs>

        <!-- Top Formula / Calculation Card -->
        @if (state().currentCalc; as calc) {
          <g class="calc-box-group" [attr.transform]="'translate(' + (containerWidth() / 2 - 130) + ', 15)'">
            <rect width="260" height="34" rx="8" class="calc-rect" />
            <text x="130" y="22" text-anchor="middle" class="calc-text">
              {{ calc.formula }}
            </text>
          </g>
        }

        <!-- Collision Notification Alert -->
        @if (state().collisionAlert; as alertMsg) {
          <g class="collision-banner" [attr.transform]="'translate(' + (containerWidth() / 2) + ', 64)'">
            <rect x="-180" y="-12" width="360" height="24" rx="6" class="collision-rect" />
            <text x="0" y="4" text-anchor="middle" class="collision-text">
              {{ alertMsg }}
            </text>
          </g>
        }

        <!-- Buckets Rows -->
        <g class="buckets-layer" transform="translate(40, 80)">
          @for (bucket of renderedBuckets(); track bucket.index) {
            <g
              class="bucket-row-group"
              [class.is-active]="state().activeBucketIndex === bucket.index"
              [attr.transform]="'translate(0, ' + bucket.y + ')'">
              
              <!-- Bucket Slot Index -->
              <rect
                class="bucket-slot-rect"
                width="64"
                height="32"
                rx="6"
              />
              <text
                class="bucket-slot-text"
                x="32"
                y="20"
                text-anchor="middle">
                [{{ bucket.index }}]
              </text>

              <!-- Empty Bucket Indicator -->
              @if (bucket.entries.length === 0) {
                <text class="bucket-empty-text" x="85" y="20">
                  (vazio)
                </text>
              }

              <!-- Chained Entries in this Bucket -->
              @for (entry of bucket.entries; track entry.id; let eIdx = $index) {
                <!-- Chain connector line -->
                <line
                  class="chain-arrow"
                  [attr.x1]="74 + eIdx * 150"
                  y1="16"
                  [attr.x2]="94 + eIdx * 150"
                  y2="16"
                  marker-end="url(#hash-chain-arrow)"
                />

                <!-- Entry Card -->
                <g
                  class="entry-card-group"
                  [class.is-matched]="entry.state === 'matched'"
                  [class.is-inserting]="entry.state === 'inserting'"
                  [attr.transform]="'translate(' + (100 + eIdx * 150) + ', 0)'">
                  <rect
                    class="entry-card-rect"
                    width="128"
                    height="32"
                    rx="6"
                  />
                  <text class="entry-card-text" x="64" y="20" text-anchor="middle">
                    {{ entry.key }}: "{{ entry.value }}"
                  </text>
                </g>
              }
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
      min-height: 380px;
    }

    .hash-map-renderer-container {
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

    .hash-svg {
      width: 100%;
      height: 100%;
      display: block;
      user-select: none;
    }

    .calc-rect {
      fill: var(--board-deep, #16221c);
      stroke: var(--o-lt, #f4d38c);
      stroke-width: 2;
    }

    .calc-text {
      fill: var(--o, #fcd34d);
      font-family: var(--font-family-mono, monospace);
      font-size: 13px;
      font-weight: 700;
    }

    .collision-rect {
      fill: rgba(204, 85, 68, 0.25);
      stroke: var(--coral-lt, #e8867a);
      stroke-width: 1.5;
    }

    .collision-text {
      fill: var(--coral-lt, #e8867a);
      font-family: var(--font-family-mono, monospace);
      font-size: 11px;
      font-weight: 700;
    }

    .bucket-row-group {
      transition: transform 0.2s ease;

      .bucket-slot-rect {
        fill: var(--board-deep, #16221c);
        stroke: var(--grid, #334038);
        stroke-width: 1.5;
        transition: stroke 0.2s ease, fill 0.2s ease;
      }

      .bucket-slot-text {
        fill: var(--chalk-dim, #a4ab9e);
        font-family: var(--font-family-mono, monospace);
        font-size: 13px;
        font-weight: 700;
      }

      &.is-active .bucket-slot-rect {
        fill: rgba(233, 180, 76, 0.2);
        stroke: var(--o-lt, #f4d38c);
        stroke-width: 2.5;
      }

      &.is-active .bucket-slot-text {
        fill: var(--o-lt, #f4d38c);
      }
    }

    .bucket-empty-text {
      fill: var(--chalk-faint, #4e584f);
      font-family: var(--font-family-mono, monospace);
      font-size: 12px;
      font-style: italic;
    }

    .chain-arrow {
      stroke: var(--o-lt, #f4d38c);
      stroke-width: 2;
    }

    .entry-card-group {
      .entry-card-rect {
        fill: var(--board-deep, #16221c);
        stroke: var(--chalk, #eceae2);
        stroke-width: 1.5;
        transition: fill 0.2s ease;
      }

      .entry-card-text {
        fill: var(--chalk, #eceae2);
        font-family: var(--font-family-mono, monospace);
        font-size: 12px;
        font-weight: 600;
      }

      &.is-inserting .entry-card-rect {
        fill: rgba(233, 180, 76, 0.25);
        stroke: var(--o-lt, #f4d38c);
      }

      &.is-matched .entry-card-rect {
        fill: rgba(68, 170, 119, 0.25);
        stroke: var(--theta, #44aa77);
      }
    }
  `]
})
export class HashMapRendererComponent implements OnInit, OnDestroy {
  private readonly hostRef = inject(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private resizeObserver: ResizeObserver | null = null;

  public readonly state = input.required<HashMapState>();
  public readonly currentEvent = input<HashMapEvent | null>(null);

  protected readonly containerWidth = signal<number>(640);
  protected readonly containerHeight = signal<number>(400);

  protected readonly viewBox = computed<string>(() => {
    return `0 0 ${this.containerWidth()} ${this.containerHeight()}`;
  });

  protected readonly renderedBuckets = computed(() => {
    const buckets = this.state().buckets;
    const rowHeight = 40;
    return buckets.map((bucket, idx) => ({
      ...bucket,
      y: idx * rowHeight
    }));
  });

  public ngOnInit(): void {
    if (this.isBrowser && typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0) this.containerWidth.set(Math.round(width));
          if (height > 0) this.containerHeight.set(Math.max(380, Math.round(height)));
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
