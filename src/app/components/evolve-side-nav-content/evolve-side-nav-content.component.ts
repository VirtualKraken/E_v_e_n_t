import { Component, inject, Input } from '@angular/core';
import { ThemeServiceService } from '../../../service/theme-service.service';
import { AuthService } from '../../../service/auth.service';
@Component({
  selector: 'evolve-side-nav-content',
  templateUrl: './evolve-side-nav-content.component.html',
  styleUrl: './evolve-side-nav-content.component.scss',
  standalone: false,
})
export class EvolveSideNavContentComponent {
  @Input() drawer: any;
  user=localStorage.getItem('eeUser');
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
