import { StackEvent } from '../../../engine/events';

export function* generateStackEvents(initialValues: readonly number[] = [20, 45, 78]): Generator<StackEvent> {
  // Clear or start with initial items
  yield {
    type: 'highlight',
    ids: [],
    narration: 'Pilha inicializada vazia (topo = -1).',
    pseudoCodeLine: 3
  };

  const v1 = initialValues[0] ?? 24;
  yield {
    type: 'stack-push',
    id: `stack-item-${v1}`,
    value: v1,
    narration: `Operação PUSH(${v1}): inserindo ${v1} no topo da pilha.`,
    pseudoCodeLine: 6
  };

  const v2 = initialValues[1] ?? 68;
  yield {
    type: 'stack-push',
    id: `stack-item-${v2}`,
    value: v2,
    narration: `Operação PUSH(${v2}): empilhando ${v2} acima de ${v1}. Topo aponta para ${v2}.`,
    pseudoCodeLine: 7
  };

  const v3 = initialValues[2] ?? 93;
  yield {
    type: 'stack-push',
    id: `stack-item-${v3}`,
    value: v3,
    narration: `Operação PUSH(${v3}): empilhando ${v3}. O topo agora é o índice 2.`,
    pseudoCodeLine: 7
  };

  // PEEK
  yield {
    type: 'stack-peek',
    id: `stack-item-${v3}`,
    narration: `Operação PEEK(): consultando o elemento do topo (${v3}) sem removê-lo.`,
    pseudoCodeLine: 19
  };

  // POP 1
  yield {
    type: 'stack-pop',
    id: `stack-item-${v3}`,
    narration: `Operação POP(): removendo o elemento do topo (${v3}) seguindo a regra LIFO.`,
    pseudoCodeLine: 13
  };

  // PUSH 4
  const v4 = 55;
  yield {
    type: 'stack-push',
    id: `stack-item-${v4}`,
    value: v4,
    narration: `Operação PUSH(${v4}): empilhando novo elemento ${v4} sobre ${v2}.`,
    pseudoCodeLine: 7
  };

  // POP 2
  yield {
    type: 'stack-pop',
    id: `stack-item-${v4}`,
    narration: `Operação POP(): removendo ${v4}. O novo topo passa a ser ${v2}.`,
    pseudoCodeLine: 13
  };

  // POP 3
  yield {
    type: 'stack-pop',
    id: `stack-item-${v2}`,
    narration: `Operação POP(): removendo ${v2}. O elemento restante é ${v1}.`,
    pseudoCodeLine: 13
  };

  yield {
    type: 'complete',
    ids: [`stack-item-${v1}`],
    narration: 'Ciclo didático de Pilha concluído com sucesso (LIFO demonstrado).',
    pseudoCodeLine: 22
  };
}
