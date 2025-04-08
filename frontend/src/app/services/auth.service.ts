import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

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
  private baseUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient, private router: Router) {}

  private cleanToken(token: string): string {
    return token.replace(/^\d+\|/, '');
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  private handleAuthError(error: HttpErrorResponse) {
    if (error.status === 401) {
      // Token is invalid or expired
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
      })
    );
  }

  register(data: any) {
    return this.http.post(`${this.baseUrl}/register`, data).pipe(
      map((response: any) => {
        if (response.data?.token) {
          response.data.token = this.cleanToken(response.data.token);
        }
        return response;
      })
    );
  }

  getCurrentUser() {
    return this.http.get<{success: boolean, data: User}>(`${this.baseUrl}/me`, this.getAuthHeaders())
      .pipe(
        map(response => response.data)
      );
  }

  logoutApi() {
    return this.http.post(`${this.baseUrl}/logout`, {}, this.getAuthHeaders()).pipe(
      tap(() => {
        localStorage.removeItem('auth_token');
        this.router.navigate(['/login']);
      })
    );
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('auth_token');
  }
}