import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CategoryService,
  CategoryCreate,
  Category,
} from '../services/category.service';
import {
  TransactionService,
  TransactionCreate,
} from '../services/transaction.service';
import { Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-data-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './data-management.component.html',
  styleUrl: './data-management.component.scss', // This will be an empty file for now
})
export class DataManagementComponent implements OnInit {
  categoryName: string = '';
  categoryType: string = 'Monthly';
  categoryBudgetedAmount: number | null = null;
  categorySuccessMessage: string = '';
  categoryErrorMessage: string = '';

  transactionAmount: number | null = null;
  transactionDescription: string = '';
  transactionDate: string = new Date().toISOString().substring(0, 10);
  selectedCategoryId: string | null = null;
  transactionSuccessMessage: string = '';
  transactionErrorMessage: string = '';

  categories$!: Observable<Category[]>;
  categoryTypes = ['Cash', 'Monthly', 'Savings', 'Transfer'];

  private categoryService = inject(CategoryService);
  private transactionService = inject(TransactionService);
  private router = inject(Router);

  ngOnInit(): void {
    this.categories$ = this.categoryService.getCategories();
  }

  onCreateCategory(): void {
    const newCategory: CategoryCreate = {
      name: this.categoryName,
      type: this.categoryType,
      budgeted_amount: this.categoryBudgetedAmount ?? 0,
    };
    this.categoryService.createCategory(newCategory).subscribe({
      next: (category) => {
        this.categorySuccessMessage = `Category '${category.name}' created successfully!`;
        this.categoryErrorMessage = '';
        this.categories$ = this.categoryService.getCategories(); // Refresh categories
        this.resetCategoryForm();
      },
      error: (err) => {
        this.categoryErrorMessage =
          err.error?.detail || 'Failed to create category.';
        this.categorySuccessMessage = '';
      },
    });
  }

  onEnterTransaction(): void {
    if (!this.selectedCategoryId || this.transactionAmount === null) {
      this.transactionErrorMessage = 'Please fill out all required fields.';
      return;
    }

    const newTransaction: TransactionCreate = {
      category_id: this.selectedCategoryId,
      amount: this.transactionAmount,
      description: this.transactionDescription,
      transaction_date: this.transactionDate,
    };
    this.transactionService.createTransaction(newTransaction).subscribe({
      next: (transaction) => {
        this.transactionSuccessMessage = `Transaction of ₪${transaction.amount} created successfully.`;
        this.transactionErrorMessage = '';
        this.resetTransactionForm();
      },
      error: (err) => {
        this.transactionErrorMessage =
          err.error?.detail || 'Failed to enter transaction.';
        this.transactionSuccessMessage = '';
      },
    });
  }

  private resetCategoryForm(): void {
    this.categoryName = '';
    this.categoryType = 'Monthly';
    this.categoryBudgetedAmount = null;
  }

  private resetTransactionForm(): void {
    this.transactionAmount = null;
    this.transactionDescription = '';
    this.transactionDate = new Date().toISOString().substring(0, 10);
    this.selectedCategoryId = null;
  }
}
