import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService  {

  darkMode = new BehaviorSubject<boolean>(false);

  constructor() {
    // Inicializar el tema al cargar la aplicación
    this.initializeTheme();
  }

   private initializeTheme() {
    // Intenta cargar el tema guardado en localStorage
    const savedTheme = localStorage.getItem('darkMode');
    const isDark = savedTheme === 'true';
    this.setTheme(isDark);
  }

  setTheme(darkMode: boolean) {
    if (darkMode) {
      document.body.setAttribute('color-theme', 'dark');
    } else {
      document.body.setAttribute('color-theme', 'light');
    }
    
    // Actualizar el BehaviorSubject
    this.darkMode.next(darkMode);
    
    // Guardar preferencia en localStorage
    localStorage.setItem('darkMode', darkMode.toString());
  }

  toggleTheme() {
    const newTheme = !this.darkMode.value;
    this.setTheme(newTheme);
  }
}
