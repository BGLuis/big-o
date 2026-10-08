import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SideNavBarComponent } from './side-nav-bar.component';

describe('SideNavBarComponent', () => {
  let component: SideNavBarComponent;
  let fixture: ComponentFixture<SideNavBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideNavBarComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(SideNavBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and initialize with sorting dropdown open', () => {
    expect(component).toBeTruthy();
    expect(component.sortingOpen()).toBe(true);
    expect(component.algorithmsOpen()).toBe(true);
    expect(component.dataStructuresOpen()).toBe(false);
    expect(component.sortingAlgorithms.length).toBeGreaterThanOrEqual(2);
    expect(component.dataStructures.length).toBeGreaterThanOrEqual(2);
  });

  it('should toggle sorting dropdown state', () => {
    expect(component.sortingOpen()).toBe(true);
    component.toggleSorting();
    expect(component.sortingOpen()).toBe(false);
    component.toggleSorting();
    expect(component.sortingOpen()).toBe(true);
  });

  it('should render links pointing to /ordenacao for sorting algorithms', () => {
    const el: HTMLElement = fixture.nativeElement;
    const links = el.querySelectorAll<HTMLAnchorElement>('#sorting-sublist .sub-link-item');
    expect(links.length).toBeGreaterThanOrEqual(2);
    const hrefs = Array.from(links).map((link) => link.getAttribute('href') ?? '');
    expect(hrefs.some((h) => h.includes('/ordenacao/quick-sort'))).toBe(true);
    expect(hrefs.some((h) => h.includes('/ordenacao/bubble-sort'))).toBe(true);
  });

  it('should toggle data structures dropdown state', () => {
    expect(component.dataStructuresOpen()).toBe(false);
    component.toggleDataStructures();
    expect(component.dataStructuresOpen()).toBe(true);
  });

  it('should emit collapseToggled when trigger clicked while collapsed', () => {
    fixture.componentRef.setInput('collapsed', true);
    fixture.detectChanges();

    let emitted = false;
    component.collapseToggled.subscribe(() => {
      emitted = true;
    });

    component.toggleSorting();
    expect(emitted).toBe(true);
    expect(component.sortingOpen()).toBe(true);
  });
});
