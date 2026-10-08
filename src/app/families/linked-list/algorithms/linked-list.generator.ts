import { LinearEvent } from '../../../engine/events';

export function* generateLinkedListEvents(values: readonly number[]): Generator<LinearEvent> {
  if (values.length === 0) {
    return;
  }

  const allIds: string[] = [];

  // Demonstrate insertion at beginning (inserirNoInicio) for each value
  for (let i = 0; i < values.length; i++) {
    const val = values[i];
    const nodeId = `node-${val}-${i}`;
    allIds.unshift(nodeId);

    // 1. Create node
    yield {
      type: 'insert',
      id: nodeId,
      value: val,
      position: 0,
      narration: `Alocando novo nó na memória com o valor ${val}...`,
      pseudoCodeLine: 25
    };

    // 2. Link next to previous head
    yield {
      type: 'highlight',
      ids: [nodeId],
      narration: `Conectando ponteiro 'proximo' do nó ${val} ao início atual da lista.`,
      pseudoCodeLine: 26
    };

    // 3. Update head
    yield {
      type: 'visit',
      id: nodeId,
      narration: `Ponteiro CABEÇA atualizado com sucesso para o nó ${val}.`,
      pseudoCodeLine: 27
    };
  }

  // Demonstrate traversal / search for the last inserted element
  const targetId = allIds[Math.floor(allIds.length / 2)] || allIds[0];
  yield {
    type: 'highlight',
    ids: [allIds[0]],
    narration: 'Iniciando busca/percurso na lista a partir do nó CABEÇA...',
    pseudoCodeLine: 31
  };

  for (let i = 0; i < allIds.length; i++) {
    const currId = allIds[i];
    yield {
      type: 'visit',
      id: currId,
      narration: `Percorrendo lista: ponteiro atual no nó ${i + 1}.`,
      pseudoCodeLine: 32
    };

    if (currId === targetId) {
      yield {
        type: 'highlight',
        ids: [currId],
        narration: `Elemento correspondente encontrado no nó ${i + 1}!`,
        pseudoCodeLine: 33
      };
      break;
    }
  }

  yield {
    type: 'complete',
    ids: allIds,
    narration: 'Operações na Lista Encadeada concluídas com sucesso!',
    pseudoCodeLine: 37
  };
}
