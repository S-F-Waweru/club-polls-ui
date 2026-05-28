import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DarajaTransaction, PaginatedTransactions } from '../daraja.models';


@Injectable({
  providedIn: 'root',
})
export class DarajaService {
  private http = inject(HttpClient);
  // Points to your NestJS backend baseUrl configured in environment files
  private apiUrl = `${environment.apiUrl}/daraja`;

  /**
   * Triggers an STK Push payment overlay on the user's phone.
   */
  initiateStkPush(phone: string, amount: number, reference: string): Observable<DarajaTransaction> {
    return this.http.post<DarajaTransaction>(`${this.apiUrl}/stk-push`, {
      phone,
      amount,
      reference,
    });
  }

  /**
   * Fetches the current, single-point status of a specific checkout ID (Used for polling loops).
   */
  checkTransactionStatus(checkoutRequestId: string): Observable<DarajaTransaction> {
    return this.http.get<DarajaTransaction>(`${this.apiUrl}/status/${checkoutRequestId}`);
  }

  /**
   * Fetches the full paginated ledger records list for internal business administration displays.
   */
  getPaymentRecords(page: number = 1, limit: number = 20): Observable<PaginatedTransactions> {
    const params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());
    return this.http.get<PaginatedTransactions>(`${this.apiUrl}/records`, { params });
  }

  /**
   * Triggers an explicit backend "pull" query to reconcile a missing M-Pesa receipt code.
   */
  verifyMissingTransaction(mpesaReceiptNumber: string): Observable<DarajaTransaction> {
    return this.http.post<DarajaTransaction>(`${`${this.apiUrl}/pull-status`}`, {
      mpesaReceiptNumber,
    });
  }
}
