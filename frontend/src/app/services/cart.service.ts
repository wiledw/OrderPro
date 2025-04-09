import { Injectable } from '@angular/core';
import { Item } from '../models/item.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private items: { id: number; quantity: number; itemData: Item }[] = [];

  addToCart(itemId: number, quantity: number, itemData: Item) {
    const existing = this.items.find(item => item.id === itemId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.items.push({ id: itemId, quantity, itemData });
    }
  }

  removeFromCart(itemId: number) {
    this.items = this.items.filter(cart => cart.id !== itemId); // Remove item from cart
  }

  getCartItems() {
    return this.items;
  }

  clearCart() {
    this.items = []; // Clear the cart
  }

  getTotalAmount(): number {
    return this.items.reduce((sum, item) => {
      return sum + (item.itemData ? parseFloat(item.itemData.price) * item.quantity : 0);
    }, 0);
  }
}