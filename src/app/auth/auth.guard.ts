import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    // User is logged in, allow access
    return true;
  } else {
    // User is not logged in, redirect to the login page
    return router.createUrlTree(['/login']);
  }
};

export const publicGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    // User is logged in, redirect away from public pages
    return router.createUrlTree(['/dashboard']);
  } else {
    // User is not logged in, allow access to public pages
    return true;
  }
};
