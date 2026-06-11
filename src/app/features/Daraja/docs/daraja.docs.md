# Daraja M-Pesa Integration Framework (Angular Frontend)

### Architecture & Implementation Blueprint Documentation

This documentation provides a comprehensive operational guide for the modular **Daraja M-Pesa Frontend Feature Library**. Structured specifically for **Angular 17/18+**, it utilizes **Signals** for state management, the standalone component architecture, and the `@for` control flow syntax to deliver a real-time, performant financial interface.

---

## 1. System Architecture

The frontend framework is designed as an isolated feature package that integrates directly with the NestJS Daraja backend module. It is split into two core layers:

* **The Reactive Data Layer (`DarajaService`):** Manages outbound network payloads, coordinates short-polling state tracking loops, and maps backend TypeORM entities into explicit type definitions.
* **The Component Layer (`UI Elements`):** Provides a drop-in checkout form and an administrative real-time transaction tracking panel.

```
                  +---------------------------------------+
                  |         Angular UI Components         |
                  +---------------------------------------+
                     /                                 \
    (Initiates STK / Pull Check)              (Polls / Pull Records)
                   /                                     \
                  v                                       v
+-----------------------------------+   HTTP    +------------------------------------+
|  DarajaService (Signals Engine)   | <=======> |   NestJS Gateway (/api/daraja)     |
+-----------------------------------+           +------------------------------------+

```

---

## 2. Core Framework Specifications

Create an isolated directory within your workspace (e.g., `src/app/features/daraja/`) and place the following files:

### Data Model & Types Specification (`daraja.models.ts`)

Defines the strict data contracts for compile-time safety across application modules.

```typescript
export enum DarajaTransactionType {
  STK_PUSH = 'STK_PUSH',
  C2B_PAYBILL = 'C2B_PAYBILL'
}

export enum DarajaTransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface DarajaTransaction {
  id: string;
  type: DarajaTransactionType;
  status: DarajaTransactionStatus;
  checkoutRequestId?: string;
  mpesaReceiptNumber?: string;
  amount: number;
  phoneNumber: string;
  accountReference?: string;
  resultDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedTransactions {
  data: DarajaTransaction[];
  total: number;
}

```

---

### Shared Gateway Data Service (`daraja.service.ts`)

Manages stateless communication streams between the browser and your NestJS application server.

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DarajaTransaction, PaginatedTransactions } from './daraja.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DarajaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}daraja`;

  /**
   * Triggers an automated STK Push PIN prompt request via the NestJS gateway.
   */
  initiateStkPush(phone: string, amount: number, reference: string): Observable<DarajaTransaction> {
    return this.http.post<DarajaTransaction>(`${this.apiUrl}/stk-push`, { phone, amount, reference });
  }

  /**
   * Fetches the singular status of a specific tracking token identifier (Used by polling routines).
   */
  checkTransactionStatus(checkoutRequestId: string): Observable<DarajaTransaction> {
    return this.http.get<DarajaTransaction>(`${this.apiUrl}/status/${checkoutRequestId}`);
  }

  /**
   * Pulls structural paginated logging lists for financial monitoring screens.
   */
  getPaymentRecords(page: number = 1, limit: number = 20): Observable<PaginatedTransactions> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<PaginatedTransactions>(`${this.apiUrl}/records`, { params });
  }

  /**
   * Directs the server to run a targeted, manual lookup against Safaricom APIs for a missing M-Pesa trace key.
   */
  verifyMissingTransaction(mpesaReceiptNumber: string): Observable<DarajaTransaction> {
    return this.http.post<DarajaTransaction>(`${this.apiUrl}/pull-status`, { mpesaReceiptNumber });
  }
}

```

---

## 3. Transaction Execution Lifecycles

### Flow A: Automated Lipa na M-Pesa Checkout Engine

This standalone module initializes an active M-Pesa Express prompt, sets up reactive UI signals, and runs a safe short-polling tracking routine against the application state engine.

```
[ User Presses Pay ] ===> [ Post to NestJS ] ===> [ Generate RequestID ] ===> [ Start Short Poll (3s) ]
                                                                                      |
[ Fire Complete Event ] <=== [ Shift away from PENDING ] <============================+

```

* **File Vector Location:** `src/app/features/daraja/stk-checkout.component.ts`
* **Operational Directives:** Emits an execution event output hook payload (`paymentComplete`) the exact moment the webhook resolves the database log status away from a `PENDING` state.

```typescript
import { Component, inject, signal, input, output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DarajaService } from './daraja.service';
import { DarajaTransactionStatus } from './daraja.models';
import { interval, Subscription } from 'rxjs';
import { switchMap, takeWhile } from 'rxjs/operators';

@Component({
  selector: 'lib-daraja-stk-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="stk-checkout-container card shadow-sm p-4 rounded bg-white">
      <h3 class="mb-3 text-dark fw-bold">Lipa na M-Pesa Express</h3>
      <p class="text-muted small">Enter your M-Pesa mobile number to receive an automated secure payment confirmation dialog overlay instantly on your handset.</p>
      
      <div class="mb-3">
        <label class="form-label fw-semibold">Total Cost: KES {{ payableAmount() }}</label>
        <input 
          type="text" 
          [(ngModel)]="phoneNumber" 
          class="form-control form-control-lg text-center font-monospace tracking-wide" 
          placeholder="07XXXXXXXX or 254XXXXXXXXX"
          [disabled]="isProcessing()">
      </div>

      <button 
        (click)="executePayment()" 
        class="btn btn-success btn-lg w-100 fw-bold py-3 uppercase-tracking" 
        [disabled]="isProcessing() || !phoneNumber">
        @if (isProcessing()) {
          <span class="spinner-border spinner-border-sm me-2"></span> Handset verification in progress...
        } @else {
          Authorize KES {{ payableAmount() }}
        }
      </button>

      @if (paymentStatus() === 'COMPLETED') {
        <div class="alert alert-success mt-3 p-3 border-0 rounded-3">
          <strong>🎉 Payment Verified:</strong> Transaction successfully batched and logged.
        </div>
      } @else if (paymentStatus() === 'FAILED') {
        <div class="alert alert-danger mt-3 p-3 border-0 rounded-3">
          <strong>❌ Verification Failed:</strong> {{ errorDetails() || 'The prompt was dismissed or timed out.' }}
        </div>
      }
    </div>
  `
})
export class StkCheckoutComponent implements OnDestroy {
  private darajaService = inject(DarajaService);

  payableAmount = input.required<number>();
  accountReference = input.required<string>();
  paymentComplete = output<any>();

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
        error: () => {
          this.isProcessing.set(false);
          this.paymentStatus.set(DarajaTransactionStatus.FAILED);
          this.errorDetails.set('Gateway offline. Please try again.');
        }
      });
  }

  private startStatusPollingLoop(checkoutRequestId: string) {
    this.pollingSubscription = interval(3000)
      .pipe(
        switchMap(() => this.darajaService.checkTransactionStatus(checkoutRequestId)),
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
            this.errorDetails.set(tx.resultDescription || 'Transaction dropped.');
          }
        }
      });
  }

  ngOnDestroy() {
    this.pollingSubscription?.unsubscribe();
  }
}

```

---

### Flow B: Passive Collection Ledger Board & Manual Reconciliation

Displays real-time transaction updates (including direct Till/Paybill numbers) and allows administrators to manually resolve missing records via an on-demand reconciliation field.

```
[ Input Missing M-Pesa Receipt ID ] ===> [ Trigger Manual Pull Request ] ===> [ API Callback Updates DB ]
                                                                                     |
[ Auto Refresh Grid Layout View ] <==================================================+

```

* **File Vector Location:** `src/app/features/daraja/daraja-dashboard.component.ts`
* **Operational Directives:** Integrates a visual table list utilizing semantic conditional formatting based on explicit tracking states (`PENDING`, `COMPLETED`, `FAILED`).

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DarajaService } from './daraja.service';
import { DarajaTransaction } from './daraja.models';

@Component({
  selector: 'lib-daraja-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 class="h3 mb-1 text-dark fw-bold">M-Pesa Ledger Management</h2>
          <p class="text-muted small mb-0">System audit trail displaying live webhooks alongside explicit fallback verification processing arrays.</p>
        </div>
        
        <!-- Verification Input Module Component Block -->
        <div class="d-flex gap-2 bg-white p-2 rounded-3 border shadow-sm align-items-center">
          <input 
            type="text" 
            [(ngModel)]="missingReceiptCode" 
            class="form-control form-control-sm text-uppercase font-monospace" 
            placeholder="Validate Receipt ID (e.g. RQA12...)"
            style="width: 240px;">
          <button 
            (click)="triggerManualReconciliation()" 
            class="btn btn-primary btn-sm fw-semibold"
            [disabled]="isReconciling() || !missingReceiptCode">
            @if (isReconciling()) { Resolving... } @else { Audit Lookup }
          </button>
        </div>
      </div>

      <!-- Core Matrix Matrix Display Frame -->
      <div class="card shadow-sm border-0 rounded-3 bg-white overflow-hidden">
        <div class="table-responsive">
          <table class="table align-middle mb-0 table-hover">
            <thead class="table-light text-uppercase tracking-wider font-semibold small text-muted">
              <tr>
                <th class="p-3">Timestamp</th>
                <th>Receipt ID</th>
                <th>Interaction</th>
                <th>Account Ref</th>
                <th>Source Address</th>
                <th>Value</th>
                <th class="p-3">Status</th>
              </tr>
            </thead>
            <tbody class="fs-6">
              @for (tx of transactions(); track tx.id) {
                <tr class="ledger-row">
                  <td class="text-muted small p-3">{{ tx.createdAt | date:'medium' }}</td>
                  <td><span class="font-monospace fw-bold text-secondary">{{ tx.mpesaReceiptNumber || 'PENDING_TRACE' }}</span></td>
                  <td>
                    <span class="badge rounded-pill px-2 py-1 small-badge" 
                          [ngClass]="tx.type === 'STK_PUSH' ? 'bg-primary-subtle text-primary' : 'bg-warning-subtle text-dark'">
                      {{ tx.type }}
                    </span>
                  </td>
                  <td class="fw-medium text-dark">{{ tx.accountReference || 'Direct Counter Remittance' }}</td>
                  <td class="font-monospace text-muted">{{ tx.phoneNumber }}</td>
                  <td class="fw-bold text-dark">{{ tx.amount | currency:'KES ':'code':'1.2-2' }}</td>
                  <td class="p-3">
                    <span class="badge px-3 py-2 text-capitalize rounded-2"
                          [ngClass]="{
                            'bg-success-subtle text-success': tx.status === 'COMPLETED',
                            'bg-warning-subtle text-warning-emphasis': tx.status === 'PENDING',
                            'bg-danger-subtle text-danger': tx.status === 'FAILED'
                          }">
                      {{ tx.status | lowercase }}
                    </span>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="text-center py-5 text-muted">
                    <div class="fs-4 text-secondary mb-2">📥</div>
                    No data records currently active within local ledger arrays.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tracking-wider { tracking: 0.05em; }
    .small-badge { font-size: 0.7rem; font-weight: 600; }
    .bg-primary-subtle { background-color: #e0f2fe!important; color: #0369a1!important; }
    .bg-warning-subtle { background-color: #fef9c3!important; color: #854d0e!important; }
    .ledger-row { transition: background-color 0.15s ease-in-out; }
  `]
})
export class DarajaDashboardComponent implements OnInit {
  private darajaService = inject(DarajaService);

  transactions = signal<DarajaTransaction[]>([]);
  missingReceiptCode = '';
  isReconciling = signal(false);

  ngOnInit() {
    this.loadTransactionsList();
  }

  loadTransactionsList() {
    this.darajaService.getPaymentRecords(1, 50).subscribe({
      next: (response) => this.transactions.set(response.data)
    });
  }

  triggerManualReconciliation() {
    this.isReconciling.set(true);
    this.darajaService.verifyMissingTransaction(this.missingReceiptCode.trim().toUpperCase())
      .subscribe({
        next: () => {
          this.isReconciling.set(false);
          this.missingReceiptCode = '';
          this.loadTransactionsList(); // Live refresh of grid data
        },
        error: () => this.isReconciling.set(false)
      });
  }
}

```

---

## 4. Integration Blueprint Examples

To use these standalone components anywhere in your application, simply list them within your target view imports metadata array block.

### Dashboard Core Wireframe Shell Setup

```typescript
import { Component, signal } from '@angular/core';
import { StkCheckoutComponent } from './daraja/stk-checkout.component';
import { DarajaDashboardComponent } from './daraja/daraja-dashboard.component';

@Component({
  selector: 'app-billing-management',
  standalone: true,
  imports: [StkCheckoutComponent, DarajaDashboardComponent],
  template: `
    <div class="row m-4">
      <div class="col-lg-4 mb-4">
        <!-- Render Payment Checkout Widget -->
        <lib-daraja-stk-checkout 
          [payableAmount]="orderTotal()" 
          [accountReference]="'M-000-001'"
          (paymentComplete)="handlePostSettlement($event)">
        </lib-daraja-stk-checkout>
      </div>
      
      <div class="col-lg-8">
        <!-- Render Historical Transaction Audit Logs -->
        <lib-daraja-dashboard></lib-daraja-dashboard>
      </div>
    </div>
  `
})
export class BillingManagementComponent {
  orderTotal = signal(3450);

  handlePostSettlement(transactionTrace: any) {
    console.log('Operational callback context updated:', transactionTrace);
    // Execute post-payment actions here (e.g., confirm the member fee)
  }
}

```
