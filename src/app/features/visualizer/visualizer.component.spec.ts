import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { VisualizerComponent } from './visualizer.component';

describe('VisualizerComponent', () => {
  let component: VisualizerComponent;
  let fixture: ComponentFixture<VisualizerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisualizerComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(VisualizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and initialize with default Quick Sort algorithm', () => {
    expect(component).toBeTruthy();
    expect(component.selectedAlgorithmId()).toBe('quick-sort');
    expect(component.currentContent().id).toBe('quick-sort');
    expect(component.totalSteps()).toBeGreaterThan(0);
    expect(component.canStepForward()).toBe(true);
    expect(component.canStepBackward()).toBe(false);
  });

  it('should advance step when onStepForward is called', () => {
    const initialIndex = component.currentStepIndex();
    component.onStepForward();
    expect(component.currentStepIndex()).toBe(initialIndex + 1);
    expect(component.canStepBackward()).toBe(true);
    expect(component.currentEvent()?.narration).toBeDefined();
  });

  it('should switch algorithm to bubble-sort and rebuild engine', () => {
    const mockEvent = {
      target: { value: 'bubble-sort' }
    } as unknown as Event;

    component.onAlgorithmChange(mockEvent);
    expect(component.selectedAlgorithmId()).toBe('bubble-sort');
    expect(component.currentContent().id).toBe('bubble-sort');
    expect(component.currentStepIndex()).toBe(0);
  });

  it('should toggle play status', () => {
    expect(component.isPlaying()).toBe(false);
    component.onTogglePlay();
    expect(component.isPlaying()).toBe(true);
    component.onTogglePlay();
    expect(component.isPlaying()).toBe(false);
  });

  it('should generate new random data and reset step index', () => {
    component.onStepForward();
    component.onStepForward();
    expect(component.currentStepIndex()).toBe(2);

    component.generateRandomData();
    expect(component.currentStepIndex()).toBe(0);
    expect(component.totalSteps()).toBeGreaterThan(0);
  });

  it('should jump to step when timeline is scrubbed', () => {
    const mockEvent = {
      target: { value: '5' }
    } as unknown as Event;

    component.onScrub(mockEvent);
    expect(component.currentStepIndex()).toBe(5);
    expect(component.progressPercent()).toBeGreaterThan(0);
  });

  it('should change speed when onSpeedChange is called', () => {
    const mockEvent = {
      target: { value: '2' }
    } as unknown as Event;

    component.onSpeedChange(mockEvent);
    expect(component.currentSpeed()).toBe(2);
  });

  it('should switch algorithm when route id input changes', () => {
    fixture.componentRef.setInput('id', 'bubble-sort');
    fixture.detectChanges();

    expect(component.selectedAlgorithmId()).toBe('bubble-sort');
    expect(component.currentContent().id).toBe('bubble-sort');
  });

  it('should switch to BST hierarchical family and step through events', () => {
    fixture.componentRef.setInput('id', 'bst-insert');
    fixture.detectChanges();

    expect(component.selectedAlgorithmId()).toBe('bst-insert');
    expect(component.currentContent().family).toBe('hierarchical');
    expect(component.totalSteps()).toBeGreaterThan(5);

    component.onStepForward();
    expect(component.currentStepIndex()).toBe(1);
    expect(component.currentTreeState().nodes).toBeDefined();
  });

  it('should switch to Linked List graph family and step through events', () => {
    fixture.componentRef.setInput('id', 'linked-list');
    fixture.detectChanges();

    expect(component.selectedAlgorithmId()).toBe('linked-list');
    expect(component.currentContent().family).toBe('graph');
    expect(component.totalSteps()).toBeGreaterThan(5);

    component.onStepForward();
    expect(component.currentStepIndex()).toBe(1);
    expect(component.currentLinkedListState().headId).toBeDefined();
  });

  it('should switch back from BST to Quick Sort and execute sorting steps', () => {
    fixture.componentRef.setInput('id', 'bst-insert');
    fixture.detectChanges();
    expect(component.currentContent().family).toBe('hierarchical');

    fixture.componentRef.setInput('id', 'quick-sort');
    fixture.detectChanges();

    expect(component.selectedAlgorithmId()).toBe('quick-sort');
    expect(component.currentContent().family).toBe('linear');
    expect(component.currentContent().category).toBe('sorting');
    expect(component.totalSteps()).toBeGreaterThan(5);
    expect(component.currentLinearState().elements.length).toBeGreaterThan(0);

    component.onStepForward();
    expect(component.currentStepIndex()).toBe(1);
    expect(component.currentLinearEvent()).toBeDefined();
  });

  it('should switch back from Linked List to Bubble Sort and execute sorting steps', () => {
    fixture.componentRef.setInput('id', 'linked-list');
    fixture.detectChanges();
    expect(component.currentContent().family).toBe('graph');

    fixture.componentRef.setInput('id', 'bubble-sort');
    fixture.detectChanges();

    expect(component.selectedAlgorithmId()).toBe('bubble-sort');
    expect(component.currentContent().family).toBe('linear');
    expect(component.currentContent().category).toBe('sorting');
    expect(component.totalSteps()).toBeGreaterThan(5);

    component.onStepForward();
    expect(component.currentStepIndex()).toBe(1);
  });

  it('should render optgroups for Ordenação and Estruturas de Dados in the selector', () => {
    const el: HTMLElement = fixture.nativeElement;
    const optgroups = el.querySelectorAll('select#algo-select optgroup');
    expect(optgroups.length).toBe(2);
    expect(optgroups[0].getAttribute('label')).toBe('Ordenação');
    expect(optgroups[1].getAttribute('label')).toBe('Estruturas de Dados');
  });

  it('should successfully switch and step through all 11 sorting algorithms', () => {
    const sortingIds = [
      'bubble-sort',
      'selection-sort',
      'insertion-sort',
      'merge-sort',
      'quick-sort',
      'dual-pivot-quick-sort',
      'heap-sort',
      'counting-sort',
      'radix-sort',
      'timsort',
      'introsort'
    ];

    for (const algoId of sortingIds) {
      fixture.componentRef.setInput('id', algoId);
      fixture.detectChanges();

      expect(component.selectedAlgorithmId()).toBe(algoId);
      expect(component.totalSteps()).toBeGreaterThan(0);
      component.onStepForward();
      expect(component.currentStepIndex()).toBe(1);
      expect(component.currentEvent()?.narration).toBeDefined();
    }
  });

  it('should successfully switch and step through all 7 data structures', () => {
    const dataStructureIds = [
      'array',
      'linked-list',
      'stack',
      'queue',
      'bst-insert',
      'graph',
      'hash-map'
    ];

    for (const dsId of dataStructureIds) {
      fixture.componentRef.setInput('id', dsId);
      fixture.detectChanges();

      expect(component.selectedAlgorithmId()).toBe(dsId);
      expect(component.totalSteps()).toBeGreaterThan(0);
      component.onStepForward();
      expect(component.currentStepIndex()).toBe(1);
      expect(component.currentEvent()?.narration).toBeDefined();
    }
  });
});
