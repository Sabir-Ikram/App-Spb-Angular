import { Component } from '@angular/core';
import { ReservationService } from '../services/reservation.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-booking',
  template: `
    <mat-card>
      <mat-toolbar>Booking</mat-toolbar>
      <form (submit)="onBook()">
        <mat-form-field appearance="fill"><mat-label>Flight ID</mat-label>
          <input matInput [(ngModel)]="flightId" name="flightId" /></mat-form-field>
        <mat-form-field appearance="fill"><mat-label>Hotel ID</mat-label>
          <input matInput [(ngModel)]="hotelId" name="hotelId" /></mat-form-field>
        <button mat-raised-button color="primary" type="submit">Confirm Booking</button>
      </form>
    </mat-card>
  `
})
export class BookingComponent {
  flightId: number | null = null;
  hotelId: number | null = null;

  constructor(private resSvc: ReservationService, private router: Router) {}

  onBook() {
    const payload: any = { flightId: this.flightId, hotelId: this.hotelId };
    this.resSvc.create(payload).subscribe({ next: r => this.router.navigate(['/dashboard']), error: e => alert('Booking failed') });
  }
}
