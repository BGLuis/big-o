import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeroPreviewComponent } from './hero-preview.component';

describe('HeroPreviewComponent', () => {
  let component: HeroPreviewComponent;
  let fixture: ComponentFixture<HeroPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroPreviewComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(HeroPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve renderizar as 10 barras de particionamento do Quick Sort', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const bars = compiled.querySelectorAll('.bars-stage .bar');
    expect(bars.length).toBe(10);
  });

  it('deve renderizar a legenda de cores', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const legendItems = compiled.querySelectorAll('.legend-item');
    expect(legendItems.length).toBe(3);
    expect(compiled.textContent).toContain('≤ pivô');
    expect(compiled.textContent).toContain('comparando');
    expect(compiled.textContent).toContain('pivô');
  });

  it('deve destacar a linha 12 do pseudocódigo', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const highlightedLine = compiled.querySelector('.code-line.line-highlighted');
    expect(highlightedLine?.textContent).toContain('12');
    expect(highlightedLine?.textContent).toContain('se A[j] <= pivo então');
  });
});
