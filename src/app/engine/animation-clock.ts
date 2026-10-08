export class AnimationClock {
  private activeAnimations: Set<Animation> = new Set();
  private baseDurationMs: number = 600;
  private speedMultiplier: number = 1;
  private prefersReducedMotion: boolean = false;
  private mediaQueryList: MediaQueryList | null = null;
  private mediaQueryHandler: ((e: MediaQueryListEvent) => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined' && window.matchMedia) {
      this.mediaQueryList = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.prefersReducedMotion = this.mediaQueryList.matches;
      this.mediaQueryHandler = (e: MediaQueryListEvent) => {
        this.prefersReducedMotion = e.matches;
      };
      this.mediaQueryList.addEventListener('change', this.mediaQueryHandler);
    }
  }

  public get currentDurationMs(): number {
    if (this.prefersReducedMotion) {
      return 0;
    }
    return Math.max(20, Math.round(this.baseDurationMs / this.speedMultiplier));
  }

  public setSpeed(multiplier: number): void {
    if (multiplier > 0) {
      this.speedMultiplier = multiplier;
    }
  }

  public setBaseDuration(ms: number): void {
    if (ms >= 0) {
      this.baseDurationMs = ms;
    }
  }

  public async animate(
    element: Element,
    keyframes: Keyframe[] | PropertyIndexedKeyframes,
    options?: KeyframeAnimationOptions
  ): Promise<void> {
    const duration = this.currentDurationMs;

    if (duration === 0 || typeof element.animate !== 'function') {
      return this.waitForNextFrame();
    }

    const animOptions: KeyframeAnimationOptions = {
      duration,
      easing: 'ease-in-out',
      fill: 'forwards',
      ...options
    };

    const animation = element.animate(keyframes, animOptions);
    this.activeAnimations.add(animation);

    try {
      await animation.finished;
    } catch {
      // AbortError is expected when animations are canceled during scrubbing/stepping backwards
    } finally {
      this.activeAnimations.delete(animation);
    }
  }

  public cancelAll(): void {
    for (const anim of this.activeAnimations) {
      try {
        anim.cancel();
      } catch {
        // Suppress cancellation errors
      }
    }
    this.activeAnimations.clear();
  }

  public async waitForStep(): Promise<void> {
    const duration = this.currentDurationMs;
    if (duration === 0) {
      return this.waitForNextFrame();
    }
    await new Promise<void>((resolve) => setTimeout(resolve, duration));
  }

  public async waitForNextFrame(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(() => resolve());
      } else {
        setTimeout(resolve, 16);
      }
    });
  }

  public destroy(): void {
    this.cancelAll();
    if (this.mediaQueryList && this.mediaQueryHandler) {
      this.mediaQueryList.removeEventListener('change', this.mediaQueryHandler);
    }
  }
}
