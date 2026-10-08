import { describe, it, expect } from 'vitest';
import { createInitialLinkedListState, linkedListReducer } from './linked-list-state';
import { computeLinkedListLayout } from './linked-list-layout';
import { generateLinkedListEvents } from './algorithms/linked-list.generator';

describe('Linked Structure Family (Linked List)', () => {
  it('should initialize linked list state and reduce insert events', () => {
    let state = createInitialLinkedListState();
    expect(state.headId).toBeNull();
    expect(state.order.length).toBe(0);

    state = linkedListReducer(state, {
      type: 'insert',
      id: 'node-10-0',
      value: 10,
      position: 0,
      narration: 'Inserindo 10'
    });

    expect(state.headId).toBe('node-10-0');
    expect(state.nodes['node-10-0'].value).toBe(10);
    expect(state.order.length).toBe(1);

    state = linkedListReducer(state, {
      type: 'insert',
      id: 'node-20-1',
      value: 20,
      position: 0,
      narration: 'Inserindo 20 no início'
    });

    expect(state.headId).toBe('node-20-1');
    expect(state.nodes['node-20-1'].nextId).toBe('node-10-0');
    expect(state.order.length).toBe(2);
  });

  it('should compute responsive layout with head pointer and null box on 360px viewport', () => {
    const values = [15, 30, 45, 60];
    let state = createInitialLinkedListState();

    for (const ev of generateLinkedListEvents(values)) {
      state = linkedListReducer(state, ev);
    }

    const layout = computeLinkedListLayout(state, 360, 240);
    expect(layout.nodes.length).toBe(values.length);
    expect(layout.arrows.length).toBe(values.length); // 3 to nodes, 1 to NULL
    expect(layout.nullBox).not.toBeNull();
    expect(layout.headPointer).not.toBeNull();

    for (const node of layout.nodes) {
      expect(node.x).toBeGreaterThan(0);
      expect(node.width).toBeGreaterThan(30);
    }
  });

  it('should generate complete event sequence with Portuguese narrations and line mappings', () => {
    const values = [5, 10, 15];
    const events = Array.from(generateLinkedListEvents(values));

    expect(events.length).toBeGreaterThan(5);
    for (const ev of events) {
      expect(ev.narration).toBeDefined();
      expect(ev.narration.length).toBeGreaterThan(0);
      expect(ev.pseudoCodeLine).toBeDefined();
    }

    const lastEvent = events[events.length - 1];
    expect(lastEvent.type).toBe('complete');
  });
});
