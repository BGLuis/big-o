import { HierarchicalEvent } from '../../engine/events';

export interface TreeNode {
  readonly id: string;
  readonly value: number;
  readonly leftId: string | null;
  readonly rightId: string | null;
  readonly state: 'default' | 'comparing' | 'inserted' | 'highlighted' | 'matched' | 'deleted' | 'balance-target';
  readonly height?: number;
  readonly balanceFactor?: number;
  readonly color?: 'red' | 'black';
}

export interface TreeState {
  readonly rootId: string | null;
  readonly nodes: Readonly<Record<string, TreeNode>>;
  readonly activeNodeId: string | null;
  readonly targetValue: number | null;
  readonly traversalOutput?: readonly number[];
}

export function createInitialTreeState(): TreeState {
  return {
    rootId: null,
    nodes: {},
    activeNodeId: null,
    targetValue: null,
    traversalOutput: []
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

    case 'remove-node': {
      const updatedNodes = { ...state.nodes };
      delete updatedNodes[event.id];

      // Disconnect from parent if any
      for (const [nodeId, node] of Object.entries(updatedNodes)) {
        if (node.leftId === event.id || node.rightId === event.id) {
          updatedNodes[nodeId] = {
            ...node,
            leftId: node.leftId === event.id ? null : node.leftId,
            rightId: node.rightId === event.id ? null : node.rightId
          };
        }
      }

      const newRootId = state.rootId === event.id ? null : state.rootId;

      return {
        ...state,
        rootId: newRootId,
        nodes: updatedNodes,
        activeNodeId: state.activeNodeId === event.id ? null : state.activeNodeId
      };
    }

    case 'update-node-value': {
      const node = state.nodes[event.id];
      if (!node) return state;

      return {
        ...state,
        nodes: {
          ...state.nodes,
          [event.id]: {
            ...node,
            value: event.value
          }
        }
      };
    }

    case 'rotate': {
      const p = state.nodes[event.pivotId];
      if (!p) return state;

      const updatedNodes = { ...state.nodes };
      let newRootId = state.rootId;

      // Find parent of pivot
      let parentOfPivot: TreeNode | null = null;
      for (const node of Object.values(state.nodes)) {
        if (node.leftId === p.id || node.rightId === p.id) {
          parentOfPivot = node;
          break;
        }
      }

      if (event.direction === 'left') {
        // Left rotation around P
        const rId = p.rightId;
        if (!rId || !updatedNodes[rId]) return state;
        const r = updatedNodes[rId];

        const updatedP: TreeNode = {
          ...p,
          rightId: r.leftId,
          state: 'default'
        };
        const updatedR: TreeNode = {
          ...r,
          leftId: p.id,
          state: 'balance-target'
        };

        updatedNodes[p.id] = updatedP;
        updatedNodes[r.id] = updatedR;

        if (parentOfPivot) {
          updatedNodes[parentOfPivot.id] = {
            ...parentOfPivot,
            leftId: parentOfPivot.leftId === p.id ? r.id : parentOfPivot.leftId,
            rightId: parentOfPivot.rightId === p.id ? r.id : parentOfPivot.rightId
          };
        } else if (state.rootId === p.id) {
          newRootId = r.id;
        }
      } else {
        // Right rotation around P
        const lId = p.leftId;
        if (!lId || !updatedNodes[lId]) return state;
        const l = updatedNodes[lId];

        const updatedP: TreeNode = {
          ...p,
          leftId: l.rightId,
          state: 'default'
        };
        const updatedL: TreeNode = {
          ...l,
          rightId: p.id,
          state: 'balance-target'
        };

        updatedNodes[p.id] = updatedP;
        updatedNodes[l.id] = updatedL;

        if (parentOfPivot) {
          updatedNodes[parentOfPivot.id] = {
            ...parentOfPivot,
            leftId: parentOfPivot.leftId === p.id ? l.id : parentOfPivot.leftId,
            rightId: parentOfPivot.rightId === p.id ? l.id : parentOfPivot.rightId
          };
        } else if (state.rootId === p.id) {
          newRootId = l.id;
        }
      }

      return {
        ...state,
        rootId: newRootId,
        nodes: updatedNodes,
        activeNodeId: event.pivotId
      };
    }

    case 'set-node-meta': {
      const node = state.nodes[event.id];
      if (!node) return state;

      return {
        ...state,
        nodes: {
          ...state.nodes,
          [event.id]: {
            ...node,
            balanceFactor: event.balanceFactor !== undefined ? event.balanceFactor : node.balanceFactor,
            height: event.height !== undefined ? event.height : node.height,
            color: event.color !== undefined ? event.color : node.color
          }
        }
      };
    }

    case 'traversal-output': {
      return {
        ...state,
        traversalOutput: event.values
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
