import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule, MatIconModule, RouterModule],
  template: `
    <div class="auth-page-premium">
      <div class="auth-background"></div>
      <div class="auth-overlay"></div>
      
      <div class="auth-container">
        <div class="auth-card-premium">
          <div class="auth-header">
            <div class="auth-icon-wrapper">
              <mat-icon>lock_person</mat-icon>
            </div>
            <h1 class="auth-title">Welcome Back</h1>
            <p class="auth-subtitle">Sign in to continue your journey</p>
          </div>

          <form (submit)="onSubmit()" class="auth-form">
            <div class="form-group-premium">
              <mat-form-field appearance="outline" class="auth-field">
                <mat-label>Email Address</mat-label>
                <mat-icon matPrefix>email</mat-icon>
                <input matInput [(ngModel)]="email" name="email" type="email" placeholder="your@email.com" required />
              </mat-form-field>
            </div>

            <div class="form-group-premium">
              <mat-form-field appearance="outline" class="auth-field">
                <mat-label>Password</mat-label>
                <mat-icon matPrefix>lock</mat-icon>
                <input matInput [(ngModel)]="password" name="password" type="password" placeholder="Enter your password" required />
              </mat-form-field>
            </div>

            <button mat-raised-button type="submit" class="auth-submit-btn">
              <mat-icon>login</mat-icon>
              <span>Sign In</span>
            </button>
          </form>

          <div class="auth-footer">
            <p class="auth-link-text">
              Don't have an account?
              <a routerLink="/auth/register" class="auth-link">Create Account</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page-premium {
      min-height: 100vh;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      padding: 1rem;
    }

    .auth-background {
      position: absolute;
      inset: 0;
      background: 
        linear-gradient(135deg, rgba(139, 108, 80, 0.92) 0%, rgba(196, 165, 116, 0.88) 50%, rgba(109, 93, 75, 0.9) 100%),
        url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&h=1080&fit=crop&q=90') center/cover;
      z-index: 1;
    }

    .auth-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.15);
      backdrop-filter: blur(2px);
      z-index: 2;
    }

    .auth-container {
      position: relative;
      z-index: 3;
      width: 100%;
      max-width: 400px;
      animation: fadeInScale 0.6s ease-out;
    }

    @keyframes fadeInScale {
      from {
        opacity: 0;
        transform: scale(0.95) translateY(20px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    .auth-card-premium {
      background: rgba(255, 255, 255, 0.97);
      backdrop-filter: blur(20px);
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.6);
      position: relative;
      overflow: hidden;
    }

    .auth-card-premium::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, #c4a574 0%, #d4722c 50%, #c4a574 100%);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 1.25rem;
    }

    .auth-icon-wrapper {
      width: 44px;
      height: 44px;
      margin: 0 auto 0.6rem;
      background: linear-gradient(135deg, #c4a574 0%, #8b6c50 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 16px rgba(139, 108, 80, 0.25);
    }

    .auth-icon-wrapper mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
      color: white;
    }

    .auth-title {
      font-size: 1.4rem;
      font-weight: 700;
      background: linear-gradient(135deg, #8b6c50 0%, #c4a574 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0 0 0.35rem 0;
      letter-spacing: -0.015em;
    }

    .auth-subtitle {
      font-size: 0.85rem;
      color: #6d5d4b;
      margin: 0;
      font-weight: 500;
      opacity: 0.75;
    }

    .auth-form {
      margin-bottom: 1rem;
    }

    .form-group-premium {
      margin-bottom: 0.85rem;
    }

    .auth-field {
      width: 100%;
    }

    ::ng-deep .auth-field .mat-mdc-text-field-wrapper {
      background: #fafafa;
      border-radius: 12px;
      transition: all 0.3s ease;
    }

    ::ng-deep .auth-field:hover .mat-mdc-text-field-wrapper {
      background: #f5f5f5;
    }

    ::ng-deep .auth-field .mat-mdc-form-field-focus-overlay {
      background-color: rgba(196, 165, 116, 0.04);
    }

    ::ng-deep .auth-field .mat-mdc-notched-outline {
      border-color: rgba(139, 108, 80, 0.2);
      border-width: 1.5px;
      transition: all 0.3s ease;
    }

    ::ng-deep .auth-field:hover .mat-mdc-notched-outline {
      border-color: rgba(139, 108, 80, 0.4);
    }

    ::ng-deep .auth-field.mat-focused .mat-mdc-notched-outline {
      border-color: #c4a574 !important;
      border-width: 2px !important;
      box-shadow: 0 2px 8px rgba(196, 165, 116, 0.15);
    }

    ::ng-deep .auth-field .mat-mdc-floating-label {
      color: #6d5d4b;
      font-weight: 700;
      font-size: 1rem;
    }

    ::ng-deep .auth-field.mat-focused .mat-mdc-floating-label {
      color: #c4a574 !important;
      font-weight: 800;
    }

    ::ng-deep .auth-field mat-icon[matPrefix] {
      color: #c4a574;
      margin-right: 16px;
      opacity: 0.75;
      font-size: 24px;
      width: 24px;
      height: 24px;
      transition: all 0.3s ease;
    }

    ::ng-deep .auth-field.mat-focused mat-icon[matPrefix] {
      opacity: 1;
      transform: scale(1.1);
    }

    ::ng-deep .auth-field input {
      color: #2d2416;
      font-weight: 600;
      font-size: 1rem;
    }

    ::ng-deep .auth-field input::placeholder {
      color: rgba(109, 93, 75, 0.5);
      font-weight: 500;
    }

    .auth-submit-btn {
      width: 100%;
      height: 46px !important;
      font-size: 0.95rem !important;
      font-weight: 700 !important;
      border-radius: 12px !important;
      background: linear-gradient(135deg, #c4a574 0%, #8b6c50 100%) !important;
      color: white !important;
      box-shadow: 0 6px 20px rgba(139, 108, 80, 0.35) !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      letter-spacing: 0.02em;
    }

    .auth-submit-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(139, 108, 80, 0.45) !important;
      background: linear-gradient(135deg, #8b6c50 0%, #6d5d4b 100%) !important;
    }

    .auth-submit-btn mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .auth-footer {
      text-align: center;
      padding-top: 0.85rem;
      border-top: 1px solid rgba(139, 108, 80, 0.12);
    }

    .auth-link-text {
      font-size: 0.9rem;
      color: #6d5d4b;
      margin: 0;
      font-weight: 500;
    }

    .auth-link {
      color: #c4a574;
      font-weight: 700;
      text-decoration: none;
      margin-left: 0.5rem;
      transition: all 0.2s ease;
    }

    .auth-link:hover {
      color: #8b6c50;
      text-decoration: underline;
    }

    @media (max-width: 768px) {
      .auth-page-premium {
        padding: 1.5rem;
      }

      .auth-card-premium {
        padding: 2rem 1.5rem;
      }

      .auth-title {
        font-size: 1.85rem;
      }

      .auth-subtitle {
        font-size: 0.95rem;
      }

      .auth-icon-wrapper {
        width: 70px;
        height: 70px;
      }

      .auth-icon-wrapper mat-icon {
        font-size: 36px;
        width: 36px;
        height: 36px;
      }
    }
  `]
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
