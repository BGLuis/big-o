import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GrowthBoardComponent } from './growth-board.component';

describe('GrowthBoardComponent', () => {
  let component: GrowthBoardComponent;
  let fixture: ComponentFixture<GrowthBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GrowthBoardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(GrowthBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve renderizar a imagem do gráfico assintótico com texto alternativo acessível', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const img = compiled.querySelector('.growth-chart-img') as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toBe('assets/growth-chart.svg');
    expect(img.getAttribute('alt')).toContain('Gráfico de linhas comparando o crescimento');
  });

  it('deve renderizar as 6 tags de complexidade', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const tags = compiled.querySelectorAll('.complexity-tag');
    expect(tags.length).toBe(6);
    expect(compiled.textContent).toContain('O(1)');
    expect(compiled.textContent).toContain('O(log n)');
    expect(compiled.textContent).toContain('O(n)');
    expect(compiled.textContent).toContain('O(n log n)');
    expect(compiled.textContent).toContain('O(n²)');
    expect(compiled.textContent).toContain('O(2ⁿ)');
  });

  it('deve conter as colunas corretas na tabela de crescimento', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const headers = compiled.querySelectorAll('.growth-table thead th');
    expect(headers.length).toBe(5);
    expect(headers[0].textContent).toContain('classe');
    expect(headers[1].textContent).toContain('n = 10');
    expect(headers[2].textContent).toContain('n = 100');
    expect(headers[3].textContent).toContain('n = 1 000');
    expect(headers[4].textContent).toContain('n = 1 000 000');
  });
});
