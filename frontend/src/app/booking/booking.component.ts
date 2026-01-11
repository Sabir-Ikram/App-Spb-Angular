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

          <!-- Package Suggestion Banner -->
          <div *ngIf="(hotelData && !flightData) || (flightData && !hotelData)" class="package-suggestion">
            <mat-icon>card_travel</mat-icon>
            <div class="suggestion-content">
              <h3>Complete Your Package!</h3>
              <p *ngIf="flightData && !hotelData">You've selected a flight. Add a hotel to create a complete travel package and save it together.</p>
              <p *ngIf="hotelData && !flightData">You've selected a hotel. Add a flight to create a complete travel package and save it together.</p>
              <button mat-raised-button color="primary" *ngIf="flightData && !hotelData" [routerLink]="['/hotels']" [queryParams]="{city: flightData.destinationCity || flightData.destination, iataCode: flightData.destination, checkIn: flightData.departureDate, checkOut: flightData.returnDate}">
                <mat-icon>hotel</mat-icon>
                Add Hotel
              </button>
              <button mat-raised-button color="primary" *ngIf="hotelData && !flightData" [routerLink]="['/search']" [queryParams]="{to: hotelData.city, packageMode: 'true', depart: hotelData.checkIn, return: hotelData.checkOut}">
                <mat-icon>flight</mat-icon>
                Add Flight
              </button>
            </div>
          </div>

          <!-- Package Confirmation Banner -->
          <div *ngIf="hotelData && flightData" class="package-confirmation">
            <mat-icon>check_circle</mat-icon>
            <div class="confirmation-content">
              <h3>🎉 Complete Package Selected!</h3>
              <p>You're booking both flight and hotel together. This will be saved as a travel package.</p>
            </div>
          </div>

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
      background: linear-gradient(135deg, #f9f7f4 0%, #ede8e0 100%);
      padding: 32px 24px 64px;
    }

    /* Progress Steps */
    .progress-steps {
      max-width: 900px;
      margin: 0 auto 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(to bottom, #ffffff 0%, #fefefe 100%);
      padding: 32px 24px;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(139, 108, 80, 0.12);
      border: 1px solid rgba(139, 108, 80, 0.08);
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
      background: linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 2px solid rgba(139, 108, 80, 0.1);
    }

    .step-icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
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
      font-size: 0.9rem;
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
      width: 80px;
      height: 3px;
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
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(139, 108, 80, 0.15);
      padding: 48px 40px;
      background: linear-gradient(to bottom, #ffffff 0%, #fefefe 100%);
      border: 1px solid rgba(139, 108, 80, 0.08);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
      color: #c4a574;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .page-subtitle {
      font-size: 1.1rem;
      color: #6c757d;
      margin: 0 0 40px 0;
    }

    /* Package Suggestion Banner */
    .package-suggestion {
      background: linear-gradient(135deg, #fff9ed 0%, #ffedd5 100%);
      border-left: 5px solid #c4a574;
      border-radius: 14px;
      padding: 26px 30px;
      margin-bottom: 32px;
      display: flex;
      align-items: center;
      gap: 20px;
      box-shadow: 0 6px 16px rgba(196, 165, 116, 0.25);
      border: 1px solid rgba(196, 165, 116, 0.2);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .package-suggestion:hover {
      box-shadow: 0 8px 24px rgba(196, 165, 116, 0.35);
      transform: translateY(-2px);
    }

    .package-suggestion mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
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
      font-size: 1.4rem;
      font-weight: 700;
      background: linear-gradient(135deg, #8b6c50 0%, #a8845c 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0 0 8px 0;
    }

    .suggestion-content p {
      font-size: 1rem;
      color: #6d5d4b;
      margin: 0 0 16px 0;
      line-height: 1.5;
    }

    .suggestion-content button {
      height: 46px;
      padding: 0 32px !important;
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
      border-left: 5px solid #6d9f71;
      border-radius: 14px;
      padding: 26px 30px;
      margin-bottom: 32px;
      display: flex;
      align-items: center;
      gap: 20px;
      box-shadow: 0 6px 16px rgba(109, 159, 113, 0.25);
      border: 1px solid rgba(109, 159, 113, 0.2);
    }

    .package-confirmation mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
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
      font-size: 1.4rem;
      font-weight: 700;
      color: #2c3e50;
      margin: 0 0 8px 0;
    }

    .confirmation-content p {
      font-size: 1rem;
      color: #495057;
      margin: 0;
    }

    /* Detail Cards */
    .detail-card {
      margin-bottom: 28px;
      border-radius: 14px;
      overflow: hidden;
      border: 2px solid rgba(139, 108, 80, 0.12);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 16px rgba(139, 108, 80, 0.08);
    }

    .detail-card:hover {
      border-color: #c4a574;
      box-shadow: 0 10px 32px rgba(139, 108, 80, 0.2);
      transform: translateY(-3px);
    }

    .card-header {
      background: linear-gradient(135deg, #8b6c50 0%, #a8845c 50%, #6d5d4b 100%);
      color: white;
      padding: 26px 34px;
      display: flex;
      align-items: center;
      gap: 18px;
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
      border-radius: 14px;
      box-shadow: 0 6px 20px rgba(139, 108, 80, 0.2);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .detail-card:hover .hotel-image {
      box-shadow: 0 8px 28px rgba(139, 108, 80, 0.3);
      transform: scale(1.02);
    }

    .rating-overlay {
      position: absolute;
      top: 14px;
      right: 14px;
      background: linear-gradient(135deg, #c4a574 0%, #d4b894 100%);
      color: white;
      padding: 10px 18px;
      border-radius: 22px;
      display: flex;
      align-items: center;
      gap: 7px;
      font-weight: 700;
      font-size: 1.1rem;
      box-shadow: 0 6px 16px rgba(196, 165, 116, 0.4);
      border: 2px solid rgba(255, 255, 255, 0.3);
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
      font-size: 26px;
      width: 26px;
      height: 26px;
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
      gap: 18px;
      margin: 26px 0;
      padding: 22px;
      background: linear-gradient(135deg, #faf8f5 0%, #f5f2ed 100%);
      border-radius: 14px;
      border: 1px solid rgba(139, 108, 80, 0.1);
    }

    .date-box {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px;
      background: linear-gradient(to bottom, #ffffff 0%, #fefefe 100%);
      border-radius: 10px;
      box-shadow: 0 3px 10px rgba(139, 108, 80, 0.08);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .date-box:hover {
      box-shadow: 0 5px 16px rgba(139, 108, 80, 0.15);
      transform: translateY(-2px);
    }

    .date-box mat-icon {
      font-size: 34px;
      width: 34px;
      height: 34px;
      color: #c4a574;
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
      font-size: 1.15rem;
      background: linear-gradient(135deg, #8b6c50 0%, #a8845c 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 700;
    }

    .arrow-icon {
      font-size: 30px;
      width: 30px;
      height: 30px;
      color: #c4a574;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Flight Card */
    .flight-content {
      padding: 32px;
    }

    .flight-route {
      display: flex;
      align-items: center;
      gap: 26px;
      margin-bottom: 34px;
      padding: 26px;
      background: linear-gradient(135deg, #faf8f5 0%, #f5f2ed 100%);
      border-radius: 14px;
      border: 1px solid rgba(139, 108, 80, 0.1);
    }

    .route-point {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 18px;
    }

    .route-point mat-icon {
      font-size: 42px;
      width: 42px;
      height: 42px;
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
      font-size: 0.85rem;
      color: #6c757d;
      font-weight: 600;
    }

    .route-city {
      font-size: 1.45rem;
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
      gap: 10px;
      min-width: 90px;
    }

    .route-line {
      width: 100%;
      height: 3px;
      background: linear-gradient(90deg, #8b6c50 0%, #c4a574 50%, #a8845c 100%);
      border-radius: 2px;
    }

    .plane-icon {
      font-size: 30px;
      width: 30px;
      height: 30px;
      color: #c4a574;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      animation: plane-fly 3s ease-in-out infinite;
    }

    @keyframes plane-fly {
      0%, 100% { transform: translateX(0); }
      50% { transform: translateX(8px); }
    }

    .flight-details {
      padding-top: 24px;
    }

    /* Price Breakdown */
    .price-breakdown {
      margin-top: 26px;
      padding: 26px;
      background: linear-gradient(135deg, #faf8f5 0%, #f5f2ed 100%);
      border-radius: 14px;
      border: 1px solid rgba(139, 108, 80, 0.1);
    }

    .price-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      font-size: 1.05rem;
      color: #6d5d4b;
    }

    .price-row.total {
      margin-top: 18px;
      padding-top: 18px;
      border-top: 3px solid rgba(139, 108, 80, 0.2);
    }

    .total-amount {
      font-size: 2.2rem;
      font-weight: 700;
      background: linear-gradient(135deg, #8b6c50 0%, #c4a574 50%, #a8845c 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* Total Card */
    .total-card {
      margin-bottom: 34px;
      border-radius: 16px;
      border: none;
      background: linear-gradient(135deg, #8b6c50 0%, #a8845c 50%, #6d5d4b 100%);
      color: white;
      box-shadow: 0 8px 32px rgba(139, 108, 80, 0.3);
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
      padding: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
    }

    .grand-total mat-icon {
      font-size: 44px;
      width: 44px;
      height: 44px;
    }

    .grand-total-label {
      font-size: 1.6rem;
      font-weight: 600;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    .grand-total-amount {
      font-size: 2.75rem;
      font-weight: 700;
      text-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
    }

    /* Action Buttons */
    .action-buttons {
      display: flex;
      gap: 20px;
      justify-content: center;
      margin-top: 44px;
      padding-top: 36px;
      border-top: 2px solid rgba(139, 108, 80, 0.12);
    }

    .cancel-btn,
    .confirm-btn {
      height: 62px;
      padding: 0 52px !important;
      font-size: 1.15rem !important;
      font-weight: 700 !important;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 14px;
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
      font-size: 30px;
      width: 30px;
      height: 30px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .confirm-btn:hover mat-icon {
      transform: translateX(4px) scale(1.1);
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
      text-align: center;
      padding: 20px;
      position: relative;
    }

    .close-button {
      position: absolute;
      top: 8px;
      right: 8px;
      color: #6c757d;
      z-index: 10;
    }

    .close-button:hover {
      color: #2c3e50;
      background: rgba(0, 0, 0, 0.05);
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

    .package-suggestion-dialog {
      background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
      border-left: 4px solid #ffc107;
      border-radius: 8px;
      padding: 16px;
      margin: 20px 0;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      text-align: left;
    }

    .package-suggestion-dialog mat-icon {
      color: #f57c00;
      font-size: 32px;
      width: 32px;
      height: 32px;
      flex-shrink: 0;
    }

    .suggestion-text {
      flex: 1;
    }

    .suggestion-text strong {
      color: #e65100;
      font-size: 1.05rem;
      display: block;
      margin-bottom: 6px;
      font-weight: 700;
    }

    .suggestion-text p {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
      line-height: 1.5;
    }

    mat-dialog-actions {
      justify-content: center;
      padding: 24px 0 0;
    }

    .dialog-actions-wrapper {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      justify-content: center;
    }

    .add-btn {
      height: 52px;
      padding: 0 28px !important;
      font-size: 1.05rem !important;
      font-weight: 600 !important;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .add-btn mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
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
