import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Destination {
  id: string;
  name: string;
  iataCode: string;
  country: string;
}

@Injectable({ providedIn: 'root' })
export class DestinationService {
  private base = '/api/destinations';
  private amadeusBase = '/api/amadeus/destinations';

  constructor(private http: HttpClient) {}

  /**
   * Search destinations from Amadeus API by keyword
   */
  search(keyword: string): Observable<Destination[]> {
    return this.http.get<Destination[]>(this.amadeusBase, {
      params: new HttpParams().set('keyword', keyword)
    });
  }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.base);
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.base}/${id}`);
  }

  create(payload: any): Observable<any> {
    return this.http.post<any>(this.base, payload);
  }

  update(id: number, payload: any): Observable<any> {
    return this.http.put<any>(`${this.base}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
