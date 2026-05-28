import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { DashboardShellComponent } from '../../../core/components/DashboardShellComponent';
import { CreatePaymentDto, PaymentsStore } from '../../../state/payment.store';
import { InvoicesStore } from '../../../state/invoice.store';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [
    DashboardShellComponent,
    FormsModule,
    CommonModule,
    Button,
    InputText,
    Select,
    RouterLink,
  ],
  templateUrl: './payment-form.html',
})
export class PaymentFormComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  readonly store = inject(PaymentsStore);
  readonly invoicesStore = inject(InvoicesStore);

  methodOptions = ['MPESA', 'BANK', 'CASH'];

  // invoices as select options
  invoiceOptions = this.invoicesStore.entities;

  form: CreatePaymentDto = {
    invoiceId: '',
    amount: 0,
    method: 'MPESA',
    transactionRef: '',
    paid_at: new Date().toISOString().split('T')[0],
  };

  // pre-fill invoiceId if coming from /payments/new?invoiceId=xxx
  ngOnInit() {
    const invoiceId = this.route.snapshot.queryParamMap.get('invoiceId');
    if (invoiceId) this.form.invoiceId = invoiceId;
  }

  get selectedInvoice() {
    return this.invoicesStore.entities().find((i) => i.id === this.form.invoiceId) ?? null;
  }

  submit() {
    const payload: CreatePaymentDto = {
      ...this.form,
      paid_at: this.form.paid_at || undefined,
    };
    this.store.createPayment(payload);
    this.router.navigate(['/payments']);
  }
}
