import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemeMode = 'system' | 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly systemPrefersDark = signal<boolean>(false);
  public readonly mode = signal<ThemeMode>('system');

  public readonly isDark = computed<boolean>(() => {
    const currentMode = this.mode();
    if (currentMode === 'dark') return true;
    if (currentMode === 'light') return false;
    return this.systemPrefersDark();
  });

  constructor() {
    if (this.isBrowser) {
      this.initThemeListener();
    }
  }

  public setMode(newMode: ThemeMode): void {
    this.mode.set(newMode);
    if (this.isBrowser) {
      try {
        localStorage.setItem('big-o-theme-mode', newMode);
      } catch {
        // localStorage may be disabled or restricted in private browsing
      }
      this.applyThemeAttribute(newMode);
    }
  }

  public toggleTheme(): void {
    const currentDark = this.isDark();
    this.setMode(currentDark ? 'light' : 'dark');
  }

  private initThemeListener(): void {
    try {
      const saved = localStorage.getItem('big-o-theme-mode') as ThemeMode | null;
      if (saved && (saved === 'light' || saved === 'dark' || saved === 'system')) {
        this.mode.set(saved);
      }
    } catch {
      // Ignore localStorage errors
    }

    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.systemPrefersDark.set(mediaQuery.matches);
      mediaQuery.addEventListener('change', (e) => {
        this.systemPrefersDark.set(e.matches);
        if (this.mode() === 'system') {
          this.applyThemeAttribute('system');
        }
      });
    }

    this.applyThemeAttribute(this.mode());
  }

  private applyThemeAttribute(mode: ThemeMode): void {
    const root = document.documentElement;
    if (mode === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', mode);
    }
  }
}
