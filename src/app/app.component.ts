import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: false,
})
export class AppComponent implements OnInit {
  title = 'Evolve';
  showLayout = true;
  @ViewChild('drawer') drawer!: MatSidenav;
  currentUser: User | null = null;

  constructor(private router: Router, private auth: Auth) {}

  ngOnInit(): void {
    // 🔹 Listen to Firebase auth state
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;

      // Re-evaluate layout whenever auth changes
      this.updateLayoutState(this.router.url);
    });

    // 🔹 Listen to route changes
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateLayoutState(event.urlAfterRedirects);
      });
  }

 private updateLayoutState(url: string): void {

  // Hide layout on login page
  if (url.includes('/login')) {
    this.showLayout = false;
    return;
  }

  // Hide layout for anonymous users
  if (this.currentUser?.isAnonymous) {
    this.showLayout = false;
    return;
  }

  // Otherwise show layout (admin users)
  this.showLayout = true;
}

}
