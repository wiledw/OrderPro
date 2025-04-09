import { Component, OnInit } from '@angular/core';
import { OrdersService } from '../../services/order.service';
import { Item } from '../../models/item.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  items: Item[] = [];
  selectedItemId: number | null = null;
  quantity: number = 1;
  selectedItems: { id: number; quantity: number }[] = [];
  showPayment = false;
  totalAmount: number = 0;
  sortOrder: 'asc' | 'desc' = 'asc'; 

  // Payment inputs
  cardHolder: string = '';
  cardNumber: string = '';
  cardExpMonth: string = '';
  cardExpYear: string = '';
  cardCvv: string = '';

  constructor(private ordersService: OrdersService, private router: Router) {}

  ngOnInit() {
    this.loadItems();
  }

  loadItems() {
    this.ordersService.getItems(this.sortOrder).subscribe({
        next: (res) => {
            if (res.success) this.items = res.data.items;
        },
        error: (err) => {
            console.error('Error loading items:', err);
        }
    });
  } 

  changeSortOrder(event: Event) {
      const target = event.target as HTMLSelectElement; 
      this.sortOrder = target.value as 'asc' | 'desc';
      this.loadItems(); // Reload items with the new sorting order
  }

  addToCart(itemId: number | null, quantity: number) {
    if (!itemId || quantity < 1) return;

    const existing = this.selectedItems.find(i => i.id === itemId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.selectedItems.push({ id: itemId, quantity });
    }

    this.updateTotal();
    this.selectedItemId = null;
    this.quantity = 1;
  }

  updateTotal() {
    this.totalAmount = this.selectedItems.reduce((sum, item) => {
      const found = this.items.find(i => i.id === item.id);
      return sum + (found ? parseFloat(found.price) * item.quantity : 0);
    }, 0);
  }

  getItemDetails(id: number) {
    return this.items.find(i => i.id === id);
  }

  proceedToPayment() {
    this.showPayment = true;
  }

  confirmOrder() {
    const orderPayload = {
      items: this.selectedItems
    };

    // Simulate payment step (this can be replaced with real payment API later)
    const isCardValid = this.cardHolder && this.cardNumber && this.cardExpMonth && this.cardExpYear && this.cardCvv;

    if (!isCardValid) {
      alert('Please complete all payment fields.');
      return;
    }

    this.ordersService.createOrder(orderPayload).subscribe({
      next: (res) => {
        console.log('Order created:', res);
        alert('🎉 Order placed successfully!');
        this.resetOrderForm();
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Failed to create order:', err);
        alert('❌ Order creation failed.');
      }
    });
  }

  cancelOrder() {
    this.resetOrderForm();
  }

  resetOrderForm() {
    this.selectedItems = [];
    this.selectedItemId = null;
    this.quantity = 1;
    this.totalAmount = 0;
    this.showPayment = false;

    // Reset payment fields
    this.cardHolder = '';
    this.cardNumber = '';
    this.cardExpMonth = '';
    this.cardExpYear = '';
    this.cardCvv = '';
  }

  get taxAmount(): number {
    return this.totalAmount * 0.08;
  }

  get finalTotal(): number {
    return this.totalAmount * 1.08;
  }

  getParsedPrice(price: string): number {
    return parseFloat(price);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
