import { describe, it, expect } from 'vitest';
import { createInitialHashMapState, hashMapReducer } from './hash-map-state';
import { generateHashMapEvents } from './algorithms/hash-map.generator';

describe('HashMap (Tabela Hash)', () => {
  it('should initialize hash map with m buckets', () => {
    const state = createInitialHashMapState(7);
    expect(state.bucketCount).toBe(7);
    expect(state.buckets.length).toBe(7);
    expect(state.buckets.every((b) => b.entries.length === 0)).toBe(true);
  });

  it('should calculate hash and handle insertions with collision chaining', () => {
    let state = createInitialHashMapState(7);

    // Calc and insert key 15 -> bucket 1
    state = hashMapReducer(state, {
      type: 'hash-calc',
      key: 15,
      hash: 1,
      formula: '15 mod 7 = 1',
      narration: 'calc'
    });
    expect(state.currentCalc?.hash).toBe(1);

    state = hashMapReducer(state, {
      type: 'hash-insert',
      bucketIndex: 1,
      id: 'entry-15',
      key: 15,
      value: 'Ana',
      narration: 'insert'
    });
    expect(state.buckets[1].entries.length).toBe(1);

    // Collision on bucket 1 with key 22
    state = hashMapReducer(state, {
      type: 'hash-collision',
      bucketIndex: 1,
      message: 'Colisão',
      narration: 'collision'
    });
    expect(state.collisionAlert).toBe('Colisão');

    state = hashMapReducer(state, {
      type: 'hash-insert',
      bucketIndex: 1,
      id: 'entry-22',
      key: 22,
      value: 'Carlos',
      narration: 'insert collision'
    });
    expect(state.buckets[1].entries.length).toBe(2);
    expect(state.buckets[1].entries[1].key).toBe(22);
  });

  it('generateHashMapEvents should produce complete sequence with collision handling', () => {
    const events = Array.from(generateHashMapEvents());
    expect(events.length).toBeGreaterThan(8);

    let state = createInitialHashMapState(7);
    for (const evt of events) {
      expect(evt.narration).toBeDefined();
      expect(evt.pseudoCodeLine).toBeGreaterThan(0);
      state = hashMapReducer(state, evt);
    }
  });
});
