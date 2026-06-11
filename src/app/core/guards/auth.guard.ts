import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthRole } from '../../models/club.models';
import { AuthStore } from '../../state/auth.store';

export const authGuard: CanActivateFn = (route) => {
  const store = inject(AuthStore);
  const router = inject(Router);

  if (!store.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const allowedRoles = route.data?.['roles'] as AuthRole[] | undefined;
  const currentRole = store.currentUser()?.role;

  if (allowedRoles?.length && (!currentRole || !allowedRoles.includes(currentRole))) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
