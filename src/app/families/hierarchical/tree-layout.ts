import { TreeState, TreeNode } from './tree-state';

export interface LayoutNode {
  readonly id: string;
  readonly value: number;
  readonly x: number;
  readonly y: number;
  readonly radius: number;
  readonly state: TreeNode['state'];
  readonly height?: number;
  readonly balanceFactor?: number;
  readonly color?: 'red' | 'black';
}

export interface LayoutEdge {
  readonly id: string;
  readonly parentId: string;
  readonly childId: string;
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  readonly side: 'left' | 'right';
}

export interface TreeLayoutResult {
  readonly nodes: readonly LayoutNode[];
  readonly edges: readonly LayoutEdge[];
  readonly width: number;
  readonly height: number;
}

export function computeTreeLayout(state: TreeState, width: number, height: number): TreeLayoutResult {
  const safeWidth = Math.max(320, width);
  const safeHeight = Math.max(260, height);
  const radius = Math.max(16, Math.min(22, Math.floor(safeWidth / 24)));

  if (!state.rootId || !state.nodes[state.rootId]) {
    return {
      nodes: [],
      edges: [],
      width: safeWidth,
      height: safeHeight
    };
  }

  // Calculate max depth
  function getSubtreeDepth(nodeId: string | null): number {
    if (!nodeId || !state.nodes[nodeId]) return 0;
    const node = state.nodes[nodeId];
    return 1 + Math.max(getSubtreeDepth(node.leftId), getSubtreeDepth(node.rightId));
  }

  const maxDepth = Math.max(1, getSubtreeDepth(state.rootId));
  const verticalGap = Math.max(48, Math.min(75, Math.floor((safeHeight - 90) / maxDepth)));

  const nodes: LayoutNode[] = [];
  const edges: LayoutEdge[] = [];

  // Recursive layout placement
  function layoutSubtree(
    nodeId: string,
    depth: number,
    minX: number,
    maxX: number
  ): void {
    const node = state.nodes[nodeId];
    if (!node) return;

    const x = Math.round((minX + maxX) / 2);
    const y = 45 + depth * verticalGap;

    nodes.push({
      id: node.id,
      value: node.value,
      x,
      y,
      radius,
      state: node.state,
      height: node.height,
      balanceFactor: node.balanceFactor,
      color: node.color
    });

    if (node.leftId && state.nodes[node.leftId]) {
      const leftChildX = Math.round((minX + x) / 2);
      const leftChildY = 45 + (depth + 1) * verticalGap;

      edges.push({
        id: `edge-${node.id}-${node.leftId}`,
        parentId: node.id,
        childId: node.leftId,
        x1: x,
        y1: y + radius * 0.8,
        x2: leftChildX,
        y2: leftChildY - radius * 0.8,
        side: 'left'
      });

      layoutSubtree(node.leftId, depth + 1, minX, x);
    }

    if (node.rightId && state.nodes[node.rightId]) {
      const rightChildX = Math.round((x + maxX) / 2);
      const rightChildY = 45 + (depth + 1) * verticalGap;

      edges.push({
        id: `edge-${node.id}-${node.rightId}`,
        parentId: node.id,
        childId: node.rightId,
        x1: x,
        y1: y + radius * 0.8,
        x2: rightChildX,
        y2: rightChildY - radius * 0.8,
        side: 'right'
      });

      layoutSubtree(node.rightId, depth + 1, x, maxX);
    }
  }

  const margin = Math.max(20, radius + 10);
  layoutSubtree(state.rootId, 0, margin, safeWidth - margin);

  return {
    nodes,
    edges,
    width: safeWidth,
    height: safeHeight
  };
}
