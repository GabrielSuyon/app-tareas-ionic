import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-logo',
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class LogoComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}