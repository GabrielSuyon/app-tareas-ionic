import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import  {  NgCircleProgressModule  }  from  'ng-circle-progress' ;
import { AddUpdateTaskComponent } from './components/add-update-task/add-update-task.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AddUpdateTaskComponent,
     NgCircleProgressModule.forRoot ( { 
      radius : 100 , 
      outerStrokeWidth : 16 , 
      innerStrokeWidth : 8 , 
      outerStrokeColor : "#78C000" , 
      innerStrokeColor : "#C7E596" , 
      animationDuration : 300 ,
    } )
    
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgCircleProgressModule,
    AddUpdateTaskComponent
  ]
})
export class SharedModule { }