import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  template: `
    <form (submit)="onSubmit()">
      <input [(ngModel)]="fullName" name="fullName" placeholder="Full name" />
      <input [(ngModel)]="email" name="email" placeholder="Email" />
      <input [(ngModel)]="password" name="password" placeholder="Password" type="password" />
      <button type="submit">Register</button>
    </form>
  `
})
export class RegisterComponent {
  fullName = '';
  email = '';
  password = '';

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.auth.register(this.fullName, this.email, this.password).subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: () => alert('Registration failed')
    });
  }
}
