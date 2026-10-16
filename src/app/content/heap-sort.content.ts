import { AlgorithmContent } from './content.types';

export const HEAP_SORT_CONTENT: AlgorithmContent = {
  id: 'heap-sort',
  title: 'Heap Sort (Ordenação por Heap)',
  category: 'sorting',
  family: 'linear',
  timeComplexity: {
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n log n)',
    theta: 'Θ(n log n)'
  },
  spaceComplexity: 'O(1)',
  shortDescription:
    'Garante O(n log n) sem espaço extra transformando o array em um Max-Heap e extraindo a raiz para o fim.',
  fullExplanation:
    'O Heap Sort visualiza o array como uma árvore binária quase completa. Na primeira fase, ele reorganiza o array em um Max-Heap (onde cada pai é maior ou igual aos seus filhos). Na segunda fase, ele troca repetidamente o elemento da raiz (o maior valor) com o último elemento não ordenado, reduzindo o tamanho do heap e restaurando a propriedade max-heap via peneiramento descendente (siftDown/heapify).',
  pseudoCode: [
    'procedimento heapSort(A : lista de itens ordenáveis)',
    '  n = tamanho(A)',
    '  // Fase 1: Construir Max-Heap',
    '  para i de (n / 2) - 1 decrescendo até 0 faça',
    '    descerNoHeap(A, n, i)',
    '  fim para',
    '  // Fase 2: Extrair elementos um a um',
    '  para i de n - 1 decrescendo até 1 faça',
    '    trocar(A[0], A[i])',
    '    descerNoHeap(A, i, 0)',
    '  fim para',
    'fim procedimento',
    '',
    'procedimento descerNoHeap(A, tamanhoHeap, raiz)',
    '  maior = raiz',
    '  esq = 2 * raiz + 1',
    '  dir = 2 * raiz + 2',
    '  se esq < tamanhoHeap e A[esq] > A[maior] então maior = esq',
    '  se dir < tamanhoHeap e A[dir] > A[maior] então maior = dir',
    '  se maior != raiz então',
    '    trocar(A[raiz], A[maior])',
    '    descerNoHeap(A, tamanhoHeap, maior)',
    '  fim se',
    'fim procedimento'
  ],
  legend: [
    { label: 'ordenado', colorClass: 'box-completed' },
    { label: 'raiz / troca', colorClass: 'box-comparing' },
    { label: 'heap', colorClass: 'box-normal' }
  ]
};
