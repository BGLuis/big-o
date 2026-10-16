import { HierarchicalEvent } from '../../../engine/events';
import {
  SandboxOperationInput,
  SandboxOperationResult,
  StepQuizPrompt,
  TreeKind,
  TreeTraversalOrder
} from '../../../features/sandbox/sandbox.types';
import { createInitialTreeState, TreeNode, TreeState, treeReducer } from '../tree-state';

/**
 * Calcula a altura da subárvore enraizada em `nodeId`.
 * Uma folha possui altura 1. Árvore vazia possui altura 0.
 */
export function computeSubtreeHeight(nodes: Readonly<Record<string, TreeNode>>, nodeId: string | null): number {
  if (!nodeId || !nodes[nodeId]) {
    return 0;
  }
  const node = nodes[nodeId];
  return 1 + Math.max(
    computeSubtreeHeight(nodes, node.leftId),
    computeSubtreeHeight(nodes, node.rightId)
  );
}

/**
 * Calcula o fator de balanceamento (BF = Altura Esq - Altura Dir).
 */
export function computeBalanceFactor(nodes: Readonly<Record<string, TreeNode>>, nodeId: string | null): number {
  if (!nodeId || !nodes[nodeId]) {
    return 0;
  }
  const node = nodes[nodeId];
  const leftH = computeSubtreeHeight(nodes, node.leftId);
  const rightH = computeSubtreeHeight(nodes, node.rightId);
  return leftH - rightH;
}

/**
 * Localiza o nó pai de um determinado nó filho.
 */
export function findParentNodeId(nodes: Readonly<Record<string, TreeNode>>, childId: string): string | null {
  for (const [id, node] of Object.entries(nodes)) {
    if (node.leftId === childId || node.rightId === childId) {
      return id;
    }
  }
  return null;
}

/**
 * Retorna o caminho de IDs de ancestrais (do pai imediato até a raiz).
 */
export function getAncestorPath(nodes: Readonly<Record<string, TreeNode>>, nodeId: string): string[] {
  const path: string[] = [];
  let curr = findParentNodeId(nodes, nodeId);
  while (curr) {
    path.push(curr);
    curr = findParentNodeId(nodes, curr);
  }
  return path;
}

/**
 * Recalcula a altura e o fator de balanceamento de todos os nós alcançáveis a partir da raiz.
 */
export function calculateHeightsAndBFs(state: TreeState): Record<string, { height: number; balanceFactor: number }> {
  const result: Record<string, { height: number; balanceFactor: number }> = {};

  function compute(nodeId: string | null): number {
    if (!nodeId || !state.nodes[nodeId]) return 0;
    const node = state.nodes[nodeId];
    const leftH = compute(node.leftId);
    const rightH = compute(node.rightId);
    const h = 1 + Math.max(leftH, rightH);
    const bf = leftH - rightH;
    result[nodeId] = { height: h, balanceFactor: bf };
    return h;
  }

  if (state.rootId) {
    compute(state.rootId);
  }

  return result;
}

/**
 * Gera um ID único e determinístico para novos nós.
 */
function generateNodeId(val: number, nodes: Readonly<Record<string, TreeNode>>): string {
  const baseId = `node-${val}`;
  if (!nodes[baseId]) {
    return baseId;
  }
  let counter = 1;
  while (nodes[`${baseId}-${counter}`]) {
    counter++;
  }
  return `${baseId}-${counter}`;
}

/**
 * Aplica sequencialmente cada evento ao TreeState e normaliza os estados visuais dos nós para 'default',
 * preservando atributos essenciais como height, balanceFactor e color.
 */
export function applyEventsToTreeState(
  initialState: TreeState,
  events: readonly HierarchicalEvent[]
): TreeState {
  let state = initialState;
  for (const event of events) {
    state = treeReducer(state, event);
  }

  const normalizedNodes: Record<string, TreeNode> = {};
  for (const [id, node] of Object.entries(state.nodes)) {
    normalizedNodes[id] = {
      ...node,
      state: 'default'
    };
  }

  return {
    ...state,
    nodes: normalizedNodes,
    activeNodeId: null,
    targetValue: null
  };
}

/**
 * Executa uma operação interativa incremental sobre o TreeState existente.
 */
export function executeTreeOperation(
  state: TreeState,
  input: SandboxOperationInput,
  treeKind: TreeKind
): SandboxOperationResult<TreeState, HierarchicalEvent> {
  const events: HierarchicalEvent[] = [];
  let workingState = state;
  let quizPrompt: StepQuizPrompt | undefined = undefined;
  let summary = '';

  function emit(event: HierarchicalEvent): void {
    events.push(event);
    workingState = treeReducer(workingState, event);
  }

  switch (input.type) {
    case 'insert': {
      if (input.value === undefined) {
        summary = 'Valor inválido para inserção.';
        break;
      }
      const val = input.value;
      const nodeId = generateNodeId(val, workingState.nodes);

      // Árvore vazia: insere na raiz
      if (!workingState.rootId) {
        emit({
          type: 'create-node',
          id: nodeId,
          value: val,
          narration: `[Inserção ${treeKind.toUpperCase()}] Alocando nó ${val} como raiz da árvore.`
        });

        if (treeKind === 'avl') {
          emit({
            type: 'set-node-meta',
            id: nodeId,
            height: 1,
            balanceFactor: 0,
            narration: `[AVL] Raiz inicializada com altura 1 e Fator de Balanceamento 0.`
          });
        } else if (treeKind === 'rb') {
          emit({
            type: 'set-node-meta',
            id: nodeId,
            color: 'black',
            narration: `[Rubro-Negra] Propriedade 1: A raiz da árvore deve ser sempre Preta.`
          });
        }

        emit({
          type: 'highlight',
          ids: [nodeId],
          narration: `Nó ${val} estabelecido como raiz com sucesso.`
        });

        summary = `Nó ${val} inserido como raiz da árvore ${treeKind.toUpperCase()}.`;
        break;
      }

      // Percurso de inserção BST
      let currId: string | null = workingState.rootId;
      const visitedPath: string[] = [];
      let duplicateFound = false;
      let parentId: string | null = null;
      let side: 'left' | 'right' = 'left';

      while (currId) {
        visitedPath.push(currId);
        const currNode: TreeNode | undefined = workingState.nodes[currId];
        if (!currNode) break;

        if (val === currNode.value) {
          emit({
            type: 'compare',
            ids: [currId, currId],
            result: 0,
            narration: `[Inserção] ${val} == ${currNode.value}: Chave duplicada encontrada.`
          });
          emit({
            type: 'highlight',
            ids: [currId],
            narration: `O valor ${val} já existe na árvore. Inserção ignorada para preservar unicidade.`
          });
          duplicateFound = true;
          summary = `O valor ${val} já existe na árvore e não foi duplicado.`;
          break;
        }

        if (val < currNode.value) {
          emit({
            type: 'compare',
            ids: [currId, currId],
            result: -1,
            narration: `[Inserção] ${val} < ${currNode.value}: navegando para a subárvore esquerda.`
          });
          if (!currNode.leftId) {
            parentId = currId;
            side = 'left';
            break;
          }
          currId = currNode.leftId;
        } else {
          emit({
            type: 'compare',
            ids: [currId, currId],
            result: 1,
            narration: `[Inserção] ${val} > ${currNode.value}: navegando para a subárvore direita.`
          });
          if (!currNode.rightId) {
            parentId = currId;
            side = 'right';
            break;
          }
          currId = currNode.rightId;
        }
      }

      if (duplicateFound || !parentId) {
        break;
      }

      // Criação do novo nó e conexão ao pai
      emit({
        type: 'create-node',
        id: nodeId,
        value: val,
        narration: `[Inserção] Criando nó com valor ${val}...`
      });

      emit({
        type: 'link',
        parentId,
        childId: nodeId,
        side,
        narration: `[Inserção] Conectando nó ${val} como filho ${side === 'left' ? 'esquerdo' : 'direito'} de ${workingState.nodes[parentId].value}.`
      });

      if (treeKind === 'avl') {
        emit({
          type: 'set-node-meta',
          id: nodeId,
          height: 1,
          balanceFactor: 0,
          narration: `Nó folha ${val} inicializado com altura 1 e BF = 0.`
        });

        // Atualização de baixo para cima no caminho percorrido
        let unbalancedPivotId: string | null = null;
        for (let i = visitedPath.length - 1; i >= 0; i--) {
          const ancestorId = visitedPath[i];
          const node = workingState.nodes[ancestorId];
          if (!node) continue;

          const leftH = computeSubtreeHeight(workingState.nodes, node.leftId);
          const rightH = computeSubtreeHeight(workingState.nodes, node.rightId);
          const h = 1 + Math.max(leftH, rightH);
          const bf = leftH - rightH;

          emit({
            type: 'set-node-meta',
            id: ancestorId,
            height: h,
            balanceFactor: bf,
            narration: `[AVL Metadados] Nó ${node.value}: Altura = ${h}, Fator de Balanceamento BF = ${bf}.`
          });

          if (Math.abs(bf) > 1 && !unbalancedPivotId) {
            unbalancedPivotId = ancestorId;

            // Determinar caso de rotação
            const isLeftHeavy = bf > 1;
            let caseType: 'LL' | 'RR' | 'LR' | 'RL';

            if (isLeftHeavy) {
              const leftChild = workingState.nodes[node.leftId!];
              const leftBf = computeBalanceFactor(workingState.nodes, leftChild.id);
              caseType = (val < leftChild.value || leftBf >= 0) ? 'LL' : 'LR';
            } else {
              const rightChild = workingState.nodes[node.rightId!];
              const rightBf = computeBalanceFactor(workingState.nodes, rightChild.id);
              caseType = (val > rightChild.value || rightBf <= 0) ? 'RR' : 'RL';
            }

            // Destaque do nó desbalanceado
            emit({
              type: 'highlight',
              ids: [node.id],
              narration: `[Desbalanceamento AVL] Nó ${node.value} possui BF = ${bf} (|BF| > 1). Caso identificado: ${caseType}.`
            });

            // Preparar quiz prompt antes da rotação
            const options = [
              'Simples à Direita (LL)',
              'Simples à Esquerda (RR)',
              'Dupla Esquerda-Direita (LR)',
              'Dupla Direita-Esquerda (RL)'
            ];

            const correctIndex = caseType === 'LL' ? 0 : caseType === 'RR' ? 1 : caseType === 'LR' ? 2 : 3;
            quizPrompt = {
              stepIndex: events.length,
              question: `O nó ${node.value} desbalanceou com Fator de Balanceamento ${bf} (|BF| > 1). Qual operação de rebalanceamento AVL deve ser realizada?`,
              options,
              correctIndex,
              explanation: `Com a inserção do elemento ${val}, a árvore formou o padrão ${caseType}. A correção requer ${options[correctIndex]}.`
            };

            // Executar rotação correspondente
            if (caseType === 'LL') {
              emit({
                type: 'rotate',
                pivotId: node.id,
                direction: 'right',
                narration: `[Rotação Simples à Direita] Filho esquerdo ${workingState.nodes[node.leftId!].value} sobe para a posição de ${node.value}.`
              });
            } else if (caseType === 'RR') {
              emit({
                type: 'rotate',
                pivotId: node.id,
                direction: 'left',
                narration: `[Rotação Simples à Esquerda] Filho direito ${workingState.nodes[node.rightId!].value} sobe para a posição de ${node.value}.`
              });
            } else if (caseType === 'LR') {
              const leftChildId = node.leftId!;
              emit({
                type: 'rotate',
                pivotId: leftChildId,
                direction: 'left',
                narration: `[Rotação Dupla LR - Passo 1] Rotação à esquerda no filho ${workingState.nodes[leftChildId].value}.`
              });
              emit({
                type: 'rotate',
                pivotId: node.id,
                direction: 'right',
                narration: `[Rotação Dupla LR - Passo 2] Rotação à direita no pai ${node.value}.`
              });
            } else {
              // RL
              const rightChildId = node.rightId!;
              emit({
                type: 'rotate',
                pivotId: rightChildId,
                direction: 'right',
                narration: `[Rotação Dupla RL - Passo 1] Rotação à direita no filho ${workingState.nodes[rightChildId].value}.`
              });
              emit({
                type: 'rotate',
                pivotId: node.id,
                direction: 'left',
                narration: `[Rotação Dupla RL - Passo 2] Rotação à esquerda no pai ${node.value}.`
              });
            }

            // Atualizar alturas e BFs de todos os nós após rotação
            const updatedMeta = calculateHeightsAndBFs(workingState);
            for (const [id, meta] of Object.entries(updatedMeta)) {
              emit({
                type: 'set-node-meta',
                id,
                height: meta.height,
                balanceFactor: meta.balanceFactor,
                narration: `Nó ${workingState.nodes[id].value}: Altura ${meta.height}, BF ${meta.balanceFactor}.`
              });
            }

            break; // Na inserção AVL, uma rotação (simples ou dupla) restaura o equilíbrio completo.
          }
        }
      } else if (treeKind === 'rb') {
        // Árvore Rubro-Negra: novo nó entra como vermelho
        emit({
          type: 'set-node-meta',
          id: nodeId,
          color: 'red',
          narration: `[Rubro-Negra] Todo novo nó é inicialmente colorido de Vermelho.`
        });

        // Verificar violação vermelho-vermelho
        let currRBId = nodeId;
        while (currRBId !== workingState.rootId) {
          const pId = findParentNodeId(workingState.nodes, currRBId);
          if (!pId) break;
          const pNode = workingState.nodes[pId];
          if (pNode.color !== 'red') break;

          const gpId = findParentNodeId(workingState.nodes, pId);
          if (!gpId) break;
          const gpNode = workingState.nodes[gpId];

          emit({
            type: 'highlight',
            ids: [currRBId, pId],
            narration: `[Violação Rubro-Negra] Dois nós vermelhos consecutivos detectados: ${workingState.nodes[currRBId].value} e ${pNode.value}!`
          });

          const isParentLeft = gpNode.leftId === pId;
          const uncleId = isParentLeft ? gpNode.rightId : gpNode.leftId;
          const uncleNode = uncleId ? workingState.nodes[uncleId] : null;

          if (uncleNode && uncleNode.color === 'red') {
            // Caso 1: Tio é Vermelho -> Recoloração
            emit({
              type: 'highlight',
              ids: [pId, uncleId!],
              narration: `[Caso 1 - Tio Vermelho] Recoloração: Pai (${pNode.value}) e Tio (${uncleNode.value}) tornam-se Pretos. Avô (${gpNode.value}) torna-se Vermelho.`
            });
            emit({ type: 'set-node-meta', id: pId, color: 'black', narration: `Recolorindo pai ${pNode.value} para Preto.` });
            emit({ type: 'set-node-meta', id: uncleId!, color: 'black', narration: `Recolorindo tio ${uncleNode.value} para Preto.` });

            if (gpId !== workingState.rootId) {
              emit({ type: 'set-node-meta', id: gpId, color: 'red', narration: `Recolorindo avô ${gpNode.value} para Vermelho.` });
            }
            currRBId = gpId;
          } else {
            // Caso 2: Tio é Preto ou Nulo -> Rotação e Troca de Cores
            if (isParentLeft) {
              if (currRBId === pNode.rightId) {
                emit({
                  type: 'rotate',
                  pivotId: pId,
                  direction: 'left',
                  narration: `[Alinhamento LR] Rotação à esquerda em ${pNode.value}.`
                });
                currRBId = pId;
              }
              const currentPId = findParentNodeId(workingState.nodes, currRBId)!;
              const currentGpId = findParentNodeId(workingState.nodes, currentPId)!;
              emit({ type: 'set-node-meta', id: currentPId, color: 'black', narration: `Pai recolorido para Preto.` });
              emit({ type: 'set-node-meta', id: currentGpId, color: 'red', narration: `Avô recolorido para Vermelho.` });
              emit({
                type: 'rotate',
                pivotId: currentGpId,
                direction: 'right',
                narration: `[Rebalanceamento RB] Rotação à direita no avô.`
              });
            } else {
              if (currRBId === pNode.leftId) {
                emit({
                  type: 'rotate',
                  pivotId: pId,
                  direction: 'right',
                  narration: `[Alinhamento RL] Rotação à direita em ${pNode.value}.`
                });
                currRBId = pId;
              }
              const currentPId = findParentNodeId(workingState.nodes, currRBId)!;
              const currentGpId = findParentNodeId(workingState.nodes, currentPId)!;
              emit({ type: 'set-node-meta', id: currentPId, color: 'black', narration: `Pai recolorido para Preto.` });
              emit({ type: 'set-node-meta', id: currentGpId, color: 'red', narration: `Avô recolorido para Vermelho.` });
              emit({
                type: 'rotate',
                pivotId: currentGpId,
                direction: 'left',
                narration: `[Rebalanceamento RB] Rotação à esquerda no avô.`
              });
            }
            break;
          }
        }

        // Raiz é sempre preta
        if (workingState.rootId && workingState.nodes[workingState.rootId]?.color !== 'black') {
          emit({
            type: 'set-node-meta',
            id: workingState.rootId,
            color: 'black',
            narration: `[Propriedade RB] Garantindo que a raiz permaneça Preta.`
          });
        }
      } else {
        // BST padrão: recalcula alturas e BFs informativos
        for (let i = visitedPath.length - 1; i >= 0; i--) {
          const ancestorId = visitedPath[i];
          const node = workingState.nodes[ancestorId];
          if (!node) continue;
          const h = computeSubtreeHeight(workingState.nodes, node.id);
          const bf = computeBalanceFactor(workingState.nodes, node.id);
          emit({
            type: 'set-node-meta',
            id: ancestorId,
            height: h,
            balanceFactor: bf,
            narration: `Nó ${node.value}: Altura ${h}, BF ${bf}.`
          });
        }
      }

      summary = `Nó ${val} inserido com sucesso na árvore ${treeKind.toUpperCase()}.`;
      break;
    }

    case 'search': {
      if (input.value === undefined) {
        summary = 'Valor inválido para busca.';
        break;
      }
      const searchVal = input.value;

      if (!workingState.rootId) {
        emit({
          type: 'highlight',
          ids: [],
          narration: `A árvore está vazia. O elemento ${searchVal} não foi encontrado.`
        });
        summary = `Árvore vazia. Elemento ${searchVal} não encontrado.`;
        break;
      }

      let currSearchId: string | null = workingState.rootId;
      let depth = 0;
      let comparisons = 0;
      let found = false;

      while (currSearchId) {
        const node: TreeNode | undefined = workingState.nodes[currSearchId];
        if (!node) break;
        comparisons++;

        if (searchVal === node.value) {
          emit({
            type: 'compare',
            ids: [currSearchId, currSearchId],
            result: 0,
            narration: `[Busca] ${searchVal} == ${node.value}: Elemento localizado!`
          });
          emit({
            type: 'set-node-meta',
            id: currSearchId,
            nodeState: 'matched',
            narration: `[Elemento Encontrado] Valor ${searchVal} localizado na profundidade ${depth} após ${comparisons} comparações.`
          });
          found = true;
          summary = `Elemento ${searchVal} encontrado na profundidade ${depth} (${comparisons} comparações).`;
          break;
        }

        if (searchVal < node.value) {
          emit({
            type: 'compare',
            ids: [currSearchId, currSearchId],
            result: -1,
            narration: `[Busca] ${searchVal} < ${node.value}: navegando para a esquerda (profundidade ${depth + 1}).`
          });
          currSearchId = node.leftId;
        } else {
          emit({
            type: 'compare',
            ids: [currSearchId, currSearchId],
            result: 1,
            narration: `[Busca] ${searchVal} > ${node.value}: navegando para a direita (profundidade ${depth + 1}).`
          });
          currSearchId = node.rightId;
        }
        depth++;
      }

      if (!found) {
        emit({
          type: 'highlight',
          ids: [],
          narration: `O elemento ${searchVal} não pertence à árvore após ${comparisons} comparações.`
        });
        summary = `Elemento ${searchVal} não encontrado na árvore após ${comparisons} comparações.`;
      }
      break;
    }

    case 'delete': {
      if (input.value === undefined) {
        summary = 'Valor inválido para exclusão.';
        break;
      }
      const deleteVal = input.value;

      if (!workingState.rootId) {
        emit({
          type: 'highlight',
          ids: [],
          narration: `Árvore vazia. Não há nós para remover.`
        });
        summary = `Árvore vazia. Não é possível excluir ${deleteVal}.`;
        break;
      }

      // 1. Localizar o nó alvo
      let currId: string | null = workingState.rootId;
      let targetNodeId: string | null = null;

      while (currId) {
        const node: TreeNode | undefined = workingState.nodes[currId];
        if (!node) break;

        if (deleteVal === node.value) {
          emit({
            type: 'compare',
            ids: [currId, currId],
            result: 0,
            narration: `[Remoção] Nó alvo com valor ${deleteVal} localizado.`
          });
          targetNodeId = currId;
          break;
        }

        if (deleteVal < node.value) {
          emit({
            type: 'compare',
            ids: [currId, currId],
            result: -1,
            narration: `[Remoção] ${deleteVal} < ${node.value}: descendo à esquerda...`
          });
          currId = node.leftId;
        } else {
          emit({
            type: 'compare',
            ids: [currId, currId],
            result: 1,
            narration: `[Remoção] ${deleteVal} > ${node.value}: descendo à direita...`
          });
          currId = node.rightId;
        }
      }

      if (!targetNodeId) {
        emit({
          type: 'highlight',
          ids: [],
          narration: `O elemento ${deleteVal} não foi encontrado na árvore para exclusão.`
        });
        summary = `Elemento ${deleteVal} não encontrado para exclusão.`;
        break;
      }

      const targetNode = workingState.nodes[targetNodeId];
      const targetParentId = findParentNodeId(workingState.nodes, targetNodeId);
      let physicallyRemovedParentId: string | null = null;

      // ==========================================
      // CASO 1: NÓ FOLHA (SEM FILHOS)
      // ==========================================
      if (!targetNode.leftId && !targetNode.rightId) {
        physicallyRemovedParentId = targetParentId;
        emit({
          type: 'set-node-meta',
          id: targetNode.id,
          nodeState: 'deleted',
          narration: `[Caso 1 - Folha] Nó ${targetNode.value} não possui filhos. Marcado para exclusão.`
        });
        emit({
          type: 'remove-node',
          id: targetNode.id,
          replacementId: null,
          narration: `[Caso 1] Nó folha ${targetNode.value} removido com sucesso em O(1).`
        });
        summary = `Nó folha ${targetNode.value} removido com sucesso.`;
      }
      // ==========================================
      // CASO 2: NÓ COM 1 FILHO
      // ==========================================
      else if (!targetNode.leftId || !targetNode.rightId) {
        physicallyRemovedParentId = targetParentId;
        const childId = targetNode.leftId ?? targetNode.rightId!;
        const childNode = workingState.nodes[childId];

        emit({
          type: 'set-node-meta',
          id: targetNode.id,
          nodeState: 'deleted',
          narration: `[Caso 2 - Um Filho] Nó ${targetNode.value} possui 1 filho (${childNode.value}). Marcado para exclusão.`
        });
        emit({
          type: 'remove-node',
          id: targetNode.id,
          replacementId: childId,
          narration: `[Caso 2] Nó ${targetNode.value} removido. Filho ${childNode.value} conectado diretamente no lugar.`
        });
        summary = `Nó ${targetNode.value} com 1 filho removido; filho ${childNode.value} promovido.`;
      }
      // ==========================================
      // CASO 3: NÓ COM 2 FILHOS (SUCESSOR EM-ORDEM)
      // ==========================================
      else {
        emit({
          type: 'highlight',
          ids: [targetNode.id],
          narration: `[Caso 3 - Dois Filhos] Nó ${targetNode.value} possui 2 filhos. Buscando sucessor em-ordem na subárvore direita...`
        });

        // Sucessor em-ordem: menor nó da subárvore direita
        let succId: string = targetNode.rightId;
        emit({
          type: 'visit',
          id: succId,
          narration: `Descendo para filho direito: nó ${workingState.nodes[succId].value}.`
        });

        while (workingState.nodes[succId].leftId) {
          succId = workingState.nodes[succId].leftId!;
          emit({
            type: 'visit',
            id: succId,
            narration: `Descendo à esquerda: candidato a sucessor é ${workingState.nodes[succId].value}.`
          });
        }

        const successorNode = workingState.nodes[succId];
        physicallyRemovedParentId = findParentNodeId(workingState.nodes, succId);

        emit({
          type: 'highlight',
          ids: [succId],
          narration: `Sucessor em-ordem localizado: nó ${successorNode.value}.`
        });

        // Quiz prompt para caso de 2 filhos
        const leftVal = workingState.nodes[targetNode.leftId]?.value ?? (targetNode.value - 1);
        const rightVal = workingState.nodes[targetNode.rightId]?.value ?? (targetNode.value + 1);

        const options = [
          `Nó ${successorNode.value} (Sucessor Em-Ordem: menor da subárvore direita)`,
          `Nó ${leftVal} (Maior da subárvore esquerda)`,
          `Nó ${rightVal} (Filho direito direto)`,
          `Nenhum nó (a subárvore inteira é removida)`
        ];

        quizPrompt = {
          stepIndex: events.length,
          question: `Ao excluir o nó ${targetNode.value} (que possui 2 filhos), qual nó assumirá seu valor na árvore?`,
          options,
          correctIndex: 0,
          explanation: `Na exclusão de nó com dois filhos em BST, substitui-se o valor pelo Sucessor Em-Ordem (menor nó da subárvore direita) para manter a propriedade de busca intacta.`
        };

        emit({
          type: 'update-node-value',
          id: targetNode.id,
          value: successorNode.value,
          narration: `[Substituição] Valor ${successorNode.value} copiado para a posição do nó original ${targetNode.value}.`
        });

        emit({
          type: 'remove-node',
          id: successorNode.id,
          replacementId: successorNode.rightId,
          narration: `[Remoção Sucessor] Nó sucessor original ${successorNode.value} removido.`
        });

        summary = `Nó ${targetNode.value} removido com sucesso e substituído pelo sucessor em-ordem ${successorNode.value}.`;
      }

      // Recalcular alturas e BFs de todos os nós remanescentes
      const initialMeta = calculateHeightsAndBFs(workingState);
      for (const [id, meta] of Object.entries(initialMeta)) {
        emit({
          type: 'set-node-meta',
          id,
          height: meta.height,
          balanceFactor: meta.balanceFactor,
          narration: `Atualizando metadados do nó ${workingState.nodes[id].value}: Altura ${meta.height}, BF ${meta.balanceFactor}.`
        });
      }

      // Rebalanceamento AVL pós-remoção (pode propagar rotações em cascata)
      if (treeKind === 'avl') {
        let unbalancedFound = true;
        while (unbalancedFound) {
          unbalancedFound = false;
          const currentMeta = calculateHeightsAndBFs(workingState);

          // Verificar de baixo para cima
          const nodeIdsSortedByHeight = Object.keys(currentMeta).sort(
            (a, b) => currentMeta[a].height - currentMeta[b].height
          );

          for (const nodeId of nodeIdsSortedByHeight) {
            const { balanceFactor } = currentMeta[nodeId];
            if (Math.abs(balanceFactor) > 1) {
              unbalancedFound = true;
              const pivot = workingState.nodes[nodeId];

              if (balanceFactor > 1) {
                const leftChild = workingState.nodes[pivot.leftId!];
                const leftMeta = calculateHeightsAndBFs(workingState);
                const bfLeft = leftMeta[leftChild.id]?.balanceFactor ?? 0;

                if (bfLeft >= 0) {
                  // LL
                  emit({
                    type: 'highlight',
                    ids: [pivot.id],
                    narration: `[Rebalanceamento AVL Pós-Deleção] Nó ${pivot.value} com BF = ${balanceFactor}. Aplicando Rotação Simples à Direita (LL).`
                  });
                  emit({
                    type: 'rotate',
                    pivotId: pivot.id,
                    direction: 'right',
                    narration: `Rotação à direita em ${pivot.value}.`
                  });
                } else {
                  // LR
                  emit({
                    type: 'highlight',
                    ids: [pivot.id, leftChild.id],
                    narration: `[Rebalanceamento AVL Pós-Deleção] Nó ${pivot.value} com BF = ${balanceFactor}. Aplicando Rotação Dupla LR.`
                  });
                  emit({
                    type: 'rotate',
                    pivotId: leftChild.id,
                    direction: 'left',
                    narration: `Passo 1: Rotação à esquerda no filho ${leftChild.value}.`
                  });
                  emit({
                    type: 'rotate',
                    pivotId: pivot.id,
                    direction: 'right',
                    narration: `Passo 2: Rotação à direita no pai ${pivot.value}.`
                  });
                }
              } else {
                // balanceFactor < -1
                const rightChild = workingState.nodes[pivot.rightId!];
                const rightMeta = calculateHeightsAndBFs(workingState);
                const bfRight = rightMeta[rightChild.id]?.balanceFactor ?? 0;

                if (bfRight <= 0) {
                  // RR
                  emit({
                    type: 'highlight',
                    ids: [pivot.id],
                    narration: `[Rebalanceamento AVL Pós-Deleção] Nó ${pivot.value} com BF = ${balanceFactor}. Aplicando Rotação Simples à Esquerda (RR).`
                  });
                  emit({
                    type: 'rotate',
                    pivotId: pivot.id,
                    direction: 'left',
                    narration: `Rotação à esquerda em ${pivot.value}.`
                  });
                } else {
                  // RL
                  emit({
                    type: 'highlight',
                    ids: [pivot.id, rightChild.id],
                    narration: `[Rebalanceamento AVL Pós-Deleção] Nó ${pivot.value} com BF = ${balanceFactor}. Aplicando Rotação Dupla RL.`
                  });
                  emit({
                    type: 'rotate',
                    pivotId: rightChild.id,
                    direction: 'right',
                    narration: `Passo 1: Rotação à direita no filho ${rightChild.value}.`
                  });
                  emit({
                    type: 'rotate',
                    pivotId: pivot.id,
                    direction: 'left',
                    narration: `Passo 2: Rotação à esquerda no pai ${pivot.value}.`
                  });
                }
              }

              // Recalcular alturas após cada rotação
              const postRotateMeta = calculateHeightsAndBFs(workingState);
              for (const [id, meta] of Object.entries(postRotateMeta)) {
                emit({
                  type: 'set-node-meta',
                  id,
                  height: meta.height,
                  balanceFactor: meta.balanceFactor,
                  narration: `Nó ${workingState.nodes[id].value}: Altura ${meta.height}, BF ${meta.balanceFactor}.`
                });
              }

              break; // Reinicia verificação
            }
          }
        }
      } else if (treeKind === 'rb') {
        // Garantir raiz preta
        if (workingState.rootId && workingState.nodes[workingState.rootId]?.color !== 'black') {
          emit({
            type: 'set-node-meta',
            id: workingState.rootId,
            color: 'black',
            narration: `[Propriedade RB] Garantindo que a raiz permaneça Preta após exclusão.`
          });
        }
      }
      break;
    }

    case 'rotate-left':
    case 'rotate-right': {
      const isLeft = input.type === 'rotate-left';
      const direction: 'left' | 'right' = isLeft ? 'left' : 'right';

      // Localizar o nó pivô
      let pivotId: string | null = null;
      if (input.targetNodeId && workingState.nodes[input.targetNodeId]) {
        pivotId = input.targetNodeId;
      } else if (input.value !== undefined) {
        const found = Object.values(workingState.nodes).find(n => n.value === input.value);
        if (found) pivotId = found.id;
      } else if (workingState.rootId) {
        pivotId = workingState.rootId;
      }

      if (!pivotId || !workingState.nodes[pivotId]) {
        emit({
          type: 'highlight',
          ids: [],
          narration: `Nenhum nó pivô encontrado para rotação ${direction}.`
        });
        summary = `Pivô não encontrado para rotação ${direction}.`;
        break;
      }

      const pivot = workingState.nodes[pivotId];

      if (isLeft && !pivot.rightId) {
        emit({
          type: 'highlight',
          ids: [pivot.id],
          narration: `Não é possível rotacionar à esquerda: nó ${pivot.value} não possui filho à direita.`
        });
        summary = `Rotação à esquerda impossível: nó ${pivot.value} não possui filho direito.`;
        break;
      }

      if (!isLeft && !pivot.leftId) {
        emit({
          type: 'highlight',
          ids: [pivot.id],
          narration: `Não é possível rotacionar à direita: nó ${pivot.value} não possui filho à esquerda.`
        });
        summary = `Rotação à direita impossível: nó ${pivot.value} não possui filho esquerdo.`;
        break;
      }

      emit({
        type: 'highlight',
        ids: [pivot.id],
        narration: `[Rotação Manual] Executando rotação à ${direction === 'left' ? 'esquerda' : 'direita'} em torno de ${pivot.value}...`
      });

      emit({
        type: 'rotate',
        pivotId: pivot.id,
        direction,
        narration: `Rotação ${direction} em torno de ${pivot.value} concluída.`
      });

      // Recalcular alturas e fatores de balanceamento
      const updatedMeta = calculateHeightsAndBFs(workingState);
      for (const [id, meta] of Object.entries(updatedMeta)) {
        emit({
          type: 'set-node-meta',
          id,
          height: meta.height,
          balanceFactor: meta.balanceFactor,
          narration: `Nó ${workingState.nodes[id].value}: Altura ${meta.height}, BF ${meta.balanceFactor}.`
        });
      }

      summary = `Rotação à ${direction === 'left' ? 'esquerda' : 'direita'} em torno de ${pivot.value} concluída.`;
      break;
    }

    case 'traverse': {
      const order: TreeTraversalOrder = input.traversalOrder ?? 'in-order';
      if (!workingState.rootId) {
        emit({
          type: 'highlight',
          ids: [],
          narration: `Árvore vazia. Nenhum nó para percorrer.`
        });
        summary = `Árvore vazia. Percurso ${order} vazio.`;
        break;
      }

      const traversalOutput: number[] = [];

      if (order === 'bfs') {
        const queue: string[] = [workingState.rootId];
        while (queue.length > 0) {
          const currentId = queue.shift()!;
          const node = workingState.nodes[currentId];
          if (!node) continue;

          traversalOutput.push(node.value);
          emit({
            type: 'visit',
            id: node.id,
            narration: `[BFS / Em Largura] Visitando nó ${node.value} por nível.`
          });
          emit({
            type: 'traversal-output',
            values: [...traversalOutput],
            narration: `Saída BFS atual: [${traversalOutput.join(', ')}]`
          });

          if (node.leftId) queue.push(node.leftId);
          if (node.rightId) queue.push(node.rightId);
        }
      } else if (order === 'in-order') {
        function inOrder(nodeId: string | null): void {
          if (!nodeId || !workingState.nodes[nodeId]) return;
          const node = workingState.nodes[nodeId];
          if (node.leftId) inOrder(node.leftId);

          traversalOutput.push(node.value);
          emit({
            type: 'visit',
            id: node.id,
            narration: `[Em-Ordem (In-Order)] Processando nó ${node.value}.`
          });
          emit({
            type: 'traversal-output',
            values: [...traversalOutput],
            narration: `Saída Em-Ordem: [${traversalOutput.join(', ')}]`
          });

          if (node.rightId) inOrder(node.rightId);
        }
        inOrder(workingState.rootId);
      } else if (order === 'pre-order') {
        function preOrder(nodeId: string | null): void {
          if (!nodeId || !workingState.nodes[nodeId]) return;
          const node = workingState.nodes[nodeId];

          traversalOutput.push(node.value);
          emit({
            type: 'visit',
            id: node.id,
            narration: `[Pré-Ordem (Pre-Order)] Raiz ${node.value} antes dos filhos.`
          });
          emit({
            type: 'traversal-output',
            values: [...traversalOutput],
            narration: `Saída Pré-Ordem: [${traversalOutput.join(', ')}]`
          });

          if (node.leftId) preOrder(node.leftId);
          if (node.rightId) preOrder(node.rightId);
        }
        preOrder(workingState.rootId);
      } else {
        // post-order
        function postOrder(nodeId: string | null): void {
          if (!nodeId || !workingState.nodes[nodeId]) return;
          const node = workingState.nodes[nodeId];

          if (node.leftId) postOrder(node.leftId);
          if (node.rightId) postOrder(node.rightId);

          traversalOutput.push(node.value);
          emit({
            type: 'visit',
            id: node.id,
            narration: `[Pós-Ordem (Post-Order)] Filhos concluídos: processando nó ${node.value}.`
          });
          emit({
            type: 'traversal-output',
            values: [...traversalOutput],
            narration: `Saída Pós-Ordem: [${traversalOutput.join(', ')}]`
          });
        }
        postOrder(workingState.rootId);
      }

      summary = `Percurso ${order} concluído: [${traversalOutput.join(', ')}].`;
      break;
    }

    default: {
      summary = `Operação ${input.type} não suportada para árvores.`;
      break;
    }
  }

  const finalState = applyEventsToTreeState(state, events);

  return {
    events,
    finalState,
    summary,
    quizPrompt
  };
}

/**
 * Executa em sequência a inserção de `values`, buscas de `searchTargets` e deleções de `deleteTargets`,
 * retornando a lista concatenada de HierarchicalEvents para comparação na Arena.
 */
export function generateTreeBatchComparisonEvents(
  values: readonly number[],
  treeKind: TreeKind,
  searchTargets?: readonly number[],
  deleteTargets?: readonly number[]
): readonly HierarchicalEvent[] {
  let state = createInitialTreeState();
  const allEvents: HierarchicalEvent[] = [];

  // Inserções
  for (const val of values) {
    const result = executeTreeOperation(state, { type: 'insert', value: val }, treeKind);
    allEvents.push(...result.events);
    state = result.finalState;
  }

  // Buscas
  if (searchTargets && searchTargets.length > 0) {
    for (const searchVal of searchTargets) {
      const result = executeTreeOperation(state, { type: 'search', value: searchVal }, treeKind);
      allEvents.push(...result.events);
      state = result.finalState;
    }
  }

  // Deleções
  if (deleteTargets && deleteTargets.length > 0) {
    for (const delVal of deleteTargets) {
      const result = executeTreeOperation(state, { type: 'delete', value: delVal }, treeKind);
      allEvents.push(...result.events);
      state = result.finalState;
    }
  }

  return allEvents;
}
