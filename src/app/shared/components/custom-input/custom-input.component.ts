import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl } from '@angular/forms';
import { IonicModule } from "@ionic/angular";
import { ReactiveFormsModule } from '@angular/forms';
import { eyeOffOutline, eyeOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';


@Component({
  selector: 'app-custom-input',
  templateUrl: './custom-input.component.html',
  styleUrls: ['./custom-input.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class CustomInputComponent implements OnInit {

  @Input() control: FormControl;
  @Input() label: string;
  @Input() icon: string;
  @Input() type: string;
  @Input() autoComplete: string;
  placeholder: any;

  isPassword: boolean;
  hide: boolean = true;


  constructor() { 
    addIcons({ eyeOutline, eyeOffOutline }); 
  }

  ngOnInit() {
    if (this.type == 'password') this.isPassword = true;
  }
  showOrHidePassword() {
    this.hide = !this.hide;

    if (this.hide) {
      this.type = 'password';
    }else{
      this.type = 'text';
    }
  }
}
