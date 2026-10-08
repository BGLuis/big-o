import { LinearEvent } from '../../../engine/events';
import { LinearElement } from '../linear-state';

export function* generateDualPivotQuickSortEvents(
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
        pseudoCodeLine: 19
      };
    }
    return;
  }

  function* dualPivotQuickSort(low: number, high: number): Generator<LinearEvent> {
    if (low < high) {
      yield {
        type: 'set-scope',
        from: low,
        to: high,
        narration: `Definindo escopo de ordenação de ${low} até ${high} com particionamento em 3 faixas.`,
        pseudoCodeLine: 2
      };

      if (elements[low].value > elements[high].value) {
        yield {
          type: 'compare',
          ids: [elements[low].id, elements[high].id],
          result: 1,
          narration: `Comparando extremidades: ${elements[low].value} > ${elements[high].value}. Trocando para garantir P1 <= P2.`,
          pseudoCodeLine: 3
        };

        yield {
          type: 'swap',
          ids: [elements[low].id, elements[high].id],
          narration: `Trocando elementos nos índices ${low} e ${high}.`,
          pseudoCodeLine: 3
        };

        const temp = elements[low];
        elements[low] = elements[high];
        elements[high] = temp;
      }

      const p1 = elements[low];
      const p2 = elements[high];

      yield {
        type: 'set-pivot',
        id: p1.id,
        secondaryId: p2.id,
        narration: `Pivôs definidos: P1 = ${p1.value} (índice ${low}) e P2 = ${p2.value} (índice ${high}).`,
        pseudoCodeLine: 4
      };

      let lt = low + 1;
      let gt = high - 1;
      let k = low + 1;

      while (k <= gt) {
        const current = elements[k];

        yield {
          type: 'compare',
          ids: [current.id, p1.id],
          result: current.value < p1.value ? -1 : current.value > p1.value ? 1 : 0,
          narration: `Comparando elemento ${current.value} (índice ${k}) com P1 (${p1.value}).`,
          pseudoCodeLine: 7
        };

        if (current.value < p1.value) {
          if (k !== lt) {
            const swapTarget = elements[lt];
            yield {
              type: 'swap',
              ids: [current.id, swapTarget.id],
              narration: `${current.value} < P1 (${p1.value}): movendo para a partição < P1 (troca com índice ${lt}).`,
              pseudoCodeLine: 8
            };
            const temp = elements[k];
            elements[k] = elements[lt];
            elements[lt] = temp;
          }
          lt++;
          k++;
        } else {
          yield {
            type: 'compare',
            ids: [elements[k].id, p2.id],
            result: elements[k].value > p2.value ? 1 : elements[k].value < p2.value ? -1 : 0,
            narration: `Comparando elemento ${elements[k].value} com P2 (${p2.value}).`,
            pseudoCodeLine: 9
          };

          if (elements[k].value > p2.value) {
            while (elements[gt].value > p2.value && k < gt) {
              gt--;
            }

            if (k !== gt) {
              const swapTarget = elements[gt];
              yield {
                type: 'swap',
                ids: [elements[k].id, swapTarget.id],
                narration: `${elements[k].value} > P2 (${p2.value}): movendo para a partição > P2 (troca com índice ${gt}).`,
                pseudoCodeLine: 11
              };
              const temp = elements[k];
              elements[k] = elements[gt];
              elements[gt] = temp;
            }
            gt--;

            if (elements[k].value < p1.value) {
              if (k !== lt) {
                const swapTarget = elements[lt];
                yield {
                  type: 'swap',
                  ids: [elements[k].id, swapTarget.id],
                  narration: `Elemento trocado ${elements[k].value} < P1 (${p1.value}): deslocando para partição inferior.`,
                  pseudoCodeLine: 12
                };
                const temp = elements[k];
                elements[k] = elements[lt];
                elements[lt] = temp;
              }
              lt++;
            }
            k++;
          } else {
            // Element is in the middle partition: P1 <= x <= P2
            k++;
          }
        }
      }

      lt--;
      gt++;

      // Place pivots into their final positions
      if (low !== lt) {
        yield {
          type: 'swap',
          ids: [elements[low].id, elements[lt].id],
          narration: `Posicionando P1 (${p1.value}) em seu índice definitivo ${lt}.`,
          pseudoCodeLine: 15
        };
        const temp = elements[low];
        elements[low] = elements[lt];
        elements[lt] = temp;
      }

      if (high !== gt) {
        yield {
          type: 'swap',
          ids: [elements[high].id, elements[gt].id],
          narration: `Posicionando P2 (${p2.value}) em seu índice definitivo ${gt}.`,
          pseudoCodeLine: 15
        };
        const temp = elements[high];
        elements[high] = elements[gt];
        elements[gt] = temp;
      }

      yield {
        type: 'set-pivot',
        id: null,
        secondaryId: null,
        narration: `Pivôs fixados: P1 na posição ${lt} e P2 na posição ${gt}.`,
        pseudoCodeLine: 15
      };

      yield {
        type: 'complete',
        ids: [elements[lt].id, elements[gt].id],
        narration: `Pivôs ${elements[lt].value} e ${elements[gt].value} ordenados definitivamente.`,
        pseudoCodeLine: 15
      };

      yield* dualPivotQuickSort(low, lt - 1);
      yield* dualPivotQuickSort(lt + 1, gt - 1);
      yield* dualPivotQuickSort(gt + 1, high);
    } else if (low === high) {
      yield {
        type: 'complete',
        ids: [elements[low].id],
        narration: `Elemento único no índice ${low} (${elements[low].value}) já ordenado.`,
        pseudoCodeLine: 19
      };
    }
  }

  yield* dualPivotQuickSort(0, n - 1);

  yield {
    type: 'complete',
    ids: elements.map((e) => e.id),
    narration: 'Dual-Pivot QuickSort finalizado: todos os elementos ordenados.',
    pseudoCodeLine: 19
  };
}
