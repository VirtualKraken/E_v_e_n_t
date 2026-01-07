import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Auth, signInAnonymously, onAuthStateChanged } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class AnonChecklistGuard implements CanActivate {

  constructor(private auth: Auth) {}

  canActivate(): Promise<boolean> {
    return new Promise((resolve) => {

      onAuthStateChanged(this.auth, async (user) => {
        // Firebase auth state is now READY

        if (user) {
          // Admin OR anon already exists
          resolve(true);
          return;
        }

        // No user at all → create anon
        try {
          await signInAnonymously(this.auth);
          resolve(true);
        } catch (err) {
          console.error('Anonymous sign-in failed', err);
          resolve(false);
        }
      });

    });
  }
}
