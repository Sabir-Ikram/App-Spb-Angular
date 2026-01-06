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
    <div class="search-page">
      <!-- Hero Section -->
      <div class="search-hero">
        <div class="search-hero-content">
          <mat-icon class="hero-icon">{{isPackageMode ? 'card_travel' : 'flight_takeoff'}}</mat-icon>
          <h1 class="hero-title">{{isPackageMode ? 'Find Your Perfect Package' : 'Find Your Perfect Flight'}}</h1>
          <p class="hero-subtitle">{{isPackageMode ? 'Search flights and hotels for your complete travel package' : 'Search and compare flights from multiple airlines • Powered by Amadeus API'}}</p>
        </div>
      </div>

      <!-- Search Form -->
      <mat-card class="search-container fade-in">
        <div class="search-form">
          <h2 class="form-heading">
            <mat-icon>search</mat-icon>
            <span>Search Flights</span>
          </h2>
          
          <div class="form-row">
            <mat-form-field appearance="outline" class="half-field">
              <mat-label>From (Origin)</mat-label>
              <mat-icon matPrefix>flight_takeoff</mat-icon>
              <input matInput [formControl]="originControl" [matAutocomplete]="autoOrigin" placeholder="e.g. Paris, London, New York">
              <mat-hint>Select your departure city</mat-hint>
              <mat-autocomplete #autoOrigin="matAutocomplete" [displayWith]="displayDestination">
                <mat-option *ngFor="let dest of originDestinations" [value]="dest">
                  <mat-icon>location_on</mat-icon>
                  {{dest.name}} ({{dest.iataCode}}) - {{dest.country}}
                </mat-option>
              </mat-autocomplete>
            </mat-form-field>

            <mat-form-field appearance="outline" class="half-field">
              <mat-label>To (Destination)</mat-label>
              <mat-icon matPrefix>flight_land</mat-icon>
              <input matInput [formControl]="destinationControl" [matAutocomplete]="autoDestination" placeholder="e.g. Tokyo, Dubai, Casablanca">
              <mat-hint>Select your arrival city</mat-hint>
              <mat-autocomplete #autoDestination="matAutocomplete" [displayWith]="displayDestination">
                <mat-option *ngFor="let dest of destinationDestinations" [value]="dest">
                  <mat-icon>location_on</mat-icon>
                  {{dest.name}} ({{dest.iataCode}}) - {{dest.country}}
                </mat-option>
              </mat-autocomplete>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="half-field">
              <mat-label>Departure Date</mat-label>
              <mat-icon matPrefix>calendar_today</mat-icon>
              <input matInput [matDatepicker]="picker1" [(ngModel)]="departureDate" placeholder="Select date">
              <mat-hint>When do you want to leave?</mat-hint>
              <mat-datepicker-toggle matSuffix [for]="picker1"></mat-datepicker-toggle>
              <mat-datepicker #picker1></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline" class="half-field">
              <mat-label>Return Date (Optional)</mat-label>
              <mat-icon matPrefix>calendar_today</mat-icon>
              <input matInput [matDatepicker]="picker2" [(ngModel)]="returnDate" placeholder="Select date">
              <mat-hint>Leave empty for one-way</mat-hint>
              <mat-datepicker-toggle matSuffix [for]="picker2"></mat-datepicker-toggle>
              <mat-datepicker #picker2></mat-datepicker>
            </mat-form-field>
          </div>

          <div class="filter-section">
            <h3 class="filter-heading">
              <mat-icon>tune</mat-icon> 
              <span>Advanced Filters</span>
            </h3>
            
            <div class="price-filter">
              <label class="filter-label">
                <mat-icon>attach_money</mat-icon>
                Price Range: $0 - ${'{{maxPrice}}'}
              </label>
              <mat-slider min="0" max="2000" step="50" discrete>
                <input matSliderThumb [(ngModel)]="maxPrice">
              </mat-slider>
            </div>

            <div class="airline-chips">
              <label class="filter-label">
                <mat-icon>airlines</mat-icon>
                Airlines:
              </label>
              <mat-chip-listbox [(ngModel)]="selectedAirlines" multiple>
                <mat-chip-option value="all">All Airlines</mat-chip-option>
                <mat-chip-option value="delta">Delta</mat-chip-option>
                <mat-chip-option value="united">United</mat-chip-option>
                <mat-chip-option value="american">American</mat-chip-option>
              </mat-chip-listbox>
            </div>
          </div>

          <div class="search-actions">
            <button mat-stroked-button (click)="onReset()" class="reset-btn">
              <mat-icon>refresh</mat-icon>
              Reset Filters
            </button>
            <button mat-raised-button color="primary" (click)="onSearch()" class="search-btn" [disabled]="isSearching">
              <mat-icon>{{isSearching ? 'hourglass_empty' : 'search'}}</mat-icon>
              {{isSearching ? 'Searching...' : 'Search Flights'}}
            </button>
          </div>
        </div>
      </mat-card>
      
      <app-search-results [results]="filteredResults" [isLoading]="isSearching"></app-search-results>
    </div>
  `,
  styles: [`
    .search-page {
      padding: 0;
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    /* Hero Section */
    .search-hero {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 80px 24px 60px;
      text-align: center;
      color: white;
      position: relative;
      overflow: hidden;
    }

    .search-hero::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
                  radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%);
      pointer-events: none;
    }

    .search-hero-content {
      position: relative;
      z-index: 1;
      max-width: 800px;
      margin: 0 auto;
    }

    .hero-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 24px;
      animation: float 3s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    .hero-title {
      font-size: 3rem;
      font-weight: 700;
      margin: 0 0 16px 0;
      letter-spacing: -0.5px;
    }

    .hero-subtitle {
      font-size: 1.2rem;
      opacity: 0.95;
      margin: 0;
      font-weight: 300;
    }

    /* Package Notice */
    .package-notice {
      max-width: 1000px;
      margin: -20px auto 24px;
      padding: 20px 24px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%);
      border-left: 4px solid #667eea;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      position: relative;
      z-index: 3;
    }

    .package-notice mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #667eea;
      flex-shrink: 0;
    }

    .package-notice-content {
      flex: 1;
    }

    .package-notice-content h3 {
      margin: 0 0 8px 0;
      font-size: 1.1rem;
      color: #2c3e50;
      font-weight: 600;
    }

    .package-notice-content p {
      margin: 0;
      color: #546e7a;
      font-size: 0.95rem;
    }

    .package-notice-content a {
      color: #667eea;
      font-weight: 600;
      text-decoration: none;
      border-bottom: 2px solid transparent;
      transition: border-color 0.3s ease;
    }

    .package-notice-content a:hover {
      border-bottom-color: #667eea;
    }

    /* Search Container */
    .search-container {
      max-width: 1000px;
      margin: -40px auto 48px;
      background: white !important;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      position: relative;
      z-index: 2;
    }

    .search-form {
      padding: 48px 40px;
    }

    .form-heading {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 1.75rem;
      font-weight: 600;
      color: #2c3e50;
      margin: 0 0 32px 0;
    }

    .form-heading mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #667eea;
    }

    .form-row {
      display: flex;
      gap: 24px;
      margin-bottom: 24px;
    }

    .half-field {
      flex: 1;
    }

    mat-form-field {
      width: 100%;
    }

    ::ng-deep .mat-mdc-form-field {
      font-size: 1rem;
    }

    ::ng-deep .mat-mdc-text-field-wrapper {
      background-color: #f8f9fa;
    }

    ::ng-deep .mat-mdc-form-field-focus-overlay {
      background-color: rgba(102, 126, 234, 0.05);
    }

    /* Filter Section */
    .filter-section {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      padding: 32px;
      border-radius: 12px;
      margin: 32px 0;
      border: 1px solid #dee2e6;
    }

    .filter-heading {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 1.25rem;
      font-weight: 600;
      color: #2c3e50;
      margin: 0 0 24px 0;
    }

    .filter-heading mat-icon {
      color: #667eea;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .price-filter {
      margin-bottom: 32px;
    }

    .filter-label {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      font-weight: 600;
      color: #495057;
      font-size: 1rem;
    }

    .filter-label mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #667eea;
    }

    mat-slider {
      width: 100%;
    }

    ::ng-deep .mat-mdc-slider {
      --mdc-slider-active-track-color: #667eea;
      --mdc-slider-handle-color: #667eea;
      --mdc-slider-focus-handle-color: #667eea;
      --mdc-slider-hover-handle-color: #667eea;
    }

    .airline-chips {
      margin-top: 24px;
    }

    mat-chip-listbox {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    ::ng-deep mat-chip-option {
      font-weight: 500;
      transition: all 0.2s ease;
    }

    ::ng-deep mat-chip-option:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
    }

    /* Search Actions */
    .search-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      margin-top: 40px;
      padding-top: 32px;
      border-top: 2px solid #e9ecef;
    }

    .search-btn, .reset-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 36px !important;
      font-size: 1.05rem !important;
      font-weight: 600 !important;
      border-radius: 8px;
      transition: all 0.3s ease;
      letter-spacing: 0.3px;
    }

    .search-btn {
      height: 56px;
      box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
    }

    .search-btn:hover:not([disabled]) {
      transform: translateY(-2px);
      box-shadow: 0 6px 24px rgba(102, 126, 234, 0.4);
    }

    .search-btn[disabled] {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .reset-btn {
      height: 56px;
      border: 2px solid #dee2e6;
      color: #6c757d;
    }

    .reset-btn:hover {
      border-color: #667eea;
      color: #667eea;
      background-color: rgba(102, 126, 234, 0.05);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .search-hero {
        padding: 60px 20px 40px;
      }

      .hero-title {
        font-size: 2rem;
      }

      .hero-subtitle {
        font-size: 1rem;
      }

      .search-container {
        margin: -30px 16px 32px;
        border-radius: 12px;
      }

      .search-form {
        padding: 32px 24px;
      }

      .form-row {
        flex-direction: column;
        gap: 16px;
      }

      .filter-section {
        padding: 24px 20px;
      }

      .search-actions {
        flex-direction: column-reverse;
        gap: 12px;
      }

      .search-btn, .reset-btn {
        width: 100%;
        justify-content: center;
      }
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
