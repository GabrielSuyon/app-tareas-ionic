import { Component, Input, OnInit } from '@angular/core';
import { IonicModule } from "@ionic/angular";
import { CommonModule } from '@angular/common';
import { ThemeService } from 'src/app/services/theme.service';
import { Observable } from 'rxjs';
import { Utils } from 'src/app/services/utils';

import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [ IonicModule, CommonModule,  
  CommonModule,
  AsyncPipe  ],
})
export class HeaderComponent  implements OnInit {


@Input() title: string;
@Input() backButton: string;
@Input() isModal: boolean; 
@Input() color: string;
@Input() centerTitle: boolean;


  darkMode$: Observable<boolean>;
  
  constructor(private themeSvc: ThemeService,
    private utilsSvc: Utils
  ) {
    this.darkMode$ = this.themeSvc.darkMode.asObservable();
  }

  ngOnInit() {
    
  } 
  
  dismissModal() {
    this.utilsSvc.dissmissModal()
  }
  setTheme(darkMode: boolean) {
    this.themeSvc.setTheme(darkMode);
  }
  
  onClick() {
    throw new Error('Method not implemented.');
  }

  

}
