import { LinearEvent } from '../../engine/events';

export interface LinkedListNode {
  readonly id: string;
  readonly value: number;
  readonly nextId: string | null;
  readonly state: 'default' | 'active' | 'inserted' | 'highlighted';
}

export interface LinkedListState {
  readonly headId: string | null;
  readonly nodes: Readonly<Record<string, LinkedListNode>>;
  readonly order: readonly string[];
  readonly activeNodeId: string | null;
}

export function createInitialLinkedListState(values: readonly number[] = []): LinkedListState {
  const nodes: Record<string, LinkedListNode> = {};
  const order: string[] = [];
  let prevId: string | null = null;
  let headId: string | null = null;

  for (let i = 0; i < values.length; i++) {
    const val = values[i];
    const id = `node-${val}-${i}`;
    order.push(id);
    if (i === 0) {
      headId = id;
    }

    nodes[id] = {
      id,
      value: val,
      nextId: null,
      state: 'default'
    };

    if (prevId && nodes[prevId]) {
      nodes[prevId] = {
        ...nodes[prevId],
        nextId: id
      };
    }

    prevId = id;
  }

  return {
    headId,
    nodes,
    order,
    activeNodeId: null
  };
}

export function linkedListReducer(state: LinkedListState, event: LinearEvent): LinkedListState {
  switch (event.type) {
    case 'insert': {
      const newNode: LinkedListNode = {
        id: event.id,
        value: event.value,
        nextId: state.headId,
        state: 'inserted'
      };

      const newOrder = [event.id, ...state.order];
      return {
        ...state,
        headId: event.id,
        nodes: {
          ...state.nodes,
          [event.id]: newNode
        },
        order: newOrder,
        activeNodeId: event.id
      };
    }

    case 'visit':
    case 'highlight': {
      const targetId = event.type === 'visit' ? event.id : event.ids[0];
      const updatedNodes: Record<string, LinkedListNode> = {};

      for (const [id, node] of Object.entries(state.nodes)) {
        if (id === targetId) {
          updatedNodes[id] = { ...node, state: 'active' };
        } else if (node.state === 'active') {
          updatedNodes[id] = { ...node, state: 'default' };
        } else {
          updatedNodes[id] = node;
        }
      }

      return {
        ...state,
        nodes: updatedNodes,
        activeNodeId: targetId ?? null
      };
    }

    case 'compare': {
      const [id1, id2] = event.ids;
      const updatedNodes: Record<string, LinkedListNode> = {};

      for (const [id, node] of Object.entries(state.nodes)) {
        if (id === id1 || id === id2) {
          updatedNodes[id] = { ...node, state: 'highlighted' };
        } else if (node.state === 'highlighted') {
          updatedNodes[id] = { ...node, state: 'default' };
        } else {
          updatedNodes[id] = node;
        }
      }

      return {
        ...state,
        nodes: updatedNodes,
        activeNodeId: id1
      };
    }

    case 'complete': {
      const updatedNodes: Record<string, LinkedListNode> = {};
      for (const [id, node] of Object.entries(state.nodes)) {
        updatedNodes[id] = { ...node, state: 'default' };
      }

      return {
        ...state,
        nodes: updatedNodes,
        activeNodeId: null
      };
    }

    default:
      return state;
  }
}
