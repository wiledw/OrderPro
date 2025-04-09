import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Item } from '../models/item.model'; 

export interface OrderItem {
  id: number;
  name: string;
  price: string;
  pivot: {
    quantity: number;
    created_at: string;
    updated_at: string;
  };
}

export interface Order {
  id: number;
  user_id: number;
  total_amount: string;
  status: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export interface TrackingHistory {
  from_status: string | null;
  to_status: string;
  changed_by: {
    id: number;
    name: string;
  };
  changed_at: string;
}

export interface OrderTracking {
  order_id: number;
  current_status: string;
  tracking_history: TrackingHistory[];
}

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private baseUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  getUserOrders(status: string = ''): Observable<{ success: boolean; data: Order[] }> {
    const params = new HttpParams().set('status', status);
    return this.http.get<{ success: boolean; data: Order[] }>(
      `${this.baseUrl}/orders`,
      { ...this.getAuthHeaders(), params }
    );
  }

  getOrderTracking(orderId: number): Observable<{ success: boolean; data: OrderTracking }> {
    return this.http.get<{ success: boolean; data: OrderTracking }>(
      `${this.baseUrl}/orders/${orderId}/tracking`,
      this.getAuthHeaders()
    );
  }

  getItems(sort: 'asc' | 'desc' = 'asc', page: number = 1): Observable<{ success: boolean; data: { items: Item[]; pagination: any } }> {
    const token = localStorage.getItem('auth_token'); // Retrieve the token from local storage
    const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}` // Set the Authorization header
    });

    return this.http.get<{ success: boolean; data: { items: Item[]; pagination: any } }>(`${this.baseUrl}/items?sort=${sort}&page=${page}`, { headers });
  }

  createOrder(orderData: any): Observable<any> {
    const token = localStorage.getItem('auth_token'); // Retrieve the token from local storage
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}` // Set the Authorization header
    });

    return this.http.post(`${this.baseUrl}/orders`, orderData, { headers });
  }
}