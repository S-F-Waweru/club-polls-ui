import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, pipe, switchMap, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { ClubFeeSetting, UpsertFeeSettingDto } from '../models/club.models';

export interface FeeSettingsState {
  current: ClubFeeSetting | null;
  isLoading: boolean;
  error: string | null;
  saved: boolean;
}

const initialState: FeeSettingsState = {
  current: null,
  isLoading: false,
  error: null,
  saved: false,
};

export const FeeSettingsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, http = inject(HttpClient)) => ({
    loadCurrent: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null, saved: false })),
        switchMap(() =>
          http.get<ClubFeeSetting>(`${environment.apiUrl}fee-settings/current`).pipe(
            tap({
              next: (current) => patchState(store, { current, isLoading: false }),
              error: (err) =>
                patchState(store, {
                  error: err.error?.message || 'Failed to load fee settings.',
                  isLoading: false,
                }),
            }),
            catchError(() => EMPTY),
          ),
        ),
      ),
    ),

    updateCurrent: rxMethod<UpsertFeeSettingDto>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null, saved: false })),
        switchMap((dto) =>
          http.patch<ClubFeeSetting>(`${environment.apiUrl}fee-settings/current`, dto).pipe(
            tap({
              next: (current) => patchState(store, { current, isLoading: false, saved: true }),
              error: (err) =>
                patchState(store, {
                  error: Array.isArray(err.error?.message)
                    ? err.error.message.join(', ')
                    : err.error?.message || 'Failed to update fee settings.',
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
