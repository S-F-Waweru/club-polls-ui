import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState, withHooks } from '@ngrx/signals';
import { withEntities, setAllEntities, addEntity, updateEntity, removeEntity } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  pipe, switchMap, tap, debounceTime,
  distinctUntilChanged, map, catchError, EMPTY,
} from 'rxjs';
import { environment } from '../../environments/environment';

// ============================================================================
// Models
// ============================================================================
export interface Invoice {
  id: string;
  totalAmount: number;
  balance: number;
  status: 'PAID' | 'PARTIAL' | 'UNPAID';
  issued_at: string;
}

export interface EnrollmentStudent {
  id: string;
  studentId: string;
  fullName: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'GRADUATED' | 'WITHDRAWN';
}

export interface EnrollmentCourse {
  id: string;
  code: string;
  name: string;
  level: string;
  durationWeeks: number;
}

export interface Enrollment {
  id: string;
  student: EnrollmentStudent;
  course: EnrollmentCourse;
  invoice: Invoice;
  status: 'ACTIVE' | 'COMPLETED' | 'DROPPED';
  enrolled_at: string;
}

export interface CreateEnrollmentDto {
  student_id: string;
  course_id: string;
}

export interface UpdateEnrollmentDto {
  status: 'ACTIVE' | 'COMPLETED' | 'DROPPED';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  lastPage: number;
}

// ============================================================================
// State
// ============================================================================
export interface EnrollmentsState {
  page: number;
  limit: number;
  totalRecords: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: EnrollmentsState = {
  page: 1,
  limit: 10,
  totalRecords: 0,
  isLoading: false,
  error: null,
};

// ============================================================================
// Store
// ============================================================================
export const EnrollmentsStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),
  withEntities<Enrollment>(),

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
            .get<PaginatedResponse<Enrollment>>(`${environment.apiUrl}enrollments/paginated`, { params })
            .pipe(
              tap({
                next: (res) =>
                  patchState(store, setAllEntities(res.data), {
                    totalRecords: res.total,
                    isLoading: false,
                  }),
                error: (err) =>
                  patchState(store, {
                    error: err.error?.message || 'Failed to load enrollments.',
                    isLoading: false,
                  }),
              }),
            );
        }),
      ),
    );

    return {
      // Pagination controls
      setPage: (page: number) => patchState(store, { page }),
      setLimit: (limit: number) => patchState(store, { limit, page: 1 }),

      // CREATE — auto-generates invoice on backend
      createEnrollment: rxMethod<CreateEnrollmentDto>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((dto) =>
            http.post<Enrollment>(`${environment.apiUrl}enrollments`, dto).pipe(
              tap((enrollment) =>
                patchState(store, addEntity(enrollment), {
                  totalRecords: store.totalRecords() + 1,
                  isLoading: false,
                }),
              ),
              catchError((err) => {
                patchState(store, {
                  error: Array.isArray(err.error?.message)
                    ? err.error.message.join(', ')
                    : err.error?.message || 'Enrollment failed.',
                  isLoading: false,
                });
                return EMPTY;
              }),
            ),
          ),
        ),
      ),

      // GET BY ID
      loadEnrollmentById: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((id) =>
            http.get<Enrollment>(`${environment.apiUrl}enrollments/${id}`).pipe(
              tap({
                next: (e) =>
                  patchState(store, updateEntity({ id: e.id, changes: e }), { isLoading: false }),
                error: (err) =>
                  patchState(store, {
                    error: err.error?.message || 'Failed to load enrollment.',
                    isLoading: false,
                  }),
              }),
            ),
          ),
        ),
      ),

      // UPDATE STATUS
      updateEnrollment: rxMethod<{ id: string; dto: UpdateEnrollmentDto }>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(({ id, dto }) =>
            http.patch<Enrollment>(`${environment.apiUrl}enrollments/${id}`, dto).pipe(
              tap({
                next: (e) =>
                  patchState(store, updateEntity({ id: e.id, changes: e }), { isLoading: false }),
                error: (err) =>
                  patchState(store, {
                    error: err.error?.message || 'Update failed.',
                    isLoading: false,
                  }),
              }),
            ),
          ),
        ),
      ),

      // DELETE
      deleteEnrollment: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((id) =>
            http.delete(`${environment.apiUrl}enrollments/${id}`).pipe(
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
