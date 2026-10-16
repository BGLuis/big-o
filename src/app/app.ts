import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { SideNavBarComponent } from './shared/components/side-nav-bar/side-nav-bar.component';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, SideNavBarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  host: {
    '(keydown.escape)': 'closeMobileDrawer()'
  }
})
export class App {
  private readonly router = inject(Router);

  protected readonly title = signal('big-o-viz');
  protected readonly isSidebarCollapsed = signal(false);
  protected readonly isMobileDrawerOpen = signal(false);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  protected readonly isLandingPage = computed(() => {
    const rawUrl = this.currentUrl() ?? '';
    const cleanUrl = rawUrl.split('?')[0].split('#')[0];
    return cleanUrl === '' || cleanUrl === '/';
  });

  constructor() {
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      takeUntilDestroyed()
    ).subscribe(() => {
      this.closeMobileDrawer();
    });
  }

  protected toggleSidebar(): void {
    this.isSidebarCollapsed.update((isCollapsed) => !isCollapsed);
  }

  protected toggleMobileDrawer(): void {
    this.isMobileDrawerOpen.update((open) => !open);
  }

  protected closeMobileDrawer(): void {
    this.isMobileDrawerOpen.set(false);
  }
}
