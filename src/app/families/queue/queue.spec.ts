import { describe, it, expect } from 'vitest';
import { createInitialQueueState, queueReducer } from './queue-state';
import { generateQueueEvents } from './algorithms/queue.generator';

describe('Queue (Fila)', () => {
  it('should initialize empty queue', () => {
    const state = createInitialQueueState();
    expect(state.items.length).toBe(0);
  });

  it('should handle enqueue, peek and dequeue correctly (FIFO) via reducer', () => {
    let state = createInitialQueueState();

    state = queueReducer(state, {
      type: 'queue-enqueue',
      id: 'item-10',
      value: 10,
      narration: 'Enqueue 10'
    });
    state = queueReducer(state, {
      type: 'queue-enqueue',
      id: 'item-20',
      value: 20,
      narration: 'Enqueue 20'
    });
    expect(state.items.length).toBe(2);
    expect(state.items[0].value).toBe(10);
    expect(state.items[1].value).toBe(20);

    state = queueReducer(state, {
      type: 'queue-peek',
      id: 'item-10',
      narration: 'Peek 10'
    });
    expect(state.items[0].state).toBe('peeked');

    state = queueReducer(state, {
      type: 'queue-dequeue',
      id: 'item-10',
      narration: 'Dequeue 10'
    });
    expect(state.items.length).toBe(1);
    expect(state.items[0].value).toBe(20); // 10 dequeued first (FIFO)
  });

  it('generateQueueEvents should emit FIFO operations with narrations and pseudocode lines', () => {
    const events = Array.from(generateQueueEvents([15, 30, 45]));
    expect(events.length).toBeGreaterThan(5);

    let state = createInitialQueueState();
    for (const evt of events) {
      expect(evt.narration).toBeDefined();
      expect(evt.pseudoCodeLine).toBeGreaterThan(0);
      state = queueReducer(state, evt);
    }
  });
});
