import { LinearEvent } from '../../../engine/events';
import { LinearElement } from '../linear-state';

export function* generateInsertionSortEvents(
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

  // First element is trivially sorted in subarray [0]
  yield {
    type: 'set-scope',
    from: 0,
    to: 0,
    narration: `Elemento inicial ${elements[0].value} forma a sublista ordenada inicial de tamanho 1.`,
    pseudoCodeLine: 3
  };

  for (let i = 1; i < n; i++) {
    const key = elements[i];

    yield {
      type: 'set-scope',
      from: 0,
      to: i,
      narration: `Expandindo a janela de ordenação para incluir o índice ${i} (chave = ${key.value}).`,
      pseudoCodeLine: 3
    };

    yield {
      type: 'highlight',
      ids: [key.id],
      narration: `Selecionando ${key.value} como chave para inserção na sublista ordenada [0..${i - 1}].`,
      pseudoCodeLine: 4
    };

    let j = i - 1;

    while (j >= 0) {
      const current = elements[j];
      const next = elements[j + 1];

      yield {
        type: 'compare',
        ids: [current.id, next.id],
        result: current.value > next.value ? 1 : current.value < next.value ? -1 : 0,
        narration: `Comparando ${current.value} (índice ${j}) com a chave ${next.value} (índice ${j + 1}).`,
        pseudoCodeLine: 6
      };

      if (current.value > next.value) {
        yield {
          type: 'swap',
          ids: [current.id, next.id],
          narration: `${current.value} > ${next.value}: deslocando ${current.value} para a direita.`,
          pseudoCodeLine: 7
        };

        const temp = elements[j];
        elements[j] = elements[j + 1];
        elements[j + 1] = temp;
        j--;
      } else {
        break;
      }
    }

    yield {
      type: 'highlight',
      ids: [elements[j + 1].id],
      narration: `Chave ${elements[j + 1].value} posicionada com sucesso no índice ${j + 1}.`,
      pseudoCodeLine: 10
    };
  }

  yield {
    type: 'complete',
    ids: elements.map((e) => e.id),
    narration: 'Insertion Sort finalizado: todos os elementos estão ordenados.',
    pseudoCodeLine: 12
  };
}
