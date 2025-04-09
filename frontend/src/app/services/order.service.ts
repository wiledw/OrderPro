import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { Item } from '../models/item.model'; 
import { throwError } from 'rxjs';
import { environment } from '../../environments/environment';

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
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getUserOrders(status: string = ''): Observable<{ success: boolean; data: Order[] }> {
    const params = new HttpParams().set('status', status);
    return this.http.get<{ success: boolean; data: Order[] }>(
      `${this.baseUrl}/orders`,
      { headers: this.getAuthHeaders(), params }
    ).pipe(
      catchError((error) => {
        console.error('Error fetching orders:', error);
        return throwError(() => error);
      })
    );
  }

  getOrderTracking(orderId: number): Observable<{ success: boolean; data: OrderTracking }> {
    return this.http.get<{ success: boolean; data: OrderTracking }>(
      `${this.baseUrl}/orders/${orderId}/tracking`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError((error) => {
        console.error('Error fetching order tracking:', error);
        return throwError(() => error);
      })
    );
  }

  getItems(sort: 'asc' | 'desc' = 'asc', page: number = 1): Observable<{ success: boolean; data: { items: Item[]; pagination: any } }> {
    return this.http.get<{ success: boolean; data: { items: Item[]; pagination: any } }>(`${this.baseUrl}/items?sort=${sort}&page=${page}`, { headers: this.getAuthHeaders() });
  }

  createOrder(orderData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/orders`, orderData, { headers: this.getAuthHeaders() }).pipe(
      catchError((error) => {
        console.error('Error creating order:', error);
        return throwError(() => error);
      })
    );
  }

  updateOrderStatus(orderId: number, status: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/orders/${orderId}/status`, { status }, { headers: this.getAuthHeaders() }).pipe(
      catchError((error) => {
        console.error('Error updating order status:', error);
        return throwError(() => error);
      })
    );
  }
}