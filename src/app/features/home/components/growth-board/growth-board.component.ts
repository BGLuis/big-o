import { ChangeDetectionStrategy, Component } from '@angular/core';

export interface GrowthComparisonRow {
  readonly notation: string;
  readonly colorClass: string;
  readonly n10: string;
  readonly n100: string;
  readonly n1k: string;
  readonly n1m: string;
}

@Component({
  selector: 'app-growth-board',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './growth-board.component.html',
  styleUrl: './growth-board.component.scss'
})
export class GrowthBoardComponent {
  protected readonly growthRows: readonly GrowthComparisonRow[] = [
    { notation: 'O(1)', colorClass: 'badge-o1', n10: '1', n100: '1', n1k: '1', n1m: '1' },
    { notation: 'O(log n)', colorClass: 'badge-ologn', n10: '3', n100: '7', n1k: '10', n1m: '20' },
    { notation: 'O(n)', colorClass: 'badge-on', n10: '10', n100: '100', n1k: '1 000', n1m: '10⁶' },
    { notation: 'O(n log n)', colorClass: 'badge-onlogn', n10: '33', n100: '664', n1k: '9 966', n1m: '≈ 2·10⁷' },
    { notation: 'O(n²)', colorClass: 'badge-on2', n10: '100', n100: '10⁴', n1k: '10⁶', n1m: '10¹²' },
    { notation: 'O(2ⁿ)', colorClass: 'badge-o2n', n10: '1 024', n100: '≈ 10³⁰', n1k: 'não termina', n1m: 'não termina' }
  ];
}
