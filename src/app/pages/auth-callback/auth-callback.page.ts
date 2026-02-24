import { Component, OnInit } from '@angular/core';
import { IonContent, IonSpinner, IonIcon } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, closeCircleOutline } from 'ionicons/icons';
import { supabase } from 'src/app/config/supabase.config';

@Component({
  selector: 'app-auth-callback',
  templateUrl: './auth-callback.page.html',
  styleUrls: ['./auth-callback.page.scss'],
  standalone: true,
  imports: [IonContent, IonSpinner, CommonModule, IonIcon]
})
export class AuthCallbackPage implements OnInit {

  status: 'loading' | 'success' | 'error' = 'loading';
  message = '';

  constructor() {
    addIcons({ checkmarkCircleOutline, closeCircleOutline });
  }

  async ngOnInit() {
    const hash = window.location.hash;

    if (hash.includes('error')) {
      this.status = 'error';
      this.message = 'El link es inválido o ha expirado. Solicita un nuevo cambio de correo.';
    } else if (hash.includes('access_token')) {
      // 👇 Obtener el nuevo correo del usuario y actualizar profiles
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ email: user.email, updated_at: new Date().toISOString() })
          .eq('id', user.id);
      }
      this.status = 'success';
      this.message = '¡Correo actualizado correctamente! Puedes cerrar esta pestaña.';
    } else {
      this.status = 'error';
      this.message = 'Algo salió mal. Intenta de nuevo.';
    }
  }
}