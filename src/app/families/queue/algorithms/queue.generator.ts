import { QueueEvent } from '../../../engine/events';

export function* generateQueueEvents(initialValues: readonly number[] = [15, 38, 72]): Generator<QueueEvent> {
  yield {
    type: 'highlight',
    ids: [],
    narration: 'Fila inicializada vazia (inicio = 0, fim = 0).',
    pseudoCodeLine: 3
  };

  const v1 = initialValues[0] ?? 15;
  yield {
    type: 'queue-enqueue',
    id: `queue-item-${v1}`,
    value: v1,
    narration: `Operação ENQUEUE(${v1}): ${v1} entra no fim da fila. É agora o primeiro da fila.`,
    pseudoCodeLine: 7
  };

  const v2 = initialValues[1] ?? 38;
  yield {
    type: 'queue-enqueue',
    id: `queue-item-${v2}`,
    value: v2,
    narration: `Operação ENQUEUE(${v2}): ${v2} entra atrás de ${v1}. Fim aponta para ${v2}.`,
    pseudoCodeLine: 8
  };

  const v3 = initialValues[2] ?? 72;
  yield {
    type: 'queue-enqueue',
    id: `queue-item-${v3}`,
    value: v3,
    narration: `Operação ENQUEUE(${v3}): ${v3} enfileirado na cauda. Ordem atual: [${v1}, ${v2}, ${v3}].`,
    pseudoCodeLine: 8
  };

  // PEEK
  yield {
    type: 'queue-peek',
    id: `queue-item-${v1}`,
    narration: `Operação PEEK(): consultando o elemento da frente (${v1}) sem removê-lo.`,
    pseudoCodeLine: 20
  };

  // DEQUEUE 1
  yield {
    type: 'queue-dequeue',
    id: `queue-item-${v1}`,
    narration: `Operação DEQUEUE(): removendo o primeiro elemento (${v1}) pela regra FIFO (First In, First Out).`,
    pseudoCodeLine: 14
  };

  // ENQUEUE 4
  const v4 = 94;
  yield {
    type: 'queue-enqueue',
    id: `queue-item-${v4}`,
    value: v4,
    narration: `Operação ENQUEUE(${v4}): ${v4} entra no fim da fila após ${v3}.`,
    pseudoCodeLine: 8
  };

  // DEQUEUE 2
  yield {
    type: 'queue-dequeue',
    id: `queue-item-${v2}`,
    narration: `Operação DEQUEUE(): removendo ${v2} (que era agora o mais antigo). O novo início é ${v3}.`,
    pseudoCodeLine: 14
  };

  // DEQUEUE 3
  yield {
    type: 'queue-dequeue',
    id: `queue-item-${v3}`,
    narration: `Operação DEQUEUE(): removendo ${v3}. O único elemento restante na fila é ${v4}.`,
    pseudoCodeLine: 14
  };

  yield {
    type: 'complete',
    ids: [`queue-item-${v4}`],
    narration: 'Ciclo didático de Fila concluído com sucesso (FIFO demonstrado).',
    pseudoCodeLine: 23
  };
}
