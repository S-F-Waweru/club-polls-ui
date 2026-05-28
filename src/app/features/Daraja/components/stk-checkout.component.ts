import { Component, inject, signal, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { switchMap, takeWhile } from 'rxjs/operators';
import { DarajaTransactionStatus } from '../daraja.models';
import { DarajaService } from '../services/daraja.service';

@Component({
  selector: 'lib-daraja-stk-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="stk-checkout-container card shadow-sm p-4 rounded bg-white">
      <h3 class="mb-3 text-dark fw-bold">Lipa na M-Pesa Express</h3>
      <p class="text-muted small">Enter your phone number below to receive an instant secure payment prompt on your device.</p>

      <div class="mb-3">
        <label class="form-label fw-semibold">Amount to Pay: KES {{ payableAmount() }}</label>
        <input
          type="text"
          [(ngModel)]="phoneNumber"
          class="form-control form-control-lg"
          placeholder="e.g., 0712345678 or 2547..."
          [disabled]="isProcessing()">
      </div>

      <button
        (click)="executePayment()"
        class="btn btn-success btn-lg w-100 fw-bold py-3"
        [disabled]="isProcessing() || !phoneNumber">
        @if (isProcessing()) {
          <span class="spinner-border spinner-border-sm me-2"></span> Waiting for PIN input...
        } @else {
          Pay KES {{ payableAmount() }}
        }
      </button>

      @if (paymentStatus() === 'COMPLETED') {
        <div class="alert alert-success mt-3 p-3 border-0 rounded">
          <strong>🎉 Payment Success!</strong> Your transaction has been approved and processed.
        </div>
      } @else if (paymentStatus() === 'FAILED') {
        <div class="alert alert-danger mt-3 p-3 border-0 rounded">
          <strong>❌ Transaction Failed:</strong> {{ errorDetails() || 'The request was cancelled or timed out.' }}
        </div>
      }
    </div>
  `
})
export class StkCheckoutComponent {
  private darajaService = inject(DarajaService);

  // Inputs & Outputs to allow configuration from parent views
  payableAmount = input.required<number>();
  accountReference = input.required<string>();
  paymentComplete = output<any>();

  // Reactive UI States
  phoneNumber = '';
  isProcessing = signal(false);
  paymentStatus = signal<string | null>(null);
  errorDetails = signal<string | null>(null);

  private pollingSubscription?: Subscription;

  executePayment() {
    this.isProcessing.set(true);
    this.paymentStatus.set(null);
    this.errorDetails.set(null);

    this.darajaService.initiateStkPush(this.phoneNumber, this.payableAmount(), this.accountReference())
      .subscribe({
        next: (transaction) => {
          if (transaction.checkoutRequestId) {
            this.startStatusPollingLoop(transaction.checkoutRequestId);
          }
        },
        error: (err) => {
          this.isProcessing.set(false);
          this.paymentStatus.set(DarajaTransactionStatus.FAILED);
          this.errorDetails.set('Unable to communicate with payment gateway.');
        }
      });
  }

  private startStatusPollingLoop(checkoutRequestId: string) {
    // Check local database state every 3 seconds
    this.pollingSubscription = interval(3000)
      .pipe(
        switchMap(() => this.darajaService.checkTransactionStatus(checkoutRequestId)),
        // Continue tracking only while backend status remains PENDING
        takeWhile((tx) => tx.status === DarajaTransactionStatus.PENDING, true)
      )
      .subscribe((tx) => {
        this.paymentStatus.set(tx.status);

        if (tx.status !== DarajaTransactionStatus.PENDING) {
          this.isProcessing.set(false);
          this.pollingSubscription?.unsubscribe();

          if (tx.status === DarajaTransactionStatus.COMPLETED) {
            this.paymentComplete.emit(tx);
          } else {
            this.errorDetails.set(tx.resultDescription || 'Declined');
          }
        }
      });
  }

  ngOnDestroy() {
    this.pollingSubscription?.unsubscribe();
  }
}
