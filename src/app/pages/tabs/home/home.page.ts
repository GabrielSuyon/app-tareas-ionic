import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonGrid, IonRow, IonCol, IonCard, IonButton, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { SharedModule } from 'src/app/shared/shared.module';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { Task } from 'src/app/models/task.model';
import { addIcons } from 'ionicons';
import { eyeOutline, trashOutline } from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth.service';
import { Utils } from 'src/app/services/utils';
import { TaskService } from 'src/app/services/task.service';
import { AddUpdateTaskComponent } from 'src/app/shared/components/add-update-task/add-update-task.component';
import { supabase } from 'src/app/config/supabase.config';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonContent, IonGrid, IonRow, IonCol, IonCard, CommonModule, FormsModule, SharedModule, IonButton, IonIcon, HeaderComponent, IonSpinner]
})
export class HomePage implements OnInit, OnDestroy {

  tasks: Task[] = [];
  loading = false;
  private tasksSub: Subscription;

  constructor(
    private authService: AuthService,
    private utilsSvc: Utils,
    private taskService: TaskService
  ) {
    addIcons({ eyeOutline, trashOutline });
  }

  ngOnInit() {
    this.initRealtime();
  }

  // 👇 Reemplaza getTasks() e initRealtime() en uno solo
  async initRealtime() {
    this.loading = true;

    // Obtener usuario actual
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Cargar tareas por primera vez
    await this.taskService.getTasks();

    // Arrancar escucha en tiempo real
    this.taskService.startRealtimeListener(user.id);

    // Suscribirse a cambios automáticos
    this.tasksSub = this.taskService.tasks$.subscribe(tasks => {
      this.tasks = tasks;
      this.loading = false;
    });
  }

  // 👇 MUY IMPORTANTE: limpiar al salir de la página
  ngOnDestroy() {
    this.taskService.stopRealtimeListener();
    this.tasksSub?.unsubscribe();
  }

  getPercentage(task: Task) {
    return this.utilsSvc.getPercentage(task);
  }

  async addOrUpdateTask(task?: Task) {
    await this.utilsSvc.presentModal({
      component: AddUpdateTaskComponent,
      componentProps: { task },
      cssClass: 'add-update-modal'
    });
    // 👇 Ya no necesitas llamar getTasks() aquí
    // el tiempo real lo actualizará solo
  }

  truncateText(text: string, limit: number = 150): string {
  if (!text) return '';
  if (text.length <= limit) return text + '.';
  
  // Corta en el límite y busca el último espacio para no cortar palabras
  const truncated = text.substring(0, limit);
  const lastSpace = truncated.lastIndexOf(' ');
  return truncated.substring(0, lastSpace) + '...';
}


  async deleteTask(task: Task) {
     console.log('deleteTask llamado', task); 
    this.utilsSvc.presentAlert({
      header: '¿Eliminar tarea?',
      message: `¿Estás seguro de eliminar "${task.title}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: async () => {
            console.log('handler ejecutado');
            const result = await this.taskService.deleteTask(task.id);
            console.log('resultado:', result);
            if (result.success) {
              // 👇 Ya no necesitas llamar getTasks() aquí tampoco
              this.utilsSvc.presentToast({
                message: 'Tarea eliminada',
                color: 'danger',
                icon: 'trash-outline',
                position: 'middle'
              });
            }
          }
        }
      ]
    });
  }
}