import { GraphEvent } from '../../../engine/events';

export function* generateGraphBFSEvents(): Generator<GraphEvent> {
  yield {
    type: 'highlight',
    ids: [],
    narration: 'Iniciando Busca em Largura (BFS) no vértice inicial "A".',
    pseudoCodeLine: 2
  };

  // Step 1: Enqueue start node A
  yield {
    type: 'graph-enqueue-frontier',
    id: 'A',
    narration: 'Inserindo nó raiz "A" na fila FIFO de fronteira.',
    pseudoCodeLine: 3
  };

  // Visit A
  yield {
    type: 'graph-dequeue-frontier',
    id: 'A',
    narration: 'Desenfileirando "A" da fila para processamento.',
    pseudoCodeLine: 5
  };
  yield {
    type: 'graph-visit-vertex',
    id: 'A',
    narration: 'Processando vértice "A" (distância 0). Analisando seus vizinhos.',
    pseudoCodeLine: 6
  };

  // Neighbor B
  yield {
    type: 'graph-explore-edge',
    from: 'A',
    to: 'B',
    narration: 'Aresta (A -> B): vizinho "B" ainda não foi visitado.',
    pseudoCodeLine: 8
  };
  yield {
    type: 'graph-enqueue-frontier',
    id: 'B',
    narration: 'Enfileirando vizinho "B" na fila de fronteira (camada 1).',
    pseudoCodeLine: 10
  };

  // Neighbor C
  yield {
    type: 'graph-explore-edge',
    from: 'A',
    to: 'C',
    narration: 'Aresta (A -> C): vizinho "C" ainda não foi visitado.',
    pseudoCodeLine: 8
  };
  yield {
    type: 'graph-enqueue-frontier',
    id: 'C',
    narration: 'Enfileirando vizinho "C" na fila de fronteira (camada 1).',
    pseudoCodeLine: 10
  };

  // Visit B
  yield {
    type: 'graph-dequeue-frontier',
    id: 'B',
    narration: 'Desenfileirando "B" da fila FIFO.',
    pseudoCodeLine: 5
  };
  yield {
    type: 'graph-visit-vertex',
    id: 'B',
    narration: 'Processando vértice "B". Analisando vizinhos de B.',
    pseudoCodeLine: 6
  };

  // B -> D
  yield {
    type: 'graph-explore-edge',
    from: 'B',
    to: 'D',
    narration: 'Aresta (B -> D): vizinho "D" ainda não foi visitado.',
    pseudoCodeLine: 8
  };
  yield {
    type: 'graph-enqueue-frontier',
    id: 'D',
    narration: 'Enfileirando "D" na fila de fronteira (camada 2).',
    pseudoCodeLine: 10
  };

  // Visit C
  yield {
    type: 'graph-dequeue-frontier',
    id: 'C',
    narration: 'Desenfileirando "C" da fila FIFO.',
    pseudoCodeLine: 5
  };
  yield {
    type: 'graph-visit-vertex',
    id: 'C',
    narration: 'Processando vértice "C". Analisando vizinhos de C.',
    pseudoCodeLine: 6
  };

  // C -> E
  yield {
    type: 'graph-explore-edge',
    from: 'C',
    to: 'E',
    narration: 'Aresta (C -> E): vizinho "E" ainda não foi visitado.',
    pseudoCodeLine: 8
  };
  yield {
    type: 'graph-enqueue-frontier',
    id: 'E',
    narration: 'Enfileirando "E" na fila de fronteira (camada 2).',
    pseudoCodeLine: 10
  };

  // Visit D
  yield {
    type: 'graph-dequeue-frontier',
    id: 'D',
    narration: 'Desenfileirando "D" da fila FIFO.',
    pseudoCodeLine: 5
  };
  yield {
    type: 'graph-visit-vertex',
    id: 'D',
    narration: 'Processando vértice "D". Analisando vizinhos de D.',
    pseudoCodeLine: 6
  };

  // D -> F
  yield {
    type: 'graph-explore-edge',
    from: 'D',
    to: 'F',
    narration: 'Aresta (D -> F): descobrindo nó de destino "F"!',
    pseudoCodeLine: 8
  };
  yield {
    type: 'graph-enqueue-frontier',
    id: 'F',
    narration: 'Enfileirando "F" na fila de fronteira (camada 3).',
    pseudoCodeLine: 10
  };

  // Visit E
  yield {
    type: 'graph-dequeue-frontier',
    id: 'E',
    narration: 'Desenfileirando "E" da fila FIFO.',
    pseudoCodeLine: 5
  };
  yield {
    type: 'graph-visit-vertex',
    id: 'E',
    narration: 'Processando vértice "E".',
    pseudoCodeLine: 6
  };
  yield {
    type: 'graph-explore-edge',
    from: 'E',
    to: 'F',
    narration: 'Aresta (E -> F): vértice "F" já se encontra na fila.',
    pseudoCodeLine: 8
  };

  // Visit F
  yield {
    type: 'graph-dequeue-frontier',
    id: 'F',
    narration: 'Desenfileirando "F" da fila FIFO.',
    pseudoCodeLine: 5
  };
  yield {
    type: 'graph-visit-vertex',
    id: 'F',
    narration: 'Processando último vértice "F" (camada 3).',
    pseudoCodeLine: 6
  };

  yield {
    type: 'complete',
    ids: ['A', 'B', 'C', 'D', 'E', 'F'],
    narration: 'Busca em Largura (BFS) concluída: todos os vértices e menores caminhos explorados!',
    pseudoCodeLine: 14
  };
}
