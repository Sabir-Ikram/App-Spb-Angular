import { Component, OnInit } from '@angular/core';
import { ReservationService } from '../../services/reservation.service';

@Component({
  selector: 'app-user-dashboard',
  template: `
    <mat-card>
      <mat-toolbar>Your Dashboard</mat-toolbar>
      <mat-list>
        <mat-list-item *ngFor="let r of reservations">
          Reservation #{{r.id}} — {{r.status}} — {{r.totalPrice}}
        </mat-list-item>
      </mat-list>
    </mat-card>
  `
})
export class UserDashboardComponent implements OnInit {
  reservations: any[] = [];

  constructor(private resSvc: ReservationService) {}

  ngOnInit(): void {
    this.resSvc.getMyReservations().subscribe(r => (this.reservations = r));
  }
}
