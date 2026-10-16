import { AlgorithmContent } from './content.types';

export const BUBBLE_SORT_CONTENT: AlgorithmContent = {
  id: 'bubble-sort',
  title: 'Bubble Sort (Ordenação por Flutuação)',
  category: 'sorting',
  family: 'linear',
  timeComplexity: {
    best: 'O(n)',
    average: 'O(n²)',
    worst: 'O(n²)'
  },
  spaceComplexity: 'O(1)',
  shortDescription:
    'Compara pares de elementos adjacentes sucessivamente e os troca de posição se estiverem fora de ordem.',
  fullExplanation:
    'O Bubble Sort percorre o array repetidamente, compara elementos adjacentes e os troca se estiverem na ordem errada. O maior elemento "flutua" para o final em cada iteração, como uma bolha subindo na água.',
  pseudoCode: [
    'procedimento bubbleSort(A : lista de itens ordenáveis)',
    '  n = tamanho(A)',
    '  repita',
    '    trocou = falso',
    '    para i de 1 até n - 1 faça',
    '      se A[i - 1] > A[i] então',
    '        trocar(A[i - 1], A[i])',
    '        trocou = verdadeiro',
    '      fim se',
    '    fim para',
    '    n = n - 1',
    '  até que não trocou',
    'fim procedimento'
  ],
  legend: [
    { label: 'ordenado', colorClass: 'box-completed' },
    { label: 'par em comparação', colorClass: 'box-comparing' },
    { label: 'não visitado', colorClass: 'box-normal' }
  ]
};
