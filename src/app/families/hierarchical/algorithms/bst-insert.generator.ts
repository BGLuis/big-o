import { HierarchicalEvent } from '../../../engine/events';

interface LocalBSTNode {
  id: string;
  value: number;
  left: LocalBSTNode | null;
  right: LocalBSTNode | null;
  parent: LocalBSTNode | null;
}

export function* generateBSTEvents(values: readonly number[]): Generator<HierarchicalEvent> {
  if (values.length === 0) {
    return;
  }

  let root: LocalBSTNode | null = null;
  const allNodeIds: string[] = [];

  // ==========================================
  // FASE 1: INSERÇÃO
  // ==========================================
  for (let idx = 0; idx < values.length; idx++) {
    const val = values[idx];
    const nodeId = `node-${val}-${idx}`;
    allNodeIds.push(nodeId);

    // 1. Create node
    yield {
      type: 'create-node',
      id: nodeId,
      value: val,
      narration: `[Inserção] Alocando nó com chave ${val}...`,
      pseudoCodeLine: 1
    };

    if (!root) {
      root = { id: nodeId, value: val, left: null, right: null, parent: null };
      yield {
        type: 'highlight',
        ids: [nodeId],
        narration: `[Inserção] Árvore vazia: ${val} torna-se o nó raiz.`,
        pseudoCodeLine: 3
      };
      continue;
    }

    let curr: LocalBSTNode = root;
    let inserted = false;

    while (!inserted) {
      if (val < curr.value) {
        yield {
          type: 'compare',
          ids: [nodeId, curr.id],
          result: -1,
          narration: `[Inserção] Comparando ${val} < ${curr.value}: navegando para a esquerda.`,
          pseudoCodeLine: 5
        };

        if (curr.left === null) {
          const newNode: LocalBSTNode = { id: nodeId, value: val, left: null, right: null, parent: curr };
          curr.left = newNode;
          yield {
            type: 'link',
            parentId: curr.id,
            childId: nodeId,
            side: 'left',
            narration: `[Inserção] Espaço vago à esquerda de ${curr.value}. Nó ${val} conectado como filho esquerdo.`,
            pseudoCodeLine: 6
          };
          inserted = true;
        } else {
          curr = curr.left;
        }
      } else if (val > curr.value) {
        yield {
          type: 'compare',
          ids: [nodeId, curr.id],
          result: 1,
          narration: `[Inserção] Comparando ${val} > ${curr.value}: navegando para a direita.`,
          pseudoCodeLine: 7
        };

        if (curr.right === null) {
          const newNode: LocalBSTNode = { id: nodeId, value: val, left: null, right: null, parent: curr };
          curr.right = newNode;
          yield {
            type: 'link',
            parentId: curr.id,
            childId: nodeId,
            side: 'right',
            narration: `[Inserção] Espaço vago à direita de ${curr.value}. Nó ${val} conectado como filho direito.`,
            pseudoCodeLine: 8
          };
          inserted = true;
        } else {
          curr = curr.right;
        }
      } else {
        yield {
          type: 'highlight',
          ids: [curr.id],
          narration: `[Inserção] O valor ${val} já existe na árvore. Inserção ignorada.`,
          pseudoCodeLine: 10
        };
        inserted = true;
      }
    }
  }

  // ==========================================
  // FASE 2: BUSCA (SEARCH) O(h)
  // ==========================================
  if (root && values.length >= 3) {
    const searchTarget = values[Math.min(3, values.length - 1)];
    yield {
      type: 'highlight',
      ids: [root.id],
      narration: `[Busca O(log n)] Iniciando busca pelo elemento ${searchTarget} a partir da raiz...`,
      pseudoCodeLine: 12
    };

    let currSearch: LocalBSTNode | null = root;
    while (currSearch) {
      yield {
        type: 'visit',
        id: currSearch.id,
        narration: `[Busca] Inspecionando nó ${currSearch.value}...`,
        pseudoCodeLine: 14
      };

      if (searchTarget === currSearch.value) {
        yield {
          type: 'highlight',
          ids: [currSearch.id],
          narration: `[Busca] Elemento ${searchTarget} localizado com sucesso na árvore!`,
          pseudoCodeLine: 15
        };
        break;
      } else if (searchTarget < currSearch.value) {
        yield {
          type: 'visit',
          id: currSearch.id,
          narration: `[Busca] Como ${searchTarget} < ${currSearch.value}, descemos para a subárvore esquerda.`,
          pseudoCodeLine: 17
        };
        currSearch = currSearch.left;
      } else {
        yield {
          type: 'visit',
          id: currSearch.id,
          narration: `[Busca] Como ${searchTarget} > ${currSearch.value}, descemos para a subárvore direita.`,
          pseudoCodeLine: 19
        };
        currSearch = currSearch.right;
      }
    }
  }

  // ==========================================
  // FASE 3: REMOÇÃO (DELETE) - 3 CASOS CLÁSSICOS
  // ==========================================
  // Caso 1: Remoção de Nó Folha
  if (root) {
    // Localizar uma folha
    let leafNode: LocalBSTNode | null = null;
    function findLeaf(node: LocalBSTNode | null): LocalBSTNode | null {
      if (!node) return null;
      if (!node.left && !node.right) return node;
      return findLeaf(node.left) || findLeaf(node.right);
    }
    leafNode = findLeaf(root);

    if (leafNode && leafNode !== root && leafNode.parent) {
      yield {
        type: 'highlight',
        ids: [leafNode.id],
        narration: `[Remoção · Caso 1 - Folha] Removendo o nó ${leafNode.value} (não possui filhos).`,
        pseudoCodeLine: 22
      };

      const parentNode = leafNode.parent;
      const isLeft = parentNode.left === leafNode;
      if (isLeft) parentNode.left = null;
      else parentNode.right = null;

      yield {
        type: 'unlink',
        parentId: parentNode.id,
        side: isLeft ? 'left' : 'right',
        narration: `[Remoção · Caso 1] Desconectando aresta do pai ${parentNode.value}.`,
        pseudoCodeLine: 24
      };

      yield {
        type: 'remove-node',
        id: leafNode.id,
        narration: `[Remoção · Caso 1] Nó folha ${leafNode.value} removido com sucesso em O(1) ponteiros!`,
        pseudoCodeLine: 25
      };
    }

    // Caso 3: Remoção de Nó com 2 filhos (Substituição por Sucessor em-ordem)
    // Encontrar nó com 2 filhos
    function findTwoChildrenNode(node: LocalBSTNode | null): LocalBSTNode | null {
      if (!node) return null;
      if (node.left && node.right) return node;
      return findTwoChildrenNode(node.left) || findTwoChildrenNode(node.right);
    }

    const twoChildNode = findTwoChildrenNode(root);
    if (twoChildNode && twoChildNode.right) {
      yield {
        type: 'highlight',
        ids: [twoChildNode.id],
        narration: `[Remoção · Caso 3 - Dois Filhos] Removendo nó ${twoChildNode.value} que possui 2 filhos.`,
        pseudoCodeLine: 27
      };

      // Localizar o sucessor em-ordem (menor na subárvore direita)
      let successor: LocalBSTNode = twoChildNode.right;
      yield {
        type: 'visit',
        id: successor.id,
        narration: `[Remoção · Caso 3] Buscando o sucessor em-ordem (menor nó da subárvore direita)...`,
        pseudoCodeLine: 28
      };

      while (successor.left) {
        successor = successor.left;
        yield {
          type: 'visit',
          id: successor.id,
          narration: `[Remoção · Caso 3] Descendo à esquerda: sucessor candidato é ${successor.value}.`,
          pseudoCodeLine: 29
        };
      }

      yield {
        type: 'highlight',
        ids: [successor.id],
        narration: `[Remoção · Caso 3] Sucessor em-ordem encontrado: ${successor.value}. Copiando seu valor para o nó ${twoChildNode.value}.`,
        pseudoCodeLine: 30
      };

      const oldVal = twoChildNode.value;
      twoChildNode.value = successor.value;

      yield {
        type: 'update-node-value',
        id: twoChildNode.id,
        value: successor.value,
        narration: `[Remoção · Caso 3] Valor ${successor.value} copiado para a posição de ${oldVal}. Agora removemos o nó sucessor original.`,
        pseudoCodeLine: 31
      };

      // Desconectar sucessor
      if (successor.parent) {
        const succParent = successor.parent;
        const isSuccLeft = succParent.left === successor;
        if (isSuccLeft) {
          succParent.left = successor.right;
        } else {
          succParent.right = successor.right;
        }

        yield {
          type: 'unlink',
          parentId: succParent.id,
          side: isSuccLeft ? 'left' : 'right',
          narration: `[Remoção · Caso 3] Desconectando o sucessor original ${successor.value}.`,
          pseudoCodeLine: 32
        };

        if (successor.right) {
          yield {
            type: 'link',
            parentId: succParent.id,
            childId: successor.right.id,
            side: isSuccLeft ? 'left' : 'right',
            narration: `[Remoção · Caso 3] Promovendo a subárvore direita do sucessor.`,
            pseudoCodeLine: 33
          };
        }
      }

      yield {
        type: 'remove-node',
        id: successor.id,
        narration: `[Remoção · Caso 3] Remoção concluída com sucesso mantendo a propriedade BST!`,
        pseudoCodeLine: 34
      };
    }
  }

  // ==========================================
  // FINALIZAÇÃO
  // ==========================================
  yield {
    type: 'complete',
    ids: allNodeIds,
    narration: 'Operações fundamentais em Árvore Binária de Busca concluídas: Inserção, Busca e Remoção!',
    pseudoCodeLine: 35
  };
}
