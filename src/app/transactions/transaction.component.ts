import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { Transaction, TransactionService, TransactionWithCategory } from '../services/transaction.service';
import { Category, CategoryService, CategoryType } from '../services/category.service';

@Component({
  selector: 'app-transaction',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, DatePipe, TitleCasePipe],
  templateUrl: './transaction.component.html',
})
export class TransactionComponent implements OnInit {
  activeTab: 'income' | 'expenses' = 'expenses';

  private transactionService = inject(TransactionService);
  private categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);
  private refresh$ = new BehaviorSubject<void>(undefined);

  transactionForm!: FormGroup;
  editingTransactionId: string | null = null;

  allCategories: Category[] = [];
  filteredCategories: Category[] = [];
  filteredTransactions$!: Observable<TransactionWithCategory[]>;

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

    const transactions$ = this.refresh$.pipe(
      switchMap(() => this.transactionService.getTransactions(year, month))
    );

    this.categoryService.getCategories().subscribe(cats => {
      this.allCategories = cats;
      this.setActiveTab(this.activeTab);
    });

    this.filteredTransactions$ = combineLatest([
      transactions$.pipe(startWith([])),
      this.categoryService.getCategories().pipe(startWith([]))
    ]).pipe(
      map(([transactions, categories]) => {
        const categoryMap = new Map(categories.map(c => [c.id, c]));
        return transactions.map(t => ({
          ...t,
          category: categoryMap.get(t.category_id)
        })).filter(t => t.category) as TransactionWithCategory[];
      })
    );
  }

  setActiveTab(tab: 'income' | 'expenses'): void {
    this.activeTab = tab;
    if (tab === 'income') {
      this.filteredCategories = this.allCategories.filter(c => c.type === CategoryType.INCOME);
    } else {
      this.filteredCategories = this.allCategories.filter(c =>
        c.type !== CategoryType.INCOME && c.type !== CategoryType.TRANSFER
      );
    }
    this.cancelEdit();
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
