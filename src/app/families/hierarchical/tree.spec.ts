import { describe, it, expect } from 'vitest';
import { createInitialTreeState, treeReducer } from './tree-state';
import { computeTreeLayout } from './tree-layout';
import { generateBSTEvents } from './algorithms/bst-insert.generator';

describe('Hierarchical Family (BST)', () => {
  it('should initialize empty tree state and reduce create-node & link events', () => {
    let state = createInitialTreeState();
    expect(state.rootId).toBeNull();

    // Create root
    state = treeReducer(state, {
      type: 'create-node',
      id: 'node-50-0',
      value: 50,
      narration: 'Criando raiz'
    });
    expect(state.rootId).toBe('node-50-0');
    expect(state.nodes['node-50-0'].value).toBe(50);

    // Create child
    state = treeReducer(state, {
      type: 'create-node',
      id: 'node-30-1',
      value: 30,
      narration: 'Criando filho'
    });

    // Link child
    state = treeReducer(state, {
      type: 'link',
      parentId: 'node-50-0',
      childId: 'node-30-1',
      side: 'left',
      narration: 'Ligando à esquerda'
    });
    expect(state.nodes['node-50-0'].leftId).toBe('node-30-1');
  });

  it('should compute responsive layout without crashing on 360px viewport', () => {
    let state = createInitialTreeState();
    const values = [50, 30, 70, 20, 40, 60, 80];

    for (const event of generateBSTEvents(values)) {
      state = treeReducer(state, event);
    }

    const layout = computeTreeLayout(state, 360, 300);
    expect(layout.nodes.length).toBe(values.length);
    expect(layout.edges.length).toBe(values.length - 1);

    // All nodes should fit within width
    for (const node of layout.nodes) {
      expect(node.x).toBeGreaterThanOrEqual(10);
      expect(node.x).toBeLessThanOrEqual(350);
      expect(node.y).toBeGreaterThan(0);
    }
  });

  it('should generate complete event sequence with Portuguese narrations', () => {
    const values = [40, 20, 60];
    const events = Array.from(generateBSTEvents(values));

    expect(events.length).toBeGreaterThan(5);
    for (const ev of events) {
      expect(ev.narration).toBeDefined();
      expect(ev.narration.length).toBeGreaterThan(0);
    }

    const lastEvent = events[events.length - 1];
    expect(lastEvent.type).toBe('complete');
  });
});
