import { AlgorithmContent } from './content.types';

export const BST_CONTENT: AlgorithmContent = {
  id: 'bst',
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
    'Uma Árvore Binária de Busca (BST) organiza dados de forma hierárquica onde, para cada nó, todos os elementos da subárvore esquerda possuem chaves menores e todos da subárvore direita possuem chaves maiores. Essa propriedade invariante permite realizar buscas, inserções e remoções em tempo médio O(log n). A remoção divide-se em 3 casos fundamentais: (1) nó folha sem filhos, que é desalocado diretamente; (2) nó com filho único, cujo filho é promovido para a posição do pai; e (3) nó com dois filhos, cujo valor é substituído pelo seu sucessor em-ordem (menor elemento da subárvore direita), seguido da remoção do nó sucessor original.',
  kicker: 'Estruturas de Dados · Árvores',
  pedagogicalNote:
    'No caso médio balanceado, o custo de busca, inserção e remoção é O(log n). Se elementos forem inseridos em ordem crescente ou decrescente, a árvore degenera em uma lista encadeada simples com altura O(n).',
  pseudoCode: [
    'função inserir(raiz, valor)',
    '  se raiz é nula então retorne novo Nó(valor)',
    '  se valor < raiz.valor então raiz.esq = inserir(raiz.esq, valor)',
    '  senão se valor > raiz.valor então raiz.dir = inserir(raiz.dir, valor)',
    '  retorne raiz',
    '',
    'função buscar(raiz, chave)',
    '  se raiz é nula ou raiz.valor == chave então retorne raiz',
    '  se chave < raiz.valor então retorne buscar(raiz.esq, chave)',
    '  retorne buscar(raiz.dir, chave)',
    '',
    'função remover(raiz, chave)',
    '  se raiz é nula então retorne nulo',
    '  se chave < raiz.valor então raiz.esq = remover(raiz.esq, chave)',
    '  senão se chave > raiz.valor então raiz.dir = remover(raiz.dir, chave)',
    '  senão // Nó encontrado',
    '    se raiz.esq é nulo então retorne raiz.dir // Caso 1 ou 2',
    '    se raiz.dir é nulo então retorne raiz.esq // Caso 2',
    '    // Caso 3: Dois filhos -> substitui pelo sucessor em-ordem',
    '    sucessor = menorValor(raiz.dir)',
    '    raiz.valor = sucessor.valor',
    '    raiz.dir = remover(raiz.dir, sucessor.valor)',
    '  retorne raiz'
  ]
};
