import { HashMapEvent } from '../../../engine/events';

export function* generateHashMapEvents(): Generator<HashMapEvent> {
  const m = 7;

  yield {
    type: 'highlight',
    ids: [],
    narration: `Tabela Hash inicializada com m = ${m} buckets vazios e função de dispersão h(k) = k mod ${m}.`,
    pseudoCodeLine: 2
  };

  // 1. Inserir (15, "Ana")
  const k1 = 15;
  const h1 = k1 % m; // 1
  yield {
    type: 'hash-calc',
    key: k1,
    hash: h1,
    formula: `h(${k1}) = ${k1} mod ${m} = ${h1}`,
    narration: `Calculando hash para a chave ${k1}: ${k1} mod ${m} = índice ${h1}.`,
    pseudoCodeLine: 8
  };
  yield {
    type: 'hash-insert',
    bucketIndex: h1,
    id: `entry-${k1}`,
    key: k1,
    value: 'Ana',
    narration: `Inserindo par { chave: ${k1}, valor: "Ana" } no Bucket [${h1}].`,
    pseudoCodeLine: 10
  };

  // 2. Inserir (28, "Bia")
  const k2 = 28;
  const h2 = k2 % m; // 0
  yield {
    type: 'hash-calc',
    key: k2,
    hash: h2,
    formula: `h(${k2}) = ${k2} mod ${m} = ${h2}`,
    narration: `Calculando hash para a chave ${k2}: ${k2} mod ${m} = índice ${h2}.`,
    pseudoCodeLine: 8
  };
  yield {
    type: 'hash-insert',
    bucketIndex: h2,
    id: `entry-${k2}`,
    key: k2,
    value: 'Bia',
    narration: `Inserindo par { chave: ${k2}, valor: "Bia" } no Bucket [${h2}].`,
    pseudoCodeLine: 10
  };

  // 3. Inserir (22, "Carlos") -> Colisão em h=1 com Ana!
  const k3 = 22;
  const h3 = k3 % m; // 1
  yield {
    type: 'hash-calc',
    key: k3,
    hash: h3,
    formula: `h(${k3}) = ${k3} mod ${m} = ${h3}`,
    narration: `Calculando hash para a chave ${k3}: ${k3} mod ${m} = índice ${h3}.`,
    pseudoCodeLine: 8
  };
  yield {
    type: 'hash-collision',
    bucketIndex: h3,
    message: `Colisão detectada no Bucket [${h3}]! Chave ${k3} colidiu com chave ${k1}.`,
    narration: `ALERTA DE COLISÃO: O Bucket [${h3}] já contém um elemento! Aplicando Encadeamento Separado.`,
    pseudoCodeLine: 9
  };
  yield {
    type: 'hash-insert',
    bucketIndex: h3,
    id: `entry-${k3}`,
    key: k3,
    value: 'Carlos',
    narration: `Encadeando { chave: ${k3}, valor: "Carlos" } na lista do Bucket [${h3}].`,
    pseudoCodeLine: 10
  };

  // 4. Inserir (35, "Daniel") -> Colisão em h=0 com Bia!
  const k4 = 35;
  const h4 = k4 % m; // 0
  yield {
    type: 'hash-calc',
    key: k4,
    hash: h4,
    formula: `h(${k4}) = ${k4} mod ${m} = ${h4}`,
    narration: `Calculando hash para a chave ${k4}: ${k4} mod ${m} = índice ${h4}.`,
    pseudoCodeLine: 8
  };
  yield {
    type: 'hash-collision',
    bucketIndex: h4,
    message: `Colisão no Bucket [${h4}]! Chave ${k4} colidiu com chave ${k2}.`,
    narration: `Colisão no Bucket [${h4}]: encadeando novo nó na lista.`,
    pseudoCodeLine: 9
  };
  yield {
    type: 'hash-insert',
    bucketIndex: h4,
    id: `entry-${k4}`,
    key: k4,
    value: 'Daniel',
    narration: `Encadeando { chave: ${k4}, valor: "Daniel" } no Bucket [${h4}].`,
    pseudoCodeLine: 10
  };

  // 5. Busca O(1) médio pela chave 22
  yield {
    type: 'hash-calc',
    key: k3,
    hash: h3,
    formula: `h(${k3}) = ${k3} mod ${m} = ${h3}`,
    narration: `Operação BUSCAR(chave = ${k3}): calculando bucket destino = ${h3} em O(1).`,
    pseudoCodeLine: 14
  };
  yield {
    type: 'hash-find',
    bucketIndex: h3,
    key: k3,
    narration: `Acessando Bucket [${h3}] diretamente e localizando par { chave: ${k3}, valor: "Carlos" }!`,
    pseudoCodeLine: 16
  };

  yield {
    type: 'complete',
    ids: [`entry-${k1}`, `entry-${k2}`, `entry-${k3}`, `entry-${k4}`],
    narration: 'Demonstração de Tabela Hash concluída com sucesso (dispersão e colisões tratadas).',
    pseudoCodeLine: 19
  };
}
