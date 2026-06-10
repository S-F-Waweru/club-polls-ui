import { Component, computed, inject, signal } from '@angular/core';
import { DashboardShellComponent } from '../../../core/components/DashboardShellComponent';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { Invoice, InvoicesStore } from '../../../state/invoice.store';

@Component({
  selector: 'app-invoice-list',
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
  templateUrl: './invoice-list.html',
  styleUrl: './invoice-list.css',
})
export class InvoiceListComponent {
  search = '';
  activeFilter = signal('All');
  filters = ['All', 'UNPAID', 'PARTIAL', 'PAID'];

  invoiceStore = inject(InvoicesStore);
  private confirm = inject(ConfirmationService);

  invoices = this.invoiceStore.entities;
  isLoading = this.invoiceStore.isLoading;
  total = this.invoiceStore.totalRecords;

  filtered = computed(() => {
    let list = this.invoices();
    if (this.activeFilter() !== 'All') {
      list = list.filter((i) => i.status === this.activeFilter());
    }
    const q = this.search.toLowerCase();
    if (q) {
      list = list.filter(
        (i) =>
          i.enrollment.student.fullName.toLowerCase().includes(q) ||
          i.enrollment.student.studentId.toLowerCase().includes(q) ||
          i.enrollment.course.name.toLowerCase().includes(q) ||
          i.id.toLowerCase().includes(q),
      );
    }
    return list;
  });

  recent = computed(() => this.invoices().slice(0, 4));

  stats = computed(() => {
    const all = this.invoices();
    const unpaid = all.filter((i) => i.status === 'UNPAID').length;
    const partial = all.filter((i) => i.status === 'PARTIAL').length;
    const paid = all.filter((i) => i.status === 'PAID').length;
    const totalBalance = all.reduce((sum, i) => sum + i.balance, 0);
    return [
      {
        label: 'Total Invoices',
        value: all.length,
        sub: 'All records',
        color: 'var(--text-muted)',
      },
      { label: 'Unpaid', value: unpaid, sub: 'Awaiting payment', color: 'var(--danger)' },
      { label: 'Partial', value: partial, sub: 'Partially cleared', color: 'var(--warn)' },
      {
        label: 'Outstanding (KES)',
        value: totalBalance.toLocaleString(),
        sub: 'Total balance due',
        color: 'var(--danger)',
      },
    ];
  });

  invoiceSeverity(status: string): 'success' | 'danger' | 'warn' | 'secondary' {
    const map: Record<string, any> = { PAID: 'success', PARTIAL: 'warn', UNPAID: 'danger' };
    return map[status] ?? 'secondary';
  }

  confirmDelete(inv: Invoice) {
    this.confirm.confirm({
      message: `Delete invoice for ${inv.enrollment.student.fullName}?`,
      header: 'Delete Invoice',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.invoiceStore.deleteInvoice(inv.id),
    });
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
}
