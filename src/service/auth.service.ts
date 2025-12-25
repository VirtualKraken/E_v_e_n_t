// src/app/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);

  // Define a consistent domain for your "fake" emails
  private readonly DOMAIN = '@connect.local';

  // HELPER: Convert Phone to Email
  private formatEmail(phone: string): string {
    return `${phone}${this.DOMAIN}`;
  }

  // LOGIN: Worker passes Phone & Password
  login(phone: string, pass: string) {
    const email = this.formatEmail(phone); // Convert 9876 -> 9876@connect.local

    return signInWithEmailAndPassword(this.auth, email, pass)
      .then(() => {
        this.router.navigate(['/home']);
      })
      .catch((error) => {
        // Helpful error handling for non-tech users
        console.error('Login Error:', error);
        throw error;
      });
  }

  logout() {
    return signOut(this.auth).then(() => this.router.navigate(['/login']));
  }
}
