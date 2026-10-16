import { ActivatedRouteSnapshot, ResolveFn, Routes } from '@angular/router';
import { ALL_ALGORITHM_CONTENTS } from './content';

export const algorithmTitleResolver: ResolveFn<string> = (route: ActivatedRouteSnapshot) => {
  const id = route.paramMap.get('id');
  const found = ALL_ALGORITHM_CONTENTS.find((c) => c.id === id);
  if (found) {
    return `${found.title} · Big O`;
  }
  return 'Visualizador · Big O';
};

export const routes: Routes = [
  {
    path: 'ordenacao',
    redirectTo: 'ordenacao/quick-sort',
    pathMatch: 'full'
  },
  {
    path: 'ordenacao/:id',
    loadComponent: () => import('./features/visualizer/visualizer.component').then(m => m.VisualizerComponent),
    title: algorithmTitleResolver,
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
    title: algorithmTitleResolver,
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
    path: 'sandbox',
    loadComponent: () => import('./features/sandbox/sandbox.component').then(m => m.SandboxComponent),
    title: 'Sandbox & Arena · Big O'
  },
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    title: 'Big O · Guia Visual de Algoritmos'
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'Página não encontrada · Big O'
  }
];
