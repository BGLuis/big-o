import { AlgorithmContent } from './content.types';

export const INSERTION_SORT_CONTENT: AlgorithmContent = {
  id: 'insertion-sort',
  title: 'Insertion Sort (Ordenação por Inserção)',
  category: 'sorting',
  family: 'linear',
  timeComplexity: {
    best: 'O(n)',
    average: 'O(n²)',
    worst: 'O(n²)'
  },
  spaceComplexity: 'O(1)',
  shortDescription:
    'Constrói o array ordenado um elemento por vez, inserindo cada novo item na posição correta da sublista já ordenada.',
  fullExplanation:
    'O Insertion Sort simula a organização de cartas de baralho na mão. O algoritmo percorre a lista a partir do segundo elemento, comparando-o com os elementos anteriores e deslocando os maiores para a direita até encontrar a posição correta onde inserir o item atual.',
  pseudoCode: [
    'procedimento insertionSort(A : lista de itens ordenáveis)',
    '  n = tamanho(A)',
    '  para i de 1 até n - 1 faça',
    '    chave = A[i]',
    '    j = i - 1',
    '    enquanto j >= 0 e A[j] > chave faça',
    '      A[j + 1] = A[j]',
    '      j = j - 1',
    '    fim enquanto',
    '    A[j + 1] = chave',
    '  fim para',
    'fim procedimento'
  ],
  legend: [
    { label: 'parte ordenada', colorClass: 'box-completed' },
    { label: 'chave a inserir', colorClass: 'box-pivot' },
    { label: 'em deslocamento', colorClass: 'box-comparing' },
    { label: 'não ordenado', colorClass: 'box-normal' }
  ]
};
