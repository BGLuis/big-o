import { describe, it, expect, vi } from 'vitest';
import { BaseEvent } from './events';
import { PlaybackEngine } from './playback-engine';
import { DualPlaybackCoordinator } from './dual-playback-coordinator';
import { computeTelemetry, computeTreeHeight } from './telemetry-tracker';
import { TreeState, TreeNode } from '../families/hierarchical/tree-state';
import { LinearState } from '../families/linear/linear-state';

interface SimpleState {
  count: number;
}

interface TestEvent extends BaseEvent {
  type: string;
  amount?: number;
}

describe('DualPlaybackCoordinator & TelemetryTracker', () => {
  const simpleReducer = (state: SimpleState, event: TestEvent): SimpleState => {
    return { count: state.count + (event.amount ?? 1) };
  };

  const createEvents = (prefix: string, count: number): TestEvent[] => {
    const list: TestEvent[] = [];
    for (let i = 1; i <= count; i++) {
      list.push({
        type: 'step',
        narration: `${prefix} step ${i}`,
        amount: 1
      });
    }
    return list;
  };

  describe('DualPlaybackCoordinator', () => {
    it('should initialize signals with correct default values', () => {
      const leftEngine = new PlaybackEngine({
        initialState: { count: 0 },
        events: createEvents('L', 3),
        reducer: simpleReducer
      });
      const rightEngine = new PlaybackEngine({
        initialState: { count: 0 },
        events: createEvents('R', 6),
        reducer: simpleReducer
      });

      const coordinator = new DualPlaybackCoordinator({ leftEngine, rightEngine });

      expect(coordinator.status()).toBe('idle');
      expect(coordinator.currentStepIndex()).toBe(0);
      expect(coordinator.speed()).toBe(1);
      expect(coordinator.isPlaying()).toBe(false);
      expect(coordinator.maxSteps()).toBe(6);
      expect(coordinator.canStepForward()).toBe(true);
      expect(coordinator.canStepBackward()).toBe(false);
      expect(coordinator.progressPercent()).toBe(0);
    });

    it('should synchronize stepForward across engines with different step counts', () => {
      const leftEngine = new PlaybackEngine({
        initialState: { count: 0 },
        events: createEvents('L', 3),
        reducer: simpleReducer
      });
      const rightEngine = new PlaybackEngine({
        initialState: { count: 0 },
        events: createEvents('R', 5),
        reducer: simpleReducer
      });

      const coordinator = new DualPlaybackCoordinator({ leftEngine, rightEngine });

      // Step 1
      expect(coordinator.stepForward()).toBe(true);
      expect(coordinator.currentStepIndex()).toBe(1);
      expect(leftEngine.currentStepIndex()).toBe(1);
      expect(rightEngine.currentStepIndex()).toBe(1);
      expect(coordinator.progressPercent()).toBe(20);

      // Step 2 & 3
      coordinator.stepForward();
      coordinator.stepForward();
      expect(coordinator.currentStepIndex()).toBe(3);
      expect(leftEngine.currentStepIndex()).toBe(3);
      expect(rightEngine.currentStepIndex()).toBe(3);

      // Step 4: Left engine is clamped at its total (3), right advances to 4
      coordinator.stepForward();
      expect(coordinator.currentStepIndex()).toBe(4);
      expect(leftEngine.currentStepIndex()).toBe(3);
      expect(rightEngine.currentStepIndex()).toBe(4);

      // Step 5: Final step
      coordinator.stepForward();
      expect(coordinator.currentStepIndex()).toBe(5);
      expect(leftEngine.currentStepIndex()).toBe(3);
      expect(rightEngine.currentStepIndex()).toBe(5);
      expect(coordinator.status()).toBe('completed');
      expect(coordinator.canStepForward()).toBe(false);

      // Stepping beyond max returns false
      expect(coordinator.stepForward()).toBe(false);
    });

    it('should handle stepBackward correctly', () => {
      const leftEngine = new PlaybackEngine({
        initialState: { count: 0 },
        events: createEvents('L', 2),
        reducer: simpleReducer
      });
      const rightEngine = new PlaybackEngine({
        initialState: { count: 0 },
        events: createEvents('R', 4),
        reducer: simpleReducer
      });

      const coordinator = new DualPlaybackCoordinator({ leftEngine, rightEngine });
      expect(coordinator.stepBackward()).toBe(false);

      coordinator.goToStep(4);
      expect(coordinator.currentStepIndex()).toBe(4);
      expect(leftEngine.currentStepIndex()).toBe(2);
      expect(rightEngine.currentStepIndex()).toBe(4);

      expect(coordinator.stepBackward()).toBe(true);
      expect(coordinator.currentStepIndex()).toBe(3);
      expect(leftEngine.currentStepIndex()).toBe(2);
      expect(rightEngine.currentStepIndex()).toBe(3);

      coordinator.stepBackward(); // to 2
      expect(coordinator.currentStepIndex()).toBe(2);
      expect(leftEngine.currentStepIndex()).toBe(2);
      expect(rightEngine.currentStepIndex()).toBe(2);

      coordinator.stepBackward(); // to 1
      expect(coordinator.currentStepIndex()).toBe(1);
      expect(leftEngine.currentStepIndex()).toBe(1);
      expect(rightEngine.currentStepIndex()).toBe(1);
    });

    it('should jump to arbitrary steps with goToStep and trigger onStep callback', () => {
      let stepCallbackCalled = false;
      const leftEngine = new PlaybackEngine({
        initialState: { count: 0 },
        events: createEvents('L', 5),
        reducer: simpleReducer
      });
      const rightEngine = new PlaybackEngine({
        initialState: { count: 0 },
        events: createEvents('R', 10),
        reducer: simpleReducer
      });

      const coordinator = new DualPlaybackCoordinator({
        leftEngine,
        rightEngine,
        onStep: () => {
          stepCallbackCalled = true;
        }
      });

      coordinator.goToStep(7);
      expect(stepCallbackCalled).toBe(true);
      expect(coordinator.currentStepIndex()).toBe(7);
      expect(leftEngine.currentStepIndex()).toBe(5);
      expect(rightEngine.currentStepIndex()).toBe(7);

      // Clamp target within [0, maxSteps]
      coordinator.goToStep(999);
      expect(coordinator.currentStepIndex()).toBe(10);
      expect(coordinator.status()).toBe('completed');

      coordinator.goToStep(-5);
      expect(coordinator.currentStepIndex()).toBe(0);
      expect(leftEngine.currentStepIndex()).toBe(0);
      expect(rightEngine.currentStepIndex()).toBe(0);
    });

    it('should reset properly to initial state', () => {
      const leftEngine = new PlaybackEngine({
        initialState: { count: 0 },
        events: createEvents('L', 4),
        reducer: simpleReducer
      });
      const rightEngine = new PlaybackEngine({
        initialState: { count: 0 },
        events: createEvents('R', 4),
        reducer: simpleReducer
      });

      const coordinator = new DualPlaybackCoordinator({ leftEngine, rightEngine });
      coordinator.goToStep(3);
      expect(coordinator.currentStepIndex()).toBe(3);

      coordinator.reset();
      expect(coordinator.currentStepIndex()).toBe(0);
      expect(coordinator.status()).toBe('idle');
      expect(leftEngine.currentStepIndex()).toBe(0);
      expect(rightEngine.currentStepIndex()).toBe(0);
    });

    it('should synchronize speed across engines', () => {
      const leftEngine = new PlaybackEngine({
        initialState: { count: 0 },
        events: createEvents('L', 2),
        reducer: simpleReducer
      });
      const rightEngine = new PlaybackEngine({
        initialState: { count: 0 },
        events: createEvents('R', 2),
        reducer: simpleReducer
      });

      const coordinator = new DualPlaybackCoordinator({ leftEngine, rightEngine });
      coordinator.setSpeed(2.5);

      expect(coordinator.speed()).toBe(2.5);
      expect(leftEngine.speed()).toBe(2.5);
      expect(rightEngine.speed()).toBe(2.5);
    });

    it('should toggle play and pause', () => {
      const leftEngine = new PlaybackEngine({
        initialState: { count: 0 },
        events: createEvents('L', 2),
        reducer: simpleReducer
      });
      const rightEngine = new PlaybackEngine({
        initialState: { count: 0 },
        events: createEvents('R', 2),
        reducer: simpleReducer
      });

      const coordinator = new DualPlaybackCoordinator({ leftEngine, rightEngine });
      coordinator.status.set('playing');

      coordinator.togglePlay();
      expect(coordinator.status()).toBe('paused');
    });
  });

  describe('Telemetry Tracker', () => {
    it('should correctly calculate tree height and protect against cycles', () => {
      const emptyTree: TreeState = {
        rootId: null,
        nodes: {},
        activeNodeId: null,
        targetValue: null
      };
      expect(computeTreeHeight(emptyTree)).toBe(0);

      const singleNodeTree: TreeState = {
        rootId: 'node-1',
        nodes: {
          'node-1': { id: 'node-1', value: 10, leftId: null, rightId: null, state: 'default' }
        },
        activeNodeId: null,
        targetValue: null
      };
      expect(computeTreeHeight(singleNodeTree)).toBe(1);

      const balancedTree: TreeState = {
        rootId: 'node-2',
        nodes: {
          'node-2': { id: 'node-2', value: 20, leftId: 'node-1', rightId: 'node-3', state: 'default' },
          'node-1': { id: 'node-1', value: 10, leftId: null, rightId: null, state: 'default' },
          'node-3': { id: 'node-3', value: 30, leftId: null, rightId: null, state: 'default' }
        },
        activeNodeId: null,
        targetValue: null
      };
      expect(computeTreeHeight(balancedTree)).toBe(2);

      // Degenerate tree (linked list)
      const degenerateTree: TreeState = {
        rootId: 'node-1',
        nodes: {
          'node-1': { id: 'node-1', value: 10, leftId: null, rightId: 'node-2', state: 'default' },
          'node-2': { id: 'node-2', value: 20, leftId: null, rightId: 'node-3', state: 'default' },
          'node-3': { id: 'node-3', value: 30, leftId: null, rightId: null, state: 'default' }
        },
        activeNodeId: null,
        targetValue: null
      };
      expect(computeTreeHeight(degenerateTree)).toBe(3);

      // Cyclic tree (node-2 points back to node-1)
      const cyclicTree: TreeState = {
        rootId: 'node-1',
        nodes: {
          'node-1': { id: 'node-1', value: 10, leftId: null, rightId: 'node-2', state: 'default' },
          'node-2': { id: 'node-2', value: 20, leftId: 'node-1', rightId: null, state: 'default' }
        },
        activeNodeId: null,
        targetValue: null
      };
      // Should not throw and should terminate cleanly
      expect(computeTreeHeight(cyclicTree)).toBe(2);
    });

    it('should compute telemetry metrics accurately from event list', () => {
      const events: BaseEvent[] = [
        { type: 'compare', narration: 'Compare A with B' } as unknown as BaseEvent,
        { type: 'swap', narration: 'Swap A with B' } as unknown as BaseEvent,
        { type: 'compare', narration: 'Compare B with C' } as unknown as BaseEvent,
        { type: 'insert', narration: 'Insert element' } as unknown as BaseEvent,
        { type: 'set-aux', narration: 'Set auxiliary array' } as unknown as BaseEvent,
        { type: 'hash-calc', narration: 'Calculate hash key' } as unknown as BaseEvent,
        { type: 'rotate', narration: 'Rotate left' } as unknown as BaseEvent
      ];

      const linearState: LinearState = {
        elements: [
          { id: '1', value: 10, state: 'normal' },
          { id: '2', value: 20, state: 'normal' },
          { id: '3', value: 30, state: 'normal' }
        ],
        scope: null,
        pivotId: null,
        pivot2Id: null,
        auxTitle: null,
        auxElements: []
      };

      // Full slice analysis (step = 7)
      const fullTelemetry = computeTelemetry(events, 7, linearState, 'linear');
      expect(fullTelemetry.comparisons).toBe(2);
      expect(fullTelemetry.swapsOrMutations).toBe(3); // swap, insert, rotate
      expect(fullTelemetry.auxiliaryOps).toBe(2); // set-aux, hash-calc
      expect(fullTelemetry.structuralDepthOrSize).toBe(3);
      expect(fullTelemetry.structuralLabel).toBe('Elementos (N)');
      expect(fullTelemetry.currentStep).toBe(7);
      expect(fullTelemetry.totalSteps).toBe(7);
      expect(fullTelemetry.isCompleted).toBe(true);

      // Partial slice analysis (step = 3)
      const partialTelemetry = computeTelemetry(events, 3, linearState, 'linear');
      expect(partialTelemetry.comparisons).toBe(2);
      expect(partialTelemetry.swapsOrMutations).toBe(1); // swap only
      expect(partialTelemetry.auxiliaryOps).toBe(0);
      expect(partialTelemetry.currentStep).toBe(3);
      expect(partialTelemetry.isCompleted).toBe(false);
    });

    it('should support hierarchical and other families in computeTelemetry', () => {
      const treeState: TreeState = {
        rootId: 'root',
        nodes: {
          root: { id: 'root', value: 50, leftId: 'l1', rightId: null, state: 'default' },
          l1: { id: 'l1', value: 25, leftId: null, rightId: null, state: 'default' }
        },
        activeNodeId: null,
        targetValue: null
      };

      const hierarchicalTelemetry = computeTelemetry([], 0, treeState, 'hierarchical');
      expect(hierarchicalTelemetry.structuralDepthOrSize).toBe(2);
      expect(hierarchicalTelemetry.structuralLabel).toBe('Altura da Árvore');
      expect(hierarchicalTelemetry.isCompleted).toBe(false);

      const otherTelemetry = computeTelemetry([], 0, {}, 'other');
      expect(otherTelemetry.structuralDepthOrSize).toBe(0);
      expect(otherTelemetry.structuralLabel).toBe('Operações');
    });
  });
});
