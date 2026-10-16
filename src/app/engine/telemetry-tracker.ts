import { BaseEvent } from './events';
import { TelemetrySnapshot } from '../features/sandbox/sandbox.types';
import { TreeState } from '../families/hierarchical/tree-state';
import { LinearState } from '../families/linear/linear-state';

const SWAP_OR_MUTATION_TYPES = new Set<string>([
  'swap',
  'assign',
  'insert',
  'remove',
  'rotate',
  'create-node',
  'remove-node',
  'update-node-value',
  'stack-push',
  'stack-pop',
  'queue-enqueue',
  'queue-dequeue',
  'hash-insert',
  'hash-remove'
]);

const AUXILIARY_TYPES = new Set<string>([
  'set-aux',
  'update-aux',
  'hash-calc',
  'hash-collision'
]);

interface TypedEvent {
  readonly type?: string;
}

export function computeTreeHeight(state: TreeState): number {
  if (!state || !state.rootId || !state.nodes || !state.nodes[state.rootId]) {
    return 0;
  }

  const visited = new Set<string>();

  function getNodeHeight(nodeId: string | null): number {
    if (!nodeId || visited.has(nodeId)) {
      return 0;
    }

    const node = state.nodes[nodeId];
    if (!node) {
      return 0;
    }

    visited.add(nodeId);
    const leftH = getNodeHeight(node.leftId);
    const rightH = getNodeHeight(node.rightId);

    return 1 + Math.max(leftH, rightH);
  }

  return getNodeHeight(state.rootId);
}

export function computeTelemetry<TState, TEvent extends BaseEvent>(
  events: readonly TEvent[],
  currentStep: number,
  currentState: TState,
  family: 'linear' | 'hierarchical' | 'other'
): TelemetrySnapshot {
  const boundedStep = Math.max(0, Math.min(currentStep, events.length));
  const analyzedEvents = events.slice(0, boundedStep);

  let comparisons = 0;
  let swapsOrMutations = 0;
  let auxiliaryOps = 0;

  for (const ev of analyzedEvents) {
    const eventType = (ev as unknown as TypedEvent).type;
    if (!eventType) {
      continue;
    }

    if (eventType === 'compare') {
      comparisons++;
    } else if (SWAP_OR_MUTATION_TYPES.has(eventType)) {
      swapsOrMutations++;
    } else if (AUXILIARY_TYPES.has(eventType)) {
      auxiliaryOps++;
    }
  }

  let structuralDepthOrSize = 0;
  let structuralLabel = 'Operações';

  if (family === 'hierarchical') {
    structuralDepthOrSize = computeTreeHeight(currentState as unknown as TreeState);
    structuralLabel = 'Altura da Árvore';
  } else if (family === 'linear') {
    structuralDepthOrSize = (currentState as unknown as LinearState)?.elements?.length ?? 0;
    structuralLabel = 'Elementos (N)';
  }

  return {
    comparisons,
    swapsOrMutations,
    auxiliaryOps,
    structuralDepthOrSize,
    structuralLabel,
    currentStep,
    totalSteps: events.length,
    isCompleted: currentStep >= events.length && events.length > 0
  };
}
