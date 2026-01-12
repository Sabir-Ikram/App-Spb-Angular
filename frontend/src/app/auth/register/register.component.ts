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
  selector: 'app-register',
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
              <mat-icon>person_add</mat-icon>
            </div>
            <h1 class="auth-title">Create Account</h1>
            <p class="auth-subtitle">Join us and start your adventure</p>
          </div>

          <form (submit)="onSubmit()" class="auth-form">
            <div class="form-group-premium">
              <mat-form-field appearance="outline" class="auth-field">
                <mat-label>Full Name</mat-label>
                <mat-icon matPrefix>account_circle</mat-icon>
                <input matInput [(ngModel)]="fullName" name="fullName" placeholder="John Doe" required />
              </mat-form-field>
            </div>

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
                <input matInput [(ngModel)]="password" name="password" type="password" placeholder="Create a strong password" required />
              </mat-form-field>
            </div>

            <button mat-raised-button type="submit" class="auth-submit-btn">
              <mat-icon>how_to_reg</mat-icon>
              <span>Create Account</span>
            </button>
          </form>

          <div class="auth-footer">
            <p class="auth-link-text">
              Already have an account?
              <a routerLink="/auth/login" class="auth-link">Sign In</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page-premium {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      padding: 2rem;
    }

    .auth-background {
      position: absolute;
      inset: 0;
      background: 
        linear-gradient(135deg, rgba(109, 93, 75, 0.9) 0%, rgba(139, 108, 80, 0.88) 50%, rgba(196, 165, 116, 0.92) 100%),
        url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&h=1080&fit=crop&q=90') center/cover;
      z-index: 1;
    }

    .auth-overlay {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 70% 60%, rgba(212, 114, 44, 0.25) 0%, transparent 60%);
      z-index: 2;
    }

    .auth-container {
      position: relative;
      z-index: 3;
      width: 100%;
      max-width: 480px;
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
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(40px);
      border-radius: 28px;
      padding: 3rem;
      box-shadow: 
        0 30px 90px rgba(0, 0, 0, 0.4),
        0 15px 40px rgba(0, 0, 0, 0.3),
        inset 0 2px 0 rgba(255, 255, 255, 0.4);
      border: 2px solid rgba(255, 255, 255, 0.5);
      position: relative;
      overflow: hidden;
    }

    .auth-card-premium::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 5px;
      background: linear-gradient(90deg, #8b6c50 0%, #d4722c 50%, #8b6c50 100%);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2.5rem;
    }

    .auth-icon-wrapper {
      width: 80px;
      height: 80px;
      margin: 0 auto 1.5rem;
      background: linear-gradient(135deg, #8b6c50 0%, #c4a574 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 32px rgba(139, 108, 80, 0.4);
      animation: iconPulse 2s ease-in-out infinite;
    }

    @keyframes iconPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    .auth-icon-wrapper mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: white;
    }

    .auth-title {
      font-size: 2.2rem;
      font-weight: 800;
      background: linear-gradient(135deg, #8b6c50 0%, #c4a574 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0 0 0.75rem 0;
      letter-spacing: -0.015em;
    }

    .auth-subtitle {
      font-size: 1.05rem;
      color: #6d5d4b;
      margin: 0;
      font-weight: 500;
    }

    .auth-form {
      margin-bottom: 2rem;
    }

    .form-group-premium {
      margin-bottom: 1.5rem;
    }

    .auth-field {
      width: 100%;
    }

    ::ng-deep .auth-field .mat-mdc-text-field-wrapper {
      background: linear-gradient(135deg, #ffffff 0%, #fdfcfb 100%);
      border-radius: 16px;
      transition: all 0.3s ease;
    }

    ::ng-deep .auth-field:hover .mat-mdc-text-field-wrapper {
      background: linear-gradient(135deg, #fdfcfb 0%, #f8f6f3 100%);
    }

    ::ng-deep .auth-field .mat-mdc-form-field-focus-overlay {
      background-color: rgba(196, 165, 116, 0.04);
    }

    ::ng-deep .auth-field .mat-mdc-notched-outline {
      border-color: rgba(139, 108, 80, 0.25);
      border-width: 2px;
      transition: all 0.3s ease;
    }

    ::ng-deep .auth-field:hover .mat-mdc-notched-outline {
      border-color: rgba(139, 108, 80, 0.5);
      box-shadow: 0 3px 12px rgba(139, 108, 80, 0.1);
    }

    ::ng-deep .auth-field.mat-focused .mat-mdc-notched-outline {
      border-color: #c4a574 !important;
      border-width: 2.5px !important;
      box-shadow: 0 5px 20px rgba(196, 165, 116, 0.25);
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
      height: 60px !important;
      font-size: 1.15rem !important;
      font-weight: 800 !important;
      border-radius: 16px !important;
      background: linear-gradient(135deg, #8b6c50 0%, #6d5d4b 100%) !important;
      color: white !important;
      box-shadow: 0 12px 32px rgba(139, 108, 80, 0.5) !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      letter-spacing: 0.03em;
      position: relative;
      overflow: hidden;
    }

    .auth-submit-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
      transition: left 0.6s ease;
    }

    .auth-submit-btn:hover::before {
      left: 100%;
    }

    .auth-submit-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 16px 40px rgba(139, 108, 80, 0.6) !important;
      background: linear-gradient(135deg, #6d5d4b 0%, #5a4d3d 100%) !important;
    }

    .auth-submit-btn mat-icon {
      font-size: 26px;
      width: 26px;
      height: 26px;
    }

    .auth-footer {
      text-align: center;
      padding-top: 1.5rem;
      border-top: 2px solid rgba(139, 108, 80, 0.1);
    }

    .auth-link-text {
      font-size: 1rem;
      color: #6d5d4b;
      margin: 0;
      font-weight: 500;
    }

    .auth-link {
      color: #8b6c50;
      font-weight: 700;
      text-decoration: none;
      margin-left: 0.5rem;
      transition: all 0.2s ease;
    }

    .auth-link:hover {
      color: #c4a574;
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
