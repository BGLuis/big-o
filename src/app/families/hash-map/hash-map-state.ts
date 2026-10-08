import { HashMapEvent } from '../../engine/events';

export interface HashEntry {
  readonly id: string;
  readonly key: number;
  readonly value: string;
  readonly state: 'normal' | 'inserting' | 'collided' | 'matched';
}

export interface HashBucket {
  readonly index: number;
  readonly entries: readonly HashEntry[];
}

export interface HashMapState {
  readonly bucketCount: number;
  readonly buckets: readonly HashBucket[];
  readonly currentCalc: {
    readonly key: number;
    readonly hash: number;
    readonly formula: string;
  } | null;
  readonly activeBucketIndex: number | null;
  readonly collisionAlert: string | null;
}

export function createInitialHashMapState(bucketCount: number = 7): HashMapState {
  const buckets: HashBucket[] = Array.from({ length: bucketCount }, (_, index) => ({
    index,
    entries: []
  }));

  return {
    bucketCount,
    buckets,
    currentCalc: null,
    activeBucketIndex: null,
    collisionAlert: null
  };
}

export function hashMapReducer(state: HashMapState, event: HashMapEvent): HashMapState {
  switch (event.type) {
    case 'hash-calc': {
      return {
        ...state,
        currentCalc: {
          key: event.key,
          hash: event.hash,
          formula: event.formula
        },
        activeBucketIndex: event.hash,
        collisionAlert: null
      };
    }

    case 'hash-collision': {
      return {
        ...state,
        activeBucketIndex: event.bucketIndex,
        collisionAlert: event.message
      };
    }

    case 'hash-insert': {
      const { bucketIndex, id, key, value } = event;
      const newEntry: HashEntry = {
        id,
        key,
        value,
        state: 'inserting'
      };

      const updatedBuckets = state.buckets.map((b) => {
        if (b.index === bucketIndex) {
          return {
            ...b,
            entries: [...b.entries, newEntry]
          };
        }
        return b;
      });

      return {
        ...state,
        buckets: updatedBuckets,
        activeBucketIndex: bucketIndex,
        collisionAlert: null
      };
    }

    case 'hash-find': {
      const { bucketIndex, key } = event;
      const updatedBuckets = state.buckets.map((b) => {
        if (b.index === bucketIndex) {
          return {
            ...b,
            entries: b.entries.map((e) => ({
              ...e,
              state: e.key === key ? ('matched' as const) : ('normal' as const)
            }))
          };
        }
        return b;
      });

      return {
        ...state,
        buckets: updatedBuckets,
        activeBucketIndex: bucketIndex
      };
    }

    case 'complete': {
      return {
        ...state,
        currentCalc: null,
        activeBucketIndex: null,
        collisionAlert: null,
        buckets: state.buckets.map((b) => ({
          ...b,
          entries: b.entries.map((e) => ({ ...e, state: 'normal' as const }))
        }))
      };
    }

    default:
      return state;
  }
}
