import { Component, OnInit, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { DashboardShellComponent } from '../../../core/components/DashboardShellComponent';
import { ClubFeeType, CreatePaymentDto, PaymentMethod } from '../../../models/club.models';
import { AuthStore } from '../../../state/auth.store';
import { FeeSettingsStore } from '../../../state/fee-settings.store';
import { PaymentsStore } from '../../../state/payment.store';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [DashboardShellComponent, FormsModule, Button, InputText, Select, RouterLink, DecimalPipe],
  templateUrl: './payment-form.html',
  styleUrl: './payment-form.css',
})
export class PaymentFormComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly auth = inject(AuthStore);
  readonly store = inject(PaymentsStore);
  readonly fees = inject(FeeSettingsStore);

  feeTypeOptions: ClubFeeType[] = ['JOINING_FEE', 'MEMBERSHIP_FEE'];
  methodOptions: PaymentMethod[] = ['MPESA', 'BANK', 'CASH'];

  adminForm: CreatePaymentDto = {
    memberId: '',
    feeType: 'MEMBERSHIP_FEE',
    amount: undefined,
    method: 'CASH',
    transactionRef: '',
    paidAt: new Date().toISOString().slice(0, 10),
    periodStart: `${new Date().getFullYear()}-01-01`,
    periodEnd: `${new Date().getFullYear()}-12-31`,
  };

  memberForm = {
    feeType: 'MEMBERSHIP_FEE' as ClubFeeType,
    phoneNumber: '',
  };

  ngOnInit() {
    this.fees.loadCurrent();
    const memberId = this.route.snapshot.queryParamMap.get('memberId');
    if (memberId) this.adminForm.memberId = memberId;
  }

  isAdmin = this.auth.isAdmin;

  feeLabel(feeType: string) {
    return feeType === 'JOINING_FEE' ? 'Joining Fee' : 'Membership Fee';
  }

  suggestedAmount() {
    const current = this.fees.current();
    if (!current) return 0;
    return this.adminForm.feeType === 'JOINING_FEE'
      ? Number(current.joiningFee)
      : Number(current.membershipFee);
  }

  submit() {
    if (this.auth.isAdmin()) {
      const payload: CreatePaymentDto = cleanPayload({
        ...this.adminForm,
        amount: this.adminForm.amount ? Number(this.adminForm.amount) : undefined,
        periodStart: this.adminForm.feeType === 'MEMBERSHIP_FEE' ? this.adminForm.periodStart : undefined,
        periodEnd: this.adminForm.feeType === 'MEMBERSHIP_FEE' ? this.adminForm.periodEnd : undefined,
      });
      this.store.createPayment(payload);
      window.setTimeout(() => this.router.navigate(['/payments']), 250);
      return;
    }

    this.store.requestMyMpesaPayment(cleanPayload(this.memberForm));
    window.setTimeout(() => this.router.navigate(['/payments']), 250);
  }
}

function cleanPayload<T extends Record<string, any>>(payload: T): T {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  ) as T;
}
