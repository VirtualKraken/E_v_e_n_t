// src/app/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  authState,
  User
} from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  // Fake email domain for username-based login
  private readonly DOMAIN = '@evolve.events';

  // Public observable for components & guards
  user$: Observable<User | null> = authState(this.auth);

  /* =========================
     Helpers
  ========================= */

  private formatEmail(username: string): string {
    return `${username}${this.DOMAIN}`;
  }

  /* =========================
     Auth Actions
  ========================= */

  login(username: string, pass: string) {
    const email = this.formatEmail(username);

    return signInWithEmailAndPassword(this.auth, email, pass)
      .then(() => {
        this.router.navigate(['/home']);
      })
      .catch((error) => {
        console.error('Login Error:', error);
        throw error;
      });
  }

  async signup(username: string, pass: string, displayName: string) {
    const email = this.formatEmail(username);

    const cred = await createUserWithEmailAndPassword(
      this.auth,
      email,
      pass
    );

    // Set display name
    await updateProfile(cred.user, {
      displayName: displayName
    });

    // 🔥 CRITICAL: Create Firestore user root
    await setDoc(doc(this.firestore, `users/${cred.user.uid}`), {
      username,
      displayName,
      email,
      createdAt: new Date(),
      plan: 'free'
    });

    return cred;
  }

  logout() {
    return signOut(this.auth).then(() => {
      this.router.navigate(['/login']);
    });
  }

  /* =========================
     Optional Sync Getter
     (use carefully)
  ========================= */

  get currentUser() {
    return this.auth.currentUser;
  }
}
