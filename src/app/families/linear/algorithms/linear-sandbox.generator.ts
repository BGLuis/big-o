import { LinearEvent } from '../../../engine/events';
import { SandboxOperationInput, SandboxOperationResult, StepQuizPrompt } from '../../../features/sandbox/sandbox.types';
import { LinearElement, LinearState, createInitialLinearState, linearReducer } from '../linear-state';

import { generateBubbleSortEvents } from './bubble-sort.generator';
import { generateCountingSortEvents } from './counting-sort.generator';
import { generateDualPivotQuickSortEvents } from './dual-pivot-quick-sort.generator';
import { generateHeapSortEvents } from './heap-sort.generator';
import { generateInsertionSortEvents } from './insertion-sort.generator';
import { generateIntrosortEvents } from './introsort.generator';
import { generateMergeSortEvents } from './merge-sort.generator';
import { generateQuickSortEvents } from './quick-sort.generator';
import { generateRadixSortEvents } from './radix-sort.generator';
import { generateSelectionSortEvents } from './selection-sort.generator';
import { generateTimsortEvents } from './timsort.generator';

const SORTING_GENERATORS: Record<string, (elements: readonly LinearElement[]) => Generator<LinearEvent>> = {
  'quick-sort': generateQuickSortEvents,
  'heap-sort': generateHeapSortEvents,
  'merge-sort': generateMergeSortEvents,
  'bubble-sort': generateBubbleSortEvents,
  'selection-sort': generateSelectionSortEvents,
  'insertion-sort': generateInsertionSortEvents,
  'counting-sort': generateCountingSortEvents,
  'radix-sort': generateRadixSortEvents,
  'dual-pivot-quick-sort': generateDualPivotQuickSortEvents,
  'timsort': generateTimsortEvents,
  'introsort': generateIntrosortEvents
};

export function generateSortingArenaEvents(algoId: string, values: readonly number[]): readonly LinearEvent[] {
  const normId = algoId.toLowerCase().trim().replace(/[_\s]/g, '-');
  const generatorFn = SORTING_GENERATORS[normId] ?? generateQuickSortEvents;
  const initialState = createInitialLinearState([...values]);
  return Array.from(generatorFn(initialState.elements));
}

export function executeArraySandboxOp(
  state: LinearState,
  input: SandboxOperationInput
): SandboxOperationResult<LinearState, LinearEvent> {
  const events: LinearEvent[] = [];
  let summary = '';
  let quizPrompt: StepQuizPrompt | undefined;

  switch (input.type) {
    case 'insert':
    case 'insert-at': {
      const val = input.value ?? 50;
      let targetPos = state.elements.length;
      if (typeof input.secondaryValue === 'number') {
        targetPos = Math.max(0, Math.min(input.secondaryValue, state.elements.length));
      } else if (typeof input.secondaryValue === 'string' && !isNaN(Number(input.secondaryValue))) {
        targetPos = Math.max(0, Math.min(Number(input.secondaryValue), state.elements.length));
      }

      const isTail = targetPos === state.elements.length;
      const newId = `elem-${Date.now()}-${val}`;

      if (!isTail && state.elements.length > 0) {
        events.push({
          type: 'set-scope',
          from: targetPos,
          to: state.elements.length - 1,
          narration: `Inserindo ${val} no índice [${targetPos}]. Elementos de [${targetPos}] a [${state.elements.length - 1}] sofrem shift para a direita (O(n)).`
        });
      } else {
        events.push({
          type: 'highlight',
          ids: state.elements.length > 0 ? [state.elements[state.elements.length - 1].id] : [],
          narration: `Inserindo ${val} ao final do array (índice [${targetPos}]). Operação direta O(1) amortizado.`
        });
      }

      events.push({
        type: 'insert',
        id: newId,
        value: val,
        position: targetPos,
        narration: `Elemento ${val} alocado na posição ${targetPos}.`
      });

      events.push({
        type: 'highlight',
        ids: [newId],
        narration: `Inserção concluída: novo elemento ${val} posicionado no índice ${targetPos}.`
      });

      events.push({
        type: 'complete',
        ids: [...state.elements.map((e) => e.id), newId],
        narration: `Array atualizado com ${state.elements.length + 1} elementos.`
      });

      summary = `Inserção de ${val} no índice ${targetPos} concluída. Complexidade: ${isTail ? 'O(1) amortizado' : 'O(n) por deslocamento de memória'}.`;

      if (!isTail) {
        quizPrompt = {
          stepIndex: 1,
          question: 'Por que a inserção no início ou meio de um array contíguo possui complexidade O(n)?',
          options: [
            'Porque é necessário alocar uma nova thread de CPU',
            'Porque todos os elementos posteriores precisam ser deslocados uma posição à direita em memória',
            'Porque o array precisa ser ordenado novamente',
            'Porque a tabela hash precisa ser invalidada'
          ],
          correctIndex: 1,
          explanation: 'Arrays contíguos armazenam dados em endereços sequenciais. Inserir antes do final força mover os elementos seguintes para liberar o espaço.'
        };
      }
      break;
    }

    case 'delete':
    case 'remove-at': {
      let removeIdx = -1;
      if (input.type === 'remove-at' || typeof input.secondaryValue === 'number') {
        const rawIdx = typeof input.secondaryValue === 'number' ? input.secondaryValue : input.value ?? 0;
        if (rawIdx >= 0 && rawIdx < state.elements.length) {
          removeIdx = rawIdx;
        }
      } else if (input.value !== undefined) {
        // Busca linear pelo valor a remover
        for (let i = 0; i < state.elements.length; i++) {
          const item = state.elements[i];
          events.push({
            type: 'compare',
            ids: [item.id, item.id],
            result: item.value === input.value ? 0 : 1,
            pointers: [{ label: 'i', index: i, color: '#3b82f6' }],
            narration: `Buscando valor ${input.value}: inspecionando A[${i}] = ${item.value}...`
          });

          if (item.value === input.value) {
            removeIdx = i;
            break;
          }
        }
      }

      if (removeIdx === -1 || removeIdx >= state.elements.length) {
        events.push({
          type: 'complete',
          ids: [],
          narration: `Elemento ${input.value !== undefined ? input.value : ''} não encontrado para remoção no array.`
        });
        summary = `Remoção não executada: elemento ou índice não localizado.`;
      } else {
        const target = state.elements[removeIdx];
        events.push({
          type: 'highlight',
          ids: [target.id],
          narration: `Elemento ${target.value} localizado no índice ${removeIdx}. Iniciando remoção.`
        });

        if (removeIdx < state.elements.length - 1) {
          events.push({
            type: 'set-scope',
            from: removeIdx + 1,
            to: state.elements.length - 1,
            narration: `Elementos de [${removeIdx + 1}] a [${state.elements.length - 1}] serão deslocados uma posição à esquerda para fechar a lacuna (O(n)).`
          });
        }

        events.push({
          type: 'remove',
          id: target.id,
          narration: `Elemento ${target.value} removido com sucesso.`
        });

        const remainingIds = state.elements.filter((e) => e.id !== target.id).map((e) => e.id);
        events.push({
          type: 'complete',
          ids: remainingIds,
          narration: `Array reorganizado com ${state.elements.length - 1} elementos.`
        });

        summary = `Remoção do elemento ${target.value} no índice ${removeIdx} concluída. Complexidade: ${removeIdx === state.elements.length - 1 ? 'O(1)' : 'O(n) por deslocamento à esquerda'}.`;

        quizPrompt = {
          stepIndex: Math.max(0, events.length - 2),
          question: 'Qual é o impacto de remover o primeiro elemento A[0] de um array de tamanho n?',
          options: [
            'O(1), pois basta incrementar um ponteiro interno sem afetar dados',
            'O(n), pois todos os n-1 elementos restantes devem ser deslocados para a esquerda',
            'O(log n), pois realiza busca binária para preencher o espaço',
            'O(n²), pois gera uma cópia recursiva de cada elemento'
          ],
          correctIndex: 1,
          explanation: 'Remover o índice 0 exige mover cada um dos n-1 itens subsequentes uma casa para trás para manter a contiguidade.'
        };
      }
      break;
    }

    case 'search': {
      const targetVal = input.value ?? 0;
      let foundIndex = -1;

      events.push({
        type: 'set-scope',
        from: 0,
        to: Math.max(0, state.elements.length - 1),
        narration: `Iniciando Busca Linear pelo valor ${targetVal} em coleção de tamanho ${state.elements.length}.`
      });

      for (let i = 0; i < state.elements.length; i++) {
        const item = state.elements[i];
        const isMatch = item.value === targetVal;

        events.push({
          type: 'visit',
          id: item.id,
          pointers: [{ label: 'i', index: i, color: '#3b82f6' }],
          narration: `Verificando índice [${i}]: valor ${item.value} ${isMatch ? '===' : '!=='} alvo ${targetVal}.`
        });

        if (isMatch) {
          foundIndex = i;
          events.push({
            type: 'highlight',
            ids: [item.id],
            pointers: [{ label: 'achou!', index: i, color: '#10b981' }],
            narration: `Elemento ${targetVal} encontrado no índice [${i}] após ${i + 1} comparações!`
          });
          break;
        }
      }

      if (foundIndex === -1) {
        events.push({
          type: 'complete',
          ids: [],
          narration: `Busca finalizada: valor ${targetVal} não se encontra no array. Total de comparações: ${state.elements.length} (pior caso O(n)).`
        });
        summary = `Busca Linear: valor ${targetVal} não encontrado. Comparações: ${state.elements.length}. Complexidade: O(n).`;
      } else {
        events.push({
          type: 'complete',
          ids: [state.elements[foundIndex].id],
          narration: `Busca Linear concluída com êxito no índice ${foundIndex}.`
        });
        summary = `Busca Linear: valor ${targetVal} encontrado no índice ${foundIndex} em ${foundIndex + 1} passos. Complexidade média/pior caso: O(n).`;
      }

      quizPrompt = {
        stepIndex: Math.min(events.length - 1, 3),
        question: 'Qual é o número máximo de comparações que uma Busca Linear realiza em um array desordenado de tamanho n?',
        options: ['log₂(n)', 'n/2', 'n comparações', '1 comparação'],
        correctIndex: 2,
        explanation: 'No pior caso (elemento ausente ou na última posição), a busca linear precisa checar todos os n elementos.'
      };
      break;
    }

    case 'binary-search': {
      const targetVal = input.value ?? 0;
      let workingElements = [...state.elements];

      // Checa se o array está ordenado
      let isSorted = true;
      for (let i = 0; i < workingElements.length - 1; i++) {
        if (workingElements[i].value > workingElements[i + 1].value) {
          isSorted = false;
          break;
        }
      }

      if (!isSorted && workingElements.length > 1) {
        events.push({
          type: 'set-scope',
          from: 0,
          to: workingElements.length - 1,
          narration: 'Aviso pedagógico: A Busca Binária exige array ordenado. Ordenando preliminarmente os valores...'
        });

        const sortedVals = workingElements.map((e) => e.value).sort((a, b) => a - b);
        for (let i = 0; i < workingElements.length; i++) {
          if (workingElements[i].value !== sortedVals[i]) {
            events.push({
              type: 'assign',
              id: workingElements[i].id,
              value: sortedVals[i],
              narration: `Reordenando: A[${i}] passa a ser ${sortedVals[i]}.`
            });
          }
        }
        workingElements = workingElements.map((e, idx) => ({ ...e, value: sortedVals[idx] }));
      }

      let left = 0;
      let right = workingElements.length - 1;
      let foundMid = -1;
      let steps = 0;

      while (left <= right) {
        steps++;
        const mid = Math.floor((left + right) / 2);
        const midItem = workingElements[mid];

        events.push({
          type: 'set-scope',
          from: left,
          to: right,
          pointers: [
            { label: 'esq', index: left, color: '#3b82f6' },
            { label: 'meio', index: mid, color: '#f59e0b' },
            { label: 'dir', index: right, color: '#ef4444' }
          ],
          narration: `Passo ${steps}: Janela de busca ativa de [${left}] a [${right}]. Elemento mediano A[${mid}] = ${midItem.value}.`
        });

        events.push({
          type: 'highlight',
          ids: [midItem.id],
          pointers: [
            { label: 'esq', index: left, color: '#3b82f6' },
            { label: 'meio', index: mid, color: '#f59e0b' },
            { label: 'dir', index: right, color: '#ef4444' }
          ],
          narration: `Comparando mediana A[${mid}] (${midItem.value}) com alvo ${targetVal}...`
        });

        if (midItem.value === targetVal) {
          foundMid = mid;
          events.push({
            type: 'complete',
            ids: [midItem.id],
            pointers: [{ label: 'alvo!', index: mid, color: '#10b981' }],
            narration: `Alvo ${targetVal} localizado no índice [${mid}] após apenas ${steps} divisões! Complexidade O(log n).`
          });
          break;
        } else if (midItem.value < targetVal) {
          const nextLeft = mid + 1;
          events.push({
            type: 'set-scope',
            from: nextLeft,
            to: right,
            pointers: [
              { label: 'esq', index: nextLeft, color: '#3b82f6' },
              { label: 'dir', index: right, color: '#ef4444' }
            ],
            narration: `Como ${midItem.value} < ${targetVal}, o alvo só pode estar na metade direita. Descartando sub-array [${left}..${mid}].`
          });
          left = nextLeft;
        } else {
          const nextRight = mid - 1;
          events.push({
            type: 'set-scope',
            from: left,
            to: nextRight,
            pointers: [
              { label: 'esq', index: left, color: '#3b82f6' },
              { label: 'dir', index: nextRight, color: '#ef4444' }
            ],
            narration: `Como ${midItem.value} > ${targetVal}, o alvo só pode estar na metade esquerda. Descartando sub-array [${mid}..${right}].`
          });
          right = nextRight;
        }
      }

      if (foundMid === -1) {
        events.push({
          type: 'complete',
          ids: [],
          narration: `Busca Binária concluída: valor ${targetVal} não encontrado após ${steps} iterações. Espaço esgotado em O(log n).`
        });
        summary = `Busca Binária: valor ${targetVal} não encontrado em ${steps} passos. Complexidade estrita: O(log n).`;
      } else {
        summary = `Busca Binária: valor ${targetVal} encontrado no índice [${foundMid}] em ${steps} passos. Complexidade: O(log n).`;
      }

      quizPrompt = {
        stepIndex: Math.min(events.length - 1, 2),
        question: 'Em um array ordenado de 1.024 elementos, quantas comparações no máximo a Busca Binária necessita?',
        options: ['10 comparações (log₂ 1024)', '512 comparações', '1.024 comparações', '32 comparações'],
        correctIndex: 0,
        explanation: 'A busca binária divide o espaço de busca pela metade a cada passo: log₂(1024) = 10 comparações no pior caso!'
      };
      break;
    }

    case 'clear': {
      for (const el of state.elements) {
        events.push({
          type: 'remove',
          id: el.id,
          narration: `Removendo elemento ${el.value}.`
        });
      }
      events.push({
        type: 'complete',
        ids: [],
        narration: 'Array completamente esvaziado.'
      });
      summary = 'Array limpo com sucesso.';
      break;
    }

    default: {
      events.push({
        type: 'highlight',
        ids: [],
        narration: `Operação "${input.type}" não suportada para Array Linear.`
      });
      summary = `Operação ${input.type} não reconhecida.`;
      break;
    }
  }

  let finalState = state;
  for (const ev of events) {
    finalState = linearReducer(finalState, ev);
  }

  return {
    events,
    finalState,
    summary,
    quizPrompt
  };
}
