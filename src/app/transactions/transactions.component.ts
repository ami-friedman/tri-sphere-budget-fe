import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService, Category } from '../services/category.service';
import {
  TransactionService,
  TransactionCreate,
} from '../services/transaction.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-transaction',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transactions.component.html',
})
export class TransactionsComponent implements OnInit {
  transactionAmount: number | null = null;
  transactionDescription: string = '';
  transactionDate: string = new Date().toISOString().substring(0, 10);
  selectedCategoryId: string | null = null;
  transactionSuccessMessage: string = '';
  transactionErrorMessage: string = '';

  categories$!: Observable<Category[]>;

  private categoryService = inject(CategoryService);
  private transactionService = inject(TransactionService);

  ngOnInit(): void {
    this.categories$ = this.categoryService.getCategories();
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

  private resetTransactionForm(): void {
    this.transactionAmount = null;
    this.transactionDescription = '';
    this.transactionDate = new Date().toISOString().substring(0, 10);
    this.selectedCategoryId = null;
  }
}
