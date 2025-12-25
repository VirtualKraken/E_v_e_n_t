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
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^[0-9]{10}$/)],
      ],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get phoneNumber() {
    return this.loginForm.get('phoneNumber');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onSubmit() {
    if (this.loginForm.valid) {
      console.log('Login Details:', this.loginForm.value);
      this.isLoading = true;

      this.authService
        .login(this.loginForm.value.phoneNumber, this.loginForm.value.password)
        .catch((err) => {
          // Show simple messages, not technical codes
          this.ts.showNotification(err.message);
          // this.errorMessage = 'Incorrect Phone or Passcode.';
          this.isLoading = false;
          this.router.navigate(['/home']);
        });
    } else {
      console.log('Form is invalid');
      this.loginForm.markAllAsTouched();
    }
  }
}
