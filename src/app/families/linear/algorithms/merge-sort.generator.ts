import { LinearEvent } from '../../../engine/events';
import { LinearElement } from '../linear-state';

export function* generateMergeSortEvents(
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
        pseudoCodeLine: 8
      };
    }
    return;
  }

  function* mergeSort(low: number, high: number): Generator<LinearEvent> {
    if (low >= high) return;

    const mid = Math.floor((low + high) / 2);

    yield {
      type: 'set-scope',
      from: low,
      to: high,
      narration: `Dividindo intervalo [${low}..${high}] no ponto médio ${mid}.`,
      pseudoCodeLine: 3
    };

    yield* mergeSort(low, mid);
    yield* mergeSort(mid + 1, high);
    yield* merge(low, mid, high);
  }

  function* merge(low: number, mid: number, high: number): Generator<LinearEvent> {
    const rangeSize = high - low + 1;

    yield {
      type: 'set-scope',
      from: low,
      to: high,
      narration: `Iniciando mesclagem das metades ordenadas [${low}..${mid}] e [${mid + 1}..${high}].`,
      pseudoCodeLine: 6
    };

    // Initialize auxiliary slots
    const auxSlots = Array.from({ length: rangeSize }, (_, idx) => ({
      id: `aux-merge-${low}-${idx}`,
      value: null as number | null,
      label: `${low + idx}`,
      state: 'normal' as const
    }));

    yield {
      type: 'set-aux',
      title: `Buffer Auxiliar de Mesclagem [${low}..${high}]`,
      elements: auxSlots,
      narration: `Alocando buffer auxiliar com ${rangeSize} posições para mesclar sublistas.`,
      pseudoCodeLine: 11
    };

    const auxBuffer: number[] = [];
    let i = low;
    let j = mid + 1;
    let k = 0;

    while (i <= mid && j <= high) {
      const leftElem = elements[i];
      const rightElem = elements[j];

      yield {
        type: 'compare',
        ids: [leftElem.id, rightElem.id],
        result: leftElem.value <= rightElem.value ? -1 : 1,
        narration: `Comparando ${leftElem.value} (metade esquerda, índice ${i}) com ${rightElem.value} (metade direita, índice ${j}).`,
        pseudoCodeLine: 13
      };

      if (leftElem.value <= rightElem.value) {
        auxBuffer.push(leftElem.value);
        yield {
          type: 'update-aux',
          index: k,
          value: leftElem.value,
          state: 'completed',
          narration: `Inserindo menor valor ${leftElem.value} no buffer auxiliar (posição ${k}).`,
          pseudoCodeLine: 14
        };
        i++;
      } else {
        auxBuffer.push(rightElem.value);
        yield {
          type: 'update-aux',
          index: k,
          value: rightElem.value,
          state: 'completed',
          narration: `Inserindo menor valor ${rightElem.value} no buffer auxiliar (posição ${k}).`,
          pseudoCodeLine: 16
        };
        j++;
      }
      k++;
    }

    while (i <= mid) {
      const leftElem = elements[i];
      auxBuffer.push(leftElem.value);
      yield {
        type: 'update-aux',
        index: k,
        value: leftElem.value,
        state: 'completed',
        narration: `Copiando elemento restante da esquerda (${leftElem.value}) para o buffer auxiliar.`,
        pseudoCodeLine: 19
      };
      i++;
      k++;
    }

    while (j <= high) {
      const rightElem = elements[j];
      auxBuffer.push(rightElem.value);
      yield {
        type: 'update-aux',
        index: k,
        value: rightElem.value,
        state: 'completed',
        narration: `Copiando elemento restante da direita (${rightElem.value}) para o buffer auxiliar.`,
        pseudoCodeLine: 19
      };
      j++;
      k++;
    }

    // Copy back into main array
    for (let idx = 0; idx < auxBuffer.length; idx++) {
      const targetPos = low + idx;
      const targetElem = elements[targetPos];
      const val = auxBuffer[idx];

      yield {
        type: 'assign',
        id: targetElem.id,
        value: val,
        narration: `Gravando valor ${val} do buffer de volta na posição ${targetPos} do array original.`,
        pseudoCodeLine: 19
      };

      elements[targetPos] = { ...targetElem, value: val };
    }

    yield {
      type: 'clear-aux',
      narration: `Mesclagem do intervalo [${low}..${high}] concluída.`,
      pseudoCodeLine: 19
    };
  }

  yield* mergeSort(0, n - 1);

  yield {
    type: 'complete',
    ids: elements.map((e) => e.id),
    narration: 'Merge Sort finalizado: array totalmente ordenado.',
    pseudoCodeLine: 8
  };
}
