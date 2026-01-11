import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private stripePromise!: Promise<Stripe | null>;
  private apiUrl = '/api/payments';

  constructor(private http: HttpClient) {
    console.log('PaymentService constructor: Initializing Stripe...');
    try {
      this.stripePromise = loadStripe('pk_test_51SmFHHLLu6ao5bDr4RqTYsFFMggNarpXQAGPAE6p1VQLKQuDsTKW5lkmQMrDsx1cwCUPp40sDvFCvWHVEDPgxgtj00Jp1gXmSZ');
      console.log('PaymentService constructor: loadStripe called, promise created');

      // Log when the promise resolves
      this.stripePromise.then(stripe => {
        console.log('PaymentService: Stripe promise resolved:', !!stripe);
        if (!stripe) {
          console.error('PaymentService: Stripe promise resolved to null!');
        }
      }).catch(error => {
        console.error('PaymentService: Stripe promise rejected:', error);
      });
    } catch (error) {
      console.error('PaymentService constructor: Error creating Stripe promise:', error);
    }
  }

  async getStripe(): Promise<Stripe | null> {
    console.log('PaymentService: getStripe() called, awaiting promise...');
    try {
      const stripe = await this.stripePromise;
      console.log('PaymentService: getStripe() resolved:', !!stripe);
      return stripe;
    } catch (error) {
      console.error('PaymentService: getStripe() failed:', error);
      return null;
    }
  }

  createPaymentIntent(reservationId: number): Observable<PaymentIntentResponse> {
    return this.http.post<PaymentIntentResponse>(`${this.apiUrl}/create-payment-intent/${reservationId}`, {});
  }

  getPaymentForReservation(reservationId: number): Observable<PaymentIntentResponse> {
    return this.http.get<PaymentIntentResponse>(`${this.apiUrl}/reservation/${reservationId}`);
  }

  confirmPayment(paymentIntentId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/confirm/${paymentIntentId}`, {});
  }

  failPayment(paymentIntentId: string, reason: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/fail/${paymentIntentId}`, {}, {
      params: { reason }
    });
  }
}