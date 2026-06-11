import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DarajaService } from '../services/daraja.service';
import { DarajaTransaction } from '../daraja.models';


@Component({
  selector: 'lib-daraja-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="h3 mb-0 text-gray-800 fw-bold">M-Pesa Real-time Transaction Logs</h2>

        <div class="d-flex gap-2 bg-white p-2 rounded border shadow-sm">
          <input
            type="text"
            [(ngModel)]="missingReceiptCode"
            class="form-control form-control-sm"
            placeholder="Verify M-Pesa Code (e.g. OIE7XKZ...)"
            style="width: 260px;">
          <button
            (click)="triggerManualReconciliation()"
            class="btn btn-primary btn-sm fw-semibold text-nowrap"
            [disabled]="isReconciling() || !missingReceiptCode">
            @if (isReconciling()) { Verification In Progress... } @else { Manual Reconcile }
          </button>
        </div>
      </div>

      <div class="card shadow-sm border-0 rounded bg-white">
        <div class="table-responsive">
          <table class="table align-middle mb-0 table-hover">
            <thead class="table-light text-uppercase fs-7 text-muted fw-bold">
              <tr>
                <th>Date Initiated</th>
                <th>M-Pesa Receipt ID</th>
                <th>Type</th>
                <th>Account Reference</th>
                <th>Sender Phone</th>
                <th>Amount (KES)</th>
                <th>Execution Status</th>
              </tr>
            </thead>
            <tbody class="fs-6">
              @for (tx of transactions(); track tx.id) {
                <tr>
                  <td class="text-muted small">{{ tx.createdAt | date:'medium' }}</td>
                  <td><span class="font-monospace fw-bold text-dark">{{ tx.mpesaReceiptNumber || '—' }}</span></td>
                  <td>
                    <span class="badge rounded-pill px-2 py-1 fs-7"
                          [ngClass]="tx.type === 'STK_PUSH' ? 'bg-info-subtle text-info' : 'bg-purple-subtle text-purple'">
                      {{ tx.type }}
                    </span>
                  </td>
                  <td class="fw-medium text-secondary">{{ tx.accountReference || 'Direct Paybill' }}</td>
                  <td>{{ tx.phoneNumber }}</td>
                  <td class="fw-bold text-dark">{{ tx.amount | currency:'KES ':'code':'1.2-2' }}</td>
                  <td>
                    <span class="badge px-3 py-2 fs-7 rounded"
                          [ngClass]="{
                            'bg-success-subtle text-success': tx.status === 'COMPLETED',
                            'bg-warning-subtle text-warning': tx.status === 'PENDING',
                            'bg-danger-subtle text-danger': tx.status === 'FAILED'
                          }">
                      {{ tx.status }}
                    </span>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="text-center py-5 text-muted">
                    <i class="bi bi-wallet2 d-block mb-2 fs-3"></i> No data recorded in system ledger matrices.
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
    .fs-7 { font-size: 0.75rem; }
    .bg-purple-subtle { background-color: #f3e8ff; color: #6b21a8; }
    .text-purple { color: #6b21a8; }
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
          this.loadTransactionsList(); // Refresh logs grid seamlessly
        },
        error: () => this.isReconciling.set(false)
      });
  }
}
