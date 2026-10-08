import { AlgorithmContent } from './content.types';

export const QUEUE_CONTENT: AlgorithmContent = {
  id: 'queue',
  title: 'Fila (Queue - FIFO)',
  category: 'data-structure',
  family: 'queue',
  timeComplexity: {
    best: 'O(1)',
    average: 'O(1)',
    worst: 'O(1)'
  },
  spaceComplexity: 'O(n)',
  shortDescription:
    'Estrutura linear FIFO (First In, First Out) onde adições ocorrem no Fim e remoções ocorrem no Início.',
  fullExplanation:
    'A Fila segue o princípio FIFO (o primeiro elemento a entrar é rigorosamente o primeiro a sair), exatamente como uma fila de atendimento bancário ou uma fila de impressão de documentos. Elementos entram pela cauda/fim (enqueue) e são consumidos pela cabeça/início (dequeue). É a espinha dorsal de sistemas assíncronos de mensageria (como RabbitMQ e Kafka) e de algoritmos de exploração como a Busca em Largura (BFS).',
  pseudoCode: [
    'classe Fila',
    '  itens = []',
    '  inicio = 0',
    '  fim = 0',
    '',
    '  função enqueue(valor) // Entrar no fim',
    '    itens[fim] = valor',
    '    fim = fim + 1',
    '  fim função',
    '',
    '  função dequeue() // Sair do início',
    '    se estaVazia() então erro "Fila Vazia"',
    '    removido = itens[inicio]',
    '    inicio = inicio + 1',
    '    retorne removido',
    '  fim função',
    '',
    '  função peek() // Consultar o próximo a sair',
    '    se estaVazia() então erro "Fila Vazia"',
    '    retorne itens[inicio]',
    '  fim função',
    'fim classe'
  ]
};
