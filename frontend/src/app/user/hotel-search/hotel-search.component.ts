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
import { Router } from '@angular/router';
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
    <div class="search-page">
      <!-- Hero Section -->
      <div class="search-hero">
        <div class="search-hero-content">
          <mat-icon class="hero-icon">hotel</mat-icon>
          <h1 class="hero-title">Find Your Perfect Stay</h1>
          <p class="hero-subtitle">Discover and book hotels worldwide • Over 2,800+ properties powered by Booking.com</p>
        </div>
      </div>

      <!-- Search Form -->
      <mat-card class="search-container">
        <mat-card-content>
          <form (submit)="onSearch()">
            <h2 class="form-heading">
              <mat-icon>search</mat-icon>
              <span>Search Hotels</span>
            </h2>
            
            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>City / Location</mat-label>
                <mat-icon matPrefix>location_on</mat-icon>
                <input matInput [formControl]="cityControl" [matAutocomplete]="autoCity" placeholder="e.g., Paris, London, Casablanca" required />
                <mat-hint>Select your destination city</mat-hint>
                <mat-autocomplete #autoCity="matAutocomplete" [displayWith]="displayCity">
                  <mat-option *ngFor="let dest of cityDestinations" [value]="dest">
                    <mat-icon>place</mat-icon>
                    ${'{{dest.name}}'} (${'{{dest.iataCode}}'}) - ${'{{dest.country}}'}
                  </mat-option>
                </mat-autocomplete>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Check-in Date</mat-label>
                <mat-icon matPrefix>event</mat-icon>
                <input matInput [matDatepicker]="pickerIn" [(ngModel)]="checkInDate" name="checkInDate" placeholder="Select date" required />
                <mat-hint>When will you arrive?</mat-hint>
                <mat-datepicker-toggle matSuffix [for]="pickerIn"></mat-datepicker-toggle>
                <mat-datepicker #pickerIn></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Check-out Date</mat-label>
                <mat-icon matPrefix>event</mat-icon>
                <input matInput [matDatepicker]="pickerOut" [(ngModel)]="checkOutDate" name="checkOutDate" placeholder="Select date" required />
                <mat-hint>When will you leave?</mat-hint>
                <mat-datepicker-toggle matSuffix [for]="pickerOut"></mat-datepicker-toggle>
                <mat-datepicker #pickerOut></mat-datepicker>
              </mat-form-field>
            </div>

            <div class="search-actions">
              <button mat-raised-button color="primary" type="submit" class="search-btn" [disabled]="loading">
                <mat-icon>${'{{loading ? "hourglass_empty" : "search"}}'}</mat-icon>
                ${'{{loading ? "Searching..." : "Search Hotels"}}'}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <div class="loading-content">
          <mat-icon class="loading-icon">hotel</mat-icon>
          <h3 class="loading-title">Finding Perfect Hotels...</h3>
          <p class="loading-text">Searching through ${'{{currentLimit}}'} properties in your destination</p>
        </div>
      </div>

      <!-- Results Grid -->
      <div class="results-container" *ngIf="!loading && hotels.length > 0">
        <div class="results-header">
          <h2 class="results-title">
            <mat-icon>apartment</mat-icon>
            Available Hotels (${'{{ hotels.length }}'})</h2>
          <div class="pagination-controls">
            <span class="pagination-label">Results per search:</span>
            <button mat-stroked-button *ngFor="let limit of availableLimits" 
                    [class.active]="currentLimit === limit"
                    (click)="changeLimit(limit)">
              ${'{{ limit }}'}
            </button>
          </div>
        </div>
        
        <div class="hotels-grid">
          <mat-card *ngFor="let hotel of hotels" class="hotel-card">
            <div class="hotel-image-container">
              <img [src]="hotel.imageUrl" [alt]="hotel.name" class="hotel-image" />
              <div class="rating-badge">
                <mat-icon>star</mat-icon>
                <span>${'{{ hotel.rating }}'}</span>
              </div>
            </div>
            
            <mat-card-content class="hotel-content">
              <h3 class="hotel-name">${'{{ hotel.name }}'}</h3>
              
              <p class="hotel-address">
                <mat-icon>place</mat-icon>
                ${'{{ hotel.address }}'}
              </p>
              
              <p class="hotel-description">${'{{ hotel.description }}'}</p>
              
              <div class="hotel-amenities">
                <div class="amenity-item">
                  <mat-icon>hotel</mat-icon>
                  <span>${'{{ hotel.availableRooms }}'} rooms</span>
                </div>
                <div class="amenity-item">
                  <mat-icon>nights_stay</mat-icon>
                  <span>${'{{ calculateNights() }}'} nights</span>
                </div>
              </div>
              
              <div class="price-section">
                <div class="price-details">
                  <span class="price-label">From</span>
                  <span class="price-value">\$${'{{ hotel.pricePerNight }}'}</span>
                  <span class="price-period">per night</span>
                </div>
                <div class="total-price">
                  <span class="total-label">Total:</span>
                  <span class="total-value">\$${'{{ hotel.pricePerNight * calculateNights() }}'}</span>
                </div>
              </div>
            </mat-card-content>
            
            <mat-card-actions class="hotel-actions">
              <button mat-raised-button color="accent" (click)="onBook(hotel)" class="book-btn">
                <mat-icon>check_circle</mat-icon>
                Book Now
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && searched && hotels.length === 0" class="empty-state">
        <mat-icon class="empty-icon">hotel_class</mat-icon>
        <h3 class="empty-title">No Hotels Found</h3>
        <p class="empty-text">We couldn't find any hotels matching your criteria.</p>
        <ul class="empty-suggestions">
          <li>Try a different city or location</li>
          <li>Adjust your check-in/check-out dates</li>
          <li>Increase the results limit</li>
          <li>Search for nearby destinations</li>
        </ul>
      </div>
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
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
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

    /* Search Container */
    .search-container {
      max-width: 1200px;
      margin: -40px auto 48px;
      background: white !important;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      position: relative;
      z-index: 2;
    }

    mat-card-content {
      padding: 48px 40px !important;
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
      align-items: flex-start;
      flex-wrap: wrap;
      margin-bottom: 32px;
    }

    .form-field {
      flex: 1;
      min-width: 250px;
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

    .search-actions {
      display: flex;
      justify-content: center;
      padding-top: 16px;
      border-top: 2px solid #e9ecef;
    }

    .search-btn {
      height: 56px;
      padding: 0 48px !important;
      font-size: 1.1rem !important;
      font-weight: 600 !important;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .search-btn:hover:not([disabled]) {
      transform: translateY(-2px);
      box-shadow: 0 6px 24px rgba(102, 126, 234, 0.4);
    }

    .search-btn[disabled] {
      opacity: 0.7;
      cursor: not-allowed;
    }

    /* Loading State */
    .loading-container {
      max-width: 1000px;
      margin: 48px auto;
      padding: 80px 24px;
      text-align: center;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    }

    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }

    .loading-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: #667eea;
      animation: bounce 1.5s ease-in-out infinite;
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
    }

    .loading-title {
      font-size: 1.75rem;
      font-weight: 600;
      color: #2c3e50;
      margin: 0;
    }

    .loading-text {
      font-size: 1.1rem;
      color: #6c757d;
      margin: 0;
    }

    /* Results Container */
    .results-container {
      max-width: 1400px;
      margin: 0 auto 48px;
      padding: 0 24px 48px;
    }

    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
      flex-wrap: wrap;
      gap: 24px;
    }

    .results-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 2rem;
      font-weight: 700;
      color: #2c3e50;
      margin: 0;
    }

    .results-title mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #667eea;
    }

    .pagination-controls {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
    }

    .pagination-label {
      font-weight: 600;
      color: #495057;
      font-size: 1rem;
    }

    .pagination-controls button {
      min-width: 60px;
      height: 40px;
      font-weight: 500;
      border: 2px solid #dee2e6;
      transition: all 0.2s ease;
    }

    .pagination-controls button:hover {
      border-color: #667eea;
      color: #667eea;
      background-color: rgba(102, 126, 234, 0.05);
    }

    .pagination-controls button.active {
      background-color: #667eea;
      color: white;
      border-color: #667eea;
    }

    /* Hotels Grid */
    .hotels-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 32px;
    }

    .hotel-card {
      display: flex;
      flex-direction: column;
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.3s ease;
      border: 2px solid #e9ecef;
      height: 100%;
    }

    .hotel-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 12px 32px rgba(102, 126, 234, 0.2);
      border-color: #667eea;
    }

    .hotel-image-container {
      position: relative;
      width: 100%;
      height: 240px;
      overflow: hidden;
      background: #f0f0f0;
    }

    .hotel-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .hotel-card:hover .hotel-image {
      transform: scale(1.05);
    }

    .rating-badge {
      position: absolute;
      top: 16px;
      right: 16px;
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

    .rating-badge mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .hotel-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 24px !important;
    }

    .hotel-name {
      font-size: 1.5rem;
      font-weight: 700;
      color: #2c3e50;
      margin: 0 0 12px 0;
      line-height: 1.3;
    }

    .hotel-address {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #6c757d;
      margin: 0 0 16px 0;
      font-size: 0.95rem;
    }

    .hotel-address mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #667eea;
    }

    .hotel-description {
      color: #495057;
      margin: 0 0 20px 0;
      font-size: 0.95rem;
      line-height: 1.6;
      flex: 1;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
    }

    .hotel-amenities {
      display: flex;
      gap: 24px;
      margin-bottom: 20px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .amenity-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #495057;
      font-weight: 500;
      font-size: 0.95rem;
    }

    .amenity-item mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #667eea;
    }

    .price-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 8px;
      margin-top: auto;
    }

    .price-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .price-label {
      font-size: 0.85rem;
      color: #6c757d;
      font-weight: 500;
    }

    .price-value {
      font-size: 2rem;
      font-weight: 700;
      color: #667eea;
      line-height: 1;
    }

    .price-period {
      font-size: 0.85rem;
      color: #6c757d;
    }

    .total-price {
      text-align: right;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .total-label {
      font-size: 0.85rem;
      color: #6c757d;
      font-weight: 500;
    }

    .total-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #2c3e50;
    }

    .hotel-actions {
      padding: 20px 24px !important;
      display: flex;
      gap: 12px;
      justify-content: stretch;
      border-top: 2px solid #e9ecef;
    }

    .book-btn {
      flex: 1;
      height: 52px;
      font-size: 1.1rem !important;
      font-weight: 600 !important;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
      transition: all 0.3s ease;
    }

    .book-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 24px rgba(102, 126, 234, 0.4);
    }

    .book-btn mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    /* Empty State */
    .empty-state {
      max-width: 600px;
      margin: 48px auto;
      padding: 80px 24px;
      text-align: center;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    }

    .empty-icon {
      font-size: 100px;
      width: 100px;
      height: 100px;
      color: #dee2e6;
      margin-bottom: 24px;
    }

    .empty-title {
      font-size: 1.75rem;
      font-weight: 600;
      color: #2c3e50;
      margin: 0 0 16px 0;
    }

    .empty-text {
      font-size: 1.1rem;
      color: #6c757d;
      margin: 0 0 20px 0;
    }

    .empty-suggestions {
      text-align: left;
      display: inline-block;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .empty-suggestions li {
      padding: 8px 0;
      color: #495057;
      font-size: 1rem;
    }

    .empty-suggestions li::before {
      content: "✓";
      color: #667eea;
      font-weight: bold;
      margin-right: 12px;
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

      mat-card-content {
        padding: 32px 24px !important;
      }

      .form-row {
        flex-direction: column;
        gap: 16px;
      }

      .form-field {
        min-width: 100%;
      }

      .results-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .hotels-grid {
        grid-template-columns: 1fr;
      }

      .price-section {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }

      .total-price {
        text-align: left;
      }
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
    private router: Router
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
