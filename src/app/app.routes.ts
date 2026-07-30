import type { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Iniciar sesión',
    loadComponent: () => import('./features/auth/pages/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      {
        path: 'factorization',
        title: 'Factorización QR',
        loadComponent: () =>
          import('./features/factorization/pages/factorization.page').then(
            (m) => m.FactorizationPage,
          ),
      },
      { path: '', redirectTo: 'factorization', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '' },
];
