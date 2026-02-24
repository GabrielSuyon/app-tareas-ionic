import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const session = await authService.getSession();
  console.log('AUTH GUARD sesión:', session);
  if (session) return true;
  router.navigate(['/auth']);
  return false;
};