import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../core/services/theme.service';
import { SandboxArenaComponent } from './components/sandbox-arena/sandbox-arena.component';
import { SandboxLabComponent } from './components/sandbox-lab/sandbox-lab.component';
import {
  ArenaCategory,
  SandboxMode,
  SandboxStructureType
} from './sandbox.types';
import { SandboxSessionService } from './services/sandbox-session.service';

@Component({
  selector: 'app-sandbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SandboxLabComponent, SandboxArenaComponent],
  template: `
    <div class="sandbox-page">
      <!-- Header Card: Estética de Lousa & Papel Acadêmico -->
      <header class="card sandbox-header" aria-label="Cabeçalho do Sandbox">
        <div class="header-main-info">
          <span class="kicker">Experimentação Livre & Comparação Empírica</span>
          <div class="title-row">
            <h1 class="sandbox-title hand">Laboratório & Arena Sandbox</h1>
            <span class="sandbox-badge-mono mono">Interativo</span>
          </div>
          <p class="sandbox-description">
            Manipule estruturas passo a passo no laboratório ou coloque dois algoritmos para competir lado a lado
            com exatamente a mesma massa de dados para auditar comparações, mutações e invariantes.
          </p>
        </div>

        <div class="header-controls">
          <!-- Alternador de Modo (Segmented Control / Tablist acessível WCAG AA) -->
          <div class="mode-switch-wrapper" role="tablist" aria-label="Modo de visualização do Sandbox">
            <button
              type="button"
              id="tab-mode-lab"
              role="tab"
              class="mode-tab-btn"
              [class.is-active]="activeMode() === 'lab'"
              [attr.aria-selected]="activeMode() === 'lab'"
              [attr.tabindex]="activeMode() === 'lab' ? 0 : -1"
              aria-controls="panel-mode-lab"
              (click)="setMode('lab')"
            >
              <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M10 2v7.31M14 2v7.31M8.5 2h7M14 9.3a6.5 6.5 0 1 1-4 0"/>
                <path d="M5.52 16h12.96"/>
              </svg>
              <span class="tab-label">Laboratório de Estruturas</span>
            </button>

            <button
              type="button"
              id="tab-mode-arena"
              role="tab"
              class="mode-tab-btn"
              [class.is-active]="activeMode() === 'arena'"
              [attr.aria-selected]="activeMode() === 'arena'"
              [attr.tabindex]="activeMode() === 'arena' ? 0 : -1"
              aria-controls="panel-mode-arena"
              (click)="setMode('arena')"
            >
              <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="6" y1="18" x2="18" y2="6"/>
                <polyline points="10 6 18 6 18 14"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
                <polyline points="14 18 6 18 6 10"/>
              </svg>
              <span class="tab-label">Arena Comparativa (Lado a Lado)</span>
            </button>
          </div>

          <!-- Botão de Alternância de Tema -->
          <button
            type="button"
            class="theme-toggle-btn"
            (click)="themeService.toggleTheme()"
            [attr.aria-label]="themeService.isDark() ? 'Alternar para tema claro' : 'Alternar para tema escuro'"
            [title]="themeService.isDark() ? 'Tema claro' : 'Tema escuro'"
          >
            @if (themeService.isDark()) {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            } @else {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            }
          </button>
        </div>
      </header>

      <!-- Corpo Condicional do Sandbox -->
      <main class="sandbox-content" role="region" aria-label="Conteúdo ativo do Sandbox">
        @if (activeMode() === 'lab') {
          <div id="panel-mode-lab" role="tabpanel" aria-labelledby="tab-mode-lab" class="mode-panel">
            <app-sandbox-lab />
          </div>
        } @else {
          <div id="panel-mode-arena" role="tabpanel" aria-labelledby="tab-mode-arena" class="mode-panel">
            <app-sandbox-arena
              [initialCategory]="arenaCategory()"
              [initialLeftId]="arenaLeftId()"
              [initialRightId]="arenaRightId()"
            />
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .sandbox-page {
      display: flex;
      flex-direction: column;
      min-height: 100%;
      width: 100%;
      padding: 18px;
      gap: 16px;
      color: var(--ink, #1c2621);
      box-sizing: border-box;
    }

    .card {
      border: 1.5px solid var(--frame-soft, #c3d0c7);
      border-radius: 16px 24px 16px 24px / 22px 16px 24px 16px;
      background: var(--panel, #ffffff);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
    }

    .hand {
      font-family: var(--hand, 'Caveat', cursive);
      font-weight: 600;
      line-height: 1;
    }

    .mono {
      font-family: var(--mono, 'IBM Plex Mono', monospace);
    }

    .kicker {
      font-family: var(--mono, monospace);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--ink-dim, #5a6660);
    }

    /* Header */
    .sandbox-header {
      flex-direction: row;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 16px 20px;
    }

    .header-main-info {
      flex: 1;
      min-width: 280px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .title-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }

    .sandbox-title {
      margin: 0;
      font-size: 34px;
      color: var(--ink, #1c2621);
    }

    .sandbox-badge-mono {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 4px;
      background: var(--wall-tint, #f3f6f3);
      color: var(--pine, #17603e);
      border: 1px solid var(--frame-soft, #c3d0c7);
      font-weight: 600;
      text-transform: uppercase;
    }

    .sandbox-description {
      margin: 0;
      font-size: 13.5px;
      color: var(--ink-soft, #3f4c45);
      line-height: 1.45;
      max-width: 780px;
    }

    .header-controls {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    /* Segmented Control / Tablist */
    .mode-switch-wrapper {
      display: inline-flex;
      background: var(--wall-tint, #f3f6f3);
      border: 1.5px solid var(--frame-soft, #c3d0c7);
      border-radius: 12px 16px 12px 16px / 14px 12px 16px 14px;
      padding: 3px;
      gap: 4px;
    }

    .mode-tab-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      background: transparent;
      border: none;
      border-radius: 9px;
      font-family: var(--sans, 'IBM Plex Sans', sans-serif);
      font-size: 13px;
      font-weight: 600;
      color: var(--ink-soft, #3f4c45);
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover:not(.is-active) {
        background: rgba(23, 96, 62, 0.08);
        color: var(--ink, #1c2621);
      }

      &.is-active {
        background: var(--panel, #ffffff);
        color: var(--pine, #17603e);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        border: 1px solid var(--frame-soft, #c3d0c7);
      }

      &:focus-visible {
        outline: 2px solid var(--pine, #17603e);
        outline-offset: 2px;
      }
    }

    .tab-icon {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
    }

    /* Botão de Tema */
    .theme-toggle-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
      border-radius: 11px 15px 12px 14px / 14px 12px 15px 11px;
      border: 1.5px solid var(--edge, #6f7d74);
      background: var(--panel, #ffffff);
      color: var(--pine, #17603e);
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover {
        background: var(--wall-tint, #f3f6f3);
        border-color: var(--pine, #17603e);
      }

      &:focus-visible {
        outline: 2px solid var(--pine, #17603e);
        outline-offset: 2px;
      }

      svg {
        width: 18px;
        height: 18px;
      }
    }

    .sandbox-content {
      display: flex;
      flex-direction: column;
      flex: 1;
      width: 100%;
    }

    .mode-panel {
      display: flex;
      flex-direction: column;
      width: 100%;
    }

    @media (max-width: 768px) {
      .sandbox-page {
        padding: 12px;
        gap: 12px;
      }

      .sandbox-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .header-controls {
        width: 100%;
        justify-content: space-between;
      }

      .mode-switch-wrapper {
        width: 100%;
      }

      .mode-tab-btn {
        flex: 1;
        justify-content: center;
        padding: 8px 10px;
        font-size: 12px;
      }
    }
  `]
})
export class SandboxComponent implements OnInit, OnDestroy {
  protected readonly session = inject(SandboxSessionService);
  protected readonly themeService = inject(ThemeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private queryParamSub?: Subscription;

  public readonly activeMode = signal<SandboxMode>('lab');
  public readonly arenaCategory = signal<ArenaCategory>('sorting');
  public readonly arenaLeftId = signal<string>('heap-sort');
  public readonly arenaRightId = signal<string>('quick-sort');

  constructor() {
    this.applyQueryParams(this.route.snapshot.queryParamMap);
  }

  public ngOnInit(): void {
    this.queryParamSub = this.route.queryParamMap.subscribe((params) => {
      this.applyQueryParams(params);
    });
  }

  public ngOnDestroy(): void {
    this.queryParamSub?.unsubscribe();
  }

  public setMode(mode: SandboxMode): void {
    this.activeMode.set(mode);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { mode },
      queryParamsHandling: 'merge'
    }).catch(() => {
      // Catch navigation error for test environments
    });
  }

  private applyQueryParams(params: ParamMap): void {
    const mode = params.get('mode');
    if (mode === 'arena') {
      this.activeMode.set('arena');
    } else if (mode === 'lab') {
      this.activeMode.set('lab');
    }

    const structure = params.get('structure') as SandboxStructureType | null;
    if (structure) {
      this.session.selectStructure(structure);
    }

    const ops = params.get('ops');
    if (ops) {
      this.session.executeBatchScript(ops);
    }

    const category = params.get('category') as ArenaCategory | null;
    if (category && (category === 'sorting' || category === 'trees')) {
      this.arenaCategory.set(category);
    }

    const left = params.get('left');
    if (left) {
      this.arenaLeftId.set(left);
    }

    const right = params.get('right');
    if (right) {
      this.arenaRightId.set(right);
    }
  }
}
