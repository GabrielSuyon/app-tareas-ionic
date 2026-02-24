import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController , LoadingOptions , ToastController, AlertController,AlertOptions,ModalController,ModalOptions } from '@ionic/angular/standalone';
import { Task } from '../models/task.model';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';


@Injectable({
  providedIn: 'root',
})
export class Utils {
  
  constructor(private loadingController: LoadingController,
    private toastController: ToastController,
    private router: Router, 
    private alertController: AlertController,
    private modalController: ModalController
  ) {}

  async presentToast(opts: { message: string, color?: string, icon?: string,duration?: number ,position?: 'top' | 'middle' | 'bottom' }) {
  const toast = await this.toastController.create({
    message: opts.message,
    duration: opts.duration || 2500,
    color: opts.color || 'primary',
    icon: opts.icon || undefined,
    position:  'middle' ,
  });
  await toast.present();
}

  
async takePicture (promptLabelHeader: string) {
  return await Camera.getPhoto({
    quality: 90,
    allowEditing: true,
    resultType: CameraResultType.DataUrl,
    source: CameraSource.Prompt,
    promptLabelHeader,
    promptLabelPhoto: 'Seleciona una imagen',
    promptLabelPicture: 'Tomar Una Foto'
  });
};



  // Loading
  // Present
  async presentLoading(opts?: LoadingOptions) {
    const loading = await this.loadingController.create(opts);
    await loading.present();
  }
  //Dismiss
  async dissmissLoading() {
    return await this.loadingController.dismiss();
} 


// Local Storage
// Set
setElementInLocalstorage(key: string, element: any) {
  return localStorage.setItem(key, JSON.stringify(element))
}
// Get
getElementFromLocalstorage(key: string) {
  return JSON.parse(localStorage.getItem(key) || '{}');
}
 // Router
  routerLink(url: string){
    return this.router.navigateByUrl(url);
  }
//alert
 async presentAlert(opts: AlertOptions) {
  const alert = await this.alertController.create(opts);
 
  await alert.present();
 }
 // Modal
 // Present
 async presentModal(opts: ModalOptions) {
  const modal = await this.modalController.create(opts);
 
  await modal.present();
  const {data} = await modal.onWillDismiss(); 

  if(data){
    return data;
  }
 }

 // Dismiss
 dissmissModal(data?: any){
  try {
    this.modalController.dismiss(data);
  } catch (e) {
    // modal ya fue cerrado
  }
}


  getPercentage(task: Task) {
  if (!task.items || task.items.length === 0) return 0;
  let completedItems = task.items.filter(item => item.completed).length;
  let totalItems = task.items.length;
  let percentage = (100 / totalItems) * completedItems;
  return parseInt(percentage.toString());
}


}