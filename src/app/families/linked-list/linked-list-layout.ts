import { LinkedListState, LinkedListNode } from './linked-list-state';

export interface LayoutListNode {
  readonly id: string;
  readonly value: number;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly dataWidth: number;
  readonly pointerWidth: number;
  readonly state: LinkedListNode['state'];
  readonly isHead: boolean;
}

export interface LayoutListArrow {
  readonly id: string;
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  readonly toNull: boolean;
}

export interface LinkedListLayoutResult {
  readonly nodes: readonly LayoutListNode[];
  readonly arrows: readonly LayoutListArrow[];
  readonly nullBox: { x: number; y: number; width: number; height: number } | null;
  readonly headPointer: { x: number; y: number; textX: number; textY: number } | null;
  readonly width: number;
  readonly height: number;
}

export function computeLinkedListLayout(
  state: LinkedListState,
  width: number,
  height: number
): LinkedListLayoutResult {
  const safeWidth = Math.max(340, width);
  const safeHeight = Math.max(220, height);

  // Collect nodes following head pointer
  const chain: LinkedListNode[] = [];
  let currId: string | null = state.headId;
  const visited = new Set<string>();

  while (currId && state.nodes[currId] && !visited.has(currId)) {
    visited.add(currId);
    chain.push(state.nodes[currId]);
    currId = state.nodes[currId].nextId;
  }

  if (chain.length === 0) {
    return {
      nodes: [],
      arrows: [],
      nullBox: { x: safeWidth / 2 - 25, y: safeHeight / 2 - 15, width: 50, height: 30 },
      headPointer: null,
      width: safeWidth,
      height: safeHeight
    };
  }

  const count = chain.length;
  const nodeWidth = Math.max(60, Math.min(80, Math.floor((safeWidth - 100) / (count + 1))));
  const nodeHeight = 42;
  const dataWidth = Math.round(nodeWidth * 0.65);
  const pointerWidth = nodeWidth - dataWidth;
  const gap = Math.max(20, Math.min(45, Math.floor((safeWidth - (count * nodeWidth + 60)) / Math.max(1, count))));

  const totalWidth = count * nodeWidth + count * gap + 50; // includes NULL box
  const startX = Math.max(20, Math.floor((safeWidth - totalWidth) / 2));
  const centerY = Math.floor(safeHeight / 2);

  const nodes: LayoutListNode[] = [];
  const arrows: LayoutListArrow[] = [];

  for (let i = 0; i < count; i++) {
    const node = chain[i];
    const x = startX + i * (nodeWidth + gap);
    const y = centerY - Math.floor(nodeHeight / 2);

    nodes.push({
      id: node.id,
      value: node.value,
      x,
      y,
      width: nodeWidth,
      height: nodeHeight,
      dataWidth,
      pointerWidth,
      state: node.state,
      isHead: i === 0
    });

    const pointerCenterX = x + dataWidth + Math.floor(pointerWidth / 2);
    const pointerCenterY = y + Math.floor(nodeHeight / 2);

    if (i < count - 1) {
      const nextX = startX + (i + 1) * (nodeWidth + gap);
      arrows.push({
        id: `arrow-${node.id}`,
        x1: pointerCenterX,
        y1: pointerCenterY,
        x2: nextX - 2,
        y2: pointerCenterY,
        toNull: false
      });
    } else {
      // Points to NULL
      const nullX = x + nodeWidth + gap;
      arrows.push({
        id: `arrow-null-${node.id}`,
        x1: pointerCenterX,
        y1: pointerCenterY,
        x2: nullX - 2,
        y2: pointerCenterY,
        toNull: true
      });
    }
  }

  const lastNode = nodes[nodes.length - 1];
  const nullBox = {
    x: lastNode.x + nodeWidth + gap,
    y: centerY - 15,
    width: 48,
    height: 30
  };

  const firstNode = nodes[0];
  const headPointer = {
    x: firstNode.x + Math.floor(firstNode.dataWidth / 2),
    y: firstNode.y - 8,
    textX: firstNode.x + Math.floor(firstNode.dataWidth / 2),
    textY: firstNode.y - 24
  };

  return {
    nodes,
    arrows,
    nullBox,
    headPointer,
    width: Math.max(safeWidth, nullBox.x + nullBox.width + 20),
    height: safeHeight
  };
}
