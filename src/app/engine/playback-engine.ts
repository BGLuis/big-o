import { signal, computed, Signal } from '@angular/core';
import { BaseEvent } from './events';
import { PlaybackStatus, StateReducer } from './engine.types';
import { AnimationClock } from './animation-clock';

export interface PlaybackEngineOptions<TState, TEvent extends BaseEvent> {
  readonly initialState: TState;
  readonly events: readonly TEvent[];
  readonly reducer: StateReducer<TState, TEvent>;
  readonly checkpointInterval?: number;
  readonly cloneState?: (state: TState) => TState;
  readonly clock?: AnimationClock;
  readonly onStep?: (stepIndex: number, event: TEvent | null, state: TState) => void;
}

export class PlaybackEngine<TState, TEvent extends BaseEvent> {
  private readonly events: readonly TEvent[];
  private readonly reducer: StateReducer<TState, TEvent>;
  private readonly checkpointInterval: number;
  private readonly cloneState: (state: TState) => TState;
  private readonly onStepCallback?: (stepIndex: number, event: TEvent | null, state: TState) => void;
  public readonly clock: AnimationClock;

  private readonly checkpoints = new Map<number, TState>();
  private playLoopRunning = false;
  private playSessionId = 0;

  public readonly status = signal<PlaybackStatus>('idle');
  public readonly currentStepIndex = signal<number>(0);
  public readonly currentState = signal<TState>(null as unknown as TState);
  public readonly speed = signal<number>(1);

  public readonly isPlaying = computed<boolean>(() => this.status() === 'playing');
  public readonly totalSteps = computed<number>(() => this.events.length);

  public readonly currentEvent = computed<TEvent | null>(() => {
    const idx = this.currentStepIndex();
    if (idx <= 0 || idx > this.events.length) {
      return null;
    }
    return this.events[idx - 1] ?? null;
  });

  public readonly canStepForward = computed<boolean>(() => {
    return this.currentStepIndex() < this.totalSteps();
  });

  public readonly canStepBackward = computed<boolean>(() => {
    return this.currentStepIndex() > 0;
  });

  constructor(options: PlaybackEngineOptions<TState, TEvent>) {
    this.events = options.events;
    this.reducer = options.reducer;
    this.checkpointInterval = Math.max(1, options.checkpointInterval ?? 64);
    this.cloneState =
      options.cloneState ??
      ((s: TState) => (typeof structuredClone === 'function' ? structuredClone(s) : JSON.parse(JSON.stringify(s))));
    this.clock = options.clock ?? new AnimationClock();
    this.onStepCallback = options.onStep;

    const initial = this.cloneState(options.initialState);
    this.checkpoints.set(0, this.cloneState(initial));
    this.currentState.set(initial);
  }

  public stepForward(): boolean {
    const nextIndex = this.currentStepIndex() + 1;
    if (nextIndex > this.events.length) {
      this.status.set('completed');
      return false;
    }

    const event = this.events[nextIndex - 1];
    const nextState = this.reducer(this.currentState(), event);

    if (nextIndex % this.checkpointInterval === 0 && !this.checkpoints.has(nextIndex)) {
      this.checkpoints.set(nextIndex, this.cloneState(nextState));
    }

    this.currentState.set(nextState);
    this.currentStepIndex.set(nextIndex);

    if (nextIndex === this.events.length) {
      this.status.set('completed');
    }

    this.notifyStep();
    return true;
  }

  public stepBackward(): boolean {
    const prevIndex = this.currentStepIndex() - 1;
    if (prevIndex < 0) {
      return false;
    }
    this.goToStep(prevIndex);
    return true;
  }

  public goToStep(targetStep: number): void {
    this.playSessionId++;
    const clampedTarget = Math.max(0, Math.min(targetStep, this.events.length));
    this.clock.cancelAll();

    // Find closest checkpoint <= clampedTarget
    let checkpointStep = 0;
    for (let s = clampedTarget - (clampedTarget % this.checkpointInterval); s >= 0; s -= this.checkpointInterval) {
      if (this.checkpoints.has(s)) {
        checkpointStep = s;
        break;
      }
    }

    let state = this.cloneState(this.checkpoints.get(checkpointStep)!);

    // Fast-replay deltas from checkpointStep to clampedTarget
    for (let i = checkpointStep; i < clampedTarget; i++) {
      const event = this.events[i];
      state = this.reducer(state, event);
      const currentStep = i + 1;
      if (currentStep % this.checkpointInterval === 0 && !this.checkpoints.has(currentStep)) {
        this.checkpoints.set(currentStep, this.cloneState(state));
      }
    }

    this.currentState.set(state);
    this.currentStepIndex.set(clampedTarget);

    if (clampedTarget === this.events.length) {
      this.status.set('completed');
    } else if (this.status() === 'completed') {
      this.status.set('paused');
    }

    this.notifyStep();
  }

  public async play(): Promise<void> {
    if (this.currentStepIndex() >= this.events.length) {
      this.goToStep(0);
    }

    this.status.set('playing');
    this.playLoopRunning = true;
    const sessionId = ++this.playSessionId;

    while (this.playLoopRunning && this.status() === 'playing' && this.playSessionId === sessionId) {
      const moved = this.stepForward();
      if (!moved) {
        break;
      }
      await this.clock.waitForStep();
      if (this.playSessionId !== sessionId || !this.playLoopRunning || this.status() !== 'playing') {
        break;
      }
    }

    if (this.playSessionId === sessionId) {
      this.playLoopRunning = false;
      if (this.currentStepIndex() >= this.events.length) {
        this.status.set('completed');
      }
    }
  }

  public pause(): void {
    this.playSessionId++;
    this.playLoopRunning = false;
    this.clock.cancelPendingStep();
    if (this.status() === 'playing') {
      this.status.set('paused');
    }
  }

  public togglePlay(): void {
    if (this.status() === 'playing') {
      this.pause();
    } else {
      this.play();
    }
  }

  public reset(): void {
    this.pause();
    this.goToStep(0);
    this.status.set('idle');
  }

  public setSpeed(multiplier: number): void {
    this.speed.set(multiplier);
    this.clock.setSpeed(multiplier);
  }

  private notifyStep(): void {
    if (this.onStepCallback) {
      this.onStepCallback(this.currentStepIndex(), this.currentEvent(), this.currentState());
    }
  }

  public destroy(): void {
    this.playSessionId++;
    this.pause();
    this.clock.destroy();
  }
}
