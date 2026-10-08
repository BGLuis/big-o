import { AlgorithmContent } from './content.types';

export const HASH_MAP_CONTENT: AlgorithmContent = {
  id: 'hash-map',
  title: 'Tabela Hash (Hash Map & Colisões)',
  category: 'data-structure',
  family: 'hash-map',
  timeComplexity: {
    best: 'O(1)',
    average: 'O(1)',
    worst: 'O(n) no pior caso de colisões'
  },
  spaceComplexity: 'O(n)',
  shortDescription:
    'Associação chave-valor com tempo médio O(1) usando função hash e encadeamento separado para tratar colisões.',
  fullExplanation:
    'A Tabela Hash (Hash Table ou Dicionário) transforma uma chave qualquer em um índice de vetor através de uma função matemática de espalhamento (hash function): índice = hash(chave) % m. Quando duas chaves produzem o mesmo índice, ocorre uma colisão. Uma das formas mais didáticas e elegantes de resolver colisões é o Encadeamento Separado (Separate Chaining), onde cada bucket armazena uma pequena lista encadeada com os pares colidentes.',
  pseudoCode: [
    'classe TabelaHash(m = 7)',
    '  buckets = vetor de listas encadeadas de tamanho m',
    '',
    '  função hash(chave)',
    '    retorne chave mod m',
    '  fim função',
    '',
    '  função inserir(chave, valor)',
    '    indice = hash(chave)',
    '    // Se bucket já possui elementos, ocorre colisão!',
    '    buckets[indice].inserirNoInicio({ chave, valor })',
    '  fim função',
    '',
    '  função buscar(chave)',
    '    indice = hash(chave)',
    '    para cada item em buckets[indice] faça',
    '      se item.chave == chave então retorne item.valor',
    '    fim para',
    '    retorne nulo',
    '  fim função',
    'fim classe'
  ]
};
