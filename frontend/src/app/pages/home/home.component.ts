import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, RouterModule],
  template: `
    <div class="home-container">
      <mat-card class="welcome-card">
        <mat-card-title>Welcome to VoyageConnect</mat-card-title>
        <mat-card-content>
          <p>Your trusted platform for booking flights and hotels worldwide.</p>
          <div class="action-buttons">
            <button mat-raised-button color="primary" routerLink="/search">Search Trips</button>
            <button mat-raised-button routerLink="/auth/login">Login</button>
            <button mat-raised-button routerLink="/auth/register">Register</button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .home-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 20px;
    }
    .welcome-card {
      max-width: 600px;
      text-align: center;
    }
    .action-buttons {
      display: flex;
      gap: 12px;
      justify-content: center;
      margin-top: 20px;
      flex-wrap: wrap;
    }
  `]
})
export class HomeComponent {}
