import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../service/auth.service';
import { ThemeServiceService } from '../../../service/theme-service.service';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  standalone: false,
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private ts: ThemeServiceService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

onSubmit() {
  if (this.loginForm.valid) {
    this.isLoading = true;
    const { username, password } = this.loginForm.value;

    this.authService.login(username, password)
      .then((res) => {
        // SUCCESS: Set user and navigate
        localStorage.setItem('eeUser', username.toString());
        this.router.navigate(['/home']);
      })
      .catch((err) => {
        // ERROR: Show notification and stay on page
        this.ts.showNotification('Incorrect Phone or Passcode'); // or err.message
        this.isLoading = false;
      });
  } else {
    this.loginForm.markAllAsTouched();
  }
}
}
