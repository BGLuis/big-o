import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-hero-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hero-preview.component.html',
  styleUrl: './hero-preview.component.scss'
})
export class HeroPreviewComponent {}
