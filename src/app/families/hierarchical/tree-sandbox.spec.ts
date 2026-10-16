import { describe, it, expect } from 'vitest';
import { createInitialTreeState, TreeState } from './tree-state';
import {
  applyEventsToTreeState,
  executeTreeOperation,
  generateTreeBatchComparisonEvents,
  computeSubtreeHeight,
  computeBalanceFactor
} from './algorithms/tree-sandbox.generator';

describe('Tree Sandbox Generator & Interactive Operations', () => {
  describe('applyEventsToTreeState', () => {
    it('should reduce events and normalize node states to default while preserving metadata', () => {
      let state = createInitialTreeState();
      const insertResult = executeTreeOperation(state, { type: 'insert', value: 50 }, 'avl');

      expect(insertResult.events.length).toBeGreaterThan(0);
      const applied = applyEventsToTreeState(state, insertResult.events);

      expect(applied.rootId).toBe('node-50');
      expect(applied.nodes['node-50']).toBeDefined();
      expect(applied.nodes['node-50'].value).toBe(50);
      expect(applied.nodes['node-50'].state).toBe('default');
      expect(applied.nodes['node-50'].height).toBe(1);
      expect(applied.nodes['node-50'].balanceFactor).toBe(0);
      expect(applied.activeNodeId).toBeNull();
      expect(applied.targetValue).toBeNull();
    });
  });

  describe('BST Operations', () => {
    it('should insert root and children correctly into BST', () => {
      let state = createInitialTreeState();

      // Inserir raiz 50
      const res1 = executeTreeOperation(state, { type: 'insert', value: 50 }, 'bst');
      state = res1.finalState;
      expect(state.rootId).toBe('node-50');

      // Inserir filho esquerdo 30
      const res2 = executeTreeOperation(state, { type: 'insert', value: 30 }, 'bst');
      state = res2.finalState;
      expect(state.nodes['node-50'].leftId).toBe('node-30');
      expect(state.nodes['node-30'].value).toBe(30);

      // Inserir filho direito 70
      const res3 = executeTreeOperation(state, { type: 'insert', value: 70 }, 'bst');
      state = res3.finalState;
      expect(state.nodes['node-50'].rightId).toBe('node-70');
      expect(state.nodes['node-70'].value).toBe(70);

      expect(computeSubtreeHeight(state.nodes, state.rootId)).toBe(2);
      expect(computeBalanceFactor(state.nodes, state.rootId)).toBe(0);
    });

    it('should detect duplicate values and not insert a new node', () => {
      let state = createInitialTreeState();
      state = executeTreeOperation(state, { type: 'insert', value: 40 }, 'bst').finalState;
      state = executeTreeOperation(state, { type: 'insert', value: 20 }, 'bst').finalState;

      const nodeCountBefore = Object.keys(state.nodes).length;
      const dupResult = executeTreeOperation(state, { type: 'insert', value: 40 }, 'bst');

      expect(dupResult.summary).toContain('já existe');
      expect(Object.keys(dupResult.finalState.nodes).length).toBe(nodeCountBefore);
      expect(dupResult.events.some(e => e.type === 'highlight')).toBe(true);
    });
  });

  describe('AVL Tree Rebalancing & Step Quizzes', () => {
    it('should handle LL case (Single Right Rotation) and generate StepQuizPrompt', () => {
      let state = createInitialTreeState();
      state = executeTreeOperation(state, { type: 'insert', value: 30 }, 'avl').finalState;
      state = executeTreeOperation(state, { type: 'insert', value: 20 }, 'avl').finalState;

      // Inserir 10 causa desbalanceamento LL no nó 30
      const res = executeTreeOperation(state, { type: 'insert', value: 10 }, 'avl');
      state = res.finalState;

      // Verificar rotação e nova raiz
      expect(res.events.some(e => e.type === 'rotate' && e.direction === 'right')).toBe(true);
      expect(state.rootId).toBe('node-20');
      expect(state.nodes['node-20'].leftId).toBe('node-10');
      expect(state.nodes['node-20'].rightId).toBe('node-30');

      // Verificar quizPrompt
      expect(res.quizPrompt).toBeDefined();
      expect(res.quizPrompt?.correctIndex).toBe(0); // LL: Simples à Direita
      expect(res.quizPrompt?.options[res.quizPrompt.correctIndex]).toContain('Simples à Direita (LL)');
    });

    it('should handle RR case (Single Left Rotation) and generate StepQuizPrompt', () => {
      let state = createInitialTreeState();
      state = executeTreeOperation(state, { type: 'insert', value: 10 }, 'avl').finalState;
      state = executeTreeOperation(state, { type: 'insert', value: 20 }, 'avl').finalState;

      // Inserir 30 causa desbalanceamento RR no nó 10
      const res = executeTreeOperation(state, { type: 'insert', value: 30 }, 'avl');
      state = res.finalState;

      expect(res.events.some(e => e.type === 'rotate' && e.direction === 'left')).toBe(true);
      expect(state.rootId).toBe('node-20');
      expect(state.nodes['node-20'].leftId).toBe('node-10');
      expect(state.nodes['node-20'].rightId).toBe('node-30');

      expect(res.quizPrompt).toBeDefined();
      expect(res.quizPrompt?.correctIndex).toBe(1); // RR: Simples à Esquerda
      expect(res.quizPrompt?.options[res.quizPrompt.correctIndex]).toContain('Simples à Esquerda (RR)');
    });

    it('should handle LR case (Double Left-Right Rotation) and generate StepQuizPrompt', () => {
      let state = createInitialTreeState();
      state = executeTreeOperation(state, { type: 'insert', value: 30 }, 'avl').finalState;
      state = executeTreeOperation(state, { type: 'insert', value: 10 }, 'avl').finalState;

      // Inserir 20 causa desbalanceamento LR no nó 30
      const res = executeTreeOperation(state, { type: 'insert', value: 20 }, 'avl');
      state = res.finalState;

      const rotations = res.events.filter(e => e.type === 'rotate');
      expect(rotations.length).toBe(2);
      expect(rotations[0].type === 'rotate' && rotations[0].direction === 'left').toBe(true);
      expect(rotations[1].type === 'rotate' && rotations[1].direction === 'right').toBe(true);

      expect(state.rootId).toBe('node-20');
      expect(state.nodes['node-20'].leftId).toBe('node-10');
      expect(state.nodes['node-20'].rightId).toBe('node-30');

      expect(res.quizPrompt).toBeDefined();
      expect(res.quizPrompt?.correctIndex).toBe(2); // LR: Dupla Esquerda-Direita
      expect(res.quizPrompt?.options[res.quizPrompt.correctIndex]).toContain('Dupla Esquerda-Direita (LR)');
    });

    it('should handle RL case (Double Right-Left Rotation) and generate StepQuizPrompt', () => {
      let state = createInitialTreeState();
      state = executeTreeOperation(state, { type: 'insert', value: 10 }, 'avl').finalState;
      state = executeTreeOperation(state, { type: 'insert', value: 30 }, 'avl').finalState;

      // Inserir 20 causa desbalanceamento RL no nó 10
      const res = executeTreeOperation(state, { type: 'insert', value: 20 }, 'avl');
      state = res.finalState;

      const rotations = res.events.filter(e => e.type === 'rotate');
      expect(rotations.length).toBe(2);
      expect(rotations[0].type === 'rotate' && rotations[0].direction === 'right').toBe(true);
      expect(rotations[1].type === 'rotate' && rotations[1].direction === 'left').toBe(true);

      expect(state.rootId).toBe('node-20');
      expect(state.nodes['node-20'].leftId).toBe('node-10');
      expect(state.nodes['node-20'].rightId).toBe('node-30');

      expect(res.quizPrompt).toBeDefined();
      expect(res.quizPrompt?.correctIndex).toBe(3); // RL: Dupla Direita-Esquerda
      expect(res.quizPrompt?.options[res.quizPrompt.correctIndex]).toContain('Dupla Direita-Esquerda (RL)');
    });
  });

  describe('Red-Black Tree Invariant & Color Operations', () => {
    it('should ensure root is black and new nodes are red', () => {
      let state = createInitialTreeState();
      state = executeTreeOperation(state, { type: 'insert', value: 20 }, 'rb').finalState;
      expect(state.nodes['node-20'].color).toBe('black');

      state = executeTreeOperation(state, { type: 'insert', value: 10 }, 'rb').finalState;
      expect(state.nodes['node-10'].color).toBe('red');

      state = executeTreeOperation(state, { type: 'insert', value: 30 }, 'rb').finalState;
      expect(state.nodes['node-30'].color).toBe('red');
    });

    it('should recolor parent, uncle and grandparent when uncle is red', () => {
      let state = createInitialTreeState();
      state = executeTreeOperation(state, { type: 'insert', value: 20 }, 'rb').finalState;
      state = executeTreeOperation(state, { type: 'insert', value: 10 }, 'rb').finalState;
      state = executeTreeOperation(state, { type: 'insert', value: 30 }, 'rb').finalState;

      // Inserir 5 causa conflito vermelho-vermelho com pai 10 e tio 30 vermelho
      const res = executeTreeOperation(state, { type: 'insert', value: 5 }, 'rb');
      state = res.finalState;

      expect(state.nodes['node-10'].color).toBe('black');
      expect(state.nodes['node-30'].color).toBe('black');
      expect(state.nodes['node-20'].color).toBe('black'); // Raiz permanece preta
      expect(state.nodes['node-5'].color).toBe('red');
    });
  });

  describe('Search Operations', () => {
    it('should locate existing key and emit matched nodeState', () => {
      let state = createInitialTreeState();
      for (const val of [50, 25, 75, 10, 30]) {
        state = executeTreeOperation(state, { type: 'insert', value: val }, 'bst').finalState;
      }

      const res = executeTreeOperation(state, { type: 'search', value: 30 }, 'bst');
      expect(res.summary).toContain('encontrado na profundidade');

      const metaEvent = res.events.find(e => e.type === 'set-node-meta' && e.id === 'node-30');
      expect(metaEvent).toBeDefined();
      if (metaEvent && metaEvent.type === 'set-node-meta') {
        expect(metaEvent.nodeState).toBe('matched');
      }
    });

    it('should notify when element does not exist in tree', () => {
      let state = createInitialTreeState();
      state = executeTreeOperation(state, { type: 'insert', value: 50 }, 'bst').finalState;

      const res = executeTreeOperation(state, { type: 'search', value: 99 }, 'bst');
      expect(res.summary).toContain('não encontrado');
      expect(res.events.some(e => e.type === 'highlight')).toBe(true);
    });
  });

  describe('Delete Operations (3 Classic Cases)', () => {
    it('Case 1: should delete a leaf node without replacement', () => {
      let state = createInitialTreeState();
      state = executeTreeOperation(state, { type: 'insert', value: 50 }, 'bst').finalState;
      state = executeTreeOperation(state, { type: 'insert', value: 30 }, 'bst').finalState;
      state = executeTreeOperation(state, { type: 'insert', value: 70 }, 'bst').finalState;

      // 30 é uma folha
      const res = executeTreeOperation(state, { type: 'delete', value: 30 }, 'bst');
      state = res.finalState;

      expect(state.nodes['node-30']).toBeUndefined();
      expect(state.nodes['node-50'].leftId).toBeNull();
      expect(res.events.some(e => e.type === 'remove-node' && e.id === 'node-30')).toBe(true);
    });

    it('Case 2: should delete a node with 1 child and promote the child', () => {
      let state = createInitialTreeState();
      state = executeTreeOperation(state, { type: 'insert', value: 50 }, 'bst').finalState;
      state = executeTreeOperation(state, { type: 'insert', value: 30 }, 'bst').finalState;
      state = executeTreeOperation(state, { type: 'insert', value: 20 }, 'bst').finalState; // 30 tem apenas filho esquerdo 20

      const res = executeTreeOperation(state, { type: 'delete', value: 30 }, 'bst');
      state = res.finalState;

      expect(state.nodes['node-30']).toBeUndefined();
      expect(state.nodes['node-50'].leftId).toBe('node-20');
      expect(res.events.some(e => e.type === 'remove-node' && e.id === 'node-30' && e.replacementId === 'node-20')).toBe(true);
    });

    it('Case 3: should delete a node with 2 children using in-order successor and generate quizPrompt', () => {
      let state = createInitialTreeState();
      // Árvore: 50 com filhos 30 e 70; 70 com filhos 60 e 80
      for (const val of [50, 30, 70, 60, 80]) {
        state = executeTreeOperation(state, { type: 'insert', value: val }, 'bst').finalState;
      }

      // Remover 50 (tem 2 filhos: 30 e 70, com 70 tendo filho esquerdo 60). Sucessor em-ordem é 60.
      const res = executeTreeOperation(state, { type: 'delete', value: 50 }, 'bst');
      state = res.finalState;

      expect(res.quizPrompt).toBeDefined();
      expect(res.quizPrompt?.question).toContain('qual nó assumirá seu valor');
      expect(res.quizPrompt?.correctIndex).toBe(0);
      expect(res.quizPrompt?.options[0]).toContain('60');

      // O nó raiz original teve seu valor atualizado para 60 e o nó 'node-60' foi removido
      expect(state.nodes[state.rootId!].value).toBe(60);
      expect(state.nodes['node-60']).toBeUndefined();
      expect(state.nodes[state.rootId!].leftId).toBe('node-30');
    });

    it('should rebalance AVL tree after deletion if unbalanced', () => {
      let state = createInitialTreeState();
      // Criar árvore AVL balanceada: 20, 10, 30, 40
      for (const val of [20, 10, 30, 40]) {
        state = executeTreeOperation(state, { type: 'insert', value: val }, 'avl').finalState;
      }

      // Removendo 10 deixa o nó 20 desbalanceado (BF = -2)
      const res = executeTreeOperation(state, { type: 'delete', value: 10 }, 'avl');
      state = res.finalState;

      expect(res.events.some(e => e.type === 'rotate')).toBe(true);
      expect(Math.abs(computeBalanceFactor(state.nodes, state.rootId))).toBeLessThanOrEqual(1);
    });
  });

  describe('Manual Rotations', () => {
    it('should execute manual left rotation on valid pivot', () => {
      let state = createInitialTreeState();
      state = executeTreeOperation(state, { type: 'insert', value: 20 }, 'bst').finalState;
      state = executeTreeOperation(state, { type: 'insert', value: 30 }, 'bst').finalState;

      const res = executeTreeOperation(state, { type: 'rotate-left', value: 20 }, 'bst');
      state = res.finalState;

      expect(state.rootId).toBe('node-30');
      expect(state.nodes['node-30'].leftId).toBe('node-20');
      expect(state.nodes['node-20'].rightId).toBeNull();
    });

    it('should reject left rotation when right child does not exist', () => {
      let state = createInitialTreeState();
      state = executeTreeOperation(state, { type: 'insert', value: 50 }, 'bst').finalState;

      const res = executeTreeOperation(state, { type: 'rotate-left', value: 50 }, 'bst');
      expect(res.summary).toContain('impossível');
      expect(res.finalState.rootId).toBe('node-50');
    });

    it('should execute manual right rotation on valid pivot', () => {
      let state = createInitialTreeState();
      state = executeTreeOperation(state, { type: 'insert', value: 30 }, 'bst').finalState;
      state = executeTreeOperation(state, { type: 'insert', value: 20 }, 'bst').finalState;

      const res = executeTreeOperation(state, { type: 'rotate-right', value: 30 }, 'bst');
      state = res.finalState;

      expect(state.rootId).toBe('node-20');
      expect(state.nodes['node-20'].rightId).toBe('node-30');
      expect(state.nodes['node-30'].leftId).toBeNull();
    });
  });

  describe('Tree Traversals', () => {
    const treeValues = [50, 30, 70, 20, 40, 60, 80];

    function buildTree(): TreeState {
      let state = createInitialTreeState();
      for (const val of treeValues) {
        state = executeTreeOperation(state, { type: 'insert', value: val }, 'bst').finalState;
      }
      return state;
    }

    it('should traverse in-order returning strictly sorted keys', () => {
      const state = buildTree();
      const res = executeTreeOperation(state, { type: 'traverse', traversalOrder: 'in-order' }, 'bst');

      const lastTraversalEvent = [...res.events].reverse().find(e => e.type === 'traversal-output');
      expect(lastTraversalEvent).toBeDefined();
      if (lastTraversalEvent && lastTraversalEvent.type === 'traversal-output') {
        expect(lastTraversalEvent.values).toEqual([20, 30, 40, 50, 60, 70, 80]);
      }
    });

    it('should traverse pre-order with root before children', () => {
      const state = buildTree();
      const res = executeTreeOperation(state, { type: 'traverse', traversalOrder: 'pre-order' }, 'bst');

      const lastTraversalEvent = [...res.events].reverse().find(e => e.type === 'traversal-output');
      expect(lastTraversalEvent).toBeDefined();
      if (lastTraversalEvent && lastTraversalEvent.type === 'traversal-output') {
        expect(lastTraversalEvent.values).toEqual([50, 30, 20, 40, 70, 60, 80]);
      }
    });

    it('should traverse post-order with children before root', () => {
      const state = buildTree();
      const res = executeTreeOperation(state, { type: 'traverse', traversalOrder: 'post-order' }, 'bst');

      const lastTraversalEvent = [...res.events].reverse().find(e => e.type === 'traversal-output');
      expect(lastTraversalEvent).toBeDefined();
      if (lastTraversalEvent && lastTraversalEvent.type === 'traversal-output') {
        expect(lastTraversalEvent.values).toEqual([20, 40, 30, 60, 80, 70, 50]);
      }
    });

    it('should traverse BFS level by level', () => {
      const state = buildTree();
      const res = executeTreeOperation(state, { type: 'traverse', traversalOrder: 'bfs' }, 'bst');

      const lastTraversalEvent = [...res.events].reverse().find(e => e.type === 'traversal-output');
      expect(lastTraversalEvent).toBeDefined();
      if (lastTraversalEvent && lastTraversalEvent.type === 'traversal-output') {
        expect(lastTraversalEvent.values).toEqual([50, 30, 70, 20, 40, 60, 80]);
      }
    });
  });

  describe('generateTreeBatchComparisonEvents (Arena Comparison)', () => {
    it('should generate continuous batch events for BST, AVL and Red-Black', () => {
      const values = [50, 20, 80, 10, 30];
      const searchTargets = [30, 99];
      const deleteTargets = [10];

      const bstEvents = generateTreeBatchComparisonEvents(values, 'bst', searchTargets, deleteTargets);
      expect(bstEvents.length).toBeGreaterThan(values.length);

      const avlEvents = generateTreeBatchComparisonEvents(values, 'avl', searchTargets, deleteTargets);
      expect(avlEvents.length).toBeGreaterThan(values.length);

      const rbEvents = generateTreeBatchComparisonEvents(values, 'rb', searchTargets, deleteTargets);
      expect(rbEvents.length).toBeGreaterThan(values.length);

      // Cada um deve ter eventos com narração descritiva em português
      for (const ev of [...bstEvents, ...avlEvents, ...rbEvents]) {
        expect(ev.narration).toBeDefined();
        expect(ev.narration.length).toBeGreaterThan(0);
      }
    });
  });
});
