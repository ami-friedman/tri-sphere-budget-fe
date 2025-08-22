import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService, Category } from '../services/category.service';
import {
  Transaction,
  TransactionService,
} from '../services/transaction.service';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
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
  filteredTransactions$!: Observable<Transaction[]>;
  isModalOpen: boolean = false;
  selectedTransactionForEdit: Transaction | null = null;
  activeTab: 'cash' | 'monthly' | 'savings' = 'cash';

  monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  selectedMonthName: string = this.monthNames[new Date().getMonth()];
  selectedYear: number = new Date().getFullYear();

  private categoryService = inject(CategoryService);
  private transactionService = inject(TransactionService);
  private refreshTransactions$ = new BehaviorSubject<{
    year: number;
    month: number;
  }>({ year: this.selectedYear, month: new Date().getMonth() + 1 });

  ngOnInit(): void {
    this.categories$ = this.categoryService.getCategories();
    this.onMonthChange();

    this.transactions$ = this.refreshTransactions$.pipe(
      switchMap((params) =>
        this.transactionService.getTransactions(params.year, params.month),
      ),
    );

    this.filteredTransactions$ = combineLatest([
      this.transactions$,
      this.categories$,
    ]).pipe(
      map(([transactions, categories]) => {
        const categoryMap = new Map(categories.map((c) => [c.id, c.type]));
        return transactions.filter((t) => {
          const categoryType = categoryMap.get(t.category_id);
          return categoryType?.toLowerCase() === this.activeTab;
        });
      }),
    );
  }

  onMonthChange(): void {
    const monthIndex = this.monthNames.indexOf(this.selectedMonthName);
    this.refreshTransactions$.next({
      year: this.selectedYear,
      month: monthIndex + 1,
    });
  }

  setActiveTab(tab: 'cash' | 'monthly' | 'savings'): void {
    this.activeTab = tab;
    // We need to re-trigger the filtering when the tab changes.
    // A simple way is to re-combine the latest values.
    this.filteredTransactions$ = combineLatest([
      this.transactions$,
      this.categories$,
    ]).pipe(
      map(([transactions, categories]) => {
        const categoryMap = new Map(categories.map((c) => [c.id, c.type]));
        return transactions.filter((t) => {
          const categoryType = categoryMap.get(t.category_id);
          return categoryType?.toLowerCase() === this.activeTab;
        });
      }),
    );
  }

  changeMonth(direction: 'prev' | 'next'): void {
    let currentMonthIndex = this.monthNames.indexOf(this.selectedMonthName);
    if (direction === 'next') {
      if (currentMonthIndex === 11) {
        this.selectedMonthName = this.monthNames[0];
        this.selectedYear++;
      } else {
        this.selectedMonthName = this.monthNames[currentMonthIndex + 1];
      }
    } else {
      if (currentMonthIndex === 0) {
        this.selectedMonthName = this.monthNames[11];
        this.selectedYear--;
      } else {
        this.selectedMonthName = this.monthNames[currentMonthIndex - 1];
      }
    }
    this.onMonthChange();
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
    this.onMonthChange();
  }

  onDeleteTransaction(transactionId: string): void {
    if (confirm('Are you sure you want to delete this transaction?')) {
      this.transactionService.deleteTransaction(transactionId).subscribe({
        next: () => {
          this.onMonthChange();
        },
        error: (err) => {
          console.error('Failed to delete transaction', err);
        },
      });
    }
  }
}
