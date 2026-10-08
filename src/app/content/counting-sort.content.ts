import { AlgorithmContent } from './content.types';

export const COUNTING_SORT_CONTENT: AlgorithmContent = {
  id: 'counting-sort',
  title: 'Counting Sort (Ordenação por Contagem)',
  category: 'sorting',
  family: 'linear',
  timeComplexity: {
    best: 'O(n + k)',
    average: 'O(n + k)',
    worst: 'O(n + k)'
  },
  spaceComplexity: 'O(k)',
  shortDescription:
    'Algoritmo não comparativo de tempo linear O(n + k) que conta as frequências de cada valor em um array auxiliar.',
  fullExplanation:
    'O Counting Sort não realiza comparações diretas entre pares de elementos. Em vez disso, ele determina o valor máximo k e cria um vetor de contagem onde o índice corresponde ao próprio valor. Após contar a frequência de cada número, ele reconstrói a sequência ordenada copiando os valores de volta com base nas contagens acumuladas.',
  pseudoCode: [
    'procedimento countingSort(A, k)',
    '  n = tamanho(A)',
    '  criar vetor contagem[0..k] preenchido com 0',
    '  // Fase 1: Contagem de frequências',
    '  para i de 0 até n - 1 faça',
    '    contagem[A[i]] = contagem[A[i]] + 1',
    '  fim para',
    '  // Fase 2: Reconstrução ordenada',
    '  indice = 0',
    '  para val de 0 até k faça',
    '    enquanto contagem[val] > 0 faça',
    '      A[indice] = val',
    '      contagem[val] = contagem[val] - 1',
    '      indice = indice + 1',
    '    fim enquanto',
    '  fim para',
    'fim procedimento'
  ]
};
