import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class JwtInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.getToken();
    console.log('JWT Interceptor - URL:', req.url, 'Token:', token ? 'Present' : 'Missing');
    if (token) {
      const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
      console.log('JWT Interceptor - Added Authorization header');
      return next.handle(cloned);
    }
    console.log('JWT Interceptor - No token, passing request unchanged');
    return next.handle(req);
  }
}
