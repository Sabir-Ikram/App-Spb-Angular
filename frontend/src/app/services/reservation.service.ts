import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private base = '/api/reservations';

  constructor(private http: HttpClient) {}

  getMyReservations(): Observable<any[]> {
    return this.http.get<any[]>(this.base);
  }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/all`);
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.base}/${id}`);
  }

  create(payload: any): Observable<any> {
    return this.http.post<any>(this.base, payload);
  }

  cancel(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
