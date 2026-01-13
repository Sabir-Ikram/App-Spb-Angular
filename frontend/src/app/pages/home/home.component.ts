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

    <!-- SECTION 1: Morocco Highlights - Premium Editorial Cards -->
    <section class="morocco-highlights-premium">
      <div class="highlights-container">
        <div class="section-header-premium">
          <span class="section-badge">
            <mat-icon>star</mat-icon>
            Featured
          </span>
          <h2 class="section-title">
            <mat-icon class="section-icon">explore</mat-icon>
            Discover the Magic of Morocco
          </h2>
          <p class="section-subtitle">From imperial cities to golden dunes • Experience the Kingdom's timeless wonders</p>
        </div>
        
        <div class="highlights-grid">
          <!-- Card 1: Moroccan Heritage -->
          <div class="highlight-card heritage-card">
            <div class="card-bg" style="background-image: url('https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=900&h=600&fit=crop&q=80');"></div>
            <div class="card-overlay-gradient"></div>
            <div class="card-content-premium">
              <div class="card-category">
                <mat-icon>account_balance</mat-icon>
                <span>Heritage</span>
              </div>
              <h3 class="card-title-premium">Moroccan Heritage</h3>
              <p class="card-desc-premium">Imperial cities, ancient medinas, and timeless traditions</p>
            </div>
          </div>
          
          <!-- Card 2: Moroccan Gastronomy -->
          <div class="highlight-card gastronomy-card">
            <div class="card-bg" style="background-image: url('https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=900&h=600&fit=crop&q=80');"></div>
            <div class="card-overlay-gradient"></div>
            <div class="card-content-premium">
              <div class="card-category">
                <mat-icon>restaurant</mat-icon>
                <span>Cuisine</span>
              </div>
              <h3 class="card-title-premium">Moroccan Gastronomy</h3>
              <p class="card-desc-premium">Tajine, couscous, and authentic culinary experiences</p>
            </div>
          </div>
          
          <!-- Card 3: Moroccan Destinations -->
          <div class="highlight-card destinations-card">
            <div class="card-bg" style="background-image: url('https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=900&h=600&fit=crop&q=80');"></div>
            <div class="card-overlay-gradient"></div>
            <div class="card-content-premium">
              <div class="card-category">
                <mat-icon>landscape</mat-icon>
                <span>Travel</span>
              </div>
              <h3 class="card-title-premium">Moroccan Destinations</h3>
              <p class="card-desc-premium">From Sahara to coasts, discover breathtaking landscapes</p>
            </div>
          </div>
          
          <!-- Card 4: Morocco 2030 World Cup -->
          <div class="highlight-card worldcup-card">
            <div class="card-bg" style="background-image: url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=900&h=600&fit=crop&q=80');"></div>
            <div class="card-overlay-gradient"></div>
            <div class="card-content-premium">
              <div class="card-category">
                <mat-icon>sports_soccer</mat-icon>
                <span>2030</span>
              </div>
              <h3 class="card-title-premium">Morocco 2030 World Cup</h3>
              <p class="card-desc-premium">World-class stadiums and football's future</p>
            </div>
          </div>
        </div>
        
      </div>
    </section>

    <!-- SECTION 2: Destinations Gallery - Horizontal Premium Tiles -->
    <section class="destinations-gallery-premium">
      <div class="gallery-container">
        <div class="section-header-premium">
          <span class="section-badge">
            <mat-icon>flight_takeoff</mat-icon>
            Explore
          </span>
          <h2 class="section-title">
            <mat-icon class="section-icon">public</mat-icon>
            Trending Destinations Worldwide
          </h2>
          <p class="section-subtitle">Curated journeys to the world's most captivating places • Book your next adventure</p>
        </div>
        
        <div *ngIf="loadingDestinations" class="loading-center">
          <mat-spinner diameter="40" color="primary"></mat-spinner>
        </div>
      
        <div class="destinations-scroll-wrapper" *ngIf="!loadingDestinations && destinations.length > 0">
          <div class="destinations-horizontal-scroll">
            <!-- First set of tiles -->
            <div class="destination-tile" *ngFor="let dest of destinations.slice(0, 8)">
              <div class="tile-image" [style.background-image]="dest.imageUrl ? 'url(' + dest.imageUrl + ')' : 'none'">
                <div *ngIf="!dest.imageUrl" class="tile-placeholder">
                  <mat-icon>location_city</mat-icon>
                </div>
                <div class="tile-overlay"></div>
                <div class="tile-content">
                  <h4 class="tile-name">{{ dest.city || dest.name }}</h4>
                  <p class="tile-country" *ngIf="!isMorocco(dest)">{{ dest.country }}</p>
                  <span class="tile-badge" *ngIf="isMorocco(dest)">
                    <mat-icon>star</mat-icon>
                  </span>
                </div>
              </div>
            </div>
            <!-- Duplicate tiles for seamless loop -->
            <div class="destination-tile" *ngFor="let dest of destinations.slice(0, 8)" aria-hidden="true">
              <div class="tile-image" [style.background-image]="dest.imageUrl ? 'url(' + dest.imageUrl + ')' : 'none'">
                <div *ngIf="!dest.imageUrl" class="tile-placeholder">
                  <mat-icon>location_city</mat-icon>
                </div>
                <div class="tile-overlay"></div>
                <div class="tile-content">
                  <h4 class="tile-name">{{ dest.city || dest.name }}</h4>
                  <p class="tile-country" *ngIf="!isMorocco(dest)">{{ dest.country }}</p>
                  <span class="tile-badge" *ngIf="isMorocco(dest)">
                    <mat-icon>star</mat-icon>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div *ngIf="!loadingDestinations && destinations.length === 0" class="empty-state-simple">
          <mat-icon>explore_off</mat-icon>
          <p>Destinations loading...</p>
        </div>
      </div>
    </section>

    <!-- SECTION 3: Seasonal Moroccan Experiences - Premium Cards -->
    <section class="seasonal-experiences-premium">
      <div class="experiences-container">
        <div class="section-header-premium">
          <span class="section-badge">
            <mat-icon>auto_stories</mat-icon>
            Seasonal
          </span>
          <h2 class="section-title">
            <mat-icon class="section-icon">trending_up</mat-icon>
            Seasonal Moroccan Experiences
          </h2>
          <p class="section-subtitle">Journey through the Kingdom's most enchanting cultural moments • Year-round adventures</p>
        </div>
        
        <div *ngIf="trendingDestinations && trendingDestinations.length > 0" class="experiences-grid">
          <div class="experience-card" *ngFor="let trend of trendingDestinations.slice(0, 4)">
            <div class="experience-image" [style.background-image]="'url(' + trend.image + ')'">
              <div class="experience-overlay"></div>
              <span class="experience-season-badge" *ngIf="trend.month">{{ trend.month }}</span>
              <span class="experience-growth-badge" *ngIf="trend.growth">
                <mat-icon>trending_up</mat-icon>
                {{ trend.growth }}
              </span>
            </div>
            <div class="experience-details">
              <div class="experience-header">
                <h3 class="experience-title">{{ trend.city }}</h3>
                <span class="experience-country" *ngIf="trend.country">{{ trend.country }}</span>
              </div>
              <div class="experience-info">
                <div class="experience-highlight">
                  <mat-icon>{{ getExperienceIcon(trend.city) }}</mat-icon>
                  <span>{{ getExperienceText(trend.city) }}</span>
                </div>
                <span class="experience-badge" *ngIf="trend.badge">{{ trend.badge }}</span>
              </div>
              <div class="experience-footer">
                <span class="experience-price">From {{ trend.price }}</span>
                <button mat-raised-button color="primary" routerLink="/search" class="explore-btn">
                  <span>Explore</span>
                  <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Special: 2030 FIFA World Cup Card -->
          <div class="experience-card special-worldcup">
            <div class="experience-image worldcup-image">
              <div class="experience-overlay"></div>
              <span class="experience-season-badge worldcup-badge">2030</span>
              <div class="worldcup-icon-animated">
                <mat-icon>sports_soccer</mat-icon>
              </div>
            </div>
            <div class="experience-details">
              <div class="experience-header">
                <h3 class="experience-title">FIFA World Cup</h3>
                <span class="experience-country">Morocco Host Nation</span>
              </div>
              <div class="experience-info">
                <div class="experience-highlight">
                  <mat-icon>stadium</mat-icon>
                  <span>World-Class Football</span>
                </div>
                <span class="experience-badge special-badge">HISTORIC EVENT</span>
              </div>
              <div class="experience-footer">
                <span class="experience-price">Experience History</span>
                <button mat-raised-button color="primary" class="explore-btn">
                  <span>Discover</span>
                  <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div *ngIf="!trendingDestinations || trendingDestinations.length === 0" class="empty-state-simple">
          <mat-icon>event_available</mat-icon>
          <p>Experiences loading...</p>
        </div>
      </div>
    </section>

    <!-- SECTION 4: Featured Flights - Your Gateway to Morocco -->
    <section class="flights-section-premium">
      <div class="flights-container">
        <div class="section-header-premium">
          <span class="section-badge">
            <mat-icon>connecting_airports</mat-icon>
            Premium Routes
          </span>
          <h2 class="section-title">
            <mat-icon class="section-icon">flight</mat-icon>
            Your Gateway to Morocco
          </h2>
          <p class="section-subtitle">Direct flights from major cities • Competitive fares • Best routes connecting the world</p>
        </div>
        
        <div *ngIf="loadingFlights" class="loading-center">
          <mat-spinner diameter="50" color="primary"></mat-spinner>
          <p class="loading-text">Finding best flight paths...</p>
        </div>
        
        <div class="flights-grid" *ngIf="!loadingFlights && flights.length > 0">
          <div class="flight-card" *ngFor="let flight of flights">
            <!-- Airline Header -->
            <div class="flight-card-header">
              <div class="airline-info" *ngIf="flight.airline">
                <div class="airline-logo-badge" [class.royal-air-maroc]="flight.airline.includes('Air Maroc')">
                  <mat-icon>airlines</mat-icon>
                </div>
                <div class="airline-text">
                  <span class="airline-name">{{ flight.airline }}</span>
                  <span class="flight-number" *ngIf="flight.flightNumber">{{ flight.flightNumber }}</span>
                </div>
              </div>
              <span *ngIf="isDirectFlight(flight)" class="direct-badge">
                <mat-icon>done_all</mat-icon>
                Direct
              </span>
            </div>
            
            <!-- Route Visualization -->
            <div class="flight-route">
              <div class="route-point">
                <mat-icon class="route-icon">flight_takeoff</mat-icon>
                <div class="route-details">
                  <span class="airport-code-large">{{ flight.originCity || flight.origin || getFlightOrigin(flight.departure) || 'Origin' }}</span>
                  <span class="city-name">{{ flight.origin || 'Departure' }}</span>
                </div>
              </div>
              
              <div class="route-line">
                <div class="plane-icon">
                  <mat-icon>flight</mat-icon>
                </div>
                <span class="duration-text" *ngIf="flight.duration">{{ flight.duration }}</span>
              </div>
              
              <div class="route-point">
                <mat-icon class="route-icon destination-icon">flight_land</mat-icon>
                <div class="route-details">
                  <span class="airport-code-large">{{ flight.destinationCity || flight.destination || getFlightDestination(flight.arrival) || 'Destination' }}</span>
                  <span class="city-name">{{ flight.destination || 'Arrival' }}</span>
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
                    <span class="time-value">{{ flight.departure | date:'short' }}</span>
                  </div>
                </div>
                <div class="time-block">
                  <mat-icon>schedule</mat-icon>
                  <div class="time-text">
                    <span class="time-label">Arrival</span>
                    <span class="time-value">{{ flight.arrival | date:'short' }}</span>
                  </div>
                </div>
              </div>
              
              <div class="flight-meta">
                <span class="meta-item">
                  <mat-icon>airline_seat_recline_normal</mat-icon>
                  {{ flight.availableSeats }} seats
                </span>
                <span class="meta-item" *ngIf="flight.class">
                  <mat-icon>class</mat-icon>
                  {{ flight.class || 'Economy' }}
                </span>
                <span class="urgency-label" *ngIf="flight.availableSeats < 5">
                  <mat-icon>warning</mat-icon>
                  Only {{ flight.availableSeats }} left!
                </span>
              </div>
            </div>
            
            <!-- Price & Booking -->
            <div class="flight-footer">
              <div class="price-info">
                <span class="price-from">From</span>
                <span class="price-amount">{{ flight.price | currency }}</span>
                <span class="price-unit">per person</span>
              </div>
              <button mat-raised-button color="primary" routerLink="/search" class="book-btn">
                <span>Book Flight</span>
                <mat-icon>arrow_forward</mat-icon>
              </button>
            </div>
          </div>
        </div>
        
        <div *ngIf="!loadingFlights && flights.length === 0" class="empty-state-simple">
          <mat-icon>flight</mat-icon>
          <p>No flights available</p>
          <button mat-raised-button color="primary" routerLink="/search" class="search-flights-btn">
            <mat-icon>search</mat-icon>
            Search Flights
          </button>
        </div>
      </div>
    </section>

    <!-- SECTION 5: Exquisite Riads & Palaces -->
    <section class="hotels-section-premium">
      <div class="hotels-container">
        <div class="section-header-premium">
          <span class="section-badge">
            <mat-icon>castle</mat-icon>
            Luxury Stays
          </span>
          <h2 class="section-title">
            <mat-icon class="section-icon">apartment</mat-icon>
            Exquisite Riads & Palaces
          </h2>
          <p class="section-subtitle">Heritage properties where tradition meets luxury • Handpicked accommodations • Authentic Moroccan charm</p>
        </div>
        
        <div *ngIf="loadingHotels" class="loading-center">
          <mat-spinner diameter="50" color="primary"></mat-spinner>
          <p class="loading-text">Curating exclusive properties...</p>
        </div>
        
        <div class="hotels-grid" *ngIf="!loadingHotels && hotels.length > 0">
          <div class="hotel-card" *ngFor="let hotel of hotels">
            <!-- Hotel Image with Badge -->
            <div class="hotel-image-section">
              <img *ngIf="hotel.imageUrl" [src]="hotel.imageUrl" alt="{{ hotel.name }}" class="hotel-image">
              <div *ngIf="!hotel.imageUrl" class="hotel-image-placeholder">
                <mat-icon class="placeholder-icon">apartment</mat-icon>
              </div>
              <div class="hotel-overlay"></div>
              
              <span class="category-badge">
                <mat-icon>{{ getCategoryIcon(getHotelCategory(hotel)) }}</mat-icon>
                {{ getCategoryLabel(getHotelCategory(hotel)) }}
              </span>
              
              <div class="rating-badge" *ngIf="hotel.rating">
                <div class="stars">
                  <mat-icon *ngFor="let i of [1,2,3,4,5]" [class.filled]="i <= hotel.rating">star</mat-icon>
                </div>
                <span class="rating-text">{{ hotel.rating }}/5</span>
              </div>
            </div>
            
            <!-- Hotel Content -->
            <div class="hotel-content">
              <h3 class="hotel-name">{{ hotel.name }}</h3>
              
              <div class="hotel-location">
                <mat-icon>location_on</mat-icon>
                <span>{{ hotel.address }}</span>
              </div>
              
              <p class="hotel-description">{{ hotel.description || 'Experience authentic Moroccan hospitality in a beautifully restored heritage property' }}</p>
              
              <div class="hotel-features">
                <span class="feature-tag">
                  <mat-icon>architecture</mat-icon>
                  Authentic
                </span>
                <span class="feature-tag" *ngIf="hotel.rating && hotel.rating >= 4">
                  <mat-icon>verified</mat-icon>
                  Excellence
                </span>
                <span class="feature-tag">
                  <mat-icon>explore</mat-icon>
                  UNESCO Nearby
                </span>
              </div>
              
              <div class="hotel-footer">
                <div class="price-section">
                  <span class="price-label">From</span>
                  <span class="price-value">{{ hotel.pricePerNight | currency }}</span>
                  <span class="price-unit">per night</span>
                </div>
                <div class="rooms-info">
                  <mat-icon>meeting_room</mat-icon>
                  <span>{{ hotel.availableRooms }} rooms</span>
                </div>
              </div>
              
              <button mat-raised-button color="primary" routerLink="/hotels" class="view-btn">
                <span>View Property</span>
                <mat-icon>arrow_forward</mat-icon>
              </button>
            </div>
          </div>
        </div>
        
        <div *ngIf="!loadingHotels && hotels.length === 0" class="empty-state-simple">
          <mat-icon>apartment</mat-icon>
          <p>No hotels available</p>
          <button mat-raised-button color="primary" routerLink="/hotels" class="search-hotels-btn">
            <mat-icon>search</mat-icon>
            Find Hotels
          </button>
        </div>
      </div>
    </section>

    <!-- NEW: Moroccan Gastronomy Journey Section -->
    <div class="gastronomy-section">
      <div class="container">
        <div class="gastronomy-header">
          <span class="gastronomy-badge">
            <mat-icon>restaurant</mat-icon>
            Culinary Heritage
          </span>
          <h2 class="section-title text-center">
            <mat-icon class="section-icon">restaurant_menu</mat-icon>
            Moroccan Gastronomy Journey
          </h2>
          <p class="section-subtitle">Discover the rich flavors and culinary traditions of Morocco</p>
        </div>
        
        <div class="gastronomy-timeline">
          <div class="gastronomy-item">
            <div class="gastronomy-card">
              <div class="gastronomy-image" style="background-image: url('https://images.unsplash.com/photo-1596040033229-a0b3b69cc3f4?w=600&h=400&fit=crop');">
                <div class="gastronomy-overlay"></div>
              </div>
              <div class="gastronomy-icon">
                <mat-icon>restaurant</mat-icon>
              </div>
              <div class="gastronomy-content">
                <h3 class="dish-name">Tagine</h3>
                <p class="dish-origin">Marrakech</p>
                <p class="dish-description">Slow-cooked savory stew with aromatic spices</p>
                <button mat-stroked-button class="food-tour-btn">
                  <mat-icon>explore</mat-icon>
                  Food Tours
                </button>
              </div>
            </div>
          </div>
          
          <div class="gastronomy-item">
            <div class="gastronomy-card">
              <div class="gastronomy-image" style="background-image: url('https://images.unsplash.com/photo-1645810722108-998f6e88c2c7?w=600&h=400&fit=crop');">
                <div class="gastronomy-overlay"></div>
              </div>
              <div class="gastronomy-icon">
                <mat-icon>cake</mat-icon>
              </div>
              <div class="gastronomy-content">
                <h3 class="dish-name">Couscous</h3>
                <p class="dish-origin">Fes</p>
                <p class="dish-description">Traditional Friday dish with seven vegetables</p>
                <button mat-stroked-button class="food-tour-btn">
                  <mat-icon>explore</mat-icon>
                  Food Tours
                </button>
              </div>
            </div>
          </div>
          
          <div class="gastronomy-item">
            <div class="gastronomy-card">
              <div class="gastronomy-image" style="background-image: url('https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&h=400&fit=crop');">
                <div class="gastronomy-overlay"></div>
              </div>
              <div class="gastronomy-icon">
                <mat-icon>bakery_dining</mat-icon>
              </div>
              <div class="gastronomy-content">
                <h3 class="dish-name">Pastilla</h3>
                <p class="dish-origin">Rabat</p>
                <p class="dish-description">Sweet and savory pigeon pie with almonds</p>
                <button mat-stroked-button class="food-tour-btn">
                  <mat-icon>explore</mat-icon>
                  Food Tours
                </button>
              </div>
            </div>
          </div>
          
          <div class="gastronomy-item">
            <div class="gastronomy-card">
              <div class="gastronomy-image" style="background-image: url('https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=600&h=400&fit=crop');">
                <div class="gastronomy-overlay"></div>
              </div>
              <div class="gastronomy-icon">
                <mat-icon>local_cafe</mat-icon>
              </div>
              <div class="gastronomy-content">
                <h3 class="dish-name">Mint Tea Ritual</h3>
                <p class="dish-origin">Nationwide</p>
                <p class="dish-description">The art of Moroccan hospitality in a cup</p>
                <button mat-stroked-button class="food-tour-btn">
                  <mat-icon>explore</mat-icon>
                  Food Tours
                </button>
              </div>
            </div>
          </div>
          
          <div class="gastronomy-item">
            <div class="gastronomy-card">
              <div class="gastronomy-image" style="background-image: url('https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&h=400&fit=crop');">
                <div class="gastronomy-overlay"></div>
              </div>
              <div class="gastronomy-icon">
                <mat-icon>fastfood</mat-icon>
              </div>
              <div class="gastronomy-content">
                <h3 class="dish-name">Street Food</h3>
                <p class="dish-origin">Jemaa el-Fna</p>
                <p class="dish-description">Authentic flavors from Marrakech's iconic square</p>
                <button mat-stroked-button class="food-tour-btn">
                  <mat-icon>explore</mat-icon>
                  Food Tours
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Customer Reviews Section - Traveler Stories from Morocco -->
    <div class="reviews-section moroccan-stories">
      <div class="container">
        <div class="stories-header">
          <span class="stories-badge">
            <mat-icon>auto_stories</mat-icon>
            Authentic Experiences
          </span>
          <h2 class="section-title text-center">
            <mat-icon class="section-icon">star</mat-icon>
            Traveler Stories from Morocco
          </h2>
          <p class="section-subtitle">Join thousands of satisfied travelers discovering the magic of Morocco</p>
        </div>
        
        <div class="reviews-grid-premium">
          <mat-card class="review-card-premium" *ngFor="let review of customerReviews">
            <div class="review-moroccan-pattern"></div>
            <div class="review-header-premium">
              <div class="review-avatar-premium">{{ review.initials }}</div>
              <div class="review-author-info-premium">
                <h4 class="review-author-premium">{{ review.name }}</h4>
                <div class="review-rating-premium">
                  <mat-icon *ngFor="let star of [1,2,3,4,5]" class="star-icon-premium">star</mat-icon>
                </div>
              </div>
            </div>
            <p class="review-text-premium">"{{ review.text }}"</p>
            <div class="review-footer-premium">
              <mat-icon class="verified-icon-premium">verified</mat-icon>
              <span class="verified-text-premium">Verified Traveler</span>
            </div>
            <div class="review-destination-badge">
              <mat-icon>explore</mat-icon>
              <span>Morocco Explorer</span>
            </div>
          </mat-card>
        </div>
      </div>
    </div>

    <!-- Why Choose Us - Commercial Features -->
    <section class="why-choose-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Why Choose VoyageConnect</h2>
          <p class="section-subtitle">Your trusted partner for unforgettable travel experiences</p>
        </div>
        
        <div class="features-commercial-grid">
          <div class="feature-commercial-card">
            <div class="feature-commercial-icon">
              <mat-icon>verified_user</mat-icon>
            </div>
            <h3>Secure Booking</h3>
            <p>Bank-level encryption and secure payment processing for your peace of mind</p>
          </div>
          
          <div class="feature-commercial-card">
            <div class="feature-commercial-icon">
              <mat-icon>support_agent</mat-icon>
            </div>
            <h3>24/7 Support</h3>
            <p>Multilingual customer service team available around the clock</p>
          </div>
          
          <div class="feature-commercial-card">
            <div class="feature-commercial-icon">
              <mat-icon>payments</mat-icon>
            </div>
            <h3>Best Price Guarantee</h3>
            <p>Find a lower price? We'll match it and give you 10% off</p>
          </div>
          
          <div class="feature-commercial-card">
            <div class="feature-commercial-icon">
              <mat-icon>event_available</mat-icon>
            </div>
            <h3>Free Cancellation</h3>
            <p>Cancel up to 24 hours before your trip for a full refund</p>
          </div>
        </div>
      </div>
    </section>

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
      padding: 0 2rem;
    }

    @media (max-width: 768px) {
      .container {
        padding: 0 1.5rem;
      }
    }

    .loading-center {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 0;
      gap: 1rem;
    }

    .loading-text {
      color: var(--deep-blue);
      font-size: 1rem;
      opacity: 0.8;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 0;
      color: var(--gray-900);
    }

    .empty-state .empty-icon {
      font-size: 64px !important;
      width: 64px !important;
      height: 64px !important;
      color: var(--sand);
      opacity: 0.5;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--deep-blue);
      margin-bottom: 0.5rem;
    }

    .empty-state p {
      color: var(--gray-900);
      opacity: 0.7;
    }

    .section-title {
      font-family: 'Playfair Display', 'Georgia', serif;
      font-size: 3rem;
      font-weight: 700;
      color: var(--navy-primary);
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1.25rem;
      letter-spacing: -0.02em;
      line-height: 1.2;
      position: relative;
    }

    .section-title::before {
      content: '';
      width: 40px;
      height: 2px;
      background: var(--gold-accent);
      display: inline-block;
    }

    .section-title::after {
      content: '';
      width: 40px;
      height: 2px;
      background: var(--gold-accent);
      display: inline-block;
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
       DISCOVER MOROCCO SECTION - 4 Premium Cards
       ============================================ */
    .discover-morocco-section {
      padding: 5rem 0;
      background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
    }

    .section-header {
      text-align: center;
      margin-bottom: 4rem;
      position: relative;
    }

    .section-header::after {
      content: '';
      display: block;
      width: 80px;
      height: 4px;
      background: linear-gradient(90deg, transparent, var(--gold-accent), transparent);
      margin: 1.5rem auto 0;
      border-radius: 2px;
    }

    .discover-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
      margin-top: 3rem;
    }

    .discover-card {
      position: relative;
      height: 450px;
      border-radius: 20px;
      overflow: hidden;
      cursor: pointer;
      background-size: cover;
      background-position: center;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }

    .discover-card:hover {
      transform: translateY(-12px) scale(1.02);
      box-shadow: 0 24px 48px rgba(0, 0, 0, 0.25), 0 0 0 2px var(--gold-accent);
    }

    .card-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%);
      transition: background 0.4s;
    }

    .discover-card:hover .card-overlay {
      background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 100%);
    }

    .card-content {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 2rem;
      color: white;
      z-index: 2;
    }

    .card-icon {
      font-size: 48px !important;
      width: 48px !important;
      height: 48px !important;
      margin-bottom: 1rem;
      color: var(--gold-accent);
      filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3));
    }

    .card-title {
      font-family: 'Playfair Display', serif;
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 0.75rem;
      color: white;
      text-shadow: 0 3px 16px rgba(0,0,0,0.6);
      letter-spacing: -0.02em;
      line-height: 1.3;
    }

    .card-subtitle {
      font-size: 0.95rem;
      line-height: 1.5;
      color: rgba(255,255,255,0.95);
      text-shadow: 0 1px 4px rgba(0,0,0,0.3);
    }

    @media (max-width: 1200px) {
      .discover-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .discover-grid {
        grid-template-columns: 1fr;
      }
    }

    /* ============================================
       DESTINATIONS GALLERY - Clean Grid
       ============================================ */
    .destinations-gallery-section {
      padding: 5rem 0;
      background: white;
    }

    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
      align-items: start;
    }

    @media (max-width: 1200px) {
      .gallery-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (max-width: 768px) {
      .gallery-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 480px) {
      .gallery-grid {
        grid-template-columns: 1fr;
      }
    }

    .destination-card {
      cursor: pointer;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      width: 100%;
      min-height: 220px;
    }

    .destination-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, var(--gold-accent), #f4d03f);
      opacity: 0;
      transition: opacity 0.4s;
      z-index: 10;
    }

    .destination-card:hover::before {
      opacity: 1;
    }

    .destination-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 16px 40px rgba(0,0,0,0.2), 0 0 0 1px rgba(212, 175, 55, 0.2);
    }

    .destination-image {
      height: 220px;
      width: 100%;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      position: relative;
      transition: transform 0.4s;
    }

    .destination-card:hover .destination-image {
      transform: scale(1.05);
    }

    .image-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.65) 100%);
      transition: background 0.4s;
    }

    .destination-card:hover .image-overlay {
      background: linear-gradient(180deg, rgba(212,175,55,0.2) 0%, rgba(0,0,0,0.75) 100%);
    }

    .destination-info {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 1.25rem;
      color: white;
      transform: translateY(0);
      transition: transform 0.4s;
    }

    .destination-card:hover .destination-info {
      transform: translateY(-4px);
    }

    .destination-name {
      font-family: 'Playfair Display', serif;
      font-size: 1.3rem;
      font-weight: 700;
      margin-bottom: 0.4rem;
      color: white;
      text-shadow: 0 2px 12px rgba(0,0,0,0.5);
      letter-spacing: -0.01em;
    }

    .destination-country {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.9rem;
      color: rgba(255,255,255,0.95);
      font-weight: 500;
      text-shadow: 0 1px 8px rgba(0,0,0,0.4);
    }

    .destination-country mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--gold-accent);
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    }

    /* ============================================
       TRAVEL SERVICES - Premium Blocks
       ============================================ */
    .travel-services-section {
      padding: 6rem 0;
      background: var(--gray-100);
    }

    .services-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 3rem;
      margin-top: 3rem;
    }

    @media (max-width: 768px) {
      .services-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
    }

    .service-block {
      background: var(--white-clean);
      border-radius: 16px;
      padding: 3rem 2.5rem;
      box-shadow: var(--shadow-soft);
      transition: var(--transition-smooth);
      border-top: 4px solid var(--terracotta);
    }

    .service-block:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-medium);
      border-top-color: var(--emerald);
    }

    .service-icon-wrapper {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--terracotta) 0%, var(--terracotta-dark) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
    }

    .service-block:hover .service-icon-wrapper {
      background: linear-gradient(135deg, var(--emerald) 0%, var(--emerald-light) 100%);
    }

    .service-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: white;
    }

    .service-title {
      font-family: 'Playfair Display', serif;
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--deep-blue);
      margin: 0 0 1rem 0;
    }

    .service-description {
      font-size: 1rem;
      line-height: 1.6;
      color: var(--gray-900);
      margin-bottom: 1.5rem;
      opacity: 0.85;
    }

    .service-features {
      list-style: none;
      padding: 0;
      margin: 0 0 2rem 0;
    }

    .service-features li {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 0;
      font-size: 0.95rem;
      color: var(--gray-900);
      border-bottom: 1px solid var(--gray-100);
    }

    .service-features li:last-child {
      border-bottom: none;
    }

    .service-features mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: var(--emerald);
    }

    .service-cta {
      width: 100%;
      padding: 0.875rem 1.5rem;
      font-size: 1rem;
      font-weight: 600;
      text-transform: none;
      letter-spacing: 0.02em;
    }

    /* ============================================
       TRAVEL SERVICES - Flights & Hotels Blocks
       ============================================ */
    .travel-services-section {
      padding: 5rem 0;
      background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
    }

    .services-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 3rem;
      margin-top: 3rem;
    }

    @media (max-width: 968px) {
      .services-grid {
        grid-template-columns: 1fr;
      }
    }

    .service-block {
      background: white;
      border-radius: 16px;
      padding: 2.5rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      transition: transform 0.3s, box-shadow 0.3s;
    }

    .service-block:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.12);
    }

    .service-header {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .service-icon-wrapper {
      width: 64px;
      height: 64px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .flights-block .service-icon-wrapper {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .hotels-block .service-icon-wrapper {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    .service-icon {
      font-size: 32px !important;
      width: 32px !important;
      height: 32px !important;
      color: white;
    }

    .service-title-wrapper h3 {
      font-family: 'Playfair Display', serif;
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--navy-primary);
      margin: 0 0 0.25rem 0;
    }

    .service-description {
      color: var(--text-secondary);
      font-size: 0.95rem;
      margin: 0;
    }

    .service-items {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .service-item {
      padding: 1.25rem;
      background: #f8f9fa;
      border-radius: 12px;
      transition: background 0.3s;
    }

    .service-item:hover {
      background: #e9ecef;
    }

    .item-route {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 0.75rem;
    }

    .route-point {
      font-weight: 700;
      font-size: 1.1rem;
      color: var(--navy-primary);
    }

    .route-arrow {
      font-size: 20px !important;
      width: 20px !important;
      height: 20px !important;
      color: var(--gold-accent);
    }

    .item-details {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .item-airline {
      font-size: 0.9rem;
      color: var(--text-secondary);
    }

    .item-price {
      font-weight: 700;
      font-size: 1.25rem;
      color: var(--gold-accent);
    }

    .item-info h4 {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--navy-primary);
      margin: 0 0 0.5rem 0;
    }

    .item-location {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.9rem;
      color: var(--text-secondary);
      margin: 0;
    }

    .location-icon {
      font-size: 16px !important;
      width: 16px !important;
      height: 16px !important;
    }

    .item-pricing {
      text-align: right;
    }

    .item-name {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--navy-primary);
      margin: 0 0 0.5rem 0;
    }

    .price-unit {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }

    .service-cta {
      width: 100%;
      height: 48px;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 12px;
    }

    /* ============================================
       WHY CHOOSE US - Commercial Features
       ============================================ */
    .why-choose-section {
      padding: 6rem 0;
      background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
    }

    .features-commercial-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 2rem;
      margin-top: 3rem;
    }

    @media (max-width: 1024px) {
      .features-commercial-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 640px) {
      .features-commercial-grid {
        grid-template-columns: 1fr;
      }
    }

    .feature-commercial-card {
      text-align: center;
      padding: 2.5rem 2rem;
      background: white;
      border-radius: 16px;
      box-shadow: 0 2px 16px rgba(0,0,0,0.06);
      transition: all 0.3s;
    }

    .feature-commercial-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 32px rgba(0,0,0,0.12);
    }

    .feature-commercial-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 1.5rem;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--gold-accent) 0%, #f4d03f 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(212, 175, 55, 0.3);
    }

    .feature-commercial-icon mat-icon {
      font-size: 40px !important;
      width: 40px !important;
      height: 40px !important;
      color: white;
    }

    .feature-commercial-card h3 {
      font-family: 'Playfair Display', serif;
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--navy-primary);
      margin-bottom: 1rem;
    }

    .feature-commercial-card p {
      font-size: 1rem;
      line-height: 1.6;
      color: var(--text-secondary);
      margin: 0;
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
      background: linear-gradient(135deg, var(--terracotta) 0%, var(--deep-blue) 100%);
      color: white;
      padding: 5rem 2rem;
      text-align: center;
      position: relative;
      overflow: hidden;
      margin-top: 4rem;
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
      font-family: 'Playfair Display', serif;
      font-size: 2.75rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      letter-spacing: -0.02em;
      text-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
    }

    .cta-content p {
      font-size: 1.25rem;
      margin-bottom: 2.5rem;
      opacity: 0.95;
      line-height: 1.6;
    }

    .cta-buttons {
      display: flex;
      gap: 1.5rem;
      justify-content: center;
      flex-wrap: wrap;
      margin-top: 2rem;
    }

    .cta-btn {
      padding: 0 2.5rem !important;
      font-size: 1.125rem !important;
      height: 56px !important;
      border-radius: 50px !important;
      font-weight: 700 !important;
      transition: var(--transition-smooth) !important;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
      display: inline-flex !important;
      align-items: center !important;
      gap: 8px !important;
      background: var(--emerald) !important;
    }

    .cta-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25) !important;
      background: var(--emerald-light) !important;
    }

    .cta-btn-secondary {
      padding: 0 2.5rem !important;
      font-size: 1.125rem !important;
      height: 56px !important;
      border-radius: 50px !important;
      font-weight: 600 !important;
      background: transparent !important;
      border: 2px solid white !important;
      color: white !important;
      transition: var(--transition-smooth) !important;
      display: inline-flex !important;
      align-items: center !important;
      gap: 8px !important;
    }

    .cta-btn-secondary:hover {
      background: white !important;
      color: var(--deep-blue) !important;
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

    /* ============================================
       MOROCCAN HERITAGE MOSAIC - DESTINATIONS
       ============================================ */
    .moroccan-heritage-mosaic {
      position: relative;
      overflow: hidden;
    }
    
    .heritage-header {
      text-align: center;
      margin-bottom: 3rem;
    }
    
    .heritage-badge,
    .navigator-badge,
    .collection-badge,
    .timeline-badge,
    .gastronomy-badge,
    .excellence-badge,
    .stories-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, var(--gold-accent) 0%, #f4d03f 100%);
      color: var(--navy-primary);
      padding: 10px 24px;
      border-radius: 30px;
      font-weight: 600;
      font-size: 0.9rem;
      margin-bottom: 1rem;
      box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
    }
    
    .heritage-badge mat-icon,
    .navigator-badge mat-icon,
    .collection-badge mat-icon,
    .timeline-badge mat-icon,
    .gastronomy-badge mat-icon,
    .excellence-badge mat-icon,
    .stories-badge mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    
    .destinations-mosaic-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-top: 2rem;
    }
    
    .destination-mosaic-card.morocco-large {
      grid-column: span 2;
      grid-row: span 2;
    }
    
    .destination-mosaic-card {
      border-radius: 16px !important;
      overflow: hidden;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      padding: 0 !important;
      position: relative;
      cursor: pointer;
    }
    
    .destination-mosaic-card:hover {
      transform: scale(1.03);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2) !important;
      z-index: 10;
    }
    
    .mosaic-image-container {
      position: relative;
      height: 100%;
      min-height: 320px;
    }
    
    .destination-mosaic-card.morocco-large .mosaic-image-container {
      min-height: 500px;
    }
    
    .mosaic-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .destination-mosaic-card:hover .mosaic-image {
      transform: scale(1.1);
    }
    
    .mosaic-gradient-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to bottom,
        transparent 0%,
        rgba(10, 25, 47, 0.3) 50%,
        rgba(10, 25, 47, 0.9) 100%
      );
      transition: opacity 0.4s;
    }
    
    .destination-mosaic-card:hover .mosaic-gradient-overlay {
      background: linear-gradient(
        to bottom,
        transparent 0%,
        rgba(10, 25, 47, 0.5) 40%,
        rgba(10, 25, 47, 0.95) 100%
      );
    }
    
    .mosaic-content {
      position: absolute;
      inset: 0;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      z-index: 2;
    }
    
    .mosaic-top-badges {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    
    .national-treasure-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      background: linear-gradient(135deg, var(--gold-accent) 0%, #f4d03f 100%);
      color: var(--navy-primary);
      padding: 8px 16px;
      border-radius: 30px;
      font-weight: 600;
      font-size: 0.85rem;
      box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4);
    }
    
    .national-treasure-badge mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    
    .iata-badge {
      background: rgba(255, 255, 255, 0.25);
      backdrop-filter: blur(10px);
      color: white;
      padding: 6px 14px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.85rem;
    }
    
    .mosaic-main-info {
      text-align: center;
      color: white;
    }
    
    .mosaic-city-name {
      font-family: 'Playfair Display', serif;
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
      text-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .destination-mosaic-card:hover .mosaic-city-name {
      opacity: 1;
      transform: translateY(0);
    }
    
    .mosaic-poetic-subtitle {
      font-family: 'Inter', sans-serif;
      font-size: 1.1rem;
      font-style: italic;
      color: var(--gold-accent);
      margin: 0;
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.1s;
    }
    
    .destination-mosaic-card:hover .mosaic-poetic-subtitle {
      opacity: 1;
      transform: translateY(0);
    }
    
    .mosaic-country {
      font-size: 1rem;
      margin: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    
    .mosaic-actions {
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.2s;
    }
    
    .destination-mosaic-card:hover .mosaic-actions {
      opacity: 1;
      transform: translateY(0);
    }
    
    .mosaic-action-btn {
      background: linear-gradient(135deg, var(--gold-accent) 0%, #f4d03f 100%) !important;
      color: var(--navy-primary) !important;
      font-weight: 600 !important;
      padding: 12px 28px !important;
      border-radius: 30px !important;
      box-shadow: 0 8px 20px rgba(212, 175, 55, 0.4) !important;
    }

    /* ============================================
       MOROCCAN EXPERIENCES TIMELINE - TRENDING
       ============================================ */
    .moroccan-timeline {
      background: linear-gradient(135deg, var(--navy-primary) 0%, #0f3460 100%);
      position: relative;
      overflow: hidden;
    }
    
    .moroccan-timeline::before {
      content: '';
      position: absolute;
      inset: 0;
      background: 
        repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(212, 175, 55, 0.03) 40px, rgba(212, 175, 55, 0.03) 80px),
        repeating-linear-gradient(-45deg, transparent, transparent 40px, rgba(166, 75, 42, 0.02) 40px, rgba(166, 75, 42, 0.02) 80px);
      opacity: 0.5;
    }
    
    .timeline-header {
      text-align: center;
      padding: 3rem 0;
      color: white;
    }
    
    .timeline-header .section-title {
      color: white;
    }
    
    .timeline-header .section-subtitle {
      color: rgba(255, 255, 255, 0.8);
    }
    
    .timeline-scroll-container {
      position: relative;
      overflow-x: auto;
      overflow-y: hidden;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: thin;
      scrollbar-color: var(--gold-accent) rgba(255, 255, 255, 0.1);
      padding: 2rem 0;
    }
    
    .timeline-scroll-container::-webkit-scrollbar {
      height: 8px;
    }
    
    .timeline-scroll-container::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }
    
    .timeline-scroll-container::-webkit-scrollbar-thumb {
      background: var(--gold-accent);
      border-radius: 4px;
    }
    
    .timeline-track {
      display: flex;
      gap: 2rem;
      padding: 0 2rem 2rem;
      min-width: min-content;
    }
    
    .timeline-chapter {
      flex: 0 0 320px;
      position: relative;
    }
    
    .timeline-chapter.special-chapter {
      flex: 0 0 340px;
    }
    
    .chapter-card {
      background: rgba(255, 255, 255, 0.97);
      border-radius: 20px;
      overflow: hidden;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      height: 100%;
    }
    
    .chapter-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
    }
    
    .chapter-card.world-cup-card {
      background: linear-gradient(135deg, #1a365d 0%, #0f3460 100%);
      border: 2px solid var(--gold-accent);
    }
    
    .chapter-date {
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }
    
    .month-badge {
      background: var(--gold-accent);
      color: var(--navy-primary);
      padding: 6px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.85rem;
    }
    
    .month-badge.fifa-badge {
      background: linear-gradient(135deg, var(--gold-accent) 0%, #f4d03f 100%);
      font-size: 1rem;
      padding: 8px 20px;
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    
    .chapter-icon {
      color: var(--navy-primary);
    }
    
    .chapter-image {
      position: relative;
      height: 200px;
      background-size: cover;
      background-position: center;
    }
    
    .chapter-image.world-cup-bg {
      background: linear-gradient(135deg, rgba(26, 54, 93, 0.9) 0%, rgba(15, 52, 96, 0.8) 100%),
                  url('https://images.unsplash.com/photo-1522778119026-d647f0565c6a?w=600&h=400&fit=crop');
      background-size: cover;
      background-position: center;
    }
    
    .chapter-badge {
      position: absolute;
      top: 1rem;
      left: 1rem;
      background: rgba(255, 255, 255, 0.95);
      color: var(--navy-primary);
      padding: 6px 14px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.8rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    
    .growth-indicator {
      position: absolute;
      bottom: 1rem;
      right: 1rem;
      background: rgba(0, 200, 100, 0.95);
      color: white;
      padding: 8px 14px;
      border-radius: 20px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 4px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    
    .growth-indicator mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    
    .animated-ball {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      animation: ballBounce 2s infinite ease-in-out;
    }
    
    .animated-ball mat-icon {
      font-size: 60px;
      width: 60px;
      height: 60px;
      color: var(--gold-accent);
      filter: drop-shadow(0 4px 12px rgba(212, 175, 55, 0.5));
    }
    
    @keyframes ballBounce {
      0%, 100% { transform: translate(-50%, -50%) translateY(0) rotate(0deg); }
      50% { transform: translate(-50%, -50%) translateY(-20px) rotate(180deg); }
    }
    
    .chapter-content {
      padding: 1.5rem;
    }
    
    .world-cup-card .chapter-content {
      color: white;
    }
    
    .chapter-title {
      font-family: 'Playfair Display', serif;
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
    }
    
    .chapter-subtitle {
      color: var(--text-secondary);
      margin: 0 0 1rem 0;
    }
    
    .world-cup-card .chapter-subtitle {
      color: rgba(255, 255, 255, 0.8);
    }
    
    .chapter-experience {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 1rem;
      padding: 8px 12px;
      background: rgba(212, 175, 55, 0.1);
      border-radius: 12px;
    }
    
    .world-cup-card .chapter-experience {
      background: rgba(212, 175, 55, 0.2);
    }
    
    .experience-icon {
      color: var(--gold-accent);
    }
    
    .experience-text {
      font-size: 0.9rem;
      font-weight: 500;
    }
    
    .chapter-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1rem;
      border-top: 1px solid rgba(0, 0, 0, 0.1);
    }
    
    .world-cup-card .chapter-footer {
      border-color: rgba(255, 255, 255, 0.2);
    }
    
    .chapter-price {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--navy-primary);
    }
    
    .world-cup-card .chapter-price {
      color: var(--gold-accent);
    }
    
    .explore-chapter-btn {
      background: var(--gold-accent) !important;
      color: var(--navy-primary) !important;
    }
    
    .timeline-scroll-hint {
      text-align: center;
      color: rgba(255, 255, 255, 0.7);
      padding: 1rem 0 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 0.9rem;
    }
    
    .timeline-scroll-hint mat-icon {
      animation: swipeHint 2s infinite ease-in-out;
    }
    
    @keyframes swipeHint {
      0%, 100% { transform: translateX(0); }
      50% { transform: translateX(10px); }
    }

    /* ============================================
       FLIGHT NAVIGATOR PREMIUM
       ============================================ */
    /* ============================================
       FLIGHTS SECTION PREMIUM
       ============================================ */
    .flights-section-premium {
      padding: 4rem 0;
      background: linear-gradient(135deg, #fdfcfb 0%, #f8f6f3 100%);
    }
    
    .flights-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }
    
    .flights-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 1.75rem;
      margin-top: 2.5rem;
    }
    
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
    
    .airline-logo-badge.royal-air-maroc {
      background: linear-gradient(135deg, #cc0000 0%, #990000 100%);
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
    
    .duration-text {
      position: absolute;
      top: -20px;
      background: white;
      padding: 3px 10px;
      border-radius: 10px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #6d5d4b;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      white-space: nowrap;
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
    
    /* Empty State */
    .empty-state-simple {
      text-align: center;
      padding: 3rem 2rem;
    }
    
    .empty-state-simple mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #8b6c50;
      opacity: 0.4;
      margin-bottom: 1rem;
    }
    
    .empty-state-simple p {
      color: #6d5d4b;
      margin-bottom: 1.5rem;
    }
    
    .search-flights-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 0 1.5rem !important;
      height: 44px !important;
      border-radius: 12px !important;
      font-weight: 600 !important;
      background: linear-gradient(135deg, #8b6c50 0%, #6d5d4b 100%) !important;
      color: white !important;
      box-shadow: 0 4px 16px rgba(139, 108, 80, 0.3) !important;
    }

    /* ============================================
       HOTELS SECTION PREMIUM
       ============================================ */
    .hotels-section-premium {
      padding: 4rem 0;
      background: linear-gradient(135deg, #fdfcfb 0%, #f8f6f3 100%);
    }
    
    .hotels-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }
    
    .hotels-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 1.75rem;
      margin-top: 2.5rem;
    }
    
    .hotel-card {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid rgba(139, 108, 80, 0.1);
      display: flex;
      flex-direction: column;
    }
    
    .hotel-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 12px 32px rgba(139, 108, 80, 0.2);
      border-color: #8b6c50;
    }
    
    /* Hotel Image Section */
    .hotel-image-section {
      position: relative;
      height: 240px;
      overflow: hidden;
    }
    
    .hotel-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .hotel-card:hover .hotel-image {
      transform: scale(1.08);
    }
    
    .hotel-image-placeholder {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #8b6c50 0%, #6d5d4b 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .placeholder-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: rgba(255, 255, 255, 0.4);
    }
    
    .hotel-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to bottom,
        transparent 0%,
        rgba(45, 36, 22, 0.15) 60%,
        rgba(45, 36, 22, 0.5) 100%
      );
    }
    
    .category-badge {
      position: absolute;
      top: 1rem;
      left: 1rem;
      z-index: 10;
      background: linear-gradient(135deg, #8b6c50 0%, #6d5d4b 100%);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.8rem;
      display: flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 4px 12px rgba(139, 108, 80, 0.4);
    }
    
    .category-badge mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    
    .rating-badge {
      position: absolute;
      bottom: 1rem;
      right: 1rem;
      z-index: 10;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      padding: 8px 14px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .stars {
      display: flex;
      gap: 2px;
    }
    
    .stars mat-icon {
      font-size: 13px;
      width: 13px;
      height: 13px;
      color: #e0e0e0;
    }
    
    .stars mat-icon.filled {
      color: #8b6c50;
    }
    
    .rating-text {
      font-weight: 600;
      color: #2d2416;
      font-size: 0.85rem;
    }
    
    /* Hotel Content */
    .hotel-content {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    
    .hotel-name {
      font-family: 'Playfair Display', serif;
      font-size: 1.4rem;
      font-weight: 700;
      color: #2d2416;
      margin: 0 0 0.75rem 0;
      line-height: 1.3;
    }
    
    .hotel-location {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #6d5d4b;
      margin-bottom: 1rem;
      font-size: 0.875rem;
    }
    
    .hotel-location mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #8b6c50;
    }
    
    .hotel-description {
      font-size: 0.875rem;
      color: #6d5d4b;
      line-height: 1.6;
      margin-bottom: 1rem;
      flex: 1;
    }
    
    .hotel-features {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 1rem;
    }
    
    .feature-tag {
      display: flex;
      align-items: center;
      gap: 4px;
      background: rgba(139, 108, 80, 0.08);
      padding: 6px 12px;
      border-radius: 16px;
      font-size: 0.75rem;
      font-weight: 500;
      color: #2d2416;
    }
    
    .feature-tag mat-icon {
      font-size: 13px;
      width: 13px;
      height: 13px;
      color: #8b6c50;
    }
    
    .hotel-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      border-top: 1px solid rgba(139, 108, 80, 0.1);
      margin-bottom: 1rem;
    }
    
    .price-section {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    
    .price-label {
      font-size: 0.7rem;
      color: #6d5d4b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .price-value {
      font-size: 1.6rem;
      font-weight: 700;
      color: #8b6c50;
      line-height: 1;
    }
    
    .price-unit {
      font-size: 0.75rem;
      color: #6d5d4b;
    }
    
    .rooms-info {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 0.875rem;
      color: #6d5d4b;
    }
    
    .rooms-info mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #8b6c50;
    }
    
    .view-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      height: 44px !important;
      border-radius: 12px !important;
      font-weight: 600 !important;
      background: linear-gradient(135deg, #8b6c50 0%, #6d5d4b 100%) !important;
      color: white !important;
      box-shadow: 0 4px 16px rgba(139, 108, 80, 0.3) !important;
      transition: all 0.3s !important;
    }
    
    .view-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(139, 108, 80, 0.4) !important;
    }
    
    .view-btn mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    
    .search-hotels-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 0 1.5rem !important;
      height: 44px !important;
      border-radius: 12px !important;
      font-weight: 600 !important;
      background: linear-gradient(135deg, #8b6c50 0%, #6d5d4b 100%) !important;
      color: white !important;
      box-shadow: 0 4px 16px rgba(139, 108, 80, 0.3) !important;
    }

    /* ============================================
       MOROCCAN GASTRONOMY JOURNEY
       ============================================ */
    .gastronomy-section {
      background: linear-gradient(135deg, #0f3460 0%, var(--navy-primary) 100%);
      position: relative;
      padding: 5rem 0;
      overflow: hidden;
    }
    
    .gastronomy-section::before {
      content: '';
      position: absolute;
      inset: 0;
      background: 
        repeating-linear-gradient(60deg, transparent, transparent 30px, rgba(212, 175, 55, 0.02) 30px, rgba(212, 175, 55, 0.02) 60px),
        repeating-linear-gradient(-60deg, transparent, transparent 30px, rgba(166, 75, 42, 0.015) 30px, rgba(166, 75, 42, 0.015) 60px);
      opacity: 0.6;
    }
    
    .gastronomy-header {
      text-align: center;
      color: white;
      margin-bottom: 3rem;
      position: relative;
      z-index: 1;
    }
    
    .gastronomy-header .section-title,
    .gastronomy-header .section-subtitle {
      color: white;
    }
    
    .gastronomy-header .section-subtitle {
      opacity: 0.9;
    }
    
    .gastronomy-timeline {
      display: flex;
      gap: 2rem;
      overflow-x: auto;
      overflow-y: hidden;
      padding: 2rem;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: thin;
      scrollbar-color: var(--gold-accent) rgba(255, 255, 255, 0.1);
      position: relative;
      z-index: 1;
    }
    
    .gastronomy-timeline::-webkit-scrollbar {
      height: 8px;
    }
    
    .gastronomy-timeline::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }
    
    .gastronomy-timeline::-webkit-scrollbar-thumb {
      background: var(--gold-accent);
      border-radius: 4px;
    }
    
    .gastronomy-item {
      flex: 0 0 300px;
    }
    
    .gastronomy-card {
      background: white;
      border-radius: 20px;
      overflow: hidden;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      height: 100%;
      display: flex;
      flex-direction: column;
      position: relative;
    }
    
    .gastronomy-card:hover {
      transform: translateY(-10px) scale(1.02);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }
    
    .gastronomy-image {
      height: 200px;
      background-size: cover;
      background-position: center;
      position: relative;
    }
    
    .gastronomy-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to bottom,
        transparent 0%,
        rgba(10, 25, 47, 0.3) 70%,
        rgba(10, 25, 47, 0.8) 100%
      );
    }
    
    .gastronomy-icon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 60px;
      height: 60px;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      transition: all 0.4s;
    }
    
    .gastronomy-card:hover .gastronomy-icon {
      transform: translate(-50%, -50%) scale(1.15) rotate(360deg);
    }
    
    .gastronomy-icon mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: var(--gold-accent);
    }
    
    .gastronomy-content {
      padding: 1.5rem;
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    
    .dish-name {
      font-family: 'Playfair Display', serif;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--navy-primary);
      margin: 0 0 0.5rem 0;
    }
    
    .dish-origin {
      color: var(--gold-accent);
      font-weight: 600;
      font-size: 0.9rem;
      margin: 0 0 1rem 0;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .dish-origin::before {
      content: '📍';
      font-size: 1rem;
    }
    
    .dish-description {
      color: var(--text-secondary);
      line-height: 1.6;
      margin: 0 0 1.5rem 0;
      flex: 1;
    }
    
    .food-tour-btn {
      width: 100%;
      border-color: var(--gold-accent) !important;
      color: var(--gold-accent) !important;
      font-weight: 600 !important;
      transition: all 0.3s !important;
    }
    
    .food-tour-btn:hover {
      background: var(--gold-accent) !important;
      color: var(--navy-primary) !important;
      transform: translateY(-2px);
    }

    /* ============================================
       MOROCCAN EXCELLENCE - FEATURES ENHANCED
       ============================================ */
    .moroccan-excellence {
      position: relative;
      background: linear-gradient(135deg, #f8fafc 0%, white 100%);
    }
    
    .moroccan-pattern-bg {
      position: absolute;
      inset: 0;
      background: 
        repeating-linear-gradient(45deg, transparent, transparent 60px, rgba(212, 175, 55, 0.02) 60px, rgba(212, 175, 55, 0.02) 120px),
        repeating-linear-gradient(-45deg, transparent, transparent 60px, rgba(166, 75, 42, 0.015) 60px, rgba(166, 75, 42, 0.015) 120px);
      opacity: 0.5;
      pointer-events: none;
    }
    
    .excellence-header {
      text-align: center;
      margin-bottom: 3rem;
      position: relative;
      z-index: 1;
    }
    
    .features-grid-premium {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      position: relative;
      z-index: 1;
    }
    
    .feature-card-premium {
      padding: 2rem !important;
      border-radius: 20px !important;
      border: 2px solid transparent !important;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
      background: white !important;
      position: relative;
      overflow: hidden;
    }
    
    .feature-card-premium::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, var(--gold-accent) 0%, #f4d03f 100%);
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .feature-card-premium:hover::before {
      transform: scaleX(1);
    }
    
    .feature-card-premium:hover {
      transform: translateY(-10px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12) !important;
      border-color: var(--gold-accent) !important;
    }
    
    .feature-card-premium.feature-card-highlight {
      grid-column: 1 / -1;
      background: linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, white 100%) !important;
      border-color: var(--gold-accent) !important;
    }
    
    .feature-icon-wrapper-premium {
      width: 80px;
      height: 80px;
      margin: 0 auto 1.5rem;
      background: linear-gradient(135deg, var(--gold-accent) 0%, #f4d03f 100%);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 8px 20px rgba(212, 175, 55, 0.3);
    }
    
    .feature-card-premium:hover .feature-icon-wrapper-premium {
      transform: scale(1.1) rotate(5deg);
      box-shadow: 0 12px 28px rgba(212, 175, 55, 0.4);
    }
    
    .feature-card-premium h3 {
      font-family: 'Playfair Display', serif;
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--navy-primary);
      margin-bottom: 1rem;
      text-align: center;
    }
    
    .feature-card-premium p {
      text-align: center;
      color: var(--text-secondary);
      line-height: 1.7;
      margin-bottom: 1.5rem;
    }
    
    .traveler-quote {
      background: rgba(212, 175, 55, 0.08);
      padding: 1rem;
      border-radius: 12px;
      border-left: 3px solid var(--gold-accent);
      margin-top: 1rem;
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .feature-card-premium:hover .traveler-quote {
      opacity: 1;
      transform: translateY(0);
    }
    
    .traveler-quote mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: var(--gold-accent);
      vertical-align: text-top;
    }
    
    .traveler-quote p {
      margin: 0;
      font-size: 0.9rem;
      font-style: italic;
      color: var(--navy-primary);
      text-align: left;
    }

    /* ============================================
       MOROCCAN STORIES - REVIEWS ENHANCED
       ============================================ */
    .moroccan-stories {
      background: linear-gradient(135deg, #0a192f 0%, #0f3460 100%);
      position: relative;
    }
    
    .moroccan-stories::before {
      content: '';
      position: absolute;
      inset: 0;
      background: 
        repeating-linear-gradient(30deg, transparent, transparent 40px, rgba(212, 175, 55, 0.03) 40px, rgba(212, 175, 55, 0.03) 80px);
      opacity: 0.4;
    }
    
    .stories-header {
      text-align: center;
      color: white;
      margin-bottom: 3rem;
      position: relative;
      z-index: 1;
    }
    
    .stories-header .section-title,
    .stories-header .section-subtitle {
      color: white;
    }
    
    .reviews-grid-premium {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
      gap: 2rem;
      position: relative;
      z-index: 1;
    }
    
    .review-card-premium {
      padding: 2rem !important;
      border-radius: 20px !important;
      background: white !important;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
      position: relative;
      overflow: hidden;
      border: 2px solid transparent !important;
    }
    
    .review-moroccan-pattern {
      position: absolute;
      top: 0;
      right: 0;
      width: 100px;
      height: 100px;
      background: 
        repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(212, 175, 55, 0.05) 10px, rgba(212, 175, 55, 0.05) 20px);
      opacity: 0.5;
      pointer-events: none;
    }
    
    .review-card-premium:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3) !important;
      border-color: var(--gold-accent) !important;
    }
    
    .review-header-premium {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
      position: relative;
      z-index: 1;
    }
    
    .review-avatar-premium {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--gold-accent) 0%, #f4d03f 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.2rem;
      color: var(--navy-primary);
      box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
    }
    
    .review-author-info-premium {
      flex: 1;
    }
    
    .review-author-premium {
      font-weight: 700;
      color: var(--navy-primary);
      margin: 0 0 0.5rem 0;
      font-size: 1.1rem;
    }
    
    .review-rating-premium {
      display: flex;
      gap: 2px;
    }
    
    .star-icon-premium {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: var(--gold-accent);
    }
    
    .review-text-premium {
      color: var(--text-secondary);
      line-height: 1.7;
      margin-bottom: 1.5rem;
      font-size: 0.95rem;
      position: relative;
      z-index: 1;
    }
    
    .review-footer-premium {
      display: flex;
      align-items: center;
      gap: 8px;
      padding-top: 1rem;
      border-top: 1px solid rgba(0, 0, 0, 0.1);
      position: relative;
      z-index: 1;
    }
    
    .verified-icon-premium {
      color: #00c896;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    
    .verified-text-premium {
      color: var(--text-secondary);
      font-size: 0.9rem;
      font-weight: 500;
    }
    
    .review-destination-badge {
      position: absolute;
      bottom: 1rem;
      right: 1rem;
      display: flex;
      align-items: center;
      gap: 4px;
      background: rgba(212, 175, 55, 0.1);
      color: var(--gold-accent);
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      z-index: 1;
    }
    
    .review-destination-badge mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
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
      
      /* Moroccan Heritage Mosaic - Mobile */
      .destinations-mosaic-grid {
        grid-template-columns: 1fr;
      }
      
      .destination-mosaic-card.morocco-large {
        grid-column: span 1;
        grid-row: span 1;
      }
      
      .mosaic-city-name {
        font-size: 1.75rem;
      }
      
      /* Timeline - Mobile */
      .timeline-chapter {
        flex: 0 0 280px;
      }
      
      .timeline-chapter.special-chapter {
        flex: 0 0 300px;
      }
      
      /* Flights Navigator - Mobile */
      .flights-premium-grid {
        grid-template-columns: 1fr;
      }
      
      .morocco-map-background {
        width: 300px;
        height: 400px;
      }
      
      .flight-route-visual {
        flex-direction: column;
        gap: 1rem;
      }
      
      .flight-path-line {
        width: 2px;
        height: 60px;
        margin: 0;
      }
      
      .animated-plane mat-icon {
        transform: rotate(180deg);
      }
      
      @keyframes flyPlane {
        0%, 100% { transform: translateY(-20px); }
        50% { transform: translateY(20px); }
      }
      
      /* Hotels Collection - Mobile */
      .hotel-collection-card {
        flex: 0 0 300px;
      }
      
      /* Gastronomy - Mobile */
      .gastronomy-item {
        flex: 0 0 280px;
      }
      
      /* Features Grid - Mobile */
      .features-grid-premium {
        grid-template-columns: 1fr;
      }
      
      .feature-card-premium.feature-card-highlight {
        grid-column: 1;
      }
      
      /* Reviews - Mobile */
      .reviews-grid-premium {
        grid-template-columns: 1fr;
      }
    }
    
    /* ============================================
       NEW PREMIUM SECTIONS - COMMERCIAL DESIGN
       ============================================ */
    
    /* Section Header Premium */
    .section-header-premium {
      text-align: center;
      margin-bottom: 56px;
      padding-top: 80px;
    }
    
    .section-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: linear-gradient(135deg, #8b6c50 0%, #6d5d4b 100%);
      color: white;
      padding: 8px 20px;
      border-radius: 24px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(139, 108, 80, 0.2);
    }
    
    .section-badge mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    
    .section-header-premium .section-title {
      font-family: 'Playfair Display', serif;
      font-size: 2.75rem;
      font-weight: 700;
      color: #2d2416;
      margin: 0 0 16px 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      line-height: 1.2;
    }
    
    .section-header-premium .section-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #8b6c50;
    }
    
    .section-header-premium .section-subtitle {
      font-size: 1.125rem;
      color: #6d5d4b;
      margin: 0;
      font-weight: 400;
      opacity: 0.9;
      max-width: 700px;
      margin: 0 auto;
      line-height: 1.6;
    }
    
    /* Morocco Highlights Premium */
    .morocco-highlights-premium {
      padding: 0 0 80px;
      background: linear-gradient(180deg, #fdfcfb 0%, #f5f2ed 100%);
    }
    
    .highlights-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 24px;
    }
    
    .highlights-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      height: 280px;
    }
    
    .highlight-card {
      position: relative;
      border-radius: 16px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .highlight-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    }
    
    .card-bg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
      transition: transform 0.5s ease;
    }
    
    .highlight-card:hover .card-bg {
      transform: scale(1.05);
    }
    
    .card-overlay-gradient {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.7) 100%);
    }
    
    .card-content-premium {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 24px;
      color: white;
      z-index: 2;
    }
    
    .card-category {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 12px;
      opacity: 0.9;
    }
    
    .card-category mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    
    .card-category span {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .card-title-premium {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0 0 8px 0;
      line-height: 1.2;
    }
    
    .card-desc-premium {
      font-size: 0.875rem;
      opacity: 0.9;
      margin: 0;
      line-height: 1.4;
    }
    
    /* Destinations Gallery Premium */
    .destinations-gallery-premium {
      padding: 0 0 80px;
      background: #f8f6f3;
    }
    
    .gallery-container {
      max-width: 1600px;
      margin: 0 auto;
      padding: 0 24px;
    }
    
    .destinations-scroll-wrapper {
      overflow: hidden;
      position: relative;
      padding: 20px 0;
    }
    
    .destinations-horizontal-scroll {
      display: flex;
      gap: 16px;
      animation: scroll-destinations 80s linear infinite;
      width: fit-content;
    }
    
    .destinations-scroll-wrapper:hover .destinations-horizontal-scroll {
      animation-play-state: paused;
    }
    
    @keyframes scroll-destinations {
      0% {
        transform: translateX(0);
      }
      100% {
        transform: translateX(calc(-336px * 8)); /* -(320px width + 16px gap) * 8 tiles */
      }
    }
    
    .destination-tile {
      flex: 0 0 320px;
      height: 240px;
      cursor: pointer;
    }
    
    .tile-image {
      position: relative;
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
      border-radius: 12px;
      overflow: hidden;
      transition: transform 0.3s ease;
    }
    
    .destination-tile:hover .tile-image {
      transform: scale(1.02);
    }
    
    .tile-placeholder {
      width: 100%;
      height: 100%;
      background: #e8e4df;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .tile-placeholder mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #8b6c50;
      opacity: 0.3;
    }
    
    .tile-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.75) 100%);
    }
    
    .tile-content {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 20px;
      color: white;
      z-index: 2;
    }
    
    .tile-name {
      font-size: 1.25rem;
      font-weight: 700;
      margin: 0 0 4px 0;
      color: white;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5), 0 1px 3px rgba(0, 0, 0, 0.3);
    }
    
    .tile-country {
      font-size: 0.875rem;
      color: white;
      opacity: 0.9;
      margin: 0;
      text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.3);
    }
    
    .tile-badge {
      position: absolute;
      top: 16px;
      right: 16px;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .tile-badge mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #8b6c50;
    }
    
    /* Seasonal Experiences Premium */
    .seasonal-experiences-premium {
      padding: 0 0 80px;
      background: linear-gradient(180deg, #f8f6f3 0%, #fdfcfb 100%);
    }
    
    .experiences-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 24px;
    }
    
    .experiences-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
    }
    
    .experience-card {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
    }
    
    .experience-card:hover {
      box-shadow: 0 8px 24px rgba(139, 108, 80, 0.12);
      transform: translateY(-4px);
    }
    
    .experience-image {
      position: relative;
      height: 220px;
      background-size: cover;
      background-position: center;
    }
    
    .experience-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%);
    }
    
    .experience-season-badge {
      position: absolute;
      top: 16px;
      left: 16px;
      background: rgba(255, 255, 255, 0.95);
      color: #8b6c50;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      z-index: 2;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
    
    .experience-growth-badge {
      position: absolute;
      top: 16px;
      right: 16px;
      background: rgba(45, 186, 130, 0.95);
      color: white;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 4px;
      z-index: 2;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
    
    .experience-growth-badge mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }
    
    .experience-details {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      flex: 1;
    }
    
    .experience-header {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .experience-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #2d2416;
      margin: 0;
      font-family: 'Playfair Display', serif;
    }
    
    .experience-country {
      font-size: 0.875rem;
      color: #6d5d4b;
      opacity: 0.8;
    }
    
    .experience-info {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .experience-highlight {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #6d5d4b;
      font-size: 0.875rem;
    }
    
    .experience-highlight mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #8b6c50;
    }
    
    .experience-badge {
      display: inline-block;
      padding: 6px 12px;
      background: rgba(139, 108, 80, 0.1);
      color: #8b6c50;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      width: fit-content;
    }
    
    .experience-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: auto;
      padding-top: 16px;
      border-top: 1px solid rgba(139, 108, 80, 0.1);
    }
    
    .experience-price {
      font-size: 1rem;
      font-weight: 600;
      color: #2d2416;
    }
    
    .explore-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 0 20px !important;
      height: 40px;
      font-size: 0.875rem !important;
      font-weight: 600 !important;
      border-radius: 8px;
      background: linear-gradient(135deg, #8b6c50 0%, #6d5d4b 100%) !important;
      color: white !important;
      box-shadow: 0 2px 8px rgba(139, 108, 80, 0.2);
      transition: all 0.25s ease;
    }
    
    .explore-btn:hover {
      box-shadow: 0 4px 12px rgba(139, 108, 80, 0.3);
      transform: translateY(-1px);
    }
    
    .explore-btn mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    
    /* Special World Cup Card */
    .special-worldcup .experience-image {
      background: linear-gradient(135deg, #1a4d7a 0%, #0f3554 100%);
      position: relative;
    }
    
    .worldcup-image::before {
      content: '';
      position: absolute;
      inset: 0;
      background: url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');
      z-index: 1;
    }
    
    .worldcup-badge {
      background: linear-gradient(135deg, #c1665a 0%, #a34e43 100%) !important;
      color: white !important;
    }
    
    .worldcup-icon-animated {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 2;
    }
    
    .worldcup-icon-animated mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: rgba(255, 255, 255, 0.9);
      animation: worldcup-pulse 2s ease-in-out infinite;
      filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
    }
    
    @keyframes worldcup-pulse {
      0%, 100% { 
        transform: scale(1);
        opacity: 0.9;
      }
      50% { 
        transform: scale(1.1);
        opacity: 1;
      }
    }
    
    .special-badge {
      background: linear-gradient(135deg, #c1665a 0%, #a34e43 100%) !important;
      color: white !important;
    }
    
    /* Responsive Design for Experiences */
    @media (max-width: 1024px) {
      .experiences-grid {
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      }
    }
    
    @media (max-width: 640px) {
      .experiences-grid {
        grid-template-columns: 1fr;
      }
      
      .experience-image {
        height: 200px;
      }
    }
    
    /* Flights & Hotels Premium Split */
    .flights-hotels-premium-split {
      padding: 0;
      background: #ffffff;
    }
    
    .split-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      max-width: 1600px;
      margin: 0 auto;
      min-height: 600px;
    }
    
    .split-half {
      padding: 60px 48px;
    }
    
    .flights-half {
      background: linear-gradient(135deg, #f8f6f3 0%, #fdfcfb 100%);
      border-right: 1px solid rgba(139, 108, 80, 0.1);
    }
    
    .hotels-half {
      background: linear-gradient(135deg, #fefdfb 0%, #f5f2ed 100%);
    }
    
    .half-content {
      max-width: 600px;
      margin: 0 auto;
    }
    
    .half-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 32px;
    }
    
    .half-header mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #8b6c50;
    }
    
    .half-header h3 {
      font-size: 1.75rem;
      font-weight: 700;
      margin: 0;
      color: #2d2416;
    }
    
    .preview-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-bottom: 32px;
    }
    
    .preview-item {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
      transition: all 0.3s ease;
      cursor: pointer;
    }
    
    .preview-item:hover {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      transform: translateY(-2px);
    }
    
    .preview-item-visual {
      height: 140px;
      background-size: cover;
      background-position: center;
      position: relative;
    }
    
    .preview-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.3) 100%);
    }
    
    .preview-badge, .preview-rating {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(255, 255, 255, 0.95);
      padding: 6px 12px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #2d2416;
    }
    
    .preview-badge mat-icon, .preview-rating mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #8b6c50;
    }
    
    .preview-info {
      padding: 16px;
    }
    
    .preview-info h4 {
      font-size: 1.125rem;
      font-weight: 700;
      margin: 0 0 8px 0;
      color: #2d2416;
    }
    
    .preview-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.875rem;
      color: #6d5d4b;
      margin-bottom: 12px;
    }
    
    .preview-meta mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    
    .preview-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .preview-price {
      font-size: 1.25rem;
      font-weight: 700;
      color: #8b6c50;
    }
    
    .preview-action {
      color: #8b6c50;
    }
    
    .see-all-btn {
      width: 100%;
      height: 48px;
      border: 2px solid #8b6c50;
      color: #8b6c50;
      font-weight: 600;
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.3s ease;
    }
    
    .see-all-btn:hover {
      background: #8b6c50;
      color: white;
    }
    
    .loading-inline, .empty-inline {
      text-align: center;
      padding: 40px 20px;
      color: #6d5d4b;
    }
    
    .loading-inline mat-spinner, .empty-inline mat-icon {
      margin: 0 auto 16px;
    }
    
    .empty-inline mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      opacity: 0.3;
    }
    
    .empty-simple {
      text-align: center;
      padding: 40px 20px;
      color: #6d5d4b;
    }
    
    .empty-simple mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      opacity: 0.3;
      margin-bottom: 12px;
    }
    
    /* Responsive for new sections */
    @media (max-width: 1024px) {
      .highlights-grid {
        grid-template-columns: repeat(2, 1fr);
        height: auto;
      }
      
      .highlight-card {
        height: 240px;
      }
      
      .split-container {
        grid-template-columns: 1fr;
      }
      
      .flights-half {
        border-right: none;
        border-bottom: 1px solid rgba(139, 108, 80, 0.1);
      }
    }
    
    @media (max-width: 640px) {
      .highlights-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
      
      .highlight-card {
        height: 200px;
      }
      
      .destination-tile {
        flex: 0 0 280px;
        height: 200px;
      }
      
      .split-half {
        padding: 40px 24px;
      }
      
      .half-header h3 {
        font-size: 1.5rem;
      }
      
      .preview-item-visual {
        height: 120px;
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
      price: '$299',
      month: 'Janvier',
      icon: 'mosque'
    },
    { 
      city: 'Dubai', 
      country: 'UAE', 
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=400&fit=crop',
      badge: 'POPULAR',
      growth: '+38%',
      price: '$599',
      month: 'Février',
      icon: 'apartment'
    },
    { 
      city: 'Paris', 
      country: 'France', 
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=400&fit=crop',
      badge: 'TRENDING',
      growth: '+32%',
      price: '$499',
      month: 'Mars',
      icon: 'museum'
    },
    { 
      city: 'Tokyo', 
      country: 'Japan', 
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop',
      badge: 'NEW',
      growth: '+29%',
      price: '$799',
      month: 'Avril',
      icon: 'temple_buddhist'
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
  
  // Helper functions for Moroccan Heritage Redesign
  getMoroccanPoetry(dest: Destination): string {
    const poetryMap: { [key: string]: string } = {
      'Casablanca': 'La Perle de l\'Atlantique',
      'Marrakech': 'La Perle du Sud - Ville Impériale',
      'Rabat': 'Capitale Lumière et Modernité',
      'Fes': 'Capitale Spirituelle - Cité Millénaire',
      'Tangier': 'Porte de l\'Afrique sur la Méditerranée',
      'Agadir': 'Perle du Souss - Plage et Soleil',
      'Chefchaouen': 'La Perle Bleue du Rif',
      'Essaouira': 'Cité des Alizés - Charme Atlantique',
      'Meknes': 'Cité Impériale - Héritage Ismaïlien'
    };
    const cityName = dest.city || dest.name;
    return poetryMap[cityName] || 'Joyau du Royaume Chérifien';
  }
  
  getExperienceIcon(city: string): string {
    const iconMap: { [key: string]: string } = {
      'Marrakech': 'mosque',
      'Dubai': 'apartment',
      'Paris': 'museum',
      'Tokyo': 'temple_buddhist',
      'Casablanca': 'account_balance',
      'Fes': 'auto_stories',
      'Rabat': 'monument',
      'Tangier': 'sailing',
      'Agadir': 'beach_access'
    };
    return iconMap[city] || 'explore';
  }
  
  getExperienceText(city: string): string {
    const textMap: { [key: string]: string } = {
      'Marrakech': 'Medina & Souks Experience',
      'Dubai': 'Modern Luxury',
      'Paris': 'Art & Culture',
      'Tokyo': 'Zen & Technology',
      'Casablanca': 'Hassan II Mosque',
      'Fes': 'Medieval Medina',
      'Rabat': 'Royal Heritage',
      'Tangier': 'Mediterranean Gateway',
      'Agadir': 'Beach Paradise'
    };
    return textMap[city] || 'Cultural Discovery';
  }
  
  isDirectFlight(flight: any): boolean {
    // Check if flight has direct route indicator or no stops
    return !flight.stops || flight.stops === 0 || flight.duration?.includes('direct');
  }
  
  getFlightOrigin(departure: any): string {
    // Extract airport code from departure time string or return default
    if (typeof departure === 'string' && departure.length === 3) {
      return departure;
    }
    return 'INT';
  }
  
  getFlightDestination(arrival: any): string {
    // Extract airport code from arrival time string or return Morocco code
    if (typeof arrival === 'string' && arrival.length === 3) {
      return arrival;
    }
    return 'CMN';
  }
  
  getHotelCategory(hotel: Hotel): string {
    const name = hotel.name.toLowerCase();
    if (name.includes('riad') || name.includes('dar')) {
      return 'riad';
    } else if (name.includes('palace') || name.includes('royal') || hotel.rating && hotel.rating >= 4.5) {
      return 'palace';
    } else if (name.includes('eco') || name.includes('desert') || name.includes('kasbah')) {
      return 'ecolodge';
    }
    return 'hotel';
  }
  
  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'riad': 'water_drop',
      'palace': 'castle',
      'ecolodge': 'nature',
      'hotel': 'hotel'
    };
    return icons[category] || 'hotel';
  }
  
  getCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      'riad': 'Riad Traditionnel',
      'palace': 'Palais Royal',
      'ecolodge': 'Éco-Lodge Désert',
      'hotel': 'Hôtel Premium'
    };
    return labels[category] || 'Premium Hotel';
  }
}
