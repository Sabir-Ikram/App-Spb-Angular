import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
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
    RouterModule,
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
      <!-- Compact Progress Stepper -->
      <div class="progress-stepper">
        <div class="step completed">
          <div class="step-icon"><mat-icon>search</mat-icon></div>
          <span class="step-label">Search</span>
        </div>
        <div class="step-line completed"></div>
        <div class="step completed">
          <div class="step-icon"><mat-icon>check_circle</mat-icon></div>
          <span class="step-label">Select</span>
        </div>
        <div class="step-line active"></div>
        <div class="step active">
          <div class="step-icon"><mat-icon>confirmation_number</mat-icon></div>
          <span class="step-label">Confirm</span>
        </div>
        <div class="step-line"></div>
        <div class="step">
          <div class="step-icon"><mat-icon>done_all</mat-icon></div>
          <span class="step-label">Complete</span>
        </div>
      </div>

      <!-- No Data State -->
      <div *ngIf="!hotelData && !flightData" class="no-data-container">
        <mat-icon class="no-data-icon">search_off</mat-icon>
        <h2>No Booking Selected</h2>
        <p>Please search and select a hotel or flight to continue.</p>
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

      <!-- Loading State -->
      <div *ngIf="submitting" class="loading-container">
        <mat-spinner diameter="50" color="primary"></mat-spinner>
        <h3>Processing Your Reservation...</h3>
        <p>Please wait while we confirm your booking</p>
      </div>

      <!-- Page Title (outside grid for better alignment) -->
      <h1 *ngIf="(hotelData || flightData) && !submitting" class="page-title">
        <mat-icon>confirmation_number</mat-icon>
        Review Your Booking
      </h1>

      <!-- Main Booking Layout (2-column desktop) -->
      <div *ngIf="(hotelData || flightData) && !submitting" class="booking-layout">
        <!-- Left Column: Details -->
        <div class="details-column">
          <!-- Package Suggestion Banner -->
          <div *ngIf="(hotelData && !flightData) || (flightData && !hotelData)" class="banner banner-warning">
            <mat-icon>card_travel</mat-icon>
            <div class="banner-content">
              <strong>Complete Your Package!</strong>
              <p *ngIf="flightData && !hotelData">Add a hotel to create a complete package and save.</p>
              <p *ngIf="hotelData && !flightData">Add a flight to create a complete package and save.</p>
            </div>
          </div>

          <!-- Package Confirmation Banner -->
          <div *ngIf="hotelData && flightData" class="banner banner-success">
            <mat-icon>check_circle</mat-icon>
            <div class="banner-content">
              <strong>Complete Package Selected!</strong>
              <p>Booking both flight and hotel together as a travel package.</p>
            </div>
          </div>

          <!-- Hotel Details Card -->
          <mat-card *ngIf="hotelData" class="detail-card">
            <div class="card-header">
              <mat-icon>hotel</mat-icon>
              <h2>Hotel Reservation</h2>
            </div>
            <div class="card-body">
              <div class="hotel-grid">
                <div class="hotel-image-wrapper" *ngIf="hotelData.imageUrl">
                  <img [src]="hotelData.imageUrl" [alt]="hotelData.hotelName" class="hotel-image" />
                  <div class="rating-badge" *ngIf="hotelData.rating">
                    <mat-icon>star</mat-icon>
                    <span>${'{{ hotelData.rating }}'}</span>
                  </div>
                </div>
                <div class="hotel-info">
                  <h3 class="hotel-name">${'{{ hotelData.hotelName }}'}</h3>
                  <div class="info-row">
                    <mat-icon>location_city</mat-icon>
                    <span>${'{{ hotelData.city }}'}</span>
                  </div>
                  <div class="info-row">
                    <mat-icon>place</mat-icon>
                    <span>${'{{ hotelData.address }}'}</span>
                  </div>
                  <div class="date-range">
                    <div class="date-item">
                      <mat-icon>event</mat-icon>
                      <div>
                        <span class="date-label">Check-in</span>
                        <span class="date-value">${'{{ hotelData.checkIn | date: "MMM d" }}'}</span>
                      </div>
                    </div>
                    <mat-icon class="arrow">arrow_forward</mat-icon>
                    <div class="date-item">
                      <mat-icon>event</mat-icon>
                      <div>
                        <span class="date-label">Check-out</span>
                        <span class="date-value">${'{{ hotelData.checkOut | date: "MMM d" }}'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="card-footer" *ngIf="hotelData && !flightData">
              <button mat-raised-button color="primary" [routerLink]="['/search']" [queryParams]="{to: hotelData.city, packageMode: 'true', depart: hotelData.checkIn, return: hotelData.checkOut}">
                <mat-icon>flight</mat-icon>
                Add Flight to Complete Package
              </button>
            </div>
          </mat-card>

          <!-- Flight Details Card -->
          <mat-card *ngIf="flightData" class="detail-card">
            <div class="card-header">
              <mat-icon>flight</mat-icon>
              <h2>Flight Reservation</h2>
            </div>
            <div class="card-body">
              <div class="flight-route">
                <div class="route-point">
                  <mat-icon>flight_takeoff</mat-icon>
                  <div>
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
                  <div>
                    <span class="route-label">To</span>
                    <span class="route-city">${'{{ flightData.destination }}'}</span>
                  </div>
                </div>
              </div>
              <div class="flight-info">
                <div class="info-row">
                  <mat-icon>airlines</mat-icon>
                  <span class="info-label">Airline</span>
                  <span class="info-value">${'{{ flightData.airline }}'}</span>
                </div>
                <div class="info-row">
                  <mat-icon>event</mat-icon>
                  <span class="info-label">Departure</span>
                  <span class="info-value">${'{{ flightData.departureDate | date: "MMM d, yyyy" }}'}</span>
                </div>
                <div class="info-row" *ngIf="flightData.returnDate">
                  <mat-icon>event</mat-icon>
                  <span class="info-label">Return</span>
                  <span class="info-value">${'{{ flightData.returnDate | date: "MMM d, yyyy" }}'}</span>
                </div>
                <div class="info-row">
                  <mat-icon>people</mat-icon>
                  <span class="info-label">Passengers</span>
                  <span class="info-value">${'{{ flightData.passengers }}'}</span>
                </div>
              </div>
            </div>
            <div class="card-footer" *ngIf="flightData && !hotelData">
              <button mat-raised-button color="primary" [routerLink]="['/hotels']" [queryParams]="{city: flightData.destinationCity || flightData.destination, iataCode: flightData.destination, checkIn: flightData.departureDate, checkOut: flightData.returnDate}">
                <mat-icon>hotel</mat-icon>
                Add Hotel to Complete Package
              </button>
            </div>
          </mat-card>
        </div>

        <!-- Right Column: Sticky Summary -->
        <div class="summary-column">
          <mat-card class="summary-card">
            <div class="summary-header">
              <mat-icon>receipt</mat-icon>
              <h2>Booking Summary</h2>
            </div>
            <div class="summary-body">
              <!-- Booking Type -->
              <div class="summary-section">
                <div class="summary-label">Booking Type</div>
                <div class="summary-value">
                  <mat-icon *ngIf="hotelData && flightData">card_travel</mat-icon>
                  <mat-icon *ngIf="hotelData && !flightData">hotel</mat-icon>
                  <mat-icon *ngIf="!hotelData && flightData">flight</mat-icon>
                  <span *ngIf="hotelData && flightData">Package</span>
                  <span *ngIf="hotelData && !flightData">Hotel Only</span>
                  <span *ngIf="!hotelData && flightData">Flight Only</span>
                </div>
              </div>

              <!-- Dates -->
              <div class="summary-section" *ngIf="hotelData">
                <div class="summary-label">Check-in</div>
                <div class="summary-value">${'{{ hotelData.checkIn | date: "MMM d, yyyy" }}'}</div>
              </div>
              <div class="summary-section" *ngIf="hotelData">
                <div class="summary-label">Check-out</div>
                <div class="summary-value">${'{{ hotelData.checkOut | date: "MMM d, yyyy" }}'}</div>
              </div>
              <div class="summary-section" *ngIf="flightData && !hotelData">
                <div class="summary-label">Departure</div>
                <div class="summary-value">${'{{ flightData.departureDate | date: "MMM d, yyyy" }}'}</div>
              </div>

              <div class="summary-divider"></div>

              <!-- Price Breakdown -->
              <div class="price-row" *ngIf="hotelData">
                <span>Hotel (${'{{ hotelData.nights }}'} nights)</span>
                <span>${'{{ hotelData.totalPrice | currency }}'}</span>
              </div>
              <div class="price-row" *ngIf="flightData">
                <span>Flight</span>
                <span>${'{{ flightData.price | currency }}'}</span>
              </div>

              <div class="summary-divider"></div>

              <!-- Total -->
              <div class="total-row">
                <span>Total</span>
                <span class="total-amount" *ngIf="hotelData && flightData">${'{{ (hotelData.totalPrice + flightData.price) | currency }}'}</span>
                <span class="total-amount" *ngIf="hotelData && !flightData">${'{{ hotelData.totalPrice | currency }}'}</span>
                <span class="total-amount" *ngIf="!hotelData && flightData">${'{{ flightData.price | currency }}'}</span>
              </div>
            </div>

            <!-- CTAs -->
            <div class="summary-actions">
              <button mat-raised-button color="accent" class="confirm-btn" (click)="confirmBooking()">
                <mat-icon>check_circle</mat-icon>
                Confirm & Pay
              </button>
              <button mat-stroked-button class="cancel-btn" (click)="cancel()">
                Cancel
              </button>
            </div>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* CSS Variables - Luxury Travel Theme */
    :host {
      --luxury-gold: #d4af37;
      --luxury-gold-light: #e8c96f;
      --luxury-gold-dark: #b8941f;
      --warm-charcoal: #2c2c2c;
      --warm-gray: #5a5a5a;
      --soft-gray: #8a8a8a;
      --whisper-gray: #c4c4c4;
      --ivory: #fafaf8;
      --cream: #f5f5f0;
      --white: #ffffff;
      --success-green: #4a7c59;
      --warm-orange: #d4955c;
      --soft-red: #c17b7b;
      --shadow-soft: 0 2px 12px rgba(212, 175, 55, 0.08);
      --shadow-medium: 0 4px 20px rgba(0, 0, 0, 0.06);
      --shadow-strong: 0 8px 32px rgba(0, 0, 0, 0.1);
      --radius-soft: 10px;
      --radius-card: 14px;
      --spacing-2: 8px;
      --spacing-3: 12px;
      --spacing-4: 16px;
      --spacing-5: 20px;
      --spacing-6: 24px;
      --spacing-8: 32px;
    }

    .booking-page {
      min-height: 100vh;
      background: var(--ivory);
      padding: var(--spacing-6) var(--spacing-4) var(--spacing-8);
    }

    /* Elegant Progress Stepper */
    .progress-stepper {
      max-width: 900px;
      margin: 0 auto var(--spacing-6);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--white);
      padding: var(--spacing-4) var(--spacing-5);
      border-radius: var(--radius-card);
      box-shadow: var(--shadow-soft);
      border: 1px solid rgba(212, 175, 55, 0.15);
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }

    .step-icon {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: var(--cream);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      border: 2px solid var(--whisper-gray);
    }

    .step-icon mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--soft-gray);
      transition: color 0.3s;
    }

    .step.completed .step-icon {
      background: linear-gradient(135deg, var(--luxury-gold) 0%, var(--luxury-gold-light) 100%);
      border-color: var(--luxury-gold);
    }

    .step.completed .step-icon mat-icon {
      color: white;
    }

    .step.active .step-icon {
      background: linear-gradient(135deg, var(--luxury-gold) 0%, var(--luxury-gold-light) 100%);
      border-color: var(--luxury-gold);
      box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.15);
    }

    .step.active .step-icon mat-icon {
      color: white;
    }

    .step-label {
      font-size: 13px;
      font-weight: 500;
      color: var(--warm-gray);
      transition: color 0.3s ease;
      letter-spacing: 0.02em;
    }

    .step.completed .step-label,
    .step.active .step-label {
      color: var(--warm-charcoal);
      font-weight: 600;
    }

    .step-line {
      width: 60px;
      height: 2px;
      background: var(--whisper-gray);
      margin: 0 var(--spacing-3);
      border-radius: 2px;
      transition: background 0.3s;
    }

    .step-line.completed {
      background: var(--luxury-gold);
    }

    .step-line.active {
      background: linear-gradient(90deg, var(--luxury-gold) 0%, var(--luxury-gold-light) 100%);
    }

    /* Empty & Loading States */
    .no-data-container {
      max-width: 600px;
      margin: 0 auto;
      text-align: center;
      padding: var(--spacing-8);
      background: var(--white);
      border-radius: var(--radius-card);
      box-shadow: var(--shadow-soft);
      border: 1px solid rgba(212, 175, 55, 0.15);
    }

    .no-data-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: var(--whisper-gray);
      margin-bottom: var(--spacing-4);
    }

    .no-data-container h2 {
      font-size: 22px;
      font-weight: 600;
      color: var(--warm-charcoal);
      margin: 0 0 var(--spacing-3) 0;
      letter-spacing: -0.01em;
      font-family: 'Poppins', sans-serif;
    }

    .no-data-container p {
      font-size: 15px;
      color: var(--warm-gray);
      margin: 0 0 var(--spacing-6) 0;
      line-height: 1.5;
    }

    .no-data-actions {
      display: flex;
      gap: var(--spacing-3);
      justify-content: center;
      flex-wrap: wrap;
    }

    .no-data-actions button {
      height: 46px;
      padding: 0 var(--spacing-6) !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      border-radius: var(--radius-soft) !important;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    /* Loading State */
    .loading-container {
      max-width: 600px;
      margin: 0 auto;
      text-align: center;
      padding: var(--spacing-8);
      background: var(--white);
      border-radius: var(--radius-card);
      box-shadow: var(--shadow-soft);
      border: 1px solid rgba(212, 175, 55, 0.15);
    }

    .loading-container h3 {
      font-size: 20px;
      font-weight: 600;
      color: var(--warm-charcoal);
      margin: var(--spacing-6) 0 var(--spacing-2) 0;
      font-family: 'Poppins', sans-serif;
    }

    .loading-container p {
      font-size: 14px;
      color: var(--warm-gray);
      margin: 0;
    }

    /* 2-Column Layout */
    .booking-layout {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 420px;
      gap: var(--spacing-6);
      align-items: start;
    }

    .details-column {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-4);
    }

    .summary-column {
      position: sticky;
      top: 88px;
    }

    /* Elegant Page Title - Outside Grid */
    .page-title {
      max-width: 1200px;
      margin: 0 auto var(--spacing-6);
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      font-size: 28px;
      font-weight: 600;
      color: var(--warm-charcoal);
      letter-spacing: -0.02em;
      font-family: 'Poppins', sans-serif;
    }

    .page-title mat-icon {
      font-size: 30px;
      width: 30px;
      height: 30px;
      color: var(--luxury-gold);
    }

    /* Elegant Banners */
    .banner {
      background: var(--white);
      border-left: 4px solid;
      border-radius: var(--radius-card);
      padding: var(--spacing-4) var(--spacing-5);
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-3);
      box-shadow: var(--shadow-soft);
      border-right: 1px solid rgba(212, 175, 55, 0.1);
      border-top: 1px solid rgba(212, 175, 55, 0.1);
      border-bottom: 1px solid rgba(212, 175, 55, 0.1);
      transition: all 0.3s ease;
    }

    .banner:hover {
      box-shadow: var(--shadow-medium);
      transform: translateY(-2px);
    }

    .banner mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .banner-warning {
      background: #fffdf7;
      border-left-color: var(--warm-orange);
    }

    .banner-warning mat-icon {
      color: var(--warm-orange);
    }

    .banner-success {
      background: #f8faf9;
      border-left-color: var(--success-green);
    }

    .banner-success mat-icon {
      color: var(--success-green);
    }

    .banner-content {
      flex: 1;
    }

    .banner-content strong {
      display: block;
      font-size: 15px;
      font-weight: 700;
      color: var(--warm-charcoal);
      margin-bottom: 4px;
      letter-spacing: -0.01em;
    }

    .banner-content p {
      font-size: 14px;
      color: var(--warm-gray);
      margin: 0 0 var(--spacing-3) 0;
      line-height: 1.5;
    }

    .banner-content button {
      height: 40px;
      padding: 0 var(--spacing-5) !important;
      font-size: 13px !important;
      font-weight: 600 !important;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border-radius: var(--radius-soft) !important;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    /* Luxury Detail Cards */
    .detail-card {
      background: var(--white);
      border-radius: var(--radius-card);
      box-shadow: var(--shadow-soft);
      overflow: hidden;
      border: 1px solid rgba(212, 175, 55, 0.12);
      transition: all 0.3s ease;
    }

    .detail-card:hover {
      box-shadow: var(--shadow-medium);
      border-color: rgba(212, 175, 55, 0.25);
      transform: translateY(-2px);
    }

    .card-header {
      background: linear-gradient(135deg, #fafaf8 0%, #f8f7f4 100%);
      border-bottom: 1px solid rgba(212, 175, 55, 0.15);
      color: var(--warm-charcoal);
      padding: var(--spacing-5);
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      min-height: 60px;
    }

    .card-header mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
      color: var(--luxury-gold);
    }

    .card-header h2 {
      font-size: 17px;
      font-weight: 600;
      margin: 0;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      font-size: 14px;
      color: var(--warm-gray);
    }

    .card-body {
      padding: var(--spacing-6);
    }

    .card-footer {
      padding: var(--spacing-4) var(--spacing-6);
      background: linear-gradient(180deg, var(--white) 0%, #fafaf8 100%);
      border-top: 1px solid rgba(212, 175, 55, 0.15);
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .card-footer button {
      height: 44px;
      padding: 0 var(--spacing-6) !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      border-radius: var(--radius-soft) !important;
      background: linear-gradient(135deg, var(--luxury-gold) 0%, var(--luxury-gold-light) 100%) !important;
      color: white !important;
      box-shadow: 0 2px 8px rgba(212, 175, 55, 0.25);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
    }

    .card-footer button:hover {
      background: linear-gradient(135deg, var(--luxury-gold-dark) 0%, var(--luxury-gold) 100%) !important;
      box-shadow: 0 4px 16px rgba(212, 175, 55, 0.35);
      transform: translateY(-1px);
    }

    .card-footer button mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    /* Hotel Grid Layout */
    .hotel-grid {
      display: grid;
      grid-template-columns: 220px 1fr;
      gap: var(--spacing-5);
    }

    .hotel-image-wrapper {
      position: relative;
    }

    .hotel-image {
      width: 100%;
      height: 150px;
      object-fit: cover;
      border-radius: var(--radius-soft);
      box-shadow: var(--shadow-soft);
      transition: all 0.3s ease;
      border: 1px solid rgba(212, 175, 55, 0.1);
    }

    .detail-card:hover .hotel-image {
      box-shadow: var(--shadow-medium);
      transform: scale(1.01);
    }

    .rating-badge {
      position: absolute;
      top: var(--spacing-2);
      right: var(--spacing-2);
      background: rgba(44, 44, 44, 0.85);
      backdrop-filter: blur(8px);
      color: white;
      padding: 4px 8px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 3px;
      font-weight: 600;
      font-size: 12px;
      box-shadow: var(--shadow-soft);
    }

    .rating-badge mat-icon {
      font-size: 13px;
      width: 13px;
      height: 13px;
      color: var(--luxury-gold);
    }

    .hotel-info {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-3);
    }

    .hotel-name {
      font-size: 22px;
      font-weight: 600;
      color: var(--warm-charcoal);
      margin: 0 0 var(--spacing-2) 0;
      line-height: 1.3;
      letter-spacing: -0.01em;
      font-family: 'Poppins', sans-serif;
    }

    .info-row {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      padding: 6px 0;
      font-size: 14px;
      color: var(--warm-gray);
    }

    .info-row mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--luxury-gold);
    }

    .info-label {
      font-weight: 500;
      color: var(--soft-gray);
      min-width: 90px;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .info-value {
      color: var(--warm-charcoal);
      font-weight: 500;
    }

    /* Elegant Date Range */
    .date-range {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      padding: var(--spacing-4);
      background: linear-gradient(135deg, #fafaf8 0%, #f8f7f4 100%);
      border: 1px solid rgba(212, 175, 55, 0.2);
      border-radius: var(--radius-soft);
      margin-top: var(--spacing-3);
    }

    .date-item {
      flex: 1;
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
    }

    .date-item mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: var(--luxury-gold);
    }

    .date-item > div {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .date-label {
      font-size: 11px;
      color: var(--soft-gray);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .date-value {
      font-size: 15px;
      color: var(--warm-charcoal);
      font-weight: 600;
      letter-spacing: -0.01em;
    }

    .date-range .arrow {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--luxury-gold);
    }

    /* Elegant Flight Route */
    .flight-route {
      display: flex;
      align-items: center;
      gap: var(--spacing-4);
      padding: var(--spacing-5);
      background: linear-gradient(135deg, #fafaf8 0%, #f8f7f4 100%);
      border: 1px solid rgba(212, 175, 55, 0.2);
      border-radius: var(--radius-soft);
      margin-bottom: var(--spacing-4);
    }

    .route-point {
      flex: 1;
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
    }

    .route-point mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: var(--luxury-gold);
    }

    .route-point > div {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .route-label {
      font-size: 11px;
      color: var(--soft-gray);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .route-city {
      font-size: 18px;
      color: var(--warm-charcoal);
      font-weight: 700;
      letter-spacing: -0.02em;
      font-family: 'Poppins', sans-serif;
    }

    .route-divider {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      min-width: 50px;
    }

    .route-line {
      width: 100%;
      height: 2px;
      background: linear-gradient(90deg, var(--luxury-gold) 0%, var(--luxury-gold-light) 50%, var(--luxury-gold) 100%);
      border-radius: 2px;
    }

    .plane-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: var(--luxury-gold);
      animation: plane-fly 2.5s ease-in-out infinite;
    }

    @keyframes plane-fly {
      0%, 100% { transform: translateX(0); opacity: 0.8; }
      50% { transform: translateX(4px); opacity: 1; }
    }

    .flight-info {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    /* Premium Summary Card */
    .summary-card {
      background: var(--white);
      border-radius: var(--radius-card);
      box-shadow: var(--shadow-medium);
      overflow: hidden;
      border: 1px solid rgba(212, 175, 55, 0.2);
    }

    .summary-header {
      background: linear-gradient(135deg, var(--luxury-gold) 0%, var(--luxury-gold-light) 100%);
      color: white;
      padding: var(--spacing-5);
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      min-height: 64px;
    }

    .summary-header mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: white;
    }

    .summary-header h2 {
      font-size: 18px;
      font-weight: 600;
      margin: 0;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      font-size: 15px;
    }

    .summary-body {
      padding: var(--spacing-6);
    }

    .summary-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      font-size: 14px;
    }

    .summary-label {
      color: var(--soft-gray);
      font-weight: 500;
      text-transform: uppercase;
      font-size: 12px;
      letter-spacing: 0.05em;
    }

    .summary-value {
      color: var(--warm-charcoal);
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .summary-value mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: var(--luxury-gold);
    }

    .summary-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.3) 50%, transparent 100%);
      margin: var(--spacing-4) 0;
    }

    .price-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      font-size: 14px;
      color: var(--warm-gray);
      font-weight: 500;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: var(--spacing-5) 0 0;
      font-size: 15px;
      font-weight: 600;
      color: var(--warm-charcoal);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: 13px;
    }

    .total-amount {
      font-size: 36px;
      font-weight: 700;
      color: var(--luxury-gold);
      letter-spacing: -0.02em;
      font-family: 'Poppins', sans-serif;
      text-shadow: 0 1px 2px rgba(212, 175, 55, 0.15);
    }

    /* Luxury Action Buttons */
    .summary-actions {
      padding: var(--spacing-6);
      border-top: 1px solid rgba(212, 175, 55, 0.15);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-3);
      background: linear-gradient(180deg, var(--white) 0%, #fafaf8 100%);
    }

    .confirm-btn {
      height: 52px;
      font-size: 16px !important;
      font-weight: 600 !important;
      letter-spacing: 0.05em !important;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-2);
      background: linear-gradient(135deg, var(--luxury-gold) 0%, var(--luxury-gold-light) 100%) !important;
      color: white !important;
      border-radius: var(--radius-soft) !important;
      box-shadow: 0 4px 16px rgba(212, 175, 55, 0.3);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: none !important;
    }

    .confirm-btn:hover {
      background: linear-gradient(135deg, var(--luxury-gold-dark) 0%, var(--luxury-gold) 100%) !important;
      box-shadow: 0 6px 24px rgba(212, 175, 55, 0.4);
      transform: translateY(-2px);
    }

    .confirm-btn:active {
      transform: translateY(0);
    }

    .confirm-btn mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
    }

    .cancel-btn {
      height: 44px;
      font-size: 14px !important;
      font-weight: 500 !important;
      color: var(--warm-gray) !important;
      border: 1px solid var(--whisper-gray) !important;
      border-radius: var(--radius-soft) !important;
      background: var(--white) !important;
      transition: all 0.3s;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .cancel-btn:hover {
      color: var(--soft-red) !important;
      border-color: var(--soft-red) !important;
      background: rgba(193, 123, 123, 0.04) !important;
    }

    /* Responsive Design */
    @media (max-width: 960px) {
      .booking-layout {
        grid-template-columns: 1fr;
        gap: var(--spacing-5);
      }

      .summary-column {
        position: static;
        order: -1;
      }

      .hotel-grid {
        grid-template-columns: 1fr;
        gap: var(--spacing-4);
      }

      .hotel-image {
        height: 220px;
      }
    }

    @media (max-width: 600px) {
      .booking-page {
        padding: var(--spacing-4) var(--spacing-3);
      }

      .progress-stepper {
        padding: var(--spacing-3);
        flex-wrap: wrap;
        gap: var(--spacing-2);
      }

      .step-line {
        display: none;
      }

      .step-label {
        font-size: 12px;
      }

      .page-title {
        font-size: 22px;
      }

      .page-title mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }

      .card-body {
        padding: var(--spacing-4);
      }

      .hotel-image {
        height: 200px;
      }

      .hotel-name {
        font-size: 16px;
      }

      .flight-route {
        flex-direction: column;
        gap: var(--spacing-3);
      }

      .route-divider {
        transform: rotate(90deg);
      }

      .date-range {
        flex-direction: column;
        gap: var(--spacing-3);
      }

      .date-range .arrow {
        transform: rotate(90deg);
      }

      .summary-actions button {
        width: 100%;
      }

      .confirm-btn {
        height: 50px;
      }

      .total-amount {
        font-size: 28px;
      }

      .card-footer {
        padding: var(--spacing-4);
      }

      .card-footer button {
        width: 100%;
        height: 48px;
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
          console.error('Error response body:', err.error);
          const errorMsg = err.error?.error || err.error?.message || err.message || 'Unknown error';
          alert('Booking failed: ' + errorMsg + '\n\nPlease check the browser console and backend logs for details.');
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
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="success-dialog">
      <button mat-icon-button class="close-button" (click)="close()">
        <mat-icon>close</mat-icon>
      </button>
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
        
        <!-- Package Completion Suggestion -->
        <div *ngIf="!data.isPackage" class="package-suggestion-dialog">
          <mat-icon>card_travel</mat-icon>
          <div class="suggestion-text">
            <strong>Complete Your Package!</strong>
            <p *ngIf="data.type === ReservationType.FLIGHT">Add a hotel to create a complete travel package.</p>
            <p *ngIf="data.type === ReservationType.HOTEL">Add a flight to create a complete travel package.</p>
          </div>
        </div>
        
        <p class="confirmation-text">
          A confirmation email has been sent to your registered email address. 
          You can view all your reservations in the "My Reservations" page.
        </p>
      </mat-dialog-content>
      <mat-dialog-actions>
        <div class="dialog-actions-wrapper">
          <!-- Package completion buttons (only show if not a package) -->
          <button *ngIf="data.type === ReservationType.FLIGHT" mat-raised-button color="primary" (click)="addHotel()" class="add-btn">
            <mat-icon>hotel</mat-icon>
            Add Hotel
          </button>
          <button *ngIf="data.type === ReservationType.HOTEL" mat-raised-button color="primary" (click)="addFlight()" class="add-btn">
            <mat-icon>flight</mat-icon>
            Add Flight
          </button>
          
          <!-- Always show view reservations button -->
          <button mat-raised-button color="accent" (click)="close()" class="view-btn">
            <mat-icon>visibility</mat-icon>
            {{data.isPackage ? 'View My Reservations' : 'View Reservations'}}
          </button>
        </div>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .success-dialog {
    }

    .step-icon mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
      color: #8b8b8b;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .step.completed .step-icon {
      background: linear-gradient(135deg, #8b6c50 0%, #6d5d4b 100%);
      border-color: transparent;
      box-shadow: 0 4px 12px rgba(139, 108, 80, 0.25);
    }

    .step.completed .step-icon mat-icon {
      color: white;
    }

    .step.active .step-icon {
      background: linear-gradient(135deg, #c4a574 0%, #a8845c 100%);
      box-shadow: 0 6px 20px rgba(196, 165, 116, 0.4);
      animation: pulse-shadow 2s ease-in-out infinite;
      border-color: transparent;
    }

    .step.active .step-icon mat-icon {
      color: white;
    }

    @keyframes pulse-shadow {
      0%, 100% { box-shadow: 0 6px 20px rgba(196, 165, 116, 0.4); }
      50% { box-shadow: 0 8px 28px rgba(196, 165, 116, 0.6); }
    }

    .step-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: #8b8b8b;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .step.completed .step-label,
    .step.active .step-label {
      color: #6d5d4b;
      font-weight: 700;
    }

    .step-line {
      width: 60px;
      height: 2px;
      background: linear-gradient(90deg, #e9ecef 0%, #dee2e6 100%);
      margin: 0 12px;
      border-radius: 2px;
    }

    .step-line.completed {
      background: linear-gradient(90deg, #8b6c50 0%, #6d5d4b 100%);
    }

    .step-line.active {
      background: linear-gradient(90deg, #8b6c50 0%, #c4a574 50%);
    }

    /* Main Container */
    .booking-container {
      max-width: 900px;
      margin: 0 auto;
      border-radius: 12px;
      box-shadow: 0 6px 24px rgba(139, 108, 80, 0.12);
      padding: 20px;
      background: linear-gradient(to bottom, #ffffff 0%, #fefefe 100%);
      border: 1px solid rgba(139, 108, 80, 0.08);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* No Data State */
    .no-data {
      text-align: center;
      padding: 50px 20px;
    }

    .no-data-icon {
      font-size: 70px;
      width: 70px;
      height: 70px;
      color: #dee2e6;
      margin-bottom: 16px;
    }

    .no-data h2 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #2c3e50;
      margin: 0 0 12px 0;
    }

    .no-data p {
      font-size: 0.95rem;
      color: #6c757d;
      margin: 0 0 24px 0;
    }

    .no-data-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .no-data-actions button {
      height: 44px;
      padding: 0 24px !important;
      font-size: 0.95rem !important;
      font-weight: 600 !important;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Page Title */
    .page-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.4rem;
      font-weight: 700;
      color: #2c3e50;
      margin: 0 0 8px 0;
    }

    .page-title mat-icon {
      font-size: 26px;
      width: 26px;
      height: 26px;
      color: #c4a574;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .page-subtitle {
      font-size: 0.88rem;
      color: #6c757d;
      margin: 0 0 20px 0;
    }

    /* Package Suggestion Banner */
    .package-suggestion {
      background: linear-gradient(135deg, #fff9ed 0%, #ffedd5 100%);
      border-left: 3px solid #c4a574;
      border-radius: 10px;
      padding: 14px 16px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 4px 12px rgba(196, 165, 116, 0.2);
      border: 1px solid rgba(196, 165, 116, 0.2);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .package-suggestion:hover {
      box-shadow: 0 8px 24px rgba(196, 165, 116, 0.35);
      transform: translateY(-2px);
    }

    .package-suggestion mat-icon {
      font-size: 30px;
      width: 30px;
      height: 30px;
      color: #a8845c;
      flex-shrink: 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .package-suggestion:hover mat-icon {
      transform: scale(1.1);
      color: #8b6c50;
    }

    .suggestion-content {
      flex: 1;
    }

    .suggestion-content h3 {
      font-size: 1rem;
      font-weight: 700;
      background: linear-gradient(135deg, #8b6c50 0%, #a8845c 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0 0 5px 0;
    }

    .suggestion-content p {
      font-size: 0.85rem;
      color: #6d5d4b;
      margin: 0 0 10px 0;
      line-height: 1.4;
    }

    .suggestion-content button {
      height: 36px;
      padding: 0 20px !important;
      font-weight: 600 !important;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: linear-gradient(135deg, #8b6c50 0%, #a8845c 50%, #6d5d4b 100%);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border-radius: 8px;
    }

    .suggestion-content button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(139, 108, 80, 0.3);
    }

    /* Package Confirmation Banner */
    .package-confirmation {
      background: linear-gradient(135deg, #f0f9f4 0%, #e8f5e9 100%);
      border-left: 3px solid #6d9f71;
      border-radius: 10px;
      padding: 14px 16px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 4px 12px rgba(109, 159, 113, 0.2);
      border: 1px solid rgba(109, 159, 113, 0.2);
    }

    .package-confirmation mat-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
      color: #6d9f71;
      flex-shrink: 0;
      animation: check-pulse 2s ease-in-out infinite;
    }

    @keyframes check-pulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.1);
      }
    }

    .confirmation-content {
      flex: 1;
    }

    .confirmation-content h3 {
      font-size: 1.1rem;
      font-weight: 700;
      color: #2c3e50;
      margin: 0 0 5px 0;
    }

    .confirmation-content p {
      font-size: 0.88rem;
      color: #495057;
      margin: 0;
    }

    /* Detail Cards */
    .detail-card {
      margin-bottom: 16px;
      border-radius: 10px;
      overflow: hidden;
      border: 1.5px solid rgba(139, 108, 80, 0.12);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 3px 12px rgba(139, 108, 80, 0.08);
    }

    .detail-card:hover {
      border-color: #c4a574;
      box-shadow: 0 10px 32px rgba(139, 108, 80, 0.2);
      transform: translateY(-3px);
    }

    .card-header {
      background: linear-gradient(135deg, #8b6c50 0%, #a8845c 50%, #6d5d4b 100%);
      color: white;
      padding: 14px 18px;
      display: flex;
      align-items: center;
      gap: 12px;
      position: relative;
      overflow: hidden;
    }

    .card-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
      transition: left 0.5s ease;
    }

    .detail-card:hover .card-header::before {
      left: 100%;
    }

    .card-icon {
      font-size: 26px;
      width: 26px;
      height: 26px;
    }

    .card-header h2 {
      font-size: 1.15rem;
      font-weight: 600;
      margin: 0;
    }

    /* Hotel Card */
    .hotel-content {
      padding: 18px;
      display: flex;
      gap: 20px;
    }

    .hotel-image-wrapper {
      position: relative;
      flex-shrink: 0;
    }

    .hotel-image {
      width: 220px;
      height: 150px;
      object-fit: cover;
      border-radius: 10px;
      box-shadow: 0 4px 14px rgba(139, 108, 80, 0.18);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .detail-card:hover .hotel-image {
      box-shadow: 0 8px 28px rgba(139, 108, 80, 0.3);
      transform: scale(1.02);
    }

    .rating-overlay {
      position: absolute;
      top: 10px;
      right: 10px;
      background: linear-gradient(135deg, #c4a574 0%, #d4b894 100%);
      color: white;
      padding: 6px 12px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      gap: 5px;
      font-weight: 700;
      font-size: 0.9rem;
      box-shadow: 0 4px 12px rgba(196, 165, 116, 0.35);
      border: 1.5px solid rgba(255, 255, 255, 0.3);
    }

    .rating-overlay mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .hotel-details {
      flex: 1;
    }

    .hotel-name {
      font-size: 1.3rem;
      font-weight: 700;
      color: #2c3e50;
      margin: 0 0 14px 0;
    }

    /* Detail Rows */
    .detail-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .detail-row:last-of-type {
      border-bottom: none;
    }

    .detail-row mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #c4a574;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .detail-row:hover mat-icon {
      color: #a8845c;
      transform: scale(1.1);
    }

    .detail-label {
      font-weight: 600;
      color: #6c757d;
      font-size: 0.88rem;
      min-width: 85px;
    }

    .detail-value {
      color: #2c3e50;
      font-weight: 500;
      font-size: 0.88rem;
    }

    /* Date Range */
    .date-range {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 16px 0;
      padding: 14px;
      background: linear-gradient(135deg, #faf8f5 0%, #f5f2ed 100%);
      border-radius: 10px;
      border: 1px solid rgba(139, 108, 80, 0.1);
    }

    .date-box {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      background: linear-gradient(to bottom, #ffffff 0%, #fefefe 100%);
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(139, 108, 80, 0.08);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .date-box:hover {
      box-shadow: 0 5px 16px rgba(139, 108, 80, 0.15);
      transform: translateY(-2px);
    }

    .date-box mat-icon {
      font-size: 26px;
      width: 26px;
      height: 26px;
      color: #c4a574;
    }

    .date-info {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .date-label {
      font-size: 0.75rem;
      color: #6c757d;
      font-weight: 600;
    }

    .date-value {
      font-size: 0.95rem;
      background: linear-gradient(135deg, #8b6c50 0%, #a8845c 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 700;
    }

    .arrow-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
      color: #c4a574;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Flight Card */
    .flight-content {
      padding: 18px;
    }

    .flight-route {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
      padding: 16px;
      background: linear-gradient(135deg, #faf8f5 0%, #f5f2ed 100%);
      border-radius: 10px;
      border: 1px solid rgba(139, 108, 80, 0.1);
    }

    .route-point {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .route-point mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #c4a574;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .flight-route:hover .route-point mat-icon {
      color: #a8845c;
      transform: scale(1.1);
    }

    .route-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .route-label {
      font-size: 0.75rem;
      color: #6c757d;
      font-weight: 600;
    }

    .route-city {
      font-size: 1.1rem;
      background: linear-gradient(135deg, #8b6c50 0%, #a8845c 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 700;
    }

    .route-divider {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      min-width: 70px;
    }

    .route-line {
      width: 100%;
      height: 2px;
      background: linear-gradient(90deg, #8b6c50 0%, #c4a574 50%, #a8845c 100%);
      border-radius: 2px;
    }

    .plane-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: #c4a574;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      animation: plane-fly 3s ease-in-out infinite;
    }

    @keyframes plane-fly {
      0%, 100% { transform: translateX(0); }
      50% { transform: translateX(8px); }
    }

    .flight-details {
      padding-top: 14px;
    }

    /* Price Breakdown */
    .price-breakdown {
      margin-top: 16px;
      padding: 16px;
      background: linear-gradient(135deg, #faf8f5 0%, #f5f2ed 100%);
      border-radius: 10px;
      border: 1px solid rgba(139, 108, 80, 0.1);
    }

    .price-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      font-size: 0.9rem;
      color: #6d5d4b;
    }

    .price-row.total {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 2px solid rgba(139, 108, 80, 0.2);
    }

    .total-amount {
      font-size: 1.6rem;
      font-weight: 700;
      background: linear-gradient(135deg, #8b6c50 0%, #c4a574 50%, #a8845c 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* Total Card */
    .total-card {
      margin-bottom: 20px;
      border-radius: 12px;
      border: none;
      background: linear-gradient(135deg, #8b6c50 0%, #a8845c 50%, #6d5d4b 100%);
      color: white;
      box-shadow: 0 6px 24px rgba(139, 108, 80, 0.25);
      position: relative;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .total-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
      transition: left 0.6s ease;
    }

    .total-card:hover::before {
      left: 100%;
    }

    .total-card:hover {
      box-shadow: 0 12px 40px rgba(139, 108, 80, 0.4);
      transform: translateY(-3px);
    }

    .grand-total {
      padding: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 14px;
    }

    .grand-total mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .grand-total-label {
      font-size: 1.2rem;
      font-weight: 600;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    .grand-total-amount {
      font-size: 2rem;
      font-weight: 700;
      text-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
    }

    /* Action Buttons */
    .action-buttons {
      display: flex;
      gap: 14px;
      justify-content: center;
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1.5px solid rgba(139, 108, 80, 0.12);
    }

    .cancel-btn,
    .confirm-btn {
      height: 48px;
      padding: 0 32px !important;
      font-size: 0.95rem !important;
      font-weight: 700 !important;
      border-radius: 10px;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .cancel-btn {
      border: 2px solid rgba(139, 108, 80, 0.2);
      color: #8b6c50;
      background: transparent;
    }

    .cancel-btn:hover {
      border-color: #c4757d;
      color: #c4757d;
      background-color: rgba(196, 117, 125, 0.08);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(196, 117, 125, 0.15);
    }

    .confirm-btn {
      background: linear-gradient(135deg, #8b6c50 0%, #a8845c 50%, #6d5d4b 100%);
      box-shadow: 0 6px 24px rgba(139, 108, 80, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15);
      position: relative;
      overflow: hidden;
    }

    .confirm-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s ease;
    }

    .confirm-btn:hover::before {
      left: 100%;
    }

    .confirm-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 36px rgba(139, 108, 80, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }

    .confirm-btn:active {
      transform: translateY(-1px);
    }

    .cancel-btn mat-icon,
    .confirm-btn mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .confirm-btn:hover mat-icon {
      transform: translateX(3px) scale(1.1);
    }

    /* Loading State */
    .loading-state {
      text-align: center;
      padding: 60px 20px;
    }

    .loading-state h3 {
      font-size: 1.3rem;
      font-weight: 600;
      color: #2c3e50;
      margin: 24px 0 10px 0;
    }

    .loading-state p {
      font-size: 0.95rem;
      color: #6c757d;
      margin: 0;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .booking-page {
        padding: 12px;
      }

      .progress-steps {
        padding: 14px 10px;
        flex-wrap: wrap;
        gap: 12px;
      }

      .step-line {
        display: none;
      }

      .booking-container {
        padding: 16px;
      }

      .page-title {
        font-size: 1.3rem;
      }

      .hotel-content {
        flex-direction: column;
        padding: 16px;
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
export class BookingSuccessDialog {
  // Expose enum to template
  ReservationType = ReservationType;

  constructor(
    public dialogRef: MatDialogRef<BookingSuccessDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { reservationId: number; totalPrice: number; type: ReservationType; isPackage: boolean }
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  addHotel(): void {
    this.dialogRef.close('add-hotel');
  }

  addFlight(): void {
    this.dialogRef.close('add-flight');
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
