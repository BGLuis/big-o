import { describe, it, expect } from 'vitest';
import { createInitialStackState, stackReducer } from './stack-state';
import { generateStackEvents } from './algorithms/stack.generator';

describe('Stack (Pilha)', () => {
  it('should initialize empty stack with topPointer = -1', () => {
    const state = createInitialStackState();
    expect(state.items.length).toBe(0);
    expect(state.topPointer).toBe(-1);
  });

  it('should handle push, peek and pop correctly via reducer', () => {
    let state = createInitialStackState();

    state = stackReducer(state, {
      type: 'stack-push',
      id: 'item-10',
      value: 10,
      narration: 'Push 10'
    });
    expect(state.items.length).toBe(1);
    expect(state.topPointer).toBe(0);
    expect(state.items[0].value).toBe(10);

    state = stackReducer(state, {
      type: 'stack-push',
      id: 'item-20',
      value: 20,
      narration: 'Push 20'
    });
    expect(state.items.length).toBe(2);
    expect(state.topPointer).toBe(1);
    expect(state.items[1].value).toBe(20);

    state = stackReducer(state, {
      type: 'stack-peek',
      id: 'item-20',
      narration: 'Peek 20'
    });
    expect(state.items[1].state).toBe('peeked');

    state = stackReducer(state, {
      type: 'stack-pop',
      id: 'item-20',
      narration: 'Pop 20'
    });
    expect(state.items.length).toBe(1);
    expect(state.topPointer).toBe(0);
    expect(state.items[0].value).toBe(10);
  });

  it('generateStackEvents should emit LIFO operations with narrations and pseudocode lines', () => {
    const events = Array.from(generateStackEvents([30, 60, 90]));
    expect(events.length).toBeGreaterThan(5);

    let state = createInitialStackState();
    for (const evt of events) {
      expect(evt.narration).toBeDefined();
      expect(evt.pseudoCodeLine).toBeGreaterThan(0);
      state = stackReducer(state, evt);
    }
  });
});
