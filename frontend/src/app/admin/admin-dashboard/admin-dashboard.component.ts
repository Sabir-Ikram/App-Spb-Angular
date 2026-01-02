import { Component, OnInit } from '@angular/core';
import { ReservationService } from '../../services/reservation.service';

@Component({
  selector: 'app-admin-dashboard',
  template: `
    <mat-card>
      <mat-toolbar>Admin Dashboard</mat-toolbar>
      <p>Recent reservations</p>
      <mat-table [dataSource]="reservations">
        <ng-container matColumnDef="id"><mat-header-cell *matHeaderCellDef>ID</mat-header-cell><mat-cell *matCellDef="let r">{{r.id}}</mat-cell></ng-container>
        <ng-container matColumnDef="user"><mat-header-cell *matHeaderCellDef>User</mat-header-cell><mat-cell *matCellDef="let r">{{r.userId}}</mat-cell></ng-container>
        <ng-container matColumnDef="total"><mat-header-cell *matHeaderCellDef>Total</mat-header-cell><mat-cell *matCellDef="let r">{{r.totalPrice}}</mat-cell></ng-container>

        <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
        <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
      </mat-table>
    </mat-card>
  `
})
export class AdminDashboardComponent implements OnInit {
  reservations: any[] = [];
  displayedColumns = ['id', 'user', 'total'];

  constructor(private resSvc: ReservationService) {}

  ngOnInit(): void {
    this.resSvc.getAll().subscribe(r => (this.reservations = r));
  }
}
