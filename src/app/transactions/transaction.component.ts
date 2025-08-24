import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { map, startWith, switchMap, tap } from 'rxjs/operators';
import { TransactionService, TransactionWithCategory, TransactionCreate } from '../services/transaction.service';
import { Category, CategoryService, CategoryType } from '../services/category.service';
import { Account, AccountService } from '../services/account.service';

type TransactionTab = 'income' | 'cash' | 'monthly' | 'savings';

@Component({
  selector: 'app-transaction',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, CurrencyPipe, DatePipe, TitleCasePipe],
  templateUrl: './transaction.component.html',
})
export class TransactionComponent implements OnInit {
  private transactionService = inject(TransactionService);
  private categoryService = inject(CategoryService);
  private accountService = inject(AccountService);
  private fb = inject(FormBuilder);

  transactionForm!: FormGroup;
  editingTransactionId: string | null = null;

  private refreshData$ = new BehaviorSubject<{ year: number; month: number }>({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  });
  activeTab$ = new BehaviorSubject<TransactionTab>('monthly');

  accounts: Account[] = [];
  allCategories: Category[] = [];
  filteredCategoriesForForm: Category[] = [];
  transactions$!: Observable<TransactionWithCategory[]>;

  monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  availableYears = [new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1];
  selectedMonthName: string = this.monthNames[new Date().getMonth()];
  selectedYear: number = new Date().getFullYear();

  ngOnInit(): void {
    this.transactionForm = this.fb.group({
      account_id: ['', Validators.required],
      category_id: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      description: [''],
    });

    this.loadInitialData();
  }

  loadInitialData(): void {
    this.accountService.getAccounts().subscribe(accs => {
      this.accounts = accs;
      const checkingAccount = this.accounts.find(a => a.type === 'Checking');
      if (checkingAccount) {
        this.transactionForm.patchValue({ account_id: checkingAccount.id });
      }
    });

    const allTransactions$ = this.refreshData$.pipe(
      switchMap(params => this.transactionService.getTransactions(params.year, params.month))
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

  onMonthChange(): void {
    const monthIndex = this.monthNames.indexOf(this.selectedMonthName);
    this.refreshData$.next({ year: this.selectedYear, month: monthIndex + 1 });
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
      account_id: transaction.account_id,
      category_id: transaction.category_id,
      amount: transaction.amount,
      description: transaction.description,
    });
  }

  cancelEdit(): void {
    this.editingTransactionId = null;
    const currentAccountId = this.transactionForm.get('account_id')?.value;
    this.transactionForm.reset({
      account_id: currentAccountId
    });
  }

  onDeleteTransaction(transaction: TransactionWithCategory): void {
    if (confirm(`Are you sure you want to delete this transaction?\n\n${transaction.category?.name}: ${transaction.amount}`)) {
      this.transactionService.deleteTransaction(transaction.id).subscribe(() => {
        this.onMonthChange();
      });
    }
  }

  onSubmit(): void {
    if (this.transactionForm.invalid) return;

    // ** THIS IS THE FIX **
    // Manually construct the date string to avoid timezone issues.
    const monthIndex = this.monthNames.indexOf(this.selectedMonthName) + 1;
    const monthString = monthIndex < 10 ? `0${monthIndex}` : monthIndex;
    const transactionDateString = `${this.selectedYear}-${monthString}-01`;

    const formValue = this.transactionForm.value;
    const payload: TransactionCreate = {
      ...formValue,
      transaction_date: transactionDateString,
    };

    const apiCall = this.editingTransactionId
      ? this.transactionService.updateTransaction(this.editingTransactionId, payload)
      : this.transactionService.createTransaction(payload);

    apiCall.subscribe(() => {
      this.onMonthChange();
      this.cancelEdit();
    });
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
