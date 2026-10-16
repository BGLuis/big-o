import { AlgorithmContent } from './content.types';

export const RED_BLACK_TREE_CONTENT: AlgorithmContent = {
  id: 'red-black-tree',
  title: 'Árvore Rubro-Negra (Red-Black Tree)',
  category: 'data-structure',
  family: 'hierarchical',
  timeComplexity: {
    best: 'O(log n)',
    average: 'O(log n)',
    worst: 'O(log n)',
    theta: 'Θ(log n)'
  },
  spaceComplexity: 'O(n)',
  shortDescription:
    'Árvore auto-balanceada por regras de coloração onde caminhos nunca diferem por mais de 2× em comprimento.',
  fullExplanation:
    'A Árvore Rubro-Negra é uma Árvore Binária de Busca auto-balanceável onde cada nó possui um bit de cor adicional (Vermelho ou Preto). O balanceamento é garantido por 5 propriedades fundamentais:\n' +
    '1. Cada nó é Vermelho ou Preto.\n' +
    '2. A raiz é sempre Preta.\n' +
    '3. Todas as folhas externas (NIL) são Pretas.\n' +
    '4. Se um nó é Vermelho, seus dois filhos devem ser Pretos (não existem nós vermelhos consecutivos em nenhum caminho).\n' +
    '5. Para qualquer nó, todo caminho simples até suas folhas descendentes contém o mesmo número exato de nós Pretos (propriedade da Altura Preta).\n' +
    'Diferente da AVL, a Rubro-Negra tolera um desbalanceamento moderado de altura (o maior caminho é no máximo o dobro do menor), mas em troca realiza um número significativamente menor de rotações durante inserções e deleções (no máximo 2 rotações por inserção e 3 por remoção). Por essa eficiência prática com escritas frequentes, é a estrutura padrão adotada no Java (java.util.TreeMap, TreeSet), no Linux Kernel (rbtree.h) e na C++ STL (std::map, std::set).',
  kicker: 'Árvores Balanceadas · Coloração & Invariantes',
  pedagogicalNote:
    'Como o caminho mais longo não ultrapassa 2·log₂(n+1), o tempo de busca, inserção e remoção no pior caso é estritamente O(log n).',
  pseudoCode: [
    'função inserirRB(árvore, valor)',
    '  nó = novo Nó(valor, cor: VERMELHO)',
    '  inserirBST(árvore, nó)',
    '  enquanto nó != raiz e nó.pai.cor == VERMELHO faça',
    '    se nó.pai == nó.avô.esq então',
    '      tio = nó.avô.dir',
    '      se tio.cor == VERMELHO então // Caso 1: Recoloração',
    '        nó.pai.cor = PRETO; tio.cor = PRETO; nó.avô.cor = VERMELHO',
    '        nó = nó.avô',
    '      senão',
    '        se nó == nó.pai.dir então // Caso 2: Rotação Dupla',
    '          nó = nó.pai; rotacaoEsquerda(árvore, nó)',
    '        // Caso 3: Rotação Simples',
    '        nó.pai.cor = PRETO; nó.avô.cor = VERMELHO',
    '        rotacaoDireita(árvore, nó.avô)',
    '    senão // Ramo simétrico à direita',
    '      // ... operações simétricas',
    '  raiz.cor = PRETO'
  ]
};
