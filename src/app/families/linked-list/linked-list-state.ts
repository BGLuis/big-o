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
      const pos = Math.max(0, Math.min(event.position, state.order.length));
      if (pos === 0 || !state.headId) {
        const newNode: LinkedListNode = {
          id: event.id,
          value: event.value,
          nextId: state.headId,
          state: 'inserted'
        };
        return {
          ...state,
          headId: event.id,
          nodes: {
            ...state.nodes,
            [event.id]: newNode
          },
          order: [event.id, ...state.order],
          activeNodeId: event.id
        };
      }

      const prevId = state.order[pos - 1];
      const prevNode = state.nodes[prevId];
      const nextId = pos < state.order.length ? state.order[pos] : null;
      const newNode: LinkedListNode = {
        id: event.id,
        value: event.value,
        nextId,
        state: 'inserted'
      };
      const newOrder = [...state.order];
      newOrder.splice(pos, 0, event.id);

      const updatedNodes: Record<string, LinkedListNode> = {
        ...state.nodes,
        [event.id]: newNode
      };
      if (prevNode) {
        updatedNodes[prevId] = {
          ...prevNode,
          nextId: event.id
        };
      }

      return {
        ...state,
        nodes: updatedNodes,
        order: newOrder,
        activeNodeId: event.id
      };
    }

    case 'remove': {
      const idx = state.order.indexOf(event.id);
      if (idx === -1) return state;

      const updatedNodes = { ...state.nodes };
      const removedNode = updatedNodes[event.id];
      delete updatedNodes[event.id];

      const newOrder = state.order.filter((id) => id !== event.id);
      let newHeadId = state.headId;

      if (idx === 0) {
        newHeadId = newOrder[0] ?? null;
      } else {
        const prevId = state.order[idx - 1];
        const prevNode = updatedNodes[prevId];
        if (prevNode) {
          updatedNodes[prevId] = {
            ...prevNode,
            nextId: removedNode?.nextId ?? null
          };
        }
      }

      return {
        ...state,
        headId: newHeadId,
        nodes: updatedNodes,
        order: newOrder,
        activeNodeId: null
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
