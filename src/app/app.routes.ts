import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/log-in/log-in').then((m) => m.LogIn),
    canActivate: [guestGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dasboard-component/dasboard-component').then(
        (m) => m.DashboardComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'members',
    loadComponent: () =>
      import('./features/members/member-list/member-list').then((m) => m.MemberListComponent),
    canActivate: [authGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'members/new',
    loadComponent: () =>
      import('./features/members/member-form/member-form').then((m) => m.MemberFormComponent),
    canActivate: [authGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'members/:id',
    loadComponent: () =>
      import('./features/members/member-detail/member-detail').then((m) => m.MemberDetailComponent),
    canActivate: [authGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'members/:id/edit',
    loadComponent: () =>
      import('./features/members/member-form/member-form').then((m) => m.MemberFormComponent),
    canActivate: [authGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'fee-settings',
    loadComponent: () =>
      import('./features/fees/fee-settings/fee-settings').then((m) => m.FeeSettingsComponent),
    canActivate: [authGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'payments',
    loadComponent: () =>
      import('./features/payments/payment-list/payment-list').then((m) => m.PaymentListComponent),
    canActivate: [authGuard],
  },
  {
    path: 'payments/new',
    loadComponent: () =>
      import('./features/payments/payment-form/payment-form').then((m) => m.PaymentFormComponent),
    canActivate: [authGuard],
  },
  {
    path: 'payments/:id',
    loadComponent: () =>
      import('./features/payments/payment-detail/payment-detail').then(
        (m) => m.PaymentDetailComponent,
      ),
    canActivate: [authGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'elections',
    loadComponent: () =>
      import('./features/elections/election-list/election-list').then(
        (m) => m.ElectionListComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'elections/new',
    loadComponent: () =>
      import('./features/elections/election-form/election-form').then(
        (m) => m.ElectionFormComponent,
      ),
    canActivate: [authGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'elections/history',
    loadComponent: () =>
      import('./features/elections/election-history/election-history').then(
        (m) => m.ElectionHistoryComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'elections/:id',
    loadComponent: () =>
      import('./features/elections/election-detail/election-detail').then(
        (m) => m.ElectionDetailComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'transactions',
    loadComponent: () =>
      import('./features/Daraja/components/daraja-transactions/daraja-transactions').then(
        (m) => m.DarajaTransactionsComponent,
      ),
    canActivate: [authGuard],
    data: { roles: ['admin'] },
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' },
];
