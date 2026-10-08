import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ALL_ALGORITHM_CONTENTS, AlgorithmContent } from '../../../content';

@Component({
  selector: 'app-side-nav-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="side-nav" [class.collapsed]="collapsed()" aria-label="Navegação principal">
      <div class="nav-header">
        <div class="brand">
          <div class="logo">Big O Visualizer</div>
          <div class="subtitle">Laboratório Didático</div>
        </div>
        <button
          type="button"
          class="collapse-toggle"
          (click)="collapseToggled.emit()"
          [attr.aria-label]="collapsed() ? 'Expandir barra lateral' : 'Recolher barra lateral'"
          [attr.aria-expanded]="!collapsed()"
          aria-controls="primary-nav-links"
        >
          <span aria-hidden="true">{{ collapsed() ? '»' : '«' }}</span>
          <span class="toggle-label">{{ collapsed() ? 'Recolher' : 'Recolher' }}</span>
        </button>
      </div>

      <div id="primary-nav-links" class="nav-links">
        <!-- Sorting Dropdown Group -->
        <div class="nav-group">
          <button
            type="button"
            class="nav-group-header"
            [class.open]="sortingOpen()"
            (click)="toggleSorting()"
            [attr.aria-expanded]="sortingOpen()"
            aria-controls="sorting-sublist"
            title="Ordenação">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <polyline points="16 18 22 12 16 6"/>
              <polyline points="8 6 2 12 8 18"/>
            </svg>
            <span class="group-title">Ordenação</span>
            <svg
              class="chevron-icon"
              [class.rotated]="sortingOpen()"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          @if (sortingOpen() && !collapsed()) {
            <div id="sorting-sublist" class="sub-links-list" role="list">
              @for (algo of sortingAlgorithms; track algo.id) {
                <a
                  [routerLink]="['/ordenacao', algo.id]"
                  routerLinkActive="active-sublink"
                  class="sub-link-item"
                  role="listitem">
                  <span class="sub-link-dot" aria-hidden="true"></span>
                  <span class="sub-link-name">{{ algo.title }}</span>
                  <span class="sub-link-pill">{{ algo.timeComplexity.average }}</span>
                </a>
              }
            </div>
          }
        </div>

        <!-- Data Structures Dropdown Group -->
        <div class="nav-group">
          <button
            type="button"
            class="nav-group-header"
            [class.open]="dataStructuresOpen()"
            (click)="toggleDataStructures()"
            [attr.aria-expanded]="dataStructuresOpen()"
            aria-controls="data-structures-sublist"
            title="Estruturas de Dados">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <ellipse cx="12" cy="5" rx="9" ry="3"/>
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
            </svg>
            <span class="group-title">Estruturas de Dados</span>
            <svg
              class="chevron-icon"
              [class.rotated]="dataStructuresOpen()"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          @if (dataStructuresOpen() && !collapsed()) {
            <div id="data-structures-sublist" class="sub-links-list" role="list">
              @for (ds of dataStructures; track ds.id) {
                <a
                  [routerLink]="['/data-structures', ds.id]"
                  routerLinkActive="active-sublink"
                  class="sub-link-item"
                  role="listitem">
                  <span class="sub-link-dot" aria-hidden="true"></span>
                  <span class="sub-link-name">{{ ds.title }}</span>
                  <span class="sub-link-pill">{{ ds.timeComplexity.average }}</span>
                </a>
              }
            </div>
          }
        </div>
      </div>

      <div class="nav-footer">
        <div class="footer-info" [class.hidden-collapsed]="collapsed()">
          <span class="version-label">Big O Sandbox v2</span>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    .side-nav {
      width: 280px;
      min-width: 280px;
      height: 100%;
      background: var(--color-bg-surface, #152031);
      border-right: 1px solid var(--color-border, #64748b);
      display: flex;
      flex-direction: column;
      padding: 20px 0;
      box-sizing: border-box;
      transition: width 0.2s ease, min-width 0.2s ease;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .side-nav.collapsed {
      width: 80px;
      min-width: 80px;
    }

    .nav-header {
      padding: 0 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      border-bottom: 1px solid var(--color-border, #64748b);
    }

    .brand {
      padding: 0 4px;
    }

    .side-nav.collapsed .brand {
      display: none;
    }

    .logo {
      color: var(--color-primary, #818cf8);
      font-size: 1.15rem;
      font-weight: 700;
      letter-spacing: -0.5px;
    }

    .subtitle {
      color: var(--color-text-muted, #94a3b8);
      font-size: 0.8rem;
      font-weight: 500;
    }

    .collapse-toggle {
      border: 1px solid var(--color-border, #64748b);
      border-radius: 8px;
      background: var(--color-bg-surface-alt, #1f2a3c);
      color: var(--color-text-muted, #94a3b8);
      font-size: 12px;
      font-weight: 600;
      padding: 6px 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .collapse-toggle:hover {
      background: var(--color-bg-main, #081425);
      color: var(--color-text-main, #d8e3fb);
    }

    .collapse-toggle:focus-visible,
    .nav-group-header:focus-visible,
    .sub-link-item:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }

    .side-nav.collapsed .toggle-label {
      display: none;
    }

    .nav-links {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 16px 10px;
    }

    .nav-group {
      display: flex;
      flex-direction: column;
      border-radius: 8px;
      overflow: hidden;
    }

    .nav-group-header {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      background: none;
      border: none;
      border-radius: 8px;
      color: var(--color-text-main, #d8e3fb);
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s ease, color 0.15s ease;
      text-align: left;

      &:hover {
        background: var(--color-bg-surface-alt, #1f2a3c);
      }

      .nav-icon {
        width: 18px;
        height: 18px;
        color: var(--color-primary, #818cf8);
        flex-shrink: 0;
      }

      .group-title {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .chevron-icon {
        width: 16px;
        height: 16px;
        color: var(--color-text-muted, #94a3b8);
        transition: transform 0.2s ease;
        flex-shrink: 0;

        &.rotated {
          transform: rotate(180deg);
        }
      }
    }

    .side-nav.collapsed .nav-group-header {
      justify-content: center;
      padding: 10px 0;

      .group-title,
      .chevron-icon {
        display: none;
      }
    }

    /* Sub Links Dropdown List */
    .sub-links-list {
      display: flex;
      flex-direction: column;
      gap: 3px;
      padding: 4px 0 6px 14px;
      margin-left: 10px;
      border-left: 2px solid var(--color-border, #64748b);
    }

    .sub-link-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 7px 10px;
      border-radius: 6px;
      text-decoration: none;
      color: var(--color-text-muted, #94a3b8);
      font-size: 0.8rem;
      font-weight: 500;
      transition: all 0.15s ease;

      .sub-link-dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: var(--color-border, #64748b);
        flex-shrink: 0;
      }

      .sub-link-name {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .sub-link-pill {
        font-family: var(--font-family-mono, monospace);
        font-size: 0.7rem;
        padding: 1px 6px;
        border-radius: 4px;
        background: var(--color-bg-surface-alt, #1f2a3c);
        color: var(--color-text-dim, #8b9bb4);
        flex-shrink: 0;
      }

      &:hover {
        background: var(--color-bg-surface-alt, #1f2a3c);
        color: var(--color-text-main, #d8e3fb);

        .sub-link-dot {
          background: var(--color-primary, #818cf8);
        }
      }

      &.active-sublink {
        background: var(--color-bg-active-link, rgba(129, 140, 248, 0.15));
        color: var(--color-primary, #818cf8);
        font-weight: 600;

        .sub-link-dot {
          background: var(--color-primary, #818cf8);
          box-shadow: 0 0 6px var(--color-primary);
        }

        .sub-link-pill {
          background: var(--color-bg-surface);
          color: var(--color-primary, #818cf8);
        }
      }
    }

    .nav-footer {
      padding: 12px 16px 0;
      border-top: 1px solid var(--color-border, #64748b);

      .version-label {
        font-size: 0.75rem;
        color: var(--color-text-dim, #8b9bb4);
        font-weight: 600;
      }

      .hidden-collapsed {
        display: none;
      }
    }
  `]
})
export class SideNavBarComponent {
  public readonly collapsed = input<boolean>(false);
  public readonly collapseToggled = output<void>();

  public readonly sortingAlgorithms = ALL_ALGORITHM_CONTENTS.filter(
    (c) => c.category === 'sorting' || c.category === 'algorithm'
  );
  public readonly dataStructures = ALL_ALGORITHM_CONTENTS.filter((c) => c.category === 'data-structure');

  public readonly sortingOpen = signal<boolean>(true);
  public readonly dataStructuresOpen = signal<boolean>(false);

  // Backward-compatibility aliases
  public get algorithms() {
    return this.sortingAlgorithms;
  }

  public get algorithmsOpen() {
    return this.sortingOpen;
  }

  public toggleSorting(): void {
    if (this.collapsed()) {
      this.collapseToggled.emit();
      this.sortingOpen.set(true);
      return;
    }
    this.sortingOpen.update((open) => !open);
  }

  public toggleAlgorithms(): void {
    this.toggleSorting();
  }

  public toggleDataStructures(): void {
    if (this.collapsed()) {
      this.collapseToggled.emit();
      this.dataStructuresOpen.set(true);
      return;
    }
    this.dataStructuresOpen.update((open) => !open);
  }
}
