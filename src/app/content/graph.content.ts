import { AlgorithmContent } from './content.types';

export const GRAPH_CONTENT: AlgorithmContent = {
  id: 'graph',
  title: 'Grafo (Graph & Busca em Largura - BFS)',
  category: 'data-structure',
  family: 'graph',
  timeComplexity: {
    best: 'O(V + E)',
    average: 'O(V + E)',
    worst: 'O(V + E)'
  },
  spaceComplexity: 'O(V)',
  shortDescription:
    'Estrutura não linear de vértices (V) conectados por arestas (E), essencial para redes sociais, rotas e mapas.',
  fullExplanation:
    'Grafos modelam relações e redes arbitrárias entre entidades (como pessoas em uma rede social ou cidades e estradas no Waze/Google Maps). A Busca em Largura (BFS - Breadth-First Search) é o algoritmo fundamental para explorar grafos: partindo de um nó inicial, ela visita todos os vizinhos imediatos em camadas concêntricas usando uma Fila (FIFO), garantindo a descoberta do caminho mais curto em grafos não ponderados.',
  pseudoCode: [
    'procedimento buscaEmLargura(Grafo, noInicial)',
    '  criar fila FIFO = [noInicial]',
    '  criar conjunto visitados = { noInicial }',
    '  enquanto fila não estiver vazia faça',
    '    atual = fila.desenfileirar()',
    '    processar(atual)',
    '    para cada vizinho de Grafo[atual] faça',
    '      se vizinho não está em visitados então',
    '        visitados.adicionar(vizinho)',
    '        fila.enfileirar(vizinho)',
    '      fim se',
    '    fim para',
    '  fim enquanto',
    'fim procedimento'
  ]
};
