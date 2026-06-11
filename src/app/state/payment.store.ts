import { inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { addEntity, setAllEntities, updateEntity, withEntities } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, pipe, switchMap, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CreatePaymentDto,
  MemberMpesaPaymentDto,
  PaginatedResponse,
  Payment,
} from '../models/club.models';

export interface PaymentsState {
  page: number;
  limit: number;
  totalRecords: number;
  selectedPayment: Payment | null;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: PaymentsState = {
  page: 1,
  limit: 10,
  totalRecords: 0,
  selectedPayment: null,
  isLoading: false,
  error: null,
  successMessage: null,
};

export const PaymentsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withEntities<Payment>(),
  withMethods((store, http = inject(HttpClient)) => ({
    setPage: (page: number) => patchState(store, { page }),

    setLimit: (limit: number) => patchState(store, { limit, page: 1 }),

    loadPayments: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null, successMessage: null })),
        switchMap(() => {
          const params = new HttpParams()
            .set('page', store.page().toString())
            .set('limit', store.limit().toString());

          return http.get<PaginatedResponse<Payment>>(`${environment.apiUrl}payments/paginated`, { params }).pipe(
            tap({
              next: (response) =>
                patchState(store, setAllEntities(response.data), {
                  totalRecords: response.total,
                  page: response.page,
                  isLoading: false,
                }),
              error: (err) =>
                patchState(store, {
                  error: err.error?.message || 'Failed to load payments.',
                  isLoading: false,
                }),
            }),
            catchError(() => EMPTY),
          );
        }),
      ),
    ),

    loadMyPayments: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null, successMessage: null })),
        switchMap(() =>
          http.get<Payment[]>(`${environment.apiUrl}payments/me`).pipe(
            tap({
              next: (payments) =>
                patchState(store, setAllEntities(payments), {
                  totalRecords: payments.length,
                  isLoading: false,
                }),
              error: (err) =>
                patchState(store, {
                  error: err.error?.message || 'Failed to load your payments.',
                  isLoading: false,
                }),
            }),
            catchError(() => EMPTY),
          ),
        ),
      ),
    ),

    createPayment: rxMethod<CreatePaymentDto>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null, successMessage: null })),
        switchMap((dto) =>
          http.post<Payment>(`${environment.apiUrl}payments`, dto).pipe(
            tap((payment) =>
              patchState(store, addEntity(payment), {
                selectedPayment: payment,
                totalRecords: store.totalRecords() + 1,
                isLoading: false,
                successMessage: 'Payment recorded.',
              }),
            ),
            catchError((err) => {
              patchState(store, {
                error: formatApiError(err, 'Failed to record payment.'),
                isLoading: false,
              });
              return EMPTY;
            }),
          ),
        ),
      ),
    ),

    requestMyMpesaPayment: rxMethod<MemberMpesaPaymentDto>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null, successMessage: null })),
        switchMap((dto) =>
          http.post<Payment>(`${environment.apiUrl}payments/me/mpesa`, dto).pipe(
            tap((payment) =>
              patchState(store, addEntity(payment), {
                selectedPayment: payment,
                totalRecords: store.totalRecords() + 1,
                isLoading: false,
                successMessage: 'M-Pesa payment request sent.',
              }),
            ),
            catchError((err) => {
              patchState(store, {
                error: formatApiError(err, 'Failed to start M-Pesa payment.'),
                isLoading: false,
              });
              return EMPTY;
            }),
          ),
        ),
      ),
    ),

    loadPaymentById: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null, successMessage: null })),
        switchMap((id) =>
          http.get<Payment>(`${environment.apiUrl}payments/${id}`).pipe(
            tap({
              next: (payment) =>
                patchState(store, updateEntity({ id: payment.id, changes: payment }), {
                  selectedPayment: payment,
                  isLoading: false,
                }),
              error: (err) =>
                patchState(store, {
                  error: err.error?.message || 'Failed to load payment.',
                  isLoading: false,
                }),
            }),
            catchError(() => EMPTY),
          ),
        ),
      ),
    ),

    verifyPayment: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null, successMessage: null })),
        switchMap((id) =>
          http.patch<Payment>(`${environment.apiUrl}payments/${id}/verify`, {}).pipe(
            tap({
              next: (payment) =>
                patchState(store, updateEntity({ id: payment.id, changes: payment }), {
                  selectedPayment: payment,
                  isLoading: false,
                  successMessage: 'Payment verified.',
                }),
              error: (err) =>
                patchState(store, {
                  error: err.error?.message || 'Verification failed.',
                  isLoading: false,
                }),
            }),
            catchError(() => EMPTY),
          ),
        ),
      ),
    ),

    rejectPayment: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null, successMessage: null })),
        switchMap((id) =>
          http.patch<Payment>(`${environment.apiUrl}payments/${id}/reject`, {}).pipe(
            tap({
              next: (payment) =>
                patchState(store, updateEntity({ id: payment.id, changes: payment }), {
                  selectedPayment: payment,
                  isLoading: false,
                  successMessage: 'Payment rejected.',
                }),
              error: (err) =>
                patchState(store, {
                  error: err.error?.message || 'Rejection failed.',
                  isLoading: false,
                }),
            }),
            catchError(() => EMPTY),
          ),
        ),
      ),
    ),
  })),
);

function formatApiError(err: any, fallback: string) {
  return Array.isArray(err.error?.message) ? err.error.message.join(', ') : err.error?.message || fallback;
}
