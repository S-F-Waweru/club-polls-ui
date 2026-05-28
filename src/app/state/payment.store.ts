import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState, withHooks } from '@ngrx/signals';
import { withEntities, setAllEntities, addEntity, updateEntity, removeEntity } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { HttpClient, HttpParams } from '@angular/common/http';
import { pipe, switchMap, tap, debounceTime, distinctUntilChanged, map, catchError, EMPTY } from 'rxjs';
import { environment } from '../../environments/environment';

export type PaymentMethod = 'MPESA' | 'BANK' | 'CASH';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface PaymentInvoice {
  id: string;
  totalAmount: number;
  balance: number;
  status: 'PAID' | 'PARTIAL' | 'UNPAID';
  issued_at: string;
}

export interface RecordedBy {
  id: string;
  name: string;
  role: 'admin' | 'bursar';
}

export interface Payment {
  id: string;
  amount: number;
  method: PaymentMethod;
  transactionRef: string;
  status: PaymentStatus;
  paid_at: string;
  synced_at: string | null;
  invoice: PaymentInvoice;
  recordedBy: RecordedBy;
}

export interface CreatePaymentDto {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  transactionRef: string;
  paid_at?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  lastPage: number;
}

export interface PaymentsState {
  page: number;
  limit: number;
  totalRecords: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: PaymentsState = {
  page: 1,
  limit: 10,
  totalRecords: 0,
  isLoading: false,
  error: null,
};

export const PaymentsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withEntities<Payment>(),

  withMethods((store, http = inject(HttpClient)) => {
    const loadPaginated = rxMethod<{ page: number; limit: number }>(
      pipe(
        debounceTime(300),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ page, limit }) => {
          const params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());
          return http
            .get<PaginatedResponse<Payment>>(`${environment.apiUrl}payments/paginated`, { params })
            .pipe(
              tap({
                next: (res) =>
                  patchState(store, setAllEntities(res.data), {
                    totalRecords: res.total,
                    isLoading: false,
                  }),
                error: (err) =>
                  patchState(store, {
                    error: err.error?.message || 'Failed to load payments.',
                    isLoading: false,
                  }),
              }),
            );
        }),
      ),
    );

    return {
      setPage: (page: number) => patchState(store, { page }),
      setLimit: (limit: number) => patchState(store, { limit, page: 1 }),

      createPayment: rxMethod<CreatePaymentDto>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((dto) =>
            http.post<Payment>(`${environment.apiUrl}payments`, dto).pipe(
              tap((p) =>
                patchState(store, addEntity(p), {
                  totalRecords: store.totalRecords() + 1,
                  isLoading: false,
                }),
              ),
              catchError((err) => {
                patchState(store, {
                  error: Array.isArray(err.error?.message)
                    ? err.error.message.join(', ')
                    : err.error?.message || 'Failed to record payment.',
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
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((id) =>
            http.get<Payment>(`${environment.apiUrl}payments/${id}`).pipe(
              tap({
                next: (p) =>
                  patchState(store, updateEntity({ id: p.id, changes: p }), { isLoading: false }),
                error: (err) =>
                  patchState(store, {
                    error: err.error?.message || 'Failed to load payment.',
                    isLoading: false,
                  }),
              }),
            ),
          ),
        ),
      ),

      deletePayment: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((id) =>
            http.delete(`${environment.apiUrl}payments/${id}`).pipe(
              map(() => id),
              tap({
                next: (id) =>
                  patchState(store, removeEntity(id), {
                    totalRecords: store.totalRecords() - 1,
                    isLoading: false,
                  }),
                error: (err) =>
                  patchState(store, {
                    error: err.error?.message || 'Deletion failed.',
                    isLoading: false,
                  }),
              }),
            ),
          ),
        ),
      ),

      verifyPayment: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((id) =>
            http.patch<Payment>(`${environment.apiUrl}payments/${id}/verify`, {}).pipe(
              tap({
                next: (p) =>
                  patchState(store, updateEntity({ id: p.id, changes: p }), { isLoading: false }),
                error: (err) =>
                  patchState(store, {
                    error: err.error?.message || 'Verification failed.',
                    isLoading: false,
                  }),
              }),
            ),
          ),
        ),
      ),

      rejectPayment: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((id) =>
            http.patch<Payment>(`${environment.apiUrl}payments/${id}/reject`, {}).pipe(
              tap({
                next: (p) =>
                  patchState(store, updateEntity({ id: p.id, changes: p }), { isLoading: false }),
                error: (err) =>
                  patchState(store, {
                    error: err.error?.message || 'Rejection failed.',
                    isLoading: false,
                  }),
              }),
            ),
          ),
        ),
      ),

      _runWatcher: loadPaginated,
    };
  }),

  withHooks({
    onInit(store) {
      store._runWatcher(() => ({ page: store.page(), limit: store.limit() }));
    },
  }),
);
