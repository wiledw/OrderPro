import { Component, OnInit } from '@angular/core';
import { ItemsService } from '../../services/items.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Item {
  name: string;
  price: number;
  description?: string;
}

@Component({
  selector: 'app-items',
  imports: [FormsModule, CommonModule],
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.scss']
})
export class ItemsComponent implements OnInit {
  items: Item[] = [];
  newItem: Item = { name: '', price: 0, description: '' };
  quantity: number = 1;
  sortOrder: 'asc' | 'desc' = 'asc'; 
  currentPage: number = 1;
  totalPages: number = 1;
  successMessage: string = '';
  error: string = '';

  constructor(private itemsService: ItemsService, private router: Router) {}

  ngOnInit() {
    this.loadItems();
  }

  loadItems() {
    this.itemsService.getItems(this.sortOrder, this.currentPage).subscribe({
      next: (res) => {
        if (res.success) {
          this.items = res.data.items.map(item => ({
            ...item,
            price: parseFloat(item.price)
          }));
          this.totalPages = res.data.pagination.total_pages;
        }
      },
      error: (err) => {
        this.error = 'Failed to load items';
        console.error('Error loading items:', err);
      }
    });
  }

  changeSortOrder(event: Event) {
    const target = event.target as HTMLSelectElement; 
    this.sortOrder = target.value as 'asc' | 'desc';
    this.loadItems();
  }

  addItem() {
    this.itemsService.addItem(this.newItem).subscribe({
      next: (response) => {
        this.successMessage = 'Item added successfully!';
        this.loadItems(); // Reload items after adding
        this.newItem = { name: '', price: 0 }; // Reset form
        this.error = ''; // Clear any previous error messages
      },
      error: (error) => {
        this.error = 'Failed to add item';
        console.error('Error adding item:', error);
      }
    });
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.loadItems();
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}