export interface BoundingBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export type LayoutFunction<TState> = (
  state: TState,
  containerWidth: number,
  containerHeight: number
) => Map<string, BoundingBox>;

export type PlaybackStatus = 'idle' | 'playing' | 'paused' | 'completed';

export type StateReducer<TState, TEvent> = (state: TState, event: TEvent) => TState;
