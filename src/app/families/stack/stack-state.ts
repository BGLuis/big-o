import { StackEvent } from '../../engine/events';

export interface StackItem {
  readonly id: string;
  readonly value: number;
  readonly state: 'normal' | 'active' | 'pushed' | 'popped' | 'peeked';
}

export interface StackState {
  readonly items: readonly StackItem[];
  readonly topPointer: number;
  readonly actionLabel: string | null;
}

export function createInitialStackState(values: readonly number[] = []): StackState {
  const items: StackItem[] = values.map((val, idx) => ({
    id: `stack-item-${idx}-${val}`,
    value: val,
    state: 'normal'
  }));

  return {
    items,
    topPointer: items.length - 1,
    actionLabel: null
  };
}

export function stackReducer(state: StackState, event: StackEvent): StackState {
  switch (event.type) {
    case 'stack-push': {
      const newItem: StackItem = {
        id: event.id,
        value: event.value,
        state: 'pushed'
      };
      const updated = [...state.items, newItem];
      return {
        items: updated,
        topPointer: updated.length - 1,
        actionLabel: `PUSH(${event.value})`
      };
    }

    case 'stack-pop': {
      if (state.items.length === 0) return state;
      const updated = state.items.slice(0, -1);
      return {
        items: updated,
        topPointer: updated.length - 1,
        actionLabel: `POP() -> ${event.id}`
      };
    }

    case 'stack-peek': {
      if (state.items.length === 0) return state;
      const updated = state.items.map((item, idx) => {
        if (idx === state.items.length - 1) {
          return { ...item, state: 'peeked' as const };
        }
        return { ...item, state: 'normal' as const };
      });
      return {
        ...state,
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
