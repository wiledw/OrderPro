import { Component, OnInit } from '@angular/core';
import { OrdersService } from '../../services/order.service';
import { CartService } from '../../services/cart.service';
import { Item } from '../../models/item.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PaymentModalComponent } from '../payment-modal/payment-modal.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [FormsModule, CommonModule, PaymentModalComponent],
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
  currentPage: number = 1;
  totalPages: number = 1;

  // Payment inputs
  showPaymentModal: boolean = false; 
  cardHolder: string = '';
  cardNumber: string = '';
  cardExpMonth: string = '';
  cardExpYear: string = '';
  cardCvv: string = '';

  constructor(private ordersService: OrdersService, private router: Router, private cartService: CartService) {}

  ngOnInit() {
    this.loadItems();
    this.selectedItems = this.cartService.getCartItems(); // Load cart items from the service
    this.updateTotal(); // Update total based on loaded cart items
  }

  loadItems() {
    this.ordersService.getItems(this.sortOrder, this.currentPage).subscribe({
      next: (res) => {
        if (res.success) {
          this.items = res.data.items;
          this.totalPages = res.data.pagination.total_pages; // Assuming your API returns total pages
        }
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

  goToPage(page: number) {
    this.currentPage = page;
    this.loadItems();
  }

  addToCart(itemId: number | null, quantity: number) {
    if (!itemId || quantity < 1) return;
  
    const itemData = this.items.find(item => item.id === itemId);
    if (!itemData) return;
    this.cartService.addToCart(itemId, quantity, itemData);  
    this.selectedItems = this.cartService.getCartItems();
    this.updateTotal();
    this.selectedItemId = null;
    this.quantity = 1;
  }

  removeFromCart(itemId: number) {
    this.cartService.removeFromCart(itemId); // Use CartService to remove from cart
    this.selectedItems = this.cartService.getCartItems(); // Update local cart items
    this.updateTotal(); // Update total after removing item
  }

  updateTotal() {
    this.totalAmount = this.cartService.getTotalAmount();
  }

  proceedToPayment() {
    this.showPaymentModal = true;
  }

  onConfirmOrder() {
    const orderPayload = {
      items: this.selectedItems
    };

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
    this.cartService.clearCart(); // Clear the cart in the service
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