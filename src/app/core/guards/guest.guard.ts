import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../../state/auth.store';

export const guestGuard: CanActivateFn = () => {
  const store = inject(AuthStore);
  const router = inject(Router);

  // Read the reactive signal value directly
  if (store.isLoggedIn()) {
    // If logged in, kick them away from the login page and send to dashboard
    router.navigate(['/dashboard']);
    return false;
  }

  // Allow access to the login page if they are a guest
  return true;
};
