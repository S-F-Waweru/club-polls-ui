import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DashboardShellComponent } from '../../../core/components/DashboardShellComponent';
import { Tag } from 'primeng/tag';
import { CommonModule } from '@angular/common';
import { InvoicesStore } from '../../../state/invoice.store';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [DashboardShellComponent, Tag, CommonModule, Button, RouterLink],
  templateUrl: './invoice-detail.html',
  styleUrl: './invoice-detail.css',
})
export class InvoiceDetailComponent {
  private route = inject(ActivatedRoute);
  store = inject(InvoicesStore);

  private invoiceId = this.route.snapshot.paramMap.get('id');

  invoice = computed(() => this.store.entities().find((i) => i.id === this.invoiceId) ?? null);

  constructor() {
    if (this.invoiceId) this.store.loadInvoiceById(this.invoiceId);
  }

  invoiceSeverity(status: string): 'success' | 'danger' | 'warn' | 'secondary' {
    const map: Record<string, any> = { PAID: 'success', PARTIAL: 'warn', UNPAID: 'danger' };
    return map[status] ?? 'secondary';
  }

  enrollmentSeverity(status: string): 'success' | 'info' | 'danger' | 'secondary' {
    const map: Record<string, any> = { ACTIVE: 'success', COMPLETED: 'info', DROPPED: 'danger' };
    return map[status] ?? 'secondary';
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

  get paidAmount() {
    const inv = this.invoice();
    return inv ? inv.totalAmount - inv.balance : 0;
  }

  get progressPercent() {
    const inv = this.invoice();
    if (!inv || inv.totalAmount === 0) return 0;
    return Math.round(((inv.totalAmount - inv.balance) / inv.totalAmount) * 100);
  }
}
