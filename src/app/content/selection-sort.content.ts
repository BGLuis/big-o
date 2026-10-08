import { AlgorithmContent } from './content.types';

export const SELECTION_SORT_CONTENT: AlgorithmContent = {
  id: 'selection-sort',
  title: 'Selection Sort (Ordenação por Seleção)',
  category: 'sorting',
  family: 'linear',
  timeComplexity: {
    best: 'O(n²)',
    average: 'O(n²)',
    worst: 'O(n²)'
  },
  spaceComplexity: 'O(1)',
  shortDescription:
    'Encontra iterativamente o menor elemento da porção não ordenada e o coloca na posição correta.',
  fullExplanation:
    'O Selection Sort divide o array em duas partes: a sublista ordenada (à esquerda) e a sublista não ordenada (à direita). A cada iteração, ele busca o menor valor restante na sublista não ordenada e o troca com o primeiro elemento dessa sublista, expandindo a fronteira ordenada.',
  pseudoCode: [
    'procedimento selectionSort(A : lista de itens ordenáveis)',
    '  n = tamanho(A)',
    '  para i de 0 até n - 2 faça',
    '    minIdx = i',
    '    para j de i + 1 até n - 1 faça',
    '      se A[j] < A[minIdx] então',
    '        minIdx = j',
    '      fim se',
    '    fim para',
    '    se minIdx != i então',
    '      trocar(A[i], A[minIdx])',
    '    fim se',
    '  fim para',
    'fim procedimento'
  ]
};
