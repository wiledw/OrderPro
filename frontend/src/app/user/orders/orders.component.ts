import { Component, OnInit } from '@angular/core';
import { OrdersService } from '../../services/order.service';
import { CartService } from '../../services/cart.service';
import { ItemsService } from '../../services/items.service';
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
  selectedItems: { id: number; quantity: number; itemData: Item }[] = [];
  showPayment = false;
  totalAmount: number = 0;
  sortOrder: 'asc' | 'desc' = 'asc'; 
  currentPage: number = 1;
  totalPages: number = 1;
  showPaymentModal: boolean = false; 
  

  constructor(private ordersService: OrdersService, private router: Router, private cartService: CartService, private itemsService: ItemsService) {}

  ngOnInit() {
    this.loadItems();
    this.selectedItems = this.cartService.getCartItems();
    this.updateTotal();
  }

  loadItems(): void  {
    this.itemsService.getItems(this.sortOrder, this.currentPage).subscribe({
      next: (res) => {
        if (res.success) {
          this.items = res.data.items;
          this.totalPages = res.data.pagination.total_pages;
        }
      },
      error: (err) => {
        console.error('Error loading items:', err);
      }
    });
  }

  changeSortOrder(event: Event): void  {
    const target = event.target as HTMLSelectElement; 
    this.sortOrder = target.value as 'asc' | 'desc';
    this.loadItems();
  }

  goToPage(page: number): void  {
    this.currentPage = page;
    this.loadItems();
  }

  addToCart(itemId: number | null, quantity: number): void  {
    if (!itemId || quantity < 1) return;
  
    const itemData = this.items.find(item => item.id === itemId);
    if (!itemData) return;
    this.cartService.addToCart(itemId, quantity, itemData);  
    this.selectedItems = this.cartService.getCartItems();
    this.updateTotal();
    this.selectedItemId = null;
    this.quantity = 1;
  }

  removeFromCart(itemId: number): void  {
    this.cartService.removeFromCart(itemId);
    this.selectedItems = this.cartService.getCartItems();
    this.updateTotal();
  }

  updateTotal(): void  {
    this.totalAmount = this.cartService.getTotalAmount();
  }

  proceedToPayment(): void  {
    this.showPaymentModal = true;
  }

  onConfirmOrder(): void  {
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

  cancelOrder(): void  {
    this.resetOrderForm();
  }

  resetOrderForm(): void  {
    this.cartService.clearCart();
    this.selectedItems = [];
    this.selectedItemId = null;
    this.quantity = 1;
    this.totalAmount = 0;
    this.showPayment = false;
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

  goToDashboard(): void  {
    this.router.navigate(['/dashboard']);
  }
}