// theme.service.ts
import { Injectable, signal, effect } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeServiceService {
  private themeSubject = new BehaviorSubject<string>(this.theme || 'light');
  public theme$ = this.themeSubject.asObservable();

  constructor() {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.theme = savedTheme;
    } else {
      // Optional: Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.theme = prefersDark ? 'dark' : 'light';
    }
    this.themeSubject.next(this.theme);
  }

  get theme(): string {
    return document.documentElement.getAttribute('theme') || 'light';
  }

  set theme(name: string) {
    document.documentElement.setAttribute('theme', name);
    localStorage.setItem('theme', name);
    this.themeSubject.next(name);
  }

  toggleTheme(): void {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
  }

  isDarkMode(): boolean {
    return this.theme === 'dark';
  }
}
