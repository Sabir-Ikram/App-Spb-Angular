import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateReservationRequest, ReservationResponse, ReservationStatus } from '../models/reservation.model';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = '/api/reservations';

  constructor(private http: HttpClient) {}

  /**
   * Create a new reservation for flight, hotel, or both
   */
  createReservation(request: CreateReservationRequest): Observable<ReservationResponse> {
    return this.http.post<ReservationResponse>(this.apiUrl, request);
  }

  /**
   * Get current user's reservations
   */
  getUserReservations(): Observable<ReservationResponse[]> {
    return this.http.get<ReservationResponse[]>(`${this.apiUrl}/me`);
  }

  /**
   * Get a specific reservation by ID
   */
  getReservation(id: number): Observable<ReservationResponse> {
    return this.http.get<ReservationResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Admin: Get all reservations
   */
  getAllReservations(): Observable<ReservationResponse[]> {
    return this.http.get<ReservationResponse[]>(`${this.apiUrl}/admin/all`);
  }

  /**
   * Admin: Update reservation status
   */
  updateReservationStatus(id: number, status: ReservationStatus): Observable<ReservationResponse> {
    return this.http.patch<ReservationResponse>(`${this.apiUrl}/admin/${id}/status`, { status });
  }
}
