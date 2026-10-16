import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CategoryFilter, CatalogTrackItem } from './catalog.types';
import { DATA_STRUCTURE_TRACKS, SORTING_TRACKS } from './catalog.data';

@Component({
  selector: 'app-catalog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgOptimizedImage],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss'
})
export class CatalogComponent {
  protected readonly searchQuery = signal('');
  protected readonly selectedCategory = signal<CategoryFilter>('all');

  protected readonly allSortingTracks = SORTING_TRACKS;
  protected readonly allDataStructureTracks = DATA_STRUCTURE_TRACKS;

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private filterTrack(track: CatalogTrackItem, query: string): boolean {
    if (!query) return true;
    const normalizedQuery = this.normalizeText(query);
    const targetFields = [
      track.title,
      track.description,
      track.summaryMetrics,
      track.familyTag,
      track.complexityBadge
    ].map((f) => this.normalizeText(f));

    return targetFields.some((field) => field.includes(normalizedQuery));
  }

  protected readonly filteredSortingTracks = computed(() => {
    const query = this.searchQuery().trim();
    return this.allSortingTracks.filter((track) => this.filterTrack(track, query));
  });

  protected readonly filteredDataStructureTracks = computed(() => {
    const query = this.searchQuery().trim();
    return this.allDataStructureTracks.filter((track) => this.filterTrack(track, query));
  });

  protected readonly isSortingVisible = computed(() => {
    const cat = this.selectedCategory();
    return cat === 'all' || cat === 'sorting';
  });

  protected readonly isDataStructuresVisible = computed(() => {
    const cat = this.selectedCategory();
    return cat === 'all' || cat === 'data-structure';
  });

  protected readonly totalVisibleCount = computed(() => {
    let count = 0;
    if (this.isSortingVisible()) {
      count += this.filteredSortingTracks().length;
    }
    if (this.isDataStructuresVisible()) {
      count += this.filteredDataStructureTracks().length;
    }
    return count;
  });

  protected setCategory(category: CategoryFilter): void {
    this.selectedCategory.set(category);
  }

  protected onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  protected clearSearch(): void {
    this.searchQuery.set('');
    this.selectedCategory.set('all');
  }
}
