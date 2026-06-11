import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState, withHooks } from '@ngrx/signals';
import {
  withEntities,
  setAllEntities,
  addEntity,
  updateEntity,
  removeEntity,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  pipe,
  switchMap,
  tap,
  debounceTime,
  distinctUntilChanged,
  map,
  catchError,
  EMPTY,
} from 'rxjs';
import { environment } from '../../environments/environment';

// ============================================================================
// Models
// ============================================================================
export interface InvoiceEnrollment {
  id: string;
  status: 'ACTIVE' | 'COMPLETED' | 'DROPPED';
  enrolled_at: string;
  student: {
    id: string;
    studentId: string;
    fullName: string;
    email: string;
    phone: string;
  };
  course: {
    id: string;
    code: string;
    name: string;
    level: string;
  };
}

export interface Invoice {
  id: string;
  totalAmount: number;
  balance: number;
  status: 'PAID' | 'PARTIAL' | 'UNPAID';
  issued_at: string;
  enrollment: InvoiceEnrollment;
  // todo add the iinvoicePayments interface
  payments :any
}

export interface CreateInvoiceDto {
  enrollmentId: string;
  totalAmount: number;
  balance: number;
}

// UpdateInvoiceDto is empty per spec — invoices are updated via payments
export interface UpdateInvoiceDto {}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  lastPage: number;
}

// ============================================================================
// State
// ============================================================================
export interface InvoicesState {
  page: number;
  limit: number;
  totalRecords: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: InvoicesState = {
  page: 1,
  limit: 10,
  totalRecords: 0,
  isLoading: false,
  error: null,
};

// ============================================================================
// Store
// ============================================================================
export const InvoicesStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),
  withEntities<Invoice>(),

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
            .get<PaginatedResponse<Invoice>>(`${environment.apiUrl}invoice/paginated`, { params })
            .pipe(
              tap({
                next: (res) =>{
                  console.log(`Pagianted response`);
                  console.log(res)
                  patchState(store, setAllEntities(res.data), {
                    totalRecords: res.total,
                    isLoading: false,
                  });
                }
                 ,
                error: (err) =>
                  patchState(store, {
                    error: err.error?.message || 'Failed to load invoices.',
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

      // CREATE (manual invoice — enrollment auto-creates one, but API supports manual too)
      createInvoice: rxMethod<CreateInvoiceDto>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((dto) =>
            http.post<Invoice>(`${environment.apiUrl}invoice`, dto).pipe(
              tap((inv) =>
                patchState(store, addEntity(inv), {
                  totalRecords: store.totalRecords() + 1,
                  isLoading: false,
                }),
              ),
              catchError((err) => {
                patchState(store, {
                  error: Array.isArray(err.error?.message)
                    ? err.error.message.join(', ')
                    : err.error?.message || 'Failed to create invoice.',
                  isLoading: false,
                });
                return EMPTY;
              }),
            ),
          ),
        ),
      ),

      // GET BY ID
      loadInvoiceById: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((id) =>
            http.get<Invoice>(`${environment.apiUrl}invoice/${id}`).pipe(
              tap({
                next: (inv) =>
                  patchState(store, updateEntity({ id: inv.id, changes: inv }), {
                    isLoading: false,
                  }),
                error: (err) =>
                  patchState(store, {
                    error: err.error?.message || 'Failed to load invoice.',
                    isLoading: false,
                  }),
              }),
            ),
          ),
        ),
      ),

      // DELETE
      deleteInvoice: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((id) =>
            http.delete(`${environment.apiUrl}invoice/${id}`).pipe(
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

      downloadInvoicePdf: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((id) =>
            http
              .get(`${environment.apiUrl}invoice/${id}/pdf`, {
                responseType: 'blob',
              })
              .pipe(
                tap({
                  next: (blob) => {
                    openPdfBlob(blob, `invoice-${id}.pdf`);
                    patchState(store, { isLoading: false });
                  },
                  error: (err) =>
                    patchState(store, {
                      error: err.error?.message || 'Failed to download invoice.',
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
      store._runWatcher(() => ({
        page: store.page(),
        limit: store.limit(),
      }));
    },
  }),
);

function openPdfBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const opened = window.open(url, '_blank');

  if (!opened) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  }

  window.setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
}
