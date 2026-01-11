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
      <mat-toolbar class="payment-toolbar">
        <mat-toolbar-row>
          <span class="page-title">Complete Your Payment</span>
        </mat-toolbar-row>
      </mat-toolbar>

      <div class="payment-container">
        <!-- Loading State -->
        <div *ngIf="loading" class="loading-state">
          <mat-spinner diameter="60" color="primary"></mat-spinner>
          <h3>Preparing Payment...</h3>
        </div>

        <!-- Payment Form -->
        <div *ngIf="!loading && reservation" class="payment-content">
          <mat-card class="booking-summary-card">
            <div class="card-header">
              <mat-icon>receipt</mat-icon>
              <h2>Booking Summary</h2>
            </div>

            <div class="booking-details">
              <div class="detail-row">
                <span class="label">Reservation ID:</span>
                <span class="value">#{{ reservation.id }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Type:</span>
                <span class="value">{{ getReservationTypeLabel() }}</span>
              </div>
              <div class="detail-row total">
                <span class="label">Total Amount:</span>
                <span class="value total-amount">\${{ reservation.totalPrice | number:'1.2-2' }}</span>
              </div>
            </div>
          </mat-card>

          <mat-card class="payment-card">
            <div class="card-header">
              <mat-icon>credit_card</mat-icon>
              <h2>Payment Information</h2>
            </div>

            <div class="payment-form">
              <div #cardElement class="card-element"></div>

              <div class="payment-actions">
                <button mat-stroked-button class="cancel-btn" (click)="cancel()">
                  <mat-icon>arrow_back</mat-icon>
                  Back to Booking
                </button>
                <button mat-raised-button color="primary" class="pay-btn"
                        [disabled]="processingPayment"
                        (click)="processPayment()">
                  <mat-icon *ngIf="!processingPayment">payment</mat-icon>
                  <mat-spinner *ngIf="processingPayment" diameter="20" color="accent"></mat-spinner>
                  {{ processingPayment ? 'Processing...' : 'Pay Now' }}
                </button>
              </div>
            </div>
          </mat-card>
        </div>

        <!-- Error State -->
        <div *ngIf="!loading && !reservation" class="error-state">
          <mat-icon class="error-icon">error</mat-icon>
          <h3>Payment Not Available</h3>
          <p>Unable to load payment information. Please try again.</p>
          <button mat-raised-button color="primary" routerLink="/my-reservations">
            <mat-icon>list</mat-icon>
            View My Reservations
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .payment-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #f9f7f4 0%, #ede8e0 100%);
    }

    .payment-toolbar {
      background: linear-gradient(135deg, #8b6c50 0%, #a8845c 50%, #6d5d4b 100%);
      color: white;
      box-shadow: 0 6px 24px rgba(139, 108, 80, 0.25);
      position: relative;
      overflow: hidden;
    }

    .payment-toolbar::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
      animation: shimmer 3s ease-in-out infinite;
    }

    @keyframes shimmer {
      0%, 100% { left: -100%; }
      50% { left: 100%; }
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .payment-container {
      max-width: 800px;
      margin: 40px auto;
      padding: 0 24px;
    }

    .loading-state, .error-state {
      text-align: center;
      padding: 100px 24px;
      background: linear-gradient(to bottom, #ffffff 0%, #fefefe 100%);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(139, 108, 80, 0.15);
      border: 1px solid rgba(139, 108, 80, 0.08);
    }

    .loading-state h3, .error-state h3 {
      font-size: 1.75rem;
      font-weight: 700;
      background: linear-gradient(135deg, #8b6c50 0%, #a8845c 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 32px 0 12px 0;
    }

    .loading-state p, .error-state p {
      font-size: 1.1rem;
      color: #6d5d4b;
      margin: 0 0 32px 0;
      line-height: 1.6;
    }

    .error-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: #c4757d;
      animation: pulse-error 2s ease-in-out infinite;
    }

    @keyframes pulse-error {
      0%, 100% { transform: scale(1); opacity: 0.8; }
      50% { transform: scale(1.05); opacity: 1; }
    }

    .payment-content {
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    .booking-summary-card, .payment-card {
      border-radius: 16px;
      overflow: hidden;
      border: 2px solid rgba(139, 108, 80, 0.12);
      box-shadow: 0 6px 24px rgba(139, 108, 80, 0.12);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      background: linear-gradient(to bottom, #ffffff 0%, #fefefe 100%);
    }

    .booking-summary-card:hover, .payment-card:hover {
      box-shadow: 0 10px 40px rgba(139, 108, 80, 0.2);
      transform: translateY(-3px);
      border-color: #c4a574;
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 28px 32px;
      background: linear-gradient(135deg, #8b6c50 0%, #a8845c 50%, #6d5d4b 100%);
      color: white;
      position: relative;
      overflow: hidden;
    }

    .card-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
      transition: left 0.6s ease;
    }

    .booking-summary-card:hover .card-header::before,
    .payment-card:hover .card-header::before {
      left: 100%;
    }

    .card-header mat-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .booking-summary-card:hover .card-header mat-icon,
    .payment-card:hover .card-header mat-icon {
      transform: scale(1.1) rotate(5deg);
    }

    .card-header h2 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0;
      letter-spacing: 0.02em;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .booking-details {
      padding: 28px 32px;
      background: linear-gradient(135deg, #faf8f5 0%, #f8f6f3 100%);
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 0;
      border-bottom: 1px solid rgba(139, 108, 80, 0.1);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .detail-row:hover {
      padding-left: 8px;
      background: rgba(196, 165, 116, 0.05);
      border-radius: 8px;
    }

    .detail-row:last-child {
      border-bottom: none;
    }

    .detail-row.total {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 3px solid rgba(139, 108, 80, 0.2);
      font-weight: 600;
      background: linear-gradient(135deg, #fff9ed 0%, #ffedd5 100%);
      padding: 20px 16px;
      border-radius: 12px;
      margin-left: -16px;
      margin-right: -16px;
    }

    .label {
      color: #6d5d4b;
      font-weight: 600;
      font-size: 0.95rem;
      letter-spacing: 0.01em;
    }

    .value {
      color: #2d2416;
      font-weight: 600;
      font-size: 1.05rem;
    }

    .total-amount {
      font-size: 2rem;
      font-weight: 700;
      background: linear-gradient(135deg, #8b6c50 0%, #c4a574 50%, #a8845c 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-shadow: 0 2px 8px rgba(139, 108, 80, 0.1);
    }

    .payment-form {
      padding: 28px 32px;
    }

    .card-element {
      border: 2px solid rgba(139, 108, 80, 0.2);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 28px;
      background: linear-gradient(to bottom, #ffffff 0%, #fefefe 100%);
      min-height: 60px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 8px rgba(139, 108, 80, 0.08);
    }

    .card-element:hover {
      border-color: rgba(139, 108, 80, 0.4);
      box-shadow: 0 4px 16px rgba(139, 108, 80, 0.15);
    }

    .card-element:focus-within {
      border-color: #8b6c50;
      box-shadow: 0 6px 24px rgba(139, 108, 80, 0.2);
      border-width: 2.5px;
    }

    .payment-actions {
      display: flex;
      gap: 20px;
      justify-content: space-between;
      align-items: center;
      margin-top: 8px;
    }

    .cancel-btn, .pay-btn {
      height: 62px;
      padding: 0 40px;
      font-size: 1.15rem;
      font-weight: 700;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 12px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .cancel-btn {
      border: 2px solid rgba(139, 108, 80, 0.25);
      color: #8b6c50;
      background: transparent;
    }

    .cancel-btn:hover {
      border-color: #c4757d;
      color: #c4757d;
      background-color: rgba(196, 117, 125, 0.08);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(196, 117, 125, 0.15);
    }

    .cancel-btn mat-icon {
      font-size: 26px;
      width: 26px;
      height: 26px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .cancel-btn:hover mat-icon {
      transform: translateX(-3px);
    }

    .pay-btn {
      background: linear-gradient(135deg, #8b6c50 0%, #a8845c 50%, #6d5d4b 100%);
      box-shadow: 0 8px 28px rgba(139, 108, 80, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15);
      position: relative;
      overflow: hidden;
      border: none;
    }

    .pay-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s ease;
    }

    .pay-btn:hover::before {
      left: 100%;
    }

    .pay-btn:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 12px 40px rgba(139, 108, 80, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }

    .pay-btn:active:not(:disabled) {
      transform: translateY(-1px);
    }

    .pay-btn mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .pay-btn:hover:not(:disabled) mat-icon {
      transform: scale(1.1) rotate(5deg);
    }

    .pay-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }

    @media (max-width: 768px) {
      .payment-container {
        padding: 0 16px;
      }

      .payment-actions {
        flex-direction: column;
      }

      .cancel-btn, .pay-btn {
        width: 100%;
        justify-content: center;
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
      padding: 20px;
    }

    .result-icon-wrapper {
      margin: 20px 0;
      animation: scaleIn 0.5s ease-out;
    }

    .result-icon-wrapper.success .result-icon {
      color: #6d9f71;
    }

    .result-icon-wrapper.error .result-icon {
      color: #c4757d;
    }

    @keyframes scaleIn {
      0% {
        transform: scale(0);
        opacity: 0;
      }
      50% {
        transform: scale(1.1);
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }

    .result-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
    }

    h2 {
      font-size: 1.8rem;
      font-weight: 700;
      margin: 16px 0;
      background: linear-gradient(135deg, #8b6c50 0%, #a8845c 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .result-message {
      font-size: 1rem;
      color: #6d5d4b;
      margin: 16px 0;
      line-height: 1.6;
    }

    mat-dialog-actions {
      justify-content: center;
      padding: 24px 0 0;
    }

    button {
      height: 52px;
      padding: 0 32px;
      font-size: 1.05rem;
      font-weight: 700;
      border-radius: 10px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      background: linear-gradient(135deg, #8b6c50 0%, #a8845c 50%, #6d5d4b 100%);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(139, 108, 80, 0.35);
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