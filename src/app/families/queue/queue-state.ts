import { QueueEvent } from '../../engine/events';

export interface QueueItem {
  readonly id: string;
  readonly value: number;
  readonly state: 'normal' | 'active' | 'enqueued' | 'dequeued' | 'peeked';
}

export interface QueueState {
  readonly items: readonly QueueItem[];
  readonly actionLabel: string | null;
}

export function createInitialQueueState(values: readonly number[] = []): QueueState {
  const items: QueueItem[] = values.map((val, idx) => ({
    id: `queue-item-${idx}-${val}`,
    value: val,
    state: 'normal'
  }));

  return {
    items,
    actionLabel: null
  };
}

export function queueReducer(state: QueueState, event: QueueEvent): QueueState {
  switch (event.type) {
    case 'queue-enqueue': {
      const newItem: QueueItem = {
        id: event.id,
        value: event.value,
        state: 'enqueued'
      };
      return {
        items: [...state.items, newItem],
        actionLabel: `ENQUEUE(${event.value})`
      };
    }

    case 'queue-dequeue': {
      if (state.items.length === 0) return state;
      const updated = state.items.slice(1);
      return {
        items: updated,
        actionLabel: `DEQUEUE() -> ${event.id}`
      };
    }

    case 'queue-peek': {
      if (state.items.length === 0) return state;
      const updated = state.items.map((item, idx) => {
        if (idx === 0) {
          return { ...item, state: 'peeked' as const };
        }
        return { ...item, state: 'normal' as const };
      });
      return {
        items: updated,
        actionLabel: 'PEEK()'
      };
    }

    case 'highlight': {
      const targetIds = new Set(event.ids);
      return {
        ...state,
        items: state.items.map((item) => ({
          ...item,
          state: targetIds.has(item.id) ? 'active' : 'normal'
        }))
      };
    }

    case 'complete': {
      return {
        ...state,
        items: state.items.map((item) => ({ ...item, state: 'normal' })),
        actionLabel: 'Concluído'
      };
    }

    default:
      return state;
  }
}
