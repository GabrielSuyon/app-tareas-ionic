import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { supabase } from 'src/app/config/supabase.config';
import { Utils } from 'src/app/services/utils';
import { LogoComponent } from "src/app/shared/components/logo/logo.component";
import { HeaderComponent } from "src/app/shared/components/header/header.component";
import { CustomInputComponent } from "src/app/shared/components/custom-input/custom-input.component";
import { IonicModule, NavController  } from "@ionic/angular";
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: true,
  imports: [ 
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
    LogoComponent, 
    HeaderComponent, 
    CustomInputComponent, 
    IonicModule
  ]
})
export class AuthPage implements OnInit {

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    name: new FormControl('')
  });

  isLogin: boolean = true;
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  showToast: boolean = false;
  toastMessage: string = '';
  toastColor: 'success' | 'danger' | 'warning' = 'success';

  constructor(
    private authService: AuthService,
    private router: Router,
    private utilsSvc: Utils,
    private navCtrl: NavController 
  ) { }

  ngOnInit() {
    this.checkSession();
  }

  async checkSession() {
    const session = await this.authService.getSession();
    if (session) {
      this.router.navigate(['/tabs']);
    }
  }

  async submit() {
  if (this.isSubmitting) return;
  if (this.form.valid) {
    this.isSubmitting = true;
    this.isLoading = true;
    const email = this.form.value.email!;
    const password = this.form.value.password!;
    if (this.isLogin) {
      await this.login(email, password);
    } else {
      await this.register(email, password, this.form.value.name!);
    }
    this.isLoading = false;
    this.isSubmitting = false;
  } else {
    this.form.markAllAsTouched();
  }
}

async login(email: string, password: string) {
  const result = await this.authService.signIn(email, password);
  console.log('resultado login:', result);
  if (result.success) {
    const user = result.data.user;
    localStorage.setItem('user', JSON.stringify({
      uid: user.id,
      name: user.user_metadata?.['name'] || '',
      email: user.email
    }));
    
    // Fuerza recarga completa - cuando la app reinicia,
    // Supabase ya tiene la sesión guardada en localStorage
    window.location.replace('/tabs/home');
    
  } else {
    this.presentToast(this.getErrorMessage(result.error), 'danger');
  }
}

  async register(email: string, password: string, name: string) {
    const result = await this.authService.signUp(email, password, name);
    if (result.success) {
      this.presentToast('¡Registro exitoso! Puedes iniciar sesión', 'success');
      this.isLogin = true;
      this.form.reset();
    } else {
      this.presentToast(this.getErrorMessage(result.error), 'danger');
    }
  }

  toggleMode() {
    this.isLogin = !this.isLogin;
    this.form.reset();
  }

  presentToast(message: string, color: 'success' | 'danger' | 'warning') {
    this.toastMessage = message;
    this.toastColor = color;
    this.showToast = true;
  }

  getErrorMessage(error: string): string {
  const errorMessages: { [key: string]: string } = {
    'Invalid login credentials': 'Correo o contraseña incorrectos',
    'Email not confirmed': 'Por favor confirma tu correo electrónico',
    'User already registered': 'Este correo ya está registrado',
    'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
    'Invalid email': 'El correo electrónico no es válido',
    'Email rate limit exceeded': 'Demasiados intentos, espera unos minutos'
  };
  return errorMessages[error] || 'Ocurrió un error, intenta de nuevo';
}

  goToSignUp() {
    (document.activeElement as HTMLElement)?.blur();
    this.router.navigate(['/auth/sign-up']);
  }

  async forgotPassword() {
  this.utilsSvc.presentAlert({
    header: 'Recuperar contraseña',
    inputs: [{ name: 'email', type: 'email', placeholder: 'Tu correo registrado' }],
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Enviar',
        handler: async (res) => {
          if (!res.email) return;
          const { error } = await supabase.auth.resetPasswordForEmail(res.email, {
            redirectTo: 'http://localhost:8100/reset-password'
          });
          if (!error) {
            this.presentToast('Correo de recuperación enviado', 'success');
          } else {
            this.presentToast('Correo no encontrado', 'danger');
          }
        }
      }
    ]
  });
}
}