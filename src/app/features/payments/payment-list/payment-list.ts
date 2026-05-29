import { Component, computed, inject, signal } from '@angular/core';
import { DashboardShellComponent } from '../../../core/components/DashboardShellComponent';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { DatePipe, DecimalPipe, SlicePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { Payment, PaymentsStore } from '../../../state/payment.store';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [
    DashboardShellComponent,
    Button,
    InputText,
    FormsModule,
    TableModule,
    Tag,
    DatePipe,
    DecimalPipe,
    RouterLink,
    ConfirmDialog,
  ],
  templateUrl: './payment-list.html',
  styleUrl: './payment-list.css',
})
export class PaymentListComponent {
  private store = inject(PaymentsStore);
  private confirm = inject(ConfirmationService);

  search = '';
  activeFilter = signal('All');
  filters = ['All', 'PENDING', 'SUCCESS', 'FAILED'];
  methodFilters = ['All', 'MPESA', 'BANK', 'CASH'];
  activeMethod = signal('All');

  payments = this.store.entities;
  isLoading = this.store.isLoading;
  total = this.store.totalRecords;

  filtered = computed(() => {
    let list = this.payments();

    if (this.activeFilter() !== 'All') list = list.filter((p) => p.status === this.activeFilter());
    if (this.activeMethod() !== 'All') list = list.filter((p) => p.method === this.activeMethod());
    const q = this.search.toLowerCase();
    if (q)
      list = list.filter(
        (p) =>
          p.transactionRef.toLowerCase().includes(q) ||
          p.recordedBy?.name.toLowerCase().includes(q) ||
          p.invoice.enrollment.student.fullName.toLowerCase().includes(q),
      );
    return list;
  });

  stats = computed(() => {
    const all = this.payments();
    const success = all.filter((p) => p.status === 'SUCCESS');
    const pending = all.filter((p) => p.status === 'PENDING').length;
    const failed = all.filter((p) => p.status === 'FAILED').length;
    const totalCollected = success.reduce((sum, p) => sum + p.amount, 0);
    return [
      {
        label: 'Total Payments',
        value: all.length,
        sub: 'All records',
        color: 'var(--text-muted)',
      },
      {
        label: 'Collected',
        value: `KES ${totalCollected.toLocaleString()}`,
        sub: 'Successful only',
        color: 'var(--success)',
      },
      { label: 'Pending', value: pending, sub: 'Awaiting confirmation', color: 'var(--warn)' },
      { label: 'Failed', value: failed, sub: 'Unsuccessful', color: 'var(--danger)' },
    ];
  });

  statusSeverity(status: string): 'success' | 'warn' | 'danger' | 'secondary' {
    const map: Record<string, any> = { SUCCESS: 'success', PENDING: 'warn', FAILED: 'danger' };
    return map[status] ?? 'secondary';
  }

  invoiceSeverity(status: string): 'success' | 'warn' | 'danger' | 'secondary' {
    const map: Record<string, any> = { PAID: 'success', PARTIAL: 'warn', UNPAID: 'danger' };
    return map[status] ?? 'secondary';
  }

  methodIcon(method: string) {
    return (
      { MPESA: 'pi pi-mobile', BANK: 'pi pi-building-columns', CASH: 'pi pi-wallet' }[method] ??
      'pi pi-credit-card'
    );
  }

  methodColor(method: string) {
    return { MPESA: '#22c55e', BANK: '#3b82f6', CASH: '#f59e0b' }[method] ?? 'var(--text-muted)';
  }

  initials(name: string) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  avatarBg(name: string) {
    const colors = [
      '#6366f1',
      '#22c55e',
      '#f59e0b',
      '#3b82f6',
      '#ec4899',
      '#14b8a6',
      '#8b5cf6',
      '#f97316',
    ];
    return colors[name.charCodeAt(0) % colors.length];
  }

  confirmDelete(p: Payment) {
    this.confirm.confirm({
      message: `Delete payment ${p.transactionRef}?`,
      header: 'Delete Payment',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.store.deletePayment(p.id),
    });
  }
}
