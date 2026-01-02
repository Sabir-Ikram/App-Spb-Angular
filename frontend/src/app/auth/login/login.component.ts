import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  template: `
    <form (submit)="onSubmit()">
      <input [(ngModel)]="email" name="email" placeholder="Email" />
      <input [(ngModel)]="password" name="password" placeholder="Password" type="password" />
      <button type="submit">Login</button>
    </form>
  `
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => alert('Login failed')
    });
  }
}
