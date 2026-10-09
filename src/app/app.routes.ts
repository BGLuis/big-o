import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'ordenacao',
    redirectTo: 'ordenacao/quick-sort',
    pathMatch: 'full'
  },
  {
    path: 'ordenacao/:id',
    loadComponent: () => import('./features/visualizer/visualizer.component').then(m => m.VisualizerComponent),
    data: { category: 'sorting' }
  },
  {
    path: 'algorithms',
    redirectTo: 'ordenacao/quick-sort',
    pathMatch: 'full'
  },
  {
    path: 'algorithms/:id',
    redirectTo: 'ordenacao/:id'
  },
  {
    path: 'data-structures',
    redirectTo: 'data-structures/array',
    pathMatch: 'full'
  },
  {
    path: 'data-structures/:id',
    loadComponent: () => import('./features/visualizer/visualizer.component').then(m => m.VisualizerComponent),
    data: { category: 'data-structure' }
  },
  {
    path: 'trilhas',
    loadComponent: () => import('./features/catalog/catalog.component').then((m) => m.CatalogComponent),
    title: 'Trilhas de Estudo · Big O'
  },
  {
    path: 'catalogo',
    redirectTo: 'trilhas',
    pathMatch: 'full'
  },
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  }
];
