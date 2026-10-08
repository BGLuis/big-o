import { LinearEvent } from '../../../engine/events';
import { LinearElement } from '../linear-state';

export function* generateCountingSortEvents(
  initialElements: readonly LinearElement[]
): Generator<LinearEvent> {
  const elements = [...initialElements];
  const n = elements.length;

  if (n <= 1) {
    if (n === 1) {
      yield {
        type: 'complete',
        ids: [elements[0].id],
        narration: `Array com único elemento ${elements[0].value} já está ordenado.`,
        pseudoCodeLine: 16
      };
    }
    return;
  }

  const maxVal = Math.max(...elements.map((e) => e.value), 0);
  const k = Math.min(maxVal, 25); // visual cap if needed

  // Create count slots
  const countSlots = Array.from({ length: k + 1 }, (_, idx) => ({
    id: `count-slot-${idx}`,
    value: 0,
    label: `${idx}`,
    state: 'normal' as const
  }));

  yield {
    type: 'set-aux',
    title: `Vetor de Frequências (k = ${k})`,
    elements: countSlots,
    narration: `Inicializando vetor de contagem de tamanho ${k + 1} com zeros.`,
    pseudoCodeLine: 3
  };

  const counts = new Array(k + 1).fill(0);

  // Phase 1: Counting
  yield {
    type: 'set-scope',
    from: 0,
    to: n - 1,
    narration: 'Fase 1: Varrendo o array para contabilizar as frequências de cada número.',
    pseudoCodeLine: 4
  };

  for (let i = 0; i < n; i++) {
    const elem = elements[i];
    const val = Math.min(elem.value, k);
    counts[val]++;

    yield {
      type: 'visit',
      id: elem.id,
      narration: `Lendo elemento ${elem.value} na posição ${i}.`,
      pseudoCodeLine: 5
    };

    yield {
      type: 'update-aux',
      index: val,
      value: counts[val],
      state: 'highlighted',
      narration: `Incrementando frequência do valor ${val}: agora temos ${counts[val]} ocorrência(s).`,
      pseudoCodeLine: 6
    };
  }

  // Phase 2: Reconstruction
  yield {
    type: 'set-scope',
    from: 0,
    to: n - 1,
    narration: 'Fase 2: Reconstruindo o array original na ordem correta usando as contagens.',
    pseudoCodeLine: 9
  };

  let writeIdx = 0;
  for (let val = 0; val <= k; val++) {
    if (counts[val] > 0) {
      yield {
        type: 'update-aux',
        index: val,
        value: counts[val],
        state: 'comparing',
        narration: `Transferindo ocorrências do valor ${val} para o array.`,
        pseudoCodeLine: 11
      };

      while (counts[val] > 0) {
        const targetElem = elements[writeIdx];

        yield {
          type: 'assign',
          id: targetElem.id,
          value: val,
          narration: `Posicionando valor ${val} no índice ${writeIdx}.`,
          pseudoCodeLine: 12
        };

        elements[writeIdx] = { ...targetElem, value: val };
        counts[val]--;

        yield {
          type: 'update-aux',
          index: val,
          value: counts[val],
          state: counts[val] === 0 ? 'completed' : 'comparing',
          narration: `Restam ${counts[val]} ocorrência(s) do valor ${val}.`,
          pseudoCodeLine: 13
        };

        writeIdx++;
      }
    }
  }

  yield {
    type: 'clear-aux',
    narration: 'Vetor de contagem liberado da memória.',
    pseudoCodeLine: 16
  };

  yield {
    type: 'complete',
    ids: elements.map((e) => e.id),
    narration: 'Counting Sort finalizado: array totalmente ordenado em O(n + k).',
    pseudoCodeLine: 16
  };
}
