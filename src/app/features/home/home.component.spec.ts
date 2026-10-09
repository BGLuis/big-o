import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o HomeComponent com sucesso', () => {
    expect(component).toBeTruthy();
  });

  it('deve renderizar o título principal (H1) e tagline do Hero', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const h1 = compiled.querySelector('h1#hero-heading');
    expect(h1).toBeTruthy();
    expect(h1?.textContent).toContain('Veja o algoritmo rodar');
    expect(h1?.textContent).toContain('quanto ele custa');

    const tagline = compiled.querySelector('.hero-content .tagline');
    expect(tagline?.textContent).toContain('Notação assintótica');
  });

  it('deve renderizar o card de demonstração do Quick Sort com narração e pseudocódigo', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const cardTitle = compiled.querySelector('.chalkboard-card .card-title');
    expect(cardTitle?.textContent).toContain('Quick Sort · passo 7 / 24');

    const narration = compiled.querySelector('.chalkboard-narration .narration-text');
    expect(narration?.textContent).toContain('passo 7:');
    expect(narration?.textContent).toContain('A[3] = 33 ≤ pivô 58');

    const highlightedLine = compiled.querySelector('.code-line.line-highlighted');
    expect(highlightedLine?.textContent).toContain('se A[j] <= pivo então');
  });

  it('deve renderizar os 3 cards de notação assintótica (O, Ω, Θ)', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const notationCards = compiled.querySelectorAll('.notation-card');
    expect(notationCards.length).toBe(3);

    const cardO = compiled.querySelector('.notation-card.card-big-o');
    expect(cardO?.textContent).toContain('O(n)');
    expect(cardO?.textContent).toContain('limite superior');

    const cardOmega = compiled.querySelector('.notation-card.card-omega');
    expect(cardOmega?.textContent).toContain('Ω(n)');
    expect(cardOmega?.textContent).toContain('limite inferior');

    const cardTheta = compiled.querySelector('.notation-card.card-theta');
    expect(cardTheta?.textContent).toContain('Θ(n)');
    expect(cardTheta?.textContent).toContain('limite justo');
  });

  it('deve renderizar a tabela com as 6 ordens de complexidade assintótica', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const rows = compiled.querySelectorAll('.growth-table tbody tr');
    expect(rows.length).toBe(6);
    expect(rows[0].textContent).toContain('O(1)');
    expect(rows[5].textContent).toContain('O(2ⁿ)');
  });

  it('deve renderizar os 6 cards de trilhas clássicas com links válidos', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const trackCards = compiled.querySelectorAll('.track-card');
    expect(trackCards.length).toBe(6);

    const firstCard = trackCards[0];
    expect(firstCard.textContent).toContain('Merge Sort');
    expect(firstCard.textContent).toContain('Θ(n log n)');

    const secondCard = trackCards[1];
    expect(secondCard.textContent).toContain('Quick Sort');
    expect(secondCard.textContent).toContain('O(n²)');
  });

  it('deve renderizar os 4 pilares metodológicos na lousa', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const featureCards = compiled.querySelectorAll('.feature-card');
    expect(featureCards.length).toBe(4);
    expect(featureCards[0].textContent).toContain('O desenho da memória');
    expect(featureCards[1].textContent).toContain('A narração do professor');
    expect(featureCards[2].textContent).toContain('O pseudocódigo em foco');
    expect(featureCards[3].textContent).toContain('O custo: Ω, Θ e O');
  });

  it('deve alternar o menu móvel ao clicar no toggle', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const toggleButton = compiled.querySelector('.mobile-menu-toggle') as HTMLButtonElement;
    expect(toggleButton).toBeTruthy();

    expect(component['isMobileMenuOpen']()).toBe(false);
    toggleButton.click();
    fixture.detectChanges();
    expect(component['isMobileMenuOpen']()).toBe(true);

    const mobileNav = compiled.querySelector('#mobile-nav-menu');
    expect(mobileNav).toBeTruthy();
  });

  it('deve possuir o link "ver as 18 trilhas →" apontando para /trilhas', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const seeAllLink = compiled.querySelector<HTMLAnchorElement>('.see-all-link');
    expect(seeAllLink).toBeTruthy();
    expect(seeAllLink?.getAttribute('href')).toBe('/trilhas');
  });
});
