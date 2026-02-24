import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonContent, IonButton, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { lockClosedOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { supabase } from 'src/app/config/supabase.config';
import { Router } from '@angular/router';
import { CustomInputComponent } from 'src/app/shared/components/custom-input/custom-input.component';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton, IonIcon, IonSpinner, CommonModule, ReactiveFormsModule, CustomInputComponent, HeaderComponent]
})
export class ResetPasswordPage implements OnInit {

  form = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirm: new FormControl('', [Validators.required])
  });

  loading = false;
  success = false;
  errorMsg = '';

  constructor(private router: Router) {
    addIcons({ lockClosedOutline, checkmarkCircleOutline });
  }

  async ngOnInit() {
  // 👇 Esto procesa el token del link y crea la sesión
  const hash = window.location.hash;
  if (hash) {
    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (accessToken && refreshToken) {
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
    }
  }
}

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.form.value.password !== this.form.value.confirm) {
      this.errorMsg = 'Las contraseñas no coinciden';
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    const { error } = await supabase.auth.updateUser({
      password: this.form.value.password!
    });

    this.loading = false;

    if (error) {
      this.errorMsg = 'Error al actualizar la contraseña. El link puede haber expirado.';
    } else {
      this.success = true;
      setTimeout(() => {
        this.router.navigate(['/auth'], { replaceUrl: true });
      }, 3000);
    }
  }
}