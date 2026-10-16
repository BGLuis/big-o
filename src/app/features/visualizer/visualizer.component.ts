import {
  Component,
  signal,
  computed,
  effect,
  input,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
  OnDestroy,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { LinearRendererComponent } from '../../families/linear/linear-renderer.component';
import { TreeRendererComponent } from '../../families/hierarchical/tree-renderer.component';
import { LinkedListRendererComponent } from '../../families/linked-list/linked-list-renderer.component';
import { StackRendererComponent } from '../../families/stack/stack-renderer.component';
import { QueueRendererComponent } from '../../families/queue/queue-renderer.component';
import { GraphRendererComponent } from '../../families/graph/graph-renderer.component';
import { HashMapRendererComponent } from '../../families/hash-map/hash-map-renderer.component';
import { PlaybackEngine } from '../../engine/playback-engine';
import {
  BaseEvent,
  LinearEvent,
  HierarchicalEvent,
  StackEvent,
  QueueEvent,
  GraphEvent,
  HashMapEvent
} from '../../engine/events';
import {
  LinearState,
  createInitialLinearState,
  linearReducer
} from '../../families/linear/linear-state';
import {
  TreeState,
  createInitialTreeState,
  treeReducer
} from '../../families/hierarchical/tree-state';
import {
  LinkedListState,
  createInitialLinkedListState,
  linkedListReducer
} from '../../families/linked-list/linked-list-state';
import {
  StackState,
  createInitialStackState,
  stackReducer
} from '../../families/stack/stack-state';
import {
  QueueState,
  createInitialQueueState,
  queueReducer
} from '../../families/queue/queue-state';
import {
  GraphState,
  createInitialGraphState,
  graphReducer
} from '../../families/graph/graph-state';
import {
  HashMapState,
  createInitialHashMapState,
  hashMapReducer
} from '../../families/hash-map/hash-map-state';
import { generateQuickSortEvents } from '../../families/linear/algorithms/quick-sort.generator';
import { generateBubbleSortEvents } from '../../families/linear/algorithms/bubble-sort.generator';
import { generateSelectionSortEvents } from '../../families/linear/algorithms/selection-sort.generator';
import { generateInsertionSortEvents } from '../../families/linear/algorithms/insertion-sort.generator';
import { generateMergeSortEvents } from '../../families/linear/algorithms/merge-sort.generator';
import { generateHeapSortEvents } from '../../families/linear/algorithms/heap-sort.generator';
import { generateCountingSortEvents } from '../../families/linear/algorithms/counting-sort.generator';
import { generateRadixSortEvents } from '../../families/linear/algorithms/radix-sort.generator';
import { generateDualPivotQuickSortEvents } from '../../families/linear/algorithms/dual-pivot-quick-sort.generator';
import { generateTimsortEvents } from '../../families/linear/algorithms/timsort.generator';
import { generateIntrosortEvents } from '../../families/linear/algorithms/introsort.generator';
import { generateArrayOperationsEvents } from '../../families/linear/algorithms/array-ops.generator';
import { generateBSTEvents } from '../../families/hierarchical/algorithms/bst-insert.generator';
import { generateAVLEvents } from '../../families/hierarchical/algorithms/avl-tree.generator';
import { generateTreeTraversalEvents } from '../../families/hierarchical/algorithms/tree-traversal.generator';
import { generateRedBlackEvents } from '../../families/hierarchical/algorithms/red-black-tree.generator';
import { generateLinkedListEvents } from '../../families/linked-list/algorithms/linked-list.generator';
import { generateStackEvents } from '../../families/stack/algorithms/stack.generator';
import { generateQueueEvents } from '../../families/queue/algorithms/queue.generator';
import { generateGraphBFSEvents } from '../../families/graph/algorithms/graph-bfs.generator';
import { generateHashMapEvents } from '../../families/hash-map/algorithms/hash-map.generator';
import { ALL_ALGORITHM_CONTENTS, AlgorithmContent, getAlgorithmContent } from '../../content';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-visualizer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LinearRendererComponent,
    TreeRendererComponent,
    LinkedListRendererComponent,
    StackRendererComponent,
    QueueRendererComponent,
    GraphRendererComponent,
    HashMapRendererComponent
  ],
  template: `
    <div class="visualizer-page">
      <!-- Top Contextual Toolbar / Header Card -->
      <header class="card visualizer-header">
        <div class="header-main-info">
          <span class="kicker">{{ currentContent().kicker || 'Ordenação · divisão e conquista' }}</span>
          <div class="title-row">
            <h1 class="algo-title hand">{{ currentContent().title.split(' (')[0] }}</h1>
            <span class="mono comp-badge-omega">{{ currentContent().timeComplexity.best }}</span>
            <span class="mono comp-badge-o">{{ currentContent().timeComplexity.worst }}</span>
          </div>
          <p class="algo-description">{{ currentContent().shortDescription }}</p>
        </div>

        <div class="header-actions">
          <!-- Algorithm Selector -->
          <div class="select-wrapper">
            <select
              id="algo-select"
              class="select-input"
              [value]="selectedAlgorithmId()"
              (change)="onAlgorithmChange($event)"
              aria-label="Selecione o algoritmo ou estrutura">
              <optgroup label="Ordenação">
                @for (algo of sortingAlgorithms; track algo.id) {
                  <option [value]="algo.id">{{ algo.title }}</option>
                }
              </optgroup>
              <optgroup label="Estruturas de Dados">
                @for (ds of dataStructures; track ds.id) {
                  <option [value]="ds.id">{{ ds.title }}</option>
                }
              </optgroup>
            </select>
            <svg class="select-chevron" viewBox="0 0 24 24" aria-hidden="true">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>

          <!-- Randomize / Reset Data Button -->
          <button
            type="button"
            class="btn btn-secondary"
            (click)="generateRandomData()"
            aria-label="Gerar novos dados aleatórios">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
            </svg>
            <span>Novos dados</span>
          </button>

          <!-- Theme Toggle -->
          <button
            type="button"
            class="ctrl"
            (click)="themeService.toggleTheme()"
            [attr.aria-label]="themeService.isDark() ? 'Alternar para tema claro' : 'Alternar para tema escuro'"
            [title]="themeService.isDark() ? 'Tema claro' : 'Tema escuro'">
            @if (themeService.isDark()) {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            } @else {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            }
          </button>
        </div>
      </header>

      <!-- Main Workspace -->
      <div class="workspace-grid">
        <!-- Canvas Card -->
        <section class="card canvas-card" aria-label="Área de animação">
          <div class="canvas-wrapper">
            @switch (currentContent().family) {
              @case ('hierarchical') {
                <app-tree-renderer
                  [state]="currentTreeState()"
                  [currentEvent]="currentHierarchicalEvent()"
                />
              }
              @case ('graph') {
                @if (selectedAlgorithmId() === 'linked-list') {
                  <app-linked-list-renderer
                    [state]="currentLinkedListState()"
                    [currentEvent]="currentLinearEvent()"
                  />
                } @else {
                  <app-graph-renderer
                    [state]="currentGraphState()"
                    [currentEvent]="currentGraphEvent()"
                  />
                }
              }
              @case ('stack') {
                <app-stack-renderer
                  [state]="currentStackState()"
                  [currentEvent]="currentStackEvent()"
                />
              }
              @case ('queue') {
                <app-queue-renderer
                  [state]="currentQueueState()"
                  [currentEvent]="currentQueueEvent()"
                />
              }
              @case ('hash-map') {
                <app-hash-map-renderer
                  [state]="currentHashMapState()"
                  [currentEvent]="currentHashMapEvent()"
                />
              }
              @default {
                <app-linear-renderer
                  [state]="currentLinearState()"
                  [currentEvent]="currentLinearEvent()"
                />
              }
            }
          </div>

          <!-- Step Narration Banner -->
          <div class="narration-bar" role="status" aria-live="polite">
            <span class="narration-step hand">passo {{ currentStepIndex() }} / {{ totalSteps() }}</span>
            <span class="narration-text">
              {{ currentEvent()?.narration || 'Aguardando início da visualização...' }}
            </span>
          </div>

          <!-- Playback Controls -->
          <div class="playback-bar" role="toolbar" aria-label="Controles de reprodução">
            <div class="playback-buttons">
              <!-- Reset -->
              <button
                type="button"
                class="ctrl"
                (click)="onReset()"
                aria-label="Reiniciar"
                title="Reiniciar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M1 4v6h6M23 20v-6h-6"/>
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                </svg>
              </button>

              <!-- Step Back -->
              <button
                type="button"
                class="ctrl"
                (click)="onStepBackward()"
                [disabled]="!canStepBackward()"
                aria-label="Passo anterior"
                title="Passo anterior">
                <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
                  <polygon points="19 20 9 12 19 4 19 20"/>
                  <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>

              <!-- Play / Pause -->
              <button
                type="button"
                class="ctrl play"
                (click)="onTogglePlay()"
                [attr.aria-label]="isPlaying() ? 'Pausar animação' : 'Reproduzir animação'"
                [title]="isPlaying() ? 'Pausar' : 'Reproduzir'">
                @if (isPlaying()) {
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <rect x="6" y="4" width="4" height="16" rx="1"/>
                    <rect x="14" y="4" width="4" height="16" rx="1"/>
                  </svg>
                } @else {
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <polygon points="6 4 20 12 6 20 6 4"/>
                  </svg>
                }
              </button>

              <!-- Step Forward -->
              <button
                type="button"
                class="ctrl"
                (click)="onStepForward()"
                [disabled]="!canStepForward()"
                aria-label="Próximo passo"
                title="Próximo passo">
                <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
                  <polygon points="5 4 19 12 5 20 5 4"/>
                  <line x1="20" y1="5" x2="20" y2="19" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>
            </div>

            <!-- Scrubber Slider -->
            <div class="scrubber-wrapper">
              <label for="timeline-scrubber" class="sr-only">Linha do tempo de passos</label>
              <input
                id="timeline-scrubber"
                type="range"
                class="scrubber-range"
                min="0"
                [max]="totalSteps()"
                [value]="currentStepIndex()"
                [style.--scrubber-fill]="progressPercent() + '%'"
                (input)="onScrub($event)"
                aria-label="Progresso da visualização"
              />
              <span class="scrubber-counter mono" aria-hidden="true">
                {{ currentStepIndex() }} / {{ totalSteps() }}
              </span>
            </div>

            <!-- Speed Selector -->
            <div class="speed-wrapper">
              <label for="speed-select" class="sr-only">Velocidade de reprodução</label>
              <select
                id="speed-select"
                class="speed-select mono"
                [value]="currentSpeed()"
                (change)="onSpeedChange($event)">
                <option value="0.5">0.5×</option>
                <option value="1">1.0×</option>
                <option value="2">2.0×</option>
                <option value="4">4.0×</option>
              </select>
              <svg class="speed-chevron" viewBox="0 0 24 24" aria-hidden="true">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
          </div>
        </section>

        <!-- Details & Pseudocode Sidebar -->
        <aside class="card side-panel" aria-label="Explicação e código">
          <div class="panel-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              class="panel-tab"
              [class.is-active]="activeTab() === 'explanation'"
              [attr.aria-selected]="activeTab() === 'explanation'"
              (click)="activeTab.set('explanation')">
              Didática
            </button>
            <button
              type="button"
              role="tab"
              class="panel-tab"
              [class.is-active]="activeTab() === 'code'"
              [attr.aria-selected]="activeTab() === 'code'"
              (click)="activeTab.set('code')">
              Pseudocódigo
            </button>
          </div>

          <div class="tab-content">
            @if (activeTab() === 'explanation') {
              <div class="explanation-tab">
                <p class="tab-subtitle">Visão conceitual e análise de complexidade da técnica utilizada.</p>
                <div class="explanation-body">{{ currentContent().fullExplanation }}</div>
              </div>
            } @else {
              <div class="code-tab">
                <p class="tab-subtitle">A linha destacada é o passo atual. O painel acompanha a execução automaticamente.</p>
                <pre class="pseudocode-container" tabindex="0" aria-label="Código canônico do algoritmo"><code>@for (line of currentContent().pseudoCode; track $index) {<div class="code-line" [class.highlighted-line]="activeCodeLine() === ($index + 1)"><span class="line-number">{{ $index + 1 }}</span><span class="line-text">{{ line }}</span></div>}</code></pre>
              </div>
            }

            <!-- Bottom Complexity Grid (matching Figma) -->
            <div class="complexity-section">
              <span class="kicker kicker-sm">Custo · Ω melhor · O pior</span>
              <div class="complexity-grid">
                <div class="complexity-box">
                  <span class="comp-label">Melhor · Ω</span>
                  <span class="comp-value mono comp-omega">{{ currentContent().timeComplexity.best }}</span>
                </div>
                <div class="complexity-box">
                  <span class="comp-label">Médio</span>
                  <span class="comp-value mono">{{ currentContent().timeComplexity.average }}</span>
                </div>
                <div class="complexity-box">
                  <span class="comp-label">Pior · O</span>
                  <span class="comp-value mono comp-o">{{ currentContent().timeComplexity.worst }}</span>
                </div>
                <div class="complexity-box">
                  <span class="comp-label">Espaço</span>
                  <span class="comp-value mono">{{ currentContent().spaceComplexity }}</span>
                </div>
              </div>
              <p class="complexity-note">
                {{ currentContent().pedagogicalNote || 'Como Ω e O não coincidem, o Quick Sort não tem um Θ único. O Merge Sort tem: Θ(n log n).' }}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  `,
  styleUrl: './visualizer.component.scss'
})
export class VisualizerComponent implements OnDestroy {
  public readonly id = input<string>();
  protected readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly cdr = inject(ChangeDetectorRef);

  public readonly availableAlgorithms = ALL_ALGORITHM_CONTENTS;
  public readonly sortingAlgorithms = ALL_ALGORITHM_CONTENTS.filter(
    (c) => c.category === 'sorting' || c.category === 'algorithm'
  );
  public readonly dataStructures = ALL_ALGORITHM_CONTENTS.filter((c) => c.category === 'data-structure');
  public readonly selectedAlgorithmId = signal<string>('quick-sort');
  public readonly activeTab = signal<'explanation' | 'code'>('code');

  private readonly initialValues = signal<number[]>([17, 12, 24, 33, 89, 95, 41, 71, 58, 6]);
  protected readonly engine = signal<PlaybackEngine<any, any> | null>(null);

  public readonly defaultLinearState = signal<LinearState>(
    createInitialLinearState([17, 12, 24, 33, 89, 95, 41, 71, 58, 6])
  );
  public readonly defaultTreeState = signal<TreeState>(createInitialTreeState());
  public readonly defaultLinkedListState = signal<LinkedListState>(createInitialLinkedListState());
  public readonly defaultStackState = signal<StackState>(createInitialStackState());
  public readonly defaultQueueState = signal<QueueState>(createInitialQueueState());
  public readonly defaultGraphState = signal<GraphState>(createInitialGraphState());
  public readonly defaultHashMapState = signal<HashMapState>(createInitialHashMapState());

  // Directly derived reactive signals from engine
  public readonly currentLinearState = computed<LinearState>(() => {
    return (this.engine()?.currentState() as LinearState) ?? this.defaultLinearState();
  });

  public readonly currentTreeState = computed<TreeState>(() => {
    return (this.engine()?.currentState() as TreeState) ?? this.defaultTreeState();
  });

  public readonly currentLinkedListState = computed<LinkedListState>(() => {
    return (this.engine()?.currentState() as LinkedListState) ?? this.defaultLinkedListState();
  });

  public readonly currentStackState = computed<StackState>(() => {
    return (this.engine()?.currentState() as StackState) ?? this.defaultStackState();
  });

  public readonly currentQueueState = computed<QueueState>(() => {
    return (this.engine()?.currentState() as QueueState) ?? this.defaultQueueState();
  });

  public readonly currentGraphState = computed<GraphState>(() => {
    return (this.engine()?.currentState() as GraphState) ?? this.defaultGraphState();
  });

  public readonly currentHashMapState = computed<HashMapState>(() => {
    return (this.engine()?.currentState() as HashMapState) ?? this.defaultHashMapState();
  });

  public readonly currentLinearEvent = computed<LinearEvent | null>(() => {
    return (this.engine()?.currentEvent() as LinearEvent) ?? null;
  });

  public readonly currentHierarchicalEvent = computed<HierarchicalEvent | null>(() => {
    return (this.engine()?.currentEvent() as HierarchicalEvent) ?? null;
  });

  public readonly currentStackEvent = computed<StackEvent | null>(() => {
    return (this.engine()?.currentEvent() as StackEvent) ?? null;
  });

  public readonly currentQueueEvent = computed<QueueEvent | null>(() => {
    return (this.engine()?.currentEvent() as QueueEvent) ?? null;
  });

  public readonly currentGraphEvent = computed<GraphEvent | null>(() => {
    return (this.engine()?.currentEvent() as GraphEvent) ?? null;
  });

  public readonly currentHashMapEvent = computed<HashMapEvent | null>(() => {
    return (this.engine()?.currentEvent() as HashMapEvent) ?? null;
  });

  public readonly currentEvent = computed<BaseEvent | null>(() => {
    return (this.engine()?.currentEvent() as BaseEvent) ?? null;
  });

  public readonly currentStepIndex = computed<number>(() => {
    return this.engine()?.currentStepIndex() ?? 0;
  });

  public readonly totalSteps = computed<number>(() => {
    return this.engine()?.totalSteps() ?? 0;
  });

  public readonly isPlaying = computed<boolean>(() => {
    return this.engine()?.isPlaying() ?? false;
  });

  public readonly canStepForward = computed<boolean>(() => {
    return this.engine()?.canStepForward() ?? false;
  });

  public readonly canStepBackward = computed<boolean>(() => {
    return this.engine()?.canStepBackward() ?? false;
  });

  public readonly currentSpeed = signal<number>(1);

  public readonly progressPercent = computed<number>(() => {
    const total = this.totalSteps();
    if (total <= 0) return 0;
    return Math.min(100, Math.round((this.currentStepIndex() / total) * 100));
  });

  public readonly currentContent = computed<AlgorithmContent>(() => {
    return getAlgorithmContent(this.selectedAlgorithmId()) ?? ALL_ALGORITHM_CONTENTS[0];
  });

  public readonly activeCodeLine = computed<number | null>(() => {
    return this.currentEvent()?.pseudoCodeLine ?? null;
  });

  constructor() {
    this.rebuildEngine();

    // Sync when route parameter :id changes
    effect(() => {
      const routeId = this.id();
      if (routeId && routeId !== this.selectedAlgorithmId()) {
        const found = getAlgorithmContent(routeId);
        if (found) {
          this.selectedAlgorithmId.set(routeId);
          this.setDefaultValuesForAlgo(routeId);
          this.rebuildEngine();
        }
      }
    });

    // Auto-scroll pseudocode to highlighted line
    effect(() => {
      const activeLine = this.activeCodeLine();
      const tab = this.activeTab();
      if (activeLine && tab === 'code' && this.isBrowser) {
        setTimeout(() => {
          const highlightedEl = document.querySelector('.code-line.highlighted-line');
          if (highlightedEl) {
            highlightedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }
        }, 10);
      }
    });
  }

  public onAlgorithmChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target?.value) {
      const newId = target.value;
      this.selectedAlgorithmId.set(newId);
      this.setDefaultValuesForAlgo(newId);
      this.rebuildEngine();

      const content = getAlgorithmContent(newId);
      const prefix = content?.category === 'data-structure' ? 'data-structures' : 'ordenacao';
      this.router.navigate([prefix, newId]).catch(() => {
        // Navigation catch for test environments
      });
    }
  }

  public generateRandomData(): void {
    const family = this.currentContent().family;
    const algoId = this.selectedAlgorithmId();
    const values: number[] = [];

    if (algoId === 'avl-tree') {
      values.push(30, 20, 10, 40, 50, 25);
    } else if (algoId === 'red-black-tree') {
      values.push(20, 10, 30, 5, 15, 25);
    } else if (family === 'hierarchical') {
      const pool = new Set<number>();
      while (pool.size < 7) {
        pool.add(Math.floor(Math.random() * 85) + 10);
      }
      values.push(...Array.from(pool));
    } else if (algoId === 'linked-list') {
      const pool = new Set<number>();
      while (pool.size < 5) {
        pool.add(Math.floor(Math.random() * 85) + 10);
      }
      values.push(...Array.from(pool));
    } else if (algoId === 'stack' || algoId === 'queue') {
      const count = 3;
      for (let i = 0; i < count; i++) {
        values.push(Math.floor(Math.random() * 85) + 10);
      }
    } else if (algoId === 'counting-sort') {
      const count = 10;
      for (let i = 0; i < count; i++) {
        values.push(Math.floor(Math.random() * 9) + 1);
      }
    } else {
      const count = 10;
      for (let i = 0; i < count; i++) {
        values.push(Math.floor(Math.random() * 90) + 10);
      }
    }

    this.initialValues.set(values);
    this.rebuildEngine();
  }

  public onTogglePlay(): void {
    const eng = this.engine();
    if (!eng) return;
    eng.togglePlay();
    this.cdr.markForCheck();
  }

  public onStepForward(): void {
    const eng = this.engine();
    if (!eng) return;
    eng.stepForward();
    this.cdr.markForCheck();
  }

  public onStepBackward(): void {
    const eng = this.engine();
    if (!eng) return;
    eng.stepBackward();
    this.cdr.markForCheck();
  }

  public onReset(): void {
    const eng = this.engine();
    if (!eng) return;
    eng.reset();
    this.cdr.markForCheck();
  }

  public onScrub(event: Event): void {
    const target = event.target as HTMLInputElement;
    const eng = this.engine();
    if (!eng || !target) return;
    const targetStep = parseInt(target.value, 10);
    eng.goToStep(targetStep);
    this.cdr.markForCheck();
  }

  public onSpeedChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const eng = this.engine();
    if (!target) return;
    const speed = parseFloat(target.value);
    this.currentSpeed.set(speed);
    if (eng) {
      eng.setSpeed(speed);
    }
  }

  private setDefaultValuesForAlgo(algoId: string): void {
    const content = getAlgorithmContent(algoId);
    if (algoId === 'avl-tree') {
      this.initialValues.set([30, 20, 10, 40, 50, 25]);
    } else if (algoId === 'red-black-tree') {
      this.initialValues.set([20, 10, 30, 5, 15, 25]);
    } else if (algoId === 'tree-traversal' || content?.family === 'hierarchical') {
      this.initialValues.set([50, 30, 70, 20, 40, 60, 80]);
    } else if (algoId === 'linked-list') {
      this.initialValues.set([12, 45, 28, 73, 56]);
    } else if (algoId === 'stack') {
      this.initialValues.set([20, 45, 78]);
    } else if (algoId === 'queue') {
      this.initialValues.set([15, 38, 72]);
    } else if (algoId === 'counting-sort') {
      this.initialValues.set([4, 2, 8, 3, 3, 1, 6, 5, 2, 7]);
    } else {
      this.initialValues.set([17, 12, 24, 33, 89, 95, 41, 71, 58, 6]);
    }
  }

  private rebuildEngine(): void {
    const prevEngine = this.engine();
    if (prevEngine) {
      prevEngine.destroy();
    }

    const values = this.initialValues();
    const algoId = this.selectedAlgorithmId();
    const content = this.currentContent();

    let newEngine: PlaybackEngine<any, any>;

    if (content.family === 'hierarchical') {
      const initialState = createInitialTreeState();
      this.defaultTreeState.set(initialState);
      let events: HierarchicalEvent[] = [];
      if (algoId === 'avl-tree') {
        events = Array.from(generateAVLEvents(values));
      } else if (algoId === 'tree-traversal') {
        events = Array.from(generateTreeTraversalEvents(values));
      } else if (algoId === 'red-black-tree') {
        events = Array.from(generateRedBlackEvents(values));
      } else {
        events = Array.from(generateBSTEvents(values));
      }
      newEngine = new PlaybackEngine<TreeState, HierarchicalEvent>({
        initialState,
        events,
        reducer: treeReducer,
        checkpointInterval: 8,
        onStep: () => this.cdr.markForCheck()
      });
    } else if (algoId === 'linked-list') {
      const initialState = createInitialLinkedListState();
      this.defaultLinkedListState.set(initialState);
      const events = Array.from(generateLinkedListEvents(values));
      newEngine = new PlaybackEngine<LinkedListState, LinearEvent>({
        initialState,
        events,
        reducer: linkedListReducer,
        checkpointInterval: 8,
        onStep: () => this.cdr.markForCheck()
      });
    } else if (algoId === 'graph') {
      const initialState = createInitialGraphState();
      this.defaultGraphState.set(initialState);
      const events = Array.from(generateGraphBFSEvents());
      newEngine = new PlaybackEngine<GraphState, GraphEvent>({
        initialState,
        events,
        reducer: graphReducer,
        checkpointInterval: 4,
        onStep: () => this.cdr.markForCheck()
      });
    } else if (algoId === 'stack') {
      const initialState = createInitialStackState();
      this.defaultStackState.set(initialState);
      const events = Array.from(generateStackEvents(values));
      newEngine = new PlaybackEngine<StackState, StackEvent>({
        initialState,
        events,
        reducer: stackReducer,
        checkpointInterval: 4,
        onStep: () => this.cdr.markForCheck()
      });
    } else if (algoId === 'queue') {
      const initialState = createInitialQueueState();
      this.defaultQueueState.set(initialState);
      const events = Array.from(generateQueueEvents(values));
      newEngine = new PlaybackEngine<QueueState, QueueEvent>({
        initialState,
        events,
        reducer: queueReducer,
        checkpointInterval: 4,
        onStep: () => this.cdr.markForCheck()
      });
    } else if (algoId === 'hash-map') {
      const initialState = createInitialHashMapState();
      this.defaultHashMapState.set(initialState);
      const events = Array.from(generateHashMapEvents());
      newEngine = new PlaybackEngine<HashMapState, HashMapEvent>({
        initialState,
        events,
        reducer: hashMapReducer,
        checkpointInterval: 4,
        onStep: () => this.cdr.markForCheck()
      });
    } else {
      // Linear sorting or array operations family
      const initialState = createInitialLinearState(values);
      this.defaultLinearState.set(initialState);

      let events: LinearEvent[] = [];
      switch (algoId) {
        case 'array':
          events = Array.from(generateArrayOperationsEvents(initialState.elements));
          break;
        case 'bubble-sort':
          events = Array.from(generateBubbleSortEvents(initialState.elements));
          break;
        case 'selection-sort':
          events = Array.from(generateSelectionSortEvents(initialState.elements));
          break;
        case 'insertion-sort':
          events = Array.from(generateInsertionSortEvents(initialState.elements));
          break;
        case 'merge-sort':
          events = Array.from(generateMergeSortEvents(initialState.elements));
          break;
        case 'heap-sort':
          events = Array.from(generateHeapSortEvents(initialState.elements));
          break;
        case 'counting-sort':
          events = Array.from(generateCountingSortEvents(initialState.elements));
          break;
        case 'radix-sort':
          events = Array.from(generateRadixSortEvents(initialState.elements));
          break;
        case 'dual-pivot-quick-sort':
          events = Array.from(generateDualPivotQuickSortEvents(initialState.elements));
          break;
        case 'timsort':
          events = Array.from(generateTimsortEvents(initialState.elements));
          break;
        case 'introsort':
          events = Array.from(generateIntrosortEvents(initialState.elements));
          break;
        case 'quick-sort':
        default:
          events = Array.from(generateQuickSortEvents(initialState.elements));
          break;
      }

      newEngine = new PlaybackEngine<LinearState, LinearEvent>({
        initialState,
        events,
        reducer: linearReducer,
        checkpointInterval: 16,
        onStep: () => this.cdr.markForCheck()
      });
    }

    newEngine.setSpeed(this.currentSpeed());
    this.engine.set(newEngine);
    this.cdr.markForCheck();
  }

  public ngOnDestroy(): void {
    const eng = this.engine();
    if (eng) {
      eng.destroy();
    }
  }
}
