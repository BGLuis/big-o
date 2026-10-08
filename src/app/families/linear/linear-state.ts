import { LinearEvent } from '../../engine/events';

export type ElementVisualState = 'normal' | 'highlighted' | 'comparing' | 'swapping' | 'pivot' | 'completed';

export interface LinearElement {
  readonly id: string;
  readonly value: number;
  readonly state: ElementVisualState;
}

export interface LinearAuxElement {
  readonly id: string;
  readonly value: number | null;
  readonly label?: string;
  readonly state: ElementVisualState;
}

export interface LinearState {
  readonly elements: readonly LinearElement[];
  readonly scope: { readonly from: number; readonly to: number } | null;
  readonly pivotId: string | null;
  readonly pivot2Id: string | null;
  readonly auxTitle: string | null;
  readonly auxElements: readonly LinearAuxElement[];
}

export function createInitialLinearState(values: number[]): LinearState {
  return {
    elements: values.map((val, idx) => ({
      id: `elem-${idx}-${val}`,
      value: val,
      state: 'normal'
    })),
    scope: null,
    pivotId: null,
    pivot2Id: null,
    auxTitle: null,
    auxElements: []
  };
}

export function linearReducer(state: LinearState, event: LinearEvent): LinearState {
  switch (event.type) {
    case 'highlight': {
      const targetIds = new Set(event.ids);
      return {
        ...state,
        elements: state.elements.map((el) => {
          if (el.state === 'completed') return el;
          if (el.id === state.pivotId) return { ...el, state: 'pivot' };
          return {
            ...el,
            state: targetIds.has(el.id) ? 'highlighted' : 'normal'
          };
        })
      };
    }

    case 'compare': {
      const compareIds = new Set(event.ids);
      return {
        ...state,
        elements: state.elements.map((el) => {
          if (el.state === 'completed') return el;
          if (el.id === state.pivotId) return { ...el, state: 'pivot' };
          return {
            ...el,
            state: compareIds.has(el.id) ? 'comparing' : 'normal'
          };
        })
      };
    }

    case 'swap': {
      const [idA, idB] = event.ids;
      const indexA = state.elements.findIndex((el) => el.id === idA);
      const indexB = state.elements.findIndex((el) => el.id === idB);
      if (indexA === -1 || indexB === -1) return state;

      const newElements = [...state.elements];
      const temp = newElements[indexA];
      newElements[indexA] = { ...newElements[indexB], state: 'swapping' };
      newElements[indexB] = { ...temp, state: 'swapping' };

      return {
        ...state,
        elements: newElements
      };
    }

    case 'set-pivot': {
      const p1 = event.id;
      const p2 = event.secondaryId ?? null;
      return {
        ...state,
        pivotId: p1,
        pivot2Id: p2,
        elements: state.elements.map((el) => {
          if (el.state === 'completed') return el;
          if (el.id === p1 || (p2 !== null && el.id === p2)) return { ...el, state: 'pivot' };
          if (el.state === 'pivot' && el.id !== p1 && el.id !== p2) return { ...el, state: 'normal' };
          return el;
        })
      };
    }

    case 'assign': {
      return {
        ...state,
        elements: state.elements.map((el) => {
          if (el.id === event.id) {
            return { ...el, value: event.value, state: 'swapping' };
          }
          return el;
        })
      };
    }

    case 'set-aux': {
      return {
        ...state,
        auxTitle: event.title,
        auxElements: event.elements.map((item) => ({
          id: item.id,
          value: item.value,
          label: item.label,
          state: item.state ?? 'normal'
        }))
      };
    }

    case 'update-aux': {
      if (event.index < 0 || event.index >= state.auxElements.length) return state;
      const newAux = [...state.auxElements];
      const prev = newAux[event.index];
      newAux[event.index] = {
        ...prev,
        value: event.value,
        label: event.label !== undefined ? event.label : prev.label,
        state: event.state ?? prev.state
      };
      return {
        ...state,
        auxElements: newAux
      };
    }

    case 'clear-aux': {
      return {
        ...state,
        auxTitle: null,
        auxElements: []
      };
    }

    case 'set-scope': {
      return {
        ...state,
        scope: { from: event.from, to: event.to }
      };
    }

    case 'complete': {
      const completedIds = new Set(event.ids);
      return {
        ...state,
        elements: state.elements.map((el) => {
          if (completedIds.has(el.id)) {
            return { ...el, state: 'completed' };
          }
          return el;
        })
      };
    }

    case 'visit': {
      return {
        ...state,
        elements: state.elements.map((el) => {
          if (el.id === event.id && el.state !== 'completed') {
            return { ...el, state: 'highlighted' };
          }
          return el;
        })
      };
    }

    case 'insert': {
      const newElem: LinearElement = {
        id: event.id,
        value: event.value,
        state: 'normal'
      };
      const newElements = [...state.elements];
      newElements.splice(event.position, 0, newElem);
      return { ...state, elements: newElements };
    }

    case 'remove': {
      return {
        ...state,
        elements: state.elements.filter((el) => el.id !== event.id)
      };
    }

    default:
      return state;
  }
}
