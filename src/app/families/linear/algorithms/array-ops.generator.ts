import { LinearEvent } from '../../../engine/events';
import { LinearElement } from '../linear-state';

export function* generateArrayOperationsEvents(
  initialElements: readonly LinearElement[]
): Generator<LinearEvent> {
  const elements = [...initialElements];
  const n = elements.length;

  if (n === 0) return;

  // Phase 1: Direct Indexed Access O(1)
  const targetIndex = Math.min(2, n - 1);
  const targetElem = elements[targetIndex];

  yield {
    type: 'set-scope',
    from: targetIndex,
    to: targetIndex,
    narration: `Demonstração 1: Acesso direto por índice A[${targetIndex}] em tempo constante O(1).`,
    pseudoCodeLine: 2
  };

  yield {
    type: 'highlight',
    ids: [targetElem.id],
    narration: `A CPU calcula o endereço de memória (base + ${targetIndex} * sizeof) e acessa ${targetElem.value} instantaneamente.`,
    pseudoCodeLine: 3
  };

  // Phase 2: Linear Search O(n)
  const searchIndex = Math.min(4, n - 1);
  const searchVal = elements[searchIndex].value;

  yield {
    type: 'set-scope',
    from: 0,
    to: n - 1,
    narration: `Demonstração 2: Busca Linear pelo valor ${searchVal} em tempo O(n).`,
    pseudoCodeLine: 7
  };

  for (let i = 0; i < n; i++) {
    const curr = elements[i];
    yield {
      type: 'visit',
      id: curr.id,
      narration: `Inspecionando A[${i}] = ${curr.value}...`,
      pseudoCodeLine: 9
    };

    if (curr.value === searchVal) {
      yield {
        type: 'highlight',
        ids: [curr.id],
        narration: `Elemento ${searchVal} encontrado no índice ${i}!`,
        pseudoCodeLine: 10
      };
      break;
    }
  }

  // Phase 3: Insertion with Shifting O(n)
  const insertIndex = 1;
  const insertValue = 99;

  yield {
    type: 'set-scope',
    from: insertIndex,
    to: n - 1,
    narration: `Demonstração 3: Inserção de valor ${insertValue} na posição ${insertIndex} requer deslocar (shift) elementos para a direita.`,
    pseudoCodeLine: 16
  };

  // We demonstrate the shift
  yield {
    type: 'insert',
    id: `inserted-elem-${insertValue}`,
    value: insertValue,
    position: insertIndex,
    narration: `Novo elemento ${insertValue} inserido no índice ${insertIndex}. Todos os itens seguintes foram deslocados.`,
    pseudoCodeLine: 20
  };

  yield {
    type: 'complete',
    ids: elements.map((e) => e.id).concat([`inserted-elem-${insertValue}`]),
    narration: 'Operações fundamentais em Array finalizadas: Acesso O(1), Busca O(n), Inserção O(n).',
    pseudoCodeLine: 21
  };
}
