import { AlgorithmContent } from './content.types';

export const MERGE_SORT_CONTENT: AlgorithmContent = {
  id: 'merge-sort',
  title: 'Merge Sort (Ordenação por Intercalação)',
  category: 'sorting',
  family: 'linear',
  timeComplexity: {
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n log n)',
    theta: 'Θ(n log n)'
  },
  spaceComplexity: 'O(n)',
  shortDescription:
    'Divide recursivamente o array ao meio até obter sublistas unitárias, intercalando-as de forma ordenada em um buffer auxiliar.',
  fullExplanation:
    'O Merge Sort é um algoritmo baseado no paradigma de Divisão e Conquista. Ele divide recursivamente a lista ao meio até sublistas de tamanho 1, e então intercala (combina) pares de sublistas ordenadas em um array auxiliar, garantindo estabilidade e tempo previsível de O(n log n) em todos os casos.',
  pseudoCode: [
    'procedimento mergeSort(A, inicio, fim)',
    '  se inicio < fim então',
    '    meio = (inicio + fim) / 2',
    '    mergeSort(A, inicio, meio)',
    '    mergeSort(A, meio + 1, fim)',
    '    intercalar(A, inicio, meio, fim)',
    '  fim se',
    'fim procedimento',
    '',
    'procedimento intercalar(A, inicio, meio, fim)',
    '  criar bufferAuxiliar de tamanho (fim - inicio + 1)',
    '  enquanto i <= meio e j <= fim faça',
    '    se A[i] <= A[j] então',
    '      adicionar A[i] ao bufferAuxiliar',
    '    senão',
    '      adicionar A[j] ao bufferAuxiliar',
    '    fim se',
    '  fim enquanto',
    '  copiar restante e transferir bufferAuxiliar de volta para A',
    'fim procedimento'
  ]
};
