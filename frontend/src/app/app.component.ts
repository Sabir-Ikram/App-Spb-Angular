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
    <mat-toolbar color="primary" class="app-toolbar">
      <span class="toolbar-title">VoyageConnect</span>
      <span class="spacer"></span>
      <div class="toolbar-actions">
        <button mat-button routerLink="/search">Search</button>
        <button mat-button routerLink="/dashboard" *ngIf="isAuthenticated">Dashboard</button>
        <button mat-button routerLink="/admin" *ngIf="isAdmin">Admin</button>
        <button mat-button routerLink="/auth/login" *ngIf="!isAuthenticated">Login</button>
        <button mat-button routerLink="/auth/register" *ngIf="!isAuthenticated">Register</button>
        <button mat-button (click)="logout()" *ngIf="isAuthenticated">Logout</button>
      </div>
    </mat-toolbar>
    <app-loading></app-loading>
    <router-outlet></router-outlet>
  `,
  styles: [`
    .app-toolbar {
      display: flex;
      align-items: center;
    }
    .toolbar-title {
      font-size: 20px;
      font-weight: 600;
    }
    .spacer {
      flex: 1 1 auto;
    }
    .toolbar-actions {
      display: flex;
      gap: 8px;
    }
  `]
})
export class AppComponent {
  isAuthenticated = false;
  isAdmin = false;

  constructor(private authService: AuthService) {
    this.updateAuthStatus();
  }

  updateAuthStatus() {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.isAdmin = this.authService.getRole() === 'ADMIN';
  }

  logout() {
    this.authService.logout();
    this.updateAuthStatus();
  }
}
