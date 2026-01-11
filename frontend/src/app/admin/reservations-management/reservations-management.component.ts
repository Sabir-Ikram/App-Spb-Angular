import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../services/reservation.service';
import { ReservationResponse, ReservationStatus } from '../../models/reservation.model';

@Component({
  selector: 'app-reservations-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="admin-container">
      <h1><mat-icon>admin_panel_settings</mat-icon> All Reservations</h1>

      <div *ngIf="loading" class="loading">
        <mat-spinner></mat-spinner>
      </div>

      <mat-card *ngIf="!loading">
        <mat-card-content>
          <table mat-table [dataSource]="reservations" class="reservations-table">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let reservation">{{ reservation.id }}</td>
            </ng-container>

            <ng-container matColumnDef="user">
              <th mat-header-cell *matHeaderCellDef>User</th>
              <td mat-cell *matCellDef="let reservation">{{ reservation.userEmail }}</td>
            </ng-container>

            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let reservation">
                <mat-chip [class]="'type-' + reservation.type.toLowerCase()">
                  <mat-icon *ngIf="reservation.type === 'BOTH'">card_travel</mat-icon>
                  <mat-icon *ngIf="reservation.type === 'FLIGHT'">flight</mat-icon>
                  <mat-icon *ngIf="reservation.type === 'HOTEL'">hotel</mat-icon>
                  {{ reservation.type === 'BOTH' ? 'PACKAGE' : reservation.type }}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let reservation">
                <mat-chip [class]="'status-' + reservation.status.toLowerCase()">
                  {{ reservation.status }}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="totalPrice">
              <th mat-header-cell *matHeaderCellDef>Total</th>
              <td mat-cell *matCellDef="let reservation">{{ reservation.totalPrice | currency }}</td>
            </ng-container>

            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Created</th>
              <td mat-cell *matCellDef="let reservation">{{ reservation.createdAt | date:'short' }}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let reservation">
                <mat-select [(ngModel)]="reservation.status" 
                           (selectionChange)="updateStatus(reservation)"
                           class="status-select">
                  <mat-option value="PENDING">Pending</mat-option>
                  <mat-option value="CONFIRMED">Confirmed</mat-option>
                  <mat-option value="CANCELLED">Cancelled</mat-option>
                  <mat-option value="COMPLETED">Completed</mat-option>
                </mat-select>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <div *ngIf="reservations.length === 0" class="no-data">
            <mat-icon>inbox</mat-icon>
            <p>No reservations found</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    h1 {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #1976d2;
      margin-bottom: 2rem;
    }

    .loading {
      display: flex;
      justify-content: center;
      padding: 4rem;
    }

    .reservations-table {
      width: 100%;
    }

    mat-chip {
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 6px;

      &.type-flight {
        background-color: #2196f3;
        color: white;
      }

      &.type-hotel {
        background-color: #ff9800;
        color: white;
      }

      &.type-both {
        background: linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%);
        color: white;
        font-weight: 700;
        animation: pulse-chip 2s ease-in-out infinite;
      }

      @keyframes pulse-chip {
        0%, 100% {
          box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
        }
        50% {
          box-shadow: 0 4px 12px rgba(255, 107, 107, 0.5);
        }
      }

      &.status-pending {
        background-color: #ff9800;
        color: white;
      }

      &.status-confirmed {
        background-color: #4caf50;
        color: white;
      }

      &.status-cancelled {
        background-color: #f44336;
        color: white;
      }

      &.status-completed {
        background-color: #2196f3;
        color: white;
      }
    }

    .status-select {
      width: 120px;
      font-size: 14px;
    }

    .no-data {
      text-align: center;
      padding: 3rem;
      color: #666;

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #999;
      }
    }

    th.mat-header-cell {
      font-weight: bold;
      color: #1976d2;
    }
  `]
})
export class ReservationsManagementComponent implements OnInit {
  reservations: ReservationResponse[] = [];
  loading = true;
  displayedColumns = ['id', 'user', 'type', 'status', 'totalPrice', 'date', 'actions'];

  constructor(private reservationService: ReservationService) {}

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.loading = true;
    this.reservationService.getAllReservations().subscribe({
      next: (data) => {
        this.reservations = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading reservations:', error);
        alert('Failed to load reservations. Admin access required.');
        this.loading = false;
      }
    });
  }

  updateStatus(reservation: ReservationResponse): void {
    this.reservationService.updateReservationStatus(reservation.id, reservation.status).subscribe({
      next: () => {
        alert(`Reservation #${reservation.id} status updated to ${reservation.status}`);
      },
      error: (error) => {
        console.error('Error updating status:', error);
        alert('Failed to update status');
        this.loadReservations(); // Reload to reset
      }
    });
  }
}
