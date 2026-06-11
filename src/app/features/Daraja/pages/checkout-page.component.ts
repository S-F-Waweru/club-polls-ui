// src/app/features/checkout-page.component.ts
import { Component, signal } from '@angular/core';
import { StkCheckoutComponent } from '../components/stk-checkout.component';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [StkCheckoutComponent, StkCheckoutComponent],
  template: `
    <div class="wrapper p-5">
      <lib-daraja-stk-checkout
        [payableAmount]="totalCartCost()"
        [accountReference]="'INV-2026-098'"
        (paymentComplete)="onSuccessfulMpesaCapture($event)"
      >
      </lib-daraja-stk-checkout>
    </div>
  `,
})
export class CheckoutPageComponent {
  totalCartCost = signal(1250);

  onSuccessfulMpesaCapture(event: any) {
    console.log('Payment processed successfully. Internal receipt trace:', event);
    // Route user to success landing or download voucher page module
  }
}
