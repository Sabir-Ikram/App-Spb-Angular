import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReservationService } from '../services/reservation.service';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { CreateReservationRequest, ReservationType, HotelReservationData, FlightReservationData } from '../models/reservation.model';

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
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDialogModule
  ],
  template: `
    <div class="booking-page">
      <!-- Progress Indicator -->
      <div class="progress-steps">
        <div class="step completed">
          <div class="step-icon">
            <mat-icon>search</mat-icon>
          </div>
          <span class="step-label">Search</span>
        </div>
        <div class="step-line completed"></div>
        <div class="step completed">
          <div class="step-icon">
            <mat-icon>check_circle</mat-icon>
          </div>
          <span class="step-label">Select</span>
        </div>
        <div class="step-line active"></div>
        <div class="step active">
          <div class="step-icon">
            <mat-icon>confirmation_number</mat-icon>
          </div>
          <span class="step-label">Confirm</span>
        </div>
        <div class="step-line"></div>
        <div class="step">
          <div class="step-icon">
            <mat-icon>done_all</mat-icon>
          </div>
          <span class="step-label">Complete</span>
        </div>
      </div>

      <!-- Main Content -->
      <mat-card class="booking-container">
        <!-- No Data State -->
        <div *ngIf="!hotelData && !flightData" class="no-data">
          <mat-icon class="no-data-icon">search_off</mat-icon>
          <h2>No Booking Selected</h2>
          <p>Please search and select a hotel or flight to continue with your reservation.</p>
          <div class="no-data-actions">
            <button mat-raised-button color="primary" routerLink="/hotels">
              <mat-icon>hotel</mat-icon>
              Search Hotels
            </button>
            <button mat-raised-button color="accent" routerLink="/flights">
              <mat-icon>flight</mat-icon>
              Search Flights
            </button>
          </div>
        </div>

        <!-- Booking Preview -->
        <div *ngIf="(hotelData || flightData) && !submitting" class="booking-preview">
          <h1 class="page-title">
            <mat-icon>confirmation_number</mat-icon>
            Review Your Booking
          </h1>
          <p class="page-subtitle">Please review your booking details before confirmation</p>

          <!-- Hotel Details -->
          <mat-card *ngIf="hotelData" class="detail-card hotel-card">
            <div class="card-header">
              <mat-icon class="card-icon">hotel</mat-icon>
              <h2>Hotel Reservation</h2>
            </div>
            
            <div class="hotel-content">
              <div class="hotel-image-wrapper" *ngIf="hotelData.imageUrl">
                <img [src]="hotelData.imageUrl" [alt]="hotelData.hotelName" class="hotel-image" />
                <div class="rating-overlay" *ngIf="hotelData.rating">
                  <mat-icon>star</mat-icon>
                  <span>${'{{ hotelData.rating }}'}</span>
                </div>
              </div>
              
              <div class="hotel-details">
                <h3 class="hotel-name">${'{{ hotelData.hotelName }}'}</h3>
                
                <div class="detail-row">
                  <mat-icon>location_city</mat-icon>
                  <span class="detail-label">City:</span>
                  <span class="detail-value">${'{{ hotelData.city }}'}</span>
                </div>
                
                <div class="detail-row">
                  <mat-icon>place</mat-icon>
                  <span class="detail-label">Address:</span>
                  <span class="detail-value">${'{{ hotelData.address }}'}</span>
                </div>
                
                <div class="date-range">
                  <div class="date-box">
                    <mat-icon>event</mat-icon>
                    <div class="date-info">
                      <span class="date-label">Check-in</span>
                      <span class="date-value">${'{{ hotelData.checkIn | date: "MMM d, yyyy" }}'}</span>
                    </div>
                  </div>
                  <mat-icon class="arrow-icon">arrow_forward</mat-icon>
                  <div class="date-box">
                    <mat-icon>event</mat-icon>
                    <div class="date-info">
                      <span class="date-label">Check-out</span>
                      <span class="date-value">${'{{ hotelData.checkOut | date: "MMM d, yyyy" }}'}</span>
                    </div>
                  </div>
                </div>
                
                <div class="price-breakdown">
                  <div class="price-row">
                    <span>Price per night:</span>
                    <span>${'{{ hotelData.pricePerNight | currency }}'}</span>
                  </div>
                  <div class="price-row">
                    <span>Number of nights:</span>
                    <span>${'{{ hotelData.nights }}'}</span>
                  </div>
                  <div class="price-row total">
                    <span>Total:</span>
                    <span class="total-amount">${'{{ hotelData.totalPrice | currency }}'}</span>
                  </div>
                </div>
              </div>
            </div>
          </mat-card>

          <!-- Flight Details -->
          <mat-card *ngIf="flightData" class="detail-card flight-card">
            <div class="card-header">
              <mat-icon class="card-icon">flight</mat-icon>
              <h2>Flight Reservation</h2>
            </div>
            
            <div class="flight-content">
              <div class="flight-route">
                <div class="route-point">
                  <mat-icon>flight_takeoff</mat-icon>
                  <div class="route-info">
                    <span class="route-label">From</span>
                    <span class="route-city">${'{{ flightData.origin }}'}</span>
                  </div>
                </div>
                
                <div class="route-divider">
                  <div class="route-line"></div>
                  <mat-icon class="plane-icon">airplanemode_active</mat-icon>
                </div>
                
                <div class="route-point">
                  <mat-icon>flight_land</mat-icon>
                  <div class="route-info">
                    <span class="route-label">To</span>
                    <span class="route-city">${'{{ flightData.destination }}'}</span>
                  </div>
                </div>
              </div>
              
              <div class="flight-details">
                <div class="detail-row">
                  <mat-icon>airlines</mat-icon>
                  <span class="detail-label">Airline:</span>
                  <span class="detail-value">${'{{ flightData.airline }}'}</span>
                </div>
                
                <div class="detail-row">
                  <mat-icon>event</mat-icon>
                  <span class="detail-label">Departure:</span>
                  <span class="detail-value">${'{{ flightData.departureDate | date: "MMM d, yyyy" }}'}</span>
                </div>
                
                <div class="detail-row" *ngIf="flightData.returnDate">
                  <mat-icon>event</mat-icon>
                  <span class="detail-label">Return:</span>
                  <span class="detail-value">${'{{ flightData.returnDate | date: "MMM d, yyyy" }}'}</span>
                </div>
                
                <div class="detail-row">
                  <mat-icon>people</mat-icon>
                  <span class="detail-label">Passengers:</span>
                  <span class="detail-value">${'{{ flightData.passengers }}'}</span>
                </div>
                
                <div class="price-breakdown">
                  <div class="price-row total">
                    <span>Total:</span>
                    <span class="total-amount">${'{{ flightData.price | currency }}'}</span>
                  </div>
                </div>
              </div>
            </div>
          </mat-card>

          <!-- Grand Total (if both hotel and flight) -->
          <mat-card *ngIf="hotelData && flightData" class="total-card">
            <div class="grand-total">
              <mat-icon>receipt</mat-icon>
              <span class="grand-total-label">Grand Total:</span>
              <span class="grand-total-amount">${'{{ (hotelData.totalPrice + flightData.price) | currency }}'}</span>
            </div>
          </mat-card>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <button mat-stroked-button class="cancel-btn" (click)="cancel()">
              <mat-icon>close</mat-icon>
              Cancel Booking
            </button>
            <button mat-raised-button color="accent" class="confirm-btn" (click)="confirmBooking()">
              <mat-icon>check_circle</mat-icon>
              Confirm & Pay Now
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="submitting" class="loading-state">
          <mat-spinner diameter="60" color="primary"></mat-spinner>
          <h3>Processing Your Reservation...</h3>
          <p>Please wait while we confirm your booking</p>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .booking-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 32px 24px 64px;
    }

    /* Progress Steps */
    .progress-steps {
      max-width: 900px;
      margin: 0 auto 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
      padding: 32px 24px;
      border-radius: 16px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      position: relative;
    }

    .step-icon {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #e9ecef;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    .step-icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: #6c757d;
    }

    .step.completed .step-icon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .step.completed .step-icon mat-icon {
      color: white;
    }

    .step.active .step-icon {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      box-shadow: 0 4px 16px rgba(245, 87, 108, 0.3);
      animation: pulse-shadow 2s ease-in-out infinite;
    }

    .step.active .step-icon mat-icon {
      color: white;
    }

    @keyframes pulse-shadow {
      0%, 100% { box-shadow: 0 4px 16px rgba(245, 87, 108, 0.3); }
      50% { box-shadow: 0 8px 24px rgba(245, 87, 108, 0.5); }
    }

    .step-label {
      font-size: 0.9rem;
      font-weight: 600;
      color: #6c757d;
    }

    .step.completed .step-label,
    .step.active .step-label {
      color: #2c3e50;
    }

    .step-line {
      width: 80px;
      height: 3px;
      background: #e9ecef;
      margin: 0 12px;
    }

    .step-line.completed {
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    }

    .step-line.active {
      background: linear-gradient(90deg, #667eea 0%, #f5576c 50%);
    }

    /* Main Container */
    .booking-container {
      max-width: 900px;
      margin: 0 auto;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      padding: 48px 40px;
    }

    /* No Data State */
    .no-data {
      text-align: center;
      padding: 80px 24px;
    }

    .no-data-icon {
      font-size: 100px;
      width: 100px;
      height: 100px;
      color: #dee2e6;
      margin-bottom: 24px;
    }

    .no-data h2 {
      font-size: 2rem;
      font-weight: 700;
      color: #2c3e50;
      margin: 0 0 16px 0;
    }

    .no-data p {
      font-size: 1.1rem;
      color: #6c757d;
      margin: 0 0 32px 0;
    }

    .no-data-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .no-data-actions button {
      height: 52px;
      padding: 0 32px !important;
      font-size: 1.05rem !important;
      font-weight: 600 !important;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    /* Page Title */
    .page-title {
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 2.25rem;
      font-weight: 700;
      color: #2c3e50;
      margin: 0 0 12px 0;
    }

    .page-title mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #667eea;
    }

    .page-subtitle {
      font-size: 1.1rem;
      color: #6c757d;
      margin: 0 0 40px 0;
    }

    /* Detail Cards */
    .detail-card {
      margin-bottom: 24px;
      border-radius: 12px;
      overflow: hidden;
      border: 2px solid #e9ecef;
      transition: all 0.3s ease;
    }

    .detail-card:hover {
      border-color: #667eea;
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
    }

    .card-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 24px 32px;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .card-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
    }

    .card-header h2 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0;
    }

    /* Hotel Card */
    .hotel-content {
      padding: 32px;
      display: flex;
      gap: 32px;
    }

    .hotel-image-wrapper {
      position: relative;
      flex-shrink: 0;
    }

    .hotel-image {
      width: 280px;
      height: 210px;
      object-fit: cover;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .rating-overlay {
      position: absolute;
      top: 12px;
      right: 12px;
      background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
      color: #2c3e50;
      padding: 8px 16px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 700;
      font-size: 1.1rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .rating-overlay mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .hotel-details {
      flex: 1;
    }

    .hotel-name {
      font-size: 1.75rem;
      font-weight: 700;
      color: #2c3e50;
      margin: 0 0 24px 0;
    }

    /* Detail Rows */
    .detail-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .detail-row:last-of-type {
      border-bottom: none;
    }

    .detail-row mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: #667eea;
    }

    .detail-label {
      font-weight: 600;
      color: #6c757d;
      min-width: 100px;
    }

    .detail-value {
      color: #2c3e50;
      font-weight: 500;
    }

    /* Date Range */
    .date-range {
      display: flex;
      align-items: center;
      gap: 16px;
      margin: 24px 0;
      padding: 20px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 12px;
    }

    .date-box {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: white;
      border-radius: 8px;
    }

    .date-box mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #667eea;
    }

    .date-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .date-label {
      font-size: 0.85rem;
      color: #6c757d;
      font-weight: 600;
    }

    .date-value {
      font-size: 1.1rem;
      color: #2c3e50;
      font-weight: 700;
    }

    .arrow-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: #667eea;
    }

    /* Flight Card */
    .flight-content {
      padding: 32px;
    }

    .flight-route {
      display: flex;
      align-items: center;
      gap: 24px;
      margin-bottom: 32px;
      padding: 24px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 12px;
    }

    .route-point {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .route-point mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #667eea;
    }

    .route-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .route-label {
      font-size: 0.85rem;
      color: #6c757d;
      font-weight: 600;
    }

    .route-city {
      font-size: 1.4rem;
      color: #2c3e50;
      font-weight: 700;
    }

    .route-divider {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      min-width: 80px;
    }

    .route-line {
      width: 100%;
      height: 3px;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    }

    .plane-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: #667eea;
    }

    .flight-details {
      padding-top: 24px;
    }

    /* Price Breakdown */
    .price-breakdown {
      margin-top: 24px;
      padding: 24px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 12px;
    }

    .price-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      font-size: 1rem;
      color: #495057;
    }

    .price-row.total {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 2px solid #dee2e6;
    }

    .total-amount {
      font-size: 2rem;
      font-weight: 700;
      color: #667eea;
    }

    /* Total Card */
    .total-card {
      margin-bottom: 32px;
      border-radius: 12px;
      border: 3px solid #667eea;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .grand-total {
      padding: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
    }

    .grand-total mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
    }

    .grand-total-label {
      font-size: 1.5rem;
      font-weight: 600;
    }

    .grand-total-amount {
      font-size: 2.5rem;
      font-weight: 700;
    }

    /* Action Buttons */
    .action-buttons {
      display: flex;
      gap: 16px;
      justify-content: center;
      margin-top: 40px;
      padding-top: 32px;
      border-top: 2px solid #e9ecef;
    }

    .cancel-btn,
    .confirm-btn {
      height: 60px;
      padding: 0 48px !important;
      font-size: 1.15rem !important;
      font-weight: 700 !important;
      border-radius: 10px;
      display: flex;
      align-items: center;
      gap: 12px;
      transition: all 0.3s ease;
    }

    .cancel-btn {
      border: 2px solid #dee2e6;
      color: #6c757d;
    }

    .cancel-btn:hover {
      border-color: #f5576c;
      color: #f5576c;
      background-color: rgba(245, 87, 108, 0.05);
    }

    .confirm-btn {
      box-shadow: 0 6px 24px rgba(245, 87, 108, 0.4);
    }

    .confirm-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 32px rgba(245, 87, 108, 0.5);
    }

    .cancel-btn mat-icon,
    .confirm-btn mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    /* Loading State */
    .loading-state {
      text-align: center;
      padding: 100px 24px;
    }

    .loading-state h3 {
      font-size: 1.75rem;
      font-weight: 600;
      color: #2c3e50;
      margin: 32px 0 12px 0;
    }

    .loading-state p {
      font-size: 1.1rem;
      color: #6c757d;
      margin: 0;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .booking-page {
        padding: 16px;
      }

      .progress-steps {
        padding: 20px 12px;
        flex-wrap: wrap;
        gap: 16px;
      }

      .step-line {
        display: none;
      }

      .booking-container {
        padding: 32px 24px;
      }

      .page-title {
        font-size: 1.75rem;
      }

      .hotel-content {
        flex-direction: column;
        padding: 24px;
      }

      .hotel-image {
        width: 100%;
        height: 200px;
      }

      .flight-route {
        flex-direction: column;
      }

      .route-divider {
        transform: rotate(90deg);
      }

      .action-buttons {
        flex-direction: column-reverse;
      }

      .cancel-btn,
      .confirm-btn {
        width: 100%;
        justify-content: center;
      }

      .date-range {
        flex-direction: column;
      }

      .arrow-icon {
        transform: rotate(90deg);
      }
    }
  `]
})
export class BookingComponent implements OnInit {
  hotelData: HotelReservationData | null = null;
  flightData: FlightReservationData | null = null;
  submitting = false;

  constructor(
    private resSvc: ReservationService,
    private router: Router,
    private auth: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    // Check authentication first
    if (!this.auth.isAuthenticated()) {
      alert('Please log in before booking.');
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/booking' } });
      return;
    }

    // Verify token exists
    const token = this.auth.getToken();
    if (!token) {
      alert('No authentication token found. Please log in.');
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/booking' } });
      return;
    }

    console.log('Auth check passed, token present');

    // Load hotel data from sessionStorage
    const storedHotelData = sessionStorage.getItem('pendingHotelReservation');
    if (storedHotelData) {
      this.hotelData = JSON.parse(storedHotelData);
      console.log('Hotel data loaded:', this.hotelData);
    }

    // Load flight data from sessionStorage
    const storedFlightData = sessionStorage.getItem('pendingFlightReservation');
    if (storedFlightData) {
      this.flightData = JSON.parse(storedFlightData);
      console.log('Flight data loaded:', this.flightData);
    }
  }

  confirmBooking() {
    if (!this.hotelData && !this.flightData) {
      alert('No booking data available');
      return;
    }

    // Double-check auth before submitting
    if (!this.auth.isAuthenticated()) {
      alert('Session expired. Please log in again.');
      if (this.hotelData) sessionStorage.setItem('pendingHotelReservation', JSON.stringify(this.hotelData));
      if (this.flightData) sessionStorage.setItem('pendingFlightReservation', JSON.stringify(this.flightData));
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/booking' } });
      return;
    }

    const token = this.auth.getToken();
    console.log('Creating reservation with auth token:', token ? 'Present' : 'Missing');

    this.submitting = true;

    // Determine reservation type
    let type: ReservationType;
    if (this.hotelData && this.flightData) {
      type = ReservationType.BOTH;
    } else if (this.hotelData) {
      type = ReservationType.HOTEL;
    } else {
      type = ReservationType.FLIGHT;
    }

    const request: CreateReservationRequest = {
      type: type,
      hotel: this.hotelData || undefined,
      flight: this.flightData || undefined
    };

    console.log('Reservation request:', JSON.stringify(request, null, 2));

    this.resSvc.createReservation(request).subscribe({
      next: (reservation) => {
        sessionStorage.removeItem('pendingHotelReservation');
        sessionStorage.removeItem('pendingFlightReservation');
        this.submitting = false;
        
        // Redirect to payment page
        this.router.navigate(['/payment', reservation.id]);
      },
      error: (err: any) => {
        this.submitting = false;
        console.error('Booking error details:', err);
        if (err.status === 401) {
          alert('Session expired. Please log in again.');
          if (this.hotelData) sessionStorage.setItem('pendingHotelReservation', JSON.stringify(this.hotelData));
          if (this.flightData) sessionStorage.setItem('pendingFlightReservation', JSON.stringify(this.flightData));
          this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/booking' } });
        } else {
          console.error('Booking error:', err);
          alert('Booking failed: ' + (err.error?.message || err.message || 'Unknown error'));
        }
      }
    });
  }

  cancel() {
    sessionStorage.removeItem('pendingHotelReservation');
    sessionStorage.removeItem('pendingFlightReservation');
    // Navigate based on what was being booked
    if (this.flightData && !this.hotelData) {
      this.router.navigate(['/flights']);
    } else {
      this.router.navigate(['/hotels']);
    }
  }
}

// Success Dialog Component
@Component({
  selector: 'booking-success-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="success-dialog">
      <div class="success-icon-wrapper">
        <mat-icon class="success-icon">check_circle</mat-icon>
      </div>
      <h2 mat-dialog-title>Booking Confirmed!</h2>
      <mat-dialog-content>
        <p class="success-message">Your reservation has been successfully created.</p>
        <div class="booking-details">
          <div class="detail-item">
            <mat-icon>confirmation_number</mat-icon>
            <div>
              <div class="detail-label">Confirmation Number</div>
              <div class="detail-value">#{{data.reservationId}}</div>
            </div>
          </div>
          <div class="detail-item">
            <mat-icon>payments</mat-icon>
            <div>
              <div class="detail-label">Total Amount</div>
              <div class="detail-value total-price">\${{data.totalPrice}}</div>
            </div>
          </div>
          <div class="detail-item">
            <mat-icon>{{getTypeIcon()}}</mat-icon>
            <div>
              <div class="detail-label">Booking Type</div>
              <div class="detail-value">{{getTypeLabel()}}</div>
            </div>
          </div>
        </div>
        <p class="confirmation-text">
          A confirmation email has been sent to your registered email address. 
          You can view all your reservations in the "My Reservations" page.
        </p>
      </mat-dialog-content>
      <mat-dialog-actions>
        <button mat-raised-button color="accent" (click)="close()" class="view-btn">
          <mat-icon>visibility</mat-icon>
          View My Reservations
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .success-dialog {
      text-align: center;
      padding: 20px;
    }

    .success-icon-wrapper {
      margin: 20px 0;
      animation: scaleIn 0.5s ease-out;
    }

    @keyframes scaleIn {
      0% {
        transform: scale(0);
        opacity: 0;
      }
      50% {
        transform: scale(1.1);
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }

    .success-icon {
      font-size: 100px;
      width: 100px;
      height: 100px;
      color: #4caf50;
    }

    h2 {
      font-size: 2rem;
      font-weight: 700;
      color: #2c3e50;
      margin: 16px 0;
    }

    .success-message {
      font-size: 1.1rem;
      color: #6c757d;
      margin: 16px 0 32px;
    }

    .booking-details {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
      text-align: left;
    }

    .detail-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 12px 0;
      border-bottom: 1px solid #dee2e6;
    }

    .detail-item:last-child {
      border-bottom: none;
    }

    .detail-item mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #667eea;
      margin-top: 4px;
    }

    .detail-label {
      font-size: 0.9rem;
      color: #6c757d;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .detail-value {
      font-size: 1.1rem;
      color: #2c3e50;
      font-weight: 600;
    }

    .total-price {
      font-size: 1.5rem;
      color: #667eea;
      font-weight: 700;
    }

    .confirmation-text {
      font-size: 0.95rem;
      color: #6c757d;
      line-height: 1.6;
      margin: 24px 0;
      text-align: center;
    }

    mat-dialog-actions {
      justify-content: center;
      padding: 24px 0 0;
    }

    .view-btn {
      height: 52px;
      padding: 0 32px !important;
      font-size: 1.05rem !important;
      font-weight: 600 !important;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .view-btn mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }
  `]
})
export class BookingSuccessDialog {
  constructor(
    public dialogRef: MatDialogRef<BookingSuccessDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { reservationId: number; totalPrice: number; type: ReservationType }
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  getTypeIcon(): string {
    switch (this.data.type) {
      case ReservationType.HOTEL:
        return 'hotel';
      case ReservationType.FLIGHT:
        return 'flight';
      case ReservationType.BOTH:
        return 'card_travel';
      default:
        return 'confirmation_number';
    }
  }

  getTypeLabel(): string {
    switch (this.data.type) {
      case ReservationType.HOTEL:
        return 'Hotel Only';
      case ReservationType.FLIGHT:
        return 'Flight Only';
      case ReservationType.BOTH:
        return 'Hotel + Flight Package';
      default:
        return 'Reservation';
    }
  }
}
