import { LinearEvent } from '../../../engine/events';
import { LinearElement } from '../linear-state';

export function* generateQuickSortEvents(initialElements: readonly LinearElement[]): Generator<LinearEvent> {
  const elements = [...initialElements];
  const n = elements.length;

  if (n <= 1) {
    if (n === 1) {
      yield {
        type: 'complete',
        ids: [elements[0].id],
        narration: `Array com único elemento ${elements[0].value} já está ordenado.`,
        pseudoCodeLine: 2
      };
    }
    return;
  }

  function* quickSort(low: number, high: number): Generator<LinearEvent> {
    if (low < high) {
      yield {
        type: 'set-scope',
        from: low,
        to: high,
        narration: `Definindo escopo de ordenação do índice ${low} até ${high}.`,
        pseudoCodeLine: 2
      };

      const pivotIndex: number = yield* partition(low, high);

      yield* quickSort(low, pivotIndex - 1);
      yield* quickSort(pivotIndex + 1, high);
    } else if (low === high) {
      yield {
        type: 'complete',
        ids: [elements[low].id],
        narration: `Elemento ${elements[low].value} no índice ${low} já se encontra em sua posição final.`,
        pseudoCodeLine: 6
      };
    }
  }

  function* partition(low: number, high: number): Generator<LinearEvent, number> {
    const pivot = elements[high];

    yield {
      type: 'set-pivot',
      id: pivot.id,
      narration: `Selecionando o elemento ${pivot.value} no índice ${high} como pivô.`,
      pseudoCodeLine: 10
    };

    let i = low - 1;

    for (let j = low; j < high; j++) {
      const current = elements[j];
      const currentPointers = [
        ...(i >= 0 ? [{ label: 'i', index: i, color: 'var(--o-lt)' }] : []),
        { label: 'j', index: j, color: 'var(--coral-lt)' }
      ];

      yield {
        type: 'compare',
        ids: [current.id, pivot.id],
        result: current.value <= pivot.value ? -1 : 1,
        narration: `Comparando A[${j}] = ${current.value} com o pivô ${pivot.value}.`,
        pseudoCodeLine: 13,
        pointers: currentPointers
      };

      if (current.value <= pivot.value) {
        i++;
        const pointersAfter = [
          { label: 'i', index: i, color: 'var(--o-lt)' },
          { label: 'j', index: j, color: 'var(--coral-lt)' }
        ];

        if (i !== j) {
          const swapTarget = elements[i];
          yield {
            type: 'swap',
            ids: [swapTarget.id, current.id],
            narration: `A[${j}] = ${current.value} é ≤ ao pivô ${pivot.value} — incrementa i para ${i} e troca A[i] com A[j].`,
            pseudoCodeLine: 15,
            pointers: pointersAfter
          };

          // Apply swap locally to track array state
          const temp = elements[i];
          elements[i] = elements[j];
          elements[j] = temp;
        }
      }
    }

    const finalPivotPos = i + 1;
    if (finalPivotPos !== high) {
      const target = elements[finalPivotPos];
      yield {
        type: 'swap',
        ids: [target.id, pivot.id],
        narration: `Colocando o pivô ${pivot.value} em sua posição final (índice ${finalPivotPos}), trocando com ${target.value}.`,
        pseudoCodeLine: 18
      };

      const temp = elements[finalPivotPos];
      elements[finalPivotPos] = elements[high];
      elements[high] = temp;
    }

    yield {
      type: 'set-pivot',
      id: null,
      narration: `Pivô ${pivot.value} fixado com sucesso no índice ${finalPivotPos}.`,
      pseudoCodeLine: 19
    };

    yield {
      type: 'complete',
      ids: [pivot.id],
      narration: `Elemento ${pivot.value} agora está em sua posição ordenada definitiva.`,
      pseudoCodeLine: 19
    };

    return finalPivotPos;
  }

  yield* quickSort(0, n - 1);

  // Mark all elements as completed at the end
  yield {
    type: 'complete',
    ids: elements.map((e) => e.id),
    narration: 'Quick Sort finalizado: todos os elementos estão ordenados.',
    pseudoCodeLine: 7
  };
}
