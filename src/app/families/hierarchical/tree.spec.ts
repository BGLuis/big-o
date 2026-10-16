import { describe, it, expect } from 'vitest';
import { createInitialTreeState, treeReducer } from './tree-state';
import { computeTreeLayout } from './tree-layout';
import { generateBSTEvents } from './algorithms/bst-insert.generator';
import { generateAVLEvents } from './algorithms/avl-tree.generator';
import { generateTreeTraversalEvents } from './algorithms/tree-traversal.generator';
import { generateRedBlackEvents } from './algorithms/red-black-tree.generator';

describe('Hierarchical Family (BST and Tree Algorithms)', () => {
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

  it('should support node removal and value update in treeReducer', () => {
    let state = createInitialTreeState();
    state = treeReducer(state, { type: 'create-node', id: 'n1', value: 50, narration: '' });
    state = treeReducer(state, { type: 'create-node', id: 'n2', value: 30, narration: '' });
    state = treeReducer(state, { type: 'link', parentId: 'n1', childId: 'n2', side: 'left', narration: '' });

    expect(state.nodes['n1'].leftId).toBe('n2');

    // Update node value
    state = treeReducer(state, { type: 'update-node-value', id: 'n1', value: 45, narration: '' });
    expect(state.nodes['n1'].value).toBe(45);

    // Remove child
    state = treeReducer(state, { type: 'remove-node', id: 'n2', narration: '' });
    expect(state.nodes['n2']).toBeUndefined();
    expect(state.nodes['n1'].leftId).toBeNull();
  });

  it('should execute tree rotations in treeReducer', () => {
    let state = createInitialTreeState();
    // P (30) with right child R (40)
    state = treeReducer(state, { type: 'create-node', id: 'p', value: 30, narration: '' });
    state = treeReducer(state, { type: 'create-node', id: 'r', value: 40, narration: '' });
    state = treeReducer(state, { type: 'link', parentId: 'p', childId: 'r', side: 'right', narration: '' });

    expect(state.rootId).toBe('p');
    expect(state.nodes['p'].rightId).toBe('r');

    // Left rotate around P
    state = treeReducer(state, { type: 'rotate', pivotId: 'p', direction: 'left', narration: '' });
    expect(state.rootId).toBe('r');
    expect(state.nodes['r'].leftId).toBe('p');
    expect(state.nodes['p'].rightId).toBeNull();
  });

  it('should compute responsive layout without crashing on 360px viewport', () => {
    let state = createInitialTreeState();
    const values = [50, 30, 70, 20, 40, 60, 80];

    for (const event of generateBSTEvents(values)) {
      state = treeReducer(state, event);
    }

    const layout = computeTreeLayout(state, 360, 300);
    expect(layout.nodes.length).toBeGreaterThan(0);
    expect(layout.edges.length).toBe(layout.nodes.length - 1);

    // All nodes should fit within width
    for (const node of layout.nodes) {
      expect(node.x).toBeGreaterThanOrEqual(10);
      expect(node.x).toBeLessThanOrEqual(350);
      expect(node.y).toBeGreaterThan(0);
    }
  });

  it('should generate complete event sequence with Portuguese narrations for BST operations', () => {
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

  it('should generate valid AVL tree events with balance factors and rotations', () => {
    const events = Array.from(generateAVLEvents([30, 20, 10]));
    expect(events.some((e) => e.type === 'rotate')).toBe(true);
    expect(events.some((e) => e.type === 'set-node-meta')).toBe(true);
  });

  it('should generate tree traversal events with traversal output', () => {
    const events = Array.from(generateTreeTraversalEvents([50, 30, 70]));
    const outputEvents = events.filter((e) => e.type === 'traversal-output');
    expect(outputEvents.length).toBeGreaterThan(0);
  });

  it('should generate red-black tree events with color metadata', () => {
    const events = Array.from(generateRedBlackEvents([20, 10, 30]));
    const metaEvents = events.filter((e) => e.type === 'set-node-meta');
    expect(metaEvents.some((e: any) => e.color === 'black')).toBe(true);
  });
});
