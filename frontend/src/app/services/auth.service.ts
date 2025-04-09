import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, map, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { CartService } from './cart.service';
import { environment } from '../../environments/environment';

interface User {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient, private router: Router, private cartService: CartService) {}

  private cleanToken(token: string): string {
    return token.replace(/^\d+\|/, '');
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  private handleAuthError(error: HttpErrorResponse) {
    if (error.status === 401) {
      localStorage.removeItem('auth_token');
      this.router.navigate(['/login']);
    }
    return throwError(() => error);
  }

  login(data: any) {
    return this.http.post(`${this.baseUrl}/login`, data).pipe(
      map((response: any) => {
        if (response.data?.token) {
          response.data.token = this.cleanToken(response.data.token);
        }
        return response;
      }),
      catchError(this.handleAuthError)
    );
  }

  register(data: any) {
    return this.http.post(`${this.baseUrl}/register`, data).pipe(
      map((response: any) => {
        if (response.data?.token) {
          response.data.token = this.cleanToken(response.data.token);
        }
        return response;
      }),
      catchError(this.handleAuthError)
    );
  }

  getCurrentUser() {
    return this.http.get<{ success: boolean; data: User }>(`${this.baseUrl}/me`, { headers: this.getAuthHeaders() })
      .pipe(
        map(response => response.data),
        catchError(this.handleAuthError)
      );
  }

  logoutApi() {
    return this.http.post(`${this.baseUrl}/logout`, {}, { headers: this.getAuthHeaders() }).pipe(
      tap(() => {
        localStorage.removeItem('auth_token');
        this.cartService.clearCart();
        this.router.navigate(['/login']);
      }),
      catchError(this.handleAuthError)
    );
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('auth_token');
  }
}