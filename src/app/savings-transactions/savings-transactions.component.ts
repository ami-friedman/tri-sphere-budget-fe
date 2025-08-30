import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, combineLatest, BehaviorSubject, of } from 'rxjs';
import { map, startWith, switchMap, tap, filter } from 'rxjs/operators';
import { TransactionService, TransactionWithCategory, TransactionCreate } from '../services/transaction.service';
import { Category, CategoryService, CategoryType } from '../services/category.service';
import { AccountService } from '../services/account.service';

@Component({
  selector: 'app-savings-transactions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, CurrencyPipe, DatePipe],
  templateUrl: './savings-transactions.component.html',
})
export class SavingsTransactionsComponent implements OnInit {
  private transactionService = inject(TransactionService);
  private categoryService = inject(CategoryService);
  private accountService = inject(AccountService);
  private fb = inject(FormBuilder);

  transactionForm!: FormGroup;
  editingTransactionId: string | null = null;
  savingsAccountId: string | null = null;

  private refreshData$ = new BehaviorSubject<{ year: number; month: number }>({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  });

  allCategories: Category[] = [];
  savingsCategoriesForForm: Category[] = [];
  transactions$!: Observable<TransactionWithCategory[]>;
  totalBalance$: Observable<number> = of(0);

  monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  availableYears = [new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1];
  selectedMonthName: string = this.monthNames[new Date().getMonth()];
  selectedYear: number = new Date().getFullYear();

  ngOnInit(): void {
    this.transactionForm = this.fb.group({
      category_id: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      description: [''],
      // The date field for editing/creating savings expenses
      transaction_date: [new Date().toISOString().split('T')[0], Validators.required]
    });
    this.loadInitialData();
  }

  loadInitialData(): void {
    const accounts$ = this.accountService.getAccounts().pipe(
      tap(accs => {
        const savings = accs.find(a => a.type === 'Savings');
        if (savings) this.savingsAccountId = savings.id;
      })
    );

    const allTransactions$ = combineLatest([this.refreshData$, accounts$]).pipe(
      filter(([_, accs]) => !!this.savingsAccountId),
      switchMap(([params, accs]) => {
        if (!this.savingsAccountId) return of([]);
        return this.transactionService.getTransactions(params.year, params.month, this.savingsAccountId);
      })
    );

    this.totalBalance$ = allTransactions$.pipe(map(txs => txs.reduce((acc, tx) => acc + tx.amount, 0)));

    this.categoryService.getCategories().pipe(
      tap(cats => {
        this.allCategories = cats;
        this.savingsCategoriesForForm = cats.filter(c => c.type === CategoryType.SAVINGS);
      })
    ).subscribe();

    this.transactions$ = combineLatest([allTransactions$.pipe(startWith([])), of(this.allCategories)]).pipe(
      map(([transactions, categories]) => {
        const categoryMap = new Map(this.allCategories.map(c => [c.id, c]));
        // Sort transactions by date, most recent first
        return transactions.map(t => ({ ...t, category: categoryMap.get(t.category_id) } as TransactionWithCategory))
          .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());
      })
    );
  }

  onMonthChange(): void {
    const monthIndex = this.monthNames.indexOf(this.selectedMonthName);
    this.refreshData$.next({ year: this.selectedYear, month: monthIndex + 1 });
  }

  changeMonth(direction: 'prev' | 'next'): void {
    let currentMonthIndex = this.monthNames.indexOf(this.selectedMonthName);
    if (direction === 'next') {
      if (currentMonthIndex === 11) { this.selectedMonthName = this.monthNames[0]; this.selectedYear++; }
      else { this.selectedMonthName = this.monthNames[currentMonthIndex + 1]; }
    } else {
      if (currentMonthIndex === 0) { this.selectedMonthName = this.monthNames[11]; this.selectedYear--; }
      else { this.selectedMonthName = this.monthNames[currentMonthIndex - 1]; }
    }
    this.onMonthChange();
  }

  cancelEdit(): void {
    this.editingTransactionId = null;
    this.transactionForm.reset({
      transaction_date: new Date().toISOString().split('T')[0]
    });
  }

  onEditTransaction(tx: TransactionWithCategory): void {
    this.editingTransactionId = tx.id;
    this.transactionForm.patchValue({
      category_id: tx.category_id,
      amount: Math.abs(tx.amount), // Edit the positive value
      description: tx.description,
      transaction_date: tx.transaction_date
    });
  }

  onDeleteTransaction(tx: TransactionWithCategory): void {
    if (confirm(`Are you sure you want to delete this transaction?\n\n${tx.category?.name}: ${tx.amount}`)) {
      this.transactionService.deleteTransaction(tx.id).subscribe(() => {
        this.onMonthChange();
      });
    }
  }

  onSubmit(): void {
    if (this.transactionForm.invalid || !this.savingsAccountId) return;

    const formValue = this.transactionForm.value;
    // Spending from savings is always a negative amount
    const payload: TransactionCreate = {
      ...formValue,
      account_id: this.savingsAccountId,
      amount: -Math.abs(formValue.amount)
    };

    const apiCall = this.editingTransactionId
      ? this.transactionService.updateTransaction(this.editingTransactionId, payload)
      : this.transactionService.createTransaction(payload);

    apiCall.subscribe(() => { this.onMonthChange(); this.cancelEdit(); });
  }
}
