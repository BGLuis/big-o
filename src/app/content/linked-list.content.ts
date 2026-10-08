import { AlgorithmContent } from './content.types';

export const LINKED_LIST_CONTENT: AlgorithmContent = {
  id: 'linked-list',
  title: 'Lista Encadeada Simples',
  category: 'data-structure',
  family: 'graph',
  timeComplexity: {
    best: 'O(1)',
    average: 'O(n)',
    worst: 'O(n)'
  },
  spaceComplexity: 'O(n)',
  shortDescription:
    'Coleção linear cujos elementos (nós) não residem em posições contíguas, sendo encadeados por ponteiros/referências.',
  fullExplanation:
    'Uma estrutura de dados linear onde os elementos não são armazenados em posições contíguas de memória. Em vez disso, os elementos (nós) são conectados através de ponteiros ou referências. Cada nó armazena seu próprio dado e uma referência apontando para o próximo nó da sequência.',
  pseudoCode: [
    'classe No',
    '  dado : Qualquer',
    '  proximo : No | nulo',
    'fim classe',
    '',
    'função inserirNoInicio(cabeca, valor)',
    '  novoNo = novo No(valor)',
    '  novoNo.proximo = cabeca',
    '  retorne novoNo',
    'fim função',
    '',
    'função buscar(cabeca, valor)',
    '  atual = cabeca',
    '  enquanto atual não é nulo faça',
    '    se atual.dado == valor então retorne atual',
    '    atual = atual.proximo',
    '  fim enquanto',
    '  retorne nulo',
    'fim função'
  ]
};
