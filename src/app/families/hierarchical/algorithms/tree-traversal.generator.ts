import { HierarchicalEvent } from '../../../engine/events';

interface TraversalNode {
  id: string;
  value: number;
  left: TraversalNode | null;
  right: TraversalNode | null;
}

export function* generateTreeTraversalEvents(customValues?: readonly number[]): Generator<HierarchicalEvent> {
  const values = customValues && customValues.length >= 5 ? customValues.slice(0, 7) : [50, 30, 70, 20, 40, 60, 80];

  // 1. Construir árvore inicial
  let root: TraversalNode | null = null;
  const allIds: string[] = [];

  for (let i = 0; i < values.length; i++) {
    const val = values[i];
    const nodeId = `node-${val}-${i}`;
    allIds.push(nodeId);

    yield {
      type: 'create-node',
      id: nodeId,
      value: val,
      narration: `Construindo árvore de demonstração: inserindo nó ${val}...`,
      pseudoCodeLine: 1
    };

    if (!root) {
      root = { id: nodeId, value: val, left: null, right: null };
      yield {
        type: 'highlight',
        ids: [nodeId],
        narration: `Nó ${val} estabelecido como raiz.`,
        pseudoCodeLine: 2
      };
      continue;
    }

    let curr = root;
    while (true) {
      if (val < curr.value) {
        if (!curr.left) {
          curr.left = { id: nodeId, value: val, left: null, right: null };
          yield {
            type: 'link',
            parentId: curr.id,
            childId: nodeId,
            side: 'left',
            narration: `Conectado ${val} à esquerda de ${curr.value}.`,
            pseudoCodeLine: 4
          };
          break;
        }
        curr = curr.left;
      } else {
        if (!curr.right) {
          curr.right = { id: nodeId, value: val, left: null, right: null };
          yield {
            type: 'link',
            parentId: curr.id,
            childId: nodeId,
            side: 'right',
            narration: `Conectado ${val} à direita de ${curr.value}.`,
            pseudoCodeLine: 6
          };
          break;
        }
        curr = curr.right;
      }
    }
  }

  if (!root) {
    return;
  }

  // ==========================================
  // PERCURSO 1: EM-ORDEM (IN-ORDER)
  // Regra: Esquerda -> Raiz -> Direita
  // Propriedade: Gera os valores em ordem crescente!
  // ==========================================
  yield {
    type: 'highlight',
    ids: [root.id],
    narration: '=== Percurso 1: Em-Ordem (In-Order: Esquerda → Raiz → Direita) ===',
    pseudoCodeLine: 10
  };

  const inOrderOutput: number[] = [];
  function* inOrderTraversal(node: TraversalNode | null): Generator<HierarchicalEvent> {
    if (!node) return;

    // 1. Visitar subárvore esquerda
    if (node.left) {
      yield {
        type: 'compare',
        ids: [node.id, node.left.id],
        result: -1,
        narration: `[Em-Ordem] Descendo para subárvore esquerda de ${node.value}...`,
        pseudoCodeLine: 12
      };
      yield* inOrderTraversal(node.left);
    }

    // 2. Visitar nó atual
    inOrderOutput.push(node.value);
    yield {
      type: 'highlight',
      ids: [node.id],
      narration: `[Em-Ordem] Processando nó ${node.value}. Valor emitido para a saída.`,
      pseudoCodeLine: 14
    };

    yield {
      type: 'traversal-output',
      values: [...inOrderOutput],
      narration: `Saída ordenada atual: [${inOrderOutput.join(', ')}]`,
      pseudoCodeLine: 15
    };

    // 3. Visitar subárvore direita
    if (node.right) {
      yield {
        type: 'compare',
        ids: [node.id, node.right.id],
        result: 1,
        narration: `[Em-Ordem] Descendo para subárvore direita de ${node.value}...`,
        pseudoCodeLine: 16
      };
      yield* inOrderTraversal(node.right);
    }
  }

  yield* inOrderTraversal(root);

  yield {
    type: 'highlight',
    ids: allIds,
    narration: `Percurso Em-Ordem finalizado! Observe que os elementos estão perfeitamente ordenados: [${inOrderOutput.join(', ')}].`,
    pseudoCodeLine: 18
  };

  // ==========================================
  // PERCURSO 2: PRÉ-ORDEM (PRE-ORDER)
  // Regra: Raiz -> Esquerda -> Direita
  // ==========================================
  yield {
    type: 'highlight',
    ids: [root.id],
    narration: '=== Percurso 2: Pré-Ordem (Pre-Order: Raiz → Esquerda → Direita) ===',
    pseudoCodeLine: 20
  };

  const preOrderOutput: number[] = [];
  function* preOrderTraversal(node: TraversalNode | null): Generator<HierarchicalEvent> {
    if (!node) return;

    // 1. Processar nó antes dos filhos
    preOrderOutput.push(node.value);
    yield {
      type: 'visit',
      id: node.id,
      narration: `[Pré-Ordem] Visitando nó ${node.value} (Raiz antes dos filhos).`,
      pseudoCodeLine: 22
    };

    yield {
      type: 'traversal-output',
      values: [...preOrderOutput],
      narration: `Saída Pré-Ordem atual: [${preOrderOutput.join(', ')}]`,
      pseudoCodeLine: 23
    };

    if (node.left) yield* preOrderTraversal(node.left);
    if (node.right) yield* preOrderTraversal(node.right);
  }

  yield* preOrderTraversal(root);

  // ==========================================
  // PERCURSO 3: PÓS-ORDEM (POST-ORDER)
  // Regra: Esquerda -> Direita -> Raiz
  // ==========================================
  yield {
    type: 'highlight',
    ids: [root.id],
    narration: '=== Percurso 3: Pós-Ordem (Post-Order: Esquerda → Direita → Raiz) ===',
    pseudoCodeLine: 25
  };

  const postOrderOutput: number[] = [];
  function* postOrderTraversal(node: TraversalNode | null): Generator<HierarchicalEvent> {
    if (!node) return;

    if (node.left) yield* postOrderTraversal(node.left);
    if (node.right) yield* postOrderTraversal(node.right);

    postOrderOutput.push(node.value);
    yield {
      type: 'visit',
      id: node.id,
      narration: `[Pós-Ordem] Filhos concluídos: processando nó ${node.value}.`,
      pseudoCodeLine: 27
    };

    yield {
      type: 'traversal-output',
      values: [...postOrderOutput],
      narration: `Saída Pós-Ordem atual: [${postOrderOutput.join(', ')}]`,
      pseudoCodeLine: 28
    };
  }

  yield* postOrderTraversal(root);

  yield {
    type: 'complete',
    ids: allIds,
    narration: 'Demonstração dos percursos concluída: Em-Ordem (ordenado), Pré-Ordem (cópia) e Pós-Ordem (desalocação)!',
    pseudoCodeLine: 30
  };
}
