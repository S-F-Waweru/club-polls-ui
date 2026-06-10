import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DashboardShellComponent } from '../../../core/components/DashboardShellComponent';
import { Tag } from 'primeng/tag';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { PaymentsStore } from '../../../state/payment.store';

@Component({
  selector: 'app-payment-detail',
  standalone: true,
  imports: [
    DashboardShellComponent,
    Tag,
    CommonModule,
    Button,
    RouterLink,
    DecimalPipe,
    DatePipe,
    ConfirmDialog,
  ],
  templateUrl: './payment-detail.html',
  styleUrl: './payment-detail.css',
  providers: [ConfirmationService],
})
export class PaymentDetailComponent {
  private route = inject(ActivatedRoute);
  store = inject(PaymentsStore);
  private confirm = inject(ConfirmationService);

  private paymentId = this.route.snapshot.paramMap.get('id');
  payment = computed(() => this.store.entities().find((p) => p.id === this.paymentId) ?? null);

  constructor() {
    if (this.paymentId) this.store.loadPaymentById(this.paymentId);
  }

  statusSeverity(status: string): 'success' | 'warn' | 'danger' | 'secondary' {
    const map: Record<string, any> = { VERIFIED: 'success', PENDING: 'warn', FAILED: 'danger' };
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

  get progressPercent() {
    const inv = this.payment()?.invoice;
    if (!inv || inv.totalAmount === 0) return 0;
    return Math.round(((inv.totalAmount - inv.balance) / inv.totalAmount) * 100);
  }

  confirmVerify() {
    this.confirm.confirm({
      message: 'Mark this payment as verified?',
      header: 'Verify Payment',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Verify',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-success',
      accept: () => this.store.verifyPayment(this.paymentId!),
    });
  }

  confirmReject() {
    this.confirm.confirm({
      message: 'Reject this payment? This will mark it as FAILED.',
      header: 'Reject Payment',
      icon: 'pi pi-times-circle',
      acceptLabel: 'Reject',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.store.rejectPayment(this.paymentId!),
    });
  }
}
