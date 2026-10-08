import { LinearEvent } from '../../../engine/events';
import { LinearElement } from '../linear-state';

export function* generateTimsortEvents(
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
        pseudoCodeLine: 18
      };
    }
    return;
  }

  const minRun = 4; // Didactic minRun size for 10-element sample arrays

  yield {
    type: 'set-scope',
    from: 0,
    to: n - 1,
    narration: `Timsort iniciado: utilizando minRun = ${minRun} para particionar o array em blocos.`,
    pseudoCodeLine: 2
  };

  // Phase 1: Sort individual runs of size minRun using Insertion Sort
  for (let i = 0; i < n; i += minRun) {
    const end = Math.min(i + minRun - 1, n - 1);

    yield {
      type: 'set-scope',
      from: i,
      to: end,
      narration: `Fase 1 (Timsort): Ordenando bloco (run) de índices [${i}..${end}] com Insertion Sort.`,
      pseudoCodeLine: 5
    };

    for (let j = i + 1; j <= end; j++) {
      let k = j - 1;
      const key = elements[j];

      yield {
        type: 'highlight',
        ids: [key.id],
        narration: `Inserindo chave ${key.value} na sublista ordenada do run atual.`,
        pseudoCodeLine: 5
      };

      while (k >= i) {
        const curr = elements[k];
        const next = elements[k + 1];

        yield {
          type: 'compare',
          ids: [curr.id, next.id],
          result: curr.value > next.value ? 1 : -1,
          narration: `Comparando ${curr.value} (índice ${k}) com ${next.value}.`,
          pseudoCodeLine: 5
        };

        if (curr.value > next.value) {
          yield {
            type: 'swap',
            ids: [curr.id, next.id],
            narration: `Trocando ${curr.value} com ${next.value}.`,
            pseudoCodeLine: 5
          };

          const temp = elements[k];
          elements[k] = elements[k + 1];
          elements[k + 1] = temp;
          k--;
        } else {
          break;
        }
      }
    }
  }

  // Phase 2: Merge runs progressively
  for (let size = minRun; size < n; size *= 2) {
    for (let left = 0; left < n; left += 2 * size) {
      const mid = Math.min(left + size - 1, n - 1);
      const right = Math.min(left + 2 * size - 1, n - 1);

      if (mid < right) {
        yield {
          type: 'set-scope',
          from: left,
          to: right,
          narration: `Fase 2 (Timsort): Mesclando runs ordenados [${left}..${mid}] e [${mid + 1}..${right}].`,
          pseudoCodeLine: 13
        };

        const rangeSize = right - left + 1;
        const auxSlots = Array.from({ length: rangeSize }, (_, idx) => ({
          id: `aux-timsort-${left}-${idx}`,
          value: null as number | null,
          label: `${left + idx}`,
          state: 'normal' as const
        }));

        yield {
          type: 'set-aux',
          title: `Buffer de Mesclagem Timsort [${left}..${right}]`,
          elements: auxSlots,
          narration: `Alocando buffer de mesclagem para combinar os runs.`,
          pseudoCodeLine: 13
        };

        const auxBuffer: number[] = [];
        let p1 = left;
        let p2 = mid + 1;
        let kAux = 0;

        while (p1 <= mid && p2 <= right) {
          const elem1 = elements[p1];
          const elem2 = elements[p2];

          yield {
            type: 'compare',
            ids: [elem1.id, elem2.id],
            result: elem1.value <= elem2.value ? -1 : 1,
            narration: `Comparando runs: ${elem1.value} com ${elem2.value}.`,
            pseudoCodeLine: 13
          };

          if (elem1.value <= elem2.value) {
            auxBuffer.push(elem1.value);
            yield {
              type: 'update-aux',
              index: kAux,
              value: elem1.value,
              state: 'completed',
              narration: `Adicionando ${elem1.value} ao buffer auxiliar do run.`,
              pseudoCodeLine: 13
            };
            p1++;
          } else {
            auxBuffer.push(elem2.value);
            yield {
              type: 'update-aux',
              index: kAux,
              value: elem2.value,
              state: 'completed',
              narration: `Adicionando ${elem2.value} ao buffer auxiliar do run.`,
              pseudoCodeLine: 13
            };
            p2++;
          }
          kAux++;
        }

        while (p1 <= mid) {
          const rem = elements[p1];
          auxBuffer.push(rem.value);
          yield {
            type: 'update-aux',
            index: kAux,
            value: rem.value,
            state: 'completed',
            narration: `Copiando elemento restante ${rem.value} do run esquerdo.`,
            pseudoCodeLine: 13
          };
          p1++;
          kAux++;
        }

        while (p2 <= right) {
          const rem = elements[p2];
          auxBuffer.push(rem.value);
          yield {
            type: 'update-aux',
            index: kAux,
            value: rem.value,
            state: 'completed',
            narration: `Copiando elemento restante ${rem.value} do run direito.`,
            pseudoCodeLine: 13
          };
          p2++;
          kAux++;
        }

        // Copy back to main array
        for (let idx = 0; idx < auxBuffer.length; idx++) {
          const targetPos = left + idx;
          const targetElem = elements[targetPos];
          const val = auxBuffer[idx];

          yield {
            type: 'assign',
            id: targetElem.id,
            value: val,
            narration: `Copiando ${val} do buffer de volta para a posição ${targetPos}.`,
            pseudoCodeLine: 13
          };

          elements[targetPos] = { ...targetElem, value: val };
        }

        yield {
          type: 'clear-aux',
          narration: `Fusão dos runs [${left}..${right}] concluída.`,
          pseudoCodeLine: 13
        };
      }
    }
  }

  yield {
    type: 'complete',
    ids: elements.map((e) => e.id),
    narration: 'Timsort finalizado: array totalmente ordenado.',
    pseudoCodeLine: 18
  };
}
