import { Component, signal } from '@angular/core';
import { DashboardShellComponent } from '../../../core/components/DashboardShellComponent';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';

interface RecentActivity {
  id: string;
  student: string;
  action: string;
  amount: string;
  status: 'completed' | 'pending' | 'failed';
  date: string;
}


@Component({
  selector: 'app-dasboard-component',
  imports: [DashboardShellComponent, Button, TableModule, Tag],
  templateUrl: './dasboard-component.html',
  styleUrl: './dasboard-component.css',
})
export class DashboardComponent {
  // Mock statistical metrics
  metrics = signal([
    {
      label: 'Total Active Students',
      value: '1,248',
      change: '+4.2%',
      icon: 'pi pi-users',
      color: 'var(--p-primary-500)',
    },
    {
      label: 'Term Revenue Collected',
      value: 'KES 4.2M',
      change: '+12.8%',
      icon: 'pi pi-wallet',
      color: 'var(--p-green-500)',
    },
    {
      label: 'Pending Reconciliations',
      value: '18',
      change: '-2%',
      icon: 'pi pi-exclamation-circle',
      color: 'var(--p-amber-500)',
    },
  ]);

  // Mock table payload
  activities = signal<RecentActivity[]>([
    {
      id: 'TXN-0982',
      student: 'Kamau Mwangi',
      action: 'Term 2 Fee Clearance',
      amount: 'KES 45,000',
      status: 'completed',
      date: 'Today, 10:14 AM',
    },
    {
      id: 'TXN-0981',
      student: 'Amina Omondi',
      action: 'Admission Application Fee',
      amount: 'KES 2,500',
      status: 'completed',
      date: 'Today, 08:30 AM',
    },
    {
      id: 'TXN-0980',
      student: 'John Doe',
      action: 'Library Overdue Fine',
      amount: 'KES 350',
      status: 'pending',
      date: 'Yesterday',
    },
    {
      id: 'TXN-0979',
      student: 'Grace Mutua',
      action: 'Boarding Deposit Payment',
      amount: 'KES 15,000',
      status: 'failed',
      date: 'May 19, 2026',
    },
  ]);

  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warn';
      case 'failed':
        return 'danger';
      default:
        return 'secondary';
    }
  }
}
