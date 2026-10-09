import { AlgorithmContent } from './content.types';

export const INTROSORT_CONTENT: AlgorithmContent = {
  id: 'introsort',
  title: 'Introsort (Ordenação Introspectiva)',
  category: 'sorting',
  family: 'linear',
  timeComplexity: {
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n log n)',
    theta: 'Θ(n log n)'
  },
  spaceComplexity: 'O(log n)',
  shortDescription:
    'Híbrido moderno que inicia com Quick Sort, alterna para Heap Sort se a recursão for profunda e usa Insertion Sort em partições pequenas (padrão C++ std::sort).',
  fullExplanation:
    'Projetado por David Musser em 1997, o Introsort combina o melhor de três mundos: a altíssima velocidade prática do Quick Sort, a garantia estrita de pior caso O(n log n) do Heap Sort quando a profundidade de recursão excede 2 * floor(log2(n)), e a eficiência do Insertion Sort para pequenas partições.',
  pseudoCode: [
    'procedimento introSort(A, n)',
    '  profundidadeLimite = 2 * piso(log2(n))',
    '  introSortRecursivo(A, 0, n - 1, profundidadeLimite)',
    'fim procedimento',
    '',
    'procedimento introSortRecursivo(A, low, high, profundidadeLimite)',
    '  tamanho = high - low + 1',
    '  se tamanho < 4 então',
    '    insertionSort(A, low, high) // Partição pequena',
    '  senão se profundidadeLimite == 0 então',
    '    heapSort(A, low, high) // Evita pior caso O(n²)',
    '  senão',
    '    pivo = particionar(A, low, high)',
    '    introSortRecursivo(A, low, pivo - 1, profundidadeLimite - 1)',
    '    introSortRecursivo(A, pivo + 1, high, profundidadeLimite - 1)',
    '  fim se',
    'fim procedimento'
  ]
};
