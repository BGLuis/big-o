import { HierarchicalEvent } from '../../engine/events';

export interface TreeNode {
  readonly id: string;
  readonly value: number;
  readonly leftId: string | null;
  readonly rightId: string | null;
  readonly state: 'default' | 'comparing' | 'inserted' | 'highlighted' | 'matched';
}

export interface TreeState {
  readonly rootId: string | null;
  readonly nodes: Readonly<Record<string, TreeNode>>;
  readonly activeNodeId: string | null;
  readonly targetValue: number | null;
}

export function createInitialTreeState(): TreeState {
  return {
    rootId: null,
    nodes: {},
    activeNodeId: null,
    targetValue: null
  };
}

export function treeReducer(state: TreeState, event: HierarchicalEvent): TreeState {
  switch (event.type) {
    case 'create-node': {
      const newNode: TreeNode = {
        id: event.id,
        value: event.value,
        leftId: null,
        rightId: null,
        state: 'inserted'
      };

      const updatedNodes = {
        ...state.nodes,
        [event.id]: newNode
      };

      return {
        ...state,
        rootId: state.rootId === null ? event.id : state.rootId,
        nodes: updatedNodes,
        activeNodeId: event.id,
        targetValue: event.value
      };
    }

    case 'link': {
      const parent = state.nodes[event.parentId];
      if (!parent) return state;

      const updatedParent: TreeNode = {
        ...parent,
        leftId: event.side === 'left' ? event.childId : parent.leftId,
        rightId: event.side === 'right' ? event.childId : parent.rightId
      };

      return {
        ...state,
        nodes: {
          ...state.nodes,
          [event.parentId]: updatedParent
        }
      };
    }

    case 'unlink': {
      const parent = state.nodes[event.parentId];
      if (!parent) return state;

      const updatedParent: TreeNode = {
        ...parent,
        leftId: event.side === 'left' ? null : parent.leftId,
        rightId: event.side === 'right' ? null : parent.rightId
      };

      return {
        ...state,
        nodes: {
          ...state.nodes,
          [event.parentId]: updatedParent
        }
      };
    }

    case 'compare': {
      const [id1, id2] = event.ids;
      const updatedNodes: Record<string, TreeNode> = {};

      for (const [id, node] of Object.entries(state.nodes)) {
        if (id === id1 || id === id2) {
          updatedNodes[id] = { ...node, state: 'comparing' };
        } else if (node.state === 'comparing') {
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

    case 'highlight':
    case 'visit': {
      const targetId = event.type === 'visit' ? event.id : event.ids[0];
      const updatedNodes: Record<string, TreeNode> = {};

      for (const [id, node] of Object.entries(state.nodes)) {
        if (id === targetId) {
          updatedNodes[id] = { ...node, state: 'highlighted' };
        } else if (node.state === 'comparing' || node.state === 'highlighted') {
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

    case 'complete': {
      const updatedNodes: Record<string, TreeNode> = {};
      for (const [id, node] of Object.entries(state.nodes)) {
        updatedNodes[id] = { ...node, state: 'default' };
      }

      return {
        ...state,
        nodes: updatedNodes,
        activeNodeId: null,
        targetValue: null
      };
    }

    default:
      return state;
  }
}
