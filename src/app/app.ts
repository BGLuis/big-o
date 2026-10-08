import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { SideNavBarComponent } from './shared/components/side-nav-bar/side-nav-bar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SideNavBarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly router = inject(Router);

  protected readonly title = signal('big-o-viz');
  protected readonly isSidebarCollapsed = signal(false);

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

  protected toggleSidebar(): void {
    this.isSidebarCollapsed.update((isCollapsed) => !isCollapsed);
  }
}
