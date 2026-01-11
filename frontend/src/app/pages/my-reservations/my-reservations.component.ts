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
          <mat-card *ngFor="let reservation of filteredReservations" class="reservation-card" [attr.data-type]="reservation.type">
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
      background: linear-gradient(135deg, #f9f7f4 0%, #ede8e0 100%);
    }

    /* Hero Section */
    .hero-section {
      background: linear-gradient(135deg, #d4722c 0%, #8b6c50 35%, #c4a574 65%, #d4722c 100%);
      padding: 70px 24px 50px;
      margin-bottom: 40px;
      box-shadow: 0 12px 40px rgba(212, 114, 44, 0.35);
      position: relative;
      overflow: hidden;
    }

    .hero-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
      animation: shimmer 3s ease-in-out infinite;
    }

    @keyframes shimmer {
      0%, 100% { left: -100%; }
      50% { left: 100%; }
    }

    .hero-content {
      max-width: 1200px;
      margin: 0 auto;
      position: relative;
      z-index: 2;
    }

    .hero-text h1 {
      font-size: 3rem;
      font-weight: 700;
      color: white;
      margin: 0 0 16px 0;
      display: flex;
      align-items: center;
      gap: 20px;
      text-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
      letter-spacing: -0.01em;
    }

    .hero-icon {
      font-size: 56px;
      width: 56px;
      height: 56px;
      animation: float 3s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }

    .hero-subtitle {
      font-size: 1.3rem;
      color: rgba(255, 255, 255, 0.95);
      margin: 0;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    /* Content Container */
    .content-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px 64px;
    }

    /* Filters Section */
    .filters-section {
      background: linear-gradient(to bottom, #ffffff 0%, #fefefe 100%);
      padding: 28px;
      border-radius: 16px;
      margin-bottom: 32px;
      box-shadow: 0 6px 24px rgba(139, 108, 80, 0.12);
      border: 1px solid rgba(139, 108, 80, 0.08);
      display: flex;
      flex-wrap: wrap;
      gap: 18px;
      align-items: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .filters-section:hover {
      box-shadow: 0 8px 32px rgba(139, 108, 80, 0.18);
    }

    .filter-field {
      flex: 1;
      min-width: 200px;
    }

    ::ng-deep .filter-field .mat-mdc-text-field-wrapper {
      background: linear-gradient(135deg, #ffffff 0%, #fdfcfb 100%);
      border-radius: 12px;
      transition: all 0.3s ease;
    }

    ::ng-deep .filter-field .mat-mdc-notched-outline {
      border-color: rgba(139, 108, 80, 0.2);
      transition: all 0.3s ease;
    }

    ::ng-deep .filter-field.mat-focused .mat-mdc-notched-outline {
      border-color: #8b6c50 !important;
      border-width: 2px !important;
    }

    ::ng-deep .filter-field .mat-mdc-floating-label {
      color: #6d5d4b;
      font-weight: 600;
    }

    ::ng-deep .filter-field.mat-focused .mat-mdc-floating-label {
      color: #8b6c50 !important;
    }

    .results-count {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 24px;
      background: linear-gradient(135deg, #fff4e6 0%, #ffe0b2 100%);
      border-radius: 24px;
      font-weight: 600;
      color: #d4722c;
      font-size: 0.95rem;
      border: 1px solid rgba(212, 114, 44, 0.25);
      box-shadow: 0 4px 12px rgba(212, 114, 44, 0.2);
    }

    .results-count mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
      color: #c4a574;
    }

    /* Loading State */
    .loading-state {
      text-align: center;
      padding: 100px 24px;
      background: linear-gradient(to bottom, #ffffff 0%, #fefefe 100%);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(139, 108, 80, 0.15);
      border: 1px solid rgba(139, 108, 80, 0.08);
    }

    .loading-state h3 {
      font-size: 1.75rem;
      font-weight: 700;
      background: linear-gradient(135deg, #8b6c50 0%, #a8845c 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 32px 0 12px 0;
    }

    .loading-state p {
      font-size: 1.1rem;
      color: #6d5d4b;
      margin: 0;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 80px 24px;
      background: linear-gradient(to bottom, #ffffff 0%, #fefefe 100%);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(139, 108, 80, 0.15);
      border: 1px solid rgba(139, 108, 80, 0.08);
    }

    .empty-icon-wrapper {
      margin-bottom: 24px;
      animation: float-empty 3s ease-in-out infinite;
    }

    @keyframes float-empty {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    .empty-icon {
      font-size: 120px;
      width: 120px;
      height: 120px;
      color: rgba(196, 165, 116, 0.3);
    }

    .empty-state h2 {
      font-size: 2.25rem;
      font-weight: 700;
      background: linear-gradient(135deg, #8b6c50 0%, #a8845c 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0 0 16px 0;
    }

    .empty-state p {
      font-size: 1.15rem;
      color: #6d5d4b;
      margin: 0 0 32px 0;
      line-height: 1.6;
    }

    .empty-actions {
      display: flex;
      gap: 18px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .action-btn {
      height: 56px;
      padding: 0 36px !important;
      font-size: 1.05rem !important;
      font-weight: 700 !important;
      display: flex;
      align-items: center;
      gap: 12px;
      background: linear-gradient(135deg, #8b6c50 0%, #a8845c 50%, #6d5d4b 100%) !important;
      border-radius: 12px !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      text-transform: uppercase !important;
      letter-spacing: 0.03em !important;
      box-shadow: 0 6px 20px rgba(139, 108, 80, 0.3) !important;
      position: relative;
      overflow: hidden;
    }

    .action-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s ease;
    }

    .action-btn:hover::before {
      left: 100%;
    }

    .action-btn:hover {
      transform: translateY(-3px) !important;
      box-shadow: 0 10px 32px rgba(139, 108, 80, 0.4) !important;
    }

    /* Reservations Grid */
    .reservations-grid {
      display: grid;
      gap: 32px;
    }

    .reservation-card {
      border-radius: 20px;
      overflow: hidden;
      border: 3px solid;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      background: linear-gradient(135deg, #ffffff 0%, #fefefe 50%, #fcfcfc 100%);
      max-width: 100%;
      transform-origin: center;
    }

    .reservation-card::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: 20px;
      opacity: 0;
      transition: opacity 0.4s ease;
      pointer-events: none;
      z-index: 1;
    }

    .reservation-card[data-type="FLIGHT"] {
      border-color: rgba(139, 108, 80, 0.35);
      box-shadow: 
        0 8px 32px rgba(139, 108, 80, 0.18),
        0 2px 8px rgba(139, 108, 80, 0.12),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
    }

    .reservation-card[data-type="FLIGHT"]::after {
      box-shadow: inset 0 0 80px rgba(139, 108, 80, 0.15);
    }

    .reservation-card[data-type="HOTEL"] {
      border-color: rgba(212, 114, 44, 0.35);
      box-shadow: 
        0 8px 32px rgba(212, 114, 44, 0.18),
        0 2px 8px rgba(212, 114, 44, 0.12),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
    }

    .reservation-card[data-type="HOTEL"]::after {
      box-shadow: inset 0 0 80px rgba(212, 114, 44, 0.15);
    }

    .reservation-card[data-type="BOTH"] {
      border-color: rgba(196, 165, 116, 0.35);
      box-shadow: 
        0 8px 32px rgba(196, 165, 116, 0.18),
        0 2px 8px rgba(196, 165, 116, 0.12),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
    }

    .reservation-card[data-type="BOTH"]::after {
      box-shadow: inset 0 0 80px rgba(196, 165, 116, 0.15);
    }

    .reservation-card:hover {
      transform: translateY(-8px) scale(1.015);
    }

    .reservation-card:hover::after {
      opacity: 1;
    }

    .reservation-card[data-type="FLIGHT"]:hover {
      box-shadow: 
        0 24px 64px rgba(139, 108, 80, 0.35),
        0 12px 32px rgba(139, 108, 80, 0.2),
        0 0 0 1px rgba(139, 108, 80, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);
      border-color: rgba(139, 108, 80, 0.7);
    }

    .reservation-card[data-type="HOTEL"]:hover {
      box-shadow: 
        0 24px 64px rgba(212, 114, 44, 0.35),
        0 12px 32px rgba(212, 114, 44, 0.2),
        0 0 0 1px rgba(212, 114, 44, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);
      border-color: rgba(212, 114, 44, 0.7);
    }

    .reservation-card[data-type="BOTH"]:hover {
      box-shadow: 
        0 24px 64px rgba(196, 165, 116, 0.35),
        0 12px 32px rgba(196, 165, 116, 0.2),
        0 0 0 1px rgba(196, 165, 116, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);
      border-color: rgba(196, 165, 116, 0.7);
    }

    /* Package Badge */
    .package-badge {
      position: absolute;
      top: 14px;
      right: 14px;
      background: linear-gradient(135deg, #d4a574 0%, #c4722c 100%);
      color: white;
      padding: 10px 20px;
      border-radius: 24px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 700;
      font-size: 0.8rem;
      letter-spacing: 0.5px;
      box-shadow: 0 6px 20px rgba(212, 165, 116, 0.5);
      z-index: 10;
      animation: pulse-badge 2s ease-in-out infinite;
      border: 2px solid rgba(255, 255, 255, 0.4);
    }

    .package-badge mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    @keyframes pulse-badge {
      0%, 100% {
        transform: scale(1);
        box-shadow: 0 6px 16px rgba(196, 165, 116, 0.4);
      }
      50% {
        transform: scale(1.05);
        box-shadow: 0 8px 24px rgba(196, 165, 116, 0.6);
      }
    }

    /* Card Header */
    .card-header {
      color: white;
      padding: 28px 34px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }

    .card-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
      animation: headerShimmer 3s ease-in-out infinite;
      z-index: 1;
    }

    @keyframes headerShimmer {
      0%, 100% { left: -100%; }
      50% { left: 100%; }
    }

    .card-header > * {
      position: relative;
      z-index: 2;
    }

    .reservation-card[data-type="FLIGHT"] .card-header {
      background: linear-gradient(135deg, #8b6c50 0%, #7a6148 50%, #6d5d4b 100%);
    }

    .reservation-card[data-type="HOTEL"] .card-header {
      background: linear-gradient(135deg, #d4722c 0%, #ca6526 50%, #c45a1c 100%);
    }

    .reservation-card[data-type="BOTH"] .card-header {
      background: linear-gradient(135deg, #8b6c50 0%, #a8845c 33%, #c4a574 66%, #d4722c 100%);
    }

    .card-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
      transition: left 0.6s ease;
    }

    .reservation-card:hover .card-header::before {
      left: 100%;
    }

    .type-section {
      display: flex;
      align-items: center;
      gap: 18px;
    }

    .type-icon {
      width: 52px;
      height: 52px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(15px);
      box-shadow: 
        0 4px 16px rgba(0, 0, 0, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;
      font-size: 28px;
      color: white;
    }

    .reservation-card:hover .type-icon {
      transform: scale(1.15) rotate(10deg);
      box-shadow: 
        0 6px 20px rgba(0, 0, 0, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.4);
    }

    .type-label {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0 0 6px 0;
      letter-spacing: 0.02em;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      line-height: 1.2;
    }

    .reservation-id {
      font-size: 0.95rem;
      opacity: 0.95;
      margin: 0;
      font-weight: 500;
      text-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    }

    .status-chip {
      padding: 10px 24px;
      font-size: 0.9rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
      border-radius: 24px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .status-chip mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .status-pending {
      background: linear-gradient(135deg, #ffb74d 0%, #ff9800 100%);
      color: #2d2416;
      box-shadow: 0 4px 16px rgba(255, 152, 0, 0.35);
      font-weight: 700;
    }

    .status-confirmed {
      background: linear-gradient(135deg, #81c784 0%, #66bb6a 100%);
      color: white;
      box-shadow: 0 4px 16px rgba(102, 187, 106, 0.35);
    }

    .status-cancelled {
      background: linear-gradient(135deg, #e57373 0%, #ef5350 100%);
      color: white;
      box-shadow: 0 4px 16px rgba(239, 83, 80, 0.35);
    }

    .status-completed {
      background: linear-gradient(135deg, #64b5f6 0%, #42a5f5 100%);
      color: white;
      box-shadow: 0 4px 16px rgba(66, 165, 245, 0.35);
    }

    /* Card Content */
    mat-card-content {
      padding: 32px !important;
      background: linear-gradient(to bottom, #fafafa 0%, #ffffff 100%);
    }

    .details-card {
      border-radius: 16px;
      padding: 28px;
      margin-bottom: 24px;
      border: 2px solid;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .details-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      opacity: 0.6;
    }

    .flight-card {
      background: linear-gradient(135deg, #f5f2ed 0%, #f9f7f3 50%, #faf8f5 100%);
      border-color: rgba(139, 108, 80, 0.25);
      box-shadow: 
        0 4px 16px rgba(139, 108, 80, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
    }

    .flight-card::before {
      background: linear-gradient(90deg, #8b6c50 0%, #a8845c 50%, #8b6c50 100%);
    }

    .flight-card:hover {
      border-color: rgba(139, 108, 80, 0.4);
      box-shadow: 
        0 8px 24px rgba(139, 108, 80, 0.12),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);
      transform: translateX(4px);
    }

    .hotel-card {
      background: linear-gradient(135deg, #fff4e6 0%, #fff9ed 50%, #ffe8cc 100%);
      border-color: rgba(212, 114, 44, 0.25);
      box-shadow: 
        0 4px 16px rgba(212, 114, 44, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
    }

    .hotel-card::before {
      background: linear-gradient(90deg, #d4722c 0%, #e89352 50%, #d4722c 100%);
    }

    .hotel-card:hover {
      border-color: rgba(212, 114, 44, 0.4);
      box-shadow: 
        0 8px 24px rgba(212, 114, 44, 0.12),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);
      transform: translateX(4px);
    }

    .details-card:hover {
      box-shadow: 0 6px 20px rgba(139, 108, 80, 0.12);
      transform: translateY(-2px);
    }

    .details-header {
      display: flex;
      align-items: center;
      gap: 14px;
      font-size: 1.2rem;
      font-weight: 600;
      color: #2d2416;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 2px solid;
    }

    .flight-card .details-header {
      border-bottom-color: rgba(139, 108, 80, 0.3);
    }

    .hotel-card .details-header {
      border-bottom-color: rgba(212, 114, 44, 0.3);
    }

    .flight-card .details-header mat-icon {
      font-size: 30px;
      width: 30px;
      height: 30px;
      color: #8b6c50;
    }

    .hotel-card .details-header mat-icon {
      font-size: 30px;
      width: 30px;
      height: 30px;
      color: #d4722c;
    }

    /* Flight Route */
    .flight-route {
      display: flex;
      align-items: center;
      gap: 24px;
      padding: 24px;
      background: linear-gradient(135deg, #ffffff 0%, #fdfcfb 50%, #faf8f5 100%);
      border-radius: 16px;
      margin-bottom: 24px;
      box-shadow: 
        0 6px 20px rgba(139, 108, 80, 0.12),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
      border: 2px solid rgba(139, 108, 80, 0.2);
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .flight-route::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(90deg, transparent, rgba(139, 108, 80, 0.03), transparent);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .flight-route:hover {
      border-color: rgba(139, 108, 80, 0.35);
      box-shadow: 
        0 8px 28px rgba(139, 108, 80, 0.18),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);
    }

    .flight-route:hover::before {
      opacity: 1;
    }

    .route-point {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .route-point mat-icon {
      width: 48px;
      height: 48px;
      padding: 10px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.8);
      box-shadow: 
        0 4px 12px rgba(0, 0, 0, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 1);
      transition: all 0.3s ease;
    }

    .flight-route:hover .route-point mat-icon {
      transform: scale(1.1);
      box-shadow: 
        0 6px 16px rgba(0, 0, 0, 0.12),
        inset 0 1px 0 rgba(255, 255, 255, 1);
    }

    .route-point:first-child mat-icon {
      font-size: 36px;
      color: #66bb6a;
      border: 2px solid rgba(102, 187, 106, 0.3);
    }

    .route-point:last-child mat-icon {
      font-size: 36px;
      color: #ef5350;
      border: 2px solid rgba(239, 83, 80, 0.3);
    }

    .route-label {
      font-size: 0.85rem;
      color: #6d5d4b;
      font-weight: 600;
    }

    .route-city {
      font-size: 1.4rem;
      background: linear-gradient(135deg, #8b6c50 0%, #a8845c 50%, #c4a574 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 700;
      letter-spacing: 0.01em;
      text-shadow: 0 2px 8px rgba(139, 108, 80, 0.15);
      line-height: 1.3;
    }

    .route-code {
      font-size: 0.9rem;
      color: #8b6c50;
      font-weight: 600;
      background: rgba(139, 108, 80, 0.08);
      padding: 4px 10px;
      border-radius: 8px;
      margin-top: 4px;
      display: inline-block;
    }

    .route-arrow {
      flex-shrink: 0;
    }

    .route-arrow mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #c4a574;
      animation: arrow-pulse 2s ease-in-out infinite;
      filter: drop-shadow(0 2px 4px rgba(196, 165, 116, 0.3));
    }

    @keyframes arrow-pulse {
      0%, 100% { transform: translateX(0); opacity: 0.7; }
      50% { transform: translateX(5px); opacity: 1; }
    }

    /* Detail Rows */
    .detail-row {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 0;
      border-bottom: 1px solid rgba(139, 108, 80, 0.1);
    }

    .detail-row:last-of-type {
      border-bottom: none;
    }

    .flight-card .detail-row mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
      color: #8b6c50;
    }

    .hotel-card .detail-row mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
      color: #d4722c;
    }

    .detail-row .label {
      font-weight: 600;
      color: #6d5d4b;
      min-width: 100px;
    }

    .detail-row .value {
      color: #2d2416;
      font-weight: 500;
    }

    .price-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 18px;
      background: linear-gradient(to bottom, #ffffff 0%, #fefefe 100%);
      border-radius: 10px;
      margin-top: 18px;
      font-size: 1.1rem;
      box-shadow: 0 3px 12px rgba(139, 108, 80, 0.08);
    }

    .price-row .label {
      font-weight: 600;
      color: #6d5d4b;
    }

    .flight-card .price-row .price {
      font-size: 1.4rem;
      font-weight: 700;
      background: linear-gradient(135deg, #8b6c50 0%, #6d5d4b 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hotel-card .price-row .price {
      font-size: 1.4rem;
      font-weight: 700;
      background: linear-gradient(135deg, #d4722c 0%, #c45a1c 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* Hotel Card Specific */
    .hotel-main {
      display: flex;
      gap: 24px;
      margin-bottom: 22px;
    }

    .hotel-image {
      width: 180px;
      height: 180px;
      object-fit: cover;
      border-radius: 14px;
      box-shadow: 0 6px 20px rgba(139, 108, 80, 0.2);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .details-card:hover .hotel-image {
      transform: scale(1.03);
      box-shadow: 0 8px 28px rgba(139, 108, 80, 0.3);
    }

    .hotel-info {
      flex: 1;
    }

    .hotel-name {
      font-size: 1.4rem;
      font-weight: 700;
      color: #2d2416;
      margin: 0 0 12px 0;
    }

    .rating-badge {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      background: linear-gradient(135deg, #fdb924 0%, #f7931e 100%);
      color: white;
      padding: 8px 18px;
      border-radius: 18px;
      font-weight: 700;
      margin-bottom: 12px;
      box-shadow: 0 4px 16px rgba(253, 185, 36, 0.4);
      border: 2px solid rgba(255, 255, 255, 0.3);
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
      color: #6d5d4b;
      margin: 0;
    }

    .hotel-address mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #c4a574;
    }

    .date-range {
      display: flex;
      align-items: center;
      gap: 18px;
      margin-bottom: 22px;
    }

    .date-box {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 18px;
      background: linear-gradient(to bottom, #ffffff 0%, #fefefe 100%);
      border-radius: 14px;
      box-shadow: 0 3px 12px rgba(139, 108, 80, 0.08);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .date-box:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 16px rgba(139, 108, 80, 0.15);
    }

    .date-box:first-child mat-icon {
      font-size: 30px;
      width: 30px;
      height: 30px;
      color: #66bb6a;
    }

    .date-box:last-child mat-icon {
      font-size: 30px;
      width: 30px;
      height: 30px;
      color: #ef5350;
    }

    .date-label {
      font-size: 0.85rem;
      color: #6d5d4b;
      font-weight: 600;
    }

    .date-value {
      font-size: 1rem;
      background: linear-gradient(135deg, #d4722c 0%, #c45a1c 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 700;
    }

    .arrow-icon {
      font-size: 26px;
      width: 26px;
      height: 26px;
      color: #d4722c;
    }

    .arrow-icon {
      font-size: 26px;
      width: 26px;
      height: 26px;
      color: #c4a574;
    }

    /* Total Section */
    .total-section {
      border-radius: 16px;
      padding: 30px 34px;
      margin-bottom: 24px;
      box-shadow: 
        0 12px 40px rgba(0, 0, 0, 0.25),
        0 4px 12px rgba(0, 0, 0, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
      position: relative;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .total-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
      animation: totalShimmer 3s ease-in-out infinite;
    }

    @keyframes totalShimmer {
      0%, 100% { left: -100%; }
      50% { left: 100%; }
    }

    .reservation-card[data-type="FLIGHT"] .total-section {
      background: linear-gradient(135deg, #8b6c50 0%, #7a6148 50%, #6d5d4b 100%);
    }

    .reservation-card[data-type="HOTEL"] .total-section {
      background: linear-gradient(135deg, #d4722c 0%, #ca6526 50%, #c45a1c 100%);
    }

    .reservation-card[data-type="BOTH"] .total-section {
      background: linear-gradient(135deg, #8b6c50 0%, #a8845c 33%, #c4a574 66%, #d4722c 100%);
    }

    .total-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
      animation: shimmer-total 3s ease-in-out infinite;
    }

    @keyframes shimmer-total {
      0%, 100% { left: -100%; }
      50% { left: 100%; }
    }

    .total-row {
      display: flex;
      align-items: center;
      gap: 18px;
      color: white;
      position: relative;
      z-index: 2;
    }

    .total-row mat-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
    }

    .total-label {
      flex: 1;
      font-size: 1.25rem;
      font-weight: 600;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .total-price {
      font-size: 2.2rem;
      font-weight: 700;
      text-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
    }

    /* Reservation Meta */
    .reservation-meta {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #6d5d4b;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .reservation-meta mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #c4a574;
    }

    /* Card Actions */
    .card-actions {
      padding: 20px 34px !important;
      background: linear-gradient(135deg, #faf8f5 0%, #f5f2ed 100%);
      display: flex;
      gap: 14px;
      flex-wrap: wrap;
      border-top: 1px solid rgba(139, 108, 80, 0.1);
    }

    .action-btn-small {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 600 !important;
      padding: 0 20px !important;
      height: 44px !important;
      border-radius: 10px !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }

    .action-btn-small:hover {
      transform: translateY(-2px);
    }

    /* No Results */
    .no-results {
      text-align: center;
      padding: 80px 24px;
      background: linear-gradient(to bottom, #ffffff 0%, #fefefe 100%);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(139, 108, 80, 0.15);
      border: 1px solid rgba(139, 108, 80, 0.08);
    }

    .no-results-icon {
      font-size: 100px;
      width: 100px;
      height: 100px;
      color: rgba(196, 165, 116, 0.3);
      margin-bottom: 24px;
    }

    .no-results h3 {
      font-size: 1.75rem;
      font-weight: 700;
      background: linear-gradient(135deg, #8b6c50 0%, #a8845c 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0 0 12px 0;
    }

    .no-results p {
      font-size: 1.1rem;
      color: #6d5d4b;
      margin: 0 0 24px 0;
      line-height: 1.6;
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
