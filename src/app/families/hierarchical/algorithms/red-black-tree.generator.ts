import { HierarchicalEvent } from '../../../engine/events';

interface RBNode {
  id: string;
  value: number;
  color: 'red' | 'black';
  left: RBNode | null;
  right: RBNode | null;
  parent: RBNode | null;
}

export function* generateRedBlackEvents(customValues?: readonly number[]): Generator<HierarchicalEvent> {
  const values = customValues && customValues.length >= 3 ? customValues.slice(0, 6) : [20, 10, 30, 5, 15, 25];

  let root: RBNode | null = null;
  const allIds: string[] = [];

  yield {
    type: 'highlight',
    ids: [],
    narration: 'Árvore Rubro-Negra: BST balanceada por coloração. Regras: Raiz é Preta, nós novos são Vermelhos, sem nós vermelhos consecutivos.',
    pseudoCodeLine: 1
  };

  for (let idx = 0; idx < values.length; idx++) {
    const val = values[idx];
    const nodeId = `rb-${val}-${idx}`;
    allIds.push(nodeId);

    // Criação: novo nó sempre entra como VERMELHO
    yield {
      type: 'create-node',
      id: nodeId,
      value: val,
      narration: `[Inserção RB] Inserindo nó ${val} como Vermelho.`,
      pseudoCodeLine: 3
    };

    yield {
      type: 'set-node-meta',
      id: nodeId,
      color: 'red',
      narration: `[Regra RB] Todo novo nó é inicialmente colorido de Vermelho.`,
      pseudoCodeLine: 4
    };

    if (!root) {
      root = { id: nodeId, value: val, color: 'black', left: null, right: null, parent: null };
      yield {
        type: 'set-node-meta',
        id: nodeId,
        color: 'black',
        narration: `[Propriedade 1] Nó ${val} é a raiz da árvore. A raiz DEVE ser sempre Preta.`,
        pseudoCodeLine: 6
      };
      continue;
    }

    // Inserção BST tradicional
    let curr: RBNode = root;
    let newNode: RBNode | null = null;

    while (curr) {
      if (val < curr.value) {
        if (!curr.left) {
          newNode = { id: nodeId, value: val, color: 'red', left: null, right: null, parent: curr };
          curr.left = newNode;
          yield {
            type: 'link',
            parentId: curr.id,
            childId: nodeId,
            side: 'left',
            narration: `[Inserção RB] Nó vermelho ${val} conectado à esquerda de ${curr.value}.`,
            pseudoCodeLine: 8
          };
          break;
        }
        curr = curr.left;
      } else {
        if (!curr.right) {
          newNode = { id: nodeId, value: val, color: 'red', left: null, right: null, parent: curr };
          curr.right = newNode;
          yield {
            type: 'link',
            parentId: curr.id,
            childId: nodeId,
            side: 'right',
            narration: `[Inserção RB] Nó vermelho ${val} conectado à direita de ${curr.value}.`,
            pseudoCodeLine: 10
          };
          break;
        }
        curr = curr.right;
      }
    }

    // Verificação de conflito vermelho-vermelho
    if (newNode && newNode.parent && newNode.parent.color === 'red') {
      const parent = newNode.parent;
      const grandParent = parent.parent;

      yield {
        type: 'highlight',
        ids: [newNode.id, parent.id],
        narration: `[Violação RB] Dois nós vermelhos consecutivos detectados (${parent.value} e ${newNode.value})!`,
        pseudoCodeLine: 14
      };

      if (grandParent) {
        const uncle = grandParent.left === parent ? grandParent.right : grandParent.left;

        if (uncle && uncle.color === 'red') {
          // Caso 1: Tio é Vermelho -> Recoloração
          yield {
            type: 'highlight',
            ids: [parent.id, uncle.id],
            narration: `[Caso 1 - Tio Vermelho] Recoloração: Pai (${parent.value}) e Tio (${uncle.value}) tornam-se Pretos. Avô (${grandParent.value}) torna-se Vermelho.`,
            pseudoCodeLine: 16
          };

          parent.color = 'black';
          uncle.color = 'black';
          yield { type: 'set-node-meta', id: parent.id, color: 'black', narration: `Recolorindo pai ${parent.value} para Preto.` };
          yield { type: 'set-node-meta', id: uncle.id, color: 'black', narration: `Recolorindo tio ${uncle.value} para Preto.` };

          if (grandParent !== root) {
            grandParent.color = 'red';
            yield { type: 'set-node-meta', id: grandParent.id, color: 'red', narration: `Recolorindo avô ${grandParent.value} para Vermelho.` };
          }
        } else {
          // Caso 2: Tio é Preto -> Rotação e troca de cor
          yield {
            type: 'highlight',
            ids: [parent.id, grandParent.id],
            narration: `[Caso 2 - Tio Preto] Rebalanceamento estrutural via Rotação e Troca de Cores.`,
            pseudoCodeLine: 20
          };

          parent.color = 'black';
          grandParent.color = 'red';
          yield { type: 'set-node-meta', id: parent.id, color: 'black', narration: `Recolorindo nó ${parent.value} para Preto.` };
          yield { type: 'set-node-meta', id: grandParent.id, color: 'red', narration: `Recolorindo nó ${grandParent.value} para Vermelho.` };

          const isLeft = grandParent.left === parent;
          yield {
            type: 'rotate',
            pivotId: grandParent.id,
            direction: isLeft ? 'right' : 'left',
            narration: `[Rotação RB] Rotação para manter a altura preta constante.`,
            pseudoCodeLine: 22
          };
        }
      }
    }
  }

  yield {
    type: 'complete',
    ids: allIds,
    narration: 'Árvore Rubro-Negra balanceada com sucesso! Todas as propriedades e alturas pretas preservadas.',
    pseudoCodeLine: 26
  };
}
