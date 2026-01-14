import { Component, OnInit, Inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService, PaymentIntentResponse } from '../services/payment.service';
import { ReservationService } from '../services/reservation.service';
import { AuthService } from '../auth/auth.service';
import { Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatToolbarModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDialogModule
  ],
  template: `
    <div class="payment-page">
      <!-- Compact Progress Stepper -->
      <div class="progress-stepper">
        <div class="step completed">
          <div class="step-icon"><mat-icon>search</mat-icon></div>
          <span class="step-label">Search</span>
        </div>
        <div class="step-line completed"></div>
        <div class="step completed">
          <div class="step-icon"><mat-icon>check_circle</mat-icon></div>
          <span class="step-label">Select</span>
        </div>
        <div class="step-line active"></div>
        <div class="step active">
          <div class="step-icon"><mat-icon>confirmation_number</mat-icon></div>
          <span class="step-label">Confirm</span>
        </div>
        <div class="step-line"></div>
        <div class="step">
          <div class="step-icon"><mat-icon>done_all</mat-icon></div>
          <span class="step-label">Complete</span>
        </div>
      </div>

      <!-- Page Title -->
      <h1 class="page-title">
        <mat-icon>lock</mat-icon>
        Secure Payment
      </h1>

      <div class="payment-container">
        <!-- Loading State -->
        <div *ngIf="loading" class="loading-state">
          <mat-spinner diameter="60" color="primary"></mat-spinner>
          <h3>Preparing Payment...</h3>
          <p>Setting up secure payment...</p>
        </div>

        <!-- Payment Layout (2-column on desktop) -->
        <div *ngIf="!loading && reservation" class="payment-layout">
          <!-- Left Column: Payment Form -->
          <div class="payment-main">
            <mat-card class="payment-card">
              <div class="card-header">
                <mat-icon>credit_card</mat-icon>
                <h2>Payment Information</h2>
              </div>

              <div class="card-body">
                <div class="payment-section">
                  <h3 class="section-title">Card Details</h3>
                  <div #cardElement class="card-element"></div>
                  <div class="secure-badge">
                    <mat-icon>lock</mat-icon>
                    <span>Your payment is secured with 256-bit SSL encryption</span>
                  </div>
                </div>

                <div class="payment-actions">
                  <button mat-stroked-button class="cancel-btn" (click)="cancel()">
                    <mat-icon>arrow_back</mat-icon>
                    Back
                  </button>
                  <button mat-raised-button class="pay-btn"
                          [disabled]="processingPayment"
                          (click)="processPayment()">
                    <mat-icon *ngIf="!processingPayment">lock</mat-icon>
                    <mat-spinner *ngIf="processingPayment" diameter="20"></mat-spinner>
                    {{ processingPayment ? 'Processing...' : 'Pay Now' }}
                  </button>
                </div>
              </div>
            </mat-card>
          </div>

          <!-- Right Column: Booking Summary (sticky) -->
          <aside class="payment-sidebar">
            <mat-card class="summary-card">
              <div class="card-header">
                <mat-icon>receipt_long</mat-icon>
                <h2>Order Summary</h2>
              </div>

              <div class="card-body">
                <div class="summary-section">
                  <div class="summary-row">
                    <span class="label">Reservation ID</span>
                    <span class="value">#{{ reservation.id }}</span>
                  </div>
                  <div class="summary-row">
                    <span class="label">Type</span>
                    <span class="value">{{ getReservationTypeLabel() }}</span>
                  </div>
                </div>

                <div class="summary-divider"></div>

                <div class="summary-total">
                  <span class="total-label">Total Amount</span>
                  <span class="total-value">\${{ reservation.totalPrice | number:'1.2-2' }}</span>
                </div>
              </div>
            </mat-card>
          </aside>
        </div>

        <!-- Error State -->
        <div *ngIf="!loading && !reservation" class="error-state">
          <mat-icon class="error-icon">error</mat-icon>
          <h3>Payment Not Available</h3>
          <p>Unable to load payment information. Please try again.</p>
          <button mat-raised-button class="retry-btn" routerLink="/my-reservations">
            <mat-icon>list</mat-icon>
            View My Reservations
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* CSS Variables - Luxury Gold Palette */
    :host {
      --luxury-gold: #d4af37;
      --luxury-gold-light: #e8c96f;
      --luxury-gold-dark: #b8941f;
      --warm-charcoal: #2c2c2c;
      --warm-gray: #5a5a5a;
      --soft-gray: #8a8a8a;
      --whisper-gray: #c4c4c4;
      --ivory: #fafaf8;
      --cream: #f5f5f0;
      --white: #ffffff;
      --success-green: #7cb17a;
      --error-red: #c17b7b;
      --shadow-soft: 0 2px 12px rgba(212, 175, 55, 0.08);
      --shadow-medium: 0 4px 20px rgba(0, 0, 0, 0.06);
      --shadow-strong: 0 8px 32px rgba(0, 0, 0, 0.1);
      --radius-soft: 10px;
      --radius-card: 14px;
      --spacing-2: 8px;
      --spacing-3: 12px;
      --spacing-4: 16px;
      --spacing-5: 20px;
      --spacing-6: 24px;
      --spacing-8: 32px;
    }

    /* Page Container */
    .payment-page {
      min-height: 100vh;
      background: var(--ivory);
      padding: var(--spacing-6) var(--spacing-4) var(--spacing-8);
    }

    /* Elegant Progress Stepper */
    .progress-stepper {
      max-width: 900px;
      margin: 0 auto var(--spacing-6);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--white);
      padding: var(--spacing-4) var(--spacing-5);
      border-radius: var(--radius-card);
      box-shadow: var(--shadow-soft);
      border: 1px solid rgba(212, 175, 55, 0.15);
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }

    .step-icon {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: var(--cream);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      border: 2px solid var(--whisper-gray);
    }

    .step-icon mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--soft-gray);
      transition: color 0.3s;
    }

    .step.completed .step-icon {
      background: linear-gradient(135deg, var(--luxury-gold) 0%, var(--luxury-gold-light) 100%);
      border-color: var(--luxury-gold);
    }

    .step.completed .step-icon mat-icon {
      color: white;
    }

    .step.active .step-icon {
      background: linear-gradient(135deg, var(--luxury-gold) 0%, var(--luxury-gold-light) 100%);
      border-color: var(--luxury-gold);
      box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.15);
    }

    .step.active .step-icon mat-icon {
      color: white;
    }

    .step-label {
      font-size: 13px;
      font-weight: 500;
      color: var(--warm-gray);
      transition: color 0.3s ease;
      letter-spacing: 0.02em;
    }

    .step.completed .step-label,
    .step.active .step-label {
      color: var(--warm-charcoal);
      font-weight: 600;
    }

    .step-line {
      width: 60px;
      height: 2px;
      background: var(--whisper-gray);
      margin: 0 var(--spacing-3);
      border-radius: 2px;
      transition: background 0.3s;
    }

    .step-line.completed {
      background: var(--luxury-gold);
    }

    .step-line.active {
      background: linear-gradient(90deg, var(--luxury-gold) 0%, var(--luxury-gold-light) 100%);
    }

    /* Page Title (like Booking) */
    .page-title {
      max-width: 1200px;
      margin: 0 auto var(--spacing-6);
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      font-size: 28px;
      font-weight: 600;
      color: var(--warm-charcoal);
      letter-spacing: -0.02em;
      font-family: 'Poppins', sans-serif;
    }

    .page-title mat-icon {
      font-size: 30px;
      width: 30px;
      height: 30px;
      color: var(--luxury-gold);
    }

    /* Container */
    .payment-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0;
    }

    /* 2-Column Layout (like Booking) */
    .payment-layout {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 420px;
      gap: var(--spacing-6);
      align-items: start;
    }

    /* Main Payment Column */
    .payment-main {
      width: 100%;
    }

    /* Sidebar Summary (Sticky) */
    .payment-sidebar {
      position: sticky;
      top: 32px;
    }

    /* Card Base Styles */
    mat-card {
      border-radius: var(--radius-card);
      border: 1px solid rgba(212, 175, 55, 0.15);
      box-shadow: var(--shadow-soft);
      background: var(--white);
      transition: all 0.3s ease;
      overflow: hidden;
    }

    mat-card:hover {
      border-color: rgba(212, 175, 55, 0.25);
      box-shadow: var(--shadow-medium);
    }

    /* Card Header - Light with Gold Accent */
    .card-header {
      background: var(--cream);
      padding: var(--spacing-5) var(--spacing-6);
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      border-left: 4px solid var(--luxury-gold);
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    }

    .card-header mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: var(--luxury-gold);
    }

    .card-header h2 {
      margin: 0;
      font-family: 'Poppins', sans-serif;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--warm-charcoal);
      letter-spacing: -0.01em;
    }

    /* Card Body */
    .card-body {
      padding: var(--spacing-6);
      background: var(--white);
    }

    /* Payment Section */
    .payment-section {
      margin-bottom: var(--spacing-6);
    }

    .section-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--warm-charcoal);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0 0 var(--spacing-3) 0;
    }

    /* Stripe Card Element */
    .card-element {
      background: var(--white);
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      padding: 16px;
      min-height: 48px;
      transition: all 0.3s ease;
    }

    .card-element:hover {
      border-color: #bdbdbd;
    }

    .card-element:focus-within {
      border-color: var(--luxury-gold);
      box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.12);
    }

    /* Secure Badge */
    .secure-badge {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: var(--spacing-3) 0 0 0;
      padding: var(--spacing-3) var(--spacing-4);
      background: rgba(76, 175, 80, 0.05);
      border-left: 3px solid #4caf50;
      border-radius: var(--radius-soft);
      font-size: 0.875rem;
      color: #2e7d32;
    }

    .secure-badge mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #4caf50;
    }

    /* Payment Actions */
    .payment-actions {
      display: flex;
      gap: var(--spacing-3);
      justify-content: flex-end;
      margin-top: var(--spacing-6);
      padding-top: var(--spacing-5);
      border-top: 1px solid rgba(0, 0, 0, 0.06);
    }

    /* Cancel Button */
    .cancel-btn {
      min-width: 120px;
      height: 44px;
      font-size: 0.9375rem;
      font-weight: 600;
      text-transform: none;
      border: 2px solid #e0e0e0;
      color: var(--warm-charcoal);
      border-radius: var(--radius-soft);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-2);
      transition: all 0.3s ease;
    }

    .cancel-btn:hover:not(:disabled) {
      border-color: var(--warm-charcoal);
      background: rgba(0, 0, 0, 0.04);
    }

    .cancel-btn mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    /* Pay Button - Charcoal with Gold Accent */
    .pay-btn {
      min-width: 180px;
      height: 44px;
      font-size: 0.9375rem;
      font-weight: 700;
      text-transform: none;
      background: var(--warm-charcoal);
      color: var(--white);
      border: 2px solid var(--luxury-gold);
      border-radius: var(--radius-soft);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      transition: all 0.3s ease;
    }

    .pay-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, var(--luxury-gold) 0%, var(--luxury-gold-light) 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
    }

    .pay-btn:active:not(:disabled) {
      transform: translateY(0);
    }

    .pay-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }

    .pay-btn mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    /* Summary Card */
    .summary-card .card-body {
      padding: var(--spacing-5);
    }

    /* Summary Section */
    .summary-section {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: var(--spacing-5);
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
    }

    .summary-row .label {
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--warm-gray);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .summary-row .value {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--warm-charcoal);
    }

    /* Summary Divider */
    .summary-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.1), transparent);
      margin: var(--spacing-4) 0;
    }

    /* Summary Total */
    .summary-total {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-4);
      background: var(--white);
      border-radius: var(--radius-soft);
      border: 2px solid var(--luxury-gold);
      border-left-width: 4px;
    }

    .total-label {
      font-size: 1rem;
      font-weight: 600;
      color: var(--warm-charcoal);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .total-value {
      font-family: 'Poppins', sans-serif;
      font-size: 1.625rem;
      font-weight: 700;
      color: var(--luxury-gold);
      letter-spacing: -0.02em;
    }

    /* Loading State */
    .loading-state {
      max-width: 600px;
      margin: 0 auto;
      text-align: center;
      padding: var(--spacing-8);
      background: var(--white);
      border-radius: var(--radius-card);
      border: 1px solid rgba(212, 175, 55, 0.15);
      box-shadow: var(--shadow-soft);
    }

    .loading-state h3 {
      font-family: 'Poppins', sans-serif;
      font-size: 20px;
      font-weight: 600;
      color: var(--warm-charcoal);
      margin: var(--spacing-6) 0 var(--spacing-2) 0;
    }

    .loading-state p {
      font-size: 14px;
      color: var(--warm-gray);
      margin: 0;
    }

    /* Error State */
    .error-state {
      max-width: 600px;
      margin: 0 auto;
      text-align: center;
      padding: var(--spacing-8);
      background: var(--white);
      border-radius: var(--radius-card);
      border: 1px solid rgba(212, 175, 55, 0.15);
      box-shadow: var(--shadow-soft);
    }

    .error-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #f44336;
    }

    .error-state h3 {
      font-family: 'Poppins', sans-serif;
      font-size: 22px;
      font-weight: 600;
      color: var(--warm-charcoal);
      margin: var(--spacing-6) 0 var(--spacing-3) 0;
    }

    .error-state p {
      font-size: 14px;
      color: var(--warm-gray);
      margin: 0 0 var(--spacing-8) 0;
    }

    .retry-btn {
      background: var(--luxury-gold);
      color: var(--white);
      min-width: 200px;
      height: 48px;
      font-weight: 600;
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
      .payment-layout {
        grid-template-columns: 1fr;
        gap: var(--spacing-6);
      }

      .payment-sidebar {
        position: static;
        order: -1;
      }

      .progress-stepper {
        margin: 0 var(--spacing-6) var(--spacing-6) var(--spacing-6);
      }
    }

    @media (max-width: 768px) {
      .payment-page {
        padding: var(--spacing-6) var(--spacing-4) var(--spacing-6);
      }

      .page-title {
        font-size: 1.75rem;
        padding: 0 var(--spacing-6);
        margin-bottom: var(--spacing-6);
      }

      .page-title mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
      }

      .payment-container {
        padding: 0 var(--spacing-6);
      }

      .progress-stepper {
        margin: 0 var(--spacing-4) var(--spacing-6) var(--spacing-4);
        padding: var(--spacing-4) var(--spacing-5);
      }

      .step-line {
        width: 40px;
        margin: 0 var(--spacing-2);
      }

      .card-body {
        padding: var(--spacing-5);
      }

      .payment-actions {
        flex-direction: column;
      }

      .cancel-btn,
      .pay-btn {
        width: 100%;
      }
    }

    @media (max-width: 480px) {
      .page-title {
        font-size: 1.5rem;
        padding: 0 var(--spacing-4);
      }

      .payment-container {
        padding: 0 var(--spacing-4);
      }

      .progress-stepper {
        margin: 0 var(--spacing-4) var(--spacing-5) var(--spacing-4);
        padding: var(--spacing-3) var(--spacing-4);
      }

      .step-icon {
        width: 32px;
        height: 32px;
      }

      .step-icon mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      .step-line {
        width: 30px;
        margin: 0 6px;
      }

      .step-label {
        font-size: 11px;
      }

      .card-header {
        padding: var(--spacing-4) var(--spacing-5);
      }

      .card-body {
        padding: var(--spacing-4);
      }

      .total-value {
        font-size: 1.375rem;
      }
    }
  `]
})
export class PaymentComponent implements OnInit, AfterViewInit {
  reservation: any = null;
  reservationId: number | null = null;
  loading = true;
  processingPayment = false;
  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  cardElement: StripeCardElement | null = null;
  reservationLoaded = false;
  initializationAttempts = 0;
  maxInitializationAttempts = 10;

  @ViewChild('cardElement') set cardElementSetter(el: ElementRef | undefined) {
    if (el) {
      console.log('ViewChild: cardElement became available');
      this.cardElementRef = el;
      this.tryInitializeStripe();
    }
  }

  cardElementRef!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private reservationService: ReservationService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    // Get reservation ID from route params
    this.route.params.subscribe(params => {
      this.reservationId = +params['id']; // Convert string to number
      if (this.reservationId) {
        this.loadReservation();
      } else {
        console.error('No reservation ID provided');
        this.loading = false;
      }
    });
  }

  ngAfterViewInit() {
    // View is ready, reset attempts counter and try to initialize Stripe if reservation is loaded
    console.log('ngAfterViewInit: View initialized, checking for Stripe initialization');
    this.initializationAttempts = 0; // Reset counter when view is ready
    this.tryInitializeStripe();
  }

  private tryInitializeStripe() {
    // Check if already initialized or initializing
    if (this.cardElement) {
      console.log('Stripe already initialized');
      return;
    }

    // Only initialize if both conditions are met
    if (this.reservationLoaded && this.cardElementRef) {
      console.log('Conditions met: Initializing Stripe');
      this.initializeStripe();
    } else {
      console.log('Stripe initialization pending:', {
        reservationLoaded: this.reservationLoaded,
        cardElementRef: !!this.cardElementRef
      });
    }
  }

  async loadReservation() {
    try {
      // Get reservation details
      const reservation = await this.reservationService.getReservation(this.reservationId!).toPromise();
      this.reservation = reservation;
      this.reservationLoaded = true;

      this.loading = false;

      // Trigger change detection and then try to initialize Stripe
      setTimeout(() => this.tryInitializeStripe(), 0);
    } catch (error) {
      console.error('Error loading reservation:', error);
      this.loading = false;
    }
  }

  async initializeStripe() {
    try {
      console.log('Starting Stripe initialization...');
      this.stripe = await this.paymentService.getStripe();
      console.log('Stripe loaded:', !!this.stripe);

      if (!this.stripe) {
        throw new Error('Stripe failed to initialize - null returned from getStripe()');
      }

      console.log('Creating Stripe elements...');
      this.elements = this.stripe.elements();

      // Create card element
      console.log('Creating card element...');
      this.cardElement = this.elements.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#2c3e50',
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            '::placeholder': {
              color: '#6c757d',
            },
          },
        },
      });

      console.log('Card element created:', !!this.cardElement);

      // Mount card element using ViewChild reference
      if (this.cardElementRef && this.cardElement && this.cardElementRef.nativeElement) {
        console.log('Mounting card element to DOM...');
        this.cardElement.mount(this.cardElementRef.nativeElement);
        console.log('Stripe card element mounted successfully');
      } else {
        console.error('Card element mounting failed:', {
          cardElementRef: !!this.cardElementRef,
          cardElement: !!this.cardElement,
          nativeElement: !!(this.cardElementRef?.nativeElement)
        });
      }
    } catch (error) {
      console.error('Error initializing Stripe:', error);
      // Reset state on error
      this.stripe = null;
      this.cardElement = null;
    }
  }

  async processPayment() {
    if (!this.stripe || !this.cardElement || !this.reservation) {
      console.error('Payment prerequisites not met:', {
        stripe: !!this.stripe,
        cardElement: !!this.cardElement,
        reservation: !!this.reservation
      });
      this.showPaymentResult(false, 'Payment system not ready. Please refresh the page.');
      return;
    }

    // Additional check to ensure card element is mounted
    if (!this.cardElementRef || !this.cardElementRef.nativeElement) {
      console.error('Card element not mounted to DOM');
      this.showPaymentResult(false, 'Payment form not ready. Please refresh the page.');
      return;
    }

    this.processingPayment = true;

    try {
      // Create payment intent
      const paymentIntent = await this.paymentService.createPaymentIntent(this.reservation.id).toPromise();
      
      if (!paymentIntent) {
        throw new Error('Failed to create payment intent');
      }

      // Confirm payment
      const { error } = await this.stripe.confirmCardPayment(paymentIntent.clientSecret, {
        payment_method: {
          card: this.cardElement,
        }
      });

      if (error) {
        // Payment failed
        await this.paymentService.failPayment(paymentIntent.paymentIntentId, error.message || 'Payment failed').toPromise();
        this.showPaymentResult(false, error.message || 'Payment failed');
      } else {
        // Payment succeeded
        await this.paymentService.confirmPayment(paymentIntent.paymentIntentId).toPromise();
        this.showPaymentResult(true);
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      this.showPaymentResult(false, error.message || 'An error occurred during payment');
    } finally {
      this.processingPayment = false;
    }
  }

  showPaymentResult(success: boolean, message?: string) {
    const dialogRef = this.dialog.open(PaymentResultDialog, {
      width: '400px',
      data: { success, message },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(() => {
      if (success) {
        this.router.navigate(['/my-reservations']);
      }
    });
  }

  cancel() {
    this.router.navigate(['/booking']);
  }

  getReservationTypeLabel(): string {
    if (!this.reservation) return '';

    switch (this.reservation.type) {
      case 'HOTEL': return 'Hotel Only';
      case 'FLIGHT': return 'Flight Only';
      case 'BOTH': return 'Hotel + Flight Package';
      default: return 'Reservation';
    }
  }
}

// Payment Result Dialog
@Component({
  selector: 'payment-result-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="result-dialog">
      <div class="result-icon-wrapper" [ngClass]="{'success': data.success, 'error': !data.success}">
        <mat-icon class="result-icon">{{ data.success ? 'check_circle' : 'error' }}</mat-icon>
      </div>
      <h2 mat-dialog-title>{{ data.success ? 'Payment Successful!' : 'Payment Failed' }}</h2>
      <mat-dialog-content>
        <p class="result-message">{{ data.success ? 'Your payment has been processed successfully.' : (data.message || 'Your payment could not be processed.') }}</p>
      </mat-dialog-content>
      <mat-dialog-actions>
        <button mat-raised-button [color]="data.success ? 'primary' : 'accent'" (click)="close()">
          {{ data.success ? 'View My Reservations' : 'Try Again' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .result-dialog {
      text-align: center;
      padding: 32px;
      background: linear-gradient(135deg, #fafaf8 0%, #fff9ed 100%);
      border-radius: 12px;
    }

    .result-icon-wrapper {
      margin: 24px 0;
      animation: scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .result-icon-wrapper.success .result-icon {
      color: #7cb17a;
      filter: drop-shadow(0 4px 12px rgba(124, 177, 122, 0.35));
    }

    .result-icon-wrapper.error .result-icon {
      color: #c17b7b;
      filter: drop-shadow(0 4px 12px rgba(193, 123, 123, 0.35));
    }

    @keyframes scaleIn {
      0% {
        transform: scale(0) rotate(-180deg);
        opacity: 0;
      }
      60% {
        transform: scale(1.15) rotate(10deg);
      }
      100% {
        transform: scale(1) rotate(0deg);
        opacity: 1;
      }
    }

    .result-icon {
      font-size: 90px;
      width: 90px;
      height: 90px;
    }

    h2 {
      font-size: 2rem;
      font-weight: 700;
      margin: 20px 0 16px 0;
      font-family: 'Poppins', sans-serif;
      background: linear-gradient(135deg, #d4af37 0%, #e8c96f 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: 0.02em;
      text-shadow: 0 2px 8px rgba(212, 175, 55, 0.15);
    }

    .result-message {
      font-size: 1.05rem;
      color: #5a5a5a;
      margin: 16px 0 24px 0;
      line-height: 1.7;
      font-weight: 500;
    }

    mat-dialog-actions {
      justify-content: center;
      padding: 24px 0 0;
    }

    button {
      height: 54px;
      padding: 0 40px;
      font-size: 1.05rem;
      font-weight: 700;
      border-radius: 12px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      background: linear-gradient(135deg, #d4af37 0%, #e8c96f 100%);
      color: white;
      box-shadow: 0 4px 16px rgba(212, 175, 55, 0.35);
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative;
      overflow: hidden;
    }

    button::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
      transition: left 0.5s ease;
    }

    button:hover {
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 8px 28px rgba(212, 175, 55, 0.45);
      background: linear-gradient(135deg, #b8941f 0%, #d4af37 100%);
    }

    button:hover::before {
      left: 100%;
    }

    button:active {
      transform: translateY(-1px) scale(1);
    }
  `]
})
export class PaymentResultDialog {
  constructor(
    public dialogRef: MatDialogRef<PaymentResultDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { success: boolean; message?: string }
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}