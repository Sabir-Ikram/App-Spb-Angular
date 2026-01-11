import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LoadingComponent } from './core/loading.component';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, MatToolbarModule, MatButtonModule, MatIconModule, LoadingComponent],
  template: `
    <header class="app-header">
      <mat-toolbar class="app-toolbar">
        <a routerLink="/" class="logo-container">
          <mat-icon class="logo-icon">flight_takeoff</mat-icon>
          <span class="logo-text">
            <span class="logo-voyage">Voyage</span><span class="logo-connect">Connect</span>
          </span>
        </a>
        <span class="spacer"></span>
        <nav class="nav-menu">
          <a mat-button routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">
            <mat-icon>home</mat-icon>
            <span>Home</span>
          </a>
          <a mat-button routerLink="/search" routerLinkActive="active" class="nav-link">
            <mat-icon>search</mat-icon>
            <span>Search</span>
          </a>
          <a mat-button routerLink="/my-reservations" *ngIf="isAuthenticated" routerLinkActive="active" class="nav-link">
            <mat-icon>event_note</mat-icon>
            <span>My Reservations</span>
          </a>
          <a mat-button routerLink="/admin" *ngIf="isAdmin" routerLinkActive="active" class="nav-link">
            <mat-icon>admin_panel_settings</mat-icon>
            <span>Admin</span>
          </a>
        </nav>
        <div class="toolbar-actions">
          <button mat-raised-button routerLink="/auth/login" *ngIf="!isAuthenticated" class="login-btn">
            <mat-icon>login</mat-icon>
            <span>Login</span>
          </button>
          <button mat-raised-button routerLink="/auth/register" *ngIf="!isAuthenticated" class="register-btn">
            <mat-icon>person_add</mat-icon>
            <span>Sign Up</span>
          </button>
          <button mat-stroked-button (click)="logout()" *ngIf="isAuthenticated" class="logout-btn">
            <mat-icon>logout</mat-icon>
            <span>Logout</span>
          </button>
        </div>
      </mat-toolbar>
    </header>
    <app-loading></app-loading>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    /* ============================================
       PREMIUM HEADER - Booking.com/Airbnb Style
       ============================================ */
    .app-header {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: var(--shadow-sm);
      background: var(--white);
    }

    .app-toolbar {
      background: var(--white) !important;
      color: var(--text-primary) !important;
      height: 72px !important;
      padding: 0 var(--space-xl) !important;
      border-bottom: 1px solid var(--gray-200);
      display: flex;
      align-items: center;
      gap: var(--space-lg);
    }

    /* Logo Design */
    .logo-container {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      text-decoration: none;
      color: var(--text-primary);
      padding: var(--space-sm) var(--space-md);
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);
    }

    .logo-container:hover {
      background: var(--gray-50);
      transform: translateY(-1px);
    }

    .logo-icon {
      font-size: 32px !important;
      width: 32px !important;
      height: 32px !important;
      color: var(--primary-color);
      transform: rotate(-15deg);
    }

    .logo-text {
      font-family: 'Poppins', sans-serif;
      font-size: 1.5rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .logo-voyage {
      color: var(--primary-color);
    }

    .logo-connect {
      color: var(--accent-color);
    }

    .spacer {
      flex: 1 1 auto;
    }

    /* Navigation Menu */
    .nav-menu {
      display: flex;
      align-items: center;
      gap: var(--space-xs);
    }

    .nav-link {
      height: 48px !important;
      padding: 0 var(--space-lg) !important;
      display: inline-flex !important;
      align-items: center !important;
      gap: var(--space-sm);
      color: var(--text-secondary) !important;
      font-weight: 500 !important;
      border-radius: var(--radius-md) !important;
      transition: all var(--transition-fast) !important;
      position: relative;
    }

    .nav-link:hover {
      background: var(--gray-50) !important;
      color: var(--primary-color) !important;
    }

    .nav-link.active {
      color: var(--primary-color) !important;
      background: var(--gray-50) !important;
    }

    .nav-link.active::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 40px;
      height: 3px;
      background: var(--primary-color);
      border-radius: var(--radius-full);
    }

    .nav-link mat-icon {
      font-size: 20px !important;
      width: 20px !important;
      height: 20px !important;
    }

    /* Toolbar Actions */
    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: var(--space-md);
    }

    .login-btn,
    .register-btn,
    .logout-btn {
      height: 44px !important;
      padding: 0 var(--space-lg) !important;
      display: inline-flex !important;
      align-items: center !important;
      gap: var(--space-sm);
      font-weight: 600 !important;
      border-radius: var(--radius-full) !important;
      transition: all var(--transition-base) !important;
      font-size: 0.9375rem !important;
    }

    .login-btn {
      background: transparent !important;
      color: var(--text-primary) !important;
      border: 1px solid var(--gray-300) !important;
    }

    .login-btn:hover {
      background: var(--gray-50) !important;
      border-color: var(--primary-color) !important;
      color: var(--primary-color) !important;
    }

    .register-btn {
      background: var(--primary-color) !important;
      color: var(--white) !important;
      box-shadow: none !important;
    }

    .register-btn:hover {
      background: var(--primary-dark) !important;
      transform: translateY(-2px);
      box-shadow: var(--shadow-md) !important;
    }

    .logout-btn {
      color: var(--text-primary) !important;
      border-color: var(--gray-300) !important;
    }

    .logout-btn:hover {
      background: var(--error-light) !important;
      color: var(--error) !important;
      border-color: var(--error) !important;
    }

    .toolbar-actions button mat-icon {
      font-size: 20px !important;
      width: 20px !important;
      height: 20px !important;
    }

    /* Main Content */
    .main-content {
      min-height: calc(100vh - 72px);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .app-toolbar {
        padding: 0 var(--space-md) !important;
        height: 64px !important;
      }

      .logo-text {
        font-size: 1.25rem;
      }

      .nav-menu {
        display: none;
      }

      .nav-link span,
      .toolbar-actions button span {
        display: none;
      }

      .toolbar-actions {
        gap: var(--space-sm);
      }

      .login-btn,
      .register-btn,
      .logout-btn {
        width: 44px !important;
        min-width: 44px !important;
        padding: 0 !important;
        justify-content: center;
      }
    }

    @media (max-width: 480px) {
      .logo-text {
        display: none;
      }

      .app-toolbar {
        padding: 0 var(--space-sm) !important;
      }
    }
  `]
})
export class AppComponent {
  isAuthenticated = false;
  isAdmin = false;

  constructor(private authService: AuthService) {
    this.updateAuthStatus();
    // Subscribe to auth state changes
    this.authService.authState$.subscribe(() => {
      this.updateAuthStatus();
    });
  }

  updateAuthStatus() {
    this.isAuthenticated = this.authService.isAuthenticated();
    const role = this.authService.getRole();
    this.isAdmin = role === 'ADMIN';
  }

  logout() {
    this.authService.logout();
    this.updateAuthStatus();
  }
}
