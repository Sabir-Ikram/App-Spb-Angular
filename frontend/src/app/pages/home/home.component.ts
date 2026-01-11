import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { RouterModule } from '@angular/router';
import { DestinationService } from '../../services/destination.service';
import { HotelService, Hotel } from '../../services/hotel.service';
import { FlightService } from '../../services/flight.service';
import { ImageService } from '../../services/image.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of, Observable } from 'rxjs';

interface Destination {
  id: string;
  name: string;
  iataCode: string;
  country: string;
  city?: string;
  description?: string;
  imageUrl?: string;
  imageAlt?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule, MatAutocompleteModule, RouterModule],
  template: `
    <!-- PREMIUM HERO SECTION - Booking.com Style with Dynamic Moroccan Monuments -->
    <div class="hero-section" [style.background-image]="heroImage ? 'url(' + heroImage + ')' : 'none'">
      <div class="hero-overlay"></div>
      
      <!-- Background Info Badge -->
      <div class="monument-info-badge" *ngIf="moroccanMonuments[currentImageIndex]">
        <mat-icon>location_on</mat-icon>
        <span>{{ moroccanMonuments[currentImageIndex].title }}</span>
      </div>
      
      <div class="hero-content-wrapper">
        
        <!-- Hero Headline with Dynamic Animated Text -->
        <div class="hero-headline">
          <h1 class="hero-main-title">
            <span class="title-static">Find Your Perfect</span>
            <span class="title-animated">{{ displayedText }}<span class="cursor">|</span></span>
          </h1>
        </div>
        <p class="hero-main-subtitle">Search hotels, flights and packages across Morocco • Compare prices • Book instantly</p>

        <!-- PREMIUM SEARCH WIDGET - Booking.com Style -->
        <div class="search-widget-premium">
          
          <!-- Tabbed Navigation -->
          <div class="search-tabs-premium">
            <button class="search-tab-premium" 
                    [class.active]="activeSearchTab === 'hotels'"
                    (click)="activeSearchTab = 'hotels'">
              <mat-icon>hotel</mat-icon>
              <span>Hotels</span>
            </button>
            <button class="search-tab-premium" 
                    [class.active]="activeSearchTab === 'flights'"
                    (click)="activeSearchTab = 'flights'">
              <mat-icon>flight_takeoff</mat-icon>
              <span>Flights</span>
            </button>
            <button class="search-tab-premium" 
                    [class.active]="activeSearchTab === 'packages'"
                    (click)="activeSearchTab = 'packages'">
              <mat-icon>card_travel</mat-icon>
              <span>Packages</span>
            </button>
          </div>

          <!-- Search Form Container -->
          <div class="search-form-premium">
            
            <!-- HOTELS TAB CONTENT -->
            <div class="search-form-content" *ngIf="activeSearchTab === 'hotels'">
              <div class="form-row-premium">
                <div class="form-field-premium form-field-destination">
                  <mat-icon class="field-icon">location_on</mat-icon>
                  <input type="text" 
                         class="premium-input" 
                         placeholder="Where are you going?"
                         [formControl]="hotelDestinationControl"
                         [matAutocomplete]="autoHotelDest">
                  <label class="floating-label">Destination</label>
                  <mat-autocomplete #autoHotelDest="matAutocomplete" [displayWith]="displayDestination">
                    <mat-option *ngFor="let dest of hotelDestinations" [value]="dest">
                      <mat-icon>place</mat-icon>
                      {{dest.name}} ({{dest.iataCode}}) - {{dest.country}}
                    </mat-option>
                  </mat-autocomplete>
                </div>
                
                <div class="form-field-premium form-field-checkin">
                  <mat-icon class="field-icon">event</mat-icon>
                  <input type="date" 
                         class="premium-input" 
                         placeholder="Check-in"
                         [(ngModel)]="searchCheckIn">
                  <label class="floating-label">Check-in</label>
                </div>
                
                <div class="form-field-premium form-field-checkout">
                  <mat-icon class="field-icon">event</mat-icon>
                  <input type="date" 
                         class="premium-input" 
                         placeholder="Check-out"
                         [(ngModel)]="searchCheckOut">
                  <label class="floating-label">Check-out</label>
                </div>
                
                <div class="form-field-premium form-field-guests">
                  <mat-icon class="field-icon">person</mat-icon>
                  <input type="text" 
                         class="premium-input" 
                         placeholder="2 adults · 1 room"
                         [(ngModel)]="searchGuests">
                  <label class="floating-label">Guests & Rooms</label>
                </div>
                
                <button class="search-btn-premium" (click)="onSearchHotels()">
                  <mat-icon>search</mat-icon>
                  <span>Search</span>
                </button>
              </div>
            </div>

            <!-- FLIGHTS TAB CONTENT -->
            <div class="search-form-content" *ngIf="activeSearchTab === 'flights'">
              <div class="form-row-premium">
                <div class="form-field-premium form-field-from">
                  <mat-icon class="field-icon">flight_takeoff</mat-icon>
                  <input type="text" 
                         class="premium-input" 
                         placeholder="From: City or airport"
                         [formControl]="flightFromControl"
                         [matAutocomplete]="autoFlightFrom">
                  <label class="floating-label">From</label>
                  <mat-autocomplete #autoFlightFrom="matAutocomplete" [displayWith]="displayDestination">
                    <mat-option *ngFor="let dest of flightFromDestinations" [value]="dest">
                      <mat-icon>flight_takeoff</mat-icon>
                      {{dest.name}} ({{dest.iataCode}}) - {{dest.country}}
                    </mat-option>
                  </mat-autocomplete>
                </div>
                
                <div class="form-field-premium form-field-to">
                  <mat-icon class="field-icon">flight_land</mat-icon>
                  <input type="text" 
                         class="premium-input" 
                         placeholder="To: City or airport"
                         [formControl]="flightToControl"
                         [matAutocomplete]="autoFlightTo">
                  <label class="floating-label">To</label>
                  <mat-autocomplete #autoFlightTo="matAutocomplete" [displayWith]="displayDestination">
                    <mat-option *ngFor="let dest of flightToDestinations" [value]="dest">
                      <mat-icon>flight_land</mat-icon>
                      {{dest.name}} ({{dest.iataCode}}) - {{dest.country}}
                    </mat-option>
                  </mat-autocomplete>
                </div>
                
                <div class="form-field-premium form-field-departure">
                  <mat-icon class="field-icon">event</mat-icon>
                  <input type="date" 
                         class="premium-input" 
                         placeholder="Departure date"
                         [(ngModel)]="searchDeparture">
                  <label class="floating-label">Depart</label>
                </div>
                
                <div class="form-field-premium form-field-return">
                  <mat-icon class="field-icon">event</mat-icon>
                  <input type="date" 
                         class="premium-input" 
                         placeholder="Return date"
                         [(ngModel)]="searchReturn">
                  <label class="floating-label">Return</label>
                </div>
                
                <button class="search-btn-premium" (click)="onSearchFlights()">
                  <mat-icon>search</mat-icon>
                  <span>Search</span>
                </button>
              </div>
            </div>

            <!-- PACKAGES TAB CONTENT -->
            <div class="search-form-content" *ngIf="activeSearchTab === 'packages'">
              <div class="form-row-premium">
                <div class="form-field-premium form-field-from">
                  <mat-icon class="field-icon">flight_takeoff</mat-icon>
                  <input type="text" 
                         class="premium-input" 
                         placeholder="From: Your city"
                         [formControl]="packageFromControl"
                         [matAutocomplete]="autoPackageFrom">
                  <label class="floating-label">From</label>
                  <mat-autocomplete #autoPackageFrom="matAutocomplete" [displayWith]="displayDestination">
                    <mat-option *ngFor="let dest of packageFromDestinations" [value]="dest">
                      <mat-icon>flight_takeoff</mat-icon>
                      {{dest.name}} ({{dest.iataCode}}) - {{dest.country}}
                    </mat-option>
                  </mat-autocomplete>
                </div>
                
                <div class="form-field-premium form-field-destination">
                  <mat-icon class="field-icon">flight_land</mat-icon>
                  <input type="text" 
                         class="premium-input" 
                         placeholder="To: Destination"
                         [formControl]="packageDestinationControl"
                         [matAutocomplete]="autoPackageDest">
                  <label class="floating-label">To</label>
                  <mat-autocomplete #autoPackageDest="matAutocomplete" [displayWith]="displayDestination">
                    <mat-option *ngFor="let dest of packageDestinations" [value]="dest">
                      <mat-icon>place</mat-icon>
                      {{dest.name}} ({{dest.iataCode}}) - {{dest.country}}
                    </mat-option>
                  </mat-autocomplete>
                </div>
                
                <div class="form-field-premium form-field-departure">
                  <mat-icon class="field-icon">event</mat-icon>
                  <input type="date" 
                         class="premium-input" 
                         placeholder="Check-in / Departure"
                         [(ngModel)]="searchPackageDepartureDate">
                  <label class="floating-label">Depart</label>
                </div>
                
                <div class="form-field-premium form-field-return">
                  <mat-icon class="field-icon">event</mat-icon>
                  <input type="date" 
                         class="premium-input" 
                         placeholder="Check-out / Return"
                         [(ngModel)]="searchPackageReturnDate">
                  <label class="floating-label">Return</label>
                </div>
                
                <div class="form-field-premium form-field-travelers">
                  <mat-icon class="field-icon">person</mat-icon>
                  <input type="text" 
                         class="premium-input" 
                         placeholder="2 travelers"
                         [(ngModel)]="searchPackageTravelers">
                  <label class="floating-label">Travelers</label>
                </div>
                
                <button class="search-btn-premium" (click)="onSearchPackages()">
                  <mat-icon>search</mat-icon>
                  <span>Search</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        <!-- Feature Badges - Booking.com Style -->
        <div class="hero-trust-badges">
          <div class="trust-badge trust-badge-glass">
            <mat-icon>verified</mat-icon>
            <span>Best Price Guarantee</span>
          </div>
          <div class="trust-badge trust-badge-glass">
            <mat-icon>schedule</mat-icon>
            <span>Free Cancellation</span>
          </div>
          <div class="trust-badge trust-badge-glass">
            <mat-icon>support_agent</mat-icon>
            <span>24/7 Customer Support</span>
          </div>
        </div>

      </div>
    </div>

    <div class="container features-section">
      <h2 class="section-title text-center mb-4">Why Travelers Choose Us</h2>
      <div class="features-grid">
        <mat-card class="feature-card fade-in">
          <div class="feature-icon-wrapper">
            <mat-icon class="feature-icon">flight_takeoff</mat-icon>
          </div>
          <h3>Best Flight Prices</h3>
          <p>Real-time flight search powered by Amadeus API with competitive prices from major airlines</p>
        </mat-card>
        
        <mat-card class="feature-card fade-in">
          <div class="feature-icon-wrapper">
            <mat-icon class="feature-icon">apartment</mat-icon>
          </div>
          <h3>Verified Hotels</h3>
          <p>Over 2,800+ hotels in every major city, powered by Booking.com with verified reviews</p>
        </mat-card>
        
        <mat-card class="feature-card fade-in">
          <div class="feature-icon-wrapper">
            <mat-icon class="feature-icon">lock</mat-icon>
          </div>
          <h3>Secure Booking</h3>
          <p>Your reservations and payment information are protected with industry-standard encryption</p>
        </mat-card>
        
        <mat-card class="feature-card fade-in">
          <div class="feature-icon-wrapper">
            <mat-icon class="feature-icon">support_agent</mat-icon>
          </div>
          <h3>Easy Management</h3>
          <p>Track all your reservations in one place with real-time status updates</p>
        </mat-card>
      </div>
    </div>

    <!-- Popular Destinations Section -->
    <div class="container destinations-section">
      <h2 class="section-title text-center mb-4">
        <mat-icon class="section-icon">explore</mat-icon>
        Popular Destinations
      </h2>
      <p class="section-subtitle">Explore trending cities and start planning your next trip</p>
      
      <div *ngIf="loadingDestinations" class="loading-center">
        <mat-spinner diameter="50" color="primary"></mat-spinner>
        <p class="loading-text">Discovering amazing destinations...</p>
      </div>
      
      <div class="destinations-grid" *ngIf="!loadingDestinations && destinations.length > 0">
        <mat-card class="destination-card fade-in" 
                  [class.morocco]="isMorocco(dest)" 
                  *ngFor="let dest of destinations">
          <div class="destination-image-container">
            <img *ngIf="dest.imageUrl" 
                 [src]="dest.imageUrl" 
                 [alt]="dest.imageAlt || (dest.city || dest.name)"
                 class="destination-image"
                 loading="lazy">
            <div *ngIf="!dest.imageUrl" class="destination-image-placeholder">
              <mat-icon class="placeholder-icon">location_city</mat-icon>
            </div>
            <div class="destination-overlay">
              <h3 class="destination-name">{{ dest.city || dest.name }}</h3>
              <p class="destination-country-overlay">
                <mat-icon class="inline-icon">flag</mat-icon>
                {{ dest.country }}
              </p>
            </div>
            <span *ngIf="isMorocco(dest)" class="morocco-badge">
              <mat-icon style="font-size: 12px; width: 12px; height: 12px;">star</mat-icon>
              Morocco
            </span>
            <span class="destination-code-badge">{{ dest.iataCode || dest.id }}</span>
          </div>
          <mat-card-content>
            <div class="destination-info-compact">
              <mat-icon class="info-icon">explore</mat-icon>
              <span class="info-text">Explore flights & hotels</span>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-stroked-button color="primary" routerLink="/search" class="action-btn">
              <mat-icon>flight_takeoff</mat-icon>
              View Flights
            </button>
            <button mat-stroked-button color="accent" routerLink="/hotels" class="action-btn">
              <mat-icon>hotel</mat-icon>
              View Hotels
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
      
      <div *ngIf="!loadingDestinations && destinations.length === 0" class="empty-state">
        <mat-icon class="empty-icon">explore_off</mat-icon>
        <h3>No Destinations Available</h3>
        <p>Check back later for exciting travel options</p>
      </div>
    </div>

    <!-- Trending Destinations Carousel -->
    <div class="trending-section">
      <div class="container">
        <h2 class="section-title text-center mb-4">
          <mat-icon class="section-icon">trending_up</mat-icon>
          Trending This Month
        </h2>
        <p class="section-subtitle">Discover where travelers are heading right now</p>
        
        <div class="trending-carousel">
          <div class="trending-card" *ngFor="let trend of trendingDestinations">
            <div class="trending-image" [style.background-image]="'url(' + trend.image + ')'">
              <div class="trending-badge">{{ trend.badge }}</div>
            </div>
            <div class="trending-info">
              <h3 class="trending-title">{{ trend.city }}</h3>
              <p class="trending-country">{{ trend.country }}</p>
              <div class="trending-stats">
                <span class="trending-stat">
                  <mat-icon>trending_up</mat-icon>
                  {{ trend.growth }}
                </span>
                <span class="trending-price">From {{ trend.price }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Featured Flights Section -->
    <div class="container flights-section">
      <h2 class="section-title text-center mb-4">
        <mat-icon class="section-icon">flight</mat-icon>
        Featured Flights
      </h2>
      <p class="section-subtitle">Best deals on popular routes</p>
      
      <div *ngIf="loadingFlights" class="loading-center">
        <mat-spinner diameter="50" color="primary"></mat-spinner>
        <p class="loading-text">Finding best flight deals...</p>
      </div>
      
      <div class="flights-grid" *ngIf="!loadingFlights && flights.length > 0">
        <mat-card class="flight-card fade-in" *ngFor="let flight of flights">
          <div class="flight-header">
            <div class="flight-airline" *ngIf="flight.airline">
              <mat-icon class="airline-icon">local_airport</mat-icon>
              <span class="airline-name">{{ flight.airline }}</span>
              <span class="flight-number" *ngIf="flight.flightNumber">{{ flight.flightNumber }}</span>
            </div>
            <div class="route">
              <div class="route-point">
                <mat-icon class="route-icon">flight_takeoff</mat-icon>
                <span class="airport">{{ flight.origin || flight.departure }}</span>
                <span class="airport-label" *ngIf="flight.originCity">{{ flight.originCity }}</span>
              </div>
              <div class="route-divider">
                <mat-icon class="plane-icon">flight</mat-icon>
                <span class="duration" *ngIf="flight.duration">{{ flight.duration }}</span>
              </div>
              <div class="route-point">
                <mat-icon class="route-icon">flight_land</mat-icon>
                <span class="airport">{{ flight.destination || flight.arrival }}</span>
                <span class="airport-label" *ngIf="flight.destinationCity">{{ flight.destinationCity }}</span>
              </div>
            </div>
          </div>
          <mat-card-content>
            <div class="flight-details">
              <div class="detail-row">
                <div class="detail-item">
                  <div class="detail-label">
                    <mat-icon class="detail-icon">schedule</mat-icon>
                    <span>Departure</span>
                  </div>
                  <span class="value">{{ flight.departure | date:'short' }}</span>
                </div>
                <div class="detail-item">
                  <div class="detail-label">
                    <mat-icon class="detail-icon">schedule</mat-icon>
                    <span>Arrival</span>
                  </div>
                  <span class="value">{{ flight.arrival | date:'short' }}</span>
                </div>
              </div>
              <div class="flight-info-grid">
                <div class="info-box">
                  <mat-icon class="info-icon">airline_seat_recline_normal</mat-icon>
                  <div class="info-content">
                    <span class="info-label">Available Seats</span>
                    <span class="info-value">{{ flight.availableSeats }}</span>
                  </div>
                </div>
                <div class="info-box" *ngIf="flight.class">
                  <mat-icon class="info-icon">class</mat-icon>
                  <div class="info-content">
                    <span class="info-label">Class</span>
                    <span class="info-value">{{ flight.class || 'Economy' }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="flight-price-section">
              <div class="price-label">Price per person</div>
              <div class="flight-price">{{ flight.price | currency }}</div>
              <div class="price-note" *ngIf="flight.availableSeats < 5">
                <mat-icon class="warning-icon">warning</mat-icon>
                <span>Only {{ flight.availableSeats }} seats left!</span>
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" routerLink="/search" class="book-button">
              <mat-icon>flight_takeoff</mat-icon>
              <span>Book This Flight</span>
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
      
      <div *ngIf="!loadingFlights && flights.length === 0" class="empty-state">
        <mat-icon class="empty-icon">flight</mat-icon>
        <h3>No Flights Available</h3>
        <p>Check back later for exciting flight deals</p>
        <button mat-raised-button color="primary" routerLink="/search" style="margin-top: 20px;">
          <mat-icon>search</mat-icon>
          Search Flights
        </button>
      </div>
    </div>

    <!-- Featured Hotels Section -->
    <div class="container hotels-section">
      <h2 class="section-title text-center mb-4">
        <mat-icon class="section-icon">apartment</mat-icon>
        Featured Hotels
      </h2>
      <p class="section-subtitle">Handpicked accommodations for your perfect stay</p>
      
      <div *ngIf="loadingHotels" class="loading-center">
        <mat-spinner diameter="50" color="primary"></mat-spinner>
        <p class="loading-text">Discovering amazing hotels...</p>
      </div>
      
      <div class="hotels-grid" *ngIf="!loadingHotels && hotels.length > 0">
        <mat-card class="hotel-card fade-in" *ngFor="let hotel of hotels">
          <div class="hotel-image-container">
            <img *ngIf="hotel.imageUrl" [src]="hotel.imageUrl" alt="{{ hotel.name }}" class="hotel-image">
            <div *ngIf="!hotel.imageUrl" class="hotel-image-placeholder">
              <mat-icon class="placeholder-icon">apartment</mat-icon>
            </div>
            <div class="hotel-rating-badge" *ngIf="hotel.rating">
              <mat-icon class="star-icon">star</mat-icon>
              <span>{{ hotel.rating }}</span>
            </div>
          </div>
          <mat-card-content>
            <h3 class="hotel-name">{{ hotel.name }}</h3>
            <div class="hotel-location">
              <mat-icon class="location-icon">location_on</mat-icon>
              <span>{{ hotel.address }}</span>
            </div>
            <p class="hotel-description">{{ hotel.description || 'Comfortable accommodation with modern amenities' }}</p>
            <div class="hotel-details">
              <div class="hotel-price">
                <div class="price-label">From</div>
                <div class="price-value">{{ hotel.pricePerNight | currency }}</div>
                <div class="price-unit">per night</div>
              </div>
              <div class="hotel-availability">
                <mat-icon class="availability-icon">meeting_room</mat-icon>
                <span>{{ hotel.availableRooms }} rooms</span>
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="accent" routerLink="/hotels" class="book-button">
              <mat-icon>hotel</mat-icon>
              <span>View Details</span>
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
      
      <div *ngIf="!loadingHotels && hotels.length === 0" class="empty-state">
        <mat-icon class="empty-icon">apartment</mat-icon>
        <h3>No Hotels Available</h3>
        <p>Check back later for amazing hotel deals</p>
        <button mat-raised-button color="accent" routerLink="/hotels" style="margin-top: 20px;">
          <mat-icon>search</mat-icon>
          Find Hotels
        </button>
      </div>
    </div>

    <!-- Customer Reviews Section -->
    <div class="reviews-section">
      <div class="container">
        <h2 class="section-title text-center mb-4">
          <mat-icon class="section-icon">star</mat-icon>
          What Travelers Say
        </h2>
        <p class="section-subtitle">Join thousands of satisfied customers</p>
        
        <div class="reviews-grid">
          <mat-card class="review-card" *ngFor="let review of customerReviews">
            <div class="review-header">
              <div class="review-avatar">{{ review.initials }}</div>
              <div class="review-author-info">
                <h4 class="review-author">{{ review.name }}</h4>
                <div class="review-rating">
                  <mat-icon *ngFor="let star of [1,2,3,4,5]" class="star-icon">star</mat-icon>
                </div>
              </div>
            </div>
            <p class="review-text">"{{ review.text }}"</p>
            <div class="review-footer">
              <mat-icon class="verified-icon">verified</mat-icon>
              <span class="verified-text">Verified Traveler</span>
            </div>
          </mat-card>
        </div>
      </div>
    </div>

    <!-- Newsletter Signup Section -->
    <div class="newsletter-section">
      <div class="container">
        <div class="newsletter-content">
          <div class="newsletter-text">
            <h2 class="newsletter-title">
              <mat-icon>email</mat-icon>
              Get Exclusive Travel Deals
            </h2>
            <p class="newsletter-subtitle">Subscribe to receive special offers, travel tips, and destination inspiration</p>
          </div>
          <div class="newsletter-form">
            <div class="newsletter-input-group">
              <mat-icon class="input-icon">email</mat-icon>
              <input type="email" placeholder="Enter your email address" class="newsletter-input">
              <button mat-raised-button color="accent" class="newsletter-btn">
                Subscribe
              </button>
            </div>
            <p class="newsletter-privacy">We respect your privacy. Unsubscribe anytime.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Final CTA Section -->
    <div class="cta-section">
      <div class="cta-content fade-in">
        <h2>Ready to Start Your Journey?</h2>
        <p>Join thousands of happy travelers who trust VoyageConnect</p>
        <div class="cta-buttons">
          <button mat-raised-button color="accent" routerLink="/auth/register" class="cta-btn">
            <mat-icon>person_add</mat-icon>
            Create Free Account
          </button>
          <button mat-stroked-button routerLink="/auth/login" class="cta-btn-secondary">
            <mat-icon>login</mat-icon>
            Sign In
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ============================================
       LUXURY TRAVEL PLATFORM - PREMIUM REDESIGN
       Elegant Booking Experience - Gold & Navy
       ============================================ */
    
    :host {
      display: block;
      background: var(--gray-50);
      --gold-accent: #d4af37;
      --navy-primary: #0a192f;
      --navy-secondary: #172a45;
      --white-glass: rgba(255, 255, 255, 0.92);
      --shadow-luxury: 0 32px 64px rgba(0, 0, 0, 0.12);
      --shadow-hover: 0 40px 80px rgba(0, 0, 0, 0.18);
      --transition-smooth: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    /* ============================================
       LUXURY HERO SECTION - PREMIUM ELEVATION
       ============================================ */
    .hero-section {
      position: relative;
      min-height: 85vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-size: cover;
      background-position: center center;
      background-repeat: no-repeat;
      background-color: var(--navy-primary);
      overflow: hidden;
      transition: background-image 2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        135deg,
        rgba(10, 25, 47, 0.35) 0%,
        rgba(15, 52, 96, 0.45) 50%,
        rgba(10, 25, 47, 0.55) 100%
      );
      z-index: 1;
    }

    .hero-content-wrapper {
      position: relative;
      z-index: 2;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 4rem 2rem 2.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2rem;
      animation: slideUp 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(40px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Monument Info Badge - Semi-Transparent Glass */
    .monument-info-badge {
      position: absolute;
      top: 2rem;
      left: 2rem;
      background: rgba(255, 255, 255, 0.25);
      backdrop-filter: blur(20px) saturate(150%);
      -webkit-backdrop-filter: blur(20px) saturate(150%);
      border: 1.5px solid rgba(255, 255, 255, 0.35);
      padding: 14px 28px;
      border-radius: 60px;
      display: flex;
      align-items: center;
      gap: 12px;
      color: #ffffff;
      font-weight: 600;
      font-size: 0.95rem;
      font-family: 'Inter', sans-serif;
      letter-spacing: 0.02em;
      z-index: 10;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.1);
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      animation: slideInLeft 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .monument-info-badge mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #ffffff;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    }

    @keyframes slideInLeft {
      from {
        opacity: 0;
        transform: translateX(-40px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    /* Hero Headline - Luxury Typography */
    .hero-headline {
      text-align: center;
      margin-bottom: 0;
    }

    .hero-main-title {
      font-family: 'Playfair Display', 'Georgia', serif;
      font-size: clamp(2.75rem, 5.5vw, 4.5rem);
      font-weight: 700;
      line-height: 1.15;
      color: #ffffff;
      margin: 1rem 0 0.5rem 0;
      letter-spacing: -0.025em;
      text-shadow: 0 6px 24px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2);
      display: flex;
      flex-direction: column;
      gap: 10px;
      animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .title-static {
      display: block;
      font-size: clamp(1.75rem, 3.5vw, 2.75rem);
      font-weight: 400;
      opacity: 0.95;
      font-style: italic;
    }

    .title-animated {
      display: block;
      font-size: clamp(2.5rem, 5vw, 4rem);
      font-weight: 700;
      background: linear-gradient(135deg, var(--gold-accent) 0%, #f4d03f 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      min-height: clamp(60px, 10vw, 100px);
    }

    .cursor {
      color: var(--gold-accent);
      animation: blink 1s step-end infinite;
      -webkit-text-fill-color: var(--gold-accent);
    }

    @keyframes blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0; }
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(40px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .hero-main-subtitle {
      font-family: 'Inter', -apple-system, system-ui, sans-serif;
      font-size: clamp(1.125rem, 2.25vw, 1.375rem);
      font-weight: 400;
      color: rgba(255, 255, 255, 0.95);
      margin: 0.5rem auto 0;
      letter-spacing: 0.025em;
      text-shadow: 0 3px 12px rgba(0, 0, 0, 0.35), 0 1px 4px rgba(0, 0, 0, 0.2);
      line-height: 1.7;
      max-width: 700px;
      text-align: center;
      animation: none !important;
      transform: none !important;
    }

    /* LUXURY SEARCH WIDGET - Premium Booking.com Style */
    .search-widget-premium {
      width: 100%;
      max-width: 1180px;
      background: rgba(255, 255, 255, 0.97);
      backdrop-filter: blur(30px) saturate(180%);
      -webkit-backdrop-filter: blur(30px) saturate(180%);
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.4);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15), 0 8px 20px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      animation: scaleInLuxury 0.7s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both;
      transition: var(--transition-smooth);
    }

    .search-widget-premium:hover {
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.18), 0 10px 24px rgba(0, 0, 0, 0.12);
      transform: translateY(-2px);
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

    /* Premium Tabs - Booking.com Style */
    .search-tabs-premium {
      display: flex;
      background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
      border-bottom: 2px solid #e2e8f0;
      padding: 0;
    }

    .search-tab-premium {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 18px 24px;
      background: transparent;
      border: none;
      border-bottom: 3px solid transparent;
      color: #64748b;
      font-size: 1rem;
      font-weight: 600;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
    }

    .search-tab-premium:hover {
      color: #1e293b;
      background: rgba(226, 232, 240, 0.3);
    }

    .search-tab-premium.active {
      color: var(--gold-accent);
      font-weight: 700;
      border-bottom-color: var(--gold-accent);
      background: #ffffff;
    }

    .search-tab-premium mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
    }

    /* Premium Form Container */
    .search-form-premium {
      padding: 1.75rem 1.5rem;
      background: #ffffff;
    }

    .search-form-content {
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .form-row-premium {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      align-items: end;
    }

    @media (min-width: 1024px) {
      .form-row-premium {
        grid-template-columns: repeat(4, 1fr) auto;
        gap: 1rem;
      }
    }

    @media (min-width: 1280px) {
      .form-row-premium {
        grid-template-columns: 1.5fr 1.5fr 1fr 1fr 1fr auto;
        gap: 1rem;
      }
    }

    /* Premium Form Fields - Booking.com Style */
    .form-field-premium {
      position: relative;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 8px 12px 8px 44px;
      transition: all 0.3s ease;
      cursor: text;
      min-height: 56px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .form-field-premium:hover {
      border-color: #94a3b8;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .form-field-premium:focus-within {
      border-color: var(--gold-accent);
      box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
      background: #ffffff;
    }

    .form-field-premium .field-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--gold-accent);
      font-size: 20px;
      width: 20px;
      height: 20px;
      transition: all 0.3s ease;
    }

    .premium-input {
      width: 100%;
      border: none;
      outline: none;
      font-size: 0.9375rem;
      font-weight: 500;
      font-family: 'Inter', sans-serif;
      color: #1e293b;
      background: transparent;
      padding: 0;
      margin-top: 2px;
    }

    .premium-input::placeholder {
      color: #94a3b8;
      font-weight: 400;
    }

    .premium-input:focus {
      color: #0f172a;
    }

    /* Modern date inputs */
    .premium-input[type="date"] {
      font-family: 'Inter', sans-serif;
      color: #1e293b;
      cursor: pointer;
    }

    .premium-input[type="date"]::-webkit-calendar-picker-indicator {
      cursor: pointer;
      opacity: 0.6;
      transition: opacity 0.3s ease;
    }

    .premium-input[type="date"]:hover::-webkit-calendar-picker-indicator {
      opacity: 1;
    }

    .floating-label {
      position: absolute;
      left: 44px;
      top: 6px;
      font-size: 0.65rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-family: 'Inter', sans-serif;
      transition: all 0.3s ease;
      pointer-events: none;
    }

    .form-field-premium:focus-within .floating-label {
      color: var(--gold-accent);
    }

    /* Premium Search Button - Booking.com Style */
    .search-btn-premium {
      background: linear-gradient(135deg, var(--gold-accent) 0%, #b8941f 100%);
      color: #ffffff;
      border: none;
      border-radius: 8px;
      padding: 0 2rem;
      min-height: 56px;
      font-size: 1rem;
      font-weight: 700;
      font-family: 'Inter', sans-serif;
      letter-spacing: 0.02em;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(212, 175, 55, 0.35);
      white-space: nowrap;
      position: relative;
      overflow: hidden;
    }

    .search-btn-premium::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      transition: left 0.5s ease;
    }

    .search-btn-premium:hover::before {
      left: 100%;
    }

    .search-btn-premium:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(212, 175, 55, 0.45);
    }

    .search-btn-premium:active {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(212, 175, 55, 0.35);
    }

    .search-btn-premium mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    /* Trust Badges - Elegant Redesign */
    .hero-trust-badges {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
      animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.4s both;
    }

    .trust-badge {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 20px;
      background: rgba(255, 255, 255, 0.25);
      backdrop-filter: blur(20px) saturate(150%);
      -webkit-backdrop-filter: blur(20px) saturate(150%);
      border-radius: 50px;
      border: 1.5px solid rgba(255, 255, 255, 0.35);
      color: #ffffff;
      font-weight: 600;
      font-size: 0.875rem;
      font-family: 'Inter', sans-serif;
      letter-spacing: 0.02em;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.1);
      transition: var(--transition-smooth);
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .trust-badge:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2), 0 6px 12px rgba(0, 0, 0, 0.12);
      background: rgba(255, 255, 255, 0.35);
      border-color: rgba(255, 255, 255, 0.5);
    }

    .trust-badge mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #ffffff;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    }

    /* Luxury Autocomplete Dropdown Styling */
    ::ng-deep .mat-mdc-autocomplete-panel {
      margin-top: 10px;
      border-radius: 18px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15), 0 8px 20px rgba(0, 0, 0, 0.08);
      border: 2px solid rgba(212, 175, 55, 0.2);
      overflow: hidden;
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(30px) saturate(180%);
      -webkit-backdrop-filter: blur(30px) saturate(180%);
    }

    ::ng-deep .mat-mdc-option {
      padding: 20px 28px;
      min-height: 68px;
      border-bottom: 1px solid rgba(10, 25, 47, 0.05);
      font-family: 'Inter', sans-serif;
      font-size: 1.05rem;
      font-weight: 500;
      color: var(--navy-primary);
      transition: var(--transition-smooth);
      letter-spacing: 0.01em;
    }

    ::ng-deep .mat-mdc-option:last-child {
      border-bottom: none;
    }

    ::ng-deep .mat-mdc-option:hover {
      background: rgba(212, 175, 55, 0.1);
    }

    ::ng-deep .mat-mdc-option.mat-mdc-option-active {
      background: rgba(212, 175, 55, 0.15);
      color: var(--navy-primary);
      font-weight: 700;
    }

    /* ============================================
       SECTIONS - Clean Modern Layout
       ============================================ */
    .features-section,
    .destinations-section,
    .flights-section,
    .hotels-section {
      padding: 5rem 2rem;
    }

    .features-section {
      background: var(--white);
    }

    .destinations-section {
      background: var(--gray-50);
    }

    .flights-section {
      background: var(--white);
    }

    .hotels-section {
      background: var(--gray-50);
    }

    .container {
      max-width: 1280px;
      margin: 0 auto;
    }

    .section-title {
      font-family: 'Playfair Display', 'Georgia', serif;
      font-size: 2.75rem;
      font-weight: 700;
      color: var(--navy-primary);
      margin-bottom: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1.25rem;
      letter-spacing: -0.025em;
      line-height: 1.2;
    }

    .section-icon {
      font-size: 40px !important;
      width: 40px !important;
      height: 40px !important;
      color: var(--gold-accent);
    }

    .section-subtitle {
      text-align: center;
      font-size: 1.25rem;
      font-weight: 400;
      color: var(--text-secondary);
      margin-bottom: 3.5rem;
      max-width: 700px;
      margin-left: auto;
      margin-right: auto;
      line-height: 1.7;
      letter-spacing: 0.01em;
      font-family: 'Inter', sans-serif;
    }

    /* ============================================
       FEATURES GRID - Icon Cards
       ============================================ */
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: var(--space-xl);
      margin-top: var(--space-2xl);
    }

    .feature-card {
      text-align: center;
      padding: var(--space-2xl) var(--space-xl) !important;
      background: var(--white) !important;
      border-radius: var(--radius-xl) !important;
      border: 1px solid var(--gray-200) !important;
      transition: all var(--transition-base) !important;
      box-shadow: none !important;
    }

    .feature-card:hover {
      transform: translateY(-8px);
      box-shadow: var(--shadow-xl) !important;
      border-color: var(--primary-color) !important;
    }

    .feature-icon-wrapper {
      width: 72px;
      height: 72px;
      margin: 0 auto var(--space-lg);
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
      border-radius: var(--radius-xl);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform var(--transition-base);
    }

    .feature-card:hover .feature-icon-wrapper {
      transform: scale(1.1) rotate(5deg);
    }

    .feature-icon {
      font-size: 36px !important;
      height: 36px !important;
      width: 36px !important;
      color: var(--white);
    }

    .feature-card h3 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: var(--space-md);
      color: var(--text-primary);
    }

    .feature-card p {
      color: var(--text-secondary);
      line-height: 1.7;
      font-size: 0.9375rem;
    }

    /* ============================================
       DESTINATIONS GRID - Premium Cards
       ============================================ */
    .destinations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: var(--space-xl);
      margin-top: var(--space-2xl);
    }

    .destination-card {
      border-radius: var(--radius-xl) !important;
      overflow: hidden;
      cursor: pointer;
      transition: all var(--transition-base);
      padding: 0 !important;
      box-shadow: var(--shadow-sm) !important;
      background: var(--white) !important;
      border: 1px solid var(--gray-200) !important;
      position: relative;
    }

    .destination-card:hover {
      transform: translateY(-8px);
      box-shadow: var(--shadow-xl) !important;
      border-color: var(--primary-light) !important;
    }

    /* Morocco Special Styling - Valorization */
    .destination-card.morocco {
      border: 2px solid var(--morocco-gold) !important;
      box-shadow: 0 4px 12px rgba(212, 175, 55, 0.15) !important;
    }

    .destination-card.morocco:hover {
      box-shadow: 0 12px 32px rgba(212, 175, 55, 0.3) !important;
      border-color: var(--morocco-red) !important;
    }

    .destination-card.morocco .morocco-badge {
      position: absolute;
      top: var(--space-md);
      right: var(--space-md);
      background: linear-gradient(135deg, var(--morocco-red) 0%, var(--morocco-gold) 100%);
      color: var(--white);
      padding: 6px 16px;
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: var(--shadow-md);
      z-index: 20;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .destination-image-container {
      position: relative;
      height: 240px;
      overflow: hidden;
      background: var(--gray-200);
    }
    
    .destination-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: all 0.5s ease;
      filter: grayscale(30%);
      image-rendering: -webkit-optimize-contrast;
      image-rendering: crisp-edges;
      -webkit-backface-visibility: hidden;
      backface-visibility: hidden;
      -webkit-transform: translateZ(0);
      transform: translateZ(0);
    }
    
    .destination-card:hover .destination-image {
      transform: scale(1.1);
      filter: grayscale(0%);
    }
    
    .destination-image-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
    }
    
    .destination-image-placeholder .placeholder-icon {
      font-size: 64px !important;
      width: 64px !important;
      height: 64px !important;
      color: rgba(255, 255, 255, 0.6);
    }
    
    .destination-overlay {
      position: absolute;
      inset: 0;
      padding: var(--space-lg);
      background: linear-gradient(
        to top,
        rgba(0, 0, 0, 0.85) 0%,
        rgba(0, 0, 0, 0.4) 50%,
        transparent 100%
      );
      color: var(--white);
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }

    .destination-card.morocco .destination-overlay {
      background: linear-gradient(
        to top,
        rgba(193, 39, 45, 0.9) 0%,
        rgba(212, 175, 55, 0.5) 50%,
        transparent 100%
      );
    }
    
    .destination-name {
      font-size: 1.625rem;
      font-weight: 700;
      margin: 0 0 var(--space-xs) 0;
      color: var(--white);
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
      letter-spacing: -0.01em;
    }
    
    .destination-country-overlay {
      margin: 0;
      font-size: 1rem;
      display: flex;
      align-items: center;
      gap: var(--space-xs);
      color: rgba(255, 255, 255, 0.95);
      font-weight: 500;
    }
    
    .destination-code-badge {
      position: absolute;
      top: var(--space-md);
      left: var(--space-md);
      background: rgba(255, 255, 255, 0.95);
      color: var(--text-primary);
      padding: 6px 12px;
      border-radius: var(--radius-full);
      font-weight: 700;
      font-size: 0.8125rem;
      letter-spacing: 0.5px;
      box-shadow: var(--shadow-md);
      z-index: 15;
    }
    
    .destination-info-compact {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      color: #6c757d;
    }
    
    .destination-info-compact .info-icon {
      font-size: 20px !important;
      width: 20px !important;
      height: 20px !important;
    }
    
    .destination-info-compact .info-text {
      font-size: 0.9rem;
    }

    .destination-info-compact .info-text {
      font-size: 0.9rem;
    }

    .inline-icon {
      font-size: 16px !important;
      width: 16px !important;
      height: 16px !important;
    }

    .destination-card mat-card-actions {
      padding: var(--space-md) !important;
      display: flex;
      gap: var(--space-sm);
      justify-content: stretch;
    }

    /* ============================================
       CTA SECTION - Call To Action
       ============================================ */
    .cta-section {
      background: linear-gradient(135deg, var(--accent-color) 0%, var(--primary-color) 100%);
      color: var(--white);
      padding: var(--space-3xl) var(--space-lg);
      text-align: center;
      position: relative;
      overflow: hidden;
      margin-top: var(--space-3xl);
    }

    .cta-section::before {
      content: '';
      position: absolute;
      inset: 0;
      background: url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.05\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');
      opacity: 0.5;
    }

    .cta-content {
      position: relative;
      z-index: 1;
      max-width: 800px;
      margin: 0 auto;
    }

    .cta-content h2 {
      font-family: 'Poppins', sans-serif;
      font-size: 2.75rem;
      font-weight: 700;
      margin-bottom: var(--space-lg);
      letter-spacing: -0.02em;
      text-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
    }

    .cta-content p {
      font-size: 1.25rem;
      margin-bottom: var(--space-2xl);
      opacity: 0.95;
      line-height: 1.6;
    }

    .cta-btn {
      padding: 0 var(--space-3xl) !important;
      font-size: 1.125rem !important;
      height: 56px !important;
      border-radius: var(--radius-full) !important;
      font-weight: 700 !important;
      transition: all var(--transition-base) !important;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
      display: inline-flex !important;
      align-items: center !important;
      gap: 8px !important;
    }

    .cta-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25) !important;
    }

    .cta-buttons {
      display: flex;
      gap: var(--space-lg);
      justify-content: center;
      flex-wrap: wrap;
      margin-top: var(--space-2xl);
    }

    .cta-btn-secondary {
      padding: 0 var(--space-3xl) !important;
      font-size: 1.125rem !important;
      height: 56px !important;
      border-radius: var(--radius-full) !important;
      font-weight: 600 !important;
      background: transparent !important;
      border: 2px solid var(--white) !important;
      color: var(--white) !important;
      transition: all var(--transition-base) !important;
      display: inline-flex !important;
      align-items: center !important;
      gap: 8px !important;
    }

    .cta-btn-secondary:hover {
      background: var(--white) !important;
      color: var(--primary-color) !important;
      transform: translateY(-3px);
    }

    /* ============================================
       TRENDING DESTINATIONS CAROUSEL
       ============================================ */
    .trending-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: var(--space-3xl) 0;
      margin: var(--space-3xl) 0;
      position: relative;
      overflow: hidden;
    }

    .trending-section::before {
      content: '';
      position: absolute;
      inset: 0;
      background: url('data:image/svg+xml,%3Csvg width=\"40\" height=\"40\" viewBox=\"0 0 40 40\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.03\"%3E%3Cpath d=\"M0 0h20v20H0V0zm20 20h20v20H20V20z\"/%3E%3C/g%3E%3C/svg%3E');
    }

    .trending-section .section-title,
    .trending-section .section-subtitle {
      color: var(--white);
      position: relative;
      z-index: 1;
    }

    .trending-carousel {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: var(--space-lg);
      margin-top: var(--space-2xl);
      position: relative;
      z-index: 1;
    }

    .trending-card {
      background: var(--white);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-lg);
      transition: all var(--transition-base);
      cursor: pointer;
    }

    .trending-card:hover {
      transform: translateY(-8px);
      box-shadow: var(--shadow-2xl);
    }

    .trending-image {
      height: 200px;
      background-size: cover;
      background-position: center;
      position: relative;
    }

    .trending-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      background: var(--accent-color);
      color: var(--white);
      padding: 4px 12px;
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    .trending-info {
      padding: var(--space-lg);
    }

    .trending-title {
      font-size: 1.375rem;
      font-weight: 700;
      color: var(--gray-900);
      margin: 0 0 4px 0;
    }

    .trending-country {
      color: var(--gray-600);
      font-size: 0.875rem;
      margin: 0 0 var(--space-md) 0;
    }

    .trending-stats {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: var(--space-md);
      border-top: 1px solid var(--gray-200);
    }

    .trending-stat {
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--success-color);
      font-weight: 600;
      font-size: 0.875rem;
    }

    .trending-stat mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .trending-price {
      color: var(--primary-color);
      font-weight: 700;
      font-size: 1.125rem;
    }

    /* ============================================
       CUSTOMER REVIEWS SECTION
       ============================================ */
    .reviews-section {
      padding: var(--space-3xl) 0;
      background: var(--gray-50);
    }

    .reviews-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--space-xl);
      margin-top: var(--space-2xl);
    }

    .review-card {
      padding: var(--space-xl) !important;
      background: var(--white) !important;
      border-radius: var(--radius-lg) !important;
      box-shadow: var(--shadow-md) !important;
      transition: all var(--transition-base) !important;
      border-left: 4px solid var(--primary-color) !important;
    }

    .review-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg) !important;
    }

    .review-header {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      margin-bottom: var(--space-lg);
    }

    .review-avatar {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
      color: var(--white);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      font-weight: 700;
    }

    .review-author-info {
      flex: 1;
    }

    .review-author {
      margin: 0 0 4px 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--gray-900);
    }

    .review-rating {
      display: flex;
      gap: 2px;
    }

    .review-rating .star-icon {
      color: #ffa500;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .review-text {
      color: var(--gray-700);
      line-height: 1.7;
      margin: 0 0 var(--space-lg) 0;
      font-size: 0.9375rem;
      font-style: italic;
    }

    .review-footer {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--success-color);
      font-size: 0.875rem;
      font-weight: 600;
    }

    .verified-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    /* ============================================
       NEWSLETTER SECTION
       ============================================ */
    .newsletter-section {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      padding: var(--space-3xl) 0;
      margin-top: var(--space-3xl);
    }

    .newsletter-content {
      display: grid;
      grid-template-columns: 1fr 1.2fr;
      gap: var(--space-2xl);
      align-items: center;
    }

    .newsletter-text {
      color: var(--white);
    }

    .newsletter-title {
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 var(--space-md) 0;
      display: flex;
      align-items: center;
      gap: var(--space-md);
    }

    .newsletter-title mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: var(--accent-color);
    }

    .newsletter-subtitle {
      font-size: 1.125rem;
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.6;
      margin: 0;
    }

    .newsletter-form {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      padding: var(--space-xl);
      border-radius: var(--radius-lg);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .newsletter-input-group {
      display: flex;
      gap: var(--space-md);
      align-items: center;
      background: var(--white);
      padding: 8px;
      border-radius: var(--radius-md);
      margin-bottom: var(--space-md);
    }

    .newsletter-input-group .input-icon {
      margin-left: 12px;
      color: var(--gray-500);
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .newsletter-input {
      flex: 1;
      border: none;
      outline: none;
      padding: 12px;
      font-size: 1rem;
      background: transparent;
    }

    .newsletter-btn {
      padding: 0 var(--space-2xl) !important;
      height: 48px !important;
      border-radius: var(--radius-md) !important;
      font-weight: 700 !important;
      white-space: nowrap;
    }

    .newsletter-privacy {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.875rem;
      margin: 0;
      text-align: center;
    }

    .action-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }

    .loading-center {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      gap: 20px;
    }

    .loading-text {
      color: #6c757d;
      font-size: 1.1rem;
      margin: 0;
    }

    .empty-state {
      text-align: center;
      padding: 80px 20px;
      color: #6c757d;
    }

    .empty-icon {
      font-size: 80px !important;
      width: 80px !important;
      height: 80px !important;
      color: #dee2e6;
      margin-bottom: 24px;
    }

    .empty-state h3 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #495057;
      margin-bottom: 12px;
    }

    .empty-state p {
      font-size: 1rem;
      color: #6c757d;
    }

    /* ============================================
       HOTEL & FLIGHT CARDS - Premium Design
       ============================================ */
    .hotels-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: var(--space-xl);
      margin-top: var(--space-2xl);
    }

    .hotel-card {
      overflow: hidden;
      transition: all var(--transition-base);
      border: 1px solid var(--gray-200) !important;
      border-radius: var(--radius-xl) !important;
      background: var(--white) !important;
      box-shadow: var(--shadow-sm) !important;
    }

    .hotel-card:hover {
      transform: translateY(-8px);
      box-shadow: var(--shadow-xl) !important;
      border-color: var(--primary-color) !important;
    }

    .hotel-image-container {
      position: relative;
      width: 100%;
      height: 220px;
      overflow: hidden;
      background: var(--gray-200);
    }

    .hotel-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      image-rendering: -webkit-optimize-contrast;
      image-rendering: crisp-edges;
      -webkit-backface-visibility: hidden;
      backface-visibility: hidden;
      -webkit-transform: translateZ(0);
      transform: translateZ(0);
    }

    .hotel-image-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
    }

    .placeholder-icon {
      font-size: 80px !important;
      height: 80px !important;
      width: 80px !important;
      color: rgba(255, 255, 255, 0.6);
    }

    .hotel-card:hover .hotel-image {
      transform: scale(1.1);
    }

    .hotel-rating-badge {
      position: absolute;
      top: var(--space-md);
      right: var(--space-md);
      background: rgba(0, 0, 0, 0.8);
      color: var(--white);
      padding: 8px 16px;
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 700;
      font-size: 1rem;
      backdrop-filter: blur(8px);
      box-shadow: var(--shadow-md);
    }

    .hotel-name {
      font-size: 1.375rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 var(--space-md) 0;
      line-height: 1.3;
    }

    .hotel-location {
      display: flex;
      align-items: center;
      gap: var(--space-xs);
      color: var(--text-secondary);
      font-size: 0.9375rem;
      margin-bottom: var(--space-md);
    }

    .location-icon {
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
      color: var(--primary-color);
    }

    .hotel-description {
      color: var(--text-secondary);
      font-size: 0.9375rem;
      margin-bottom: var(--space-lg);
      line-height: 1.6;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .hotel-details {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: var(--space-md);
      border-top: 1px solid var(--gray-200);
    }

    .hotel-price {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .price-label {
      font-size: 0.75rem;
      color: var(--text-secondary);
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .price-value {
      font-size: 1.875rem;
      font-weight: 800;
      color: var(--accent-color);
      line-height: 1;
      font-family: 'Poppins', sans-serif;
    }

    .price-unit {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .hotel-availability {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: var(--gray-50);
      border-radius: var(--radius-md);
    }

    .availability-icon {
      font-size: 24px !important;
      width: 24px !important;
      height: 24px !important;
      color: var(--primary-color);
    }

    .hotel-availability span {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    /* ============================================
       SECTIONS - Background Colors
       ============================================ */
    .flights-section {
      padding: var(--space-3xl) var(--space-lg);
      background: var(--white);
    }

    .hotels-section {
      padding: var(--space-3xl) var(--space-lg);
      background: var(--gray-50);
    }

    /* ============================================
       FLIGHT CARDS - Modern Design
       ============================================ */
    .flights-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: var(--space-xl);
      margin-top: var(--space-2xl);
    }

    .flight-card {
      overflow: hidden;
      transition: all var(--transition-base);
      border: 1px solid var(--gray-200) !important;
      border-radius: var(--radius-xl) !important;
      background: var(--white) !important;
      box-shadow: var(--shadow-sm) !important;
    }

    .flight-card:hover {
      transform: translateY(-8px);
      box-shadow: var(--shadow-xl) !important;
      border-color: var(--primary-color) !important;
    }

    .flight-header {
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
      color: var(--white);
      padding: var(--space-xl) var(--space-lg) var(--space-2xl);
    }

    .flight-airline {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      margin-bottom: var(--space-lg);
      padding-bottom: var(--space-md);
      border-bottom: 1px solid rgba(255, 255, 255, 0.25);
    }

    .airline-icon {
      font-size: 24px !important;
      width: 24px !important;
      height: 24px !important;
      color: var(--white);
    }

    .airline-name {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--white);
    }

    .flight-number {
      margin-left: auto;
      font-size: 0.9375rem;
      font-weight: 700;
      padding: 6px 14px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: var(--radius-full);
      color: var(--white);
      backdrop-filter: blur(4px);
    }

    .route {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-md);
    }

    .route-point {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-sm);
    }

    .route-icon {
      font-size: 32px !important;
      width: 32px !important;
      height: 32px !important;
      color: rgba(255, 255, 255, 0.9);
    }

    .airport {
      font-size: 1.875rem;
      font-weight: 800;
      letter-spacing: 2px;
      color: var(--white);
      font-family: 'Poppins', sans-serif;
    }

    .airport-label {
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.85);
      font-weight: 400;
    }

    .route-divider {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }

    .plane-icon {
      font-size: 28px !important;
      width: 28px !important;
      height: 28px !important;
      color: var(--white);
      animation: fly 2s ease-in-out infinite;
    }

    .duration {
      font-size: 0.8125rem;
      color: rgba(255, 255, 255, 0.9);
      font-weight: 500;
    }

    @keyframes fly {
      0%, 100% { transform: translateX(0); }
      50% { transform: translateX(8px); }
    }

    .flight-details {
      padding: var(--space-lg);
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }

    .detail-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-md);
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
      padding: var(--space-md);
      background: var(--gray-50);
      border-radius: var(--radius-md);
      border: 1px solid var(--gray-200);
      transition: all var(--transition-fast);
    }

    .detail-item:hover {
      background: var(--white);
      border-color: var(--primary-color);
    }

    .detail-label {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--text-secondary);
      font-weight: 600;
      font-size: 0.8125rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .detail-label {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--text-secondary);
      font-weight: 600;
      font-size: 0.8125rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .detail-icon {
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
      color: var(--primary-color);
    }

    .detail-value {
      color: var(--text-primary);
      font-weight: 600;
      font-size: 0.9375rem;
    }

    .flight-info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-md);
    }

    .info-box {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-md);
      background: var(--white);
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);
    }

    .info-box:hover {
      border-color: var(--primary-color);
      box-shadow: var(--shadow-sm);
      transform: translateY(-2px);
    }

    .info-icon {
      font-size: 28px !important;
      width: 28px !important;
      height: 28px !important;
      color: var(--primary-color);
    }

    .info-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-label {
      font-size: 0.75rem;
      color: var(--text-secondary);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-value {
      font-size: 1.125rem;
      color: var(--text-primary);
      font-weight: 700;
    }

    .flight-price-section {
      padding: var(--space-lg);
      background: var(--gray-50);
      text-align: center;
      border-top: 1px solid var(--gray-200);
    }

    .price-label {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-bottom: var(--space-sm);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .flight-price {
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--primary-color);
      line-height: 1;
      margin-bottom: var(--space-sm);
      font-family: 'Poppins', sans-serif;
    }

    .price-note {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      margin-top: 12px;
      padding: 8px 16px;
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 8px;
      color: #856404;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .warning-icon {
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
      color: #ffc107;
    }

    .book-button {
      width: 100%;
      height: 48px !important;
      font-size: 1rem !important;
      font-weight: 600 !important;
      display: flex !important;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .star-icon {
      font-size: 18px !important;
      height: 18px !important;
      width: 18px !important;
      color: #ffc107;
    }

    mat-card-content h3 {
      font-size: 1.4rem;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 8px;
    }

    mat-card-actions {
      padding: 0 !important;
      margin: 0 !important;
    }

    mat-card-actions button {
      margin: 0 !important;
    }

    .loading-center {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      gap: 20px;
    }

    .loading-text {
      color: #6c757d;
      font-size: 1.1rem;
      margin: 0;
    }

    .empty-state {
      text-align: center;
      padding: 80px 20px;
      color: #6c757d;
    }

    .empty-icon {
      font-size: 80px !important;
      width: 80px !important;
      height: 80px !important;
      color: #dee2e6;
      margin-bottom: 24px;
    }

    .empty-state h3 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #495057;
      margin-bottom: 12px;
    }

    .empty-state p {
      font-size: 1rem;
      color: var(--text-secondary);
      margin-bottom: 0;
    }

    .container {
      max-width: 1280px;
      margin: 0 auto;
      width: 100%;
      padding: 0 var(--space-lg);
    }

    .text-center {
      text-align: center;
    }

    .mb-4 {
      margin-bottom: var(--space-2xl);
    }

    /* ============================================
       RESPONSIVE DESIGN - LUXURY MAINTAINED
       ============================================ */
    @media (max-width: 1024px) {
      .destinations-grid, .flights-grid, .hotels-grid {
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      }

      .features-grid {
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      }

      .hero-content-wrapper {
        padding: 3rem var(--space-lg);
        gap: 2.5rem;
      }

      .search-widget-premium {
        max-width: 95%;
      }
    }

    @media (max-width: 768px) {
      .hero-section {
        min-height: 90vh;
      }

      .hero-content-wrapper {
        padding: 2.5rem var(--space-md);
        gap: 2rem;
      }

      .hero-main-title {
        font-size: clamp(1.75rem, 5vw, 2.5rem);
      }

      .title-static {
        font-size: clamp(1.25rem, 4vw, 1.75rem);
      }

      .title-animated {
        font-size: clamp(1.75rem, 5vw, 2.5rem);
        min-height: 50px;
      }

      .hero-main-subtitle {
        font-size: 1rem;
        padding: 0 1rem;
      }

      .monument-info-badge {
        font-size: 0.7rem;
        padding: 10px 16px;
        top: 12px;
        left: 12px;
        border-radius: 24px;
      }

      /* Luxury search widget responsive */
      .search-widget-premium {
        border-radius: 16px;
        max-width: 98%;
      }

      .search-tabs-premium {
        overflow-x: auto;
        padding: 8px 20px;
        gap: 8px;
        -webkit-overflow-scrolling: touch;
      }

      .search-tab-premium {
        padding: 12px 20px;
        font-size: 0.9rem;
        min-width: max-content;
      }

      .search-form-premium {
        padding: 28px 20px;
      }

      .form-row-premium {
        grid-template-columns: 1fr;
        gap: 14px;
      }

      .form-field-premium {
        padding: 20px 16px 10px 52px;
        min-height: 68px;
      }

      .premium-input {
        font-size: 1rem;
      }

      .search-btn-premium {
        width: 100%;
        padding: 0 32px;
        min-height: 68px;
        font-size: 1rem;
      }

      .hero-trust-badges {
        gap: 16px;
      }

      .trust-badge {
        padding: 14px 22px;
        font-size: 0.85rem;
        gap: 10px;
      }

      .trust-badge mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    @media (max-width: 480px) {
      .hero-section {
        min-height: 100vh;
      }

      .hero-content-wrapper {
        padding: 2rem 1rem;
        gap: 1.5rem;
      }

      .monument-info-badge {
        font-size: 0.65rem;
        padding: 8px 12px;
        top: 8px;
        left: 8px;
      }

      .search-widget-premium {
        border-radius: 12px;
      }

      .search-form-premium {
        padding: 20px 16px;
      }

      .form-field-premium {
        min-height: 64px;
        padding: 18px 12px 8px 48px;
      }

      .form-field-premium .field-icon {
        left: 14px;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      .floating-label {
        left: 48px;
        font-size: 0.65rem;
      }

      .search-btn-premium {
        min-height: 64px;
        padding: 0 24px;
        font-size: 0.95rem;
      }

      .trust-badge {
        padding: 12px 18px;
        font-size: 0.8rem;
        gap: 8px;
        border-radius: 40px;
      }

      .trust-badge mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      .section-title {
        font-size: 1.75rem;
      }

      .section-subtitle {
        font-size: 1rem;
      }

      .hero-trust-badges {
        gap: var(--space-md);
      }

      .trust-badge {
        font-size: 0.875rem;
        padding: 10px 18px;
      }

      .destinations-grid, .flights-grid, .hotels-grid {
        grid-template-columns: 1fr;
        gap: var(--space-lg);
      }

      .features-grid {
        grid-template-columns: 1fr;
      }

      /* Trending carousel responsive */
      .trending-carousel {
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      }

      /* Reviews responsive */
      .reviews-grid {
        grid-template-columns: 1fr;
      }

      /* Newsletter responsive */
      .newsletter-content {
        grid-template-columns: 1fr;
        gap: var(--space-xl);
      }

      .newsletter-title {
        font-size: 1.75rem;
      }

      /* CTA responsive */
      .cta-content h2 {
        font-size: 2rem;
      }

      .cta-buttons {
        flex-direction: column;
        align-items: center;
      }

      .cta-btn, .cta-btn-secondary {
        width: 100%;
        max-width: 320px;
      }
    }

    @media (max-width: 480px) {
      .hero-main-title {
        font-size: 2rem;
      }

      .hero-main-subtitle {
        font-size: 1rem;
      }

      .search-tab-premium {
        padding: 12px;
        font-size: 0.875rem;
      }

      .search-tab-premium span {
        display: none;
      }

      .search-form-premium {
        padding: 16px;
      }

      .form-field-premium {
        padding: 16px 12px 8px 44px;
      }

      .form-field-premium .field-icon {
        left: 12px;
      }

      .floating-label {
        left: 44px;
        font-size: 0.7rem;
      }

      .search-btn-premium {
        padding: 0 20px;
        font-size: 1rem;
      }

      .hero-trust-badges {
        flex-direction: column;
        align-items: center;
      }

      .trust-badge {
        width: 100%;
        max-width: 320px;
        justify-content: center;
      }

      .trending-carousel {
        grid-template-columns: 1fr;
      }

      .newsletter-title {
        font-size: 1.5rem;
      }

      .newsletter-input-group {
        flex-direction: column;
        align-items: stretch;
      }

      .newsletter-btn {
        width: 100%;
      }

      .cta-content h2 {
        font-size: 1.75rem;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  destinations: Destination[] = [];
  hotels: Hotel[] = [];
  flights: any[] = [];
  loadingDestinations = true;
  loadingHotels = true;
  loadingFlights = true;
  
  // Dynamic rotating Moroccan monuments background
  heroImage = '';
  heroImageAlt = '';
  currentImageIndex = 0;
  moroccanMonuments = [
    { 
      keyword: 'hassan ii mosque casablanca',
      title: 'Hassan II Mosque',
      location: 'Casablanca, Morocco'
    },
    { 
      keyword: 'koutoubia mosque marrakech',
      title: 'Koutoubia Mosque',
      location: 'Marrakech, Morocco'
    },
    { 
      keyword: 'chefchaouen blue city morocco',
      title: 'Chefchaouen',
      location: 'Blue Pearl of Morocco'
    },
    { 
      keyword: 'ait benhaddou kasbah morocco',
      title: 'Ait Benhaddou',
      location: 'UNESCO World Heritage Site'
    },
    { 
      keyword: 'fes medina morocco',
      title: 'Fes Medina',
      location: 'Ancient Moroccan City'
    },
    { 
      keyword: 'essaouira port morocco',
      title: 'Essaouira',
      location: 'Atlantic Coast of Morocco'
    }
  ];
  
  // Animated text
  animatedTexts = [
    'Discover Morocco\'s Hidden Gems',
    'Explore Authentic Moroccan Culture',
    'Experience Luxury Riads & Hotels',
    'Journey Through Ancient Medinas'
  ];
  currentTextIndex = 0;
  displayedText = '';
  isTyping = false;
  
  // Search widget state
  activeSearchTab: 'flights' | 'hotels' | 'packages' = 'hotels';
  
  // Search form fields
  searchDestination = '';
  searchCheckIn = '';
  searchCheckOut = '';
  searchDates = '';
  searchGuests = '';
  searchFrom = '';
  searchTo = '';
  searchDeparture = '';
  searchReturn = '';
  searchPackageDestination = '';
  searchPackageDates = '';
  searchPackageDepartureDate = '';
  searchPackageReturnDate = '';
  searchPackageTravelers = '';
  
  // Date defaults for proper display
  todayDate = new Date().toISOString().split('T')[0];
  tomorrowDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  nextWeekDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  // Autocomplete FormControls
  hotelDestinationControl = new FormControl('');
  flightFromControl = new FormControl('');
  flightToControl = new FormControl('');
  packageFromControl = new FormControl('');
  packageDestinationControl = new FormControl('');
  
  // Autocomplete filtered lists
  hotelDestinations: Destination[] = [];
  flightFromDestinations: Destination[] = [];
  flightToDestinations: Destination[] = [];
  packageFromDestinations: Destination[] = [];
  packageDestinations: Destination[] = [];
  
  // Selected destinations
  selectedHotelDestination: Destination | null = null;
  selectedFlightFrom: Destination | null = null;
  selectedFlightTo: Destination | null = null;
  selectedPackageFrom: Destination | null = null;
  selectedPackageDestination: Destination | null = null;
  
  // Trending destinations data
  trendingDestinations = [
    { 
      city: 'Marrakech', 
      country: 'Morocco', 
      image: 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=600&h=400&fit=crop',
      badge: 'HOT DEAL',
      growth: '+45%',
      price: '$299'
    },
    { 
      city: 'Dubai', 
      country: 'UAE', 
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=400&fit=crop',
      badge: 'POPULAR',
      growth: '+38%',
      price: '$599'
    },
    { 
      city: 'Paris', 
      country: 'France', 
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=400&fit=crop',
      badge: 'TRENDING',
      growth: '+32%',
      price: '$499'
    },
    { 
      city: 'Tokyo', 
      country: 'Japan', 
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop',
      badge: 'NEW',
      growth: '+29%',
      price: '$799'
    }
  ];
  
  // Customer reviews data
  customerReviews = [
    {
      name: 'Sarah Johnson',
      initials: 'SJ',
      text: 'Amazing platform! Found the perfect flight to Casablanca at an unbeatable price. The booking process was seamless and support was excellent.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      initials: 'MC',
      text: 'Best travel booking experience I\'ve had. Real-time prices and instant confirmation made planning my Dubai trip so easy.',
      rating: 5
    },
    {
      name: 'Emma Rodriguez',
      initials: 'ER',
      text: 'I love how I can compare flights and hotels in one place. Saved over $400 on my Paris vacation. Highly recommend!',
      rating: 5
    }
  ];

  constructor(
    private router: Router,
    private destinationService: DestinationService,
    private hotelService: HotelService,
    private flightService: FlightService,
    private imageService: ImageService
  ) {}

  // Search handlers
  onSearchHotels(): void {
    const destination = this.selectedHotelDestination || this.hotelDestinationControl.value;
    
    if (destination && typeof destination === 'object') {
      // Navigate with the destination city name
      this.router.navigate(['/hotels'], { 
        queryParams: { 
          city: destination.name || destination.city,
          iataCode: destination.iataCode,
          checkIn: this.searchCheckIn,
          checkOut: this.searchCheckOut,
          guests: this.searchGuests
        }
      });
    } else if (typeof destination === 'string' && destination.trim()) {
      // User typed a string without selecting from dropdown
      this.router.navigate(['/hotels'], { 
        queryParams: { 
          city: destination.trim(),
          checkIn: this.searchCheckIn,
          checkOut: this.searchCheckOut,
          guests: this.searchGuests
        }
      });
    } else {
      this.router.navigate(['/hotels']);
    }
  }

  onSearchFlights(): void {
    const fromDest = this.selectedFlightFrom || this.flightFromControl.value;
    const toDest = this.selectedFlightTo || this.flightToControl.value;
    
    let queryParams: any = {
      departure: this.searchDeparture,
      return: this.searchReturn
    };
    
    if (fromDest && typeof fromDest === 'object') {
      queryParams.originLocationCode = fromDest.iataCode;
      queryParams.from = fromDest.name;
    } else if (typeof fromDest === 'string' && fromDest.trim()) {
      queryParams.from = fromDest.trim();
    }
    
    if (toDest && typeof toDest === 'object') {
      queryParams.destinationLocationCode = toDest.iataCode;
      queryParams.to = toDest.name;
    } else if (typeof toDest === 'string' && toDest.trim()) {
      queryParams.to = toDest.trim();
    }
    
    this.router.navigate(['/search'], { queryParams });
  }

  onSearchPackages(): void {
    const origin = this.selectedPackageFrom || this.packageFromControl.value;
    const destination = this.selectedPackageDestination || this.packageDestinationControl.value;
    
    let queryParams: any = {
      packageMode: 'true',
      departure: this.searchPackageDepartureDate,
      return: this.searchPackageReturnDate,
      travelers: this.searchPackageTravelers
    };
    
    // Add origin parameters
    if (origin && typeof origin === 'object') {
      queryParams.originLocationCode = origin.iataCode;
      queryParams.from = origin.name;
    } else if (typeof origin === 'string' && origin.trim()) {
      queryParams.from = origin.trim();
    }
    
    // Add destination parameters
    if (destination && typeof destination === 'object') {
      queryParams.destinationLocationCode = destination.iataCode;
      queryParams.to = destination.name;
      queryParams.city = destination.name;
      queryParams.iataCode = destination.iataCode;
    } else if (typeof destination === 'string' && destination.trim()) {
      queryParams.to = destination.trim();
      queryParams.city = destination.trim();
    }
    
    this.router.navigate(['/search'], { queryParams });
  }

  /**
   * Setup autocomplete for destination search fields
   */
  setupAutocomplete(): void {
    // Hotel destination autocomplete
    this.hotelDestinationControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(value => {
          if (typeof value === 'string' && value.length >= 2) {
            return this.destinationService.search(value);
          }
          return of([]);
        })
      )
      .subscribe({
        next: (destinations) => {
          this.hotelDestinations = destinations;
        },
        error: (err) => console.error('Hotel destination search error:', err)
      });

    // Flight From autocomplete
    this.flightFromControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(value => {
          if (typeof value === 'string' && value.length >= 2) {
            return this.destinationService.search(value);
          }
          return of([]);
        })
      )
      .subscribe({
        next: (destinations) => {
          this.flightFromDestinations = destinations;
        },
        error: (err) => console.error('Flight from search error:', err)
      });

    // Flight To autocomplete
    this.flightToControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(value => {
          if (typeof value === 'string' && value.length >= 2) {
            return this.destinationService.search(value);
          }
          return of([]);
        })
      )
      .subscribe({
        next: (destinations) => {
          this.flightToDestinations = destinations;
        },
        error: (err) => console.error('Flight to search error:', err)
      });

    // Track selected values
    this.hotelDestinationControl.valueChanges.subscribe(value => {
      if (typeof value === 'object' && value !== null) {
        this.selectedHotelDestination = value;
      }
    });

    this.flightFromControl.valueChanges.subscribe(value => {
      if (typeof value === 'object' && value !== null) {
        this.selectedFlightFrom = value;
      }
    });

    this.flightToControl.valueChanges.subscribe(value => {
      if (typeof value === 'object' && value !== null) {
        this.selectedFlightTo = value;
      }
    });

    // Package from autocomplete
    this.packageFromControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(value => {
          if (typeof value === 'string' && value.length >= 2) {
            return this.destinationService.search(value);
          }
          return of([]);
        })
      )
      .subscribe({
        next: (destinations) => {
          this.packageFromDestinations = destinations;
        },
        error: (err) => console.error('Package from search error:', err)
      });

    this.packageFromControl.valueChanges.subscribe(value => {
      if (typeof value === 'object' && value !== null) {
        this.selectedPackageFrom = value;
      }
    });

    // Package destination autocomplete
    this.packageDestinationControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(value => {
          if (typeof value === 'string' && value.length >= 2) {
            return this.destinationService.search(value);
          }
          return of([]);
        })
      )
      .subscribe({
        next: (destinations) => {
          this.packageDestinations = destinations;
        },
        error: (err) => console.error('Package destination search error:', err)
      });

    this.packageDestinationControl.valueChanges.subscribe(value => {
      if (typeof value === 'object' && value !== null) {
        this.selectedPackageDestination = value;
      }
    });
  }

  /**
   * Display function for autocomplete
   */
  displayDestination(destination: any): string {
    return destination && typeof destination === 'object' ? destination.name : '';
  }

  /**
   * Check if a destination is in Morocco for special styling
   */
  isMorocco(destination: Destination): boolean {
    if (!destination) return false;
    
    // Check country
    if (destination.country && destination.country.toLowerCase().includes('morocco')) {
      return true;
    }
    
    // Check Moroccan cities
    const moroccanCities = ['casablanca', 'marrakech', 'rabat', 'fes', 'fez', 'tangier', 'agadir', 'meknes', 'oujda', 'kenitra', 'tetouan', 'safi', 'mohammedia', 'khouribga', 'el jadida', 'beni mellal', 'ait melloul', 'nador', 'dar bouazza', 'settat', 'berrechid', 'khemisset', 'inezgane', 'ksar el kebir', 'larache', 'guelmim', 'tan-tan', 'sidi slimane', 'essaouira', 'ouarzazate', 'chefchaouen'];
    const city = (destination.city || destination.name || '').toLowerCase();
    if (moroccanCities.includes(city)) {
      return true;
    }
    
    // Check Moroccan IATA codes
    const moroccanIATACodes = ['CMN', 'RAK', 'RBA', 'FEZ', 'TNG', 'AGA', 'OUD', 'NDR', 'ESU', 'OZZ'];
    const iataCode = (destination.iataCode || '').toUpperCase();
    if (moroccanIATACodes.includes(iataCode)) {
      return true;
    }
    
    return false;
  }

  ngOnInit(): void {
    // Initialize dates with defaults
    this.searchCheckIn = this.tomorrowDate;
    this.searchCheckOut = this.nextWeekDate;
    this.searchDeparture = this.todayDate;
    this.searchReturn = this.nextWeekDate;
    this.searchPackageDepartureDate = this.todayDate;
    this.searchPackageReturnDate = this.nextWeekDate;
    
    this.loadHeroImage();
    this.loadDestinations();
    this.loadHotels();
    this.loadFlights();
    this.startImageRotation();
    this.startTextAnimation();
    this.setupAutocomplete();
  }
  
  private loadHeroImage(): void {
    // Load first Moroccan monument
    const monument = this.moroccanMonuments[this.currentImageIndex];
    this.imageService.getDestinationImage(monument.keyword, 'landmark').subscribe({
      next: (result) => {
        this.heroImage = result.url;
        this.heroImageAlt = monument.title;
      },
      error: (err) => {
        console.warn('Hero image load warning:', err);
        // Fallback to generic Morocco image
        this.heroImage = 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=1920&q=80';
      }
    });
  }
  
  private startImageRotation(): void {
    // Rotate through Moroccan monuments every 8 seconds
    setInterval(() => {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.moroccanMonuments.length;
      const monument = this.moroccanMonuments[this.currentImageIndex];
      
      this.imageService.getDestinationImage(monument.keyword, 'landmark').subscribe({
        next: (result) => {
          this.heroImage = result.url;
          this.heroImageAlt = monument.title;
        },
        error: (err) => console.warn('Image rotation error:', err)
      });
    }, 8000);
  }
  
  private startTextAnimation(): void {
    // Type writer effect for dynamic text
    this.typeText();
  }
  
  private typeText(): void {
    if (this.isTyping) return;
    
    this.isTyping = true;
    const text = this.animatedTexts[this.currentTextIndex];
    let charIndex = 0;
    this.displayedText = '';
    
    const typingInterval = setInterval(() => {
      if (charIndex < text.length) {
        this.displayedText += text.charAt(charIndex);
        charIndex++;
      } else {
        clearInterval(typingInterval);
        this.isTyping = false;
        
        // Wait 3 seconds, then move to next text
        setTimeout(() => {
          this.currentTextIndex = (this.currentTextIndex + 1) % this.animatedTexts.length;
          this.typeText();
        }, 3000);
      }
    }, 80);
  }

  private loadDestinations(): void {
    this.loadingDestinations = true;
    // Search popular destinations from Amadeus API
    const popularCities = ['Paris', 'London', 'New York', 'Tokyo', 'Dubai', 'Barcelona', 'Casablanca', 'Marrakech', 'Rabat', 'Fes', 'Tangier', 'Agadir'];
    let loadedCount = 0;

    popularCities.forEach(city => {
      this.destinationService.search(city).subscribe({
        next: (results) => {
          console.log(`✓ Amadeus search for ${city}:`, results);
          if (results && results.length > 0) {
            const destination: Destination = results[0] as any;
            // Load image for destination
            this.imageService.getDestinationImage(city, 'landmark', 'full').subscribe({
              next: (imageResult) => {
                destination.imageUrl = imageResult.url;
                destination.imageAlt = imageResult.altText;
              }
            });
            this.destinations.push(destination);
          }
          loadedCount++;
          if (loadedCount === popularCities.length) {
            this.loadingDestinations = false;
            console.log('✓ Destinations loaded:', this.destinations.length);
          }
        },
        error: (err) => {
          console.error(`✗ Error loading ${city}:`, err);
          loadedCount++;
          if (loadedCount === popularCities.length) {
            this.loadingDestinations = false;
            if (this.destinations.length === 0) {
              console.warn('No destinations available from API');
            }
          }
        }
      });
    });
  }

  private loadFlights(): void {
    this.loadingFlights = true;
    // Showcase diverse routes including Moroccan airports
    // Randomly select one route to keep API calls minimal
    const sampleRoutes = [
      { origin: 'ORD', destination: 'LAX', date: '2026-02-15' },  // Chicago to LA
      { origin: 'JFK', destination: 'CDG', date: '2026-02-20' },  // New York to Paris
      { origin: 'LHR', destination: 'CMN', date: '2026-03-01' },  // London to Casablanca (Morocco)
      { origin: 'CDG', destination: 'RAK', date: '2026-03-10' },  // Paris to Marrakech (Morocco)
      { origin: 'DXB', destination: 'CMN', date: '2026-02-25' },  // Dubai to Casablanca (Morocco)
    ];
    
    const route = sampleRoutes[Math.floor(Math.random() * sampleRoutes.length)];
    
    // Load flights from Amadeus API - works naturally with all IATA codes including Moroccan
    this.flightService.list(undefined, route.origin, route.destination, route.date).subscribe({
      next: (results) => {
        console.log(`✓ Amadeus flights (${route.origin}→${route.destination}):`, results);
        this.flights = results.slice(0, 6);
        this.loadingFlights = false;
        console.log('✓ Flights loaded:', this.flights.length);
      },
      error: (err) => {
        console.error('✗ Error loading flights:', err);
        this.loadingFlights = false;
      }
    });
  }

  private loadHotels(): void {
    this.loadingHotels = true;
    // Showcase hotels from diverse cities including Morocco
    // Randomly select one city to keep API calls minimal
    const featuredCities = [
      'Paris', 'London', 'Barcelona', 'Dubai', 'Tokyo',
      'Casablanca', 'Marrakech', 'Rabat', 'Tangier', 'Agadir'  // Moroccan cities
    ];
    
    const city = featuredCities[Math.floor(Math.random() * featuredCities.length)];
    
    // Load hotels from Booking.com API - works naturally with all cities including Moroccan
    this.hotelService.list(city, 6).subscribe({
      next: (results) => {
        console.log(`✓ Booking hotels (${city}):`, results);
        this.hotels = results;
        
        // Enhance hotels with high-quality Unsplash images ONLY if they don't have images
        this.hotels.forEach((hotel, index) => {
          // Check if hotel already has a good image from Booking.com API
          const hasBookingImage = hotel.imageUrl && 
                                  !hotel.imageUrl.includes('unsplash.com') && 
                                  hotel.imageUrl.startsWith('http');
          
          // Only load from Unsplash if no Booking.com image exists
          if (!hasBookingImage) {
            const orientation = index % 2 === 0 ? 'exterior' : 'lobby';
            this.imageService.getHotelImage(city, orientation, 'full').subscribe({
              next: (imageResult) => {
                hotel.imageUrl = imageResult.url;
              },
              error: (err) => console.warn(`Could not load image for hotel ${hotel.name}:`, err)
            });
          }
        });
        
        this.loadingHotels = false;
        console.log('✓ Hotels loaded:', this.hotels.length);
      },
      error: (err) => {
        console.error('✗ Error loading hotels:', err);
        this.loadingHotels = false;
      }
    });
  }
}
