import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CusstomValidators } from 'src/app/utils/custom-validators';
import { LogoComponent } from "src/app/shared/components/logo/logo.component";
import { HeaderComponent } from "src/app/shared/components/header/header.component";
import { CustomInputComponent } from "src/app/shared/components/custom-input/custom-input.component";
import { AuthService } from 'src/app/services/auth.service';
import { Utils } from 'src/app/services/utils';


@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    LogoComponent,
    HeaderComponent,
    CustomInputComponent
  ]
})
export class SignUpPage implements OnInit {

   form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(4)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmpassword: new FormControl('')
  });

  isLogin: boolean = true;  // true = login, false = registro
  isLoading: boolean = false;
  
  // Propiedades para el toast (corregidas)
  showToast: boolean = false;
  toastMessage: string = '';
  toastColor: 'success' | 'danger' | 'warning' = 'success';

  constructor(
    private authService: AuthService,
    private router: Router,
    private utilsSvc: Utils
  ) { }

  ngOnInit() {
    this.checkSession();
    this.confirmPasswordValidator();
  }

  // Verificar si ya hay una sesión activa
  async checkSession() {
    const session = await this.authService.getSession();
    if (session) {
      this.router.navigate(['/tabs']);
    }
  }

  confirmPasswordValidator() {
    this.form.controls.confirmpassword.setValidators([
      Validators.required,
      CusstomValidators.matchValues(this.form.controls.password)
    ])

    this.form.controls.confirmpassword.updateValueAndValidity(); 
  }


  async submit() {
  if (this.form.valid) {
    this.isLoading = true;
    await this.utilsSvc.presentLoading({ message: 'Registrando...' });
    const email = this.form.value.email!;
    const password = this.form.value.password!;
    const name = this.form.value.name!;
    
    await this.register(email!, password!, name!);
    
    this.isLoading = false;
  } else {
    this.form.markAllAsTouched();
  }
}

  async login(email: string, password: string) {
    const result = await this.authService.signIn(email, password);
    
    if (result.success) {
      console.log('Login exitoso:', result.data);
      this.presentToast('¡Inicio de sesión exitoso!', 'success');
      
      // Esperar un momento y redirigir
      setTimeout(() => {
        this.router.navigate(['/tabs'], { replaceUrl: true });
        this.utilsSvc.dissmissLoading();
      }, 500);
    } else {
      console.error('Error en login:', result.error);
      this.presentToast(this.getErrorMessage(result.error), 'danger');
      this.utilsSvc.dissmissLoading();
    }
  }




  async register(email: string, password: string, name: string) {
  const result = await this.authService.signUp(email, password, name);

  if (result.success) {
    const user = result.data?.user;

    localStorage.setItem('user', JSON.stringify({
      uid: user?.id,
      name: user?.user_metadata?.['name'],
      email: user?.email
    }));

    await this.utilsSvc.dissmissLoading();

    this.utilsSvc.presentToast({
      message: `Te damos la bienvenida ${user.user_metadata?.['name']}`,
      color: 'primary',
      icon: 'person-outline'
    });

    setTimeout(() => {
      this.router.navigate(['/tabs'], { replaceUrl: true });
    }, 1500);

  } else {
    // ✅ AQUÍ CAPTURA EL ERROR DEL PERFIL
    await this.utilsSvc.dissmissLoading();

    console.error('❌ Error detallado:', result.error);

    this.utilsSvc.presentToast({
      message: 'Error: ' + result.error,
      color: 'danger',
      icon: 'alert-circle-outline',
      duration: 5000
    });
  }
}

  toggleMode() {
    this.isLogin = !this.isLogin;
    this.form.reset();
  }

  // Método para mostrar mensajes
  presentToast(message: string, color: 'success' | 'danger' | 'warning') {
    this.toastMessage = message;
    this.toastColor = color;
    this.showToast = true;
  }

  // Mensajes de error más amigables en español
  getErrorMessage(error: string): string {
    const errorMessages: { [key: string]: string } = {
      'Invalid login credentials': 'Credenciales incorrectas',
      'Email not confirmed': 'Por favor confirma tu correo electrónico',
      'User already registered': 'Este correo ya está registrado',
      'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
      'Invalid email': 'Correo electrónico inválido',
      'Email rate limit exceeded': 'Demasiados intentos, espera un momento'
    };

    return errorMessages[error] || error || 'Error desconocido';
  }

  goToSignUp() {
  (document.activeElement as HTMLElement)?.blur();
  this.router.navigate(['/auth/sign-up']);
}
  
}