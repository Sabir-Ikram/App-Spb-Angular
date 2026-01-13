import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DestinationService } from '../../services/destination.service';
import { FlightService } from '../../services/flight.service';
import { SearchResultsComponent } from './search-results.component';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSliderModule,
    MatIconModule,
    MatChipsModule,
    MatAutocompleteModule,
    SearchResultsComponent
  ],
  template: `
    <div class="search-page-premium">
      <!-- Premium Hero with Background -->
      <div class="hero-search-premium">
        <div class="hero-background-image"></div>
        <div class="hero-overlay"></div>
        <div class="hero-content-wrapper">
          <div class="hero-badge">
            <mat-icon>{{isPackageMode ? 'card_travel' : 'flight'}}</mat-icon>
            <span>{{isPackageMode ? 'Complete Travel Packages' : 'Premium Flight Search'}}</span>
          </div>
          <h1 class="hero-main-title">
            <ng-container *ngIf="isPackageMode; else flightTitle">Your Perfect Journey Awaits</ng-container>
            <ng-template #flightTitle>
              Discover Your Next <span class="saffron-accent">Adventure</span>
            </ng-template>
          </h1>
          <p class="hero-description">{{isPackageMode ? 'Seamlessly combine flights and accommodations for the ultimate travel experience' : 'Search and compare flights from over 500 airlines worldwide with real-time pricing'}}</p>
          
          <!-- Premium Moroccan Glassmorphism Search Card -->
          <div class="search-card-moroccan-glass">
            <div class="moroccan-pattern-overlay"></div>
            <div class="search-grid-luxury">
              <div class="luxury-field-wrapper">
                <div class="floating-field-container">
                  <mat-icon class="luxury-icon">flight_takeoff</mat-icon>
                  <input 
                    type="text" 
                    class="luxury-input" 
                    [formControl]="originControl" 
                    [matAutocomplete]="autoOrigin"
                    placeholder=" "
                    id="fromInput">
                  <label for="fromInput" class="floating-label">From</label>
                  <div class="field-border"></div>
                  <mat-autocomplete #autoOrigin="matAutocomplete" [displayWith]="displayDestination">
                    <mat-option *ngFor="let dest of originDestinations" [value]="dest">
                      <div class="autocomplete-option">
                        <div class="option-icon">
                          <mat-icon>location_on</mat-icon>
                        </div>
                        <div class="option-text">
                          <span class="option-name">{{dest.name}}</span>
                          <span class="option-code">{{dest.iataCode}} • {{dest.country}}</span>
                        </div>
                      </div>
                    </mat-option>
                  </mat-autocomplete>
                </div>
              </div>

              <div class="luxury-field-wrapper">
                <div class="floating-field-container">
                  <mat-icon class="luxury-icon">flight_land</mat-icon>
                  <input 
                    type="text" 
                    class="luxury-input" 
                    [formControl]="destinationControl" 
                    [matAutocomplete]="autoDestination"
                    placeholder=" "
                    id="toInput">
                  <label for="toInput" class="floating-label">To</label>
                  <div class="field-border"></div>
                  <mat-autocomplete #autoDestination="matAutocomplete" [displayWith]="displayDestination">
                    <mat-option *ngFor="let dest of destinationDestinations" [value]="dest">
                      <div class="autocomplete-option">
                        <div class="option-icon">
                          <mat-icon>location_on</mat-icon>
                        </div>
                        <div class="option-text">
                          <span class="option-name">{{dest.name}}</span>
                          <span class="option-code">{{dest.iataCode}} • {{dest.country}}</span>
                        </div>
                      </div>
                    </mat-option>
                  </mat-autocomplete>
                </div>
              </div>

              <div class="luxury-field-wrapper">
                <div class="floating-field-container">
                  <mat-icon class="luxury-icon">today</mat-icon>
                  <input 
                    matInput 
                    [matDatepicker]="picker1" 
                    [(ngModel)]="departureDate" 
                    class="luxury-input"
                    placeholder=" "
                    id="departureInput">
                  <label for="departureInput" class="floating-label">Departure</label>
                  <div class="field-border"></div>
                  <mat-datepicker-toggle matSuffix [for]="picker1" class="luxury-datepicker-toggle"></mat-datepicker-toggle>
                  <mat-datepicker #picker1></mat-datepicker>
                </div>
              </div>

              <div class="luxury-field-wrapper">
                <div class="floating-field-container">
                  <mat-icon class="luxury-icon">date_range</mat-icon>
                  <input 
                    matInput 
                    [matDatepicker]="picker2" 
                    [(ngModel)]="returnDate" 
                    class="luxury-input"
                    placeholder=" "
                    id="returnInput">
                  <label for="returnInput" class="floating-label">Return</label>
                  <div class="field-border"></div>
                  <mat-datepicker-toggle matSuffix [for]="picker2" class="luxury-datepicker-toggle"></mat-datepicker-toggle>
                  <mat-datepicker #picker2></mat-datepicker>
                </div>
              </div>

              <button class="luxury-search-button" (click)="onSearch()" [disabled]="isSearching">
                <span class="button-text">{{isSearching ? 'Searching...' : 'SEARCH'}}</span>
                <mat-icon class="button-icon">{{isSearching ? 'hourglass_empty' : 'search'}}</mat-icon>
                <div class="button-shine"></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Advanced Filters Section -->
      <div class="filters-section-premium" *ngIf="results.length > 0 || isSearching">
        <div class="filters-container">
          <div class="filters-header">
            <h3>
              <mat-icon>tune</mat-icon>
              Refine Your Search
            </h3>
            <button mat-button (click)="onReset()" class="clear-filters">
              <mat-icon>restart_alt</mat-icon>
              Clear All
            </button>
          </div>
          
          <div class="filters-grid">
            <div class="filter-group">
              <label class="filter-title">
                <mat-icon>payments</mat-icon>
                Budget Range
              </label>
              <div class="price-display">${'$'}0 - ${'$'}{{maxPrice}}</div>
              <mat-slider min="0" max="2000" step="50" discrete class="price-slider">
                <input matSliderThumb [(ngModel)]="maxPrice" (ngModelChange)="applyFilters()">
              </mat-slider>
            </div>

            <div class="filter-group">
              <label class="filter-title">
                <mat-icon>airlines</mat-icon>
                Preferred Airlines
              </label>
              <mat-chip-listbox [(ngModel)]="selectedAirlines" (ngModelChange)="applyFilters()" multiple class="airline-chips-premium">
                <mat-chip-option value="all">All Airlines</mat-chip-option>
                <mat-chip-option value="delta">Delta</mat-chip-option>
                <mat-chip-option value="united">United</mat-chip-option>
                <mat-chip-option value="american">American</mat-chip-option>
              </mat-chip-listbox>
            </div>
          </div>
        </div>
      </div>

      <!-- Results Section -->
      <div class="results-wrapper-premium">
        <app-search-results [results]="filteredResults" [isLoading]="isSearching"></app-search-results>
      </div>
    </div>
  `,
  styles: [`
    /* ============================================
       PREMIUM SEARCH PAGE
       ============================================ */
    .search-page-premium {
      min-height: 100vh;
      background: linear-gradient(180deg, #f8f6f3 0%, #fdfcfb 100%);
    }

    /* ============================================
       HERO SECTION WITH BACKGROUND IMAGE
       ============================================ */
    .hero-search-premium {
      position: relative;
      min-height: 85vh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      padding: 2rem;
    }

    .hero-background-image {
      position: absolute;
      inset: 0;
      background: 
        linear-gradient(135deg, rgba(45, 36, 22, 0.85) 0%, rgba(109, 93, 75, 0.75) 50%, rgba(139, 108, 80, 0.8) 100%),
        url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&h=1080&fit=crop&q=90') center/cover;
      z-index: 1;
    }

    .hero-overlay {
      position: absolute;
      inset: 0;
      background: 
        radial-gradient(circle at 30% 50%, rgba(139, 108, 80, 0.3) 0%, transparent 60%),
        radial-gradient(circle at 70% 50%, rgba(109, 93, 75, 0.2) 0%, transparent 60%);
      z-index: 2;
    }

    .hero-content-wrapper {
      position: relative;
      z-index: 3;
      max-width: 1100px;
      width: 100%;
      text-align: center;
      animation: fadeInUp 0.8s ease-out;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 10px 24px;
      border-radius: 30px;
      color: white;
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .hero-badge mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .hero-main-title {
      font-family: 'Playfair Display', serif;
      font-size: 4rem;
      font-weight: 700;
      color: white;
      margin: 0 0 1.5rem 0;
      line-height: 1.15;
      letter-spacing: -0.02em;
      text-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    .hero-main-title ::ng-deep .saffron-accent {
      color: #d4af37;
      font-style: italic;
    }

    .hero-description {
      font-size: 1.25rem;
      color: rgba(255, 255, 255, 0.95);
      margin: 0 0 3rem 0;
      line-height: 1.6;
      max-width: 700px;
      margin-left: auto;
      margin-right: auto;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    /* ============================================
       PREMIUM MOROCCAN GLASSMORPHISM SEARCH CARD
       ============================================ */
    .search-card-moroccan-glass {
      background: #ffffff;
      border-radius: 24px;
      padding: 3rem;
      box-shadow: 
        0 20px 40px rgba(0, 0, 0, 0.15),
        0 8px 20px rgba(0, 0, 0, 0.08);
      border: 1px solid rgba(0, 0, 0, 0.08);
      position: relative;
      overflow: visible;
    }

    @keyframes scaleInLuxury {
      from {
        opacity: 0;
        transform: scale(0.92) translateY(30px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    /* Moroccan Zellige Pattern Overlay */
    .moroccan-pattern-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      opacity: 0;
      pointer-events: none;
      background-image: 
        repeating-linear-gradient(45deg, transparent, transparent 10px, #1a365d 10px, #1a365d 11px),
        repeating-linear-gradient(-45deg, transparent, transparent 10px, #d4af37 10px, #d4af37 11px);
      background-size: 30px 30px;
    }

    .search-grid-luxury {
      display: grid;
      grid-template-columns: repeat(4, 1fr) auto;
      gap: 1.5rem;
      align-items: stretch;
      position: relative;
      z-index: 1;
    }

    /* ============================================
       LUXURY FLOATING LABEL INPUTS
       ============================================ */
    .luxury-field-wrapper {
      position: relative;
      min-width: 0;
      display: flex;
      align-items: stretch;
    }

    .floating-field-container {
      position: relative;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .luxury-icon {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: #1a365d;
      font-size: 22px;
      width: 22px;
      height: 22px;
      z-index: 2;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: none;
    }

    .luxury-input {
      width: 100%;
      height: 58px;
      padding: 24px 16px 8px 52px;
      border: 2px solid rgba(26, 54, 93, 0.15);
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.8);
      color: #1a365d;
      font-size: 0.95rem;
      font-weight: 500;
      font-family: 'Inter', 'Poppins', sans-serif;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      outline: none;
      position: relative;
      z-index: 1;
    }

    .luxury-input::placeholder {
      color: transparent;
    }

    .floating-label {
      position: absolute;
      left: 52px;
      top: 50%;
      transform: translateY(-50%);
      color: rgba(26, 54, 93, 0.6);
      font-size: 0.95rem;
      font-weight: 500;
      pointer-events: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      background: transparent;
      padding: 0 4px;
      z-index: 2;
    }

    .luxury-input:focus {
      background: white;
      border-color: #d4af37;
      box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.15);
    }

    .luxury-input:focus ~ .floating-label,
    .floating-field-container.has-value .floating-label {
      top: 8px;
      left: 52px;
      font-size: 0.7rem;
      font-weight: 700;
      color: #d4af37;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .field-border {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, #d4af37 0%, #b8941f 100%);
      transform: scaleX(0);
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      border-radius: 0 0 12px 12px;
      z-index: 3;
    }

    .luxury-input:focus ~ .field-border {
      transform: scaleX(1);
    }

    .luxury-input:focus ~ .luxury-icon,
    .floating-field-container.has-value .luxury-icon {
      color: #d4af37;
      transform: translateY(-50%) scale(1.05);
    }

    /* Datepicker Toggle Luxury */
    ::ng-deep .luxury-datepicker-toggle {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 2;
    }

    ::ng-deep .luxury-datepicker-toggle button {
      color: #1a365d;
      transition: all 0.3s ease;
    }

    ::ng-deep .luxury-datepicker-toggle button:hover {
      color: #d4af37;
    }

    ::ng-deep .luxury-input:focus ~ .luxury-datepicker-toggle button {
      color: #d4af37;
    }

    /* ============================================
       LUXURY SEARCH BUTTON WITH GRADIENT & SHINE
       ============================================ */
    .luxury-search-button {
      height: 58px;
      min-width: 160px;
      padding: 0 2.5rem;
      background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-family: 'Inter', 'Poppins', sans-serif;
      font-size: 1rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 
        0 10px 30px rgba(212, 175, 55, 0.4),
        0 4px 12px rgba(212, 175, 55, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      align-self: stretch;
    }

    .luxury-search-button:hover:not([disabled]) {
      transform: translateY(-3px);
      box-shadow: 
        0 16px 40px rgba(212, 175, 55, 0.5),
        0 8px 20px rgba(212, 175, 55, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);
      background: linear-gradient(135deg, #b8941f 0%, #a07a1a 100%);
    }

    .luxury-search-button:active:not([disabled]) {
      transform: translateY(-1px);
    }

    .luxury-search-button[disabled] {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }

    .button-text {
      position: relative;
      z-index: 2;
    }

    .button-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
      position: relative;
      z-index: 2;
      transition: transform 0.3s ease;
    }

    .luxury-search-button:hover:not([disabled]) .button-icon {
      transform: scale(1.15) rotate(5deg);
    }

    /* Shine Effect on Button */
    .button-shine {
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.3) 50%,
        transparent 100%
      );
      transition: left 0.6s ease;
      z-index: 1;
    }

    .luxury-search-button:hover:not([disabled]) .button-shine {
      left: 100%;
    }

    /* ============================================
       AUTOCOMPLETE PREMIUM STYLING
       ============================================ */
    ::ng-deep .mat-mdc-autocomplete-panel {
      border-radius: 16px !important;
      box-shadow: 
        0 15px 50px rgba(0, 0, 0, 0.2),
        0 5px 20px rgba(0, 0, 0, 0.1) !important;
      border: 1px solid rgba(139, 108, 80, 0.15);
      margin-top: 12px;
      overflow: hidden;
    }

    .autocomplete-option {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px 0;
      transition: all 0.2s ease;
    }

    .option-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, rgba(139, 108, 80, 0.08) 0%, rgba(139, 108, 80, 0.12) 100%);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.2s ease;
    }

    .autocomplete-option mat-icon {
      color: #8b6c50;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .option-text {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .option-name {
      font-weight: 600;
      color: #2d2416;
      font-size: 0.95rem;
      letter-spacing: 0.01em;
    }

    .option-code {
      font-size: 0.8rem;
      color: #6d5d4b;
      font-weight: 500;
    }

    ::ng-deep .mat-mdc-option:hover {
      background: rgba(139, 108, 80, 0.06) !important;
    }

    ::ng-deep .mat-mdc-option:hover .option-icon {
      background: linear-gradient(135deg, rgba(139, 108, 80, 0.15) 0%, rgba(139, 108, 80, 0.2) 100%);
      transform: scale(1.05);
    }

    ::ng-deep .mat-mdc-option.mat-mdc-option-active {
      background: rgba(139, 108, 80, 0.1) !important;
    }

    ::ng-deep .mat-mdc-option.mat-mdc-option-active .option-icon {
      background: linear-gradient(135deg, #8b6c50 0%, #6d5d4b 100%);
    }

    ::ng-deep .mat-mdc-option.mat-mdc-option-active .option-icon mat-icon {
      color: white;
    }

    /* ============================================
       FILTERS SECTION
       ============================================ */
    .filters-section-premium {
      background: white;
      border-bottom: 1px solid rgba(139, 108, 80, 0.1);
      padding: 2rem 0;
      margin-bottom: 2rem;
    }

    .filters-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .filters-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .filters-header h3 {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.25rem;
      font-weight: 600;
      color: #2d2416;
      margin: 0;
    }

    .filters-header h3 mat-icon {
      color: #8b6c50;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .clear-filters {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #8b6c50 !important;
      font-weight: 600 !important;
    }

    .clear-filters mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .filter-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: #2d2416;
      font-size: 0.95rem;
    }

    .filter-title mat-icon {
      color: #8b6c50;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .price-display {
      font-size: 1.5rem;
      font-weight: 700;
      color: #8b6c50;
      margin-bottom: 8px;
    }

    .price-slider {
      width: 100%;
    }

    ::ng-deep .price-slider.mat-mdc-slider {
      --mdc-slider-active-track-color: #8b6c50;
      --mdc-slider-handle-color: #8b6c50;
      --mdc-slider-focus-handle-color: #8b6c50;
      --mdc-slider-hover-handle-color: #6d5d4b;
      --mdc-slider-inactive-track-color: rgba(139, 108, 80, 0.2);
      --mdc-slider-with-tick-marks-active-container-color: #8b6c50;
      --mdc-slider-with-tick-marks-inactive-container-color: rgba(139, 108, 80, 0.2);
    }

    .airline-chips-premium {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    ::ng-deep .airline-chips-premium mat-chip-option {
      background: #fdfcfb !important;
      border: 1.5px solid rgba(139, 108, 80, 0.2) !important;
      color: #6d5d4b !important;
      font-weight: 500 !important;
      font-size: 0.875rem !important;
      border-radius: 20px !important;
      padding: 10px 18px !important;
      transition: all 0.2s ease;
    }

    ::ng-deep .airline-chips-premium mat-chip-option:hover {
      border-color: rgba(139, 108, 80, 0.5) !important;
      background: #f8f6f3 !important;
    }

    ::ng-deep .airline-chips-premium mat-chip-option.mat-mdc-chip-selected {
      background: linear-gradient(135deg, #8b6c50 0%, #6d5d4b 100%) !important;
      color: white !important;
      border-color: #8b6c50 !important;
      box-shadow: 0 4px 12px rgba(139, 108, 80, 0.3);
    }

    /* ============================================
       RESULTS WRAPPER
       ============================================ */
    .results-wrapper-premium {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem 4rem;
    }

    /* ============================================
       RESPONSIVE DESIGN
       ============================================ */
    @media (max-width: 1024px) {
      .search-grid-luxury {
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }

      .luxury-search-button {
        grid-column: 1 / -1;
      }

      .hero-main-title {
        font-size: 3rem;
      }
    }

    @media (max-width: 768px) {
      .hero-search-premium {
        min-height: auto;
        padding: 3rem 1rem;
      }

      .hero-main-title {
        font-size: 2.25rem;
      }

      .hero-description {
        font-size: 1.05rem;
        margin-bottom: 2rem;
      }

      .search-card-moroccan-glass {
        padding: 2rem 1.5rem;
      }

      .search-grid-luxury {
        grid-template-columns: 1fr;
        gap: 1.25rem;
      }

      .luxury-input {
        height: 56px;
      }

      .luxury-search-button {
        min-width: 100%;
      }

      .filters-section-premium {
        padding: 1.5rem 0;
      }

      .filters-container {
        padding: 0 1rem;
      }

      .filters-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .filters-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .results-wrapper-premium {
        padding: 0 1rem 3rem;
      }
    }

    @media (max-width: 480px) {
      .hero-main-title {
        font-size: 1.85rem;
      }

      .hero-description {
        font-size: 0.95rem;
      }

      .hero-badge {
        font-size: 0.75rem;
        padding: 8px 16px;
      }

      .search-card-moroccan-glass {
        padding: 1.5rem 1rem;
      }

      .luxury-input {
        height: 54px;
        padding: 22px 12px 8px 48px;
      }

      .luxury-icon {
        left: 12px;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      .floating-label {
        left: 48px;
      }

      .luxury-input:focus ~ .floating-label,
      .luxury-input:not(:placeholder-shown) ~ .floating-label {
        left: 44px;
      }
    }

    /* ============================================
       DATEPICKER STYLING
       ============================================ */
    ::ng-deep .mat-datepicker-content {
      border-radius: 16px !important;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15) !important;
    }

    ::ng-deep .mat-calendar-body-selected {
      background-color: #8b6c50 !important;
    }

    ::ng-deep .mat-calendar-body-today:not(.mat-calendar-body-selected) {
      border-color: #8b6c50 !important;
    }

    ::ng-deep .mat-datepicker-toggle {
      color: #8b6c50 !important;
    }
  `]
})
export class SearchComponent implements OnInit {
  originControl = new FormControl<string | any>('');
  destinationControl = new FormControl<string | any>('');
  originDestinations: any[] = [];
  destinationDestinations: any[] = [];
  selectedOrigin: any = null;
  selectedDestination: any = null;
  departureDate: Date | null = null;
  returnDate: Date | null = null;
  maxPrice: number = 1000;
  selectedAirlines: string[] = ['all'];
  results: any[] = [];
  filteredResults: any[] = [];
  isSearching: boolean = false;
  
  // Package mode
  isPackageMode: boolean = false;
  packageDestination: string = '';
  packageIataCode: string = '';
  packageDeparture: string = '';
  packageReturn: string = '';

  constructor(
    private destSvc: DestinationService, 
    private flightSvc: FlightService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Setup origin autocomplete
    this.originControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        if (typeof value === 'string' && value.length >= 2) {
          return this.destSvc.search(value);
        }
        return of([]);
      })
    ).subscribe(destinations => {
      this.originDestinations = destinations;
    });

    // Setup destination autocomplete
    this.destinationControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        if (typeof value === 'string' && value.length >= 2) {
          return this.destSvc.search(value);
        }
        return of([]);
      })
    ).subscribe(destinations => {
      this.destinationDestinations = destinations;
    });

    // Check for query parameters from home page
    this.route.queryParams.subscribe(params => {
      let shouldAutoSearch = false;

      // Check if this is package mode
      if (params['packageMode'] === 'true') {
        this.isPackageMode = true;
        this.packageDestination = params['to'] || params['city'] || '';
        this.packageIataCode = params['destinationLocationCode'] || params['iataCode'] || '';
        this.packageDeparture = params['departure'] || '';
        this.packageReturn = params['return'] || '';
      }

      // Handle origin
      if (params['originLocationCode'] || params['from']) {
        const originCode = params['originLocationCode'];
        const originName = params['from'];
        
        if (originCode) {
          this.destSvc.search(originName || originCode).subscribe(destinations => {
            if (destinations && destinations.length > 0) {
              const matchedDest = destinations.find(d => d.iataCode === originCode) || destinations[0];
              this.originControl.setValue(matchedDest);
              this.selectedOrigin = matchedDest;
              shouldAutoSearch = true;
            }
          });
        }
      }

      // Handle destination
      if (params['destinationLocationCode'] || params['to']) {
        const destCode = params['destinationLocationCode'];
        const destName = params['to'];
        
        if (destCode) {
          this.destSvc.search(destName || destCode).subscribe(destinations => {
            if (destinations && destinations.length > 0) {
              const matchedDest = destinations.find(d => d.iataCode === destCode) || destinations[0];
              this.destinationControl.setValue(matchedDest);
              this.selectedDestination = matchedDest;
              
              // Trigger search after both origin and destination are set
              if (shouldAutoSearch) {
                setTimeout(() => this.onSearch(), 800);
              }
            }
          });
        }
      }

      // Handle dates if provided
      if (params['departure']) {
        this.departureDate = new Date(params['departure']);
      }
      if (params['return']) {
        this.returnDate = new Date(params['return']);
      }
    });
  }

  displayDestination(dest: any): string {
    return dest && dest.name ? `${dest.name} (${dest.iataCode})` : '';
  }

  onSearch() {
    // Get selected origin and destination
    const originValue = this.originControl.value;
    const destinationValue = this.destinationControl.value;
    
    if (!originValue || !destinationValue || typeof originValue === 'string' || typeof destinationValue === 'string') {
      alert('Please select both origin and destination from the dropdown');
      return;
    }

    const origin = originValue.iataCode;
    const destination = destinationValue.iataCode;
    
    // Convert departure date to ISO format if set
    const departureDateStr = this.departureDate ? 
      this.departureDate.toISOString().split('T')[0] : '2026-02-15';
    
    console.log('Searching flights with:', { origin, destination, departureDate: departureDateStr });
    
    // Store origin and destination info for later use in booking
    sessionStorage.setItem('searchOriginCity', originValue.name);
    sessionStorage.setItem('searchOriginCode', originValue.iataCode);
    sessionStorage.setItem('searchDestinationCity', destinationValue.name);
    sessionStorage.setItem('searchDestinationCode', destinationValue.iataCode);
    
    this.isSearching = true;
    this.flightSvc.list(
      undefined,
      origin,
      destination,
      departureDateStr
    ).subscribe({
      next: (r) => {
        console.log('Flights received:', r);
        this.results = r;
        this.applyFilters();
        this.isSearching = false;
      },
      error: (err) => {
        console.error('Error fetching flights:', err);
        alert('Error fetching flights. Please try again.');
        this.isSearching = false;
      }
    });
  }

  applyFilters() {
    this.filteredResults = this.results.filter(flight => {
      const priceMatch = flight.price <= this.maxPrice;
      const airlineMatch = this.selectedAirlines.includes('all') || 
                          this.selectedAirlines.some(a => flight.airline?.toLowerCase().includes(a));
      return priceMatch && airlineMatch;
    });
  }

  onReset() {
    this.originControl.setValue('');
    this.destinationControl.setValue('');
    this.originDestinations = [];
    this.destinationDestinations = [];
    this.departureDate = null;
    this.returnDate = null;
    this.maxPrice = 1000;
    this.selectedAirlines = ['all'];
    this.results = [];
    this.filteredResults = [];
  }
}
