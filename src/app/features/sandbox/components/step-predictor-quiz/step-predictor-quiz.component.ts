import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal
} from '@angular/core';
import { StepQuizPrompt } from '../../sandbox.types';

@Component({
  selector: 'app-step-predictor-quiz',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (prompt(); as quiz) {
      <div
        class="step-predictor-card"
        [class.is-unanswered]="!hasAnswered()"
        [class.is-correct]="hasAnswered() && isCorrect()"
        [class.is-incorrect]="hasAnswered() && !isCorrect()"
        role="region"
        aria-labelledby="quiz-heading"
      >
        <!-- Cabeçalho do Card Estilo Lousa -->
        <div class="quiz-header">
          <div class="quiz-header-left">
            <span
              class="quiz-status-icon"
              [class.status-unanswered]="!hasAnswered()"
              [class.status-correct]="hasAnswered() && isCorrect()"
              [class.status-incorrect]="hasAnswered() && !isCorrect()"
              aria-hidden="true"
            >
              @if (!hasAnswered()) {
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              } @else if (isCorrect()) {
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              } @else {
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              }
            </span>
            <div>
              <span class="quiz-kicker">Modo Desafio · Lousa Interativa</span>
              <h3 id="quiz-heading" class="quiz-heading">Desafio: Preveja o Próximo Passo</h3>
            </div>
          </div>
          <span class="quiz-step-pill mono">
            Passo #{{ quiz.stepIndex }}
          </span>
        </div>

        <!-- Pergunta Didática -->
        <div class="quiz-question-box">
          <p class="quiz-question">{{ quiz.question }}</p>
        </div>

        <!-- Lista de Alternativas Acessíveis -->
        <div
          class="options-list"
          role="radiogroup"
          [attr.aria-label]="quiz.question"
        >
          @for (option of quiz.options; track $index) {
            <button
              type="button"
              role="radio"
              [attr.aria-checked]="selectedOptionIndex() === $index"
              [disabled]="hasAnswered()"
              (click)="selectOption($index)"
              class="option-btn"
              [class.is-selected]="selectedOptionIndex() === $index"
              [class.is-correct-choice]="hasAnswered() && $index === quiz.correctIndex"
              [class.is-wrong-choice]="hasAnswered() && selectedOptionIndex() === $index && $index !== quiz.correctIndex"
              [class.is-dimmed]="hasAnswered() && selectedOptionIndex() !== $index && $index !== quiz.correctIndex"
            >
              <!-- Letra identificadora (A, B, C, D) -->
              <span class="option-letter mono">{{ getOptionLetter($index) }}</span>
              <span class="option-text">{{ option }}</span>

              @if (hasAnswered() && $index === quiz.correctIndex) {
                <span class="option-status-badge badge-correct">Correta</span>
              }
              @if (hasAnswered() && selectedOptionIndex() === $index && $index !== quiz.correctIndex) {
                <span class="option-status-badge badge-wrong">Sua escolha</span>
              }
            </button>
          }
        </div>

        <!-- Feedback Imediato pós-seleção -->
        @if (hasAnswered()) {
          <div
            class="feedback-card"
            [class.feedback-correct]="isCorrect()"
            [class.feedback-incorrect]="!isCorrect()"
            role="status"
            aria-live="polite"
          >
            <div class="feedback-title">
              @if (isCorrect()) {
                <span class="feedback-msg msg-correct">
                  <svg class="feedback-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Excelente! Você acertou a previsão!
                </span>
              } @else {
                <span class="feedback-msg msg-incorrect">
                  <svg class="feedback-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  Não foi bem assim... Vamos entender o passo:
                </span>
              }
            </div>
            <p class="feedback-explanation">{{ quiz.explanation }}</p>
          </div>

          <!-- Ação para continuar -->
          <div class="quiz-footer">
            <button
              type="button"
              (click)="continuePlayback()"
              class="btn-continue"
            >
              <span>Continuar passo a passo</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .step-predictor-card {
      border: 1.5px solid var(--o, #8a6a12);
      border-radius: 16px 24px 16px 24px / 22px 16px 24px 16px;
      padding: 18px 22px;
      background: var(--panel, #ffffff);
      color: var(--ink, #1c2621);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
      transition: border-color 0.2s ease, background-color 0.2s ease;

      &.is-correct {
        border-color: var(--pine, #17603e);
        background: var(--wall-tint, #f3f6f3);
      }

      &.is-incorrect {
        border-color: #dc2626;
        background: #fdf5f5;
      }
    }

    .quiz-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--rule, #d8e0da);
      margin-bottom: 14px;
    }

    .quiz-header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .quiz-status-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      svg {
        width: 18px;
        height: 18px;
      }

      &.status-unanswered {
        background: rgba(138, 106, 18, 0.12);
        color: var(--o, #8a6a12);
        border: 1px solid rgba(138, 106, 18, 0.3);
      }

      &.status-correct {
        background: rgba(23, 96, 62, 0.12);
        color: var(--pine, #17603e);
        border: 1px solid rgba(23, 96, 62, 0.3);
      }

      &.status-incorrect {
        background: rgba(220, 38, 38, 0.12);
        color: #dc2626;
        border: 1px solid rgba(220, 38, 38, 0.3);
      }
    }

    .quiz-kicker {
      font-family: var(--mono, monospace);
      font-size: 10.5px;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--o, #8a6a12);
      display: block;
    }

    .quiz-heading {
      margin: 2px 0 0;
      font-size: 15px;
      font-weight: 700;
      color: var(--ink, #1c2621);
    }

    .quiz-step-pill {
      font-size: 11px;
      padding: 3px 8px;
      border-radius: 9999px;
      background: var(--wall-tint, #f3f6f3);
      border: 1px solid var(--frame-soft, #c3d0c7);
      color: var(--ink-soft, #3f4c45);
      font-weight: 600;
    }

    .quiz-question-box {
      margin-bottom: 14px;
    }

    .quiz-question {
      margin: 0;
      font-size: 14.5px;
      font-weight: 600;
      line-height: 1.45;
      color: var(--ink, #1c2621);
    }

    .options-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 14px;
    }

    .option-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 9px 14px;
      border-radius: 8px;
      border: 1.5px solid var(--frame-soft, #c3d0c7);
      background: var(--panel, #ffffff);
      color: var(--ink, #1c2621);
      font-size: 13.5px;
      text-align: left;
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover:not(:disabled) {
        border-color: var(--pine, #17603e);
        background: var(--wall-tint, #f3f6f3);
      }

      &:focus-visible {
        outline: 2px solid var(--pine, #17603e);
        outline-offset: 2px;
      }

      &.is-correct-choice {
        border-color: var(--pine, #17603e);
        background: rgba(23, 96, 62, 0.08);
        color: var(--pine-strong, #0f4a2f);
        font-weight: 600;
      }

      &.is-wrong-choice {
        border-color: #dc2626;
        background: #fef2f2;
        color: #991b1b;
      }

      &.is-dimmed {
        opacity: 0.55;
      }

      &:disabled {
        cursor: default;
      }
    }

    .option-letter {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      background: var(--wall-tint, #f3f6f3);
      border: 1px solid var(--frame-soft, #c3d0c7);
      color: var(--ink-soft, #3f4c45);
      flex-shrink: 0;
    }

    .option-text {
      flex: 1;
      line-height: 1.4;
    }

    .option-status-badge {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 2px 7px;
      border-radius: 4px;
      flex-shrink: 0;

      &.badge-correct {
        background: var(--pine, #17603e);
        color: #ffffff;
      }

      &.badge-wrong {
        background: #dc2626;
        color: #ffffff;
      }
    }

    .feedback-card {
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 14px;
      border-left: 4px solid;

      &.feedback-correct {
        background: rgba(23, 96, 62, 0.08);
        border-color: var(--pine, #17603e);
      }

      &.feedback-incorrect {
        background: #fef2f2;
        border-color: #dc2626;
      }
    }

    .feedback-title {
      font-size: 13.5px;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .feedback-msg {
      display: inline-flex;
      align-items: center;
      gap: 6px;

      &.msg-correct {
        color: var(--pine, #17603e);
      }

      &.msg-incorrect {
        color: #dc2626;
      }
    }

    .feedback-icon {
      width: 16px;
      height: 16px;
    }

    .feedback-explanation {
      margin: 0;
      font-size: 13px;
      color: var(--ink-soft, #3f4c45);
      line-height: 1.45;
    }

    .quiz-footer {
      display: flex;
      justify-content: flex-end;
    }

    .btn-continue {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      height: 38px;
      padding: 0 18px;
      border-radius: 8px;
      background: var(--pine, #17603e);
      color: #ffffff;
      border: 1.5px solid var(--pine, #17603e);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s ease;

      svg {
        width: 16px;
        height: 16px;
      }

      &:hover {
        background: var(--pine-strong, #0f4a2f);
      }

      &:focus-visible {
        outline: 2px solid var(--pine, #17603e);
        outline-offset: 2px;
      }
    }

    :host-context([data-theme='dark']) {
      .step-predictor-card {
        background: var(--board, #26332c);
        color: var(--chalk, #f4f1e6);

        &.is-incorrect {
          background: rgba(185, 28, 28, 0.15);
        }
      }

      .quiz-heading {
        color: var(--chalk, #f4f1e6);
      }

      .quiz-question {
        color: var(--chalk, #f4f1e6);
      }

      .option-btn {
        background: var(--board-deep, #1f2a24);
        border-color: rgba(255, 255, 255, 0.12);
        color: var(--chalk-soft, #d7ded6);

        &:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.08);
          border-color: var(--pine, #17603e);
        }

        &.is-wrong-choice {
          background: rgba(220, 38, 38, 0.2);
          color: #fca5a5;
        }
      }

      .option-letter {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.15);
        color: var(--chalk, #f4f1e6);
      }

      .feedback-explanation {
        color: var(--chalk-soft, #d7ded6);
      }
    }
  `]
})
export class StepPredictorQuizComponent {
  public readonly prompt = input<StepQuizPrompt | null>(null);

  public readonly answered = output<{ correct: boolean; selectedIndex: number }>();
  public readonly dismissed = output<void>();

  private readonly internalSelection = signal<{ prompt: StepQuizPrompt | null; index: number | null }>({
    prompt: null,
    index: null
  });

  public readonly selectedOptionIndex = computed(() => {
    const sel = this.internalSelection();
    if (sel.prompt === this.prompt()) {
      return sel.index;
    }
    return null;
  });

  public readonly hasAnswered = computed(() => this.selectedOptionIndex() !== null);

  public readonly isCorrect = computed(() => {
    const p = this.prompt();
    const idx = this.selectedOptionIndex();
    if (!p || idx === null) {
      return false;
    }
    return idx === p.correctIndex;
  });

  public selectOption(index: number): void {
    const p = this.prompt();
    if (!p || this.hasAnswered()) {
      return;
    }

    this.internalSelection.set({ prompt: p, index });
    const correct = index === p.correctIndex;
    this.answered.emit({ correct, selectedIndex: index });
  }

  public continuePlayback(): void {
    this.internalSelection.set({ prompt: null, index: null });
    this.dismissed.emit();
  }

  public getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }
}
