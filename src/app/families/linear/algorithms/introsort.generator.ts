import { LinearEvent } from '../../../engine/events';
import { LinearElement } from '../linear-state';

export function* generateIntrosortEvents(
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
        pseudoCodeLine: 4
      };
    }
    return;
  }

  // Didactic depth limit: 2 to demonstrate transition to HeapSort on small arrays
  const maxDepth = 2;

  yield {
    type: 'set-scope',
    from: 0,
    to: n - 1,
    narration: `Introsort iniciado: combinando QuickSort, HeapSort (limite prof. = ${maxDepth}) e InsertionSort (tamanho < 4).`,
    pseudoCodeLine: 2
  };

  function* insertionSortSub(low: number, high: number): Generator<LinearEvent> {
    yield {
      type: 'set-scope',
      from: low,
      to: high,
      narration: `[Introsort -> InsertionSort] Partição [${low}..${high}] com tamanho pequeno.`,
      pseudoCodeLine: 8
    };

    for (let i = low + 1; i <= high; i++) {
      let j = i - 1;
      while (j >= low) {
        const curr = elements[j];
        const next = elements[j + 1];

        yield {
          type: 'compare',
          ids: [curr.id, next.id],
          result: curr.value > next.value ? 1 : -1,
          narration: `[InsertionSort] Comparando ${curr.value} com ${next.value}.`,
          pseudoCodeLine: 8
        };

        if (curr.value > next.value) {
          yield {
            type: 'swap',
            ids: [curr.id, next.id],
            narration: `[InsertionSort] Trocando ${curr.value} com ${next.value}.`,
            pseudoCodeLine: 8
          };
          const temp = elements[j];
          elements[j] = elements[j + 1];
          elements[j + 1] = temp;
          j--;
        } else {
          break;
        }
      }
    }
  }

  function* siftDownSub(heapSize: number, root: number, offset: number): Generator<LinearEvent> {
    let curr = root;

    while (true) {
      let largest = curr;
      const left = 2 * curr + 1;
      const right = 2 * curr + 2;

      if (left < heapSize) {
        const leftId = elements[offset + left].id;
        const largestId = elements[offset + largest].id;

        yield {
          type: 'compare',
          ids: [leftId, largestId],
          result: elements[offset + left].value > elements[offset + largest].value ? 1 : -1,
          narration: `[HeapSort] Comparando filho esquerdo ${elements[offset + left].value} com ${elements[offset + largest].value}.`,
          pseudoCodeLine: 10
        };

        if (elements[offset + left].value > elements[offset + largest].value) {
          largest = left;
        }
      }

      if (right < heapSize) {
        const rightId = elements[offset + right].id;
        const largestId = elements[offset + largest].id;

        yield {
          type: 'compare',
          ids: [rightId, largestId],
          result: elements[offset + right].value > elements[offset + largest].value ? 1 : -1,
          narration: `[HeapSort] Comparando filho direito ${elements[offset + right].value} com ${elements[offset + largest].value}.`,
          pseudoCodeLine: 10
        };

        if (elements[offset + right].value > elements[offset + largest].value) {
          largest = right;
        }
      }

      if (largest !== curr) {
        const idxA = offset + curr;
        const idxB = offset + largest;

        yield {
          type: 'swap',
          ids: [elements[idxA].id, elements[idxB].id],
          narration: `[HeapSort] Trocando raiz ${elements[idxA].value} com maior filho ${elements[idxB].value}.`,
          pseudoCodeLine: 10
        };

        const temp = elements[idxA];
        elements[idxA] = elements[idxB];
        elements[idxB] = temp;

        curr = largest;
      } else {
        break;
      }
    }
  }

  function* heapSortSub(low: number, high: number): Generator<LinearEvent> {
    const len = high - low + 1;

    yield {
      type: 'set-scope',
      from: low,
      to: high,
      narration: `[Introsort -> HeapSort] Limite de profundidade atingido! Alternando para HeapSort na partição [${low}..${high}].`,
      pseudoCodeLine: 10
    };

    // Build Max-Heap
    for (let i = Math.floor(len / 2) - 1; i >= 0; i--) {
      yield* siftDownSub(len, i, low);
    }

    // Extract elements
    for (let i = len - 1; i > 0; i--) {
      const idxRoot = low;
      const idxEnd = low + i;

      yield {
        type: 'swap',
        ids: [elements[idxRoot].id, elements[idxEnd].id],
        narration: `[HeapSort] Extraindo raiz ${elements[idxRoot].value} para a posição ${idxEnd}.`,
        pseudoCodeLine: 10
      };

      const temp = elements[idxRoot];
      elements[idxRoot] = elements[idxEnd];
      elements[idxEnd] = temp;

      yield* siftDownSub(i, 0, low);
    }
  }

  function* partition(low: number, high: number): Generator<LinearEvent, number> {
    const pivot = elements[high];

    yield {
      type: 'set-pivot',
      id: pivot.id,
      narration: `[QuickSort] Selecionando pivô ${pivot.value} no índice ${high}.`,
      pseudoCodeLine: 12
    };

    let i = low - 1;
    for (let j = low; j < high; j++) {
      const curr = elements[j];

      yield {
        type: 'compare',
        ids: [curr.id, pivot.id],
        result: curr.value <= pivot.value ? -1 : 1,
        narration: `[QuickSort] Comparando ${curr.value} com o pivô ${pivot.value}.`,
        pseudoCodeLine: 12
      };

      if (curr.value <= pivot.value) {
        i++;
        if (i !== j) {
          const swapTarget = elements[i];
          yield {
            type: 'swap',
            ids: [swapTarget.id, curr.id],
            narration: `[QuickSort] Movendo ${curr.value} para a esquerda (troca com ${swapTarget.value}).`,
            pseudoCodeLine: 12
          };
          const temp = elements[i];
          elements[i] = elements[j];
          elements[j] = temp;
        }
      }
    }

    const pPos = i + 1;
    if (pPos !== high) {
      const target = elements[pPos];
      yield {
        type: 'swap',
        ids: [target.id, pivot.id],
        narration: `[QuickSort] Posicionando pivô ${pivot.value} no índice ${pPos}.`,
        pseudoCodeLine: 12
      };
      const temp = elements[pPos];
      elements[pPos] = elements[high];
      elements[high] = temp;
    }

    yield {
      type: 'set-pivot',
      id: null,
      narration: `Pivô ${pivot.value} posicionado com sucesso.`,
      pseudoCodeLine: 12
    };

    return pPos;
  }

  function* introSortLoop(low: number, high: number, depth: number): Generator<LinearEvent> {
    if (low >= high) return;

    const size = high - low + 1;

    if (size < 4) {
      yield* insertionSortSub(low, high);
    } else if (depth <= 0) {
      yield* heapSortSub(low, high);
    } else {
      yield {
        type: 'set-scope',
        from: low,
        to: high,
        narration: `[Introsort -> QuickSort] Particionando intervalo [${low}..${high}] (profundidade restante = ${depth}).`,
        pseudoCodeLine: 12
      };

      const p: number = yield* partition(low, high);
      yield* introSortLoop(low, p - 1, depth - 1);
      yield* introSortLoop(p + 1, high, depth - 1);
    }
  }

  yield* introSortLoop(0, n - 1, maxDepth);

  yield {
    type: 'complete',
    ids: elements.map((e) => e.id),
    narration: 'Introsort finalizado: array totalmente ordenado.',
    pseudoCodeLine: 4
  };
}
