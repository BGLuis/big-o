import { LinearEvent } from '../../../engine/events';
import { LinearElement } from '../linear-state';

export function* generateRadixSortEvents(
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

  const maxVal = Math.max(...elements.map((e) => e.value), 0);

  for (let exp = 1; Math.floor(maxVal / exp) > 0; exp *= 10) {
    const digitName = exp === 1 ? 'Unidades' : exp === 10 ? 'Dezenas' : 'Centenas';

    // Set up 10 buckets for base-10 digits 0..9
    const bucketSlots = Array.from({ length: 10 }, (_, d) => ({
      id: `radix-bucket-${exp}-${d}`,
      value: 0,
      label: `d=${d}`,
      state: 'normal' as const
    }));

    yield {
      type: 'set-aux',
      title: `Contagem por Dígito (${digitName}, exp = ${exp})`,
      elements: bucketSlots,
      narration: `Iniciando passada do Radix Sort para o dígito das ${digitName} (exp = ${exp}).`,
      pseudoCodeLine: 6
    };

    yield {
      type: 'set-scope',
      from: 0,
      to: n - 1,
      narration: `Analisando cada número pelo dígito das ${digitName}.`,
      pseudoCodeLine: 13
    };

    const count = new Array(10).fill(0);

    // Count occurrences of each digit
    for (let i = 0; i < n; i++) {
      const elem = elements[i];
      const digit = Math.floor(elem.value / exp) % 10;
      count[digit]++;

      yield {
        type: 'visit',
        id: elem.id,
        narration: `Elemento ${elem.value}: dígito correspondente é ${digit}.`,
        pseudoCodeLine: 14
      };

      yield {
        type: 'update-aux',
        index: digit,
        value: count[digit],
        state: 'highlighted',
        narration: `Bucket ${digit}: contagem acumulada = ${count[digit]}.`,
        pseudoCodeLine: 15
      };
    }

    // Cumulative count for stable positioning
    const prefix = [...count];
    for (let d = 1; d < 10; d++) {
      prefix[d] += prefix[d - 1];
    }

    // Build output array stably from right to left
    const output = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      const val = elements[i].value;
      const digit = Math.floor(val / exp) % 10;
      const targetPos = prefix[digit] - 1;
      output[targetPos] = val;
      prefix[digit]--;
    }

    // Write back to main array
    for (let i = 0; i < n; i++) {
      const targetElem = elements[i];
      const newVal = output[i];

      yield {
        type: 'assign',
        id: targetElem.id,
        value: newVal,
        narration: `Reordenando: posição ${i} recebe ${newVal} com base no dígito das ${digitName}.`,
        pseudoCodeLine: 18
      };

      elements[i] = { ...targetElem, value: newVal };
    }

    yield {
      type: 'clear-aux',
      narration: `Passada do dígito das ${digitName} finalizada.`,
      pseudoCodeLine: 19
    };
  }

  yield {
    type: 'complete',
    ids: elements.map((e) => e.id),
    narration: 'Radix Sort finalizado: todos os dígitos processados com sucesso.',
    pseudoCodeLine: 8
  };
}
