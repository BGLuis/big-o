import { LinearEvent } from '../../../engine/events';
import { LinearElement } from '../linear-state';

export function* generateBubbleSortEvents(initialElements: readonly LinearElement[]): Generator<LinearEvent> {
  const elements = [...initialElements];
  let n = elements.length;

  if (n <= 1) {
    if (n === 1) {
      yield {
        type: 'complete',
        ids: [elements[0].id],
        narration: `Array com elemento único ${elements[0].value} já está ordenado.`,
        pseudoCodeLine: 13
      };
    }
    return;
  }

  let swapped: boolean;

  do {
    swapped = false;
    yield {
      type: 'set-scope',
      from: 0,
      to: n - 1,
      narration: `Iniciando varredura linear de 0 até ${n - 1}.`,
      pseudoCodeLine: 5
    };

    for (let i = 1; i < n; i++) {
      const prev = elements[i - 1];
      const curr = elements[i];

      yield {
        type: 'compare',
        ids: [prev.id, curr.id],
        result: prev.value > curr.value ? 1 : prev.value < curr.value ? -1 : 0,
        narration: `Comparando ${prev.value} (índice ${i - 1}) com ${curr.value} (índice ${i}).`,
        pseudoCodeLine: 6
      };

      if (prev.value > curr.value) {
        yield {
          type: 'swap',
          ids: [prev.id, curr.id],
          narration: `${prev.value} > ${curr.value}: trocando posições.`,
          pseudoCodeLine: 7
        };

        const temp = elements[i - 1];
        elements[i - 1] = elements[i];
        elements[i] = temp;
        swapped = true;
      }
    }

    // The largest element has bubbled to position n - 1
    const bubbled = elements[n - 1];
    yield {
      type: 'complete',
      ids: [bubbled.id],
      narration: `Elemento ${bubbled.value} atingiu sua posição final no índice ${n - 1}.`,
      pseudoCodeLine: 11
    };

    n--;
  } while (swapped && n > 1);

  // Mark all remaining elements as complete
  yield {
    type: 'complete',
    ids: elements.map((e) => e.id),
    narration: 'Bubble Sort finalizado: array totalmente ordenado.',
    pseudoCodeLine: 13
  };
}
