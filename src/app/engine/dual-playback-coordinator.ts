import { signal, computed } from '@angular/core';
import { BaseEvent } from './events';
import { PlaybackStatus } from './engine.types';
import { AnimationClock } from './animation-clock';
import { PlaybackEngine } from './playback-engine';

export interface DualPlaybackOptions<
  TStateA,
  TEventA extends BaseEvent,
  TStateB,
  TEventB extends BaseEvent
> {
  readonly leftEngine: PlaybackEngine<TStateA, TEventA>;
  readonly rightEngine: PlaybackEngine<TStateB, TEventB>;
  readonly clock?: AnimationClock;
  readonly onStep?: () => void;
}

export class DualPlaybackCoordinator<
  TStateA,
  TEventA extends BaseEvent,
  TStateB,
  TEventB extends BaseEvent
> {
  public readonly leftEngine: PlaybackEngine<TStateA, TEventA>;
  public readonly rightEngine: PlaybackEngine<TStateB, TEventB>;
  public readonly clock: AnimationClock;

  private readonly onStepCallback?: () => void;
  private playLoopRunning = false;

  public readonly status = signal<PlaybackStatus>('idle');
  public readonly currentStepIndex = signal<number>(0);
  public readonly speed = signal<number>(1);

  public readonly isPlaying = computed<boolean>(() => this.status() === 'playing');
  public readonly maxSteps = computed<number>(() =>
    Math.max(this.leftEngine.totalSteps(), this.rightEngine.totalSteps())
  );
  public readonly canStepForward = computed<boolean>(
    () => this.currentStepIndex() < this.maxSteps()
  );
  public readonly canStepBackward = computed<boolean>(
    () => this.currentStepIndex() > 0
  );
  public readonly progressPercent = computed<number>(() => {
    const max = this.maxSteps();
    return max <= 0 ? 0 : Math.min(100, Math.round((this.currentStepIndex() / max) * 100));
  });

  constructor(options: DualPlaybackOptions<TStateA, TEventA, TStateB, TEventB>) {
    this.leftEngine = options.leftEngine;
    this.rightEngine = options.rightEngine;
    this.clock = options.clock ?? new AnimationClock();
    this.onStepCallback = options.onStep;
  }

  public stepForward(): boolean {
    const max = this.maxSteps();
    const current = this.currentStepIndex();

    if (current >= max) {
      this.status.set('completed');
      return false;
    }

    const next = current + 1;
    this.leftEngine.goToStep(Math.min(next, this.leftEngine.totalSteps()));
    this.rightEngine.goToStep(Math.min(next, this.rightEngine.totalSteps()));

    this.currentStepIndex.set(next);

    if (next >= max) {
      this.status.set('completed');
    }

    this.onStepCallback?.();
    return true;
  }

  public stepBackward(): boolean {
    const prev = this.currentStepIndex() - 1;
    if (prev < 0) {
      return false;
    }
    this.goToStep(prev);
    return true;
  }

  public goToStep(targetStep: number): void {
    const max = this.maxSteps();
    const clamped = Math.max(0, Math.min(targetStep, max));
    this.clock.cancelAll();

    this.leftEngine.goToStep(Math.min(clamped, this.leftEngine.totalSteps()));
    this.rightEngine.goToStep(Math.min(clamped, this.rightEngine.totalSteps()));

    this.currentStepIndex.set(clamped);

    if (clamped >= max && max > 0) {
      this.status.set('completed');
    } else if (this.status() === 'completed') {
      this.status.set('paused');
    }

    this.onStepCallback?.();
  }

  public async play(): Promise<void> {
    const max = this.maxSteps();
    if (max === 0) {
      this.status.set('completed');
      return;
    }

    if (this.currentStepIndex() >= max) {
      this.goToStep(0);
    }

    this.status.set('playing');
    this.playLoopRunning = true;

    while (this.playLoopRunning && this.status() === 'playing') {
      const moved = this.stepForward();
      if (!moved) {
        break;
      }
      await this.clock.waitForStep();
    }

    this.playLoopRunning = false;
    if (this.currentStepIndex() >= this.maxSteps()) {
      this.status.set('completed');
    }
  }

  public pause(): void {
    this.playLoopRunning = false;
    if (this.status() === 'playing') {
      this.status.set('paused');
    }
  }

  public togglePlay(): void {
    if (this.status() === 'playing') {
      this.pause();
    } else {
      void this.play();
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
    this.leftEngine.setSpeed(multiplier);
    this.rightEngine.setSpeed(multiplier);
  }

  public destroy(): void {
    this.pause();
    this.clock.destroy();
  }
}
