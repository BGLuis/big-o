import { LinearEvent } from '../../../engine/events';
import { LinearElement } from '../linear-state';

export function* generateHeapSortEvents(
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
        pseudoCodeLine: 12
      };
    }
    return;
  }

  function* siftDown(heapSize: number, root: number): Generator<LinearEvent> {
    let curr = root;

    while (true) {
      let largest = curr;
      const left = 2 * curr + 1;
      const right = 2 * curr + 2;

      if (left < heapSize) {
        yield {
          type: 'compare',
          ids: [elements[left].id, elements[largest].id],
          result: elements[left].value > elements[largest].value ? 1 : -1,
          narration: `Verificando filho esquerdo ${elements[left].value} (índice ${left}) contra ${elements[largest].value} (índice ${largest}).`,
          pseudoCodeLine: 18
        };

        if (elements[left].value > elements[largest].value) {
          largest = left;
        }
      }

      if (right < heapSize) {
        yield {
          type: 'compare',
          ids: [elements[right].id, elements[largest].id],
          result: elements[right].value > elements[largest].value ? 1 : -1,
          narration: `Verificando filho direito ${elements[right].value} (índice ${right}) contra ${elements[largest].value} (índice ${largest}).`,
          pseudoCodeLine: 19
        };

        if (elements[right].value > elements[largest].value) {
          largest = right;
        }
      }

      if (largest !== curr) {
        const pElem = elements[curr];
        const childElem = elements[largest];

        yield {
          type: 'swap',
          ids: [pElem.id, childElem.id],
          narration: `Peneirando: trocando pai ${pElem.value} (índice ${curr}) com maior filho ${childElem.value} (índice ${largest}).`,
          pseudoCodeLine: 21
        };

        const temp = elements[curr];
        elements[curr] = elements[largest];
        elements[largest] = temp;

        curr = largest;
      } else {
        break;
      }
    }
  }

  // Phase 1: Build Max-Heap
  yield {
    type: 'set-scope',
    from: 0,
    to: n - 1,
    narration: 'Fase 1: Construindo a estrutura Max-Heap em todo o array.',
    pseudoCodeLine: 3
  };

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    yield {
      type: 'highlight',
      ids: [elements[i].id],
      narration: `Ajustando subárvore com raiz no índice ${i} (valor ${elements[i].value}).`,
      pseudoCodeLine: 5
    };
    yield* siftDown(n, i);
  }

  // Phase 2: Extract elements from heap
  yield {
    type: 'set-scope',
    from: 0,
    to: n - 1,
    narration: 'Fase 2: Max-Heap concluído. Extraindo a raiz para a posição final sucessivamente.',
    pseudoCodeLine: 8
  };

  for (let i = n - 1; i > 0; i--) {
    const maxRoot = elements[0];
    const targetEnd = elements[i];

    yield {
      type: 'swap',
      ids: [maxRoot.id, targetEnd.id],
      narration: `Extraindo maior elemento ${maxRoot.value} (raiz) para a posição ordenada ${i}.`,
      pseudoCodeLine: 9
    };

    const temp = elements[0];
    elements[0] = elements[i];
    elements[i] = temp;

    yield {
      type: 'complete',
      ids: [elements[i].id],
      narration: `Elemento ${elements[i].value} fixado definitivamente no índice ${i}.`,
      pseudoCodeLine: 9
    };

    yield {
      type: 'set-scope',
      from: 0,
      to: i - 1,
      narration: `Restaurando propriedade Max-Heap no intervalo restante [0..${i - 1}].`,
      pseudoCodeLine: 10
    };

    yield* siftDown(i, 0);
  }

  yield {
    type: 'complete',
    ids: elements.map((e) => e.id),
    narration: 'Heap Sort finalizado: array totalmente ordenado.',
    pseudoCodeLine: 12
  };
}
