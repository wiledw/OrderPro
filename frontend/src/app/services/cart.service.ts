import { Injectable } from '@angular/core';
import { Item } from '../models/item.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private items: { id: number; quantity: number; itemData: Item }[] = [];

  addToCart(itemId: number, quantity: number, itemData: Item): void {
    const existingItem = this.items.find(item => item.id === itemId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({ id: itemId, quantity, itemData });
    }
  }

  removeFromCart(itemId: number): void {
    this.items = this.items.filter(cartItem => cartItem.id !== itemId);
  }

  getCartItems(): { id: number; quantity: number; itemData: Item }[] {
    return this.items;
  }

  clearCart(): void {
    this.items = [];
  }

  getTotalAmount(): number {
    return this.items.reduce((sum, item) => {
      return sum + (item.itemData ? parseFloat(item.itemData.price) * item.quantity : 0);
    }, 0);
  }
}