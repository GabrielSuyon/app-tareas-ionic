import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, ɵInternalFormsSharedModule } from '@angular/forms';
import { Item, Task } from 'src/app/models/task.model';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { Utils } from 'src/app/services/utils';
import { IonContent, IonButton, IonItem, IonLabel, IonIcon, IonRange, IonReorderGroup, IonReorder, IonCheckbox, IonButtons } from "@ionic/angular/standalone";
import { HeaderComponent } from "../header/header.component";
import { CustomInputComponent } from "../custom-input/custom-input.component";
import { CommonModule } from "@angular/common";
import { addIcons } from 'ionicons';
import { personOutline, documentOutline } from 'ionicons/icons';
import { ReorderEndCustomEvent } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { TaskService } from 'src/app/services/task.service';


@Component({
  selector: 'app-add-update-task',
  templateUrl: './add-update-task.component.html',
  styleUrls: ['./add-update-task.component.scss'],
  imports: [IonContent, HeaderComponent, CustomInputComponent, CommonModule, IonButton, IonItem, IonLabel, IonIcon, IonRange, IonReorderGroup, IonReorder, ɵInternalFormsSharedModule, IonCheckbox, IonCheckbox,
    FormsModule, IonButtons],
})
export class AddUpdateTaskComponent implements OnInit {

  @Input() task: Task;
  user = {} as User

  form = new FormGroup({
    id: new FormControl(''),
    title: new FormControl('', [Validators.required, Validators.minLength(4)]),
    description: new FormControl('', [Validators.required, Validators.minLength(4)]),
    done: new FormControl(false),          // ✅ Agregado, existe en Task
    priority: new FormControl('medium'),
    items: new FormControl([]),
  })

  constructor(private authService: AuthService,
    private utilsSvc: Utils,
    private taskService: TaskService
  ) {
    addIcons({ personOutline, documentOutline });
  }

  ngOnInit() {
    this.user = this.utilsSvc.getElementFromLocalstorage('user') 
    if (this.task) {
      this.form.patchValue({
      ...this.task,
      items: this.task.items ? JSON.parse(JSON.stringify(this.task.items)) : []
    });
    this.form.updateValueAndValidity();
    }
  }

  async submit() {
  if (this.task) {
    const result = await this.taskService.updateTask(this.task.id, this.form.value as Task);
    if (result.success) {
      this.utilsSvc.presentToast({ message: 'Tarea actualizada', color: 'success', icon: 'checkmark-outline' });
      this.utilsSvc.dissmissModal();
    }
  } else {
        console.log('Form value:', this.form.value); // 👈
    const result = await this.taskService.createTask(this.form.value as Task);
    console.log('Resultado createTask:', result);
    if (result.success) {
      this.utilsSvc.presentToast({ message: 'Tarea creada', color: 'success', icon: 'checkmark-outline' });
      this.utilsSvc.dissmissModal();
    }else {
      console.log('Error:', result.error);
  }
} 
  }
  getPercentage() {
    return this.utilsSvc.getPercentage(this.form.value as Task)
  }

  handleReorderEnd(event: ReorderEndCustomEvent) {
    this.form.value.items = event.detail.complete(this.form.value.items);
    this.form.updateValueAndValidity();
  }

  removeItem(index: number) {
    this.form.value.items.splice(index, 1);
    this.form.updateValueAndValidity();
  }

  createItem() {
    this.utilsSvc.presentAlert({
      header: 'Nueva Actividad',
      backdropDismiss: false,
      inputs: [
        {
          name: 'name',
          type: 'textarea',
          placeholder: 'Hace algo...'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',

        },
        {
          text: 'Agregar',
          handler: (res) => {


            let item: Item = { name: res.name, completed: false };
            this.form.value.items.push(item);
            this.form.updateValueAndValidity();
          }
        }
      ]
    })
  }
}