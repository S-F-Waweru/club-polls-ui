import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, throwError, EMPTY } from 'rxjs';
import { catchError, filter, switchMap, take, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

// ============================================================================
// Refresh lock
// Prevents multiple failed requests from each triggering their own refresh.
// Only the first 401 calls /auth/refresh. The rest wait for it to finish.
// ============================================================================
let isRefreshing = false;
const refreshDone$ = new BehaviorSubject<boolean>(false);

// ============================================================================
// The interceptor
// ============================================================================
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const http = inject(HttpClient);
  const router = inject(Router);

  // Step 1: attach withCredentials to every request
  // This tells the browser to include the httpOnly cookie automatically
  const withCreds = req.clone({ withCredentials: true });

  return next(withCreds).pipe(
    catchError((error: HttpErrorResponse) => {
      // Only handle 401 (Unauthorized) errors
      // Skip the refresh endpoint itself to avoid infinite loops
      if (error.status !== 401 || req.url.includes('/auth/refresh')) {
        return throwError(() => error);
      }

      // Step 2: first 401 kicks off a refresh
      if (!isRefreshing) {
        isRefreshing = true;
        refreshDone$.next(false);

        return http.post<void>('/api/auth/refresh', {}, { withCredentials: true }).pipe(
          tap(() => {
            isRefreshing = false;
            refreshDone$.next(true); // signal that refresh is done
          }),
          switchMap(() => {
            // Retry the original failed request now that the cookie is fresh
            return next(withCreds);
          }),
          catchError((refreshError) => {
            // Refresh itself failed — session is dead, send to login
            isRefreshing = false;
            refreshDone$.next(false);
            router.navigate(['/login']);
            return EMPTY;
          }),
        );
      }

      // Step 3: other requests that got a 401 wait for the refresh to finish
      // then retry themselves
      return refreshDone$.pipe(
        filter((done) => done), // wait until refresh completes
        take(1),
        switchMap(() => next(withCreds)), // retry with fresh cookie
      );
    }),
  );
};
