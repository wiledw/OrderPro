import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { Item } from '../models/item.model'; 
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ItemsService {
  private baseUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getItems(sort: 'asc' | 'desc' = 'asc', page: number = 1): Observable<{ success: boolean; data: { items: Item[]; pagination: any } }> {
    return this.http.get<{ success: boolean; data: { items: Item[]; pagination: any } }>(
      `${this.baseUrl}/items?sort=${sort}&page=${page}`, 
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError((error) => {
        console.error('Error fetching items:', error);
        return throwError(() => error);
      })
    );
  }

  addItem(item: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/items`, item, { headers: this.getAuthHeaders() }).pipe(
      catchError((error) => {
        console.error('Error adding item:', error);
        return throwError(() => error);
      })
    );
  }
}