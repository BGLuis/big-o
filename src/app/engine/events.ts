export interface BaseEvent {
  readonly narration: string;
  readonly pseudoCodeLine?: number;
}

export type CoreEvent =
  | (BaseEvent & { readonly type: 'highlight'; readonly ids: readonly string[] })
  | (BaseEvent & { readonly type: 'compare'; readonly ids: readonly [string, string]; readonly result: -1 | 0 | 1 })
  | (BaseEvent & { readonly type: 'visit'; readonly id: string })
  | (BaseEvent & { readonly type: 'complete'; readonly ids: readonly string[] });

export type LinearAuxVisualState = 'normal' | 'highlighted' | 'comparing' | 'swapping' | 'pivot' | 'completed';

export type LinearEvent =
  | CoreEvent
  | (BaseEvent & { readonly type: 'swap'; readonly ids: readonly [string, string] })
  | (BaseEvent & { readonly type: 'insert'; readonly id: string; readonly value: number; readonly position: number })
  | (BaseEvent & { readonly type: 'remove'; readonly id: string })
  | (BaseEvent & { readonly type: 'set-pivot'; readonly id: string | null; readonly secondaryId?: string | null })
  | (BaseEvent & { readonly type: 'set-scope'; readonly from: number; readonly to: number })
  | (BaseEvent & { readonly type: 'assign'; readonly id: string; readonly value: number })
  | (BaseEvent & {
      readonly type: 'set-aux';
      readonly title: string;
      readonly elements: readonly {
        readonly id: string;
        readonly value: number | null;
        readonly label?: string;
        readonly state?: LinearAuxVisualState;
      }[];
    })
  | (BaseEvent & {
      readonly type: 'update-aux';
      readonly index: number;
      readonly value: number | null;
      readonly label?: string;
      readonly state?: LinearAuxVisualState;
    })
  | (BaseEvent & { readonly type: 'clear-aux' });

export type HierarchicalEvent =
  | CoreEvent
  | (BaseEvent & { readonly type: 'create-node'; readonly id: string; readonly value: number })
  | (BaseEvent & { readonly type: 'link'; readonly parentId: string; readonly childId: string; readonly side: 'left' | 'right' })
  | (BaseEvent & { readonly type: 'unlink'; readonly parentId: string; readonly side: 'left' | 'right' })
  | (BaseEvent & { readonly type: 'rotate'; readonly pivotId: string; readonly direction: 'left' | 'right' });

export type StackEvent =
  | CoreEvent
  | (BaseEvent & { readonly type: 'stack-push'; readonly id: string; readonly value: number })
  | (BaseEvent & { readonly type: 'stack-pop'; readonly id: string })
  | (BaseEvent & { readonly type: 'stack-peek'; readonly id: string });

export type QueueEvent =
  | CoreEvent
  | (BaseEvent & { readonly type: 'queue-enqueue'; readonly id: string; readonly value: number })
  | (BaseEvent & { readonly type: 'queue-dequeue'; readonly id: string })
  | (BaseEvent & { readonly type: 'queue-peek'; readonly id: string });

export type GraphEvent =
  | CoreEvent
  | (BaseEvent & { readonly type: 'graph-visit-vertex'; readonly id: string })
  | (BaseEvent & { readonly type: 'graph-explore-edge'; readonly from: string; readonly to: string })
  | (BaseEvent & { readonly type: 'graph-enqueue-frontier'; readonly id: string })
  | (BaseEvent & { readonly type: 'graph-dequeue-frontier'; readonly id: string });

export type HashMapEvent =
  | CoreEvent
  | (BaseEvent & { readonly type: 'hash-calc'; readonly key: number; readonly hash: number; readonly formula: string })
  | (BaseEvent & { readonly type: 'hash-insert'; readonly bucketIndex: number; readonly id: string; readonly key: number; readonly value: string })
  | (BaseEvent & { readonly type: 'hash-collision'; readonly bucketIndex: number; readonly message: string })
  | (BaseEvent & { readonly type: 'hash-find'; readonly bucketIndex: number; readonly key: number });

export type EngineEvent = CoreEvent | LinearEvent | HierarchicalEvent | StackEvent | QueueEvent | GraphEvent | HashMapEvent;

