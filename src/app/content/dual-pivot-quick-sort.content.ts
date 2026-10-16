import { AlgorithmContent } from './content.types';

export const DUAL_PIVOT_QUICK_SORT_CONTENT: AlgorithmContent = {
  id: 'dual-pivot-quick-sort',
  title: 'Dual-Pivot QuickSort (QuickSort de Dois Pivôs)',
  category: 'sorting',
  family: 'linear',
  timeComplexity: {
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n²)'
  },
  spaceComplexity: 'O(log n)',
  shortDescription:
    'Variação moderna do Quick Sort com dois pivôs (P1 e P2) que particiona os dados em três faixas, padrão no Java (Arrays.sort).',
  fullExplanation:
    'Criado por Vladimir Yaroslavskiy em 2009, o Dual-Pivot QuickSort seleciona dois pivôs (P1 <= P2) e particiona o array em três regiões: menores que P1, entre P1 e P2, e maiores que P2. Essa divisão em 3 partes reduz drasticamente o número de acessos à memória e cache misses comparado ao QuickSort tradicional de pivô único.',
  pseudoCode: [
    'procedimento dualPivotQuickSort(A, low, high)',
    '  se low < high então',
    '    se A[low] > A[high] então trocar(A[low], A[high])',
    '    p1 = A[low]; p2 = A[high]',
    '    lt = low + 1; gt = high - 1; k = low + 1',
    '    enquanto k <= gt faça',
    '      se A[k] < p1 então',
    '        trocar(A[k], A[lt]); lt++; k++',
    '      senão se A[k] > p2 então',
    '        enquanto A[gt] > p2 e k < gt faça gt--',
    '        trocar(A[k], A[gt]); gt--',
    '        se A[k] < p1 então trocar(A[k], A[lt]); lt++',
    '        k++',
    '      senão k++',
    '    fim enquanto',
    '    trocar(A[low], A[lt - 1]); trocar(A[high], A[gt + 1])',
    '    dualPivotQuickSort(A, low, lt - 2)',
    '    dualPivotQuickSort(A, lt, gt)',
    '    dualPivotQuickSort(A, gt + 2, high)',
    '  fim se',
    'fim procedimento'
  ],
  legend: [
    { label: 'partição processada', colorClass: 'box-completed' },
    { label: 'ponteiro ativo', colorClass: 'box-comparing' },
    { label: 'pivôs (P1, P2)', colorClass: 'box-pivot' },
    { label: 'não visitado', colorClass: 'box-normal' }
  ]
};
