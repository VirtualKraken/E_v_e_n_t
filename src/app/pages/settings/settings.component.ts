import { Component } from '@angular/core';
import { ThemeServiceService } from '../../../service/theme-service.service';
import { AuthService } from '../../../service/auth.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  standalone:false
})
export class SettingsComponent {
  constructor(private themeService: ThemeServiceService,private auth: AuthService) {}

  get isDark(): boolean {
    return this.themeService.isDarkMode();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  signOut(){
    this.auth.logout();
  }
}
