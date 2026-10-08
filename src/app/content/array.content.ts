import { AlgorithmContent } from './content.types';

export const ARRAY_CONTENT: AlgorithmContent = {
  id: 'array',
  title: 'Array (Vetor Contíguo)',
  category: 'data-structure',
  family: 'linear',
  timeComplexity: {
    best: 'O(1)',
    average: 'O(1) acesso / O(n) busca',
    worst: 'O(n) inserção/remoção'
  },
  spaceComplexity: 'O(n)',
  shortDescription:
    'Coleção de elementos do mesmo tipo armazenados em posições contíguas de memória com acesso direto por índice O(1).',
  fullExplanation:
    'O Array (ou Vetor) é a estrutura de dados mais elementar da computação. Seus elementos ocupam blocos contíguos de memória física, permitindo que a CPU calcule o endereço exato de qualquer posição em tempo constante O(1) usando a fórmula: endereço = base + índice * tamanhoElemento. No entanto, inserir ou remover elementos no meio ou início requer deslocar (shifting) todos os elementos subsequentes, custando tempo linear O(n).',
  pseudoCode: [
    '// 1. Acesso direto por índice em O(1)',
    'função obterElemento(A, indice)',
    '  retorne A[indice]',
    'fim função',
    '',
    '// 2. Busca linear em O(n)',
    'função buscar(A, alvo)',
    '  para i de 0 até tamanho(A) - 1 faça',
    '    se A[i] == alvo então retorne i',
    '  fim para',
    '  retorne -1',
    'fim função',
    '',
    '// 3. Inserção com deslocamento em O(n)',
    'função inserir(A, indice, novoValor)',
    '  para i de tamanho(A) decrescendo até indice + 1 faça',
    '    A[i] = A[i - 1] // Desloca para a direita',
    '  fim para',
    '  A[indice] = novoValor',
    'fim função'
  ]
};
