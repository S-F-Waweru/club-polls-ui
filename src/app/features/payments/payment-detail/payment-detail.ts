import { Component, OnInit, computed, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Tag } from 'primeng/tag';
import { DashboardShellComponent } from '../../../core/components/DashboardShellComponent';
import { FEE_TYPE_LABELS, Payment } from '../../../models/club.models';
import { PaymentsStore } from '../../../state/payment.store';

@Component({
  selector: 'app-payment-detail',
  standalone: true,
  imports: [DashboardShellComponent, Tag, Button, RouterLink, DatePipe, DecimalPipe, ConfirmDialog],
  templateUrl: './payment-detail.html',
  styleUrl: './payment-detail.css',
})
export class PaymentDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly confirm = inject(ConfirmationService);
  readonly store = inject(PaymentsStore);
  readonly paymentId = this.route.snapshot.paramMap.get('id')!;

  payment = computed(() => this.store.selectedPayment());

  ngOnInit() {
    this.store.loadPaymentById(this.paymentId);
  }

  feeLabel(payment: Payment) {
    return FEE_TYPE_LABELS[payment.feeType] ?? payment.feeType;
  }

  statusSeverity(status: string): 'success' | 'warn' | 'danger' | 'secondary' {
    const map: Record<string, 'success' | 'warn' | 'danger' | 'secondary'> = {
      VERIFIED: 'success',
      PENDING: 'warn',
      FAILED: 'danger',
    };
    return map[status] ?? 'secondary';
  }

  methodIcon(method: string) {
    return { MPESA: 'pi pi-mobile', BANK: 'pi pi-building-columns', CASH: 'pi pi-wallet' }[method] ?? 'pi pi-credit-card';
  }

  methodColor(method: string) {
    return { MPESA: '#22c55e', BANK: '#3b82f6', CASH: '#f59e0b' }[method] ?? 'var(--text-muted)';
  }

  confirmVerify() {
    this.confirm.confirm({
      message: 'Mark this member payment as verified?',
      header: 'Verify Payment',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Verify',
      acceptButtonStyleClass: 'p-button-success',
      accept: () => this.store.verifyPayment(this.paymentId),
    });
  }

  confirmReject() {
    this.confirm.confirm({
      message: 'Reject this member payment?',
      header: 'Reject Payment',
      icon: 'pi pi-times-circle',
      acceptLabel: 'Reject',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.store.rejectPayment(this.paymentId),
    });
  }
}
