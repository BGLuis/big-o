import { AlgorithmContent } from './content.types';

export const AVL_TREE_CONTENT: AlgorithmContent = {
  id: 'avl-tree',
  title: 'Árvore AVL (Auto-Balanceamento)',
  category: 'data-structure',
  family: 'hierarchical',
  timeComplexity: {
    best: 'Θ(log n)',
    average: 'Θ(log n)',
    worst: 'Θ(log n)',
    theta: 'Θ(log n)'
  },
  spaceComplexity: 'O(n)',
  shortDescription:
    'Árvore Binária de Busca estritamente balanceada via rotações onde a diferença de alturas (BF) nunca excede 1.',
  fullExplanation:
    'Criada pelos matemáticos soviéticos Adelson-Velsky e Landis (1962), a Árvore AVL é a primeira estrutura de árvore de busca auto-balanceável da história da computação. Cada nó armazena ou calcula o Fator de Balanceamento: BF = altura(esquerda) - altura(direita). A invariante mandatória é que BF ∈ {-1, 0, 1} para todos os nós. Caso uma inserção ou remoção viole esse equilíbrio (BF = ±2), a árvore restaura o balanceamento em tempo O(1) através de uma das 4 rotações canônicas: Rotação Simples à Direita (Caso LL), Rotação Simples à Esquerda (Caso RR), Rotação Dupla Esquerda-Direita (Caso LR) e Rotação Dupla Direita-Esquerda (Caso RL). Por ser estritamente balanceada, sua altura nunca ultrapassa 1.44 log₂(n), garantindo buscas extremamente velozes.',
  kicker: 'Árvores Balanceadas · Rotações O(1)',
  pedagogicalNote:
    'A Árvore AVL tem pior caso garantido de Θ(log n) para busca, inserção e remoção. Em aplicações com leitura muito mais frequente que escrita, a AVL supera a Árvore Rubro-Negra por ser mais rígida e compacta.',
  pseudoCode: [
    'função fatorBalanceamento(nó)',
    '  se nó é nulo então retorne 0',
    '  retorne altura(nó.esq) - altura(nó.dir)',
    '',
    'função rotacaoDireita(y)',
    '  x = y.esq; T2 = x.dir',
    '  x.dir = y; y.esq = T2',
    '  atualizarAltura(y); atualizarAltura(x)',
    '  retorne x',
    '',
    'função rotacaoEsquerda(x)',
    '  y = x.dir; T2 = y.esq',
    '  y.esq = x; x.dir = T2',
    '  atualizarAltura(x); atualizarAltura(y)',
    '  retorne y',
    '',
    'função rebalancear(nó)',
    '  bf = fatorBalanceamento(nó)',
    '  se bf > 1 e fatorBalanceamento(nó.esq) >= 0 então retorne rotacaoDireita(nó) // LL',
    '  se bf > 1 e fatorBalanceamento(nó.esq) < 0 então // LR',
    '    nó.esq = rotacaoEsquerda(nó.esq); retorne rotacaoDireita(nó)',
    '  se bf < -1 e fatorBalanceamento(nó.dir) <= 0 então retorne rotacaoEsquerda(nó) // RR',
    '  se bf < -1 e fatorBalanceamento(nó.dir) > 0 então // RL',
    '    nó.dir = rotacaoDireita(nó.dir); retorne rotacaoEsquerda(nó)',
    '  retorne nó'
  ]
};
