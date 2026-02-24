import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { supabase } from '../config/supabase.config';

export const noAuthGuard: CanActivateFn = async () => {
  const router = inject(Router);
  
  const { data: { user } } = await supabase.auth.getUser();
  console.log('NO-AUTH GUARD user:', user);
  
  if (!user) return true;
  router.navigate(['/tabs/home']);
  return false;
};