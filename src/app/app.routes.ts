import { Routes } from '@angular/router';
import { LogIn } from './features/auth/log-in/log-in';
import { guestGuard } from './core/guards/guest.guard';
import { DashboardComponent } from './features/dashboard/dasboard-component/dasboard-component';
import { StudentListComponent } from './features/students/student-list/student-list';
import { StudentDetailComponent } from './features/students/student-detail/student-detail';

export const routes: Routes = [
  {
    path: 'login',
    component:LogIn,
    canActivate: [guestGuard] //
  },

  {
    path: 'dashboard',
    component:DashboardComponent
    // You'd use an authGuard here to block guests from the dashboard
  },
  { path: 'students', component: StudentListComponent},
  { path: 'students/:id', component: StudentDetailComponent },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
