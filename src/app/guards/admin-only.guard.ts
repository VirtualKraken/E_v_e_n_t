import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class AdminOnlyGuard implements CanActivate {

  constructor(private auth: Auth, private router: Router) {}

  canActivate(): Promise<boolean> {
    return new Promise((resolve) => {
      onAuthStateChanged(this.auth, (user) => {
        // No user at all
        if (!user) {
          this.router.navigate(['/login']);
          resolve(false);
          return;
        }

        // Anonymous user → block admin access
        if (user.isAnonymous) {
          this.router.navigate(['/login']);
          resolve(false);
          return;
        }

        // Logged-in admin
        resolve(true);
      });
    });
  }
}
