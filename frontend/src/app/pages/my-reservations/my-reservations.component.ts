import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ReservationService } from '../../services/reservation.service';
import { ReservationResponse, ReservationStatus, ReservationType } from '../../models/reservation.model';

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  template: `
    <div class="reservations-page">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-content">
          <div class="hero-text">
            <h1>
              <mat-icon class="hero-icon">confirmation_number</mat-icon>
              My Reservations
            </h1>
            <p class="hero-subtitle">Track and manage all your bookings in one place</p>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="content-container">
        <!-- Filters Section -->
        <div class="filters-section" *ngIf="!loading && reservations.length > 0">
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Filter by Status</mat-label>
            <mat-select [(ngModel)]="filterStatus" (selectionChange)="applyFilters()">
              <mat-option value="ALL">All Reservations</mat-option>
              <mat-option value="PENDING">Pending</mat-option>
              <mat-option value="CONFIRMED">Confirmed</mat-option>
              <mat-option value="CANCELLED">Cancelled</mat-option>
              <mat-option value="COMPLETED">Completed</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Filter by Type</mat-label>
            <mat-select [(ngModel)]="filterType" (selectionChange)="applyFilters()">
              <mat-option value="ALL">All Types</mat-option>
              <mat-option value="FLIGHT">Flight Only</mat-option>
              <mat-option value="HOTEL">Hotel Only</mat-option>
              <mat-option value="BOTH">Flight + Hotel</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Sort By</mat-label>
            <mat-select [(ngModel)]="sortBy" (selectionChange)="applyFilters()">
              <mat-option value="newest">Newest First</mat-option>
              <mat-option value="oldest">Oldest First</mat-option>
              <mat-option value="price-high">Price: High to Low</mat-option>
              <mat-option value="price-low">Price: Low to High</mat-option>
            </mat-select>
          </mat-form-field>

          <div class="results-count">
            <mat-icon>info</mat-icon>
            <span>Showing {{filteredReservations.length}} of {{reservations.length}} reservations</span>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="loading-state">
          <mat-spinner diameter="60"></mat-spinner>
          <h3>Loading Your Reservations</h3>
          <p>Please wait while we fetch your bookings...</p>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && reservations.length === 0" class="empty-state">
          <div class="empty-icon-wrapper">
            <mat-icon class="empty-icon">luggage</mat-icon>
          </div>
          <h2>No Reservations Yet</h2>
          <p>Start planning your trip! Book flights and hotels to see your reservations here.</p>
          <div class="empty-actions">
            <button mat-raised-button color="accent" (click)="navigateToHotels()" class="action-btn">
              <mat-icon>hotel</mat-icon>
              Browse Hotels
            </button>
            <button mat-raised-button color="primary" (click)="navigateToFlights()" class="action-btn">
              <mat-icon>flight</mat-icon>
              Search Flights
            </button>
          </div>
        </div>

        <!-- Reservations Grid -->
        <div class="reservations-grid" *ngIf="!loading && filteredReservations.length > 0">
          <mat-card *ngFor="let reservation of filteredReservations" class="reservation-card">
            <!-- Package Badge -->
            <div *ngIf="reservation.type === 'BOTH'" class="package-badge">
              <mat-icon>card_travel</mat-icon>
              <span>PACKAGE DEAL</span>
            </div>
            
            <!-- Card Header with Type and Status -->
            <div class="card-header">
              <div class="type-section">
                <mat-icon class="type-icon">{{getTypeIcon(reservation.type)}}</mat-icon>
                <div>
                  <h3 class="type-label">{{getTypeLabel(reservation.type)}}</h3>
                  <p class="reservation-id">Confirmation #{{reservation.id}}</p>
                </div>
              </div>
              <mat-chip [class]="'status-chip status-' + reservation.status.toLowerCase()">
                <mat-icon>{{getStatusIcon(reservation.status)}}</mat-icon>
                {{reservation.status}}
              </mat-chip>
            </div>

            <mat-card-content>
              <!-- Flight Details -->
              <div *ngIf="reservation.flightDetails" class="details-card flight-card">
                <div class="details-header">
                  <mat-icon>flight_takeoff</mat-icon>
                  <span>Flight Details</span>
                </div>
                <div class="flight-route">
                  <div class="route-point">
                    <mat-icon>flight_takeoff</mat-icon>
                    <div>
                      <div class="route-label">From</div>
                      <div class="route-city">{{reservation.flightDetails.origin}}</div>
                    </div>
                  </div>
                  <div class="route-arrow">
                    <mat-icon>arrow_forward</mat-icon>
                  </div>
                  <div class="route-point">
                    <mat-icon>flight_land</mat-icon>
                    <div>
                      <div class="route-label">To</div>
                      <div class="route-city">{{reservation.flightDetails.destination}}</div>
                    </div>
                  </div>
                </div>
                <div class="detail-row">
                  <mat-icon>business</mat-icon>
                  <span class="label">Airline:</span>
                  <span class="value">{{reservation.flightDetails.airline}}</span>
                </div>
                <div class="detail-row">
                  <mat-icon>event</mat-icon>
                  <span class="label">Departure:</span>
                  <span class="value">{{reservation.flightDetails.departureDate | date:'medium'}}</span>
                </div>
                <div class="detail-row" *ngIf="reservation.flightDetails.returnDate">
                  <mat-icon>event</mat-icon>
                  <span class="label">Return:</span>
                  <span class="value">{{reservation.flightDetails.returnDate | date:'medium'}}</span>
                </div>
                <div class="detail-row">
                  <mat-icon>people</mat-icon>
                  <span class="label">Passengers:</span>
                  <span class="value">{{reservation.flightDetails.passengers}}</span>
                </div>
                <div class="price-row">
                  <span class="label">Flight Price:</span>
                  <span class="price">\${{reservation.flightDetails.price}}</span>
                </div>
              </div>

              <!-- Hotel Details -->
              <div *ngIf="reservation.hotelDetails" class="details-card hotel-card">
                <div class="details-header">
                  <mat-icon>hotel</mat-icon>
                  <span>Hotel Details</span>
                </div>
                <div class="hotel-main">
                  <img *ngIf="reservation.hotelDetails.imageUrl" 
                       [src]="reservation.hotelDetails.imageUrl" 
                       [alt]="reservation.hotelDetails.hotelName"
                       class="hotel-image">
                  <div class="hotel-info">
                    <h4 class="hotel-name">{{reservation.hotelDetails.hotelName}}</h4>
                    <div class="rating-badge" *ngIf="reservation.hotelDetails.rating">
                      <mat-icon>star</mat-icon>
                      <span>{{reservation.hotelDetails.rating}}/10</span>
                    </div>
                    <p class="hotel-address">
                      <mat-icon>place</mat-icon>
                      {{reservation.hotelDetails.address}}, {{reservation.hotelDetails.city}}
                    </p>
                  </div>
                </div>
                <div class="date-range">
                  <div class="date-box">
                    <mat-icon>login</mat-icon>
                    <div>
                      <div class="date-label">Check-in</div>
                      <div class="date-value">{{reservation.hotelDetails.checkInDate | date:'mediumDate'}}</div>
                    </div>
                  </div>
                  <mat-icon class="arrow-icon">arrow_forward</mat-icon>
                  <div class="date-box">
                    <mat-icon>logout</mat-icon>
                    <div>
                      <div class="date-label">Check-out</div>
                      <div class="date-value">{{reservation.hotelDetails.checkOutDate | date:'mediumDate'}}</div>
                    </div>
                  </div>
                </div>
                <div class="detail-row">
                  <mat-icon>meeting_room</mat-icon>
                  <span class="label">Rooms:</span>
                  <span class="value">{{reservation.hotelDetails.roomCount}}</span>
                </div>
                <div class="detail-row">
                  <mat-icon>nights_stay</mat-icon>
                  <span class="label">Nights:</span>
                  <span class="value">{{reservation.hotelDetails.nights}}</span>
                </div>
                <div class="price-row">
                  <span class="label">Hotel Price:</span>
                  <span class="price">\${{reservation.hotelDetails.totalPrice}}</span>
                </div>
              </div>

              <!-- Total Price -->
              <div class="total-section">
                <div class="total-row">
                  <mat-icon>payments</mat-icon>
                  <span class="total-label">Total Amount:</span>
                  <span class="total-price">\${{reservation.totalPrice}}</span>
                </div>
              </div>

              <!-- Reservation Date -->
              <div class="reservation-meta">
                <mat-icon>schedule</mat-icon>
                <span>Booked on {{reservation.createdAt | date:'medium'}}</span>
              </div>
            </mat-card-content>

            <!-- Card Actions -->
            <mat-card-actions class="card-actions">
              <button mat-button color="primary" class="action-btn-small">
                <mat-icon>visibility</mat-icon>
                View Details
              </button>
              <button mat-button color="warn" 
                      *ngIf="reservation.status === 'PENDING' || reservation.status === 'CONFIRMED'"
                      class="action-btn-small">
                <mat-icon>cancel</mat-icon>
                Cancel Booking
              </button>
            </mat-card-actions>
          </mat-card>
        </div>

        <!-- No Results After Filter -->
        <div *ngIf="!loading && reservations.length > 0 && filteredReservations.length === 0" class="no-results">
          <mat-icon class="no-results-icon">search_off</mat-icon>
          <h3>No Matching Reservations</h3>
          <p>Try adjusting your filters to see more results</p>
          <button mat-raised-button color="primary" (click)="clearFilters()">
            <mat-icon>clear_all</mat-icon>
            Clear All Filters
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reservations-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    /* Hero Section */
    .hero-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 80px 24px 60px;
      margin-bottom: 40px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .hero-content {
      max-width: 1200px;
      margin: 0 auto;
    }

    .hero-text h1 {
      font-size: 3rem;
      font-weight: 700;
      color: white;
      margin: 0 0 16px 0;
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .hero-icon {
      font-size: 56px;
      width: 56px;
      height: 56px;
    }

    .hero-subtitle {
      font-size: 1.3rem;
      color: rgba(255, 255, 255, 0.95);
      margin: 0;
    }

    /* Content Container */
    .content-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px 64px;
    }

    /* Filters Section */
    .filters-section {
      background: white;
      padding: 24px;
      border-radius: 16px;
      margin-bottom: 32px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: center;
    }

    .filter-field {
      flex: 1;
      min-width: 200px;
    }

    .results-count {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      background: linear-gradient(135deg, #e3f2fd 0%, #e1f5fe 100%);
      border-radius: 20px;
      font-weight: 600;
      color: #1976d2;
      font-size: 0.95rem;
    }

    .results-count mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
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

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 80px 24px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    }

    .empty-icon-wrapper {
      margin-bottom: 24px;
      animation: float 3s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    .empty-icon {
      font-size: 120px;
      width: 120px;
      height: 120px;
      color: #dee2e6;
    }

    .empty-state h2 {
      font-size: 2.25rem;
      font-weight: 700;
      color: #2c3e50;
      margin: 0 0 16px 0;
    }

    .empty-state p {
      font-size: 1.15rem;
      color: #6c757d;
      margin: 0 0 32px 0;
    }

    .empty-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .action-btn {
      height: 52px;
      padding: 0 32px !important;
      font-size: 1.05rem !important;
      font-weight: 600 !important;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    /* Reservations Grid */
    .reservations-grid {
      display: grid;
      gap: 24px;
    }

    .reservation-card {
      border-radius: 16px;
      overflow: hidden;
      border: 2px solid #e9ecef;
      transition: all 0.3s ease;
      position: relative;
    }

    .reservation-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
      border-color: #667eea;
    }

    /* Package Badge */
    .package-badge {
      position: absolute;
      top: 16px;
      right: 16px;
      background: linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      font-size: 0.75rem;
      letter-spacing: 0.5px;
      box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
      z-index: 10;
      animation: pulse-badge 2s ease-in-out infinite;
    }

    .package-badge mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    @keyframes pulse-badge {
      0%, 100% {
        transform: scale(1);
        box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
      }
      50% {
        transform: scale(1.05);
        box-shadow: 0 6px 16px rgba(255, 107, 107, 0.6);
      }
    }

    /* Card Header */
    .card-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 24px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .type-section {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .type-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
    }

    .type-label {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 4px 0;
    }

    .reservation-id {
      font-size: 0.9rem;
      opacity: 0.9;
      margin: 0;
    }

    .status-chip {
      padding: 8px 20px;
      font-size: 0.9rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
      border-radius: 20px;
    }

    .status-chip mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .status-pending {
      background: #ffc107;
      color: #2c3e50;
    }

    .status-confirmed {
      background: #4caf50;
      color: white;
    }

    .status-cancelled {
      background: #f44336;
      color: white;
    }

    .status-completed {
      background: #2196f3;
      color: white;
    }

    /* Card Content */
    mat-card-content {
      padding: 32px !important;
    }

    .details-card {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 20px;
    }

    .details-header {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 1.25rem;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 2px solid #dee2e6;
    }

    .details-header mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: #667eea;
    }

    /* Flight Route */
    .flight-route {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 20px;
      background: white;
      border-radius: 12px;
      margin-bottom: 20px;
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
      color: #667eea;
    }

    .route-label {
      font-size: 0.85rem;
      color: #6c757d;
      font-weight: 600;
    }

    .route-city {
      font-size: 1.25rem;
      color: #2c3e50;
      font-weight: 700;
    }

    .route-arrow mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: #667eea;
    }

    /* Detail Rows */
    .detail-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid #dee2e6;
    }

    .detail-row:last-of-type {
      border-bottom: none;
    }

    .detail-row mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #667eea;
    }

    .detail-row .label {
      font-weight: 600;
      color: #6c757d;
      min-width: 100px;
    }

    .detail-row .value {
      color: #2c3e50;
      font-weight: 500;
    }

    .price-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: white;
      border-radius: 8px;
      margin-top: 16px;
      font-size: 1.1rem;
    }

    .price-row .label {
      font-weight: 600;
      color: #6c757d;
    }

    .price-row .price {
      font-size: 1.3rem;
      font-weight: 700;
      color: #667eea;
    }

    /* Hotel Card Specific */
    .hotel-main {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
    }

    .hotel-image {
      width: 180px;
      height: 180px;
      object-fit: cover;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .hotel-info {
      flex: 1;
    }

    .hotel-name {
      font-size: 1.4rem;
      font-weight: 700;
      color: #2c3e50;
      margin: 0 0 12px 0;
    }

    .rating-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
      color: #2c3e50;
      padding: 6px 16px;
      border-radius: 16px;
      font-weight: 700;
      margin-bottom: 12px;
    }

    .rating-badge mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .hotel-address {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #6c757d;
      margin: 0;
    }

    .hotel-address mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .date-range {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
    }

    .date-box {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: white;
      border-radius: 12px;
    }

    .date-box mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: #667eea;
    }

    .date-label {
      font-size: 0.85rem;
      color: #6c757d;
      font-weight: 600;
    }

    .date-value {
      font-size: 1rem;
      color: #2c3e50;
      font-weight: 700;
    }

    .arrow-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: #667eea;
    }

    /* Total Section */
    .total-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 20px;
    }

    .total-row {
      display: flex;
      align-items: center;
      gap: 16px;
      color: white;
    }

    .total-row mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .total-label {
      flex: 1;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .total-price {
      font-size: 2rem;
      font-weight: 700;
    }

    /* Reservation Meta */
    .reservation-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #6c757d;
      font-size: 0.9rem;
    }

    .reservation-meta mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    /* Card Actions */
    .card-actions {
      padding: 16px 32px !important;
      background: #f8f9fa;
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .action-btn-small {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600 !important;
    }

    /* No Results */
    .no-results {
      text-align: center;
      padding: 80px 24px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    }

    .no-results-icon {
      font-size: 100px;
      width: 100px;
      height: 100px;
      color: #dee2e6;
      margin-bottom: 24px;
    }

    .no-results h3 {
      font-size: 1.75rem;
      font-weight: 600;
      color: #2c3e50;
      margin: 0 0 12px 0;
    }

    .no-results p {
      font-size: 1.1rem;
      color: #6c757d;
      margin: 0 0 24px 0;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .hero-text h1 {
        font-size: 2rem;
      }

      .hero-icon {
        font-size: 40px;
        width: 40px;
        height: 40px;
      }

      .filters-section {
        flex-direction: column;
      }

      .filter-field {
        width: 100%;
      }

      .flight-route {
        flex-direction: column;
      }

      .hotel-main {
        flex-direction: column;
      }

      .hotel-image {
        width: 100%;
        height: 200px;
      }

      .date-range {
        flex-direction: column;
      }

      .arrow-icon {
        transform: rotate(90deg);
      }

      .card-actions {
        flex-direction: column;
      }

      .action-btn-small {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class MyReservationsComponent implements OnInit {
  reservations: ReservationResponse[] = [];
  filteredReservations: ReservationResponse[] = [];
  loading = true;
  
  // Filter properties
  filterStatus: string = 'ALL';
  filterType: string = 'ALL';
  sortBy: string = 'newest';

  constructor(
    private reservationService: ReservationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.loading = true;
    this.reservationService.getUserReservations().subscribe({
      next: (data) => {
        this.reservations = data;
        this.filteredReservations = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading reservations:', error);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.reservations];

    // Filter by status
    if (this.filterStatus !== 'ALL') {
      filtered = filtered.filter(r => r.status === this.filterStatus);
    }

    // Filter by type
    if (this.filterType !== 'ALL') {
      filtered = filtered.filter(r => r.type === this.filterType);
    }

    // Sort
    switch (this.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'price-high':
        filtered.sort((a, b) => b.totalPrice - a.totalPrice);
        break;
      case 'price-low':
        filtered.sort((a, b) => a.totalPrice - b.totalPrice);
        break;
    }

    this.filteredReservations = filtered;
  }

  clearFilters(): void {
    this.filterStatus = 'ALL';
    this.filterType = 'ALL';
    this.sortBy = 'newest';
    this.applyFilters();
  }

  navigateToHotels(): void {
    this.router.navigate(['/hotels']);
  }

  navigateToFlights(): void {
    this.router.navigate(['/flights']);
  }

  getTypeLabel(type: ReservationType): string {
    switch (type) {
      case ReservationType.FLIGHT:
        return 'Flight Reservation';
      case ReservationType.HOTEL:
        return 'Hotel Reservation';
      case ReservationType.BOTH:
        return 'Flight + Hotel Package';
      default:
        return 'Reservation';
    }
  }

  getTypeIcon(type: ReservationType): string {
    switch (type) {
      case ReservationType.FLIGHT:
        return 'flight';
      case ReservationType.HOTEL:
        return 'hotel';
      case ReservationType.BOTH:
        return 'card_travel';
      default:
        return 'event';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'schedule';
      case 'CONFIRMED':
        return 'check_circle';
      case 'CANCELLED':
        return 'cancel';
      case 'COMPLETED':
        return 'done_all';
      default:
        return 'info';
    }
  }
}
