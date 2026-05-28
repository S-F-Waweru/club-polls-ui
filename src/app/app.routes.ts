import { Routes } from '@angular/router';
import { LogIn } from './features/auth/log-in/log-in';
import { guestGuard } from './core/guards/guest.guard';
import { DashboardComponent } from './features/dashboard/dasboard-component/dasboard-component';
import { StudentListComponent } from './features/students/student-list/student-list';
import { StudentDetailComponent } from './features/students/student-detail/student-detail';
import { StudentFormComponent } from './features/students/student-form/student-form';
import { CourseFormComponent } from './features/courses/course-form/course-form';
import { CourseListComponent } from './features/courses/course-list/course-list';
import { CourseDetailComponent } from './features/courses/course-detail/course-detail';
import {EnrollmentListComponent} from './features/enrollments/enrollment-list-component/enrollment-list-component';
import {EnrollmentDetailComponent} from './features/enrollments/enrollment-detail/enrollment-detail';
import {EnrollmentFormComponent} from './features/enrollments/enrollment-form/enrollment-form';
import {InvoiceListComponent} from './features/invoices/invoice-list/invoice-list';
import {InvoiceDetailComponent} from './features/invoices/invoice-detail/invoice-detail';
import {PaymentListComponent} from './features/payments/payment-list/payment-list';
import {PaymentDetailComponent} from './features/payments/payment-detail/payment-detail';
import {PaymentFormComponent} from './features/payments/payment-form/payment-form';

export const routes: Routes = [
  {
    path: 'login',
    component: LogIn,
    canActivate: [guestGuard], //
  },

  {
    path: 'dashboard',
    component: DashboardComponent,
    // You'd use an authGuard here to block guests from the dashboard
  },
  { path: 'students', component: StudentListComponent },
  { path: 'students/new', component: StudentFormComponent },
  { path: 'students/:id', component: StudentDetailComponent },
  { path: 'students/:id/edit', component: StudentFormComponent },

  { path: 'courses', component: CourseListComponent },
  { path: 'courses/new', component: CourseFormComponent },
  { path: 'courses/:id', component: CourseDetailComponent },
  { path: 'courses/:id/edit', component: CourseFormComponent },

  { path: 'enrollments', component: EnrollmentListComponent },
  { path: 'enrollments/new', component: EnrollmentFormComponent },
  { path: 'enrollments/:id', component: EnrollmentDetailComponent },
  { path: 'enrollments/:id/edit', component: EnrollmentFormComponent },

  { path: 'payments', component: PaymentListComponent },
  { path: 'payments/new', component: PaymentFormComponent },
  { path: 'payments/:id', component: PaymentDetailComponent },
  { path: 'payments/:id/edit', component: PaymentFormComponent },

  { path: 'invoices', component: InvoiceListComponent },
  // { path: 'invoices/new', component: EnrollmentFormComponent },
  { path: 'invoices/:id', component: InvoiceDetailComponent },
  // { path: 'invoices/:id/edit', component: EnrollmentFormComponent },

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
