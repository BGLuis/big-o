import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeService } from '../../core/services/theme.service';
import { SandboxArenaComponent } from './components/sandbox-arena/sandbox-arena.component';
import { SandboxComponent } from './sandbox.component';
import { SandboxSessionService } from './services/sandbox-session.service';

describe('SandboxComponent and Sandbox Integration', () => {
  let component: SandboxComponent;
  let fixture: ComponentFixture<SandboxComponent>;
  let sessionService: SandboxSessionService;
  let themeService: ThemeService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SandboxComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (key: string) => {
                  if (key === 'mode') return 'lab';
                  return null;
                }
              }
            },
            queryParamMap: of({
              get: (key: string) => {
                if (key === 'mode') return 'lab';
                return null;
              }
            })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SandboxComponent);
    component = fixture.componentInstance;
    sessionService = TestBed.inject(SandboxSessionService);
    themeService = TestBed.inject(ThemeService);
    fixture.detectChanges();
  });

  describe('SandboxComponent Mode Switching & Blackboard Shell', () => {
    it('should create SandboxComponent and default to lab mode', () => {
      expect(component).toBeTruthy();
      expect(component.activeMode()).toBe('lab');

      const el: HTMLElement = fixture.nativeElement;
      const labPanel = el.querySelector('#panel-mode-lab');
      const arenaPanel = el.querySelector('#panel-mode-arena');

      expect(labPanel).toBeTruthy();
      expect(arenaPanel).toBeNull();

      const labComponent = el.querySelector('app-sandbox-lab');
      expect(labComponent).toBeTruthy();
    });

    it('should render accessible tablist with academic aesthetics', () => {
      const el: HTMLElement = fixture.nativeElement;
      const tablist = el.querySelector('[role="tablist"]');
      expect(tablist).toBeTruthy();

      const labTab = el.querySelector<HTMLButtonElement>('#tab-mode-lab');
      const arenaTab = el.querySelector<HTMLButtonElement>('#tab-mode-arena');

      expect(labTab?.getAttribute('role')).toBe('tab');
      expect(labTab?.getAttribute('aria-selected')).toBe('true');
      expect(arenaTab?.getAttribute('aria-selected')).toBe('false');

      const title = el.querySelector('.sandbox-title');
      expect(title?.textContent).toContain('Laboratório & Arena Sandbox');
    });

    it('should switch mode between lab and arena', () => {
      const router = TestBed.inject(Router);
      const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

      component.setMode('arena');
      fixture.detectChanges();

      expect(component.activeMode()).toBe('arena');
      expect(navSpy).toHaveBeenCalled();

      const el: HTMLElement = fixture.nativeElement;
      const arenaPanel = el.querySelector('#panel-mode-arena');
      const labPanel = el.querySelector('#panel-mode-lab');

      expect(arenaPanel).toBeTruthy();
      expect(labPanel).toBeNull();

      const arenaComponent = el.querySelector('app-sandbox-arena');
      expect(arenaComponent).toBeTruthy();

      component.setMode('lab');
      fixture.detectChanges();

      expect(component.activeMode()).toBe('lab');
      expect(el.querySelector('#panel-mode-lab')).toBeTruthy();
      expect(el.querySelector('#panel-mode-arena')).toBeNull();
    });

    it('should toggle theme when theme button is clicked', () => {
      const initialDark = themeService.isDark();
      const el: HTMLElement = fixture.nativeElement;
      const themeBtn = el.querySelector<HTMLButtonElement>('.theme-toggle-btn');
      expect(themeBtn).toBeTruthy();

      themeBtn?.click();
      fixture.detectChanges();

      expect(themeService.isDark()).toBe(!initialDark);
    });
  });

  describe('SandboxSessionService: AVL Tree Operations, History and Time-Travel Undo', () => {
    it('should execute insertion, search, and deletion on AVL tree with history and balance factor checks', () => {
      sessionService.selectStructure('avl-tree');
      sessionService.clearStructure();

      expect(sessionService.structureType()).toBe('avl-tree');
      expect(sessionService.history().length).toBe(0);

      // Inserção 1: chave 30
      sessionService.executeOperation({ type: 'insert', value: 30 });
      expect(sessionService.history().length).toBe(1);
      expect(sessionService.treeState().rootId).toBe('node-30');

      // Inserção 2: chave 20
      sessionService.executeOperation({ type: 'insert', value: 20 });
      expect(sessionService.history().length).toBe(2);

      // Inserção 3: chave 10 (desbalanceamento Left-Left que dispara rotação à direita no nó 30)
      sessionService.executeOperation({ type: 'insert', value: 10 });
      expect(sessionService.history().length).toBe(3);

      const treeStateAfterInserts = sessionService.treeState();
      // Em uma AVL, após inserir 30, 20, 10 a nova raiz balanceada deve ser 20
      expect(treeStateAfterInserts.rootId).toBe('node-20');
      expect(treeStateAfterInserts.nodes['node-20']?.leftId).toBe('node-10');
      expect(treeStateAfterInserts.nodes['node-20']?.rightId).toBe('node-30');

      // Busca: procurar o nó 20
      sessionService.executeOperation({ type: 'search', value: 20 });
      expect(sessionService.history().length).toBe(4);
      const searchRecord = sessionService.history()[3];
      expect(searchRecord.operation.type).toBe('search');
      expect(searchRecord.operation.value).toBe(20);

      // Exclusão: remover o nó folha 10
      sessionService.executeOperation({ type: 'delete', value: 10 });
      expect(sessionService.history().length).toBe(5);
      const treeStateAfterDelete = sessionService.treeState();
      expect(treeStateAfterDelete.nodes['node-10']).toBeUndefined();
      expect(treeStateAfterDelete.nodes['node-20']?.leftId).toBeNull();
    });

    it('should perform time-travel undo to restore structure state to a previous point in history', () => {
      sessionService.selectStructure('avl-tree');
      sessionService.clearStructure();

      sessionService.executeOperation({ type: 'insert', value: 50 });
      sessionService.executeOperation({ type: 'insert', value: 25 });
      sessionService.executeOperation({ type: 'insert', value: 75 });
      expect(sessionService.history().length).toBe(3);

      const recordAfter3 = sessionService.history()[2];
      expect(recordAfter3.label).toContain('75');

      // Executa uma exclusão de 25
      sessionService.executeOperation({ type: 'delete', value: 25 });
      expect(sessionService.history().length).toBe(4);
      expect(sessionService.treeState().nodes['node-25']).toBeUndefined();

      // Time-travel undo: restaurar para o índice 2 (logo após inserir 75, onde 25 ainda existe)
      sessionService.restoreToHistoryIndex(2);

      const restoredState = sessionService.treeState();
      expect(restoredState.nodes['node-25']).toBeDefined();
      expect(restoredState.nodes['node-25']?.value).toBe(25);
    });

    it('should parse and execute batch scripts in SandboxSessionService', () => {
      sessionService.selectStructure('avl-tree');
      sessionService.clearStructure();

      // Formato suportado: 'I 40, I 60, S 60, D 40'
      sessionService.executeBatchScript('I 40, I 60, S 60, D 40');

      expect(sessionService.history().length).toBe(4);
      expect(sessionService.history()[0].operation.type).toBe('insert');
      expect(sessionService.history()[0].operation.value).toBe(40);
      expect(sessionService.history()[1].operation.type).toBe('insert');
      expect(sessionService.history()[1].operation.value).toBe(60);
      expect(sessionService.history()[2].operation.type).toBe('search');
      expect(sessionService.history()[2].operation.value).toBe(60);
      expect(sessionService.history()[3].operation.type).toBe('delete');
      expect(sessionService.history()[3].operation.value).toBe(40);
    });
  });

  describe('SandboxArenaComponent Integration (Side-by-Side Comparison)', () => {
    it('should render SandboxArenaComponent and configure side-by-side comparison between heap-sort and quick-sort', async () => {
      component.arenaCategory.set('sorting');
      component.arenaLeftId.set('heap-sort');
      component.arenaRightId.set('quick-sort');
      component.setMode('arena');
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      const arenaEl = el.querySelector('app-sandbox-arena');
      expect(arenaEl).toBeTruthy();

      // Verifica se os seletores dos dois competidores contêm Heap Sort e Quick Sort
      const boardTitles = el.querySelectorAll('.board-title');
      const textContent = Array.from(boardTitles).map((n) => n.textContent).join(' ');
      expect(textContent).toMatch(/Heap Sort/i);
      expect(textContent).toMatch(/Quick Sort/i);

      // Verifica selects de competidores
      const leftSelect = el.querySelector<HTMLSelectElement>('#left-algo-select');
      const rightSelect = el.querySelector<HTMLSelectElement>('#right-algo-select');
      expect(leftSelect?.value).toBe('heap-sort');
      expect(rightSelect?.value).toBe('quick-sort');
    });
  });
});
