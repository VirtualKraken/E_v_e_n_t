import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
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
  signupForm: FormGroup;

  hideLoginPassword = true;
  hideSignupPassword = true;
  hideConfirmPassword = true;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private ts: ThemeServiceService
  ) {
    // Initialize Login Form
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    // Initialize Signup Form
    this.signupForm = this.fb.group({
      displayName: ['', [Validators.required, Validators.minLength(2)]],
      username: ['', [Validators.required, Validators.minLength(4)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }


  // Custom validator to check if passwords match
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    if (confirmPassword.value === '') {
      return null;
    }

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    } else {
      const errors = confirmPassword.errors;
      if (errors) {
        delete errors['mismatch'];
        if (Object.keys(errors).length === 0) {
          confirmPassword.setErrors(null);
        }
      }
      return null;
    }
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { username, password } = this.loginForm.value;

      this.authService.login(username, password)
        .then((res) => {
          console.log(res);

          // SUCCESS: Set user and navigate
          localStorage.setItem('eeUser', username.toString());
          this.router.navigate(['/home']);
        })
        .catch((err) => {
          // ERROR: Show notification and stay on page
          this.ts.showNotification('Incorrect Username or Password');
          this.isLoading = false;
        });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  onSignup() {
    if (this.signupForm.valid) {
      this.isLoading = true;
      const { username, password, displayName } = this.signupForm.value;

      this.authService.signup(username, password, displayName)
        .then((res) => {

          // SUCCESS: Show notification and navigate
          this.ts.showNotification('Account created successfully! Please Login');
        })
        .catch((err) => {
          // ERROR: Show notification and stay on page
          let errorMessage = 'Failed to create account';

          // Handle Firebase error codes
          if (err.code === 'auth/email-already-in-use') {
            errorMessage = 'Username already exists';
          } else if (err.code === 'auth/weak-password') {
            errorMessage = 'Password is too weak';
          } else if (err.message) {
            errorMessage = err.message;
          }

          this.ts.showNotification(errorMessage);
          this.isLoading = false;
        });
    } else {
      this.signupForm.markAllAsTouched();
    }
  }

  
}
