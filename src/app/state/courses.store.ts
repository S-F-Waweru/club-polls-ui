import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState, withHooks } from '@ngrx/signals';
import { withEntities, setAllEntities, addEntity, updateEntity, removeEntity } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { HttpClient, HttpParams } from '@angular/common/http';
import { pipe, switchMap, tap, catchError, map, EMPTY, debounceTime, distinctUntilChanged } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FeeStructure {
  id: string;
  course_id: string;
  totalAmount: number;
  instalments: number;
  instalment_amount: number;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  durationWeeks: number;
  maxCapacity: number;
  isActive: boolean;
  feeStructure?: FeeStructure;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseDto {
  code: string; name: string; description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  durationWeeks: number; maxCapacity?: number; isActive?: boolean;
}

export interface CreateFeeStructureDto {
  course_id: string; totalAmount: number; instalments: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  lastPage: number;
}

export interface CoursesState {
  page: number;
  limit: number;
  searchQuery: string;
  totalRecords: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: CoursesState = {
  page: 1,
  limit: 10,
  searchQuery: '',
  totalRecords: 0,
  isLoading: false,
  error: null,
};

export const CoursesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withEntities<Course>(),

  withMethods((store, http = inject(HttpClient)) => {
    const loadPaginatedCourses = rxMethod<{ page: number; limit: number }>(
      pipe(
        debounceTime(300),
        distinctUntilChanged((prev, curr) => prev.page === curr.page && prev.limit === curr.limit),
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ page, limit }) => {
          const params = new HttpParams().set('page', page).set('limit', limit);
          return http.get<PaginatedResponse<Course>>(`${environment.apiUrl}courses/paginated`, { params });
        }),
        tap({
          next: (response) => {
            patchState(store,
              setAllEntities(response.data),
              { totalRecords: response.total, isLoading: false }
            );
          },
          error: (err) => patchState(store, {
            error: err.error?.message || 'Failed to load courses.',
            isLoading: false
          })
        })
      )
    );

    return {
      // Pagination controls
      setPage: (page: number) => patchState(store, { page }),
      setLimit: (limit: number) => patchState(store, { limit, page: 1 }),
      setSearch: (searchQuery: string) => patchState(store, { searchQuery, page: 1 }),

      // Create course + fee structure (unchanged from your original)
      createCourseWithFee: rxMethod<{
        courseDto: CreateCourseDto;
        feeDto: { totalAmount: number; instalments: number };
      }>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(({ courseDto, feeDto }) =>
            http.post<Course>(`${environment.apiUrl}courses`, courseDto).pipe(
              tap((c) => patchState(store, addEntity(c))),
              switchMap((c) =>
                http
                  .post<FeeStructure>(`${environment.apiUrl}fee-structures`, {
                    course_id: c.id,
                    ...feeDto,
                  })
                  .pipe(
                    tap((fee) =>
                      patchState(
                        store,
                        updateEntity({ id: c.id, changes: { feeStructure: fee } }),
                        { isLoading: false },
                      ),
                    ),
                  ),
              ),
              catchError((e) => {
                patchState(store, { error: e.error?.message ?? 'Create failed', isLoading: false });
                return EMPTY;
              }),
            ),
          ),
        ),
      ),

      updateCourse: rxMethod<{ id: string; dto: Partial<CreateCourseDto> }>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(({ id, dto }) => http.patch<Course>(`${environment.apiUrl}courses/${id}`, dto)),
          tap({
            next: (c) =>
              patchState(store, updateEntity({ id: c.id, changes: c }), { isLoading: false }),
            error: (e) =>
              patchState(store, { error: e.error?.message ?? 'Update failed', isLoading: false }),
          }),
        ),
      ),

      deleteCourse: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((id) => http.delete(`${environment.apiUrl}courses/${id}`).pipe(map(() => id))),
          tap({
            next: (id) => patchState(store, removeEntity(id), { isLoading: false }),
            error: (e) =>
              patchState(store, { error: e.error?.message ?? 'Delete failed', isLoading: false }),
          }),
        ),
      ),

      updateFee: rxMethod<{ id: string; courseId: string; dto: Partial<CreateFeeStructureDto> }>(
        pipe(
          switchMap(({ id, courseId, dto }) =>
            http
              .patch<FeeStructure>(`${environment.apiUrl}fee-structures/${id}`, dto)
              .pipe(
                tap((fee) =>
                  patchState(store, updateEntity({ id: courseId, changes: { feeStructure: fee } })),
                ),
              ),
          ),
        ),
      ),
      loadCourseById: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((id) => http.get<Course>(`${environment.apiUrl}courses/${id}`)),
          tap({
            next: (course) => {
              // Update or add the course in the entity map
              const existing = store.entityMap()[course.id];
              if (existing) {
                patchState(store, updateEntity({ id: course.id, changes: course }), {
                  isLoading: false,
                });
              } else {
                patchState(store, addEntity(course), { isLoading: false });
              }
            },
            error: (err) =>
              patchState(store, {
                error: err.error?.message || 'Failed to load course.',
                isLoading: false,
              }),
          }),
        ),
      ),
      exportCourses: rxMethod<void>(
        pipe(
          tap(() =>
            patchState(store, {
              isLoading: true,
              error: null,
            }),
          ),

          switchMap(() =>
            http.get(
              `${environment.apiUrl}courses/export/all`,
              {
                responseType: 'blob',
              },
            ),
          ),

          tap({
            next: (blob) => {
              const url = window.URL.createObjectURL(blob);

              const a = document.createElement('a');
              a.href = url;
              a.download = 'Courses.xlsx';
              a.click();

              window.URL.revokeObjectURL(url);
            },
            // next: (blob) => {
            //   saveAs(blob, `students-${new Date().toISOString().split('T')[0]}.xlsx`);
            //
            //   patchState(store, {
            //     isLoading: false,
            //   });
            // },

            error: (err) => {
              patchState(store, {
                error: err.error?.message || 'Failed to export students.',
                isLoading: false,
              });
            },
          }),
        ),
      ),

      _runWatcher: loadPaginatedCourses,
    };
  }),



  withHooks({
    onInit(store) {
      store._runWatcher(() => ({ page: store.page(), limit: store.limit() }));
    }
  })
);
