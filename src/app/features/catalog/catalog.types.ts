export type TrackCategory = 'sorting' | 'data-structure';

export type CategoryFilter = 'all' | 'sorting' | 'data-structure';

export interface CatalogTrackItem {
  readonly id: string;
  readonly title: string;
  readonly category: TrackCategory;
  readonly categoryLabel: 'Ordenação' | 'Estruturas de Dados';
  readonly familyTag: string;
  readonly complexityBadge: string;
  readonly complexityTone: 'amber' | 'green';
  readonly description: string;
  readonly summaryMetrics: string;
  readonly route: readonly [string, string];
}
