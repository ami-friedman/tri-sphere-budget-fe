import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, combineLatest, BehaviorSubject, of, forkJoin } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { TransactionService, TransactionWithCategory, TransactionCreate } from '../services/transaction.service';
import { Category, CategoryService, CategoryType } from '../services/category.service';
import { AccountService } from '../services/account.service';

import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions } from 'ag-grid-community';
import { ActionsCellRenderer } from './actions-cell-renderer.component';

type TransactionTab = 'income' | 'cash' | 'monthly' | 'savings';

@Component({
  selector: 'app-transaction',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, CurrencyPipe, DatePipe, AgGridAngular, ActionsCellRenderer],
  templateUrl: './transaction.component.html',
})
export class TransactionComponent implements OnInit {
  private transactionService = inject(TransactionService);
  private categoryService = inject(CategoryService);
  private accountService = inject(AccountService);
  private fb = inject(FormBuilder);

  transactionForm!: FormGroup;
  editingTransactionId: string | null = null;
  checkingAccountId: string | null = null;

  private refreshData$ = new BehaviorSubject<{ year: number; month: number }>({ year: new Date().getFullYear(), month: new Date().getMonth() + 1 });
  activeTab$ = new BehaviorSubject<TransactionTab>('monthly');

  allCategories: Category[] = [];
  filteredCategoriesForForm: Category[] = [];
  transactions$!: Observable<TransactionWithCategory[]>;

  colDefs: ColDef[] = [
    {
      headerName: 'Date',
      field: 'transaction_date',
      sortable: true,
      filter: 'agDateColumnFilter',
      valueFormatter: p => new DatePipe('en-US').transform(p.value, 'longDate') || '',
      flex: 2
    },
    {
      headerName: 'Category',
      field: 'category.name',
      sortable: true,
      filter: true,
      flex: 2
    },
    {
      headerName: 'Description',
      field: 'description',
      sortable: true,
      filter: true,
      flex: 3
    },
    {
      headerName: 'Amount',
      field: 'amount',
      sortable: true,
      filter: 'agNumberColumnFilter',
      cellStyle: params => params.value >= 0 ? { color: '#22c55e' } : { color: '#ef4444' }, // Green for income, red for expense
      valueFormatter: p => new CurrencyPipe('en-US', 'ILS').transform(p.value) || '',
      type: 'rightAligned',
      flex: 1
    },
    {
      headerName: 'Actions',
      cellRenderer: ActionsCellRenderer,
      colId: 'actions',
      flex: 1
    }
  ];

  gridOptions: GridOptions = {
    context: {
      componentParent: this
    }
  };

  monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  availableYears = [new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1];
  selectedMonthName: string = this.monthNames[new Date().getMonth()];
  selectedYear: number = new Date().getFullYear();

  ngOnInit(): void {
    this.transactionForm = this.fb.group({
      category_id: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      description: [''],
    });
    this.loadInitialData();
  }

  loadInitialData(): void {
    // ** SIMPLIFIED: No need to subscribe here, the grid will handle it **
    forkJoin({
      accounts: this.accountService.getAccounts(),
      categories: this.categoryService.getCategories()
    }).subscribe(({ accounts, categories }) => {
      this.allCategories = categories;
      const checkingAccount = accounts.find(a => a.type === 'Checking');
      if (checkingAccount) {
        this.checkingAccountId = checkingAccount.id;
        this.setupTransactionObservable();
        this.activeTab$.next(this.activeTab$.value); // Trigger initial filter
      }
    });
  }

  setupTransactionObservable(): void {
    const allTransactions$ = this.refreshData$.pipe(
      switchMap(params => {
        if (!this.checkingAccountId) return of([]);
        return this.transactionService.getTransactions(params.year, params.month, this.checkingAccountId);
      })
    );

    this.transactions$ = combineLatest([allTransactions$, this.activeTab$]).pipe(
      map(([transactions, activeTab]) => {
        const categoryMap = new Map(this.allCategories.map(c => [c.id, c]));
        return transactions
          .map(t => ({ ...t, category: categoryMap.get(t.category_id) }))
          .filter(t => t.category && t.category.type.toLowerCase() === activeTab) as TransactionWithCategory[];
      })
    );

    this.activeTab$.subscribe(tab => this.updateFilteredCategoriesForForm(tab));
  }

  setupObservables(): void {
    const allTransactions$ = this.refreshData$.pipe(
      switchMap(params => {
        if (!this.checkingAccountId) return of([]);
        return this.transactionService.getTransactions(params.year, params.month, this.checkingAccountId);
      })
    );

    this.transactions$ = combineLatest([
      allTransactions$.pipe(startWith([])),
      this.activeTab$
    ]).pipe(
      map(([transactions, activeTab]) => {
        const categoryMap = new Map(this.allCategories.map(c => [c.id, c]));
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

  onMonthChange(): void { this.refreshData$.next({ year: this.selectedYear, month: this.monthNames.indexOf(this.selectedMonthName) + 1 }); }

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

  setActiveTab(tab: TransactionTab): void { this.activeTab$.next(tab); }

  onEditTransaction(tx: TransactionWithCategory): void {
    this.editingTransactionId = tx.id;
    this.transactionForm.patchValue({
      category_id: tx.category_id,
      amount: Math.abs(tx.amount),
      description: tx.description
    });
  }

  cancelEdit(): void { this.editingTransactionId = null; this.transactionForm.reset(); }

  onDeleteTransaction(tx: TransactionWithCategory): void {
    if (confirm(`Are you sure you want to delete this transaction?`)) {
      this.transactionService.deleteTransaction(tx.id).subscribe(() => this.onMonthChange());
    }
  }

  onSubmit(): void {
    if (this.transactionForm.invalid || !this.checkingAccountId) return;
    const monthIndex = this.monthNames.indexOf(this.selectedMonthName) + 1;
    const dateStr = `${this.selectedYear}-${String(monthIndex).padStart(2, '0')}-01`;
    const payload: TransactionCreate = { ...this.transactionForm.value, transaction_date: dateStr, account_id: this.checkingAccountId };
    const apiCall = this.editingTransactionId ? this.transactionService.updateTransaction(this.editingTransactionId, payload) : this.transactionService.createTransaction(payload);
    apiCall.subscribe(() => { this.onMonthChange(); this.cancelEdit(); });
  }

  onFundSavings(): void {
    if (confirm(`Fund savings goals for ${this.selectedMonthName} ${this.selectedYear}?`)) {
      this.transactionService.fundSavingsFromBudget(this.selectedYear, this.monthNames.indexOf(this.selectedMonthName) + 1)
        .subscribe(res => { alert(res.message); this.onMonthChange(); });
    }
  }
}
