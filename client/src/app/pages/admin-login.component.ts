import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="admin-auth card">
      <span class="eyebrow">JAY BHAVANI · PRIVATE</span><h1>Admin sign in</h1><p>Sign in to review and manage client inquiries.</p>
      @if (error) { <div class="notice error" role="alert">{{ error }}</div> }
      <form [formGroup]="form" (ngSubmit)="submit()">
        <label>Email address<input type="email" formControlName="email" autocomplete="username" required></label>
        <label>Password<input type="password" formControlName="password" autocomplete="current-password" required></label>
        <button class="button" type="submit" [disabled]="loading || form.invalid">{{ loading ? 'Signing in...' : 'Sign in securely' }}</button>
      </form>
    </section>
  `
})
export class AdminLoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly form = this.fb.nonNullable.group({ email: ['', [Validators.required, Validators.email]], password: ['', Validators.required] });
  loading = false;
  error = '';

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    this.auth.login(this.form.controls.email.value, this.form.controls.password.value).subscribe({
      next: () => { this.loading = false; void this.router.navigateByUrl('/admin'); },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.error = error.error?.message || 'Could not sign in. Check the server is running.';
      }
    });
  }
}
