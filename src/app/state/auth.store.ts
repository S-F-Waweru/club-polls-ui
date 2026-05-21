import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState, withHooks } from '@ngrx/signals';
import { setAllEntities, removeAllEntities, withEntities } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY } from 'rxjs';
import { AuthService, AuthUser, LoginDto, RegisterDto } from '../services/auth.services';

export interface AuthState {
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialAuthState: AuthState = {
  isLoggedIn: false,
  isLoading: false,
  error: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },

  withState(initialAuthState),
  withEntities<AuthUser>(),

  withMethods((store, authService = inject(AuthService)) => {
    const currentUser = () => store.entities()[0] ?? null;

    return {
      currentUser,

      // 👇 ADD THIS METHOD: Populates state instantly before UI renders
      hydrateSession(user: AuthUser | null) {
        if (user) {
          patchState(store, setAllEntities([user]), { isLoggedIn: true, isLoading: false });
        } else {
          patchState(store, { isLoggedIn: false, isLoading: false });
        }
      },

      login: rxMethod<LoginDto>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((dto) =>
            authService.login(dto).pipe(
              switchMap(() => authService.getProfile()),
              tap((user) => {
                patchState(store, setAllEntities([user]), { isLoggedIn: true, isLoading: false });
                authService.navigateToDashboard();
              }),
              catchError((err) => {
                patchState(store, {
                  error: err.error?.message || 'Invalid email or password.',
                  isLoading: false,
                });
                return EMPTY;
              }),
            ),
          ),
        ),
      ),

      register: rxMethod<RegisterDto>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((dto) =>
            authService.register(dto).pipe(
              tap(() => patchState(store, { isLoading: false })),
              catchError((err) => {
                patchState(store, {
                  error: err.error?.message || 'Registration failed.',
                  isLoading: false,
                });
                return EMPTY;
              }),
            ),
          ),
        ),
      ),

      // Retained in case you want to manually refresh profile state elsewhere
      loadProfile: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(() =>
            authService.getProfile().pipe(
              tap((user) => {
                patchState(store, setAllEntities([user]), { isLoggedIn: true, isLoading: false });
              }),
              catchError(() => {
                patchState(store, { isLoggedIn: false, isLoading: false });
                return EMPTY;
              }),
            ),
          ),
        ),
      ),

      logout: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap(() =>
            authService.logout().pipe(
              tap(() => {
                patchState(store, removeAllEntities(), {
                  isLoggedIn: false,
                  isLoading: false,
                  error: null,
                });
              }),
              catchError(() => {
                patchState(store, removeAllEntities(), { isLoggedIn: false, isLoading: false });
                authService.navigateToLogin();
                return EMPTY;
              }),
            ),
          ),
        ),
      ),
    };
  }),

  withHooks({
    onInit(store) {
      // 🚨 REMOVED store.loadProfile() from here!
      // The App Initializer handles this check now before routing runs.
    },
  }),
);
