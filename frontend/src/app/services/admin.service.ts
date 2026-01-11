import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = '/api/admin';

  constructor(private http: HttpClient) {}

  importDestinations(): Observable<any> {
    return this.http.post(`${this.apiUrl}/import-destinations`, {});
  }

  importFlights(): Observable<any> {
    return this.http.post(`${this.apiUrl}/import-flights`, {});
  }

  clearFlights(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clear-flights`);
  }
}
