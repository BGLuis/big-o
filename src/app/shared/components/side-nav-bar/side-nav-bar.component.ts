import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ALL_ALGORITHM_CONTENTS } from '../../../content';

@Component({
  selector: 'app-side-nav-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, NgOptimizedImage],
  template: `
    <nav class="side-nav" [class.collapsed]="collapsed()" aria-label="Navegação do catálogo">
      <!-- Cabeçalho da Barra Lateral -->
      <div class="nav-header">
        <a routerLink="/trilhas" class="brand" aria-label="Ir para o catálogo de trilhas">
          <div class="logo">
            Big<span class="logo-accent-o"> O</span>
            <span class="logo-omega"> Ω</span>
            <span class="logo-theta"> Θ</span>
          </div>
          <div class="subtitle">plano de aula</div>
        </a>

        <button
          type="button"
          class="collapse-toggle"
          (click)="collapseToggled.emit()"
          [attr.aria-label]="collapsed() ? 'Expandir barra lateral' : 'Recolher barra lateral'"
          [attr.aria-expanded]="!collapsed()"
          aria-controls="primary-nav-links"
        >
          <span aria-hidden="true">{{ collapsed() ? '»' : '«' }}</span>
          <span class="toggle-label">{{ collapsed() ? 'Expandir' : 'Recolher' }}</span>
        </button>
      </div>

      <!-- Links de Navegação -->
      <div id="primary-nav-links" class="nav-links">
        <!-- Sandbox & Arena Link Destacado -->
        <a
          routerLink="/sandbox"
          routerLinkActive="active-sublink"
          class="sandbox-nav-link"
          [attr.title]="collapsed() ? 'Sandbox & Arena' : null"
          aria-label="Ir para o Sandbox e Arena de experimentos"
        >
          <div class="sandbox-nav-main">
            <svg
              class="sandbox-nav-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M10 2v7.31M14 2v7.31M8.5 2h7M14 9.3a6.5 6.5 0 1 1-4 0" />
              <path d="M5.52 16h12.96" />
            </svg>
            @if (!collapsed()) {
              <span class="sandbox-nav-text">Sandbox & Arena</span>
              <span class="sandbox-nav-badge">NOVO</span>
            }
          </div>
        </a>

        <!-- Grupo 1: Ordenação -->
        <div class="nav-group">
          <button
            type="button"
            class="nav-group-header"
            [class.open]="sortingOpen()"
            (click)="toggleSorting()"
            [attr.aria-expanded]="sortingOpen()"
            aria-controls="sorting-sublist"
            title="Ordenação"
          >
            <img
              ngSrc="assets/icon-sorting.svg"
              alt=""
              width="17"
              height="17"
              class="nav-icon"
              aria-hidden="true"
            />
            <span class="group-title">Ordenação</span>
            <svg
              class="chevron-icon"
              [class.rotated]="sortingOpen()"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          @if (sortingOpen() && !collapsed()) {
            <div id="sorting-sublist" class="sub-links-list" role="list">
              @for (algo of sortingAlgorithms; track algo.id) {
                <a
                  [routerLink]="['/ordenacao', algo.id]"
                  routerLinkActive="active-sublink"
                  class="sub-link-item"
                  role="listitem"
                >
                  <span class="sub-link-indicator" aria-hidden="true"></span>
                  <span class="sub-link-name">{{ algo.title }}</span>
                  <span class="sub-link-pill">{{ algo.timeComplexity.theta || algo.timeComplexity.worst || algo.timeComplexity.average }}</span>
                </a>
              }
            </div>
          }
        </div>

        <!-- Grupo 2: Estruturas de Dados -->
        <div class="nav-group">
          <button
            type="button"
            class="nav-group-header"
            [class.open]="dataStructuresOpen()"
            (click)="toggleDataStructures()"
            [attr.aria-expanded]="dataStructuresOpen()"
            aria-controls="data-structures-sublist"
            title="Estruturas de Dados"
          >
            <img
              ngSrc="assets/icon-data-structures.svg"
              alt=""
              width="17"
              height="17"
              class="nav-icon"
              aria-hidden="true"
            />
            <span class="group-title">Estruturas de Dados</span>
            <svg
              class="chevron-icon"
              [class.rotated]="dataStructuresOpen()"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          @if (dataStructuresOpen() && !collapsed()) {
            <div id="data-structures-sublist" class="sub-links-list" role="list">
              @for (ds of dataStructures; track ds.id) {
                <a
                  [routerLink]="['/data-structures', ds.id]"
                  routerLinkActive="active-sublink"
                  class="sub-link-item"
                  role="listitem"
                >
                  <span class="sub-link-indicator" aria-hidden="true"></span>
                  <span class="sub-link-name">{{ ds.title }}</span>
                  <span class="sub-link-pill">{{ ds.timeComplexity.worst || ds.timeComplexity.average }}</span>
                </a>
              }
            </div>
          }
        </div>
      </div>

      <!-- Rodapé da Barra Lateral -->
      <div class="nav-footer">
        <div class="footer-info" [class.hidden-collapsed]="collapsed()">
          <span class="version-label">Big O Sandbox · v2</span>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    :host {
      display: block;
      position: sticky;
      top: 0;
      height: 100vh;
      height: 100dvh;
      align-self: flex-start;
      flex-shrink: 0;
      z-index: 50;
    }

    .side-nav {
      width: 288px;
      min-width: 288px;
      height: 100%;
      background: #ffffff;
      border-right: 1px solid #d8e0da;
      display: flex;
      flex-direction: column;
      padding: 22px 0 16px;
      box-sizing: border-box;
      transition: width 0.2s ease, min-width 0.2s ease;
      overflow-y: auto;
      overflow-x: hidden;

      &.collapsed {
        width: 72px;
        min-width: 72px;
      }
    }

    /* 1. Header */
    .nav-header {
      padding: 0 18px 18px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid #d8e0da;
      box-sizing: border-box;
    }

    .brand {
      text-decoration: none;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .side-nav.collapsed .brand {
      display: none;
    }

    .logo {
      font-family: 'Caveat', cursive;
      font-size: 30px;
      font-weight: 600;
      line-height: 29.4px;
      color: #1c2621;

      .logo-accent-o {
        color: #8a6a12;
      }
      .logo-omega {
        color: #2160b0;
      }
      .logo-theta {
        color: #1c7350;
      }
    }

    .subtitle {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 12px;
      font-weight: 400;
      color: #5a6660;
    }

    .collapse-toggle {
      border: 1px solid #c3d0c7;
      border-radius: 4px;
      background: #f8fafc;
      color: #5a6660;
      font-family: 'IBM Plex Sans', sans-serif;
      font-size: 11px;
      font-weight: 500;
      padding: 4px 8px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover {
        background: #f3f6f3;
        color: #1c2621;
        border-color: #17603e;
      }

      &:focus-visible {
        outline: 2px solid #17603e;
        outline-offset: 2px;
      }
    }

    .side-nav.collapsed .toggle-label {
      display: none;
    }

    /* 2. Lista de Grupos */
    .nav-links {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px 12px;
      box-sizing: border-box;
    }

    .sandbox-nav-link {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 9px 12px;
      background: linear-gradient(135deg, rgba(23, 96, 62, 0.08) 0%, rgba(33, 96, 176, 0.08) 100%);
      border: 1px solid #c3d0c7;
      border-radius: 8px;
      text-decoration: none;
      color: #1c2621;
      font-family: 'IBM Plex Sans', sans-serif;
      font-size: 13px;
      font-weight: 600;
      transition: all 0.15s ease;

      &:hover {
        background: linear-gradient(135deg, rgba(23, 96, 62, 0.14) 0%, rgba(33, 96, 176, 0.14) 100%);
        border-color: #17603e;
      }

      &:focus-visible {
        outline: 2px solid #17603e;
        outline-offset: 2px;
      }

      &.active-sublink {
        background: #f3f6f3;
        border-color: #17603e;
        color: #17603e;
        box-shadow: 0 1px 4px rgba(23, 96, 62, 0.12);

        .sandbox-nav-icon {
          color: #17603e;
        }
      }
    }

    .sandbox-nav-main {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }

    .sandbox-nav-icon {
      width: 18px;
      height: 18px;
      color: #17603e;
      flex-shrink: 0;
    }

    .sandbox-nav-text {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .sandbox-nav-badge {
      font-family: var(--mono, 'IBM Plex Mono', monospace);
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      background: var(--pine, #17603e);
      color: #ffffff;
      border-radius: 4px;
      letter-spacing: 0.05em;
      flex-shrink: 0;
      line-height: 1.2;
    }

    .side-nav.collapsed .sandbox-nav-link {
      justify-content: center;
      padding: 9px 0;
    }

    .nav-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .nav-group-header {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      background: none;
      border: none;
      border-radius: 6px;
      color: #1c2621;
      font-family: 'IBM Plex Sans', sans-serif;
      font-size: 13.5px;
      font-weight: 700;
      cursor: pointer;
      text-align: left;
      transition: background 0.15s ease;

      &:hover {
        background: #f3f6f3;
      }

      &:focus-visible {
        outline: 2px solid #17603e;
        outline-offset: 1px;
      }

      .nav-icon {
        flex-shrink: 0;
      }

      .group-title {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .chevron-icon {
        width: 14px;
        height: 14px;
        color: #5a6660;
        transition: transform 0.2s ease;

        &.rotated {
          transform: rotate(180deg);
        }
      }
    }

    .side-nav.collapsed .group-title,
    .side-nav.collapsed .chevron-icon {
      display: none;
    }

    /* 3. Sub-links */
    .sub-links-list {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding-left: 10px;
      margin-left: 8px;
      border-left: 1px solid #d8e0da;
    }

    .sub-link-item {
      display: flex;
      align-items: center;
      gap: 9px;
      padding: 7px 10px;
      border-radius: 7px;
      text-decoration: none;
      color: #3f4c45;
      font-family: 'IBM Plex Sans', sans-serif;
      font-size: 12.5px;
      font-weight: 500;
      transition: all 0.15s ease;

      &:hover {
        background: #f3f6f3;
        color: #1c2621;
      }

      &:focus-visible {
        outline: 2px solid #17603e;
        outline-offset: 1px;
      }

      .sub-link-indicator {
        width: 12px;
        height: 12px;
        border: 1px solid #8cd7ba;
        border-radius: 4px;
        flex-shrink: 0;
        transition: all 0.15s ease;
      }

      .sub-link-name {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .sub-link-pill {
        font-family: 'IBM Plex Mono', monospace;
        font-size: 10.5px;
        font-weight: 500;
        color: #5a6660;
        flex-shrink: 0;
      }

      /* Item Ativo (Figma: #F3F6F3 bg, #17603E green text & indicator) */
      &.active-sublink {
        background: #f3f6f3;
        color: #17603e;
        font-weight: 600;

        .sub-link-indicator {
          background: #17603e;
          border-color: #17603e;
        }

        .sub-link-name {
          color: #17603e;
        }

        .sub-link-pill {
          color: #17603e;
          font-weight: 600;
        }
      }
    }

    /* 4. Rodapé */
    .nav-footer {
      padding: 14px 18px 0;
      border-top: 1px solid #d8e0da;
      box-sizing: border-box;

      .version-label {
        font-family: 'IBM Plex Mono', monospace;
        font-size: 12px;
        color: #5a6660;
        font-weight: 400;
      }

      .hidden-collapsed {
        display: none;
      }
    }

    @media (max-width: 768px) {
      :host {
        position: relative;
        height: 100%;
        width: 100%;
      }

      .side-nav {
        width: 100%;
        min-width: 100%;
        max-width: 100%;
      }

      .collapse-toggle {
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
  public readonly dataStructures = ALL_ALGORITHM_CONTENTS.filter(
    (c) => c.category === 'data-structure'
  );

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
