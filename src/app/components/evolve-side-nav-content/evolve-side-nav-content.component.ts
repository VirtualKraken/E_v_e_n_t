import { Component, inject, Input } from '@angular/core';
import { ThemeServiceService } from '../../../service/theme-service.service';
@Component({
    selector: 'evolve-side-nav-content',
    templateUrl: './evolve-side-nav-content.component.html',
    styleUrl: './evolve-side-nav-content.component.scss',
    standalone: false
})
export class EvolveSideNavContentComponent {
  @Input() drawer: any;
   themeService = inject(ThemeServiceService);

  get isDark(): boolean {
    return this.themeService.isDarkMode();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
