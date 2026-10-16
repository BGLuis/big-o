import { DatasetPresetId, SandboxPreset } from './sandbox.types';

export const SANDBOX_PRESETS: readonly SandboxPreset[] = [
  {
    id: 'random',
    title: 'Amostra Equilibrada',
    badge: 'Geral · Aleatório',
    description: 'Distribuição uniforme sem viés pré-existente, ideal para comparar o comportamento médio de algoritmos de propósito geral.',
    category: 'sorting',
    values: [42, 15, 78, 23, 91, 11, 64, 37, 55, 19],
    recommendedLeft: 'quick-sort',
    recommendedRight: 'heap-sort'
  },
  {
    id: 'nearly-sorted',
    title: 'Quase Ordenado · Melhor Caso Adaptativo',
    badge: 'Adaptativo',
    description: 'Array quase ordenado com raras inversões locais. Algoritmos adaptativos como Insertion Sort e Timsort executam em tempo quase linear O(n).',
    category: 'sorting',
    values: [10, 18, 15, 24, 32, 40, 38, 52, 60, 75],
    recommendedLeft: 'insertion-sort',
    recommendedRight: 'quick-sort'
  },
  {
    id: 'reversed',
    title: 'Ordem Inversa · Pior Caso do Pivô Extremo',
    badge: 'Pior Caso O(n²)',
    description: 'Valores em ordem estritamente decrescente. Dispara o pior caso quadrático O(n²) em implementações ingênuas de particionamento do Quick Sort.',
    category: 'sorting',
    values: [95, 84, 73, 62, 51, 40, 29, 18, 12, 5],
    recommendedLeft: 'quick-sort',
    recommendedRight: 'heap-sort'
  },
  {
    id: 'few-unique',
    title: 'Muitas Chaves Duplicadas',
    badge: 'Chaves Duplicadas',
    description: 'Coleção com pouquíssimas chaves distintas repetidas. Revela como o particionamento de 3 vias (Dual-Pivot) e Counting Sort superam ordenações tradicionais.',
    category: 'sorting',
    values: [30, 10, 30, 20, 10, 30, 20, 10, 20, 30],
    recommendedLeft: 'dual-pivot-quick-sort',
    recommendedRight: 'quick-sort'
  },
  {
    id: 'avl-rotations',
    title: 'Rotações Simples AVL (LL & RR)',
    badge: 'Rotações Simples',
    description: 'Sequências de inserções desbalanceadas à esquerda e à direita disparando rotações simples (Direita e Esquerda) para restaurar |FB| <= 1.',
    category: 'tree',
    values: [30, 20, 10, 40, 50],
    recommendedLeft: 'bst',
    recommendedRight: 'avl-tree'
  },
  {
    id: 'avl-double-lr-rl',
    title: 'Rotações Duplas AVL (LR & RL)',
    badge: 'Rotações Duplas',
    description: 'Inserções do tipo zig-zag (Esquerda-Direita e Direita-Esquerda) que exigem rotações duplas para balancear a subárvore intermediária.',
    category: 'tree',
    values: [40, 20, 30, 60, 50],
    recommendedLeft: 'bst',
    recommendedRight: 'avl-tree'
  },
  {
    id: 'degenerate-bst',
    title: 'Sequência Crescente · Degeneração O(n) vs O(log n)',
    badge: 'Degeneração O(n)',
    description: 'Inserção puramente crescente que degenera uma BST comum em uma lista encadeada O(n), enquanto a árvore AVL preserva altura O(log n).',
    category: 'tree',
    values: [10, 20, 30, 40, 50, 60, 70],
    recommendedLeft: 'bst',
    recommendedRight: 'avl-tree'
  },
  {
    id: 'rb-recolor',
    title: 'Recolorização e Balanceamento Rubro-Negro',
    badge: 'Árvore Rubro-Negra',
    description: 'Inserções demonstrando casos de tio vermelho (recolorização de nós sem rotação) e balanceamento com altura preta balanceada.',
    category: 'tree',
    values: [20, 10, 30, 5, 15, 25, 35],
    recommendedLeft: 'avl-tree',
    recommendedRight: 'red-black-tree'
  }
];

export function generateDatasetByPreset(presetId: DatasetPresetId, count = 10): number[] {
  if (presetId === 'random') {
    const min = 10;
    const max = 99;
    const generated: number[] = [];
    const used = new Set<number>();
    for (let i = 0; i < count; i++) {
      let val = Math.floor(Math.random() * (max - min + 1)) + min;
      let attempts = 0;
      while (used.has(val) && attempts < 50) {
        val = Math.floor(Math.random() * (max - min + 1)) + min;
        attempts++;
      }
      used.add(val);
      generated.push(val);
    }
    return generated;
  }

  const found = SANDBOX_PRESETS.find((p) => p.id === presetId);
  if (found) {
    return [...found.values];
  }

  return [42, 15, 78, 23, 91, 11, 64, 37, 55, 19].slice(0, count);
}
