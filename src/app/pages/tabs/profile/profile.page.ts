import { Component, ChangeDetectorRef  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon, IonAvatar, IonSpinner, IonActionSheet  } from '@ionic/angular/standalone';
import { SharedModule } from 'src/app/shared/shared.module';
import { AuthService } from 'src/app/services/auth.service';
import { Utils } from 'src/app/services/utils';
import { addIcons } from 'ionicons';
import { logOutOutline, cameraOutline, pencilOutline, lockClosedOutline,mailOutline, imageOutline,      // ← NUEVO
  closeOutline    } from 'ionicons/icons';
import { User } from 'src/app/models/user.model';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButton,IonActionSheet , IonIcon, IonAvatar, IonSpinner, CommonModule, FormsModule, SharedModule]
})
export class ProfilePage {

  user = {} as User;
  loading = false;
  uploadingPhoto = false;
  isActionSheetOpen = false;

  actionSheetButtons = [
    {
      text: 'Seleccionar imagen',
      icon: 'image-outline',
      handler: () => this.selectPhoto()
    },
    {
      text: 'Tomar una foto',
      icon: 'camera-outline',
      handler: () => this.takePhoto()
    },
    {
      text: 'Cancelar',
      role: 'cancel',
      icon: 'close-outline'
    }
  ];

  constructor(
    private authService: AuthService,
    private utilsSvc: Utils,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ logOutOutline, cameraOutline, pencilOutline, lockClosedOutline,mailOutline, imageOutline,closeOutline    });
  }

  async ionViewDidEnter() {
    await this.loadProfile();
  }

  ngOnInit() {
  // 👇 Recarga el perfil cuando el usuario vuelve a esta pestaña
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      this.loadProfile();
    }
  });
}


  async loadProfile() {
  this.loading = true;
  const profile = await this.authService.getProfile();
  console.log('Perfil obtenido:', profile); // 👈 agrega esto
  if (profile) {
    this.user = profile;
    this.utilsSvc.setElementInLocalstorage('user', profile);
  }
  this.loading = false;
}

  // Cambiar foto
 async changePhoto() {
  this.isActionSheetOpen = true;
}

  selectPhoto = async () => {
  await this.pickPhoto(CameraSource.Photos);
}

takePhoto = async () => {
  await this.pickPhoto(CameraSource.Camera);
}

async pickPhoto(source: CameraSource) {
  try {
    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      source
    });

    if (!photo.dataUrl) return;
    this.uploadingPhoto = true;

    const response = await fetch(photo.dataUrl);
    const blob = await response.blob();
    const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });

    const result = await this.authService.uploadProfilePhoto(file, this.user.id);
    if (result.success) {
      this.user.photo_url = result.url;
      this.utilsSvc.setElementInLocalstorage('user', this.user);
      this.utilsSvc.presentToast({ message: 'Foto actualizada', color: 'success', icon: 'checkmark-outline' });
    }
  } catch (error) {
    console.log('Cancelado:', error);
  } finally {
    this.uploadingPhoto = false;
  }
}


  // Cambiar nombre
  async changeName() {
  this.utilsSvc.presentAlert({
    header: 'Cambiar nombre',
    inputs: [{ name: 'name', type: 'text', value: this.user.name, placeholder: 'Tu nombre' }],
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Guardar',
        // ← NO uses async aquí, llama a un método separado
        handler: (res) => {
          if (!res.name) return false; // false mantiene el alert abierto
          this.doUpdateName(res.name); // ← método separado sin await
          return true; // true cierra el alert
        }
      }
    ]
  });
}

// ← método separado que sí puede ser async
private async doUpdateName(name: string) {
  const result = await this.authService.updateName(name);
  console.log('Resultado updateName:', result);
  if (result.success) {
    this.user.name = name;
    this.cdr.detectChanges();
    this.utilsSvc.setElementInLocalstorage('user', this.user);
    this.utilsSvc.presentToast({ 
      message: 'Nombre actualizado', 
      color: 'success', 
      icon: 'checkmark-outline' 
    });
  } else {
    this.utilsSvc.presentToast({ 
      message: 'Error al actualizar', 
      color: 'danger', 
      icon: 'close-outline' 
    });
  }
}

  // Cambiar contraseña
  async changeEmail() {
  this.utilsSvc.presentAlert({
    header: 'Cambiar correo',
    inputs: [
      { name: 'email', type: 'email', value: this.user.email, placeholder: 'Nuevo correo' }
    ],
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Guardar',
        handler: async (res) => {
          if (!res.email) return;
          const result = await this.authService.updateEmail(res.email);
          if (result.success) {
            this.utilsSvc.presentToast({ 
              message: 'Se envió un correo de confirmación', 
              color: 'success', 
              icon: 'checkmark-outline' 
            });
          } else {
            this.utilsSvc.presentToast({ 
              message: 'Error al actualizar correo', 
              color: 'danger', 
              icon: 'close-outline' 
            });
          }
        }
      }
    ]
  });
}

  async signOut() {
    this.utilsSvc.presentAlert({
      header: 'Cerrar sesión',
      message: '¿Estás seguro de que quieres cerrar sesión?',
      mode: 'ios',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Sí, cerrar sesión',
          handler: async () => {
            await this.utilsSvc.presentLoading({ message: 'Cerrando sesión...' });
            const result = await this.authService.signOut();
            await this.utilsSvc.dissmissLoading();
            if (result.success) this.utilsSvc.routerLink('/auth');
          }
        }
      ]
    });
  }
}