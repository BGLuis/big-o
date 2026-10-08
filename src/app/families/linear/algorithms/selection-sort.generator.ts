import { LinearEvent } from '../../../engine/events';
import { LinearElement } from '../linear-state';

export function* generateSelectionSortEvents(
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
        pseudoCodeLine: 14
      };
    }
    return;
  }

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    yield {
      type: 'set-scope',
      from: i,
      to: n - 1,
      narration: `Definindo busca do menor elemento a partir do índice ${i} até ${n - 1}.`,
      pseudoCodeLine: 3
    };

    yield {
      type: 'highlight',
      ids: [elements[minIdx].id],
      narration: `Candidato a menor elemento inicial: ${elements[minIdx].value} no índice ${minIdx}.`,
      pseudoCodeLine: 4
    };

    for (let j = i + 1; j < n; j++) {
      const current = elements[j];
      const minElem = elements[minIdx];

      yield {
        type: 'compare',
        ids: [current.id, minElem.id],
        result: current.value < minElem.value ? -1 : current.value > minElem.value ? 1 : 0,
        narration: `Comparando ${current.value} (índice ${j}) com o menor atual ${minElem.value} (índice ${minIdx}).`,
        pseudoCodeLine: 6
      };

      if (current.value < minElem.value) {
        minIdx = j;
        yield {
          type: 'highlight',
          ids: [elements[minIdx].id],
          narration: `Novo menor elemento encontrado: ${elements[minIdx].value} no índice ${minIdx}.`,
          pseudoCodeLine: 7
        };
      }
    }

    if (minIdx !== i) {
      const elemI = elements[i];
      const minElem = elements[minIdx];

      yield {
        type: 'swap',
        ids: [elemI.id, minElem.id],
        narration: `Trocando ${elemI.value} (índice ${i}) com o menor elemento ${minElem.value} (índice ${minIdx}).`,
        pseudoCodeLine: 11
      };

      const temp = elements[i];
      elements[i] = elements[minIdx];
      elements[minIdx] = temp;
    }

    yield {
      type: 'complete',
      ids: [elements[i].id],
      narration: `Elemento ${elements[i].value} fixado em sua posição ordenada final no índice ${i}.`,
      pseudoCodeLine: 13
    };
  }

  // Mark all elements as completed
  yield {
    type: 'complete',
    ids: elements.map((e) => e.id),
    narration: 'Selection Sort finalizado: array totalmente ordenado.',
    pseudoCodeLine: 14
  };
}
