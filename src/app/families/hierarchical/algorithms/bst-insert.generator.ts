import { HierarchicalEvent } from '../../../engine/events';

interface LocalBSTNode {
  id: string;
  value: number;
  left: LocalBSTNode | null;
  right: LocalBSTNode | null;
}

export function* generateBSTEvents(values: readonly number[]): Generator<HierarchicalEvent> {
  if (values.length === 0) {
    return;
  }

  let root: LocalBSTNode | null = null;
  const allNodeIds: string[] = [];

  for (let idx = 0; idx < values.length; idx++) {
    const val = values[idx];
    const nodeId = `node-${val}-${idx}`;
    allNodeIds.push(nodeId);

    // 1. Create node
    yield {
      type: 'create-node',
      id: nodeId,
      value: val,
      narration: `Iniciando inserção do valor ${val} na árvore...`,
      pseudoCodeLine: 1
    };

    if (!root) {
      // Tree is empty, node is root
      root = { id: nodeId, value: val, left: null, right: null };
      yield {
        type: 'highlight',
        ids: [nodeId],
        narration: `A árvore estava vazia. O nó com valor ${val} torna-se a nova raiz.`,
        pseudoCodeLine: 3
      };
      continue;
    }

    // Traverse to find insertion slot
    let curr: LocalBSTNode = root;
    let inserted = false;

    while (!inserted) {
      if (val < curr.value) {
        yield {
          type: 'compare',
          ids: [nodeId, curr.id],
          result: -1,
          narration: `Comparando ${val} com ${curr.value}: como ${val} < ${curr.value}, navegamos para a esquerda.`,
          pseudoCodeLine: 5
        };

        if (curr.left === null) {
          const newNode: LocalBSTNode = { id: nodeId, value: val, left: null, right: null };
          curr.left = newNode;
          yield {
            type: 'link',
            parentId: curr.id,
            childId: nodeId,
            side: 'left',
            narration: `Espaço livre à esquerda de ${curr.value}. Inserido o nó ${val} como filho esquerdo.`,
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
          narration: `Comparando ${val} com ${curr.value}: como ${val} > ${curr.value}, navegamos para a direita.`,
          pseudoCodeLine: 7
        };

        if (curr.right === null) {
          const newNode: LocalBSTNode = { id: nodeId, value: val, left: null, right: null };
          curr.right = newNode;
          yield {
            type: 'link',
            parentId: curr.id,
            childId: nodeId,
            side: 'right',
            narration: `Espaço livre à direita de ${curr.value}. Inserido o nó ${val} como filho direito.`,
            pseudoCodeLine: 8
          };
          inserted = true;
        } else {
          curr = curr.right;
        }
      } else {
        // Value already in tree
        yield {
          type: 'highlight',
          ids: [curr.id],
          narration: `O valor ${val} já existe na árvore. Inserção finalizada.`,
          pseudoCodeLine: 10
        };
        inserted = true;
      }
    }
  }

  yield {
    type: 'complete',
    ids: allNodeIds,
    narration: 'Construção da Árvore Binária de Busca concluída com sucesso!',
    pseudoCodeLine: 10
  };
}
