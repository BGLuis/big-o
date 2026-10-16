import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CatalogComponent } from './catalog.component';

describe('CatalogComponent', () => {
  let component: CatalogComponent;
  let fixture: ComponentFixture<CatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and render all 21 tracks initially', () => {
    expect(component).toBeTruthy();
    const el: HTMLElement = fixture.nativeElement;

    const cards = el.querySelectorAll<HTMLAnchorElement>('.track-card');
    expect(cards.length).toBe(21);

    const desc = el.querySelector('.catalog-description');
    expect(desc?.textContent).toContain('21 tópicos para rodar passo a passo — 11 de ordenação, 10 de estruturas de dados');

    const sortingHeading = el.querySelector('#sorting-heading');
    expect(sortingHeading?.textContent?.trim()).toBe('Ordenação');

    const structuresHeading = el.querySelector('#structures-heading');
    expect(structuresHeading?.textContent?.trim()).toBe('Estruturas de Dados');
  });

  it('should filter tracks by name using search input', () => {
    const el: HTMLElement = fixture.nativeElement;
    const searchInput = el.querySelector<HTMLInputElement>('.search-field input');
    expect(searchInput).toBeTruthy();

    if (searchInput) {
      searchInput.value = 'quick';
      searchInput.dispatchEvent(new Event('input'));
    }
    fixture.detectChanges();

    const cards = el.querySelectorAll<HTMLAnchorElement>('.track-card');
    expect(cards.length).toBe(3); // Quick Sort, Dual-Pivot QuickSort & Introsort (menciona Quick Sort na descrição)

    const titles = Array.from(cards).map((c) => c.querySelector('.track-title')?.textContent?.trim());
    expect(titles).toContain('Quick Sort');
    expect(titles).toContain('Dual-Pivot QuickSort');
    expect(titles).toContain('Introsort');
  });

  it('should filter tracks by complexity string', () => {
    const el: HTMLElement = fixture.nativeElement;
    const searchInput = el.querySelector<HTMLInputElement>('.search-field input');

    if (searchInput) {
      searchInput.value = 'Θ(1)';
      searchInput.dispatchEvent(new Event('input'));
    }
    fixture.detectChanges();

    const cards = el.querySelectorAll<HTMLAnchorElement>('.track-card');
    // Array, Pilha, Fila têm Θ(1)
    expect(cards.length).toBeGreaterThanOrEqual(3);
  });

  it('should filter by category when tab buttons are clicked', () => {
    const el: HTMLElement = fixture.nativeElement;
    const tabs = el.querySelectorAll<HTMLButtonElement>('.filter-tab');
    expect(tabs.length).toBe(3);

    // Click 'Ordenação'
    tabs[1].click();
    fixture.detectChanges();

    let cards = el.querySelectorAll<HTMLAnchorElement>('.track-card');
    expect(cards.length).toBe(11);
    expect(el.querySelector('#structures-heading')).toBeNull();
    expect(el.querySelector('#sorting-heading')).toBeTruthy();

    // Click 'Estruturas'
    tabs[2].click();
    fixture.detectChanges();

    cards = el.querySelectorAll<HTMLAnchorElement>('.track-card');
    expect(cards.length).toBe(10);
    expect(el.querySelector('#sorting-heading')).toBeNull();
    expect(el.querySelector('#structures-heading')).toBeTruthy();

    // Click 'Todos'
    tabs[0].click();
    fixture.detectChanges();

    cards = el.querySelectorAll<HTMLAnchorElement>('.track-card');
    expect(cards.length).toBe(21);
  });

  it('should show empty state when no results match and restore on clear', () => {
    const el: HTMLElement = fixture.nativeElement;
    const searchInput = el.querySelector<HTMLInputElement>('.search-field input');

    if (searchInput) {
      searchInput.value = 'non-existent-algorithm-xyz';
      searchInput.dispatchEvent(new Event('input'));
    }
    fixture.detectChanges();

    const emptyState = el.querySelector('.empty-state');
    expect(emptyState).toBeTruthy();
    expect(el.querySelectorAll('.track-card').length).toBe(0);

    const clearButton = emptyState?.querySelector<HTMLButtonElement>('button');
    expect(clearButton).toBeTruthy();
    clearButton?.click();
    fixture.detectChanges();

    expect(el.querySelector('.empty-state')).toBeNull();
    expect(el.querySelectorAll('.track-card').length).toBe(21);
  });

  it('should render valid router links on cards', () => {
    const el: HTMLElement = fixture.nativeElement;
    const cards = el.querySelectorAll<HTMLAnchorElement>('.track-card');

    const hrefs = Array.from(cards).map((c) => c.getAttribute('href') ?? '');
    expect(hrefs.some((h) => h.includes('/ordenacao/quick-sort'))).toBe(true);
    expect(hrefs.some((h) => h.includes('/data-structures/array'))).toBe(true);
    expect(hrefs.some((h) => h.includes('/data-structures/bst'))).toBe(true);
    expect(hrefs.some((h) => h.includes('/data-structures/avl-tree'))).toBe(true);
    expect(hrefs.some((h) => h.includes('/data-structures/tree-traversal'))).toBe(true);
    expect(hrefs.some((h) => h.includes('/data-structures/red-black-tree'))).toBe(true);
    expect(hrefs.some((h) => h.includes('/data-structures/hash-map'))).toBe(true);
  });
});
