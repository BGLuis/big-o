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
        class="step-predictor-card rounded-2xl p-6 shadow-2xl border-2 transition-all duration-300 backdrop-blur-md"
        [class.border-amber-400]="!hasAnswered()"
        [class.bg-slate-900]="!hasAnswered()"
        [class.border-emerald-500]="hasAnswered() && isCorrect()"
        [class.bg-slate-950]="hasAnswered()"
        [class.border-rose-500]="hasAnswered() && !isCorrect()"
        role="region"
        aria-labelledby="quiz-heading"
      >
        <!-- Cabeçalho do Card Estilo Lousa -->
        <div class="flex items-center justify-between gap-3 mb-5 border-b border-slate-800 pb-3">
          <div class="flex items-center gap-3">
            <span
              class="flex items-center justify-center w-9 h-9 rounded-xl font-bold text-base shadow-inner"
              [class.bg-amber-500/20]="!hasAnswered()"
              [class.text-amber-400]="!hasAnswered()"
              [class.border]="true"
              [class.border-amber-400/30]="!hasAnswered()"
              [class.bg-emerald-500/20]="hasAnswered() && isCorrect()"
              [class.text-emerald-400]="hasAnswered() && isCorrect()"
              [class.border-emerald-500/30]="hasAnswered() && isCorrect()"
              [class.bg-rose-500/20]="hasAnswered() && !isCorrect()"
              [class.text-rose-400]="hasAnswered() && !isCorrect()"
              [class.border-rose-500/30]="hasAnswered() && !isCorrect()"
              aria-hidden="true"
            >
              @if (!hasAnswered()) {
                ⚡
              } @else if (isCorrect()) {
                ✓
              } @else {
                ✕
              }
            </span>
            <div>
              <span class="text-xs font-semibold tracking-wider uppercase text-amber-400/90 block">
                Modo Desafio · Lousa Interativa
              </span>
              <h3 id="quiz-heading" class="text-lg font-bold text-white tracking-tight">
                Desafio: Preveja o Próximo Passo
              </h3>
            </div>
          </div>
          <span class="text-xs px-3 py-1 rounded-full bg-slate-800 text-amber-300 font-mono font-medium border border-slate-700">
            Passo #{{ quiz.stepIndex }}
          </span>
        </div>

        <!-- Pergunta Didática -->
        <div class="mb-5">
          <p class="text-slate-100 text-base md:text-lg font-medium leading-relaxed">
            {{ quiz.question }}
          </p>
        </div>

        <!-- Lista de Alternativas Acessíveis -->
        <div
          class="flex flex-col gap-2.5 mb-5"
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
              class="w-full text-left px-4 py-3 rounded-xl border text-sm md:text-base font-medium transition-all duration-200 flex items-start gap-3.5 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900"
              [class.cursor-pointer]="!hasAnswered()"
              [class.cursor-default]="hasAnswered()"
              [class.border-slate-700]="!hasAnswered() && selectedOptionIndex() !== $index"
              [class.bg-slate-850]="!hasAnswered() && selectedOptionIndex() !== $index"
              [class.bg-slate-800]="!hasAnswered() && selectedOptionIndex() !== $index"
              [class.text-slate-200]="!hasAnswered() && selectedOptionIndex() !== $index"
              [class.hover:border-amber-400]="!hasAnswered()"
              [class.hover:bg-slate-700]="!hasAnswered()"
              [class.border-emerald-500]="hasAnswered() && $index === quiz.correctIndex"
              [class.bg-emerald-950]="hasAnswered() && $index === quiz.correctIndex"
              [class.text-emerald-100]="hasAnswered() && $index === quiz.correctIndex"
              [class.border-rose-500]="hasAnswered() && selectedOptionIndex() === $index && $index !== quiz.correctIndex"
              [class.bg-rose-950]="hasAnswered() && selectedOptionIndex() === $index && $index !== quiz.correctIndex"
              [class.text-rose-100]="hasAnswered() && selectedOptionIndex() === $index && $index !== quiz.correctIndex"
              [class.opacity-45]="hasAnswered() && selectedOptionIndex() !== $index && $index !== quiz.correctIndex"
            >
              <!-- Letra identificadora (A, B, C, D) -->
              <span
                class="inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-mono font-bold shrink-0 mt-0.5 border"
                [class.border-slate-600]="!hasAnswered()"
                [class.text-slate-400]="!hasAnswered()"
                [class.bg-slate-900]="!hasAnswered()"
                [class.border-emerald-400]="hasAnswered() && $index === quiz.correctIndex"
                [class.bg-emerald-500]="hasAnswered() && $index === quiz.correctIndex"
                [class.text-slate-950]="hasAnswered() && $index === quiz.correctIndex"
                [class.border-rose-400]="hasAnswered() && selectedOptionIndex() === $index && $index !== quiz.correctIndex"
                [class.bg-rose-500]="hasAnswered() && selectedOptionIndex() === $index && $index !== quiz.correctIndex"
                [class.text-white]="hasAnswered() && selectedOptionIndex() === $index && $index !== quiz.correctIndex"
              >
                {{ getOptionLetter($index) }}
              </span>

              <span class="flex-1 leading-normal">{{ option }}</span>

              @if (hasAnswered() && $index === quiz.correctIndex) {
                <span class="text-emerald-400 font-bold text-xs uppercase px-2 py-0.5 rounded bg-emerald-900/60 border border-emerald-500/40 shrink-0">
                  Correta
                </span>
              }
              @if (hasAnswered() && selectedOptionIndex() === $index && $index !== quiz.correctIndex) {
                <span class="text-rose-400 font-bold text-xs uppercase px-2 py-0.5 rounded bg-rose-900/60 border border-rose-500/40 shrink-0">
                  Sua escolha
                </span>
              }
            </button>
          }
        </div>

        <!-- Feedback Imediato pós-seleção -->
        @if (hasAnswered()) {
          <div
            class="rounded-xl p-4 mb-5 border transition-all"
            [class.border-emerald-500/50]="isCorrect()"
            [class.bg-emerald-950/40]="isCorrect()"
            [class.border-rose-500/50]="!isCorrect()"
            [class.bg-rose-950/40]="!isCorrect()"
            role="status"
            aria-live="polite"
          >
            <div class="flex items-center gap-2 mb-2 font-bold text-sm md:text-base">
              @if (isCorrect()) {
                <span class="text-emerald-400 flex items-center gap-1.5">
                  <span class="text-lg">✓</span> Excelente! Você acertou a previsão!
                </span>
              } @else {
                <span class="text-rose-400 flex items-center gap-1.5">
                  <span class="text-lg">✕</span> Não foi bem assim... Vamos entender o passo:
                </span>
              }
            </div>
            <p class="text-sm text-slate-300 leading-relaxed pl-1 border-l-2"
               [class.border-emerald-500/40]="isCorrect()"
               [class.border-rose-500/40]="!isCorrect()">
              {{ quiz.explanation }}
            </p>
          </div>

          <!-- Ação para continuar -->
          <div class="flex justify-end">
            <button
              type="button"
              (click)="continuePlayback()"
              class="px-6 py-2.5 rounded-xl font-semibold text-sm bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 shadow-lg shadow-amber-400/20 transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900 cursor-pointer"
            >
              <span>Continuar passo a passo</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        }
      </div>
    }
  `
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
