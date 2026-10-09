import { AlgorithmContent } from './content.types';

export const RADIX_SORT_CONTENT: AlgorithmContent = {
  id: 'radix-sort',
  title: 'Radix Sort (Ordenação por Raízes / Dígitos)',
  category: 'sorting',
  family: 'linear',
  timeComplexity: {
    best: 'O(n · d)',
    average: 'O(n · d)',
    worst: 'O(n · d)',
    theta: 'Θ(n·d)'
  },
  spaceComplexity: 'O(n + k)',
  shortDescription:
    'Ordena números dígito a dígito (do menos significativo para o mais significativo - LSD) usando buckets estáveis.',
  fullExplanation:
    'O Radix Sort (LSD) ordena os elementos analisando cada posição posicional (unidades, dezenas, centenas...), do dígito menos significativo ao mais significativo. Em cada passada de dígito, utiliza um algoritmo de ordenação estável (como Counting Sort em base 10) para preservar a ordem relativa das passadas anteriores.',
  pseudoCode: [
    'procedimento radixSort(A)',
    '  n = tamanho(A)',
    '  maximo = obterMaximo(A)',
    '  exp = 1 // 1 = unidades, 10 = dezenas, 100 = centenas...',
    '  enquanto maximo / exp > 0 faça',
    '    ordenarPorDigito(A, n, exp)',
    '    exp = exp * 10',
    '  fim enquanto',
    'fim procedimento',
    '',
    'procedimento ordenarPorDigito(A, n, exp)',
    '  criar contagem[0..9] preenchido com 0',
    '  criar saida[0..n-1]',
    '  para i de 0 até n - 1 faça',
    '    digito = (A[i] / exp) % 10',
    '    contagem[digito] = contagem[digito] + 1',
    '  fim para',
    '  acumular contagens e distribuir em saida[] de forma estável',
    '  copiar saida de volta para A',
    'fim procedimento'
  ]
};
