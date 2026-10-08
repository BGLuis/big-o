import { describe, it, expect } from 'vitest';
import { createInitialLinearState, linearReducer } from './linear-state';
import { computeLinearLayout } from './linear-layout';
import { generateQuickSortEvents } from './algorithms/quick-sort.generator';
import { generateBubbleSortEvents } from './algorithms/bubble-sort.generator';
import { generateSelectionSortEvents } from './algorithms/selection-sort.generator';
import { generateInsertionSortEvents } from './algorithms/insertion-sort.generator';
import { generateMergeSortEvents } from './algorithms/merge-sort.generator';
import { generateHeapSortEvents } from './algorithms/heap-sort.generator';
import { generateCountingSortEvents } from './algorithms/counting-sort.generator';
import { generateRadixSortEvents } from './algorithms/radix-sort.generator';
import { generateDualPivotQuickSortEvents } from './algorithms/dual-pivot-quick-sort.generator';
import { generateTimsortEvents } from './algorithms/timsort.generator';
import { generateIntrosortEvents } from './algorithms/introsort.generator';
import { generateArrayOperationsEvents } from './algorithms/array-ops.generator';

describe('Linear Family & Algorithms', () => {
  describe('computeLinearLayout (Purity & Responsiveness)', () => {
    it('should fit all bars inside a 360px mobile viewport without overflow', () => {
      const state = createInitialLinearState([45, 12, 85, 32, 89, 39, 69, 44, 42, 1, 90, 56]);
      const containerWidth = 360;
      const containerHeight = 300;

      const result = computeLinearLayout(state, containerWidth, containerHeight);

      expect(result.elementBoxes.size).toBe(12);

      for (const [id, box] of result.elementBoxes) {
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(containerWidth);
        expect(box.y).toBeGreaterThanOrEqual(0);
        expect(box.y + box.height).toBeLessThanOrEqual(containerHeight);
      }
    });

    it('should compute auxiliary element boxes when auxElements are present', () => {
      let state = createInitialLinearState([10, 20]);
      state = linearReducer(state, {
        type: 'set-aux',
        title: 'Buffer Auxiliar',
        elements: [
          { id: 'aux-0', value: 10, label: '0' },
          { id: 'aux-1', value: 20, label: '1' }
        ],
        narration: 'Aux'
      });

      const result = computeLinearLayout(state, 500, 400);
      expect(result.hasAux).toBe(true);
      expect(result.auxBoxes.size).toBe(2);
      for (const [id, box] of result.auxBoxes) {
        expect(box.y).toBeGreaterThan(result.mainAreaHeight);
      }
    });

    it('should be completely pure (same input always produces same output)', () => {
      const state = createInitialLinearState([10, 20, 30]);
      const r1 = computeLinearLayout(state, 500, 400);
      const r2 = computeLinearLayout(state, 500, 400);

      expect(r1.barWidth).toBe(r2.barWidth);
      expect(Array.from(r1.elementBoxes.entries())).toEqual(Array.from(r2.elementBoxes.entries()));
    });
  });

  describe('Quick Sort Generator', () => {
    it('should successfully sort array when applying all emitted deltas through reducer', () => {
      const inputValues = [34, 7, 23, 32, 5, 62];
      let state = createInitialLinearState(inputValues);
      const events = Array.from(generateQuickSortEvents(state.elements));

      for (const event of events) {
        state = linearReducer(state, event);
      }

      const finalValues = state.elements.map((e) => e.value);
      const expected = [...inputValues].sort((a, b) => a - b);
      expect(finalValues).toEqual(expected);

      for (const el of state.elements) {
        expect(el.state).toBe('completed');
      }
    });
  });

  describe('Bubble Sort Generator', () => {
    it('should successfully sort array when applying all emitted deltas through reducer', () => {
      const inputValues = [15, 3, 9, 8, 2];
      let state = createInitialLinearState(inputValues);
      const events = Array.from(generateBubbleSortEvents(state.elements));

      for (const event of events) {
        state = linearReducer(state, event);
      }

      const finalValues = state.elements.map((e) => e.value);
      const expected = [...inputValues].sort((a, b) => a - b);
      expect(finalValues).toEqual(expected);
    });
  });

  describe('Selection Sort Generator', () => {
    it('should successfully sort array and have narration for every step', () => {
      const inputValues = [29, 10, 14, 37, 13];
      let state = createInitialLinearState(inputValues);
      const events = Array.from(generateSelectionSortEvents(state.elements));

      for (const event of events) {
        expect(event.narration).toBeDefined();
        state = linearReducer(state, event);
      }

      const finalValues = state.elements.map((e) => e.value);
      const expected = [...inputValues].sort((a, b) => a - b);
      expect(finalValues).toEqual(expected);
    });
  });

  describe('Insertion Sort Generator', () => {
    it('should successfully sort array and have narration for every step', () => {
      const inputValues = [12, 11, 13, 5, 6];
      let state = createInitialLinearState(inputValues);
      const events = Array.from(generateInsertionSortEvents(state.elements));

      for (const event of events) {
        expect(event.narration).toBeDefined();
        state = linearReducer(state, event);
      }

      const finalValues = state.elements.map((e) => e.value);
      const expected = [...inputValues].sort((a, b) => a - b);
      expect(finalValues).toEqual(expected);
    });
  });

  describe('Merge Sort Generator', () => {
    it('should successfully sort array using aux buffer events', () => {
      const inputValues = [38, 27, 43, 3, 9, 82, 10];
      let state = createInitialLinearState(inputValues);
      const events = Array.from(generateMergeSortEvents(state.elements));

      for (const event of events) {
        expect(event.narration).toBeDefined();
        state = linearReducer(state, event);
      }

      const finalValues = state.elements.map((e) => e.value);
      const expected = [...inputValues].sort((a, b) => a - b);
      expect(finalValues).toEqual(expected);
      expect(state.auxElements.length).toBe(0); // Aux cleared at the end
    });
  });

  describe('Heap Sort Generator', () => {
    it('should successfully sort array in-place via max-heap', () => {
      const inputValues = [4, 10, 3, 5, 1];
      let state = createInitialLinearState(inputValues);
      const events = Array.from(generateHeapSortEvents(state.elements));

      for (const event of events) {
        expect(event.narration).toBeDefined();
        state = linearReducer(state, event);
      }

      const finalValues = state.elements.map((e) => e.value);
      const expected = [...inputValues].sort((a, b) => a - b);
      expect(finalValues).toEqual(expected);
    });
  });

  describe('Counting Sort Generator', () => {
    it('should successfully sort integers using frequency aux array', () => {
      const inputValues = [4, 2, 2, 8, 3, 3, 1];
      let state = createInitialLinearState(inputValues);
      const events = Array.from(generateCountingSortEvents(state.elements));

      for (const event of events) {
        expect(event.narration).toBeDefined();
        state = linearReducer(state, event);
      }

      const finalValues = state.elements.map((e) => e.value);
      const expected = [...inputValues].sort((a, b) => a - b);
      expect(finalValues).toEqual(expected);
    });
  });

  describe('Radix Sort Generator', () => {
    it('should successfully sort array digit by digit', () => {
      const inputValues = [170, 45, 75, 90, 802, 24, 2, 66];
      let state = createInitialLinearState(inputValues);
      const events = Array.from(generateRadixSortEvents(state.elements));

      for (const event of events) {
        expect(event.narration).toBeDefined();
        state = linearReducer(state, event);
      }

      const finalValues = state.elements.map((e) => e.value);
      const expected = [...inputValues].sort((a, b) => a - b);
      expect(finalValues).toEqual(expected);
    });
  });

  describe('Dual-Pivot QuickSort Generator', () => {
    it('should successfully sort array with two pivots and 3 partitions', () => {
      const inputValues = [24, 8, 42, 75, 2, 19, 63];
      let state = createInitialLinearState(inputValues);
      const events = Array.from(generateDualPivotQuickSortEvents(state.elements));

      for (const event of events) {
        expect(event.narration).toBeDefined();
        state = linearReducer(state, event);
      }

      const finalValues = state.elements.map((e) => e.value);
      const expected = [...inputValues].sort((a, b) => a - b);
      expect(finalValues).toEqual(expected);
    });
  });

  describe('Timsort Generator', () => {
    it('should successfully sort array combining runs and merges', () => {
      const inputValues = [15, 2, 9, 33, 4, 1, 50, 22, 17, 8];
      let state = createInitialLinearState(inputValues);
      const events = Array.from(generateTimsortEvents(state.elements));

      for (const event of events) {
        expect(event.narration).toBeDefined();
        state = linearReducer(state, event);
      }

      const finalValues = state.elements.map((e) => e.value);
      const expected = [...inputValues].sort((a, b) => a - b);
      expect(finalValues).toEqual(expected);
    });
  });

  describe('Introsort Generator', () => {
    it('should successfully sort array combining quick, heap and insertion', () => {
      const inputValues = [88, 12, 45, 6, 73, 23, 91, 3, 34, 18];
      let state = createInitialLinearState(inputValues);
      const events = Array.from(generateIntrosortEvents(state.elements));

      for (const event of events) {
        expect(event.narration).toBeDefined();
        state = linearReducer(state, event);
      }

      const finalValues = state.elements.map((e) => e.value);
      const expected = [...inputValues].sort((a, b) => a - b);
      expect(finalValues).toEqual(expected);
    });
  });

  describe('Array Operations Generator', () => {
    it('should generate events for indexed access, search, and insertion with shift', () => {
      const inputValues = [10, 20, 30, 40, 50];
      let state = createInitialLinearState(inputValues);
      const events = Array.from(generateArrayOperationsEvents(state.elements));

      expect(events.length).toBeGreaterThan(4);
      for (const event of events) {
        expect(event.narration).toBeDefined();
        state = linearReducer(state, event);
      }
      expect(state.elements.some((e) => e.value === 99)).toBe(true);
    });
  });
});
