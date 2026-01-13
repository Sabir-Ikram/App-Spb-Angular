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
    <nav class="premium-navbar">
      <div class="navbar-container">
        <a routerLink="/" class="navbar-logo">
          <mat-icon class="logo-icon">flight_takeoff</mat-icon>
          <span class="logo-text">Voyage<span class="logo-accent">Connect</span></span>
        </a>

        <div class="navbar-menu">
          <a routerLink="/" 
             routerLinkActive="active" 
             [routerLinkActiveOptions]="{exact: true}"
             class="nav-link">
            <mat-icon>home</mat-icon>
            <span>Home</span>
          </a>
          
          <a routerLink="/search" 
             routerLinkActive="active"
             class="nav-link">
            <mat-icon>flight</mat-icon>
            <span>Flights</span>
          </a>
          
          <a routerLink="/hotels" 
             routerLinkActive="active"
             class="nav-link">
            <mat-icon>hotel</mat-icon>
            <span>Hotels</span>
          </a>
          
          <a *ngIf="isAuthenticated" 
             routerLink="/my-reservations" 
             routerLinkActive="active"
             class="nav-link">
            <mat-icon>event_note</mat-icon>
            <span>My Reservations</span>
          </a>
          
          <a *ngIf="isAdmin" 
             routerLink="/admin" 
             routerLinkActive="active"
             class="nav-link">
            <mat-icon>admin_panel_settings</mat-icon>
            <span>Admin</span>
          </a>
        </div>

        <div class="navbar-actions">
          <ng-container *ngIf="!isAuthenticated">
            <button mat-button routerLink="/auth/login" class="login-button">
              <mat-icon>login</mat-icon>
              <span>Sign In</span>
            </button>
            <button mat-stroked-button routerLink="/auth/register" class="register-button">
              Get Started
            </button>
          </ng-container>
          
          <ng-container *ngIf="isAuthenticated">
            <button mat-button class="user-profile-button">
              <div class="profile-avatar">
                <mat-icon>person</mat-icon>
              </div>
            </button>
            <button mat-stroked-button (click)="logout()" class="logout-button">
              <mat-icon>logout</mat-icon>
              <span>Logout</span>
            </button>
          </ng-container>
        </div>

        <button mat-icon-button class="mobile-menu-toggle" (click)="toggleMobileMenu()">
          <mat-icon>{{ mobileMenuOpen ? 'close' : 'menu' }}</mat-icon>
        </button>
      </div>

      <div class="mobile-menu" [class.open]="mobileMenuOpen">
        <a routerLink="/" 
           (click)="closeMobileMenu()"
           routerLinkActive="active" 
           [routerLinkActiveOptions]="{exact: true}"
           class="mobile-nav-link">
          <mat-icon>home</mat-icon>
          <span>Home</span>
        </a>
        
        <a routerLink="/search" 
           (click)="closeMobileMenu()"
           routerLinkActive="active"
           class="mobile-nav-link">
          <mat-icon>flight</mat-icon>
          <span>Flights</span>
        </a>
        
        <a routerLink="/hotels" 
           (click)="closeMobileMenu()"
           routerLinkActive="active"
           class="mobile-nav-link">
          <mat-icon>hotel</mat-icon>
          <span>Hotels</span>
        </a>
        
        <a *ngIf="isAuthenticated" 
           routerLink="/my-reservations" 
           (click)="closeMobileMenu()"
           routerLinkActive="active"
           class="mobile-nav-link">
          <mat-icon>event_note</mat-icon>
          <span>My Reservations</span>
        </a>
        
        <a *ngIf="isAdmin" 
           routerLink="/admin" 
           (click)="closeMobileMenu()"
           routerLinkActive="active"
           class="mobile-nav-link">
          <mat-icon>admin_panel_settings</mat-icon>
          <span>Admin</span>
        </a>

        <div class="mobile-menu-divider"></div>

        <ng-container *ngIf="!isAuthenticated">
          <button mat-button routerLink="/auth/login" (click)="closeMobileMenu()" class="mobile-login-button">
            <mat-icon>login</mat-icon>
            <span>Sign In</span>
          </button>
          <button mat-stroked-button routerLink="/auth/register" (click)="closeMobileMenu()" class="mobile-register-button">
            Get Started
          </button>
        </ng-container>
        
        <ng-container *ngIf="isAuthenticated">
          <button mat-stroked-button (click)="logout(); closeMobileMenu()" class="mobile-logout-button">
            <mat-icon>logout</mat-icon>
            <span>Logout</span>
          </button>
        </ng-container>
      </div>
    </nav>
    
    <app-loading></app-loading>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .premium-navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      background: rgba(248, 246, 242, 0.75);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(212, 175, 55, 0.15);
      box-shadow: 0 2px 20px rgba(0, 0, 0, 0.05);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .navbar-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 48px;
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 48px;
    }

    .navbar-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      text-decoration: none;
      transition: transform 0.25s ease;
      flex-shrink: 0;
    }

    .navbar-logo:hover {
      transform: scale(1.02);
    }

    .logo-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #d4af37;
      filter: drop-shadow(0 2px 6px rgba(212, 175, 55, 0.25));
    }

    .logo-text {
      font-size: 24px;
      font-weight: 700;
      color: #1f2937;
      letter-spacing: -0.5px;
      font-family: 'Roboto', 'Helvetica', sans-serif;
    }

    .logo-accent {
      color: #d4af37;
    }

    .navbar-menu {
      display: flex;
      align-items: center;
      gap: 6px;
      flex: 1;
      justify-content: center;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      border-radius: 8px;
      text-decoration: none;
      color: #1f2937;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.3px;
      text-transform: uppercase;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      white-space: nowrap;
    }

    .nav-link mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #6b7280;
      transition: color 0.25s ease;
    }

    .nav-link:hover {
      background: rgba(212, 175, 55, 0.08);
      color: #d4af37;
    }

    .nav-link:hover mat-icon {
      color: #d4af37;
    }

    .nav-link.active {
      color: #d4af37;
      background: rgba(212, 175, 55, 0.1);
    }

    .nav-link.active mat-icon {
      color: #d4af37;
    }

    .nav-link.active::after {
      content: '';
      position: absolute;
      bottom: 2px;
      left: 18px;
      right: 18px;
      height: 2px;
      background: #d4af37;
      border-radius: 2px;
    }

    .navbar-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }

    .user-profile-button {
      display: flex;
      align-items: center;
      padding: 6px;
      border-radius: 50%;
      transition: all 0.25s ease;
      height: 44px;
      width: 44px;
      min-width: 44px;
    }

    .user-profile-button:hover {
      background: rgba(212, 175, 55, 0.08);
    }

    .profile-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.25) 100%);
      border: 2px solid #d4af37;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .profile-avatar mat-icon {
      color: #d4af37;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .login-button {
      height: 44px;
      padding: 0 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      color: #1f2937;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      transition: all 0.25s ease;
    }

    .login-button:hover {
      background: rgba(212, 175, 55, 0.08);
      color: #d4af37;
    }

    .register-button,
    .logout-button {
      height: 44px;
      padding: 0 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      color: #d4af37;
      border: 2px solid #d4af37;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      transition: all 0.25s ease;
    }

    .register-button:hover,
    .logout-button:hover {
      background: rgba(212, 175, 55, 0.08);
      border-color: #c9a030;
      color: #c9a030;
    }

    .mobile-menu-toggle {
      display: none;
      width: 44px;
      height: 44px;
      border-radius: 8px;
      transition: all 0.25s ease;
    }

    .mobile-menu-toggle:hover {
      background: rgba(212, 175, 55, 0.08);
    }

    .mobile-menu-toggle mat-icon {
      color: #1f2937;
      font-size: 26px;
      width: 26px;
      height: 26px;
    }

    .mobile-menu {
      display: none;
      position: absolute;
      top: 72px;
      left: 0;
      right: 0;
      background: rgba(248, 246, 242, 0.9);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(212, 175, 55, 0.15);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
      padding: 16px;
      max-height: 0;
      overflow: hidden;
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .mobile-menu.open {
      max-height: calc(100vh - 72px);
      opacity: 1;
      overflow-y: auto;
    }

    .mobile-nav-link {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px;
      border-radius: 10px;
      text-decoration: none;
      color: #1f2937;
      font-size: 16px;
      font-weight: 600;
      margin: 4px 0;
      transition: all 0.25s ease;
    }

    .mobile-nav-link:hover,
    .mobile-nav-link.active {
      background: rgba(212, 175, 55, 0.1);
      color: #d4af37;
    }

    .mobile-nav-link mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: #6b7280;
    }

    .mobile-nav-link:hover mat-icon,
    .mobile-nav-link.active mat-icon {
      color: #d4af37;
    }

    .mobile-menu-divider {
      height: 1px;
      background: rgba(0, 0, 0, 0.06);
      margin: 16px 0;
    }

    .mobile-logout-button,
    .mobile-login-button,
    .mobile-register-button {
      width: 100%;
      height: 52px;
      margin: 8px 0;
      font-size: 16px;
      font-weight: 600;
      border-radius: 10px;
      color: #d4af37;
      border: 2px solid #d4af37;
    }

    .mobile-logout-button:hover,
    .mobile-login-button:hover,
    .mobile-register-button:hover {
      background: rgba(212, 175, 55, 0.08);
      border-color: #c9a030;
      color: #c9a030;
    }

    .main-content {
      margin-top: 72px;
      min-height: calc(100vh - 72px);
    }

    @media (max-width: 1024px) {
      .navbar-container {
        padding: 0 32px;
        gap: 24px;
      }

      .navbar-menu {
        gap: 4px;
      }

      .nav-link {
        padding: 9px 14px;
        font-size: 13px;
      }
    }

    @media (max-width: 768px) {
      .navbar-container {
        padding: 0 24px;
      }

      .navbar-menu,
      .navbar-actions {
        display: none;
      }

      .mobile-menu-toggle {
        display: flex;
      }

      .mobile-menu {
        display: block;
      }
    }

    @media (max-width: 480px) {
      .navbar-container {
        padding: 0 16px;
        height: 64px;
      }

      .logo-text {
        font-size: 20px;
      }

      .logo-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
      }

      .mobile-menu {
        top: 64px;
      }

      .main-content {
        margin-top: 64px;
      }
    }
  `]
})
export class AppComponent {
  isAuthenticated = false;
  isAdmin = false;
  mobileMenuOpen = false;

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

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }
}
