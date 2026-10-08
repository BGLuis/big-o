export interface ComplexitySpec {
  readonly best: string;
  readonly average: string;
  readonly worst: string;
}

export type ContentCategory = 'sorting' | 'data-structure' | 'algorithm';

export type AlgorithmFamily = 'linear' | 'hierarchical' | 'graph' | 'stack' | 'queue' | 'hash-map';

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
}
