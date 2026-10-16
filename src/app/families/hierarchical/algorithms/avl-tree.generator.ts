import { HierarchicalEvent } from '../../../engine/events';

interface AVLNode {
  id: string;
  value: number;
  left: AVLNode | null;
  right: AVLNode | null;
  height: number;
}

function getHeight(node: AVLNode | null): number {
  return node ? node.height : 0;
}

function getBalance(node: AVLNode | null): number {
  return node ? getHeight(node.left) - getHeight(node.right) : 0;
}

export function* generateAVLEvents(customValues?: readonly number[]): Generator<HierarchicalEvent> {
  // Sequência padrão cuidadosamente selecionada para demonstrar rotações AVL
  const values = customValues && customValues.length >= 3 ? customValues.slice(0, 7) : [30, 20, 10, 40, 50, 25];

  let root: AVLNode | null = null;
  const allIds: string[] = [];

  yield {
    type: 'highlight',
    ids: [],
    narration: 'Árvore AVL: Árvore Binária de Busca auto-balanceável onde |BF| ≤ 1 para todo nó (BF = Altura Esq - Altura Dir).',
    pseudoCodeLine: 1
  };

  for (let i = 0; i < values.length; i++) {
    const val = values[i];
    const nodeId = `avl-${val}-${i}`;
    allIds.push(nodeId);

    // 1. Criação do nó
    yield {
      type: 'create-node',
      id: nodeId,
      value: val,
      narration: `[Inserção AVL] Alocando nó ${val}...`,
      pseudoCodeLine: 3
    };

    yield {
      type: 'set-node-meta',
      id: nodeId,
      height: 1,
      balanceFactor: 0,
      narration: `[Inserção AVL] Nó ${val} inicializado com altura 1 e BF = 0.`,
      pseudoCodeLine: 4
    };

    if (!root) {
      root = { id: nodeId, value: val, left: null, right: null, height: 1 };
      yield {
        type: 'highlight',
        ids: [nodeId],
        narration: `[Inserção AVL] Árvore vazia: ${val} torna-se a raiz da árvore AVL.`,
        pseudoCodeLine: 5
      };
      continue;
    }

    // Inserção padrão BST
    let curr: AVLNode = root;
    const path: AVLNode[] = [];

    while (curr) {
      path.push(curr);
      if (val < curr.value) {
        yield {
          type: 'compare',
          ids: [nodeId, curr.id],
          result: -1,
          narration: `[Inserção AVL] ${val} < ${curr.value}: descendo para a esquerda.`,
          pseudoCodeLine: 8
        };
        if (!curr.left) {
          curr.left = { id: nodeId, value: val, left: null, right: null, height: 1 };
          yield {
            type: 'link',
            parentId: curr.id,
            childId: nodeId,
            side: 'left',
            narration: `[Inserção AVL] Conectado nó ${val} como filho esquerdo de ${curr.value}.`,
            pseudoCodeLine: 9
          };
          break;
        }
        curr = curr.left;
      } else if (val > curr.value) {
        yield {
          type: 'compare',
          ids: [nodeId, curr.id],
          result: 1,
          narration: `[Inserção AVL] ${val} > ${curr.value}: descendo para a direita.`,
          pseudoCodeLine: 11
        };
        if (!curr.right) {
          curr.right = { id: nodeId, value: val, left: null, right: null, height: 1 };
          yield {
            type: 'link',
            parentId: curr.id,
            childId: nodeId,
            side: 'right',
            narration: `[Inserção AVL] Conectado nó ${val} como filho direito de ${curr.value}.`,
            pseudoCodeLine: 12
          };
          break;
        }
        curr = curr.right;
      } else {
        break;
      }
    }

    // Subir o caminho atualizando alturas e verificando balanceamento
    for (let pIdx = path.length - 1; pIdx >= 0; pIdx--) {
      const node = path[pIdx];
      node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
      const bf = getBalance(node);

      yield {
        type: 'set-node-meta',
        id: node.id,
        height: node.height,
        balanceFactor: bf,
        narration: `[Verificação AVL] Nó ${node.value}: Altura = ${node.height}, Fator de Balanceamento BF = ${bf}.`,
        pseudoCodeLine: 16
      };

      // Casos de desbalanceamento:
      // Caso 1: Rotação à Direita (LL)
      if (bf > 1 && node.left && val < node.left.value) {
        yield {
          type: 'highlight',
          ids: [node.id],
          narration: `[Desbalanceamento LL] Nó ${node.value} possui BF = +${bf} (> 1). Caso Esquerda-Esquerda: aplicando Rotação Simples à Direita!`,
          pseudoCodeLine: 20
        };

        yield {
          type: 'rotate',
          pivotId: node.id,
          direction: 'right',
          narration: `[Rotação Direita] O filho esquerdo sobe para a posição de ${node.value}. Alturas rebalanceadas!`,
          pseudoCodeLine: 21
        };

        // Atualizar ponteiros locais
        const leftChild = node.left;
        node.left = leftChild.right;
        leftChild.right = node;
        node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
        leftChild.height = 1 + Math.max(getHeight(leftChild.left), getHeight(leftChild.right));

        if (pIdx === 0) {
          root = leftChild;
        } else {
          const parentOfNode = path[pIdx - 1];
          if (parentOfNode.left === node) parentOfNode.left = leftChild;
          else parentOfNode.right = leftChild;
        }

        yield {
          type: 'set-node-meta',
          id: node.id,
          height: node.height,
          balanceFactor: getBalance(node),
          narration: `Atualizando altura do nó ${node.value} para ${node.height}.`
        };
        yield {
          type: 'set-node-meta',
          id: leftChild.id,
          height: leftChild.height,
          balanceFactor: getBalance(leftChild),
          narration: `[Balanceamento Concluído] Árvore reequilibrada em O(1) rotações!`,
          pseudoCodeLine: 22
        };
        break;
      }

      // Caso 2: Rotação à Esquerda (RR)
      if (bf < -1 && node.right && val > node.right.value) {
        yield {
          type: 'highlight',
          ids: [node.id],
          narration: `[Desbalanceamento RR] Nó ${node.value} possui BF = ${bf} (< -1). Caso Direita-Direita: aplicando Rotação Simples à Esquerda!`,
          pseudoCodeLine: 24
        };

        yield {
          type: 'rotate',
          pivotId: node.id,
          direction: 'left',
          narration: `[Rotação Esquerda] O filho direito sobe para a posição de ${node.value}.`,
          pseudoCodeLine: 25
        };

        const rightChild = node.right;
        node.right = rightChild.left;
        rightChild.left = node;
        node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
        rightChild.height = 1 + Math.max(getHeight(rightChild.left), getHeight(rightChild.right));

        if (pIdx === 0) {
          root = rightChild;
        } else {
          const parentOfNode = path[pIdx - 1];
          if (parentOfNode.left === node) parentOfNode.left = rightChild;
          else parentOfNode.right = rightChild;
        }

        yield {
          type: 'set-node-meta',
          id: node.id,
          height: node.height,
          balanceFactor: getBalance(node),
          narration: `Atualizando altura do nó ${node.value} para ${node.height}.`
        };
        yield {
          type: 'set-node-meta',
          id: rightChild.id,
          height: rightChild.height,
          balanceFactor: getBalance(rightChild),
          narration: `[Balanceamento Concluído] Rotação à esquerda concluída com sucesso!`,
          pseudoCodeLine: 26
        };
        break;
      }

      // Caso 3: Rotação Dupla Esquerda-Direita (LR)
      if (bf > 1 && node.left && val > node.left.value) {
        yield {
          type: 'highlight',
          ids: [node.id, node.left.id],
          narration: `[Desbalanceamento LR] Caso Esquerda-Direita detectado em ${node.value}. Passo 1: Rotação à esquerda no filho ${node.left.value}.`,
          pseudoCodeLine: 28
        };

        yield {
          type: 'rotate',
          pivotId: node.left.id,
          direction: 'left',
          narration: `[Rotação Esquerda no Filho] Alinhando o ramo à esquerda.`,
          pseudoCodeLine: 29
        };

        const leftChild = node.left;
        const subRight = leftChild.right!;
        leftChild.right = subRight.left;
        subRight.left = leftChild;
        node.left = subRight;

        yield {
          type: 'rotate',
          pivotId: node.id,
          direction: 'right',
          narration: `[Passo 2 - Rotação Direita no Pai] Concluindo rotação dupla LR em torno de ${node.value}.`,
          pseudoCodeLine: 30
        };

        node.left = subRight.right;
        subRight.right = node;

        if (pIdx === 0) {
          root = subRight;
        } else {
          const parentOfNode = path[pIdx - 1];
          if (parentOfNode.left === node) parentOfNode.left = subRight;
          else parentOfNode.right = subRight;
        }
        break;
      }
    }
  }

  yield {
    type: 'complete',
    ids: allIds,
    narration: 'Demonstração da Árvore AVL concluída: altura balanceada O(log n) garantida por rotações!',
    pseudoCodeLine: 32
  };
}
