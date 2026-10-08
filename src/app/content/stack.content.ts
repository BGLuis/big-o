import { AlgorithmContent } from './content.types';

export const STACK_CONTENT: AlgorithmContent = {
  id: 'stack',
  title: 'Pilha (Stack - LIFO)',
  category: 'data-structure',
  family: 'stack',
  timeComplexity: {
    best: 'O(1)',
    average: 'O(1)',
    worst: 'O(1)'
  },
  spaceComplexity: 'O(n)',
  shortDescription:
    'Estrutura linear LIFO (Last In, First Out) onde adições e remoções acontecem exclusivamente na mesma extremidade: o Topo.',
  fullExplanation:
    'A Pilha obedece estritamente ao princípio LIFO (o último elemento a entrar é o primeiro a sair). Pense em uma pilha de pratos ou no histórico de desfazer (Ctrl + Z) de um editor: novos pratos são colocados no topo (push) e retirados do topo (pop). A pilha de execução de funções (Call Stack) de quase todas as linguagens modernas é gerenciada com essa estrutura, garantindo operações O(1) no topo.',
  pseudoCode: [
    'classe Pilha',
    '  itens = []',
    '  topo = -1',
    '',
    '  função push(valor) // Empilhar no topo',
    '    topo = topo + 1',
    '    itens[topo] = valor',
    '  fim função',
    '',
    '  função pop() // Desempilhar do topo',
    '    se estaVazia() então erro "Pilha Vazia"',
    '    valorRemovido = itens[topo]',
    '    topo = topo - 1',
    '    retorne valorRemovido',
    '  fim função',
    '',
    '  função peek() // Espiar o topo sem remover',
    '    se estaVazia() então erro "Pilha Vazia"',
    '    retorne itens[topo]',
    '  fim função',
    'fim classe'
  ]
};
