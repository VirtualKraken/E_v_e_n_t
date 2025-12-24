import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    standalone: false
})
export class AppComponent implements OnInit {
  title = 'Evolve';
  showLayout = true;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // 1. Initial check: Handle the URL the user lands on first
    this.updateLayoutState(this.router.url);

    // 2. Continuous check: Listen for navigation changes as the user clicks links
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Use urlAfterRedirects to ensure we have the final destination URL
      this.updateLayoutState(event.urlAfterRedirects);
    });
  }

  private updateLayoutState(url: string): void {
    // If the URL includes 'login', we hide the layout (showLayout = false)
    this.showLayout = !url.includes('/login');
  }
}
