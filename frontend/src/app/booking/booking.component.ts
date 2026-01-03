import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReservationService } from '../services/reservation.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <mat-card class="booking-container">
      <mat-toolbar color="primary">Confirm Booking</mat-toolbar>
      <mat-card-content>
        <form (submit)="onBook()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Flight ID</mat-label>
            <input matInput [(ngModel)]="flightId" name="flightId" type="number" required />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Hotel ID (Optional)</mat-label>
            <input matInput [(ngModel)]="hotelId" name="hotelId" type="number" />
          </mat-form-field>
          <button mat-raised-button color="primary" type="submit">Confirm Booking</button>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .booking-container {
      max-width: 500px;
      margin: 40px auto;
    }
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
  `]
})
export class BookingComponent {
  flightId: number | null = null;
  hotelId: number | null = null;

  constructor(private resSvc: ReservationService, private router: Router, private route: ActivatedRoute) {
    this.route.queryParams.subscribe(params => {
      if (params['flightId']) {
        this.flightId = +params['flightId'];
      }
    });
  }

  onBook() {
    if (!this.flightId) {
      alert('Flight ID is required');
      return;
    }
    const payload: any = { flightId: this.flightId, hotelId: this.hotelId };
    this.resSvc.create(payload).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => alert('Booking failed')
    });
  }
}
