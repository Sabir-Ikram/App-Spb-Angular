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
        <mat-icon class="loading-icon">flight_takeoff</mat-icon>
        <h3 class="loading-title">Finding Best Flights...</h3>
        <p class="loading-text">Searching through airlines and routes for you</p>
      </div>
    </div>

    <!-- Results Grid -->
    <div *ngIf="!isLoading && results && results.length > 0" class="results-container">
      <div class="results-header">
        <h2 class="results-title">
          <mat-icon>flight</mat-icon>
          Available Flights ({{results.length}})
        </h2>
        <p class="results-subtitle">Select a flight to proceed with booking</p>
      </div>
      
      <div class="results-grid">
        <mat-card *ngFor="let result of results" class="flight-card">
          <div class="flight-card-header">
            <div class="airline-info">
              <mat-icon class="airline-icon">airlines</mat-icon>
              <div>
                <h3 class="airline-name">{{ result.airline || 'Flight' }}</h3>
                <p class="flight-number">{{ result.flightNumber || 'N/A' }}</p>
              </div>
            </div>
            <div class="price-badge">
              <span class="price-label">From</span>
              <span class="price-value">\${{ result.price }}</span>
            </div>
          </div>

          <mat-card-content>
            <div class="flight-route">
              <div class="route-point">
                <mat-icon>flight_takeoff</mat-icon>
                <div class="route-details">
                  <span class="route-label">Departure</span>
                  <span class="route-time">{{ result.departure | date: 'MMM d, h:mm a' }}</span>
                  <span class="route-location">{{ result.origin || 'N/A' }}</span>
                </div>
              </div>

              <div class="route-divider">
                <div class="route-line"></div>
                <mat-icon class="route-arrow">arrow_forward</mat-icon>
              </div>

              <div class="route-point">
                <mat-icon>flight_land</mat-icon>
                <div class="route-details">
                  <span class="route-label">Arrival</span>
                  <span class="route-time">{{ result.arrival | date: 'MMM d, h:mm a' }}</span>
                  <span class="route-location">{{ result.destination || 'N/A' }}</span>
                </div>
              </div>
            </div>

            <div class="flight-info">
              <div class="info-item">
                <mat-icon>event_seat</mat-icon>
                <span>{{ result.availableSeats || 0 }} seats available</span>
              </div>
            </div>
          </mat-card-content>

          <mat-card-actions>
            <button mat-raised-button color="accent" (click)="onBook(result)" class="book-btn">
              <mat-icon>flight</mat-icon>
              Book This Flight
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>

    <!-- Empty State -->
    <div *ngIf="!isLoading && (!results || results.length === 0)" class="empty-state">
      <mat-icon class="empty-icon">flight_class</mat-icon>
      <h3 class="empty-title">No Flights Found</h3>
      <p class="empty-text">Try adjusting your search criteria:</p>
      <ul class="empty-suggestions">
        <li>Try different dates</li>
        <li>Check alternative airports nearby</li>
        <li>Increase your price range</li>
        <li>Select "All Airlines" filter</li>
      </ul>
    </div>
  `,
  styles: [`
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
      animation: fly 2s ease-in-out infinite;
    }

    @keyframes fly {
      0%, 100% { transform: translateX(-20px) rotate(-5deg); }
      50% { transform: translateX(20px) rotate(5deg); }
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
      max-width: 1000px;
      margin: 48px auto;
      padding: 0 24px 48px;
    }

    .results-header {
      text-align: center;
      margin-bottom: 40px;
    }

    .results-title {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      font-size: 2rem;
      font-weight: 700;
      color: #2c3e50;
      margin: 0 0 12px 0;
    }

    .results-title mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #667eea;
    }

    .results-subtitle {
      font-size: 1.1rem;
      color: #6c757d;
      margin: 0;
    }

    .results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 24px;
    }

    /* Flight Card */
    .flight-card {
      transition: all 0.3s ease;
      border-radius: 12px;
      overflow: hidden;
      border: 2px solid #e9ecef;
    }

    .flight-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(102, 126, 234, 0.2);
      border-color: #667eea;
    }

    .flight-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .airline-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .airline-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      opacity: 0.9;
    }

    .airline-name {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 0 4px 0;
    }

    .flight-number {
      font-size: 0.9rem;
      opacity: 0.9;
      margin: 0;
    }

    .price-badge {
      text-align: right;
    }

    .price-label {
      display: block;
      font-size: 0.85rem;
      opacity: 0.9;
      margin-bottom: 4px;
    }

    .price-value {
      display: block;
      font-size: 1.75rem;
      font-weight: 700;
    }

    mat-card-content {
      padding: 32px 24px !important;
    }

    /* Flight Route */
    .flight-route {
      display: flex;
      align-items: center;
      gap: 24px;
      margin-bottom: 24px;
    }

    .route-point {
      flex: 1;
      display: flex;
      gap: 12px;
    }

    .route-point mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #667eea;
      margin-top: 4px;
    }

    .route-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .route-label {
      font-size: 0.85rem;
      color: #6c757d;
      font-weight: 500;
    }

    .route-time {
      font-size: 1.1rem;
      font-weight: 600;
      color: #2c3e50;
    }

    .route-location {
      font-size: 0.95rem;
      color: #495057;
    }

    .route-divider {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      min-width: 60px;
    }

    .route-line {
      width: 100%;
      height: 2px;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    }

    .route-arrow {
      color: #667eea;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    /* Flight Info */
    .flight-info {
      display: flex;
      gap: 16px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #495057;
      font-weight: 500;
    }

    .info-item mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #667eea;
    }

    mat-card-actions {
      padding: 0 24px 24px !important;
    }

    .book-btn {
      width: 100%;
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
      .results-grid {
        grid-template-columns: 1fr;
      }

      .flight-route {
        flex-direction: column;
        align-items: stretch;
      }

      .route-divider {
        flex-direction: row;
        width: 100%;
        min-width: auto;
        padding: 12px 0;
      }

      .route-line {
        height: 100%;
        width: 2px;
      }

      .route-arrow {
        transform: rotate(90deg);
      }

      .flight-card-header {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }

      .airline-info {
        flex-direction: column;
      }

      .price-badge {
        text-align: center;
      }
    }
  `]
})
export class SearchResultsComponent {
  @Input() results: any[] = [];
  @Input() isLoading: boolean = false;

  constructor(private router: Router) {}

  onBook(flight: any) {
    // Store flight data in sessionStorage for booking
    const flightData = {
      externalFlightId: flight.id?.toString() || '',
      origin: flight.origin || '',
      destination: flight.destination || '',
      departureDate: flight.departure ? new Date(flight.departure).toISOString().split('T')[0] : '',
      returnDate: flight.return ? new Date(flight.return).toISOString().split('T')[0] : undefined,
      airline: flight.airline || 'Unknown',
      flightNumber: flight.flightNumber || '',
      price: flight.price || 0,
      passengers: 1,
      itinerary: `${flight.origin || ''} → ${flight.destination || ''}`
    };
    console.log('Storing flight reservation data:', flightData);
    sessionStorage.setItem('pendingFlightReservation', JSON.stringify(flightData));
    this.router.navigate(['/booking']);
  }
}
