import { Routes } from '@angular/router';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/log-in/log-in').then(m => m.LogIn),
    canActivate: [guestGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dasboard-component/dasboard-component').then(m => m.DashboardComponent),
  },
  {
    path: 'finances-overview',
    loadComponent: () => import('./features/overview/financial-overview/financial-overview').then(m => m.FinancialOverview),
  },
  {
    path: 'courses-overview',
    loadComponent: () => import('./features/overview/courses-overview/courses-overview').then(m => m.CoursesOverview),
  },

  { path: 'students', loadComponent: () => import('./features/students/student-list/student-list').then(m => m.StudentListComponent) },
  { path: 'students/new', loadComponent: () => import('./features/students/student-form/student-form').then(m => m.StudentFormComponent) },
  { path: 'students/:id', loadComponent: () => import('./features/students/student-detail/student-detail').then(m => m.StudentDetailComponent) },
  { path: 'students/:id/edit', loadComponent: () => import('./features/students/student-form/student-form').then(m => m.StudentFormComponent) },

  { path: 'courses', loadComponent: () => import('./features/courses/course-list/course-list').then(m => m.CourseListComponent) },
  { path: 'courses/new', loadComponent: () => import('./features/courses/course-form/course-form').then(m => m.CourseFormComponent) },
  { path: 'courses/:id', loadComponent: () => import('./features/courses/course-detail/course-detail').then(m => m.CourseDetailComponent) },
  { path: 'courses/:id/edit', loadComponent: () => import('./features/courses/course-form/course-form').then(m => m.CourseFormComponent) },

  { path: 'enrollments', loadComponent: () => import('./features/enrollments/enrollment-list-component/enrollment-list-component').then(m => m.EnrollmentListComponent) },
  { path: 'enrollments/new', loadComponent: () => import('./features/enrollments/enrollment-form/enrollment-form').then(m => m.EnrollmentFormComponent) },
  { path: 'enrollments/:id', loadComponent: () => import('./features/enrollments/enrollment-detail/enrollment-detail').then(m => m.EnrollmentDetailComponent) },
  { path: 'enrollments/:id/edit', loadComponent: () => import('./features/enrollments/enrollment-form/enrollment-form').then(m => m.EnrollmentFormComponent) },

  { path: 'payments', loadComponent: () => import('./features/payments/payment-list/payment-list').then(m => m.PaymentListComponent) },
  { path: 'payments/new', loadComponent: () => import('./features/payments/payment-form/payment-form').then(m => m.PaymentFormComponent) },
  { path: 'payments/:id', loadComponent: () => import('./features/payments/payment-detail/payment-detail').then(m => m.PaymentDetailComponent) },
  { path: 'payments/:id/edit', loadComponent: () => import('./features/payments/payment-form/payment-form').then(m => m.PaymentFormComponent) },

  { path: 'invoices', loadComponent: () => import('./features/invoices/invoice-list/invoice-list').then(m => m.InvoiceListComponent) },
  { path: 'invoices/:id', loadComponent: () => import('./features/invoices/invoice-detail/invoice-detail').then(m => m.InvoiceDetailComponent) },

  { path: 'transactions', loadComponent: () => import('./features/Daraja/components/daraja-transactions/daraja-transactions').then(m => m.DarajaTransactionsComponent) },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
