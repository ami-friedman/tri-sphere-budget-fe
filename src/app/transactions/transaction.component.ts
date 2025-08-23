import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { map, startWith, switchMap, tap } from 'rxjs/operators';
import { TransactionService, TransactionWithCategory } from '../services/transaction.service';
import { Category, CategoryService, CategoryType } from '../services/category.service';

type TransactionTab = 'income' | 'cash' | 'monthly' | 'savings';

@Component({
  selector: 'app-transaction',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, DatePipe],
  templateUrl: './transaction.component.html',
})
export class TransactionComponent implements OnInit {
  private transactionService = inject(TransactionService);
  private categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);

  // --- State Management ---
  transactionForm!: FormGroup;
  editingTransactionId: string | null = null;

  private refresh$ = new BehaviorSubject<void>(undefined);
  // **THIS IS THE FIX**: Removed the 'private' keyword.
  activeTab$ = new BehaviorSubject<TransactionTab>('monthly');

  allCategories: Category[] = [];
  filteredCategoriesForForm: Category[] = [];

  transactions$!: Observable<TransactionWithCategory[]>;

  currentDate = new Date();

  ngOnInit(): void {
    this.transactionForm = this.fb.group({
      category_id: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      transaction_date: [this.formatDate(new Date()), Validators.required],
      description: [''],
    });

    this.loadInitialData();
  }

  loadInitialData(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth() + 1;

    const allTransactions$ = this.refresh$.pipe(
      switchMap(() => this.transactionService.getTransactions(year, month))
    );

    const allCategories$ = this.categoryService.getCategories().pipe(
      tap(cats => this.allCategories = cats)
    );

    this.transactions$ = combineLatest([
      allTransactions$.pipe(startWith([])),
      allCategories$.pipe(startWith([])),
      this.activeTab$
    ]).pipe(
      map(([transactions, categories, activeTab]) => {
        const categoryMap = new Map(categories.map(c => [c.id, c]));

        return transactions
          .map(t => ({ ...t, category: categoryMap.get(t.category_id) }))
          .filter(t => t.category && t.category.type.toLowerCase() === activeTab) as TransactionWithCategory[];
      })
    );

    this.activeTab$.subscribe(tab => {
      this.updateFilteredCategoriesForForm(tab);
      this.cancelEdit();
    });
  }

  updateFilteredCategoriesForForm(tab: TransactionTab): void {
    const typeMap: Record<TransactionTab, CategoryType> = {
      income: CategoryType.INCOME,
      cash: CategoryType.CASH,
      monthly: CategoryType.MONTHLY,
      savings: CategoryType.SAVINGS,
    };
    this.filteredCategoriesForForm = this.allCategories.filter(c => c.type === typeMap[tab]);
  }

  setActiveTab(tab: TransactionTab): void {
    this.activeTab$.next(tab);
  }

  onEditTransaction(transaction: TransactionWithCategory): void {
    this.editingTransactionId = transaction.id;
    this.transactionForm.patchValue({
      category_id: transaction.category_id,
      amount: transaction.amount,
      transaction_date: transaction.transaction_date,
      description: transaction.description,
    });
  }

  cancelEdit(): void {
    this.editingTransactionId = null;
    this.transactionForm.reset({
      transaction_date: this.formatDate(new Date())
    });
  }

  onDeleteTransaction(transaction: TransactionWithCategory): void {
    if (confirm(`Are you sure you want to delete this transaction?\n\n${transaction.category?.name}: ${transaction.amount}`)) {
      this.transactionService.deleteTransaction(transaction.id).subscribe(() => {
        this.refresh$.next();
      });
    }
  }

  onSubmit(): void {
    if (this.transactionForm.invalid) return;

    const formValue = this.transactionForm.value;
    const apiCall = this.editingTransactionId
      ? this.transactionService.updateTransaction(this.editingTransactionId, formValue)
      : this.transactionService.createTransaction(formValue);

    apiCall.subscribe(() => {
      this.refresh$.next();
      this.cancelEdit();
    });
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
