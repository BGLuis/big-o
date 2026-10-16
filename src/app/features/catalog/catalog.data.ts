import { CatalogTrackItem } from './catalog.types';

export const SORTING_TRACKS: readonly CatalogTrackItem[] = [
  {
    id: 'bubble-sort',
    title: 'Bubble Sort',
    category: 'sorting',
    categoryLabel: 'Ordenação',
    familyTag: 'linear',
    complexityBadge: 'O(n²)',
    complexityTone: 'amber',
    description: 'Compara pares adjacentes e os troca sempre que estão fora de ordem.',
    summaryMetrics: 'Ω(n) · O(n²) · esp. O(1)',
    route: ['/ordenacao', 'bubble-sort']
  },
  {
    id: 'selection-sort',
    title: 'Selection Sort',
    category: 'sorting',
    categoryLabel: 'Ordenação',
    familyTag: 'linear',
    complexityBadge: 'O(n²)',
    complexityTone: 'amber',
    description: 'Encontra o menor elemento da parte não ordenada e o move para o lugar certo.',
    summaryMetrics: 'Θ(n²) · esp. O(1)',
    route: ['/ordenacao', 'selection-sort']
  },
  {
    id: 'insertion-sort',
    title: 'Insertion Sort',
    category: 'sorting',
    categoryLabel: 'Ordenação',
    familyTag: 'linear',
    complexityBadge: 'O(n²)',
    complexityTone: 'amber',
    description: 'Constrói o array ordenado um item por vez, inserindo cada novo elemento no lugar.',
    summaryMetrics: 'Ω(n) · O(n²) · esp. O(1)',
    route: ['/ordenacao', 'insertion-sort']
  },
  {
    id: 'merge-sort',
    title: 'Merge Sort',
    category: 'sorting',
    categoryLabel: 'Ordenação',
    familyTag: 'linear',
    complexityBadge: 'Θ(n log n)',
    complexityTone: 'green',
    description: 'Divide ao meio até sublistas unitárias e as intercala ordenadas num buffer auxiliar.',
    summaryMetrics: 'Θ(n log n) · esp. O(n)',
    route: ['/ordenacao', 'merge-sort']
  },
  {
    id: 'quick-sort',
    title: 'Quick Sort',
    category: 'sorting',
    categoryLabel: 'Ordenação',
    familyTag: 'linear',
    complexityBadge: 'O(n²)',
    complexityTone: 'amber',
    description: 'Particiona o array ao redor de um pivô e ordena as duas partes recursivamente.',
    summaryMetrics: 'Ω(n log n) · O(n²) · esp. O(log n)',
    route: ['/ordenacao', 'quick-sort']
  },
  {
    id: 'dual-pivot-quick-sort',
    title: 'Dual-Pivot QuickSort',
    category: 'sorting',
    categoryLabel: 'Ordenação',
    familyTag: 'linear',
    complexityBadge: 'O(n²)',
    complexityTone: 'amber',
    description: 'Quick Sort com dois pivôs, separando os dados em três faixas. Padrão do Java.',
    summaryMetrics: 'Ω(n log n) · O(n²) · esp. O(log n)',
    route: ['/ordenacao', 'dual-pivot-quick-sort']
  },
  {
    id: 'heap-sort',
    title: 'Heap Sort',
    category: 'sorting',
    categoryLabel: 'Ordenação',
    familyTag: 'linear',
    complexityBadge: 'Θ(n log n)',
    complexityTone: 'green',
    description: 'Transforma o array num Max-Heap e extrai a raiz para o fim. Sem espaço extra.',
    summaryMetrics: 'Θ(n log n) · esp. O(1)',
    route: ['/ordenacao', 'heap-sort']
  },
  {
    id: 'counting-sort',
    title: 'Counting Sort',
    category: 'sorting',
    categoryLabel: 'Ordenação',
    familyTag: 'linear',
    complexityBadge: 'Θ(n+k)',
    complexityTone: 'green',
    description: 'Não comparativo, tempo linear: conta as frequências de cada valor num array auxiliar.',
    summaryMetrics: 'Θ(n+k) · esp. O(k)',
    route: ['/ordenacao', 'counting-sort']
  },
  {
    id: 'radix-sort',
    title: 'Radix Sort',
    category: 'sorting',
    categoryLabel: 'Ordenação',
    familyTag: 'linear',
    complexityBadge: 'Θ(n·d)',
    complexityTone: 'green',
    description: 'Ordena dígito a dígito (do menos ao mais significativo) com buckets estáveis.',
    summaryMetrics: 'Θ(n·d) · esp. O(n+k)',
    route: ['/ordenacao', 'radix-sort']
  },
  {
    id: 'timsort',
    title: 'Timsort',
    category: 'sorting',
    categoryLabel: 'Ordenação',
    familyTag: 'linear',
    complexityBadge: 'O(n log n)',
    complexityTone: 'amber',
    description: 'Híbrido estável (Merge + Insertion) que explora runs naturais. Padrão do Python.',
    summaryMetrics: 'Ω(n) · O(n log n) · esp. O(n)',
    route: ['/ordenacao', 'timsort']
  },
  {
    id: 'introsort',
    title: 'Introsort',
    category: 'sorting',
    categoryLabel: 'Ordenação',
    familyTag: 'linear',
    complexityBadge: 'Θ(n log n)',
    complexityTone: 'green',
    description: 'Quick Sort que migra para Heap Sort na recursão profunda e Insertion nas partições pequenas.',
    summaryMetrics: 'Θ(n log n) · esp. O(log n)',
    route: ['/ordenacao', 'introsort']
  }
];

export const DATA_STRUCTURE_TRACKS: readonly CatalogTrackItem[] = [
  {
    id: 'array',
    title: 'Array (Vetor Contíguo)',
    category: 'data-structure',
    categoryLabel: 'Estruturas de Dados',
    familyTag: 'linear',
    complexityBadge: 'Θ(1)',
    complexityTone: 'green',
    description: 'Elementos em posições contíguas de memória, com acesso direto por índice.',
    summaryMetrics: 'acesso Θ(1) · busca O(n)',
    route: ['/data-structures', 'array']
  },
  {
    id: 'linked-list',
    title: 'Lista Encadeada',
    category: 'data-structure',
    categoryLabel: 'Estruturas de Dados',
    familyTag: 'encadeada',
    complexityBadge: 'O(n)',
    complexityTone: 'amber',
    description: 'Nós ligados por ponteiros, sem posições contíguas. Inserção Θ(1) na cabeça.',
    summaryMetrics: 'inserir Θ(1) · buscar O(n)',
    route: ['/data-structures', 'linked-list']
  },
  {
    id: 'stack',
    title: 'Pilha (Stack · LIFO)',
    category: 'data-structure',
    categoryLabel: 'Estruturas de Dados',
    familyTag: 'pilha',
    complexityBadge: 'Θ(1)',
    complexityTone: 'green',
    description: 'Last In, First Out: adições e remoções acontecem só no Topo.',
    summaryMetrics: 'push / pop Θ(1) · esp. O(n)',
    route: ['/data-structures', 'stack']
  },
  {
    id: 'queue',
    title: 'Fila (Queue · FIFO)',
    category: 'data-structure',
    categoryLabel: 'Estruturas de Dados',
    familyTag: 'fila',
    complexityBadge: 'Θ(1)',
    complexityTone: 'green',
    description: 'First In, First Out: entra no Fim e sai do Início.',
    summaryMetrics: 'enqueue Θ(1) · esp. O(n)',
    route: ['/data-structures', 'queue']
  },
  {
    id: 'bst',
    title: 'Árvore Binária de Busca',
    category: 'data-structure',
    categoryLabel: 'Estruturas de Dados',
    familyTag: 'hierárquica',
    complexityBadge: 'O(n)',
    complexityTone: 'amber',
    description: 'Nós à esquerda menores, à direita maiores — inserção, busca e remoção nos 3 casos clássicos.',
    summaryMetrics: 'médio O(log n) · pior O(n)',
    route: ['/data-structures', 'bst']
  },
  {
    id: 'avl-tree',
    title: 'Árvore AVL (Balanceamento)',
    category: 'data-structure',
    categoryLabel: 'Estruturas de Dados',
    familyTag: 'hierárquica',
    complexityBadge: 'Θ(log n)',
    complexityTone: 'green',
    description: 'Auto-balanceada onde |BF| ≤ 1: demonstração das 4 rotações canônicas (LL, RR, LR, RL).',
    summaryMetrics: 'garantido Θ(log n) · esp. O(n)',
    route: ['/data-structures', 'avl-tree']
  },
  {
    id: 'tree-traversal',
    title: 'Travessias em Árvore',
    category: 'data-structure',
    categoryLabel: 'Estruturas de Dados',
    familyTag: 'hierárquica',
    complexityBadge: 'Θ(n)',
    complexityTone: 'green',
    description: 'Percursos em profundidade: Em-Ordem (ordenado), Pré-Ordem (cópia) e Pós-Ordem (desalocação).',
    summaryMetrics: 'tempo Θ(n) · pilha O(h)',
    route: ['/data-structures', 'tree-traversal']
  },
  {
    id: 'red-black-tree',
    title: 'Árvore Rubro-Negra',
    category: 'data-structure',
    categoryLabel: 'Estruturas de Dados',
    familyTag: 'hierárquica',
    complexityBadge: 'O(log n)',
    complexityTone: 'green',
    description: 'Nós vermelhos e pretos com altura preta balanceada e rebalanceamento com poucas rotações.',
    summaryMetrics: 'garantido O(log n) · esp. O(n)',
    route: ['/data-structures', 'red-black-tree']
  },
  {
    id: 'graph',
    title: 'Grafo & Busca em Largura',
    category: 'data-structure',
    categoryLabel: 'Estruturas de Dados',
    familyTag: 'grafo',
    complexityBadge: 'Θ(V+E)',
    complexityTone: 'green',
    description: 'Vértices conectados por arestas; a trilha percorre a BFS a partir de uma origem.',
    summaryMetrics: 'BFS Θ(V+E) · esp. O(V)',
    route: ['/data-structures', 'graph']
  },
  {
    id: 'hash-map',
    title: 'Tabela Hash & Colisões',
    category: 'data-structure',
    categoryLabel: 'Estruturas de Dados',
    familyTag: 'hash',
    complexityBadge: 'O(n)',
    complexityTone: 'amber',
    description: 'Chave-valor com função hash e encadeamento separado para tratar colisões.',
    summaryMetrics: 'médio Θ(1) · pior O(n)',
    route: ['/data-structures', 'hash-map']
  }
];

export const ALL_CATALOG_TRACKS: readonly CatalogTrackItem[] = [
  ...SORTING_TRACKS,
  ...DATA_STRUCTURE_TRACKS
];
