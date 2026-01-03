import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTableModule } from '@angular/material/table';
import { ReservationService } from '../../services/reservation.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatToolbarModule, MatTableModule],
  template: `
    <mat-card class="admin-container">
      <mat-toolbar color="primary">Admin Dashboard</mat-toolbar>
      <mat-card-content>
        <p>All Reservations</p>
        <table mat-table [dataSource]="reservations" class="reservations-table">
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef>ID</th>
            <td mat-cell *matCellDef="let r">{{ r.id }}</td>
          </ng-container>
          <ng-container matColumnDef="user">
            <th mat-header-cell *matHeaderCellDef>User</th>
            <td mat-cell *matCellDef="let r">{{ r.userId }}</td>
          </ng-container>
          <ng-container matColumnDef="total">
            <th mat-header-cell *matHeaderCellDef>Total</th>
            <td mat-cell *matCellDef="let r">{{ r.totalPrice }}</td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .admin-container {
      margin: 16px;
    }
    .reservations-table {
      width: 100%;
      margin-top: 16px;
    }
    th {
      background-color: #f5f5f5;
      font-weight: 600;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  reservations: any[] = [];
  displayedColumns = ['id', 'user', 'total'];

  constructor(private resSvc: ReservationService) {}

  ngOnInit(): void {
    this.resSvc.getAll().subscribe(r => (this.reservations = r));
  }
}
