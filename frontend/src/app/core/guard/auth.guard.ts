import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);

  if (!authService.isLoggedIn()) {
    const router = inject(Router);

    router.navigate(['/login']);

    return false;
  }
  return true;
};
