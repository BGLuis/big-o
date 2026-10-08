import { describe, it, expect } from 'vitest';
import { createInitialGraphState, graphReducer } from './graph-state';
import { generateGraphBFSEvents } from './algorithms/graph-bfs.generator';

describe('Graph (Grafo & BFS)', () => {
  it('should initialize graph with 6 vertices and 7 edges', () => {
    const state = createInitialGraphState();
    expect(state.vertices.length).toBe(6);
    expect(state.edges.length).toBe(7);
    expect(state.frontierQueue.length).toBe(0);
    expect(state.visitedOrder.length).toBe(0);
  });

  it('should process BFS events and visit all vertices', () => {
    const events = Array.from(generateGraphBFSEvents());
    expect(events.length).toBeGreaterThan(10);

    let state = createInitialGraphState();
    for (const evt of events) {
      expect(evt.narration).toBeDefined();
      state = graphReducer(state, evt);
    }

    expect(state.visitedOrder).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
    expect(state.vertices.every((v) => v.state === 'visited')).toBe(true);
  });
});
