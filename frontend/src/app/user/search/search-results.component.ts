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
        <div *ngFor="let result of results" class="flight-card-premium">
          <!-- Card Header with Airline & Price -->
          <div class="flight-header">
            <div class="airline-section">
              <div class="airline-logo">
                <mat-icon>airlines</mat-icon>
              </div>
              <div class="airline-details">
                <h3 class="airline-name">{{ result.airline || 'Premium Airlines' }}</h3>
                <span class="flight-number">{{ result.flightNumber || 'Direct Flight' }}</span>
              </div>
            </div>
            <div class="price-section">
              <div class="price-tag">
                <span class="price-currency">$</span>
                <span class="price-amount">{{ result.price }}</span>
              </div>
              <span class="price-label">per person</span>
            </div>
          </div>

          <!-- Flight Route Timeline -->
          <div class="flight-timeline">
            <div class="timeline-point departure">
              <div class="timeline-icon-wrapper">
                <mat-icon>flight_takeoff</mat-icon>
              </div>
              <div class="timeline-info">
                <span class="timeline-label">Departure</span>
                <span class="timeline-time">{{ result.departure | date: 'h:mm a' }}</span>
                <span class="timeline-date">{{ result.departure | date: 'MMM d, y' }}</span>
                <span class="timeline-location">{{ result.origin || 'N/A' }}</span>
              </div>
            </div>

            <div class="timeline-connector">
              <div class="connector-line"></div>
              <div class="connector-duration">
                <mat-icon>schedule</mat-icon>
                <span>Direct</span>
              </div>
              <div class="connector-line"></div>
            </div>

            <div class="timeline-point arrival">
              <div class="timeline-icon-wrapper">
                <mat-icon>flight_land</mat-icon>
              </div>
              <div class="timeline-info">
                <span class="timeline-label">Arrival</span>
                <span class="timeline-time">{{ result.arrival | date: 'h:mm a' }}</span>
                <span class="timeline-date">{{ result.arrival | date: 'MMM d, y' }}</span>
                <span class="timeline-location">{{ result.destination || 'N/A' }}</span>
              </div>
            </div>
          </div>

          <!-- Flight Features -->
          <div class="flight-features">
            <div class="feature-item">
              <mat-icon>event_seat</mat-icon>
              <span>{{ result.availableSeats || 0 }} seats left</span>
            </div>
            <div class="feature-item">
              <mat-icon>luggage</mat-icon>
              <span>Baggage included</span>
            </div>
            <div class="feature-item">
              <mat-icon>dining</mat-icon>
              <span>Meal service</span>
            </div>
            <div class="feature-item">
              <mat-icon>check_circle</mat-icon>
              <span>Free cancellation</span>
            </div>
          </div>

          <!-- Book Button -->
          <button class="book-flight-btn" (click)="onBook(result)">
            <span>Select & Continue</span>
            <mat-icon>arrow_forward</mat-icon>
          </button>
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
      gap: 14px;
      padding: 0 2rem;
    }

    /* ============================================
       PREMIUM FLIGHT CARDS
       ============================================ */
    .flight-card-premium {
      background: linear-gradient(to bottom, #ffffff 0%, #fefefe 100%);
      border-radius: 14px;
      overflow: hidden;
      position: relative;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid rgba(139, 108, 80, 0.12);
      box-shadow: 
        0 2px 12px rgba(0, 0, 0, 0.05),
        0 1px 3px rgba(0, 0, 0, 0.03);
    }

    .flight-card-premium:hover {
      transform: translateY(-4px);
      box-shadow: 
        0 8px 24px rgba(139, 108, 80, 0.18),
        0 4px 12px rgba(139, 108, 80, 0.1);
      border-color: rgba(139, 108, 80, 0.25);
    }

    /* Card Header */
    .flight-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background: linear-gradient(to right, #fafafa 0%, #f8f8f8 100%);
      border-bottom: 1px solid rgba(139, 108, 80, 0.08);
    }

    .airline-section {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .airline-logo {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #8b6c50 0%, #6d5d4b 100%);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 
        0 3px 8px rgba(139, 108, 80, 0.25),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;
    }

    .flight-card-premium:hover .airline-logo {
      transform: scale(1.08);
      box-shadow: 
        0 4px 12px rgba(139, 108, 80, 0.35),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }

    .airline-logo mat-icon {
      color: white;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .airline-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .airline-name {
      font-size: 0.95rem;
      font-weight: 700;
      color: #2d2416;
      margin: 0;
      letter-spacing: -0.01em;
    }

    .flight-number {
      font-size: 0.72rem;
      color: #8b6c50;
      font-weight: 600;
      padding: 3px 8px;
      background: linear-gradient(135deg, rgba(139, 108, 80, 0.08) 0%, rgba(196, 165, 116, 0.12) 100%);
      border-radius: 5px;
      display: inline-block;
      width: fit-content;
      border: 1px solid rgba(139, 108, 80, 0.1);
    }

    .price-section {
      text-align: right;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 3px;
    }

    .price-tag {
      display: flex;
      align-items: flex-start;
      line-height: 1;
      padding: 8px 14px;
      background: linear-gradient(135deg, rgba(139, 108, 80, 0.06) 0%, rgba(196, 165, 116, 0.1) 100%);
      border-radius: 10px;
      border: 1.5px solid rgba(196, 165, 116, 0.2);
      transition: all 0.3s ease;
    }

    .flight-card-premium:hover .price-tag {
      background: linear-gradient(135deg, rgba(139, 108, 80, 0.1) 0%, rgba(196, 165, 116, 0.15) 100%);
      border-color: rgba(196, 165, 116, 0.35);
      transform: scale(1.03);
    }

    .price-currency {
      font-size: 0.9rem;
      font-weight: 700;
      color: #a8845c;
      margin-top: 2px;
      margin-right: 2px;
    }

    .price-amount {
      font-size: 1.65rem;
      font-weight: 800;
      background: linear-gradient(135deg, #8b6c50 0%, #c4a574 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: -0.02em;
    }

    .price-label {
      font-size: 0.68rem;
      color: #6d5d4b;
      font-weight: 500;
    }

    /* Flight Timeline */
    .flight-timeline {
      padding: 18px 20px;
      display: flex;
      align-items: flex-start;
      gap: 10px;
      background: white;
      position: relative;
    }

    .flight-timeline::before {
      content: '';
      position: absolute;
      bottom: 0;
      left: 16px;
      right: 16px;
      height: 1px;
      background: rgba(139, 108, 80, 0.1);
    }

    .timeline-point {
      flex: 1 1 auto;
      min-width: 0;
      display: flex;
      gap: 10px;
    }

    .timeline-icon-wrapper {
      width: 38px;
      height: 38px;
      background: linear-gradient(135deg, rgba(139, 108, 80, 0.08) 0%, rgba(196, 165, 116, 0.12) 100%);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.3s ease;
      border: 1.5px solid rgba(196, 165, 116, 0.2);
      box-shadow: 0 2px 6px rgba(139, 108, 80, 0.08);
    }

    .flight-card-premium:hover .timeline-icon-wrapper {
      background: linear-gradient(135deg, #8b6c50 0%, #a8845c 100%);
      border-color: #c4a574;
      transform: scale(1.08);
      box-shadow: 0 4px 10px rgba(139, 108, 80, 0.25);
    }

    .timeline-icon-wrapper mat-icon {
      color: #8b6c50;
      font-size: 18px;
      width: 18px;
      height: 18px;
      transition: all 0.3s ease;
    }

    .flight-card-premium:hover .timeline-icon-wrapper mat-icon {
      color: white;
      transform: scale(1.1);
    }

    .timeline-info {
      display: flex;
      flex-direction: column;
      gap: 5px;
      min-width: 0;
      flex: 1;
    }

    .timeline-label {
      font-size: 0.68rem;
      color: #c4a574;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .timeline-time {
      font-size: 1.15rem;
      font-weight: 800;
      background: linear-gradient(135deg, #2d2416 0%, #6d5d4b 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: -0.02em;
      white-space: nowrap;
    }

    .timeline-date {
      font-size: 0.78rem;
      color: #6d5d4b;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }

    .timeline-location {
      font-size: 0.88rem;
      color: #2d2416;
      font-weight: 700;
      margin-top: 2px;
      padding: 3px 8px;
      background: linear-gradient(135deg, rgba(196, 165, 116, 0.1) 0%, rgba(139, 108, 80, 0.08) 100%);
      border-radius: 6px;
      display: inline-block;
      width: fit-content;
      max-width: 100%;
      border: 1px solid rgba(139, 108, 80, 0.08);
      white-space: normal;
      word-break: break-word;
    }

    .timeline-connector {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 80px;
      max-width: 90px;
      flex-shrink: 0;
    }

    .connector-line {
      flex: 1;
      height: 2px;
      background: rgba(139, 108, 80, 0.2);
      border-radius: 2px;
    }

    .connector-duration {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      color: #8b6c50;
      font-size: 0.7rem;
      font-weight: 700;
      white-space: nowrap;
      padding: 4px 8px;
      background: rgba(139, 108, 80, 0.06);
      border-radius: 6px;
      border: 1px solid rgba(139, 108, 80, 0.12);
    }

    .connector-duration mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
      color: #8b6c50;
    }

    /* Flight Features */
    .flight-features {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      padding: 14px 20px;
      background: linear-gradient(to bottom, #fafafa 0%, #f8f8f8 100%);
      border-top: 1px solid rgba(139, 108, 80, 0.08);
      border-bottom: 1px solid rgba(139, 108, 80, 0.08);
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #2d2416;
      font-weight: 600;
      font-size: 0.82rem;
      padding: 9px 12px;
      background: white;
      border-radius: 8px;
      border: 1px solid rgba(139, 108, 80, 0.1);
      transition: all 0.25s ease;
      position: relative;
      overflow: hidden;
    }

    .feature-item::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(196, 165, 116, 0.06) 0%, rgba(139, 108, 80, 0.04) 100%);
      opacity: 0;
      transition: opacity 0.25s ease;
    }

    .feature-item:hover {
      border-color: rgba(196, 165, 116, 0.25);
      box-shadow: 0 2px 8px rgba(139, 108, 80, 0.12);
      transform: translateX(2px);
    }

    .feature-item:hover::before {
      opacity: 1;
    }

    .feature-item mat-icon {
      color: #c4a574;
      font-size: 17px;
      width: 17px;
      height: 17px;
      flex-shrink: 0;
      position: relative;
      z-index: 1;
      transition: all 0.25s ease;
    }

    .feature-item:hover mat-icon {
      color: #8b6c50;
      transform: scale(1.1);
    }

    .feature-item span {
      position: relative;
      z-index: 1;
    }

    /* Book Button */
    .book-flight-btn {
      width: 100%;
      padding: 15px 20px;
      background: linear-gradient(135deg, #8b6c50 0%, #a8845c 50%, #6d5d4b 100%);
      color: white;
      border: none;
      font-size: 0.95rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      letter-spacing: 0.03em;
      text-transform: uppercase;
      position: relative;
      overflow: hidden;
      box-shadow: 
        0 4px 12px rgba(139, 108, 80, 0.25),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
    }

    .book-flight-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.6s ease;
    }

    .book-flight-btn:hover::before {
      left: 100%;
    }

    .book-flight-btn:hover {
      background: linear-gradient(135deg, #6d5d4b 0%, #8b6c50 50%, #5a4d3d 100%);
      box-shadow: 
        0 6px 20px rgba(139, 108, 80, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
      transform: translateY(-2px);
    }

    .book-flight-btn:active {
      transform: translateY(0);
      box-shadow: 
        0 2px 8px rgba(139, 108, 80, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
    }

    .book-flight-btn mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      transition: all 0.3s ease;
      position: relative;
      z-index: 1;
    }

    .book-flight-btn:hover mat-icon {
      transform: translateX(4px) scale(1.1);
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

      .flight-features {
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

      .flight-timeline {
        flex-direction: column;
        gap: 24px;
      }

      .timeline-connector {
        flex-direction: column;
        width: 100%;
        min-width: auto;
      }

      .connector-line {
        width: 2px;
        height: 40px;
      }

      .connector-duration {
        transform: rotate(0deg);
      }

      .flight-header {
        flex-direction: column;
        gap: 20px;
        text-align: center;
      }

      .airline-section {
        flex-direction: column;
      }

      .price-section {
        align-items: center;
      }

      .empty-state,
      .loading-container {
        padding: 60px 24px;
      }
    }

    @media (max-width: 480px) {
      .price-amount {
        font-size: 2.25rem;
      }

      .timeline-time {
        font-size: 1.25rem;
      }

      .flight-header,
      .flight-timeline,
      .flight-features,
      .book-flight-btn {
        padding-left: 20px;
        padding-right: 20px;
      }
    }
  `]
})
export class SearchResultsComponent {
  @Input() results: any[] = [];
  @Input() isLoading: boolean = false;

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
