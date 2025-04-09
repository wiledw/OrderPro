import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { OrdersService, Order, OrderTracking } from '../../services/order.service';
import { RouterLink, Router } from '@angular/router';

interface User {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  user: User | null = null;
  loading = true;
  error = '';
  orders: Order[] = [];
  selectedOrder: Order | null = null;
  orderTracking: OrderTracking | null = null;
  filteredOrders: Order[] = [];
  currentStatusFilter: string = '';
  isAdmin: boolean = false;

  constructor(private auth: AuthService, private ordersService: OrdersService, private router: Router) {}

  ngOnInit() {
    this.loadUserInfo();
    this.loadOrders();
  }

  loadUserInfo() {
    this.auth.getCurrentUser().subscribe({
      next: (user) => {
        this.user = user;
        this.isAdmin = user.is_admin;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load user information';
        this.loading = false;
        console.error('Error loading user info:', error);
      }
    });
  }

  loadOrders() {
    this.loading = true;
    this.ordersService.getUserOrders(this.currentStatusFilter).subscribe({
      next: (response) => {
        this.orders = response.data;
        this.filteredOrders = response.data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load orders';
        this.loading = false;
        console.error('Error loading orders:', error);
      }
    });
  }

  changeOrderStatus(orderId: number, newStatus: string) {
    this.ordersService.updateOrderStatus(orderId, newStatus).subscribe({
      next: (res) => {
        if (res.success) {
          alert(`Order status updated to '${newStatus}'`);
          this.loadOrders(); // Reload orders to reflect the updated status
        }
      },
      error: (err) => {
        console.error('Failed to update order status:', err);
        alert('❌ Failed to update order status.');
      }
    });
  }

  handleInput(event: Event) {
    const target = event.target as HTMLSelectElement; 
    this.currentStatusFilter = target.value; 
    this.filterOrders(this.currentStatusFilter); 
  }

  filterOrders(status: string | null) {
    this.currentStatusFilter = status || '';
    this.filteredOrders = this.currentStatusFilter
      ? this.orders.filter(order => order.status === this.currentStatusFilter)
      : this.orders;
  }
  
  selectOrder(order: Order) {
    this.selectedOrder = order;
    this.loadOrderTracking(order.id);
  }

  loadOrderTracking(orderId: number) {
    this.ordersService.getOrderTracking(orderId).subscribe({
      next: (response) => {
        this.orderTracking = response.data;
      },
      error: (error) => {
        console.error('Error loading order tracking:', error);
      }
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  calculateOrderTotal(order: Order): string {
    return order.items.reduce((total, item) => {
      return total + (parseFloat(item.price) * item.pivot.quantity);
    }, 0).toFixed(2);
  }

}