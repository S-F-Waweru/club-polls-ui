import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState, withHooks } from '@ngrx/signals';
import { withEntities, setAllEntities, addEntity, updateEntity, removeEntity } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { HttpClient, HttpParams } from '@angular/common/http';
import { pipe, switchMap, tap, debounceTime, distinctUntilChanged } from 'rxjs';

// ============================================================================
// 1. Models & DTO Interfaces (Derived from your OpenAPI Spec)
// ============================================================================
export interface Student {
  id: string;               // Database generated UUID
  studentId: string;        // e.g., STU001
  fullName: string;
  email: string;            // added
  phone: string;
  dateOfBirth?: string;     // added (optional)
  address?: string;         // added (optional)
  admissionDate: string;    // added
  status: 'ACTIVE' | 'GRADUATED' | 'WITHDRAWN'; // added (use StudentStatus enum)
  guardianName?: string;
  guardianPhone?: string;
  createdAt: string;
}

export interface CreateStudentDto {
  studentId: string;
  fullName: string;
  phone: string;
  guardianName?: string;
  guardianPhone?: string;
}

export interface UpdateStudentDto {
  fullName?: string;
  phone?: string;
  guardianName?: string;
  guardianPhone?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

// ============================================================================
// 2. Operational State Interface
// ============================================================================
export interface StudentsState {
  page: number;
  limit: number;
  searchQuery: string;
  totalRecords: number;
  isLoading: boolean;
  error: string | null;
}

const initialStudentsState: StudentsState = {
  page: 1,
  limit: 10,
  searchQuery: '',
  totalRecords: 0,
  isLoading: false,
  error: null,
};

// ============================================================================
// 3. The Signal Store Definition
// ============================================================================
export const StudentsStore = signalStore(
  { providedIn: 'root' },

  // Local slice state for pagination parameters & flags
  withState(initialStudentsState),

  // Local cache layer (Provides .entities(), .entityMap(), and .ids())
  withEntities<Student>(),

  // Public Methods and Async Network Pipeline
  withMethods((store, http = inject(HttpClient)) => {

    /**
     * Internal RX Method: Automatically watches state signals and fetches
     * the matching block of data from your NestJS paginated endpoint.
     */
    const loadPaginatedStudents = rxMethod<{ page: number; limit: number; search: string }>(
      pipe(
        // Debounce prevents hitting your server on every single keystroke while typing a search
        debounceTime(300),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),

        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ page, limit, search }) => {
          const params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString())
            .set('q', search);

          return http.get<PaginatedResponse<Student>>('/api/students/paginated', { params });
        }),
        tap({
          next: (response) => {
            patchState(store,
              // View-Port Replacement: Safely swaps out old page entries with the clean current page
              setAllEntities(response.items),
              {
                totalRecords: response.total,
                isLoading: false
              }
            );
          },
          error: (err) => {
            patchState(store, {
              error: err.error?.message || 'Failed to sync ledger records.',
              isLoading: false
            });
          }
        })
      )
    );

    return {
      // ----------------------------------------------------------------------
      // UI Control API (State Mutators called directly by your Components)
      // ----------------------------------------------------------------------
      setPage: (page: number) => patchState(store, { page }),

      setLimit: (limit: number) => patchState(store, { limit, page: 1 }),

      setSearch: (searchQuery: string) => patchState(store, { searchQuery, page: 1 }),

      // ----------------------------------------------------------------------
      // Data Mutation API (CRUD triggers talking to the NestJS Backend)
      // ----------------------------------------------------------------------

      // CREATE
      createStudent: rxMethod<CreateStudentDto>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((dto) => http.post<Student>('/api/students', dto)),
          tap({
            next: (newStudent) => {
              patchState(store,
                addEntity(newStudent), // Add directly into your local entities cache
                {
                  totalRecords: store.totalRecords() + 1,
                  isLoading: false
                }
              );
            },
            error: (err) => patchState(store, { error: err.error?.message || 'Create failed.', isLoading: false })
          })
        )
      ),

      // UPDATE
      updateStudent: rxMethod<{ id: string; dto: UpdateStudentDto }>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(({ id, dto }) => http.patch<Student>(`/api/students/${id}`, dto)),
          tap({
            next: (updatedStudent) => {
              patchState(store,
                // Instantly patches the item in the local map array
                updateEntity({ id: updatedStudent.id, changes: updatedStudent }),
                { isLoading: false }
              );
            },
            error: (err) => patchState(store, { error: err.error?.message || 'Update failed.', isLoading: false })
          })
        )
      ),

      // DELETE
      deleteStudent: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((id) => http.delete<{ success: boolean }>(`/api/students/${id}`).pipe(
            // Pass the targeted ID forward to the next hook block
            tap(() => id)
          )),
          tap({
            next: (id) => {
              patchState(store,
                // removeEntity(id),
                {
                  totalRecords: store.totalRecords() - 1,
                  isLoading: false
                }
              );
            },
            error: (err) => patchState(store, { error: err.error?.message || 'Deletion failed.', isLoading: false })
          })
        )
      ),

      // Expose the watcher so the initialization hook can read it
      _runWatcher: loadPaginatedStudents
    };
  }),

  // ============================================================================
  // 4. Reactive Hooks Lifecycle
  // ============================================================================
  withHooks({
    onInit(store) {
      // Binds the execution loop reactively.
      // Whenever page(), limit(), or searchQuery() signals update, the HTTP call handles the rest.
      store._runWatcher(() => ({
        page: store.page(),
        limit: store.limit(),
        search: store.searchQuery()
      }));
    }
  })
);
