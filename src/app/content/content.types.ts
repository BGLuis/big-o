export interface ComplexitySpec {
  readonly best: string;
  readonly average: string;
  readonly worst: string;
  readonly theta?: string;
}

export type ContentCategory = 'sorting' | 'data-structure' | 'algorithm';

export type AlgorithmFamily = 'linear' | 'hierarchical' | 'graph' | 'stack' | 'queue' | 'hash-map' | 'linked-list';

export interface LegendItem {
  readonly label: string;
  readonly colorClass: 'box-completed' | 'box-comparing' | 'box-pivot' | 'box-normal' | 'box-accent' | string;
}

export interface AlgorithmContent {
  readonly id: string;
  readonly title: string;
  readonly category: ContentCategory;
  readonly family: AlgorithmFamily;
  readonly timeComplexity: ComplexitySpec;
  readonly spaceComplexity: string;
  readonly shortDescription: string;
  readonly fullExplanation: string;
  readonly pseudoCode: readonly string[];
  readonly kicker?: string;
  readonly pedagogicalNote?: string;
  readonly legend?: readonly LegendItem[];
}
