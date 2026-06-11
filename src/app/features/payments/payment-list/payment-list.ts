import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { InputText } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { DashboardShellComponent } from '../../../core/components/DashboardShellComponent';
import { FEE_TYPE_LABELS, Payment } from '../../../models/club.models';
import { AuthStore } from '../../../state/auth.store';
import { PaymentsStore } from '../../../state/payment.store';

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
export class PaymentListComponent implements OnInit {
  readonly store = inject(PaymentsStore);
  readonly auth = inject(AuthStore);
  private readonly confirm = inject(ConfirmationService);

  search = '';
  activeStatus = signal('All');
  activeFeeType = signal('All');
  activeMethod = signal('All');
  statusFilters = ['All', 'PENDING', 'VERIFIED', 'FAILED'];
  feeFilters = ['All', 'JOINING_FEE', 'MEMBERSHIP_FEE'];
  methodFilters = ['All', 'MPESA', 'BANK', 'CASH'];

  payments = this.store.entities;
  isLoading = this.store.isLoading;
  total = this.store.totalRecords;
  isAdmin = this.auth.isAdmin;

  ngOnInit() {
    this.reload();
  }

  reload() {
    if (this.auth.isAdmin()) {
      this.store.loadPayments();
    } else {
      this.store.loadMyPayments();
    }
  }

  filtered = computed(() => {
    let list = this.payments();
    if (this.activeStatus() !== 'All') list = list.filter((payment) => payment.status === this.activeStatus());
    if (this.activeFeeType() !== 'All') list = list.filter((payment) => payment.feeType === this.activeFeeType());
    if (this.activeMethod() !== 'All') list = list.filter((payment) => payment.method === this.activeMethod());

    const q = this.search.trim().toLowerCase();
    if (!q) return list;

    return list.filter((payment) => {
      const member = payment.member;
      return (
        payment.transactionRef?.toLowerCase().includes(q) ||
        member?.fullName.toLowerCase().includes(q) ||
        member?.memberId.toLowerCase().includes(q) ||
        payment.recordedBy?.name.toLowerCase().includes(q)
      );
    });
  });

  stats = computed(() => {
    const all = this.payments();
    const verified = all.filter((payment) => payment.status === 'VERIFIED');
    const pending = all.filter((payment) => payment.status === 'PENDING').length;
    const failed = all.filter((payment) => payment.status === 'FAILED').length;
    const collected = verified.reduce((sum, payment) => sum + Number(payment.amount), 0);

    return [
      { label: 'Records', value: this.total() || all.length, sub: 'Fee payments', color: 'var(--text-muted)' },
      { label: 'Collected', value: `KES ${collected.toLocaleString()}`, sub: 'Verified', color: 'var(--success)' },
      { label: 'Pending', value: pending, sub: 'Awaiting action', color: 'var(--warning)' },
      { label: 'Failed', value: failed, sub: 'Rejected or failed', color: 'var(--danger)' },
    ];
  });

  statusSeverity(status: string): 'success' | 'warn' | 'danger' | 'secondary' {
    const map: Record<string, 'success' | 'warn' | 'danger' | 'secondary'> = {
      VERIFIED: 'success',
      PENDING: 'warn',
      FAILED: 'danger',
    };
    return map[status] ?? 'secondary';
  }

  feeLabel(payment: Payment) {
    return FEE_TYPE_LABELS[payment.feeType] ?? payment.feeType;
  }

  methodIcon(method: string) {
    return { MPESA: 'pi pi-mobile', BANK: 'pi pi-building-columns', CASH: 'pi pi-wallet' }[method] ?? 'pi pi-credit-card';
  }

  methodColor(method: string) {
    return { MPESA: '#22c55e', BANK: '#3b82f6', CASH: '#f59e0b' }[method] ?? 'var(--text-muted)';
  }

  confirmVerify(payment: Payment) {
    this.confirm.confirm({
      message: `Verify ${this.feeLabel(payment)} for ${payment.member?.memberId ?? 'member'}?`,
      header: 'Verify Payment',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Verify',
      acceptButtonStyleClass: 'p-button-success',
      accept: () => this.store.verifyPayment(payment.id),
    });
  }

  confirmReject(payment: Payment) {
    this.confirm.confirm({
      message: `Reject payment ${payment.transactionRef || payment.id}?`,
      header: 'Reject Payment',
      icon: 'pi pi-times-circle',
      acceptLabel: 'Reject',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.store.rejectPayment(payment.id),
    });
  }

  onPageChange(event: any) {
    const page = (event.page ?? 0) + 1;
    const limit = event.rows ?? this.store.limit();

    if (limit !== this.store.limit()) {
      this.store.setLimit(limit);
    } else {
      this.store.setPage(page);
    }

    this.reload();
  }
}
