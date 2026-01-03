import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { ReservationService } from '../../services/reservation.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatToolbarModule, MatListModule, MatButtonModule],
  template: `
    <mat-card class="dashboard-container">
      <mat-toolbar color="primary">Your Reservations</mat-toolbar>
      <mat-list *ngIf="reservations.length > 0">
        <mat-list-item *ngFor="let r of reservations" class="reservation-item">
          <div class="reservation-info">
            <strong>Reservation #{{ r.id }}</strong>
            <p>Status: {{ r.status }} | Total: {{ r.totalPrice }}</p>
          </div>
          <button mat-button color="warn" (click)="onCancel(r.id)">Cancel</button>
        </mat-list-item>
      </mat-list>
      <div *ngIf="reservations.length === 0" class="no-reservations">
        <p>No reservations yet</p>
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
  `]
})
export class UserDashboardComponent implements OnInit {
  reservations: any[] = [];

  constructor(private resSvc: ReservationService) {}

  ngOnInit(): void {
    this.resSvc.getMyReservations().subscribe(r => (this.reservations = r));
  }

  onCancel(id: number) {
    if (confirm('Cancel this reservation?')) {
      this.resSvc.cancel(id).subscribe({
        next: () => this.reservations = this.reservations.filter(r => r.id !== id),
        error: () => alert('Cancellation failed')
      });
    }
  }
}
