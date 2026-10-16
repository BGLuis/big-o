import {
  GraphEvent,
  HashMapEvent,
  LinearEvent,
  QueueEvent,
  StackEvent
} from '../../engine/events';
import {
  SandboxOperationInput,
  SandboxOperationResult,
  StepQuizPrompt
} from '../../features/sandbox/sandbox.types';
import { GraphState, graphReducer } from '../graph/graph-state';
import { HashMapState, hashMapReducer } from '../hash-map/hash-map-state';
import { LinkedListNode, LinkedListState, linkedListReducer } from '../linked-list/linked-list-state';
import { QueueState, queueReducer } from '../queue/queue-state';
import { StackState, stackReducer } from '../stack/stack-state';

// ============================================================================
// 1. LINKED LIST OPERATIONS
// ============================================================================
export function executeLinkedListSandboxOp(
  state: LinkedListState,
  input: SandboxOperationInput
): SandboxOperationResult<LinkedListState, LinearEvent> {
  const events: LinearEvent[] = [];
  let summary = '';
  let quizPrompt: StepQuizPrompt | undefined;

  switch (input.type) {
    case 'insert-head': {
      const val = input.value ?? 42;
      const newId = `node-${val}-${Date.now()}`;

      events.push({
        type: 'insert',
        id: newId,
        value: val,
        position: 0,
        narration: `Alocando nó ${val} e apontando seu ponteiro "próximo" para a CABEÇA atual. Operação direta O(1).`
      });

      events.push({
        type: 'highlight',
        ids: [newId],
        narration: `Ponteiro CABEÇA atualizado para o novo nó ${val} em tempo constante O(1).`
      });

      events.push({
        type: 'complete',
        ids: [newId, ...state.order],
        narration: `Lista Encadeada atualizada: tamanho ${state.order.length + 1}.`
      });

      summary = `Inserção na cabeça (prepend) concluída para o valor ${val}. Complexidade: O(1).`;

      quizPrompt = {
        stepIndex: 1,
        question: 'Por que a inserção na CABEÇA de uma Lista Encadeada é O(1) enquanto no Array é O(n)?',
        options: [
          'Porque a lista encadeada usa índices numéricos otimizados',
          'Porque basta atualizar um único ponteiro na memória sem deslocar os nós existentes',
          'Porque a memória da lista é totalmente contígua',
          'Porque o hardware da CPU possui instrução nativa para listas encadeadas'
        ],
        correctIndex: 1,
        explanation: 'Diferente dos arrays contíguos que exigem shift em bloco, na lista basta alocar o novo nó e redirecionar o ponteiro inicial.'
      };
      break;
    }

    case 'insert-tail': {
      const val = input.value ?? 42;
      const newId = `node-${val}-${Date.now()}`;
      const targetPos = state.order.length;

      if (state.order.length === 0) {
        events.push({
          type: 'insert',
          id: newId,
          value: val,
          position: 0,
          narration: `Lista vazia: nó ${val} inserido como único elemento e nova CABEÇA O(1).`
        });
      } else {
        // Percorre a lista até a cauda
        for (let i = 0; i < state.order.length; i++) {
          const currId = state.order[i];
          const currNode = state.nodes[currId];
          events.push({
            type: 'visit',
            id: currId,
            narration: `Percorrendo lista até a cauda: nó atual ${currNode?.value ?? currId} (índice ${i}).`
          });
        }

        events.push({
          type: 'insert',
          id: newId,
          value: val,
          position: targetPos,
          narration: `Nó ${val} anexado ao final da lista (cauda). Exigiu percurso de todos os nós O(n).`
        });
      }

      events.push({
        type: 'highlight',
        ids: [newId],
        narration: `Novo nó ${val} fixado na cauda com sucesso.`
      });

      events.push({
        type: 'complete',
        ids: [...state.order, newId],
        narration: 'Operação de cauda finalizada.'
      });

      summary = `Inserção na cauda (append) concluída para o valor ${val}. Complexidade: O(n) sem ponteiro de cauda dedicado.`;
      break;
    }

    case 'insert':
    case 'insert-at': {
      const val = input.value ?? 42;
      let targetPos = 0;
      if (typeof input.secondaryValue === 'number') {
        targetPos = Math.max(0, Math.min(input.secondaryValue, state.order.length));
      } else if (input.type === 'insert') {
        // Padrão de insert geral: na cauda se não especificado
        targetPos = state.order.length;
      }

      const newId = `node-${val}-${Date.now()}`;

      if (targetPos === 0) {
        events.push({
          type: 'insert',
          id: newId,
          value: val,
          position: 0,
          narration: `Inserindo nó ${val} na posição 0 (CABEÇA). Operação O(1).`
        });
      } else {
        // Percorrer até targetPos - 1
        for (let i = 0; i < targetPos; i++) {
          const currId = state.order[i];
          const currNode = state.nodes[currId];
          events.push({
            type: 'visit',
            id: currId,
            narration: `Avançando ponteiro pela lista: nó ${currNode?.value ?? currId} (índice ${i}).`
          });
        }

        events.push({
          type: 'insert',
          id: newId,
          value: val,
          position: targetPos,
          narration: `Inserindo nó ${val} na posição ${targetPos}. Religando ponteiro do predecessor em tempo O(1) após percurso O(k).`
        });
      }

      events.push({
        type: 'highlight',
        ids: [newId],
        narration: `Nó ${val} inserido com sucesso na posição ${targetPos}.`
      });

      events.push({
        type: 'complete',
        ids: [...state.order.slice(0, targetPos), newId, ...state.order.slice(targetPos)],
        narration: 'Lista Encadeada reorganizada.'
      });

      summary = `Inserção do valor ${val} na posição ${targetPos} concluída. Complexidade: ${targetPos === 0 ? 'O(1)' : 'O(k) onde k é o índice'}.`;
      break;
    }

    case 'delete':
    case 'remove-at': {
      let targetId: string | null = null;
      let targetIdx = -1;

      if (input.type === 'remove-at' || typeof input.secondaryValue === 'number') {
        const rawIdx = typeof input.secondaryValue === 'number' ? input.secondaryValue : input.value ?? 0;
        if (rawIdx >= 0 && rawIdx < state.order.length) {
          targetIdx = rawIdx;
          targetId = state.order[rawIdx];
        }
      } else if (input.value !== undefined) {
        // Percorre procurando pelo valor
        for (let i = 0; i < state.order.length; i++) {
          const currId = state.order[i];
          const currNode = state.nodes[currId];
          events.push({
            type: 'visit',
            id: currId,
            narration: `Buscando valor ${input.value}: inspecionando nó ${currNode?.value}...`
          });

          if (currNode && currNode.value === input.value) {
            targetId = currId;
            targetIdx = i;
            break;
          }
        }
      }

      if (!targetId || targetIdx === -1) {
        events.push({
          type: 'complete',
          ids: [],
          narration: `Nó com valor ${input.value ?? ''} não encontrado na lista para remoção.`
        });
        summary = 'Remoção não realizada: nó não localizado.';
      } else {
        const targetNode = state.nodes[targetId];
        events.push({
          type: 'highlight',
          ids: [targetId],
          narration: `Nó ${targetNode?.value ?? targetId} localizado na posição ${targetIdx}.`
        });

        events.push({
          type: 'remove',
          id: targetId,
          narration: `Removendo nó ${targetNode?.value}. Ponteiro do nó anterior conectado diretamente ao nó sucessor.`
        });

        events.push({
          type: 'complete',
          ids: state.order.filter((id) => id !== targetId),
          narration: `Remoção finalizada. Nova contagem de nós: ${state.order.length - 1}.`
        });

        summary = `Nó ${targetNode?.value} removido da posição ${targetIdx}. Complexidade: ${targetIdx === 0 ? 'O(1) na cabeça' : 'O(n) para localização'}.`;
      }
      break;
    }

    case 'search': {
      const targetVal = input.value ?? 0;
      let foundId: string | null = null;
      let steps = 0;

      for (let i = 0; i < state.order.length; i++) {
        steps++;
        const currId = state.order[i];
        const currNode = state.nodes[currId];

        events.push({
          type: 'visit',
          id: currId,
          narration: `Passo ${steps}: comparando nó ${currNode?.value} com alvo ${targetVal}...`
        });

        if (currNode && currNode.value === targetVal) {
          foundId = currId;
          events.push({
            type: 'highlight',
            ids: [currId],
            narration: `Alvo ${targetVal} encontrado no nó ${i + 1} após ${steps} saltos de ponteiro!`
          });
          break;
        }
      }

      if (!foundId) {
        events.push({
          type: 'complete',
          ids: [],
          narration: `Busca finalizada: valor ${targetVal} não encontrado após percorrer todos os ${state.order.length} nós (pior caso O(n)).`
        });
        summary = `Busca na lista encadeada: valor ${targetVal} ausente após ${steps} passos O(n).`;
      } else {
        events.push({
          type: 'complete',
          ids: [foundId],
          narration: `Busca concluída com sucesso.`
        });
        summary = `Busca na lista encadeada: valor ${targetVal} encontrado em ${steps} passos. Complexidade O(n).`;
      }

      quizPrompt = {
        stepIndex: Math.min(events.length - 1, 2),
        question: 'É possível realizar Busca Binária O(log n) em uma Lista Encadeada Simples tradicional?',
        options: [
          'Sim, basta calcular o índice do meio normalmente',
          'Não, pois listas encadeadas não possuem acesso indexado direto O(1), exigindo percurso sequencial',
          'Sim, usando ponteiros duplos recursivos',
          'Não, apenas se todos os nós forem positivos'
        ],
        correctIndex: 1,
        explanation: 'Sem indexação contígua em memória, encontrar o elemento mediano leva O(n), anulando o benefício da busca binária tradicional.'
      };
      break;
    }

    case 'clear': {
      for (const id of state.order) {
        events.push({
          type: 'remove',
          id,
          narration: `Desalocando nó ${id}...`
        });
      }
      events.push({
        type: 'complete',
        ids: [],
        narration: 'Lista Encadeada esvaziada por completo.'
      });
      summary = 'Lista encadeada limpa.';
      break;
    }

    default: {
      events.push({
        type: 'highlight',
        ids: [],
        narration: `Operação "${input.type}" não suportada para Lista Encadeada.`
      });
      summary = `Operação ${input.type} não reconhecida.`;
      break;
    }
  }

  let finalState = state;
  for (const ev of events) {
    finalState = linkedListReducer(finalState, ev);
  }

  return {
    events,
    finalState,
    summary,
    quizPrompt
  };
}

// ============================================================================
// 2. STACK OPERATIONS (LIFO)
// ============================================================================
export function executeStackSandboxOp(
  state: StackState,
  input: SandboxOperationInput
): SandboxOperationResult<StackState, StackEvent> {
  const events: StackEvent[] = [];
  let summary = '';
  let quizPrompt: StepQuizPrompt | undefined;

  switch (input.type) {
    case 'push':
    case 'insert': {
      const val = input.value ?? 42;
      const newId = `stack-item-${Date.now()}-${val}`;

      events.push({
        type: 'stack-push',
        id: newId,
        value: val,
        narration: `PUSH(${val}): empilhando elemento no topo da pilha. Complexidade O(1) LIFO.`
      });

      events.push({
        type: 'complete',
        ids: [...state.items.map((it) => it.id), newId],
        narration: `Elemento ${val} agora é o topo da pilha (índice ${state.items.length}).`
      });

      summary = `PUSH(${val}) concluído em O(1). Pilha com ${state.items.length + 1} elementos.`;

      quizPrompt = {
        stepIndex: 0,
        question: 'Qual é o princípio fundamental de operação de uma Pilha (Stack)?',
        options: [
          'FIFO (First In, First Out)',
          'LIFO (Last In, First Out) - o último a entrar é o primeiro a sair',
          'Aleatório com prioridade dinâmica',
          'Ordenação contínua por chaves'
        ],
        correctIndex: 1,
        explanation: 'A pilha opera exclusivamente pelo topo: o elemento inserido mais recentemente será o primeiro a ser desempilhado (LIFO).'
      };
      break;
    }

    case 'pop':
    case 'delete': {
      if (state.items.length === 0) {
        events.push({
          type: 'complete',
          ids: [],
          narration: 'Stack Underflow: A pilha está vazia! Não é possível desempilhar elementos.'
        });
        summary = 'Falha no POP: Stack Underflow (pilha vazia).';
      } else {
        const topItem = state.items[state.items.length - 1];

        events.push({
          type: 'highlight',
          ids: [topItem.id],
          narration: `POP(): Localizando elemento do topo (${topItem.value})...`
        });

        events.push({
          type: 'stack-pop',
          id: topItem.id,
          narration: `POP(): Elemento ${topItem.value} desempilhado com sucesso em tempo constante O(1).`
        });

        const remainingIds = state.items.slice(0, -1).map((it) => it.id);
        events.push({
          type: 'complete',
          ids: remainingIds,
          narration: `Pilha atualizada: ${state.items.length - 1} elementos restantes.`
        });

        summary = `POP() removeu ${topItem.value} do topo. Complexidade: O(1).`;
      }
      break;
    }

    case 'peek':
    case 'search': {
      if (state.items.length === 0) {
        events.push({
          type: 'complete',
          ids: [],
          narration: 'PEEK(): Pilha vazia, nenhum elemento disponível para consulta.'
        });
        summary = 'PEEK() em pilha vazia: null.';
      } else {
        const topItem = state.items[state.items.length - 1];

        events.push({
          type: 'stack-peek',
          id: topItem.id,
          narration: `PEEK(): Consultando o elemento do topo sem removê-lo. Valor = ${topItem.value} em O(1).`
        });

        events.push({
          type: 'complete',
          ids: [topItem.id],
          narration: `Consulta PEEK() finalizada. O topo permanece inalterado.`
        });

        summary = `PEEK(): elemento do topo é ${topItem.value}. Complexidade: O(1).`;
      }
      break;
    }

    case 'clear': {
      for (const item of [...state.items].reverse()) {
        events.push({
          type: 'stack-pop',
          id: item.id,
          narration: `Desempilhando ${item.value}...`
        });
      }
      events.push({
        type: 'complete',
        ids: [],
        narration: 'Pilha esvaziada.'
      });
      summary = 'Pilha limpa.';
      break;
    }

    default: {
      events.push({
        type: 'highlight',
        ids: [],
        narration: `Operação "${input.type}" não suportada para Pilha.`
      });
      summary = `Operação ${input.type} não reconhecida.`;
      break;
    }
  }

  let finalState = state;
  for (const ev of events) {
    finalState = stackReducer(finalState, ev);
  }

  return {
    events,
    finalState,
    summary,
    quizPrompt
  };
}

// ============================================================================
// 3. QUEUE OPERATIONS (FIFO)
// ============================================================================
export function executeQueueSandboxOp(
  state: QueueState,
  input: SandboxOperationInput
): SandboxOperationResult<QueueState, QueueEvent> {
  const events: QueueEvent[] = [];
  let summary = '';
  let quizPrompt: StepQuizPrompt | undefined;

  switch (input.type) {
    case 'enqueue':
    case 'insert': {
      const val = input.value ?? 42;
      const newId = `queue-item-${Date.now()}-${val}`;

      events.push({
        type: 'queue-enqueue',
        id: newId,
        value: val,
        narration: `ENQUEUE(${val}): elemento adicionado no fim da fila. Complexidade O(1) FIFO.`
      });

      events.push({
        type: 'complete',
        ids: [...state.items.map((it) => it.id), newId],
        narration: `Elemento ${val} entrou na fila (tamanho ${state.items.length + 1}).`
      });

      summary = `ENQUEUE(${val}) concluído em O(1). Fila com ${state.items.length + 1} elementos.`;

      quizPrompt = {
        stepIndex: 0,
        question: 'Qual é a regra de remoção de uma Fila (Queue)?',
        options: [
          'FIFO (First In, First Out) - o primeiro a entrar é o primeiro a sair',
          'LIFO (Last In, First Out)',
          'O elemento com maior valor numérico',
          'O elemento no meio da estrutura'
        ],
        correctIndex: 0,
        explanation: 'Filas garantem justiça temporal por FIFO: o elemento mais antigo da fila é sempre o próximo a ser atendido/removido.'
      };
      break;
    }

    case 'dequeue':
    case 'delete': {
      if (state.items.length === 0) {
        events.push({
          type: 'complete',
          ids: [],
          narration: 'Queue Underflow: A fila está vazia! Não há elementos para desenfileirar.'
        });
        summary = 'Falha no DEQUEUE: Queue Underflow (fila vazia).';
      } else {
        const headItem = state.items[0];

        events.push({
          type: 'highlight',
          ids: [headItem.id],
          narration: `DEQUEUE(): Selecionando primeiro elemento da fila (${headItem.value})...`
        });

        events.push({
          type: 'queue-dequeue',
          id: headItem.id,
          narration: `DEQUEUE(): Elemento ${headItem.value} atendido e removido da frente em O(1).`
        });

        const remainingIds = state.items.slice(1).map((it) => it.id);
        events.push({
          type: 'complete',
          ids: remainingIds,
          narration: `Fila atualizada: ${state.items.length - 1} elementos restantes.`
        });

        summary = `DEQUEUE() removeu ${headItem.value} da frente da fila. Complexidade: O(1).`;
      }
      break;
    }

    case 'peek':
    case 'search': {
      if (state.items.length === 0) {
        events.push({
          type: 'complete',
          ids: [],
          narration: 'PEEK(): Fila vazia, nenhum elemento disponível para consulta.'
        });
        summary = 'PEEK() em fila vazia: null.';
      } else {
        const headItem = state.items[0];

        events.push({
          type: 'queue-peek',
          id: headItem.id,
          narration: `PEEK(): Consultando primeiro da fila sem removê-lo: ${headItem.value} em O(1).`
        });

        events.push({
          type: 'complete',
          ids: [headItem.id],
          narration: `Consulta finalizada. A fila permanece intacta.`
        });

        summary = `PEEK(): elemento da frente é ${headItem.value}. Complexidade: O(1).`;
      }
      break;
    }

    case 'clear': {
      for (const item of state.items) {
        events.push({
          type: 'queue-dequeue',
          id: item.id,
          narration: `Desenfileirando ${item.value}...`
        });
      }
      events.push({
        type: 'complete',
        ids: [],
        narration: 'Fila esvaziada.'
      });
      summary = 'Fila limpa.';
      break;
    }

    default: {
      events.push({
        type: 'highlight',
        ids: [],
        narration: `Operação "${input.type}" não suportada para Fila.`
      });
      summary = `Operação ${input.type} não reconhecida.`;
      break;
    }
  }

  let finalState = state;
  for (const ev of events) {
    finalState = queueReducer(finalState, ev);
  }

  return {
    events,
    finalState,
    summary,
    quizPrompt
  };
}

// ============================================================================
// 4. HASH MAP OPERATIONS
// ============================================================================
export function executeHashMapSandboxOp(
  state: HashMapState,
  input: SandboxOperationInput
): SandboxOperationResult<HashMapState, HashMapEvent> {
  const events: HashMapEvent[] = [];
  let summary = '';
  let quizPrompt: StepQuizPrompt | undefined;

  const m = state.bucketCount > 0 ? state.bucketCount : 7;

  switch (input.type) {
    case 'insert': {
      const key = input.value ?? 17;
      const rawVal = input.secondaryValue;
      const strVal = typeof rawVal === 'string' && rawVal.trim().length > 0 ? rawVal : `Item-${key}`;
      const hash = Math.abs(key) % m;
      const targetBucket = state.buckets.find((b) => b.index === hash) ?? state.buckets[hash];
      const hasCollision = targetBucket && targetBucket.entries.length > 0;

      events.push({
        type: 'hash-calc',
        key,
        hash,
        formula: `h(${key}) = ${key} mod ${m} = ${hash}`,
        narration: `Calculando função hash: h(${key}) = ${key} % ${m} = Bucket [${hash}].`
      });

      if (hasCollision) {
        events.push({
          type: 'hash-collision',
          bucketIndex: hash,
          message: `Colisão no Bucket [${hash}]! Já contém ${targetBucket.entries.length} chave(s).`,
          narration: `COLISÃO DETECTADA: O Bucket [${hash}] já contém entradas. Aplicando encadeamento separado na lista.`
        });
      }

      const newId = `entry-${key}-${Date.now()}`;
      events.push({
        type: 'hash-insert',
        bucketIndex: hash,
        id: newId,
        key,
        value: strVal,
        narration: `Par { chave: ${key}, valor: "${strVal}" } inserido com sucesso no Bucket [${hash}].`
      });

      events.push({
        type: 'complete',
        ids: [newId],
        narration: `Inserção concluída na Tabela Hash.`
      });

      summary = `Inserção da chave ${key} ("${strVal}") no Bucket [${hash}] finalizada.${hasCollision ? ' (com tratamento de colisão por encadeamento)' : ' Complexidade: O(1) médio.'}`;

      if (hasCollision) {
        quizPrompt = {
          stepIndex: 1,
          question: 'Como a estratégia de Encadeamento Separado (Separate Chaining) resolve colisões na Tabela Hash?',
          options: [
            'Sobrescreve imediatamente o elemento anterior',
            'Armazena os elementos conflitantes em uma lista encadeada vinculada àquele bucket',
            'Duplica o tamanho de todos os valores da memória',
            'Descarta a chave e lança uma exceção'
          ],
          correctIndex: 1,
          explanation: 'Com encadeamento separado, cada bucket aponta para uma lista ou coleção de itens que compartilham o mesmo hash.'
        };
      }
      break;
    }

    case 'search': {
      const key = input.value ?? 17;
      const hash = Math.abs(key) % m;
      const targetBucket = state.buckets.find((b) => b.index === hash) ?? state.buckets[hash];
      const matchEntry = targetBucket?.entries.find((e) => e.key === key);

      events.push({
        type: 'hash-calc',
        key,
        hash,
        formula: `h(${key}) = ${key} mod ${m} = ${hash}`,
        narration: `Calculando hash para busca: h(${key}) = ${key} mod ${m} = Bucket [${hash}].`
      });

      if (matchEntry) {
        events.push({
          type: 'hash-find',
          bucketIndex: hash,
          key,
          narration: `Acessando Bucket [${hash}] diretamente: chave ${key} encontrada com valor "${matchEntry.value}"!`
        });

        events.push({
          type: 'complete',
          ids: [matchEntry.id],
          narration: `Busca concluída com sucesso em tempo esperado O(1).`
        });

        summary = `Busca pela chave ${key}: encontrada no Bucket [${hash}] com valor "${matchEntry.value}". Complexidade média: O(1).`;
      } else {
        events.push({
          type: 'complete',
          ids: [],
          narration: `Chave ${key} não encontrada no Bucket [${hash}] (bucket vazio ou chave ausente).`
        });

        summary = `Busca pela chave ${key}: não encontrada no Bucket [${hash}].`;
      }

      quizPrompt = {
        stepIndex: 0,
        question: 'Qual é a complexidade média esperada de busca em uma Tabela Hash bem distribuída?',
        options: ['O(n²)', 'O(log n)', 'O(1) tempo constante', 'O(n!)'],
        correctIndex: 2,
        explanation: 'Com uma boa função hash e baixo fator de carga, o acesso ao bucket e recuperação do item ocorrem em O(1) médio.'
      };
      break;
    }

    case 'delete': {
      const key = input.value ?? 17;
      const hash = Math.abs(key) % m;
      const targetBucket = state.buckets.find((b) => b.index === hash) ?? state.buckets[hash];
      const matchEntry = targetBucket?.entries.find((e) => e.key === key);

      events.push({
        type: 'hash-calc',
        key,
        hash,
        formula: `h(${key}) = ${key} mod ${m} = ${hash}`,
        narration: `Calculando hash para remoção: h(${key}) = ${key} mod ${m} = Bucket [${hash}].`
      });

      if (matchEntry) {
        events.push({
          type: 'hash-remove',
          bucketIndex: hash,
          key,
          narration: `Removendo par com chave ${key} do Bucket [${hash}].`
        });

        events.push({
          type: 'complete',
          ids: [],
          narration: `Remoção concluída com sucesso.`
        });

        summary = `Chave ${key} removida do Bucket [${hash}]. Complexidade média: O(1).`;
      } else {
        events.push({
          type: 'complete',
          ids: [],
          narration: `Tentativa de remoção falhou: chave ${key} não existe no Bucket [${hash}].`
        });

        summary = `Remoção não executada: chave ${key} não localizada no Bucket [${hash}].`;
      }
      break;
    }

    case 'clear': {
      for (const bucket of state.buckets) {
        for (const entry of bucket.entries) {
          events.push({
            type: 'hash-remove',
            bucketIndex: bucket.index,
            key: entry.key,
            narration: `Removendo chave ${entry.key}...`
          });
        }
      }
      events.push({
        type: 'complete',
        ids: [],
        narration: 'Tabela Hash esvaziada.'
      });
      summary = 'Tabela Hash limpa.';
      break;
    }

    default: {
      events.push({
        type: 'highlight',
        ids: [],
        narration: `Operação "${input.type}" não suportada para Tabela Hash.`
      });
      summary = `Operação ${input.type} não reconhecida.`;
      break;
    }
  }

  let finalState = state;
  for (const ev of events) {
    finalState = hashMapReducer(finalState, ev);
  }

  return {
    events,
    finalState,
    summary,
    quizPrompt
  };
}

// ============================================================================
// 5. GRAPH OPERATIONS (BFS & DFS)
// ============================================================================
export function executeGraphSandboxOp(
  state: GraphState,
  input: SandboxOperationInput
): SandboxOperationResult<GraphState, GraphEvent> {
  const events: GraphEvent[] = [];
  let summary = '';
  let quizPrompt: StepQuizPrompt | undefined;

  // Monta lista de adjacência determinística e ordenada
  const adj: Record<string, string[]> = {};
  for (const v of state.vertices) {
    adj[v.id] = [];
  }
  for (const e of state.edges) {
    if (adj[e.from] && !adj[e.from].includes(e.to)) {
      adj[e.from].push(e.to);
    }
    if (adj[e.to] && !adj[e.to].includes(e.from)) {
      adj[e.to].push(e.from);
    }
  }
  for (const k of Object.keys(adj)) {
    adj[k].sort();
  }

  // Determina o nó de partida a partir de input.secondaryValue ('A', 'B', 'C', 'D', 'E', 'F')
  const validIds = new Set(state.vertices.map((v) => v.id));
  let startNode = 'A';
  if (typeof input.secondaryValue === 'string') {
    const candidate = input.secondaryValue.toUpperCase().trim();
    if (validIds.has(candidate)) {
      startNode = candidate;
    }
  } else if (state.vertices.length > 0) {
    startNode = state.vertices[0].id;
  }

  switch (input.type) {
    case 'bfs': {
      events.push({
        type: 'highlight',
        ids: [],
        narration: `Iniciando Busca em Largura (BFS) a partir do vértice "${startNode}".`
      });

      const queue: string[] = [startNode];
      const visited = new Set<string>([startNode]);

      events.push({
        type: 'graph-enqueue-frontier',
        id: startNode,
        narration: `Enfileirando vértice de origem "${startNode}" na fronteira FIFO (camada 0).`
      });

      while (queue.length > 0) {
        const curr = queue.shift()!;

        events.push({
          type: 'graph-dequeue-frontier',
          id: curr,
          narration: `Desenfileirando "${curr}" para visitar e explorar seus vizinhos.`
        });

        events.push({
          type: 'graph-visit-vertex',
          id: curr,
          narration: `Processando vértice "${curr}". Inspecionando adjacências: [${adj[curr].join(', ')}].`
        });

        for (const neighbor of adj[curr]) {
          events.push({
            type: 'graph-explore-edge',
            from: curr,
            to: neighbor,
            narration: `Explorando aresta (${curr} - ${neighbor}).`
          });

          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);

            events.push({
              type: 'graph-enqueue-frontier',
              id: neighbor,
              narration: `Vizinho "${neighbor}" descoberto pela primeira vez: adicionado à fila FIFO.`
            });
          }
        }
      }

      events.push({
        type: 'complete',
        ids: Array.from(visited),
        narration: `Busca em Largura (BFS) finalizada com sucesso! Todos os menores caminhos explorados.`
      });

      summary = `BFS a partir de "${startNode}" concluída. Vértices visitados: ${visited.size}. Complexidade: O(V + E).`;

      quizPrompt = {
        stepIndex: 1,
        question: 'Qual propriedade essencial a Busca em Largura (BFS) garante ao explorar grafos não ponderados?',
        options: [
          'Encontra o caminho com menor número de arestas (menor distância) a partir da raiz',
          'Ordena topologicamente grafos cíclicos',
          'Encontra a árvore geradora máxima',
          'Elimina ciclos do grafo'
        ],
        correctIndex: 0,
        explanation: 'BFS expande em anéis concêntricos (camadas de distância 1, 2, 3...), garantindo o caminho mais curto em número de arestas.'
      };
      break;
    }

    case 'dfs': {
      events.push({
        type: 'highlight',
        ids: [],
        narration: `Iniciando Busca em Profundidade (DFS) a partir do vértice "${startNode}".`
      });

      const visited = new Set<string>();

      function dfsTraverse(nodeId: string) {
        visited.add(nodeId);

        events.push({
          type: 'graph-visit-vertex',
          id: nodeId,
          narration: `DFS: visitando vértice "${nodeId}". Mergulhando na profundidade máxima antes de retroceder.`
        });

        for (const neighbor of adj[nodeId]) {
          events.push({
            type: 'graph-explore-edge',
            from: nodeId,
            to: neighbor,
            narration: `DFS: analisando aresta (${nodeId} - ${neighbor}).`
          });

          if (!visited.has(neighbor)) {
            dfsTraverse(neighbor);

            events.push({
              type: 'graph-visit-vertex',
              id: nodeId,
              narration: `DFS: retornando (backtracking) ao vértice "${nodeId}".`
            });
          }
        }
      }

      dfsTraverse(startNode);

      events.push({
        type: 'complete',
        ids: Array.from(visited),
        narration: `Busca em Profundidade (DFS) finalizada com sucesso! Todos os ramos acessíveis explorados.`
      });

      summary = `DFS a partir de "${startNode}" concluída. Vértices visitados: ${visited.size}. Complexidade: O(V + E).`;

      quizPrompt = {
        stepIndex: 1,
        question: 'Qual estrutura de dados ou mecanismo dá suporte natural à execução de uma Busca em Profundidade (DFS)?',
        options: [
          'Fila FIFO',
          'Pilha (LIFO) ou pilha de chamadas de funções recursivas',
          'Fila de prioridade com Heap',
          'Tabela de dispersão direta'
        ],
        correctIndex: 1,
        explanation: 'DFS explora até o fim de cada ramo e retrocede (backtracking), comportamento perfeitamente mapeado por uma pilha (Stack ou recursão).'
      };
      break;
    }

    default: {
      events.push({
        type: 'highlight',
        ids: [],
        narration: `Operação "${input.type}" não suportada para Grafo.`
      });
      summary = `Operação ${input.type} não reconhecida para Grafo.`;
      break;
    }
  }

  let finalState = state;
  for (const ev of events) {
    finalState = graphReducer(finalState, ev);
  }

  return {
    events,
    finalState,
    summary,
    quizPrompt
  };
}
