import {
  Injectable,
  OnDestroy,
  computed,
  signal
} from '@angular/core';
import { BaseEvent } from '../../../engine/events';
import { PlaybackEngine } from '../../../engine/playback-engine';
import { computeTelemetry } from '../../../engine/telemetry-tracker';
import {
  TreeState,
  createInitialTreeState,
  treeReducer
} from '../../../families/hierarchical/tree-state';
import {
  LinearState,
  createInitialLinearState,
  linearReducer
} from '../../../families/linear/linear-state';
import {
  LinkedListState,
  createInitialLinkedListState,
  linkedListReducer
} from '../../../families/linked-list/linked-list-state';
import {
  StackState,
  createInitialStackState,
  stackReducer
} from '../../../families/stack/stack-state';
import {
  QueueState,
  createInitialQueueState,
  queueReducer
} from '../../../families/queue/queue-state';
import {
  HashMapState,
  createInitialHashMapState,
  hashMapReducer
} from '../../../families/hash-map/hash-map-state';
import {
  GraphState,
  createInitialGraphState,
  graphReducer
} from '../../../families/graph/graph-state';
import {
  applyEventsToTreeState,
  executeTreeOperation
} from '../../../families/hierarchical/algorithms/tree-sandbox.generator';
import { executeArraySandboxOp } from '../../../families/linear/algorithms/linear-sandbox.generator';
import {
  executeGraphSandboxOp,
  executeHashMapSandboxOp,
  executeLinkedListSandboxOp,
  executeQueueSandboxOp,
  executeStackSandboxOp
} from '../../../families/sandbox-ops/structures-sandbox.generator';
import {
  DatasetPresetId,
  SandboxOperationInput,
  SandboxOperationRecord,
  SandboxOperationResult,
  SandboxStructureType,
  StepQuizPrompt,
  TelemetrySnapshot,
  TreeKind
} from '../sandbox.types';
import {
  SANDBOX_PRESETS,
  generateDatasetByPreset
} from '../sandbox-presets.data';

@Injectable({
  providedIn: 'root'
})
export class SandboxSessionService implements OnDestroy {
  // Sinais de configuração e estado geral
  public readonly structureType = signal<SandboxStructureType>('avl-tree');
  public readonly history = signal<readonly SandboxOperationRecord[]>([]);
  public readonly activeRecordIndex = signal<number>(-1);
  public readonly challengeMode = signal<boolean>(false);
  public readonly activeQuiz = signal<StepQuizPrompt | null>(null);
  public readonly selectedTreeNode = signal<{ id: string; value: number } | null>(null);
  public readonly lastSummary = signal<string>(
    'Escolha uma operação ou preset para iniciar seu experimento passo a passo.'
  );
  public readonly engine = signal<PlaybackEngine<any, any> | null>(null);

  // Estados consolidados para cada família de estrutura
  public readonly treeState = signal<TreeState>(createInitialTreeState());
  public readonly linearState = signal<LinearState>(createInitialLinearState([]));
  public readonly linkedListState = signal<LinkedListState>(createInitialLinkedListState([]));
  public readonly stackState = signal<StackState>(createInitialStackState([]));
  public readonly queueState = signal<QueueState>(createInitialQueueState([]));
  public readonly hashMapState = signal<HashMapState>(createInitialHashMapState(7));
  public readonly graphState = signal<GraphState>(createInitialGraphState());
  public readonly currentEvents = signal<readonly BaseEvent[]>([]);

  // Sinais computados para renderização em tempo real sincronizados com o engine
  public readonly renderedTreeState = computed<TreeState>(() => {
    const eng = this.engine();
    const type = this.structureType();
    if (eng && (type === 'bst' || type === 'avl-tree' || type === 'red-black-tree')) {
      return (eng.currentState() as TreeState) ?? this.treeState();
    }
    return this.treeState();
  });

  public readonly renderedLinearState = computed<LinearState>(() => {
    const eng = this.engine();
    if (eng && this.structureType() === 'array') {
      return (eng.currentState() as LinearState) ?? this.linearState();
    }
    return this.linearState();
  });

  public readonly renderedLinkedListState = computed<LinkedListState>(() => {
    const eng = this.engine();
    if (eng && this.structureType() === 'linked-list') {
      return (eng.currentState() as LinkedListState) ?? this.linkedListState();
    }
    return this.linkedListState();
  });

  public readonly renderedStackState = computed<StackState>(() => {
    const eng = this.engine();
    if (eng && this.structureType() === 'stack') {
      return (eng.currentState() as StackState) ?? this.stackState();
    }
    return this.stackState();
  });

  public readonly renderedQueueState = computed<QueueState>(() => {
    const eng = this.engine();
    if (eng && this.structureType() === 'queue') {
      return (eng.currentState() as QueueState) ?? this.queueState();
    }
    return this.queueState();
  });

  public readonly renderedHashMapState = computed<HashMapState>(() => {
    const eng = this.engine();
    if (eng && this.structureType() === 'hash-map') {
      return (eng.currentState() as HashMapState) ?? this.hashMapState();
    }
    return this.hashMapState();
  });

  public readonly renderedGraphState = computed<GraphState>(() => {
    const eng = this.engine();
    if (eng && this.structureType() === 'graph') {
      return (eng.currentState() as GraphState) ?? this.graphState();
    }
    return this.graphState();
  });

  // Métricas e status do motor de reprodução
  public readonly currentEvent = computed<BaseEvent | null>(
    () => this.engine()?.currentEvent() ?? null
  );
  public readonly currentStepIndex = computed<number>(
    () => this.engine()?.currentStepIndex() ?? 0
  );
  public readonly totalSteps = computed<number>(
    () => this.engine()?.totalSteps() ?? 0
  );
  public readonly isPlaying = computed<boolean>(
    () => this.engine()?.isPlaying() ?? false
  );
  public readonly canStepForward = computed<boolean>(
    () => this.engine()?.canStepForward() ?? false
  );
  public readonly canStepBackward = computed<boolean>(
    () => this.engine()?.canStepBackward() ?? false
  );
  public readonly progressPercent = computed<number>(() => {
    const total = this.totalSteps();
    return total > 0 ? (this.currentStepIndex() / total) * 100 : 0;
  });

  public readonly telemetry = computed<TelemetrySnapshot>(() => {
    const eng = this.engine();
    const events = this.currentEvents();
    const step = eng?.currentStepIndex() ?? 0;
    const struct = this.structureType();

    let family: 'linear' | 'hierarchical' | 'other' = 'other';
    let state: unknown = null;
    if (struct === 'bst' || struct === 'avl-tree' || struct === 'red-black-tree') {
      family = 'hierarchical';
      state = this.renderedTreeState();
    } else if (struct === 'array' || struct === 'linked-list' || struct === 'stack' || struct === 'queue') {
      family = 'linear';
      state = this.renderedLinearState();
    } else {
      family = 'other';
      state = this.renderedHashMapState();
    }

    return computeTelemetry(events, step, state, family);
  });

  constructor() {
    this.selectStructure('avl-tree');
  }

  public ngOnDestroy(): void {
    this.engine()?.destroy();
  }

  /**
   * Alterna a estrutura de dados ativa, inicializando-a com um conjunto didático padrão
   * para visualização e experimentação imediata.
   */
  public selectStructure(type: SandboxStructureType): void {
    this.structureType.set(type);
    this.engine()?.destroy();
    this.engine.set(null);
    this.currentEvents.set([]);
    this.activeQuiz.set(null);
    this.selectedTreeNode.set(null);
    this.history.set([]);
    this.activeRecordIndex.set(-1);

    switch (type) {
      case 'bst': {
        let state = createInitialTreeState();
        for (const val of [40, 20, 60, 10, 30, 50, 70]) {
          state = executeTreeOperation(state, { type: 'insert', value: val }, 'bst').finalState;
        }
        this.treeState.set(state);
        break;
      }
      case 'avl-tree': {
        let state = createInitialTreeState();
        for (const val of [30, 20, 40, 10, 25, 35, 50]) {
          state = executeTreeOperation(state, { type: 'insert', value: val }, 'avl').finalState;
        }
        this.treeState.set(state);
        break;
      }
      case 'red-black-tree': {
        let state = createInitialTreeState();
        for (const val of [30, 15, 50, 10, 20, 40, 60]) {
          state = executeTreeOperation(state, { type: 'insert', value: val }, 'rb').finalState;
        }
        this.treeState.set(state);
        break;
      }
      case 'array': {
        this.linearState.set(createInitialLinearState([15, 23, 42, 55, 64, 78, 91]));
        break;
      }
      case 'linked-list': {
        this.linkedListState.set(createInitialLinkedListState([12, 28, 45, 67, 89]));
        break;
      }
      case 'stack': {
        this.stackState.set(createInitialStackState([10, 20, 30, 40]));
        break;
      }
      case 'queue': {
        this.queueState.set(createInitialQueueState([10, 20, 30, 40]));
        break;
      }
      case 'hash-map': {
        let hm = createInitialHashMapState(7);
        const sample = [
          { k: 15, v: 'Alfa' },
          { k: 22, v: 'Beta' },
          { k: 36, v: 'Gama' },
          { k: 8, v: 'Delta' }
        ];
        for (const item of sample) {
          hm = executeHashMapSandboxOp(hm, {
            type: 'insert',
            value: item.k,
            secondaryValue: item.v
          }).finalState;
        }
        this.hashMapState.set(hm);
        break;
      }
      case 'graph': {
        this.graphState.set(createInitialGraphState());
        break;
      }
    }

    this.lastSummary.set(
      `Estrutura ${type.toUpperCase()} inicializada com dataset didático pronto para interação.`
    );
  }

  /**
   * Executa uma operação interativa sobre a estrutura atual.
   * Cria um PlaybackEngine, salva o registro no histórico e atualiza o estado consolidado.
   */
  public executeOperation(input: SandboxOperationInput, autoPlay = false): void {
    if (input.type === 'clear') {
      this.clearStructure();
      return;
    }

    const { stateBefore, result, reducer, updateConsolidatedState } =
      this.executeOpOnCurrentStructure(input);

    this.engine()?.destroy();

    const newEngine = new PlaybackEngine({
      initialState: stateBefore,
      events: result.events,
      reducer
    });

    this.engine.set(newEngine);
    this.currentEvents.set(result.events);

    const record: SandboxOperationRecord = {
      id: `op-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      label: this.formatOperationLabel(input),
      operation: input,
      events: result.events,
      stateBefore,
      stateAfter: result.finalState,
      timestamp: Date.now(),
      quizPrompt: result.quizPrompt
    };

    this.history.update((h) => [...h, record]);
    this.activeRecordIndex.set(this.history().length - 1);
    this.lastSummary.set(result.summary);

    // Atualiza o estado consolidado da estrutura
    updateConsolidatedState(result.finalState);

    // Verifica modo desafio com quiz didático
    if (this.challengeMode() && result.quizPrompt) {
      this.activeQuiz.set(result.quizPrompt);
      if (result.quizPrompt.stepIndex > 0) {
        newEngine.goToStep(result.quizPrompt.stepIndex);
      }
    } else {
      this.activeQuiz.set(null);
      if (autoPlay) {
        newEngine.play();
      } else if (result.events.length > 0) {
        newEngine.stepForward();
      }
    }
  }

  /**
   * Recarrega no PlaybackEngine uma operação histórica para rever sua execução passo a passo.
   */
  public replayHistoryRecord(index: number): void {
    const hist = this.history();
    if (index < 0 || index >= hist.length) {
      return;
    }

    const record = hist[index];
    const reducer = this.getReducerForCurrentStructure();

    this.engine()?.destroy();

    const replayEngine = new PlaybackEngine({
      initialState: record.stateBefore,
      events: record.events,
      reducer
    });

    this.engine.set(replayEngine);
    this.currentEvents.set(record.events);
    this.activeRecordIndex.set(index);
    this.lastSummary.set(`Revendo operação histórica: ${record.label}`);

    if (this.challengeMode() && record.quizPrompt) {
      this.activeQuiz.set(record.quizPrompt);
    } else {
      this.activeQuiz.set(null);
    }
  }

  /**
   * Realiza Time-Travel (Undo) restaurando a estrutura para o ponto após o registro selecionado.
   */
  public restoreToHistoryIndex(index: number): void {
    const hist = this.history();
    if (index < 0 || index >= hist.length) {
      return;
    }

    const record = hist[index];
    const type = this.structureType();

    switch (type) {
      case 'bst':
      case 'avl-tree':
      case 'red-black-tree':
        this.treeState.set(record.stateAfter as TreeState);
        break;
      case 'array':
        this.linearState.set(record.stateAfter as LinearState);
        break;
      case 'linked-list':
        this.linkedListState.set(record.stateAfter as LinkedListState);
        break;
      case 'stack':
        this.stackState.set(record.stateAfter as StackState);
        break;
      case 'queue':
        this.queueState.set(record.stateAfter as QueueState);
        break;
      case 'hash-map':
        this.hashMapState.set(record.stateAfter as HashMapState);
        break;
      case 'graph':
        this.graphState.set(record.stateAfter as GraphState);
        break;
    }

    const truncated = hist.slice(0, index + 1);
    this.history.set(truncated);
    this.activeRecordIndex.set(index);

    const reducer = this.getReducerForCurrentStructure();
    this.engine()?.destroy();

    const eng = new PlaybackEngine({
      initialState: record.stateBefore,
      events: record.events,
      reducer
    });
    eng.goToStep(record.events.length);

    this.engine.set(eng);
    this.currentEvents.set(record.events);
    this.activeQuiz.set(null);
    this.lastSummary.set(`Time-Travel: estrutura restaurada para o ponto após "${record.label}".`);
  }

  /**
   * Aplica um preset didático sobre a estrutura atual.
   */
  public applyPreset(presetId: DatasetPresetId): void {
    const values = generateDatasetByPreset(presetId);
    const type = this.structureType();

    this.engine()?.destroy();
    this.engine.set(null);
    this.currentEvents.set([]);
    this.activeQuiz.set(null);
    this.selectedTreeNode.set(null);
    this.history.set([]);
    this.activeRecordIndex.set(-1);

    switch (type) {
      case 'bst':
      case 'avl-tree':
      case 'red-black-tree': {
        let state = createInitialTreeState();
        const kind = this.getTreeKind();
        for (const val of values) {
          state = executeTreeOperation(state, { type: 'insert', value: val }, kind).finalState;
        }
        this.treeState.set(state);
        break;
      }
      case 'array':
        this.linearState.set(createInitialLinearState(values));
        break;
      case 'linked-list':
        this.linkedListState.set(createInitialLinkedListState(values));
        break;
      case 'stack':
        this.stackState.set(createInitialStackState(values));
        break;
      case 'queue':
        this.queueState.set(createInitialQueueState(values));
        break;
      case 'hash-map': {
        let hm = createInitialHashMapState(7);
        for (const val of values) {
          hm = executeHashMapSandboxOp(hm, {
            type: 'insert',
            value: val,
            secondaryValue: `Item-${val}`
          }).finalState;
        }
        this.hashMapState.set(hm);
        break;
      }
      case 'graph':
        this.graphState.set(createInitialGraphState());
        break;
    }

    const foundPreset = SANDBOX_PRESETS.find((p) => p.id === presetId);
    const title = foundPreset ? foundPreset.title : presetId;
    this.lastSummary.set(`Preset "${title}" carregado com sucesso (${values.length} valores).`);
  }

  /**
   * Interpreta e executa um lote de comandos textuais ou numéricos.
   */
  public executeBatchScript(script: string): void {
    if (!script || !script.trim()) {
      return;
    }

    const tokens = script
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    for (const token of tokens) {
      const op = this.parseBatchToken(token);
      if (op) {
        this.executeOperation(op, false);
      }
    }

    this.lastSummary.set(`Receita com ${tokens.length} comando(s) executada com sucesso.`);
  }

  /**
   * Limpa a estrutura atual para o estado inicial vazio.
   */
  public clearStructure(): void {
    const type = this.structureType();
    this.engine()?.destroy();
    this.engine.set(null);
    this.currentEvents.set([]);
    this.activeQuiz.set(null);
    this.selectedTreeNode.set(null);

    switch (type) {
      case 'bst':
      case 'avl-tree':
      case 'red-black-tree':
        this.treeState.set(createInitialTreeState());
        break;
      case 'array':
        this.linearState.set(createInitialLinearState([]));
        break;
      case 'linked-list':
        this.linkedListState.set(createInitialLinkedListState([]));
        break;
      case 'stack':
        this.stackState.set(createInitialStackState([]));
        break;
      case 'queue':
        this.queueState.set(createInitialQueueState([]));
        break;
      case 'hash-map':
        this.hashMapState.set(createInitialHashMapState(7));
        break;
      case 'graph':
        this.graphState.set(createInitialGraphState());
        break;
    }

    this.lastSummary.set(`Estrutura ${type.toUpperCase()} limpa.`);
  }

  /**
   * Exporta a sequência de operações realizadas no histórico como uma string legível.
   */
  public exportScriptString(): string {
    const parts: string[] = [];
    for (const record of this.history()) {
      const op = record.operation;
      switch (op.type) {
        case 'insert':
        case 'insert-head':
        case 'insert-tail':
        case 'insert-at':
          parts.push(`I ${op.value ?? ''}`);
          break;
        case 'delete':
        case 'remove-at':
          parts.push(`D ${op.value ?? ''}`);
          break;
        case 'search':
        case 'binary-search':
          parts.push(`S ${op.value ?? ''}`);
          break;
        case 'rotate-left':
          parts.push('RL');
          break;
        case 'rotate-right':
          parts.push('RR');
          break;
        case 'push':
          parts.push(`PUSH ${op.value ?? ''}`);
          break;
        case 'pop':
          parts.push('POP');
          break;
        case 'enqueue':
          parts.push(`ENQUEUE ${op.value ?? ''}`);
          break;
        case 'dequeue':
          parts.push('DEQUEUE');
          break;
        case 'traverse':
          parts.push(`TRAV ${op.traversalOrder ?? ''}`);
          break;
        case 'bfs':
          parts.push(`BFS ${op.targetNodeId ?? ''}`.trim());
          break;
        case 'dfs':
          parts.push(`DFS ${op.targetNodeId ?? ''}`.trim());
          break;
        case 'clear':
          parts.push('CLEAR');
          break;
        default:
          parts.push(op.type.toUpperCase());
      }
    }
    return parts.join(', ');
  }

  // Controles de Playback delegados
  public stepForward(): void {
    this.engine()?.stepForward();
  }

  public stepBackward(): void {
    this.engine()?.stepBackward();
  }

  public togglePlay(): void {
    this.engine()?.togglePlay();
  }

  public pause(): void {
    this.engine()?.pause();
  }

  public goToStep(step: number): void {
    this.engine()?.goToStep(step);
  }

  public setSpeed(multiplier: number): void {
    this.engine()?.setSpeed(multiplier);
  }

  public setChallengeMode(active: boolean): void {
    this.challengeMode.set(active);
    if (!active) {
      this.activeQuiz.set(null);
    }
  }

  public dismissQuiz(): void {
    this.activeQuiz.set(null);
  }

  public setSelectedTreeNode(node: { id: string; value: number } | null): void {
    this.selectedTreeNode.set(node);
  }

  // --- MÉTODOS PRIVADOS AUXILIARES ---

  private getTreeKind(): TreeKind {
    const type = this.structureType();
    if (type === 'avl-tree') return 'avl';
    if (type === 'red-black-tree') return 'rb';
    return 'bst';
  }

  private getReducerForCurrentStructure(): (state: any, event: any) => any {
    const type = this.structureType();
    switch (type) {
      case 'bst':
      case 'avl-tree':
      case 'red-black-tree':
        return treeReducer;
      case 'array':
        return linearReducer;
      case 'linked-list':
        return linkedListReducer;
      case 'stack':
        return stackReducer;
      case 'queue':
        return queueReducer;
      case 'hash-map':
        return hashMapReducer;
      case 'graph':
        return graphReducer;
    }
  }

  private executeOpOnCurrentStructure(input: SandboxOperationInput): {
    stateBefore: any;
    result: SandboxOperationResult<any, any>;
    reducer: (state: any, event: any) => any;
    updateConsolidatedState: (finalState: any) => void;
  } {
    const type = this.structureType();
    switch (type) {
      case 'bst':
      case 'avl-tree':
      case 'red-black-tree': {
        const stateBefore = this.treeState();
        const kind = this.getTreeKind();
        const result = executeTreeOperation(stateBefore, input, kind);
        return {
          stateBefore,
          result,
          reducer: treeReducer,
          updateConsolidatedState: (fs: TreeState) => this.treeState.set(fs)
        };
      }
      case 'array': {
        const stateBefore = this.linearState();
        const result = executeArraySandboxOp(stateBefore, input);
        return {
          stateBefore,
          result,
          reducer: linearReducer,
          updateConsolidatedState: (fs: LinearState) => this.linearState.set(fs)
        };
      }
      case 'linked-list': {
        const stateBefore = this.linkedListState();
        const result = executeLinkedListSandboxOp(stateBefore, input);
        return {
          stateBefore,
          result,
          reducer: linkedListReducer,
          updateConsolidatedState: (fs: LinkedListState) => this.linkedListState.set(fs)
        };
      }
      case 'stack': {
        const stateBefore = this.stackState();
        const result = executeStackSandboxOp(stateBefore, input);
        return {
          stateBefore,
          result,
          reducer: stackReducer,
          updateConsolidatedState: (fs: StackState) => this.stackState.set(fs)
        };
      }
      case 'queue': {
        const stateBefore = this.queueState();
        const result = executeQueueSandboxOp(stateBefore, input);
        return {
          stateBefore,
          result,
          reducer: queueReducer,
          updateConsolidatedState: (fs: QueueState) => this.queueState.set(fs)
        };
      }
      case 'hash-map': {
        const stateBefore = this.hashMapState();
        const result = executeHashMapSandboxOp(stateBefore, input);
        return {
          stateBefore,
          result,
          reducer: hashMapReducer,
          updateConsolidatedState: (fs: HashMapState) => this.hashMapState.set(fs)
        };
      }
      case 'graph': {
        const stateBefore = this.graphState();
        const result = executeGraphSandboxOp(stateBefore, input);
        return {
          stateBefore,
          result,
          reducer: graphReducer,
          updateConsolidatedState: (fs: GraphState) => this.graphState.set(fs)
        };
      }
    }
  }

  private formatOperationLabel(input: SandboxOperationInput): string {
    const val = input.value !== undefined ? ` ${input.value}` : '';
    switch (input.type) {
      case 'insert':
        return `Inserir${val}`;
      case 'insert-at':
        return `Inserir${val} @ ${input.secondaryValue}`;
      case 'insert-head':
        return `Inserir Cabeça${val}`;
      case 'insert-tail':
        return `Inserir Cauda${val}`;
      case 'delete':
        return `Excluir${val}`;
      case 'remove-at':
        return `Remover @ ${input.value}`;
      case 'search':
        return `Pesquisar${val}`;
      case 'binary-search':
        return `Busca Binária${val}`;
      case 'rotate-left':
        return `Rotacionar Esq ↺${val}`;
      case 'rotate-right':
        return `Rotacionar Dir ↻${val}`;
      case 'traverse':
        return `Travessia (${input.traversalOrder})`;
      case 'push':
        return `Push${val}`;
      case 'pop':
        return 'Pop';
      case 'peek':
        return 'Peek';
      case 'enqueue':
        return `Enqueue${val}`;
      case 'dequeue':
        return 'Dequeue';
      case 'bfs':
        return `BFS (${input.targetNodeId ?? 'A'})`;
      case 'dfs':
        return `DFS (${input.targetNodeId ?? 'A'})`;
      case 'clear':
        return 'Limpar';
      default:
        return input.type.toUpperCase();
    }
  }

  private parseBatchToken(token: string): SandboxOperationInput | null {
    const trimmed = token.trim();
    if (!trimmed) return null;

    if (/^-?\d+$/.test(trimmed)) {
      return { type: 'insert', value: parseInt(trimmed, 10) };
    }

    const upper = trimmed.toUpperCase();

    if (/^(I|INSERT)\s+(-?\d+)/i.test(trimmed)) {
      const match = trimmed.match(/^(I|INSERT)\s+(-?\d+)/i);
      if (match) {
        return { type: 'insert', value: parseInt(match[2], 10) };
      }
    }

    if (/^(D|DEL|DELETE|REM|REMOVE)\s*(-?\d*)/i.test(trimmed)) {
      const match = trimmed.match(/^(D|DEL|DELETE|REM|REMOVE)\s*(-?\d*)/i);
      const val = match && match[2] ? parseInt(match[2], 10) : undefined;
      return { type: 'delete', value: val };
    }

    if (/^(S|SEARCH|FIND)\s+(-?\d+)/i.test(trimmed)) {
      const match = trimmed.match(/^(S|SEARCH|FIND)\s+(-?\d+)/i);
      if (match) {
        return { type: 'search', value: parseInt(match[2], 10) };
      }
    }

    if (upper === 'RL' || upper === 'ROTATE-LEFT') {
      return { type: 'rotate-left' };
    }
    if (upper === 'RR' || upper === 'ROTATE-RIGHT') {
      return { type: 'rotate-right' };
    }

    if (/^PUSH\s+(-?\d+)/i.test(trimmed)) {
      const match = trimmed.match(/^PUSH\s+(-?\d+)/i);
      if (match) {
        return { type: 'push', value: parseInt(match[1], 10) };
      }
    }
    if (upper === 'POP') {
      return { type: 'pop' };
    }
    if (/^ENQUEUE\s+(-?\d+)/i.test(trimmed)) {
      const match = trimmed.match(/^ENQUEUE\s+(-?\d+)/i);
      if (match) {
        return { type: 'enqueue', value: parseInt(match[1], 10) };
      }
    }
    if (upper === 'DEQUEUE') {
      return { type: 'dequeue' };
    }

    if (upper === 'BFS' || upper.startsWith('BFS ')) {
      const target = trimmed.split(/\s+/)[1] || 'A';
      return { type: 'bfs', targetNodeId: target.toUpperCase() };
    }
    if (upper === 'DFS' || upper.startsWith('DFS ')) {
      const target = trimmed.split(/\s+/)[1] || 'A';
      return { type: 'dfs', targetNodeId: target.toUpperCase() };
    }

    if (upper === 'CLEAR') {
      return { type: 'clear' };
    }

    return null;
  }
}
