import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { HotelService, Hotel } from '../../services/hotel.service';
import { DestinationService } from '../../services/destination.service';
import { Router, ActivatedRoute } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-hotel-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule
  ],
  template: `
    <div class="hotel-search-premium">
      <!-- Luxury Hero with Background -->
      <div class="luxury-hero">
        <div class="hero-background"></div>
        <div class="hero-gradient-overlay"></div>
        <div class="hero-content-container">
          <div class="hero-badge-luxury">
            <mat-icon>apartment</mat-icon>
            <span>Luxury Accommodations</span>
          </div>
          <h1 class="hero-heading-luxury">Experience Extraordinary Stays</h1>
          <p class="hero-text-luxury">Discover handpicked hotels and resorts across the globe • Powered by Booking.com with 2,800+ premium properties</p>
          
          <!-- Inline Luxury Search Card -->
          <div class="luxury-search-inline">
            <form (submit)="onSearch()">
              <div class="search-fields-grid">
                <div class="field-container">
                  <mat-form-field appearance="outline" class="luxury-field">
                    <mat-label>Destination</mat-label>
                    <mat-icon matPrefix>location_city</mat-icon>
                    <input matInput [formControl]="cityControl" [matAutocomplete]="autoCity" placeholder="Where to?" required />
                    <mat-autocomplete #autoCity="matAutocomplete" [displayWith]="displayCity">
                      <mat-option *ngFor="let dest of cityDestinations" [value]="dest">
                        <div class="luxury-autocomplete-option">
                          <div class="option-icon-wrapper">
                            <mat-icon>place</mat-icon>
                          </div>
                          <div class="option-content">
                            <span class="option-city">{{dest.name}}</span>
                            <span class="option-details">{{dest.iataCode}} • {{dest.country}}</span>
                          </div>
                        </div>
                      </mat-option>
                    </mat-autocomplete>
                  </mat-form-field>
                </div>

                <div class="field-container">
                  <mat-form-field appearance="outline" class="luxury-field">
                    <mat-label>Check-in</mat-label>
                    <mat-icon matPrefix>event_available</mat-icon>
                    <input matInput [matDatepicker]="pickerIn" [(ngModel)]="checkInDate" name="checkInDate" placeholder="Arrival" required />
                    <mat-datepicker-toggle matSuffix [for]="pickerIn"></mat-datepicker-toggle>
                    <mat-datepicker #pickerIn></mat-datepicker>
                  </mat-form-field>
                </div>

                <div class="field-container">
                  <mat-form-field appearance="outline" class="luxury-field">
                    <mat-label>Check-out</mat-label>
                    <mat-icon matPrefix>event_busy</mat-icon>
                    <input matInput [matDatepicker]="pickerOut" [(ngModel)]="checkOutDate" name="checkOutDate" placeholder="Departure" required />
                    <mat-datepicker-toggle matSuffix [for]="pickerOut"></mat-datepicker-toggle>
                    <mat-datepicker #pickerOut></mat-datepicker>
                  </mat-form-field>
                </div>

                <button mat-raised-button type="submit" class="luxury-search-button" [disabled]="loading">
                  <mat-icon>${'{{loading ? "hourglass_empty" : "search"}}'}</mat-icon>
                  <span>${'{{loading ? "Searching..." : "Find Hotels"}}'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Premium Loading State -->
      <div *ngIf="loading" class="luxury-loading">
        <div class="loading-spinner-wrapper">
          <mat-icon class="spinner-icon">apartment</mat-icon>
          <div class="loading-rings">
            <div class="ring"></div>
            <div class="ring"></div>
            <div class="ring"></div>
          </div>
        </div>
        <h3 class="loading-heading">Curating Premium Stays</h3>
        <p class="loading-subtext">Searching through ${'{{currentLimit}}'} exceptional properties</p>
      </div>

      <!-- Premium Results Section -->
      <div class="luxury-results-wrapper" *ngIf="!loading && hotels.length > 0">
        <div class="results-header-luxury">
          <div class="header-left">
            <mat-icon class="results-icon">location_city</mat-icon>
            <div class="header-text">
              <h2 class="results-heading">Premium Selection</h2>
              <p class="results-count">${'{{ hotels.length }}'} Exceptional Properties</p>
            </div>
          </div>
          <div class="limit-selector">
            <span class="selector-label">Show:</span>
            <div class="limit-chips">
              <button mat-button *ngFor="let limit of availableLimits" 
                      [class.chip-active]="currentLimit === limit"
                      (click)="changeLimit(limit)"
                      class="limit-chip">
                ${'{{ limit }}'}
              </button>
            </div>
          </div>
        </div>
        
        <div class="luxury-hotels-grid">
          <div *ngFor="let hotel of hotels" class="luxury-hotel-card">
            <div class="hotel-visual">
              <img [src]="hotel.imageUrl" [alt]="hotel.name" class="hotel-cover" />
              <div class="visual-overlay"></div>
              <div class="rating-jewel">
                <mat-icon>grade</mat-icon>
                <span>${'{{ hotel.rating }}'}</span>
              </div>
              <div class="nights-badge">
                <mat-icon>nights_stay</mat-icon>
                <span>${'{{ calculateNights() }}'} nights</span>
              </div>
            </div>
            
            <div class="hotel-details">
              <div class="hotel-header">
                <h3 class="hotel-title">${'{{ hotel.name }}'}</h3>
                <div class="hotel-location">
                  <mat-icon>pin_drop</mat-icon>
                  <span>${'{{ hotel.address }}'}</span>
                </div>
              </div>
              
              <p class="hotel-summary">${'{{ hotel.description }}'}</p>
              
              <div class="amenities-row">
                <div class="amenity-badge">
                  <mat-icon>king_bed</mat-icon>
                  <span>${'{{ hotel.availableRooms }}'} Rooms</span>
                </div>
                <div class="amenity-badge">
                  <mat-icon>workspace_premium</mat-icon>
                  <span>Premium</span>
                </div>
              </div>
              
              <div class="pricing-luxury">
                <div class="price-column">
                  <span class="from-label">From</span>
                  <div class="price-amount">
                    <span class="currency">$</span>
                    <span class="amount">${'{{ hotel.pricePerNight }}'}</span>
                  </div>
                  <span class="per-night">/night</span>
                </div>
                <div class="divider-line"></div>
                <div class="total-column">
                  <span class="total-label">Total Stay</span>
                  <div class="total-amount">${'${{ hotel.pricePerNight * calculateNights() }}'}</div>
                </div>
              </div>
              
              <button mat-raised-button (click)="onBook(hotel)" class="reserve-button">
                <mat-icon>event_available</mat-icon>
                <span>Reserve Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Premium Empty State -->
      <div *ngIf="!loading && searched && hotels.length === 0" class="luxury-empty-state">
        <div class="empty-icon-wrapper">
          <mat-icon class="empty-luxury-icon">apartment</mat-icon>
        </div>
        <h3 class="empty-luxury-title">No Properties Available</h3>
        <p class="empty-luxury-text">We couldn't find accommodations matching your preferences</p>
        <div class="suggestions-grid">
          <div class="suggestion-item">
            <mat-icon>explore</mat-icon>
            <span>Try different destination</span>
          </div>
          <div class="suggestion-item">
            <mat-icon>calendar_month</mat-icon>
            <span>Adjust your dates</span>
          </div>
          <div class="suggestion-item">
            <mat-icon>tune</mat-icon>
            <span>Increase limit</span>
          </div>
          <div class="suggestion-item">
            <mat-icon>near_me</mat-icon>
            <span>Search nearby</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ============================================
       PREMIUM HOTEL SEARCH
       ============================================ */
    .hotel-search-premium {
      min-height: 100vh;
      background: linear-gradient(180deg, #f8f6f3 0%, #fdfcfb 100%);
    }

    /* ============================================
       LUXURY HERO SECTION
       ============================================ */
    .luxury-hero {
      position: relative;
      min-height: 90vh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      padding: 2.5rem;
    }

    .hero-background {
      position: absolute;
      inset: 0;
      background: 
        linear-gradient(135deg, rgba(139, 108, 80, 0.88) 0%, rgba(196, 165, 116, 0.82) 40%, rgba(109, 93, 75, 0.85) 100%),
        url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&h=1080&fit=crop&q=90') center/cover;
      z-index: 1;
    }

    .hero-gradient-overlay {
      position: absolute;
      inset: 0;
      background: 
        radial-gradient(circle at 25% 40%, rgba(212, 114, 44, 0.25) 0%, transparent 55%),
        radial-gradient(circle at 75% 60%, rgba(196, 165, 116, 0.2) 0%, transparent 55%);
      z-index: 2;
    }

    .hero-content-container {
      position: relative;
      z-index: 3;
      max-width: 1100px;
      width: 100%;
      text-align: center;
      animation: luxuryFadeIn 1s ease-out;
    }

    @keyframes luxuryFadeIn {
      from {
        opacity: 0;
        transform: translateY(40px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .hero-badge-luxury {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: rgba(255, 255, 255, 0.18);
      backdrop-filter: blur(25px);
      border: 1.5px solid rgba(255, 255, 255, 0.25);
      padding: 12px 28px;
      border-radius: 35px;
      color: white;
      font-size: 0.9rem;
      font-weight: 700;
      margin-bottom: 2rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    }

    .hero-badge-luxury mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .hero-heading-luxury {
      font-family: 'Playfair Display', serif;
      font-size: 4.5rem;
      font-weight: 800;
      color: white;
      margin: 0 0 1.8rem 0;
      line-height: 1.1;
      letter-spacing: -0.025em;
      text-shadow: 0 6px 24px rgba(0, 0, 0, 0.35);
    }

    .hero-text-luxury {
      font-size: 1.3rem;
      color: rgba(255, 255, 255, 0.97);
      margin: 0 0 3.5rem 0;
      line-height: 1.65;
      max-width: 750px;
      margin-left: auto;
      margin-right: auto;
      text-shadow: 0 3px 12px rgba(0, 0, 0, 0.25);
      font-weight: 400;
    }

    /* ============================================
       LUXURY INLINE SEARCH CARD
       ============================================ */
    .luxury-search-inline {
      background: rgba(255, 255, 255, 0.97);
      backdrop-filter: blur(35px);
      border-radius: 28px;
      padding: 3rem;
      box-shadow: 
        0 30px 80px rgba(0, 0, 0, 0.4),
        0 18px 40px rgba(0, 0, 0, 0.3),
        inset 0 2px 0 rgba(255, 255, 255, 0.35);
      border: 2px solid rgba(255, 255, 255, 0.5);
      position: relative;
      overflow: hidden;
    }

    .luxury-search-inline::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 5px;
      background: linear-gradient(90deg, #c4a574 0%, #d4722c 50%, #c4a574 100%);
      opacity: 0.75;
    }

    .search-fields-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr) minmax(160px, auto);
      gap: 1.5rem;
      align-items: end;
    }

    .field-container {
      position: relative;
      transition: transform 0.25s ease;
    }

    .field-container:hover {
      transform: translateY(-3px);
    }

    .luxury-field {
      width: 100%;
    }

    ::ng-deep .luxury-field .mat-mdc-text-field-wrapper {
      background: linear-gradient(135deg, #ffffff 0%, #fdfcfb 100%);
      border-radius: 16px;
      transition: all 0.3s ease;
    }

    ::ng-deep .luxury-field:hover .mat-mdc-text-field-wrapper {
      background: linear-gradient(135deg, #fdfcfb 0%, #f8f6f3 100%);
    }

    ::ng-deep .luxury-field .mat-mdc-form-field-focus-overlay {
      background-color: rgba(139, 108, 80, 0.04);
    }

    ::ng-deep .luxury-field .mat-mdc-notched-outline {
      border-color: rgba(139, 108, 80, 0.25);
      border-width: 2px;
      transition: all 0.3s ease;
    }

    ::ng-deep .luxury-field:hover .mat-mdc-notched-outline {
      border-color: rgba(139, 108, 80, 0.5);
      box-shadow: 0 3px 12px rgba(139, 108, 80, 0.1);
    }

    ::ng-deep .luxury-field.mat-focused .mat-mdc-notched-outline {
      border-color: #c4a574 !important;
      border-width: 2.5px !important;
      box-shadow: 0 5px 20px rgba(196, 165, 116, 0.2);
    }

    ::ng-deep .luxury-field .mat-mdc-floating-label {
      color: #6d5d4b;
      font-weight: 700;
      font-size: 1rem;
    }

    ::ng-deep .luxury-field.mat-focused .mat-mdc-floating-label {
      color: #c4a574 !important;
      font-weight: 800;
    }

    ::ng-deep .luxury-field mat-icon[matPrefix] {
      color: #c4a574;
      margin-right: 16px;
      opacity: 0.75;
      font-size: 24px;
      width: 24px;
      height: 24px;
      transition: all 0.3s ease;
    }

    ::ng-deep .luxury-field.mat-focused mat-icon[matPrefix] {
      opacity: 1;
      transform: scale(1.12);
    }

    ::ng-deep .luxury-field input {
      color: #2d2416;
      font-weight: 600;
      font-size: 1rem;
    }

    ::ng-deep .luxury-field input::placeholder {
      color: rgba(109, 93, 75, 0.5);
      font-weight: 500;
    }

    .luxury-search-button {
      height: 64px !important;
      min-width: 160px !important;
      padding: 0 2.5rem !important;
      border-radius: 16px !important;
      background: linear-gradient(135deg, #c4a574 0%, #8b6c50 100%) !important;
      color: white !important;
      font-weight: 800 !important;
      font-size: 1.1rem !important;
      box-shadow: 
        0 12px 32px rgba(139, 108, 80, 0.5),
        0 5px 15px rgba(139, 108, 80, 0.35) !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 14px;
      white-space: nowrap;
      letter-spacing: 0.025em;
      position: relative;
      overflow: hidden;
    }

    .luxury-search-button::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
      transition: left 0.6s ease;
    }

    .luxury-search-button:hover::before {
      left: 100%;
    }

    .luxury-search-button:hover:not([disabled]) {
      transform: translateY(-4px);
      box-shadow: 
        0 16px 40px rgba(139, 108, 80, 0.55),
        0 8px 20px rgba(139, 108, 80, 0.4) !important;
      background: linear-gradient(135deg, #8b6c50 0%, #6d5d4b 100%) !important;
    }

    .luxury-search-button:active:not([disabled]) {
      transform: translateY(-2px);
    }

    .luxury-search-button[disabled] {
      opacity: 0.65;
      cursor: not-allowed;
      transform: none !important;
    }

    .luxury-search-button mat-icon {
      font-size: 26px;
      width: 26px;
      height: 26px;
      transition: transform 0.3s ease;
    }

    .luxury-search-button:hover:not([disabled]) mat-icon {
      transform: scale(1.15) rotate(8deg);
    }

    /* ============================================
       AUTOCOMPLETE LUXURY STYLING
       ============================================ */
    ::ng-deep .mat-mdc-autocomplete-panel {
      border-radius: 18px !important;
      box-shadow: 
        0 18px 60px rgba(0, 0, 0, 0.25),
        0 8px 25px rgba(0, 0, 0, 0.15) !important;
      border: 2px solid rgba(196, 165, 116, 0.2);
      margin-top: 14px;
      overflow: hidden;
    }

    .luxury-autocomplete-option {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 14px 0;
      transition: all 0.25s ease;
    }

    .option-icon-wrapper {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, rgba(196, 165, 116, 0.1) 0%, rgba(139, 108, 80, 0.15) 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.25s ease;
    }

    .luxury-autocomplete-option mat-icon {
      color: #c4a574;
      font-size: 22px;
      width: 22px;
      height: 22px;
    }

    .option-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .option-city {
      font-weight: 700;
      color: #2d2416;
      font-size: 1rem;
      letter-spacing: 0.01em;
    }

    .option-details {
      font-size: 0.85rem;
      color: #6d5d4b;
      font-weight: 600;
    }

    ::ng-deep .mat-mdc-option:hover {
      background: rgba(196, 165, 116, 0.08) !important;
    }

    ::ng-deep .mat-mdc-option:hover .option-icon-wrapper {
      background: linear-gradient(135deg, rgba(196, 165, 116, 0.2) 0%, rgba(139, 108, 80, 0.25) 100%);
      transform: scale(1.08);
    }

    ::ng-deep .mat-mdc-option.mat-mdc-option-active {
      background: rgba(196, 165, 116, 0.12) !important;
    }

    ::ng-deep .mat-mdc-option.mat-mdc-option-active .option-icon-wrapper {
      background: linear-gradient(135deg, #c4a574 0%, #8b6c50 100%);
    }

    ::ng-deep .mat-mdc-option.mat-mdc-option-active .option-icon-wrapper mat-icon {
      color: white;
    }

    /* ============================================
       PREMIUM LOADING STATE
       ============================================ */
    .luxury-loading {
      max-width: 1100px;
      margin: 4rem auto;
      padding: 5rem 2.5rem;
      text-align: center;
      background: white;
      border-radius: 24px;
      box-shadow: 0 12px 48px rgba(139, 108, 80, 0.15);
    }

    .loading-spinner-wrapper {
      position: relative;
      width: 120px;
      height: 120px;
      margin: 0 auto 2.5rem;
    }

    .spinner-icon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 52px;
      width: 52px;
      height: 52px;
      color: #c4a574;
      z-index: 2;
      animation: iconPulse 2s ease-in-out infinite;
    }

    @keyframes iconPulse {
      0%, 100% { transform: translate(-50%, -50%) scale(1); }
      50% { transform: translate(-50%, -50%) scale(1.1); }
    }

    .loading-rings {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .ring {
      position: absolute;
      inset: 0;
      border: 3px solid transparent;
      border-top-color: #c4a574;
      border-radius: 50%;
      animation: ringRotate 1.5s linear infinite;
    }

    .ring:nth-child(2) {
      border-top-color: #d4722c;
      animation-delay: -0.5s;
      animation-duration: 2s;
    }

    .ring:nth-child(3) {
      border-top-color: #8b6c50;
      animation-delay: -1s;
      animation-duration: 2.5s;
    }

    @keyframes ringRotate {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .loading-heading {
      font-size: 2rem;
      font-weight: 800;
      background: linear-gradient(135deg, #8b6c50 0%, #c4a574 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0 0 1rem 0;
      letter-spacing: -0.01em;
    }

    .loading-subtext {
      font-size: 1.15rem;
      color: #6d5d4b;
      margin: 0;
      font-weight: 500;
    }

    /* ============================================
       PREMIUM RESULTS SECTION
       ============================================ */
    .luxury-results-wrapper {
      max-width: 1500px;
      margin: 0 auto;
      padding: 0 2.5rem 5rem;
    }

    .results-header-luxury {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 3rem;
      flex-wrap: wrap;
      gap: 2rem;
      padding: 2.5rem;
      background: white;
      border-radius: 20px;
      box-shadow: 0 8px 32px rgba(139, 108, 80, 0.1);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .results-icon {
      font-size: 44px;
      width: 44px;
      height: 44px;
      color: #c4a574;
      background: linear-gradient(135deg, rgba(196, 165, 116, 0.1) 0%, rgba(139, 108, 80, 0.15) 100%);
      padding: 14px;
      border-radius: 16px;
    }

    .header-text {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .results-heading {
      font-size: 2.2rem;
      font-weight: 800;
      background: linear-gradient(135deg, #8b6c50 0%, #c4a574 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0;
      letter-spacing: -0.015em;
    }

    .results-count {
      font-size: 1rem;
      color: #6d5d4b;
      font-weight: 600;
      margin: 0;
    }

    .limit-selector {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .selector-label {
      font-weight: 700;
      color: #6d5d4b;
      font-size: 1.05rem;
    }

    .limit-chips {
      display: flex;
      gap: 10px;
    }

    .limit-chip {
      min-width: 60px;
      height: 44px;
      font-weight: 700 !important;
      border: 2px solid rgba(139, 108, 80, 0.2) !important;
      border-radius: 12px !important;
      transition: all 0.25s ease;
      background: white !important;
      color: #6d5d4b !important;
    }

    .limit-chip:hover {
      border-color: rgba(139, 108, 80, 0.5) !important;
      background: rgba(196, 165, 116, 0.05) !important;
      transform: translateY(-2px);
    }

    .limit-chip.chip-active {
      background: linear-gradient(135deg, #c4a574 0%, #8b6c50 100%) !important;
      color: white !important;
      border-color: #c4a574 !important;
      box-shadow: 0 5px 18px rgba(196, 165, 116, 0.35);
    }

    /* ============================================
       LUXURY HOTEL CARDS
       ============================================ */
    .luxury-hotels-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
      gap: 2.5rem;
    }

    .luxury-hotel-card {
      display: flex;
      flex-direction: column;
      border-radius: 24px;
      overflow: hidden;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      border: 2px solid rgba(139, 108, 80, 0.15);
      background: white;
      box-shadow: 0 8px 32px rgba(139, 108, 80, 0.12);
      height: 100%;
    }

    .luxury-hotel-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 20px 60px rgba(139, 108, 80, 0.25);
      border-color: #c4a574;
    }

    .hotel-visual {
      position: relative;
      width: 100%;
      height: 280px;
      overflow: hidden;
      background: linear-gradient(135deg, #f8f6f3 0%, #f0ede8 100%);
    }

    .hotel-cover {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }

    .luxury-hotel-card:hover .hotel-cover {
      transform: scale(1.08);
    }

    .visual-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.7) 100%);
      opacity: 0;
      transition: opacity 0.4s ease;
    }

    .luxury-hotel-card:hover .visual-overlay {
      opacity: 1;
    }

    .rating-jewel {
      position: absolute;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #fdb924 0%, #f7931e 100%);
      color: white;
      padding: 10px 20px;
      border-radius: 24px;
      display: flex;
      align-items: center;
      gap: 7px;
      font-weight: 800;
      font-size: 1.15rem;
      box-shadow: 0 6px 20px rgba(253, 185, 36, 0.5);
      z-index: 2;
    }

    .rating-jewel mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
    }

    .nights-badge {
      position: absolute;
      top: 20px;
      left: 20px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      color: #6d5d4b;
      padding: 10px 18px;
      border-radius: 22px;
      display: flex;
      align-items: center;
      gap: 7px;
      font-weight: 700;
      font-size: 0.95rem;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      z-index: 2;
    }

    .nights-badge mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #8b6c50;
    }

    .hotel-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 2rem;
    }

    .hotel-header {
      margin-bottom: 1.25rem;
    }

    .hotel-title {
      font-size: 1.65rem;
      font-weight: 800;
      color: #2d2416;
      margin: 0 0 0.75rem 0;
      line-height: 1.3;
      letter-spacing: -0.01em;
    }

    .hotel-location {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #6d5d4b;
      font-size: 0.95rem;
      font-weight: 600;
    }

    .hotel-location mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #c4a574;
    }

    .hotel-summary {
      color: #495057;
      margin: 0 0 1.5rem 0;
      font-size: 0.95rem;
      line-height: 1.65;
      flex: 1;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      font-weight: 500;
    }

    .amenities-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .amenity-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #faf8f5 0%, #f5f2ed 100%);
      padding: 10px 18px;
      border-radius: 14px;
      color: #6d5d4b;
      font-weight: 700;
      font-size: 0.9rem;
      border: 1.5px solid rgba(139, 108, 80, 0.15);
    }

    .amenity-badge mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #c4a574;
    }

    .pricing-luxury {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.75rem;
      background: linear-gradient(135deg, #faf8f5 0%, #f5f2ed 100%);
      border-radius: 18px;
      margin: auto 0 1.5rem 0;
      gap: 1.5rem;
      border: 2px solid rgba(139, 108, 80, 0.1);
    }

    .price-column {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .from-label {
      font-size: 0.85rem;
      color: #6d5d4b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .price-amount {
      display: flex;
      align-items: baseline;
      gap: 4px;
    }

    .currency {
      font-size: 1.3rem;
      font-weight: 700;
      color: #c4a574;
    }

    .amount {
      font-size: 2.5rem;
      font-weight: 800;
      background: linear-gradient(135deg, #8b6c50 0%, #c4a574 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1;
    }

    .per-night {
      font-size: 0.85rem;
      color: #6d5d4b;
      font-weight: 500;
    }

    .divider-line {
      width: 2px;
      height: 60px;
      background: linear-gradient(180deg, transparent 0%, rgba(139, 108, 80, 0.3) 50%, transparent 100%);
    }

    .total-column {
      text-align: right;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .total-label {
      font-size: 0.85rem;
      color: #6d5d4b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .total-amount {
      font-size: 1.8rem;
      font-weight: 800;
      color: #2d2416;
    }

    .reserve-button {
      width: 100%;
      height: 58px !important;
      font-size: 1.15rem !important;
      font-weight: 800 !important;
      border-radius: 16px !important;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      background: linear-gradient(135deg, #c4a574 0%, #8b6c50 100%) !important;
      color: white !important;
      box-shadow: 0 8px 24px rgba(139, 108, 80, 0.4) !important;
      transition: all 0.3s ease;
      letter-spacing: 0.02em;
    }

    .reserve-button:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 32px rgba(139, 108, 80, 0.5) !important;
      background: linear-gradient(135deg, #8b6c50 0%, #6d5d4b 100%) !important;
    }

    .reserve-button mat-icon {
      font-size: 26px;
      width: 26px;
      height: 26px;
    }

    /* ============================================
       PREMIUM EMPTY STATE
       ============================================ */
    .luxury-empty-state {
      max-width: 700px;
      margin: 4rem auto;
      padding: 4rem 2.5rem;
      text-align: center;
      background: white;
      border-radius: 24px;
      box-shadow: 0 12px 48px rgba(139, 108, 80, 0.15);
    }

    .empty-icon-wrapper {
      width: 140px;
      height: 140px;
      margin: 0 auto 2rem;
      background: linear-gradient(135deg, rgba(196, 165, 116, 0.1) 0%, rgba(139, 108, 80, 0.15) 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .empty-luxury-icon {
      font-size: 70px;
      width: 70px;
      height: 70px;
      color: #c4a574;
    }

    .empty-luxury-title {
      font-size: 2rem;
      font-weight: 800;
      background: linear-gradient(135deg, #8b6c50 0%, #c4a574 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0 0 1rem 0;
    }

    .empty-luxury-text {
      font-size: 1.15rem;
      color: #6d5d4b;
      margin: 0 0 2.5rem 0;
      font-weight: 500;
    }

    .suggestions-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.25rem;
      max-width: 500px;
      margin: 0 auto;
    }

    .suggestion-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 1rem 1.25rem;
      background: linear-gradient(135deg, #faf8f5 0%, #f5f2ed 100%);
      border-radius: 14px;
      color: #6d5d4b;
      font-weight: 600;
      font-size: 0.95rem;
      border: 1.5px solid rgba(139, 108, 80, 0.15);
      transition: all 0.25s ease;
    }

    .suggestion-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(139, 108, 80, 0.15);
      border-color: #c4a574;
    }

    .suggestion-item mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
      color: #c4a574;
    }

    /* ============================================
       RESPONSIVE DESIGN
       ============================================ */
    @media (max-width: 1024px) {
      .search-fields-grid {
        grid-template-columns: 1fr 1fr;
      }

      .luxury-search-button {
        grid-column: 1 / -1;
      }

      .hero-heading-luxury {
        font-size: 3.5rem;
      }

      .luxury-hotels-grid {
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      }
    }

    @media (max-width: 768px) {
      .luxury-hero {
        min-height: auto;
        padding: 3.5rem 1.5rem;
      }

      .hero-heading-luxury {
        font-size: 2.5rem;
      }

      .hero-text-luxury {
        font-size: 1.1rem;
        margin-bottom: 2.5rem;
      }

      .luxury-search-inline {
        padding: 2rem 1.5rem;
      }

      .search-fields-grid {
        grid-template-columns: 1fr;
        gap: 1.25rem;
      }

      .results-header-luxury {
        flex-direction: column;
        align-items: flex-start;
        padding: 2rem;
      }

      .limit-selector {
        width: 100%;
        justify-content: space-between;
      }

      .luxury-hotels-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .pricing-luxury {
        flex-direction: column;
        align-items: stretch;
        padding: 1.5rem;
      }

      .divider-line {
        width: 100%;
        height: 2px;
      }

      .total-column {
        text-align: left;
      }

      .suggestions-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 480px) {
      .hero-heading-luxury {
        font-size: 2rem;
      }

      .hero-text-luxury {
        font-size: 1rem;
      }

      .hero-badge-luxury {
        font-size: 0.8rem;
        padding: 10px 20px;
      }
    }

    /* ============================================
       DATEPICKER STYLING
       ============================================ */
    ::ng-deep .mat-datepicker-content {
      border-radius: 18px !important;
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2) !important;
    }

    ::ng-deep .mat-calendar-body-selected {
      background-color: #c4a574 !important;
    }

    ::ng-deep .mat-calendar-body-today:not(.mat-calendar-body-selected) {
      border-color: #c4a574 !important;
    }

    ::ng-deep .mat-datepicker-toggle {
      color: #c4a574 !important;
    }
  `]
})
export class HotelSearchComponent implements OnInit {
  cityControl = new FormControl<string | any>('');
  cityDestinations: any[] = [];
  selectedCity: any = null;
  checkInDate: Date | null = null;
  checkOutDate: Date | null = null;
  hotels: Hotel[] = [];
  loading = false;
  searched = false;
  
  // Pagination
  currentLimit = 20;
  availableLimits = [10, 20, 30, 50];

  constructor(
    private hotelService: HotelService,
    private destSvc: DestinationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Set default dates
    const today = new Date();
    this.checkInDate = new Date(today);
    this.checkInDate.setDate(today.getDate() + 7);
    
    this.checkOutDate = new Date(today);
    this.checkOutDate.setDate(today.getDate() + 10);

    // Setup city autocomplete
    this.cityControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        if (typeof value === 'string' && value.length >= 2) {
          return this.destSvc.search(value);
        }
        return of([]);
      })
    ).subscribe(destinations => {
      this.cityDestinations = destinations;
    });

    // Check for query parameters from home page
    this.route.queryParams.subscribe(params => {
      if (params['city'] || params['iataCode']) {
        const cityName = params['city'];
        const iataCode = params['iataCode'];
        
        // Handle date parameters
        if (params['checkIn']) {
          this.checkInDate = new Date(params['checkIn']);
        }
        if (params['checkOut']) {
          this.checkOutDate = new Date(params['checkOut']);
        }
        
        if (iataCode) {
          // Search for the destination to populate the autocomplete
          this.destSvc.search(cityName || iataCode).subscribe(destinations => {
            if (destinations && destinations.length > 0) {
              const matchedDest = destinations.find(d => d.iataCode === iataCode) || destinations[0];
              this.cityControl.setValue(matchedDest);
              this.selectedCity = matchedDest;
              
              // Auto-trigger search if city is provided
              setTimeout(() => this.onSearch(), 500);
            }
          });
        } else if (cityName) {
          // Just a city name, search for it
          this.destSvc.search(cityName).subscribe(destinations => {
            if (destinations && destinations.length > 0) {
              this.cityControl.setValue(destinations[0]);
              this.selectedCity = destinations[0];
              
              // Auto-trigger search if city is provided
              setTimeout(() => this.onSearch(), 500);
            }
          });
        }
      }
    });
  }

  displayCity(dest: any): string {
    return dest && dest.name ? `${dest.name}` : '';
  }

  onSearch() {
    const cityValue = this.cityControl.value;
    
    if (!cityValue || typeof cityValue === 'string') {
      alert('Please select a city from the dropdown');
      return;
    }

    if (!this.checkInDate || !this.checkOutDate) {
      alert('Please select check-in and check-out dates');
      return;
    }

    this.loading = true;
    this.searched = true;

    const cityCode = cityValue.iataCode;
    const checkIn = this.checkInDate.toISOString().split('T')[0];
    const checkOut = this.checkOutDate.toISOString().split('T')[0];

    console.log('Searching hotels with:', { cityCode, checkIn, checkOut });

    this.hotelService.list(cityCode, this.currentLimit).subscribe({
      next: (hotels) => {
        this.hotels = hotels;
        this.loading = false;
        console.log('Hotels received:', hotels);
      },
      error: (err) => {
        console.error('Error searching hotels:', err);
        this.loading = false;
        alert('Error searching hotels. Please try again.');
      }
    });
  }
  
  changeLimit(limit: number) {
    this.currentLimit = limit;
    // Re-search with new limit if we already have a search
    if (this.searched && this.cityControl.value && typeof this.cityControl.value !== 'string') {
      this.onSearch();
    }
  }

  onBook(hotel: Hotel) {
    // Store hotel data in sessionStorage for booking
    const cityValue = this.cityControl.value;
    const cityName = (cityValue && typeof cityValue !== 'string') ? cityValue.name : this.selectedCity?.name || 'Unknown City';
    
    const hotelData = {
      externalHotelId: hotel.id?.toString() || '',
      hotelName: hotel.name,
      city: cityName,
      address: hotel.address || '',
      checkIn: this.checkInDate?.toISOString().split('T')[0] || '',
      checkOut: this.checkOutDate?.toISOString().split('T')[0] || '',
      roomCount: 1,
      pricePerNight: hotel.pricePerNight,
      totalPrice: hotel.pricePerNight * this.calculateNights(),
      nights: this.calculateNights(),
      rating: hotel.rating,
      imageUrl: hotel.imageUrl
    };
    console.log('Storing hotel reservation data:', hotelData);
    sessionStorage.setItem('pendingHotelReservation', JSON.stringify(hotelData));
    this.router.navigate(['/booking']);
  }

  calculateNights(): number {
    if (!this.checkInDate || !this.checkOutDate) return 1;
    const checkIn = new Date(this.checkInDate);
    const checkOut = new Date(this.checkOutDate);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  }

  onViewDetails(hotel: Hotel) {
    alert(`Hotel Details:\n\nName: ${hotel.name}\nRating: ${hotel.rating}/5\nPrice: $${hotel.pricePerNight}/night\nAddress: ${hotel.address}\n\n${hotel.description}`);
  }
}
