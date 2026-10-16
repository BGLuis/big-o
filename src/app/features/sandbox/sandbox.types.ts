import { BaseEvent } from '../../engine/events';

export type SandboxMode = 'lab' | 'arena';

export type SandboxStructureType =
  | 'bst'
  | 'avl-tree'
  | 'red-black-tree'
  | 'array'
  | 'linked-list'
  | 'stack'
  | 'queue'
  | 'hash-map'
  | 'graph';

export type TreeKind = 'bst' | 'avl' | 'rb';

export type TreeTraversalOrder = 'in-order' | 'pre-order' | 'post-order' | 'bfs';

export type SandboxOperationType =
  | 'insert'
  | 'delete'
  | 'search'
  | 'rotate-left'
  | 'rotate-right'
  | 'traverse'
  | 'push'
  | 'pop'
  | 'peek'
  | 'enqueue'
  | 'dequeue'
  | 'insert-head'
  | 'insert-tail'
  | 'insert-at'
  | 'remove-at'
  | 'binary-search'
  | 'bfs'
  | 'dfs'
  | 'clear'
  | 'preset';

export interface SandboxOperationInput {
  readonly type: SandboxOperationType;
  readonly value?: number;
  readonly secondaryValue?: number | string;
  readonly targetNodeId?: string;
  readonly traversalOrder?: TreeTraversalOrder;
}

export interface StepQuizPrompt {
  readonly stepIndex: number;
  readonly question: string;
  readonly options: readonly string[];
  readonly correctIndex: number;
  readonly explanation: string;
}

export interface SandboxOperationResult<TState, TEvent extends BaseEvent = BaseEvent> {
  readonly events: readonly TEvent[];
  readonly finalState: TState;
  readonly summary: string;
  readonly quizPrompt?: StepQuizPrompt;
}

export interface SandboxOperationRecord<TState = unknown, TEvent extends BaseEvent = BaseEvent> {
  readonly id: string;
  readonly label: string;
  readonly operation: SandboxOperationInput;
  readonly events: readonly TEvent[];
  readonly stateBefore: TState;
  readonly stateAfter: TState;
  readonly timestamp: number;
  readonly quizPrompt?: StepQuizPrompt;
}

export interface TelemetrySnapshot {
  readonly comparisons: number;
  readonly swapsOrMutations: number;
  readonly auxiliaryOps: number;
  readonly structuralDepthOrSize: number;
  readonly structuralLabel: string;
  readonly currentStep: number;
  readonly totalSteps: number;
  readonly isCompleted: boolean;
}

export type DatasetPresetId =
  | 'random'
  | 'nearly-sorted'
  | 'reversed'
  | 'few-unique'
  | 'avl-rotations'
  | 'avl-double-lr-rl'
  | 'degenerate-bst'
  | 'rb-recolor'
  | 'custom';

export interface SandboxPreset {
  readonly id: DatasetPresetId;
  readonly title: string;
  readonly badge: string;
  readonly description: string;
  readonly category: 'sorting' | 'tree' | 'general';
  readonly values: readonly number[];
  readonly recommendedLeft?: string;
  readonly recommendedRight?: string;
}

export type ArenaCategory = 'sorting' | 'trees';
