import { AlgorithmContent } from './content.types';

export const QUICK_SORT_CONTENT: AlgorithmContent = {
  id: 'quick-sort',
  title: 'Quick Sort (Ordenação Rápida)',
  category: 'sorting',
  family: 'linear',
  timeComplexity: {
    best: 'Ω(n log n)',
    average: 'O(n log n)',
    worst: 'O(n²)'
  },
  spaceComplexity: 'O(log n)',
  shortDescription:
    'Particiona o array ao redor de um pivô e ordena as partes recursivamente.',
  kicker: 'Ordenação · divisão e conquista',
  pedagogicalNote:
    'Como Ω e O não coincidem, o Quick Sort não tem um Θ único. O Merge Sort tem: Θ(n log n).',
  fullExplanation:
    'O Quick Sort utiliza a estratégia de "Dividir para Conquistar". Ele escolhe um elemento como "pivô" e particiona o array ao redor dele, movendo os elementos menores para a esquerda e os maiores para a direita. Em seguida, ordena recursivamente as duas metades.',
  pseudoCode: [
    'procedimento quickSort(A, inicio, fim)',
    '  se inicio < fim então',
    '    p = particionar(A, inicio, fim)',
    '    quickSort(A, inicio, p - 1)',
    '    quickSort(A, p + 1, fim)',
    '  fim se',
    'fim procedimento',
    '',
    'função particionar(A, inicio, fim)',
    '  pivo = A[fim]',
    '  i = inicio - 1',
    '  para j de inicio até fim - 1 faça',
    '    se A[j] <= pivo então',
    '      i = i + 1',
    '      trocar(A[i], A[j])',
    '    fim se',
    '  fim para',
    '  trocar(A[i + 1], A[fim])',
    '  retorne i + 1',
    'fim função'
  ],
  legend: [
    { label: 'partição ≤ pivô', colorClass: 'box-completed' },
    { label: 'elemento em j', colorClass: 'box-comparing' },
    { label: 'pivô', colorClass: 'box-pivot' },
    { label: 'não visitado', colorClass: 'box-normal' }
  ]
};
