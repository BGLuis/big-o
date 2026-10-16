import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeroPreviewComponent } from './components/hero-preview/hero-preview.component';
import { GrowthBoardComponent } from './components/growth-board/growth-board.component';

export interface ClassicalTrack {
  readonly id: string;
  readonly title: string;
  readonly category: 'ordenação' | 'estrutura';
  readonly complexity: string;
  readonly complexityType: 'theta' | 'big-o';
  readonly description: string;
  readonly summary: string;
  readonly route: readonly [string, string];
}

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, HeroPreviewComponent, GrowthBoardComponent, NgOptimizedImage],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  protected readonly isMobileMenuOpen = signal(false);

  protected readonly classicalTracks: readonly ClassicalTrack[] = [
    {
      id: 'merge-sort',
      title: 'Merge Sort',
      category: 'ordenação',
      complexity: 'Θ(n log n)',
      complexityType: 'theta',
      description: 'Divide ao meio até sublistas unitárias e as intercala ordenadas num buffer auxiliar.',
      summary: 'Ω(n log n) · O(n log n) · espaço O(n)',
      route: ['/ordenacao', 'merge-sort']
    },
    {
      id: 'quick-sort',
      title: 'Quick Sort',
      category: 'ordenação',
      complexity: 'O(n²)',
      complexityType: 'big-o',
      description: 'Particiona o array ao redor de um pivô e ordena as duas partes recursivamente.',
      summary: 'Ω(n log n) · pior O(n²) · espaço O(log n)',
      route: ['/ordenacao', 'quick-sort']
    },
    {
      id: 'bubble-sort',
      title: 'Bubble Sort',
      category: 'ordenação',
      complexity: 'O(n²)',
      complexityType: 'big-o',
      description: 'Compara pares de elementos adjacentes e os troca sempre que estão fora de ordem.',
      summary: 'Ω(n) · pior O(n²) · espaço O(1)',
      route: ['/ordenacao', 'bubble-sort']
    },
    {
      id: 'bst',
      title: 'Árvore Binária de Busca',
      category: 'estrutura',
      complexity: 'Θ(log n)',
      complexityType: 'theta',
      description: 'Nós à esquerda menores, à direita maiores que a raiz — busca e inserção eficientes.',
      summary: 'médio O(log n) · pior O(n) · espaço O(n)',
      route: ['/data-structures', 'bst']
    },
    {
      id: 'linked-list',
      title: 'Lista Encadeada',
      category: 'estrutura',
      complexity: 'O(n)',
      complexityType: 'big-o',
      description: 'Nós ligados por ponteiros, sem posições contíguas. Inserção Θ(1) na cabeça.',
      summary: 'inserir Θ(1) · buscar O(n) · espaço O(n)',
      route: ['/data-structures', 'linked-list']
    },
    {
      id: 'hash-map',
      title: 'Tabela Hash',
      category: 'estrutura',
      complexity: 'O(n)',
      complexityType: 'big-o',
      description: 'Chave-valor com função hash e encadeamento separado para tratar colisões.',
      summary: 'médio Θ(1) · pior O(n) · espaço O(n)',
      route: ['/data-structures', 'hash-map']
    }
  ];

  protected toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((open) => !open);
  }

  protected closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }
}
