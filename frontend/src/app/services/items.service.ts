import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Item } from '../models/item.model'; 

@Injectable({
  providedIn: 'root'
})
export class ItemsService {
  private baseUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getItems(sort: 'asc' | 'desc' = 'asc', page: number = 1): Observable<{ success: boolean; data: { items: Item[]; pagination: any } }> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
    });

    return this.http.get<{ success: boolean; data: { items: Item[]; pagination: any } }>(`${this.baseUrl}/items?sort=${sort}&page=${page}`, { headers });
  }

  addItem(item: any): Observable<any> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<any>(`${this.baseUrl}/items`, item, { headers });
  }
}