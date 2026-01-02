import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, map, Observable } from 'rxjs';

interface LoginResponse {
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'voyage_token';
  private roleKey = 'voyage_role';
  private currentUserSubject = new BehaviorSubject<string | null>(this.getToken());

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<void> {
    return this.http.post<LoginResponse>('/api/auth/login', { email, password }).pipe(
      map(res => {
        this.setToken(res.token);
      })
    );
  }

  register(fullName: string, email: string, password: string): Observable<any> {
    return this.http.post('/api/auth/register', { fullName, email, password });
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
    this.currentUserSubject.next(token);
    const payload = this.parseJwt(token);
    if (payload && payload.role) {
      localStorage.setItem(this.roleKey, payload.role);
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    const payload = this.parseJwt(token);
    if (!payload) return false;
    if (payload.exp && typeof payload.exp === 'number') {
      // exp is in seconds
      return Date.now() < payload.exp * 1000;
    }
    return true;
  }

  getRole(): string | null {
    return localStorage.getItem(this.roleKey);
  }

  private parseJwt(token: string | null): any | null {
    if (!token) return null;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decodeURIComponent(escape(payload)));
    } catch (e) {
      return null;
    }
  }
}
