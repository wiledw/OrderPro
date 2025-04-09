import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Item } from '../../models/item.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-modal',
  imports: [FormsModule, CommonModule],
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.scss']
})
export class PaymentModalComponent {
  @Input() selectedItems: { id: number; quantity: number; itemData: Item }[] = [];
  @Input() totalAmount: number = 0;
  @Output() close = new EventEmitter<void>();
  @Output() confirmOrder = new EventEmitter<void>();

  cardHolder: string = '';
  cardNumber: string = '';
  cardExpMonth: string = '';
  cardExpYear: string = '';
  cardCvv: string = '';

  onConfirm() {
    const isCardValid = this.cardHolder && this.cardNumber && this.cardExpMonth && this.cardExpYear && this.cardCvv;
    if (!isCardValid) {
      alert('Please complete all payment fields.');
      return;
    }
    this.confirmOrder.emit(); // Emit event to confirm order
    this.closeModal(); // Close the modal
  }

  closeModal() {
    this.close.emit(); // Emit event to close modal
  }
}