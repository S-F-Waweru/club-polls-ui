import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { HttpClient, HttpParams } from '@angular/common/http';
import { pipe, switchMap, tap, catchError, EMPTY } from 'rxjs';
import { environment } from '../../../environments/environment';


export interface DarajaTransaction {
  id: string;
  type: 'STK_PUSH' | 'C2B_PAYBILL';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  checkoutRequestId: string | null;
  mpesaReceiptNumber: string | null;
  amount: number;
  phoneNumber: string;
  accountReference: string | null;
  resultDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DarajaFilters {
  status: string;
  type: string;
  phone: string;
  accountReference: string;
  from: string;
  to: string;
}

export interface DarajaState {
  transactions: DarajaTransaction[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  error: string | null;
  pollingEnabled: boolean;
  filters: DarajaFilters;
}

const initialState: DarajaState = {
  transactions: [],
  total: 0,
  page: 1,
  limit: 20,
  isLoading: false,
  error: null,
  pollingEnabled: true,
  filters: {
    status: '',
    type: '',
    phone: '',
    accountReference: '',
    from: '',
    to: '',
  },
};

export const DarajaStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, http = inject(HttpClient)) => {

    const fetchTransactions = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() => {
          let params = new HttpParams()
            .set('page', store.page().toString())
            .set('limit', store.limit().toString());

          const f = store.filters();
          if (f.status) params = params.set('status', f.status);
          if (f.type) params = params.set('type', f.type);
          if (f.phone) params = params.set('phone', f.phone);
          if (f.accountReference) params = params.set('accountReference', f.accountReference);
          if (f.from) params = params.set('from', f.from);
          if (f.to) params = params.set('to', f.to);

          return http.get<{ data: DarajaTransaction[]; total: number }>(
            `${environment.apiUrl}daraja/records`,
            { params, responseType: 'json' as const } // 👈 add this
          ).pipe(
            tap({
              next: (res) => patchState(store, {
                transactions: res.data,
                total: res.total,
                isLoading: false,
              }),
              error: (err) => patchState(store, {
                error: err.error?.message || 'Failed to load transactions.',
                isLoading: false,
              }),
            }),
            catchError(() => EMPTY),
          );
        }),
      ),
    );

    return {
      loadTransactions: fetchTransactions,

      setPage: (page: number) => {
        patchState(store, { page });
        fetchTransactions();
      },

      setLimit: (limit: number) => {
        patchState(store, { limit, page: 1 });
        fetchTransactions();
      },

      setFilters: (filters: Partial<DarajaFilters>) => {
        patchState(store, {
          filters: { ...store.filters(), ...filters },
          page: 1,
        });
        fetchTransactions();
      },

      clearFilters: () => {
        patchState(store, {
          filters: {
            status: '',
            type: '',
            phone: '',
            accountReference: '',
            from: '',
            to: '',
          },
          page: 1,
        });
        fetchTransactions();
      },

      togglePolling: () => patchState(store, { pollingEnabled: !store.pollingEnabled() }),

      refresh: fetchTransactions,
    };
  }),
);
