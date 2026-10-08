import { AlgorithmContent } from './content.types';

export const BST_CONTENT: AlgorithmContent = {
  id: 'bst-insert',
  title: 'Árvore Binária de Busca (BST)',
  category: 'data-structure',
  family: 'hierarchical',
  timeComplexity: {
    best: 'O(log n)',
    average: 'O(log n)',
    worst: 'O(n)'
  },
  spaceComplexity: 'O(n)',
  shortDescription:
    'Estrutura hierárquica onde nós à esquerda são menores e nós à direita são maiores que a raiz.',
  fullExplanation:
    'Uma Árvore Binária de Busca é uma estrutura de dados onde cada nó possui no máximo dois filhos. Para qualquer nó, todos os elementos na subárvore esquerda são menores e todos na subárvore direita são maiores. Isso permite buscas, inserções e remoções eficientes.',
  pseudoCode: [
    'função inserir(raiz, valor)',
    '  se raiz é nula então',
    '    retorne novo Nó(valor)',
    '  fim se',
    '  se valor < raiz.valor então',
    '    raiz.esquerda = inserir(raiz.esquerda, valor)',
    '  senão se valor > raiz.valor então',
    '    raiz.direita = inserir(raiz.direita, valor)',
    '  fim se',
    '  retorne raiz',
    'fim função'
  ]
};
