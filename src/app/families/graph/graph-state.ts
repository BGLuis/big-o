import { GraphEvent } from '../../engine/events';

export interface GraphVertex {
  readonly id: string;
  readonly label: string;
  readonly x: number;
  readonly y: number;
  readonly state: 'unvisited' | 'in-queue' | 'visiting' | 'visited';
}

export interface GraphEdge {
  readonly id: string;
  readonly from: string;
  readonly to: string;
  readonly state: 'default' | 'active' | 'traversed';
}

export interface GraphState {
  readonly vertices: readonly GraphVertex[];
  readonly edges: readonly GraphEdge[];
  readonly frontierQueue: readonly string[];
  readonly visitedOrder: readonly string[];
  readonly currentVisitingId: string | null;
}

export function createInitialGraphState(): GraphState {
  // A clean 6-node pedagogical graph
  const vertices: GraphVertex[] = [
    { id: 'A', label: 'A', x: 120, y: 140, state: 'unvisited' },
    { id: 'B', label: 'B', x: 260, y: 70, state: 'unvisited' },
    { id: 'C', label: 'C', x: 260, y: 210, state: 'unvisited' },
    { id: 'D', label: 'D', x: 400, y: 70, state: 'unvisited' },
    { id: 'E', label: 'E', x: 400, y: 210, state: 'unvisited' },
    { id: 'F', label: 'F', x: 530, y: 140, state: 'unvisited' }
  ];

  const edges: GraphEdge[] = [
    { id: 'e-AB', from: 'A', to: 'B', state: 'default' },
    { id: 'e-AC', from: 'A', to: 'C', state: 'default' },
    { id: 'e-BD', from: 'B', to: 'D', state: 'default' },
    { id: 'e-CD', from: 'C', to: 'D', state: 'default' },
    { id: 'e-CE', from: 'C', to: 'E', state: 'default' },
    { id: 'e-DF', from: 'D', to: 'F', state: 'default' },
    { id: 'e-EF', from: 'E', to: 'F', state: 'default' }
  ];

  return {
    vertices,
    edges,
    frontierQueue: [],
    visitedOrder: [],
    currentVisitingId: null
  };
}

export function graphReducer(state: GraphState, event: GraphEvent): GraphState {
  switch (event.type) {
    case 'graph-enqueue-frontier': {
      return {
        ...state,
        frontierQueue: [...state.frontierQueue, event.id],
        vertices: state.vertices.map((v) => {
          if (v.id === event.id && v.state === 'unvisited') {
            return { ...v, state: 'in-queue' };
          }
          return v;
        })
      };
    }

    case 'graph-dequeue-frontier': {
      return {
        ...state,
        frontierQueue: state.frontierQueue.filter((id) => id !== event.id)
      };
    }

    case 'graph-visit-vertex': {
      const vId = event.id;
      return {
        ...state,
        currentVisitingId: vId,
        visitedOrder: state.visitedOrder.includes(vId) ? state.visitedOrder : [...state.visitedOrder, vId],
        vertices: state.vertices.map((v) => {
          if (v.id === vId) {
            return { ...v, state: 'visiting' };
          }
          if (v.state === 'visiting') {
            return { ...v, state: 'visited' };
          }
          return v;
        })
      };
    }

    case 'graph-explore-edge': {
      const { from, to } = event;
      return {
        ...state,
        edges: state.edges.map((edge) => {
          const match =
            (edge.from === from && edge.to === to) || (edge.from === to && edge.to === from);
          if (match) {
            return { ...edge, state: 'traversed' };
          }
          return edge;
        })
      };
    }

    case 'complete': {
      return {
        ...state,
        currentVisitingId: null,
        vertices: state.vertices.map((v) => ({ ...v, state: 'visited' })),
        edges: state.edges.map((e) => ({ ...e, state: 'traversed' }))
      };
    }

    default:
      return state;
  }
}
