import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { noAuthGuard } from './guards/no-auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    canActivate: [noAuthGuard],
    loadComponent: () => import('./pages/auth/auth.page').then( m => m.AuthPage)
  },
   {
    path: 'auth/sign-up',  // ← AGREGA ESTA RUTA
    loadComponent: () => import('./pages/auth/sign-up/sign-up.page').then(m => m.SignUpPage)
  },
  {
    path: 'sign-up',
    loadComponent: () => import('./pages/auth/sign-up/sign-up.page').then( m => m.SignUpPage)
  },
  {
  path: 'tabs',
  canActivate: [authGuard],
  loadComponent: () => import('./pages/tabs/tabs.page').then(m => m.TabsPage),
  children: [
    {
      path: 'home',
      loadComponent: () => import('./pages/tabs/home/home.page').then(m => m.HomePage)
    },
    {
      path: 'profile',
      loadComponent: () => import('./pages/tabs/profile/profile.page').then(m => m.ProfilePage)
    },
    {
      path: '',
      redirectTo: 'home',
      pathMatch: 'full'
    }
  ]
},
  { path: 'auth-callback', loadComponent: () => import('./pages/auth-callback/auth-callback.page').then(m => m.AuthCallbackPage) },
  {
    path: 'reset-password',
    loadComponent: () => import('./pages/reset-password/reset-password.page').then( m => m.ResetPasswordPage)
  }

];