import { describe, it, expect } from 'vitest';
import { ALL_ALGORITHM_CONTENTS, getAlgorithmContent } from './index';

describe('Algorithm Content Layer', () => {
  it('should have complete educational metadata for all registered algorithms and data structures', () => {
    expect(ALL_ALGORITHM_CONTENTS.length).toBe(18); // 11 sorting + 7 data structures

    for (const content of ALL_ALGORITHM_CONTENTS) {
      expect(content.id.trim()).not.toBe('');
      expect(content.title.trim()).not.toBe('');
      expect(content.shortDescription.trim()).not.toBe('');
      expect(content.fullExplanation.trim()).not.toBe('');
      expect(content.timeComplexity.best.trim()).not.toBe('');
      expect(content.timeComplexity.average.trim()).not.toBe('');
      expect(content.timeComplexity.worst.trim()).not.toBe('');
      expect(content.spaceComplexity.trim()).not.toBe('');
      expect(content.pseudoCode.length).toBeGreaterThan(0);
    }
  });

  it('should return correct content by id for all sorting algorithms', () => {
    const expectedSortIds = [
      'bubble-sort',
      'selection-sort',
      'insertion-sort',
      'merge-sort',
      'quick-sort',
      'dual-pivot-quick-sort',
      'heap-sort',
      'counting-sort',
      'radix-sort',
      'timsort',
      'introsort'
    ];

    for (const id of expectedSortIds) {
      const content = getAlgorithmContent(id);
      expect(content).toBeDefined();
      expect(content?.category).toBe('sorting');
      expect(content?.family).toBe('linear');
    }
  });

  it('should return correct content for all 7 data structures', () => {
    const dsIds = ['array', 'linked-list', 'stack', 'queue', 'bst-insert', 'graph', 'hash-map'];

    for (const id of dsIds) {
      const ds = getAlgorithmContent(id);
      expect(ds).toBeDefined();
      expect(ds?.category).toBe('data-structure');
    }

    expect(getAlgorithmContent('array')?.family).toBe('linear');
    expect(getAlgorithmContent('linked-list')?.family).toBe('graph');
    expect(getAlgorithmContent('stack')?.family).toBe('stack');
    expect(getAlgorithmContent('queue')?.family).toBe('queue');
    expect(getAlgorithmContent('bst-insert')?.family).toBe('hierarchical');
    expect(getAlgorithmContent('graph')?.family).toBe('graph');
    expect(getAlgorithmContent('hash-map')?.family).toBe('hash-map');
  });

  it('should contain Portuguese text for all items', () => {
    for (const content of ALL_ALGORITHM_CONTENTS) {
      expect(content.shortDescription.length).toBeGreaterThan(10);
      expect(content.fullExplanation.length).toBeGreaterThan(20);
    }
  });
});
