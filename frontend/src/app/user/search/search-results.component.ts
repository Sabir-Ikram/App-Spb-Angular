import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatListModule, MatButtonModule, MatIconModule],
  template: `
    <!-- Loading State -->
    <div *ngIf="isLoading" class="loading-container">
      <div class="loading-content">
        <div class="loading-plane-wrapper">
          <mat-icon class="loading-icon">flight_takeoff</mat-icon>
          <div class="loading-trail"></div>
        </div>
        <h3 class="loading-title">Searching for Your Perfect Flight</h3>
        <p class="loading-text">Comparing prices across hundreds of airlines</p>
        <div class="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>

    <!-- Results Grid -->
    <div *ngIf="!isLoading && results && results.length > 0" class="results-container">
      <div class="results-header">
        <div class="results-header-badge">
          <mat-icon>verified</mat-icon>
          <span>Best Prices Guaranteed</span>
        </div>
        <h2 class="results-title">
          {{results.length}} Flight{{results.length !== 1 ? 's' : ''}} Found
        </h2>
        <p class="results-subtitle">Instant confirmation • No hidden fees • Secure booking</p>
      </div>
      
      <div class="results-grid">
        <div *ngFor="let result of results" class="flight-card">
          <!-- Airline Header -->
          <div class="flight-card-header">
            <div class="airline-info">
              <div class="airline-logo-badge">
                <mat-icon>airlines</mat-icon>
              </div>
              <div class="airline-text">
                <span class="airline-name">{{ result.airline || 'Premium Airlines' }}</span>
                <span class="flight-number">{{ result.flightNumber || 'FL-000' }}</span>
              </div>
            </div>
            <span class="direct-badge">
              <mat-icon>done_all</mat-icon>
              Direct
            </span>
          </div>
          
          <!-- Route Visualization -->
          <div class="flight-route">
            <div class="route-point">
              <mat-icon class="route-icon">flight_takeoff</mat-icon>
              <div class="route-details">
                <span class="airport-code-large">{{ sessionStorage.getItem('searchOriginCity') || result.origin || 'Origin' }}</span>
                <span class="city-name">{{ result.origin || 'Departure' }}</span>
              </div>
            </div>
            
            <div class="route-line">
              <div class="plane-icon">
                <mat-icon>flight</mat-icon>
              </div>
            </div>
            
            <div class="route-point">
              <mat-icon class="route-icon destination-icon">flight_land</mat-icon>
              <div class="route-details">
                <span class="airport-code-large">{{ sessionStorage.getItem('searchDestinationCity') || result.destination || 'Destination' }}</span>
                <span class="city-name">{{ result.destination || 'Arrival' }}</span>
              </div>
            </div>
          </div>
          
          <!-- Flight Details -->
          <div class="flight-details">
            <div class="time-info">
              <div class="time-block">
                <mat-icon>schedule</mat-icon>
                <div class="time-text">
                  <span class="time-label">Departure</span>
                  <span class="time-value">{{ result.departure | date:'short' }}</span>
                </div>
              </div>
              <div class="time-block">
                <mat-icon>schedule</mat-icon>
                <div class="time-text">
                  <span class="time-label">Arrival</span>
                  <span class="time-value">{{ result.arrival | date:'short' }}</span>
                </div>
              </div>
            </div>
            
            <div class="flight-meta">
              <span class="meta-item">
                <mat-icon>airline_seat_recline_normal</mat-icon>
                {{ result.availableSeats || 0 }} seats
              </span>
              <span class="meta-item">
                <mat-icon>class</mat-icon>
                Economy
              </span>
              <span class="urgency-label" *ngIf="result.availableSeats && result.availableSeats < 5">
                <mat-icon>warning</mat-icon>
                Only {{ result.availableSeats }} left!
              </span>
            </div>
          </div>
          
          <!-- Price & Booking -->
          <div class="flight-footer">
            <div class="price-info">
              <span class="price-from">From</span>
              <span class="price-amount">{{ result.price | currency }}</span>
              <span class="price-unit">per person</span>
            </div>
            <button class="book-btn" (click)="onBook(result)">
              <span>Book Flight</span>
              <mat-icon>arrow_forward</mat-icon>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div *ngIf="!isLoading && (!results || results.length === 0)" class="empty-state">
      <div class="empty-illustration">
        <mat-icon class="empty-icon">flight_class</mat-icon>
        <div class="empty-decoration"></div>
      </div>
      <h3 class="empty-title">No Flights Available</h3>
      <p class="empty-text">We couldn't find any flights matching your search criteria</p>
      <div class="empty-suggestions-box">
        <h4 class="suggestions-title">Try these suggestions:</h4>
        <ul class="empty-suggestions">
          <li><mat-icon>calendar_today</mat-icon> Select different dates</li>
          <li><mat-icon>location_on</mat-icon> Check nearby airports</li>
          <li><mat-icon>payments</mat-icon> Adjust your price range</li>
          <li><mat-icon>filter_alt</mat-icon> Remove airline filters</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    /* ============================================
       LOADING STATE - PREMIUM
       ============================================ */
    .loading-container {
      max-width: 800px;
      margin: 60px auto;
      padding: 100px 40px;
      text-align: center;
      background: white;
      border-radius: 24px;
      box-shadow: 0 10px 40px rgba(139, 108, 80, 0.12);
      border: 1px solid rgba(139, 108, 80, 0.08);
    }

    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 28px;
    }

    .loading-plane-wrapper {
      position: relative;
      width: 120px;
      height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .loading-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #8b6c50;
      animation: planeFly 2.5s ease-in-out infinite;
      position: relative;
      z-index: 2;
      filter: drop-shadow(0 4px 12px rgba(139, 108, 80, 0.3));
    }

    @keyframes planeFly {
      0%, 100% { 
        transform: translateX(-15px) translateY(5px) rotate(-8deg);
      }
      50% { 
        transform: translateX(15px) translateY(-5px) rotate(8deg);
      }
    }

    .loading-trail {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 80px;
      height: 2px;
      background: linear-gradient(90deg, transparent 0%, rgba(139, 108, 80, 0.3) 50%, transparent 100%);
      transform: translate(-50%, -50%);
      animation: trailMove 2.5s ease-in-out infinite;
    }

    @keyframes trailMove {
      0%, 100% { opacity: 0.3; width: 60px; }
      50% { opacity: 0.6; width: 100px; }
    }

    .loading-title {
      font-family: 'Playfair Display', serif;
      font-size: 2rem;
      font-weight: 700;
      color: #2d2416;
      margin: 0;
      letter-spacing: -0.01em;
    }

    .loading-text {
      font-size: 1.15rem;
      color: #6d5d4b;
      margin: 0;
      font-weight: 500;
    }

    .loading-dots {
      display: flex;
      gap: 10px;
    }

    .loading-dots span {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #8b6c50;
      animation: dotBounce 1.4s infinite ease-in-out both;
    }

    .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
    .loading-dots span:nth-child(2) { animation-delay: -0.16s; }

    @keyframes dotBounce {
      0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
      40% { transform: scale(1); opacity: 1; }
    }

    /* ============================================
       RESULTS CONTAINER
       ============================================ */
    .results-container {
      max-width: 100%;
      margin: 0;
      padding: 0;
    }

    .results-header {
      text-align: center;
      margin-bottom: 48px;
      padding: 0 2rem;
    }

    .results-header-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, rgba(139, 108, 80, 0.1) 0%, rgba(139, 108, 80, 0.05) 100%);
      padding: 10px 24px;
      border-radius: 30px;
      color: #8b6c50;
      font-weight: 600;
      font-size: 0.9rem;
      margin-bottom: 16px;
      border: 1px solid rgba(139, 108, 80, 0.2);
    }

    .results-header-badge mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .results-title {
      font-family: 'Playfair Display', serif;
      font-size: 2.5rem;
      font-weight: 700;
      color: #2d2416;
      margin: 0 0 12px 0;
      letter-spacing: -0.02em;
    }

    .results-subtitle {
      font-size: 1.05rem;
      color: #6d5d4b;
      margin: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .results-subtitle::before,
    .results-subtitle::after {
      content: '•';
      color: #c4a574;
    }

    .results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 1.75rem;
      padding: 0 2rem;
    }

    /* ============================================
       PREMIUM FLIGHT CARDS - HOME STYLE
       ============================================ */
    .flight-card {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid rgba(139, 108, 80, 0.1);
    }
    
    .flight-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 12px 32px rgba(139, 108, 80, 0.2);
      border-color: #8b6c50;
    }
    
    /* Airline Header */
    .flight-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      background: linear-gradient(135deg, #fdfcfb 0%, white 100%);
      border-bottom: 1px solid rgba(139, 108, 80, 0.1);
    }
    
    .airline-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .airline-logo-badge {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, #8b6c50 0%, #6d5d4b 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(139, 108, 80, 0.25);
    }
    
    .airline-logo-badge mat-icon {
      color: white;
      font-size: 22px;
      width: 22px;
      height: 22px;
    }
    
    .airline-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    
    .airline-name {
      font-weight: 600;
      color: #2d2416;
      font-size: 0.95rem;
    }
    
    .flight-number {
      font-size: 0.8rem;
      color: #6d5d4b;
    }
    
    .direct-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
    }
    
    .direct-badge mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }
    
    /* Route Visualization */
    .flight-route {
      display: flex;
      align-items: center;
      padding: 1.75rem 1.5rem;
      background: linear-gradient(90deg, rgba(139, 108, 80, 0.04) 0%, transparent 50%, rgba(139, 108, 80, 0.04) 100%);
    }
    
    .route-point {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .route-icon {
      color: #8b6c50;
      font-size: 26px;
      width: 26px;
      height: 26px;
    }
    
    .route-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    
    .airport-code-large {
      font-size: 1.4rem;
      font-weight: 700;
      color: #2d2416;
      line-height: 1;
    }
    
    .city-name {
      font-size: 0.8rem;
      color: #6d5d4b;
    }
    
    .route-line {
      flex: 1;
      position: relative;
      height: 2px;
      background: linear-gradient(90deg, #8b6c50 0%, #c4a574 50%, #8b6c50 100%);
      margin: 0 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .plane-icon {
      background: white;
      border-radius: 50%;
      padding: 6px;
      box-shadow: 0 2px 8px rgba(139, 108, 80, 0.2);
    }
    
    .plane-icon mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #8b6c50;
      transform: rotate(90deg);
    }
    
    /* Flight Details */
    .flight-details {
      padding: 1.25rem 1.5rem;
    }
    
    .time-info {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin-bottom: 1rem;
    }
    
    .time-block {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      background: rgba(139, 108, 80, 0.05);
      border-radius: 10px;
    }
    
    .time-block mat-icon {
      color: #8b6c50;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    
    .time-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    
    .time-label {
      font-size: 0.7rem;
      color: #6d5d4b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .time-value {
      font-weight: 600;
      color: #2d2416;
      font-size: 0.85rem;
    }
    
    .flight-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      align-items: center;
    }
    
    .meta-item {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 6px 12px;
      background: rgba(139, 108, 80, 0.08);
      border-radius: 16px;
      font-size: 0.8rem;
      color: #2d2416;
    }
    
    .meta-item mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
      color: #8b6c50;
    }
    
    .urgency-label {
      display: flex;
      align-items: center;
      gap: 4px;
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      padding: 6px 12px;
      border-radius: 16px;
      font-size: 0.75rem;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
    }
    
    .urgency-label mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
      color: white;
    }
    
    /* Price & Booking Footer */
    .flight-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      border-top: 1px solid rgba(139, 108, 80, 0.1);
      background: linear-gradient(135deg, #fdfcfb 0%, white 100%);
    }
    
    .price-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    
    .price-from {
      font-size: 0.7rem;
      color: #6d5d4b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .price-amount {
      font-size: 1.75rem;
      font-weight: 700;
      color: #8b6c50;
      line-height: 1;
    }
    
    .price-unit {
      font-size: 0.75rem;
      color: #6d5d4b;
    }
    
    .book-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 1.5rem !important;
      height: 44px !important;
      border-radius: 12px !important;
      font-weight: 600 !important;
      background: linear-gradient(135deg, #8b6c50 0%, #6d5d4b 100%) !important;
      color: white !important;
      box-shadow: 0 4px 16px rgba(139, 108, 80, 0.3) !important;
      transition: all 0.3s !important;
      border: none;
      cursor: pointer;
    }
    
    .book-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(139, 108, 80, 0.4) !important;
    }
    
    .book-btn mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    /* ============================================
       EMPTY STATE - PREMIUM
       ============================================ */
    .empty-state {
      max-width: 700px;
      margin: 60px auto;
      padding: 80px 40px;
      text-align: center;
      background: white;
      border-radius: 24px;
      box-shadow: 0 10px 40px rgba(139, 108, 80, 0.12);
      border: 1px solid rgba(139, 108, 80, 0.08);
    }

    .empty-illustration {
      position: relative;
      width: 140px;
      height: 140px;
      margin: 0 auto 32px;
    }

    .empty-icon {
      font-size: 120px;
      width: 120px;
      height: 120px;
      color: rgba(139, 108, 80, 0.15);
      position: relative;
      z-index: 2;
    }

    .empty-decoration {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 100%;
      height: 100%;
      transform: translate(-50%, -50%);
      border: 3px dashed rgba(139, 108, 80, 0.12);
      border-radius: 50%;
      animation: rotate 20s linear infinite;
    }

    @keyframes rotate {
      from { transform: translate(-50%, -50%) rotate(0deg); }
      to { transform: translate(-50%, -50%) rotate(360deg); }
    }

    .empty-title {
      font-family: 'Playfair Display', serif;
      font-size: 2rem;
      font-weight: 700;
      color: #2d2416;
      margin: 0 0 12px 0;
      letter-spacing: -0.01em;
    }

    .empty-text {
      font-size: 1.1rem;
      color: #6d5d4b;
      margin: 0 0 32px 0;
      line-height: 1.6;
    }

    .empty-suggestions-box {
      background: linear-gradient(135deg, #f8f6f3 0%, #fdfcfb 100%);
      border-radius: 16px;
      padding: 28px;
      border: 1px solid rgba(139, 108, 80, 0.1);
    }

    .suggestions-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #2d2416;
      margin: 0 0 20px 0;
      text-align: left;
    }

    .empty-suggestions {
      text-align: left;
      margin: 0;
      padding: 0;
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .empty-suggestions li {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #2d2416;
      font-size: 0.95rem;
      font-weight: 500;
      padding: 12px 16px;
      background: white;
      border-radius: 10px;
      transition: all 0.2s ease;
    }

    .empty-suggestions li:hover {
      transform: translateX(6px);
      box-shadow: 0 4px 12px rgba(139, 108, 80, 0.1);
    }

    .empty-suggestions li mat-icon {
      color: #8b6c50;
      font-size: 20px;
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    /* ============================================
       RESPONSIVE DESIGN
       ============================================ */
    @media (max-width: 1024px) {
      .results-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .results-header {
        padding: 0 1rem;
        margin-bottom: 32px;
      }

      .results-title {
        font-size: 2rem;
      }

      .results-grid {
        padding: 0 1rem;
      }

      .flight-route {
        flex-direction: column;
        gap: 16px;
      }

      .route-line {
        width: 2px;
        height: 40px;
        margin: 0;
      }

      .plane-icon mat-icon {
        transform: rotate(180deg);
      }

      .flight-card-header {
        flex-direction: column;
        gap: 12px;
      }

      .time-info {
        grid-template-columns: 1fr;
      }

      .empty-state,
      .loading-container {
        padding: 60px 24px;
      }
    }

    @media (max-width: 480px) {
      .price-amount {
        font-size: 1.5rem;
      }

      .airport-code-large {
        font-size: 1.2rem;
      }

      .flight-card-header,
      .flight-route,
      .flight-details,
      .flight-footer {
        padding-left: 1rem;
        padding-right: 1rem;
      }
    }
  `]
})
export class SearchResultsComponent {
  @Input() results: any[] = [];
  @Input() isLoading: boolean = false;
  
  sessionStorage = sessionStorage;

  constructor(private router: Router) {}

  onBook(flight: any) {
    // Get origin and destination info from sessionStorage (stored during search)
    const originCity = sessionStorage.getItem('searchOriginCity') || '';
    const originCode = sessionStorage.getItem('searchOriginCode') || flight.origin || '';
    const destinationCity = sessionStorage.getItem('searchDestinationCity') || '';
    const destinationCode = sessionStorage.getItem('searchDestinationCode') || flight.destination || '';
    
    // Store flight data in sessionStorage for booking
    const flightData = {
      externalFlightId: flight.id?.toString() || '',
      origin: originCode,
      destination: destinationCode,
      destinationCity: destinationCity,
      departureDate: flight.departure ? new Date(flight.departure).toISOString().split('T')[0] : '',
      returnDate: flight.return ? new Date(flight.return).toISOString().split('T')[0] : undefined,
      airline: flight.airline || 'Unknown',
      flightNumber: flight.flightNumber || '',
      price: flight.price || 0,
      passengers: 1,
      itinerary: `${originCity || originCode} → ${destinationCity || destinationCode}`
    };
    console.log('Storing flight reservation data:', flightData);
    sessionStorage.setItem('pendingFlightReservation', JSON.stringify(flightData));
    this.router.navigate(['/booking']);
  }
}
