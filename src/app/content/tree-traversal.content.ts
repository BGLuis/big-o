import { AlgorithmContent } from './content.types';

export const TREE_TRAVERSAL_CONTENT: AlgorithmContent = {
  id: 'tree-traversal',
  title: 'Travessias em Árvore (In-Order, Pre, Post)',
  category: 'data-structure',
  family: 'hierarchical',
  timeComplexity: {
    best: 'Θ(n)',
    average: 'Θ(n)',
    worst: 'Θ(n)',
    theta: 'Θ(n)'
  },
  spaceComplexity: 'O(h)',
  shortDescription:
    'Estratégias sistemáticas de percurso em profundidade (DFS) para processar todos os nós de uma árvore binária.',
  fullExplanation:
    'As travessias em árvore binária são algoritmos de busca em profundidade (DFS) fundamentais para inspecionar, transformar ou extrair dados de estruturas hierárquicas. Cada estratégia dita o momento exato em que a raiz é processada em relação aos seus filhos:\n' +
    '1. Em-Ordem (In-Order: Esquerda → Raiz → Direita): Em uma Árvore Binária de Busca, este percurso produz a sequência de nós em ordem estritamente crescente e ordenada.\n' +
    '2. Pré-Ordem (Pre-Order: Raiz → Esquerda → Direita): Visita o nó antes dos seus descendentes. É a técnica canônica para clonar, serializar ou criar cópias completas de árvores em memória.\n' +
    '3. Pós-Ordem (Post-Order: Esquerda → Direita → Raiz): Visita os descendentes antes da raiz. É utilizada em desalocação de memória (onde os filhos devem ser liberados antes do pai) e avaliação de árvores de expressões matemáticas sintáticas.',
  kicker: 'Árvores · Percursos em Profundidade DFS',
  pedagogicalNote:
    'Todas as três travessias visitam cada um dos n nós exatamente uma vez, operando em tempo linear estrito Θ(n). O consumo de memória é proporcional à altura da árvore O(h), correspondente à pilha de chamadas recursivas.',
  pseudoCode: [
    'função emOrdem(nó)',
    '  se nó não é nulo então',
    '    emOrdem(nó.esquerda)',
    '    processar(nó.valor) // Gera sequência ordenada',
    '    emOrdem(nó.direita)',
    '  fim se',
    '',
    'função preOrdem(nó)',
    '  se nó não é nulo então',
    '    processar(nó.valor) // Raiz primeiro (cópia / serialização)',
    '    preOrdem(nó.esquerda)',
    '    preOrdem(nó.direita)',
    '  fim se',
    '',
    'função posOrdem(nó)',
    '  se nó não é nulo então',
    '    posOrdem(nó.esquerda)',
    '    posOrdem(nó.direita)',
    '    processar(nó.valor) // Filhos primeiro (desalocação)',
    '  fim se'
  ]
};
