import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService, Category } from '../services/category.service';
import {
  Transaction,
  TransactionService,
} from '../services/transaction.service';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { TransactionModalComponent } from './transaction-modal/transaction-modal.component';

@Component({
  selector: 'app-transaction',
  standalone: true,
  imports: [CommonModule, FormsModule, TransactionModalComponent],
  templateUrl: './transaction.component.html',
})
export class TransactionComponent implements OnInit {
  transactions$!: Observable<Transaction[]>;
  categories$!: Observable<Category[]>;
  isModalOpen: boolean = false;
  selectedTransactionForEdit: Transaction | null = null;

  private categoryService = inject(CategoryService);
  private transactionService = inject(TransactionService);
  private refreshTransactions$ = new BehaviorSubject<void>(undefined);

  ngOnInit(): void {
    this.categories$ = this.categoryService.getCategories();

    this.transactions$ = this.refreshTransactions$.pipe(
      switchMap(() => this.transactionService.getTransactions()),
    );

    // This line triggers the initial data fetch
    this.refreshTransactions$.next(undefined);
  }

  getCategoryName(
    transaction: Transaction,
    categories: Category[] | null,
  ): string {
    if (!categories) return 'Loading...';
    const category = categories.find((c) => c.id === transaction.category_id);
    return category ? category.name : 'Unknown';
  }

  openModal(transaction: Transaction | null = null): void {
    this.selectedTransactionForEdit = transaction;
    this.isModalOpen = true;
  }

  onTransactionSaved(): void {
    this.refreshTransactions$.next(undefined);
  }

  onDeleteTransaction(transactionId: string): void {
    if (confirm('Are you sure you want to delete this transaction?')) {
      this.transactionService.deleteTransaction(transactionId).subscribe({
        next: () => {
          this.refreshTransactions$.next(undefined);
        },
        error: (err) => {
          console.error('Failed to delete transaction', err);
        },
      });
    }
  }
}
