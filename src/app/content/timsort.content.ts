import { AlgorithmContent } from './content.types';

export const TIMSORT_CONTENT: AlgorithmContent = {
  id: 'timsort',
  title: 'Timsort (Híbrido Merge + Insertion Sort)',
  category: 'sorting',
  family: 'linear',
  timeComplexity: {
    best: 'O(n)',
    average: 'O(n log n)',
    worst: 'O(n log n)'
  },
  spaceComplexity: 'O(n)',
  shortDescription:
    'Algoritmo híbrido estável (Merge + Insertion) que explora runs naturais no array, padrão oficial do Python e Java (Objetos).',
  fullExplanation:
    'Criado por Tim Peters em 2002 para o Python, o Timsort divide os dados em blocos ordenados chamados runs (com tamanho mínimo minRun). Ele ordena cada bloco individual usando Insertion Sort (muito veloz para blocos pequenos ou quase ordenados) e em seguida intercala os runs ordenados em pares usando a lógica do Merge Sort com buffer auxiliar.',
  pseudoCode: [
    'procedimento timSort(A, n)',
    '  minRun = calcularMinRun(n) // Didático: 4',
    '  // Fase 1: Ordenar cada bloco (run) com Insertion Sort',
    '  para i de 0 até n - 1 passo minRun faça',
    '    insertionSort(A, i, min(i + minRun - 1, n - 1))',
    '  fim para',
    '  // Fase 2: Mesclar runs progressivamente',
    '  tamanho = minRun',
    '  enquanto tamanho < n faça',
    '    para esq de 0 até n - 1 passo 2 * tamanho faça',
    '      meio = min(esq + tamanho - 1, n - 1)',
    '      dir = min(esq + 2 * tamanho - 1, n - 1)',
    '      se meio < dir então intercalar(A, esq, meio, dir)',
    '    fim para',
    '    tamanho = 2 * tamanho',
    '  fim enquanto',
    'fim procedimento'
  ]
};
