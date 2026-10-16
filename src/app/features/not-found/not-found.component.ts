import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="not-found-container" role="main">
      <div class="not-found-card">
        <span class="kicker mono">ERRO 404 · O(∞)</span>
        <h1 class="not-found-title hand">Página Não Encontrada</h1>
        <p class="not-found-desc">
          O algoritmo buscou por todos os caminhos do grafo, mas este endereço não existe ou foi reorganizado.
        </p>

        <div class="not-found-actions">
          <a routerLink="/trilhas" class="btn btn-primary">
            Explorar Trilhas
          </a>
          <a routerLink="/" class="btn btn-secondary">
            Página Inicial
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      min-height: 100vh;
      min-height: 100dvh;
    }

    .not-found-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      min-height: 100dvh;
      padding: 24px;
      background: var(--bg-surface, #ffffff);
      box-sizing: border-box;
    }

    .not-found-card {
      max-width: 520px;
      width: 100%;
      background: var(--panel, #ffffff);
      border: 1.5px solid var(--frame-soft, #c3d0c7);
      border-radius: 16px 24px 16px 24px / 22px 16px 24px 16px;
      padding: 40px 32px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
    }

    .kicker {
      font-size: 12px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--coral, #cc5544);
      font-weight: 600;
    }

    .hand {
      font-family: var(--hand, 'Caveat', cursive);
      line-height: 1.1;
    }

    .mono {
      font-family: var(--mono, 'IBM Plex Mono', monospace);
    }

    .not-found-title {
      font-size: 42px;
      font-weight: 600;
      color: var(--ink, #1c2621);
      margin: 0;
    }

    .not-found-desc {
      font-family: var(--sans, 'IBM Plex Sans', sans-serif);
      font-size: 15px;
      line-height: 1.6;
      color: var(--ink-soft, #3f4c45);
      margin: 0;
      max-width: 440px;
    }

    .not-found-actions {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-top: 12px;
      flex-wrap: wrap;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 42px;
      padding: 0 20px;
      border-radius: 12px 18px 13px 16px / 16px 13px 18px 12px;
      font-family: var(--sans, 'IBM Plex Sans', sans-serif);
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.15s ease;
      cursor: pointer;

      &:focus-visible {
        outline: 2px solid var(--pine, #17603e);
        outline-offset: 2px;
      }
    }

    .btn-primary {
      background: var(--pine, #17603e);
      border: 1.5px solid var(--pine, #17603e);
      color: #ffffff;

      &:hover {
        background: var(--pine-strong, #0f4a2f);
      }
    }

    .btn-secondary {
      background: var(--panel, #ffffff);
      border: 1.5px solid var(--edge, #6f7d74);
      color: var(--ink, #1c2621);

      &:hover {
        background: var(--wall-tint, #f3f6f3);
      }
    }
  `]
})
export class NotFoundComponent {}
