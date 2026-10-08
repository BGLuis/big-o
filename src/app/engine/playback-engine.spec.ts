import { describe, it, expect } from 'vitest';
import { PlaybackEngine } from './playback-engine';
import { BaseEvent } from './events';

interface TestCounterState {
  count: number;
  history: string[];
}

interface TestCounterEvent extends BaseEvent {
  type: 'increment' | 'double';
  amount?: number;
}

describe('PlaybackEngine', () => {
  const reducer = (state: TestCounterState, event: TestCounterEvent): TestCounterState => {
    if (event.type === 'increment') {
      return {
        count: state.count + (event.amount ?? 1),
        history: [...state.history, `+${event.amount ?? 1}`]
      };
    } else {
      return {
        count: state.count * 2,
        history: [...state.history, '*2']
      };
    }
  };

  const createEvents = (count: number): TestCounterEvent[] => {
    const events: TestCounterEvent[] = [];
    for (let i = 1; i <= count; i++) {
      if (i % 5 === 0) {
        events.push({
          type: 'double',
          narration: `Passo ${i}: Dobrando o contador`,
          pseudoCodeLine: 2
        });
      } else {
        events.push({
          type: 'increment',
          amount: 1,
          narration: `Passo ${i}: Incrementando em 1`,
          pseudoCodeLine: 1
        });
      }
    }
    return events;
  };

  it('should initialize with initial state and correct step index', () => {
    const events = createEvents(10);
    const engine = new PlaybackEngine({
      initialState: { count: 0, history: [] },
      events,
      reducer,
      checkpointInterval: 4
    });

    expect(engine.currentStepIndex()).toBe(0);
    expect(engine.currentState().count).toBe(0);
    expect(engine.totalSteps()).toBe(10);
    expect(engine.canStepForward()).toBe(true);
    expect(engine.canStepBackward()).toBe(false);
    expect(engine.currentEvent()).toBeNull();
  });

  it('should step forward correctly and update signals', () => {
    const events = createEvents(5);
    const engine = new PlaybackEngine({
      initialState: { count: 0, history: [] },
      events,
      reducer
    });

    expect(engine.stepForward()).toBe(true);
    expect(engine.currentStepIndex()).toBe(1);
    expect(engine.currentState().count).toBe(1);
    expect(engine.currentEvent()?.narration).toBe('Passo 1: Incrementando em 1');
    expect(engine.canStepBackward()).toBe(true);
  });

  it('should guarantee replay from checkpoint produces identical state to sequential stepping', () => {
    const events = createEvents(80);
    const checkpointInterval = 8;

    // Engine A: sequential step-by-step
    const engineSeq = new PlaybackEngine({
      initialState: { count: 0, history: [] },
      events,
      reducer,
      checkpointInterval
    });

    for (let i = 0; i < 65; i++) {
      engineSeq.stepForward();
    }
    const sequentialState = engineSeq.currentState();

    // Engine B: arbitrary jump to step 65
    const engineJump = new PlaybackEngine({
      initialState: { count: 0, history: [] },
      events,
      reducer,
      checkpointInterval
    });

    engineJump.goToStep(65);
    const jumpedState = engineJump.currentState();

    expect(jumpedState.count).toBe(sequentialState.count);
    expect(jumpedState.history).toEqual(sequentialState.history);
  });

  it('should step backward correctly', () => {
    const events = createEvents(10);
    const engine = new PlaybackEngine({
      initialState: { count: 0, history: [] },
      events,
      reducer
    });

    engine.stepForward();
    engine.stepForward();
    expect(engine.currentStepIndex()).toBe(2);
    expect(engine.currentState().count).toBe(2);

    engine.stepBackward();
    expect(engine.currentStepIndex()).toBe(1);
    expect(engine.currentState().count).toBe(1);
  });

  it('should handle boundaries properly', () => {
    const events = createEvents(2);
    const engine = new PlaybackEngine({
      initialState: { count: 0, history: [] },
      events,
      reducer
    });

    expect(engine.stepBackward()).toBe(false);

    engine.stepForward();
    engine.stepForward();
    expect(engine.status()).toBe('completed');
    expect(engine.canStepForward()).toBe(false);
    expect(engine.stepForward()).toBe(false);
  });

  it('should trigger onStep callback when advancing steps', () => {
    let callbackCount = 0;
    let lastStep = -1;

    const events = createEvents(5);
    const engine = new PlaybackEngine({
      initialState: { count: 0, history: [] },
      events,
      reducer,
      onStep: (step) => {
        callbackCount++;
        lastStep = step;
      }
    });

    engine.stepForward();
    expect(callbackCount).toBe(1);
    expect(lastStep).toBe(1);

    engine.goToStep(4);
    expect(callbackCount).toBe(2);
    expect(lastStep).toBe(4);
  });

  it('should automatically advance steps during play() loop', async () => {
    const events = createEvents(6);
    const engine = new PlaybackEngine({
      initialState: { count: 0, history: [] },
      events,
      reducer
    });

    // Make clock very fast for unit testing
    engine.clock.setBaseDuration(20);
    engine.setSpeed(1);

    expect(engine.isPlaying()).toBe(false);

    // Start playing in background
    const playPromise = engine.play();
    expect(engine.isPlaying()).toBe(true);

    // Wait a short while so multiple steps advance automatically
    await new Promise((resolve) => setTimeout(resolve, 80));

    expect(engine.currentStepIndex()).toBeGreaterThanOrEqual(2);
    expect(engine.currentState().count).toBeGreaterThanOrEqual(2);

    engine.pause();
    expect(engine.isPlaying()).toBe(false);
    await playPromise;
  });
});
