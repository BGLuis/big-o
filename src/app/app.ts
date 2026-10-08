import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideNavBarComponent } from './shared/components/side-nav-bar/side-nav-bar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SideNavBarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('big-o-viz');
  protected readonly isSidebarCollapsed = signal(false);

  protected toggleSidebar(): void {
    this.isSidebarCollapsed.update((isCollapsed) => !isCollapsed);
  }
}
