import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReservationService } from '../../services/reservation.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatToolbarModule, MatListModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <mat-card class="dashboard-container">
      <mat-toolbar color="primary">Your Reservations</mat-toolbar>
      <div *ngIf="loading" class="loading-spinner">
        <mat-spinner diameter="40"></mat-spinner>
      </div>
      <mat-list *ngIf="!loading && reservations.length > 0">
        <mat-list-item *ngFor="let r of reservations" class="reservation-item">
          <div class="reservation-info">
            <strong>Reservation #{{ r.id }}</strong>
            <p>Status: {{ r.status }} | Total: {{ r.totalPrice }}</p>
          </div>
          <button mat-button color="warn" (click)="onCancel(r.id)">Cancel</button>
        </mat-list-item>
      </mat-list>
      <div *ngIf="!loading && reservations.length === 0" class="no-reservations">
        <p>No reservations yet</p>
      </div>
      <div *ngIf="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </mat-card>
  `,
  styles: [`
    .dashboard-container {
      margin: 16px;
    }
    .reservation-item {
      border-bottom: 1px solid #ddd;
      padding: 12px 0;
    }
    .reservation-info {
      flex: 1;
    }
    .no-reservations {
      text-align: center;
      padding: 20px;
      color: #999;
    }
    .loading-spinner {
      display: flex;
      justify-content: center;
      padding: 20px;
    }
    .error-message {
      color: #d32f2f;
      padding: 20px;
      text-align: center;
    }
  `]
})
export class UserDashboardComponent implements OnInit {
  reservations: any[] = [];
  loading = false;
  errorMessage = '';

  constructor(private resSvc: ReservationService, private authSvc: AuthService) {}

  ngOnInit(): void {
    if (!this.authSvc.isAuthenticated()) {
      this.errorMessage = 'Please log in to view your reservations';
      return;
    }
    this.loadReservations();
  }

  private loadReservations(): void {
    this.loading = true;
    this.errorMessage = '';
    this.resSvc.getUserReservations().subscribe({
      next: (r: any) => {
        this.reservations = r;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading reservations:', err);
        this.errorMessage = 'Failed to load reservations. Please try again.';
        this.loading = false;
      }
    });
  }

  onCancel(id: number) {
    if (confirm('Cancel this reservation?')) {
      this.resSvc.updateReservationStatus(id, 'CANCELLED' as any).subscribe({
        next: () => this.reservations = this.reservations.filter(r => r.id !== id),
        error: () => alert('Cancellation failed')
      });
    }
  }
}
