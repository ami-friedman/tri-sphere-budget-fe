import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Account, AccountService } from '../services/account.service';
import { Category, CategoryService, CategoryType } from '../services/category.service';
import { ImportService, PendingTransactionPublic } from '../services/import.service';
import { AgGridAngular } from 'ag-grid-angular';
import {ColDef, GridApi, GridOptions, GridReadyEvent} from 'ag-grid-community';
import { CheckboxCellRenderer } from './checkbox-cell-renderer.component';
import { CategorySelectRenderer } from './category-select-renderer.component';

// UI-specific interface, extending the service interface
interface PendingTransaction extends PendingTransactionPublic {
  selected: boolean;
  assigned_account_id: string | null;
  assigned_category_id: string | null;
}

@Component({
  selector: 'app-import-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe, AgGridAngular],
  templateUrl: './import-transactions.component.html',
})
export class ImportTransactionsComponent implements OnInit {
  private importService = inject(ImportService);
  private accountService = inject(AccountService);
  private categoryService = inject(CategoryService);
  private gridApi!: GridApi;


  activeTab: 'checking' | 'savings' = 'checking';
  pendingTransactions: PendingTransaction[] = [];

  accounts: Account[] = [];
  checkingAccount: Account | undefined;
  savingsAccount: Account | undefined;

  allCategories: Category[] = [];
  checkingCategories: Category[] = [];
  savingsCategories: Category[] = [];

  private refresh$ = new BehaviorSubject<'checking' | 'savings'>('checking');

  colDefs: ColDef[] = [
    { headerName: '', field: 'selected', cellRenderer: CheckboxCellRenderer, headerCheckboxSelection: true, checkboxSelection: true, flex: 0.5, minWidth: 50 },
    { headerName: 'Description', field: 'statement_description', sortable: true, filter: true, flex: 3, minWidth: 200 },
    { headerName: 'Date', field: 'transaction_date', sortable: true, filter: 'agDateColumnFilter', valueFormatter: p => new DatePipe('en-US').transform(p.value, 'longDate') || '', flex: 2, minWidth: 150 },
    { headerName: 'Amount', field: 'amount', sortable: true, filter: 'agNumberColumnFilter', cellStyle: p => p.value >= 0 ? { color: '#22c55e' } : { color: '#ef4444' }, valueFormatter: p => new CurrencyPipe('en-US', 'ILS').transform(p.value) || '', type: 'rightAligned', flex: 1, minWidth: 120 },
    { headerName: 'Assign Category', field: 'assigned_category_id', cellRenderer: CategorySelectRenderer, flex: 3, minWidth: 200 }
  ];

  gridOptions: GridOptions = { context: { componentParent: this }, rowSelection: 'multiple' };

  ngOnInit(): void { this.loadInitialData(); }

  loadInitialData(): void {
    const data$ = this.refresh$.pipe(
      switchMap(activeTab => forkJoin({
        pending: this.importService.getPendingTransactions(activeTab),
        accounts: this.accountService.getAccounts(),
        categories: this.categoryService.getCategories()
      }))
    );
    data$.subscribe(({ pending, accounts, categories }) => {
      this.accounts = accounts;
      this.checkingAccount = accounts.find(a => a.type === 'Checking');
      this.savingsAccount = accounts.find(a => a.type === 'Savings');
      this.allCategories = categories;
      this.checkingCategories = categories.filter(c => c.type === CategoryType.CASH || c.type === CategoryType.MONTHLY);
      this.savingsCategories = categories.filter(c => c.type === CategoryType.SAVINGS);

      const defaultAccountId = this.getAccountIdForTab();
      this.pendingTransactions = pending.map(p => ({
        ...p,
        selected: false,
        assigned_account_id: defaultAccountId,
        assigned_category_id: null,
      }));
    });
  }

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.importService.uploadStatement(file, this.activeTab).subscribe(() => this.refresh$.next(this.activeTab));
    }
  }

  onFinalize(): void {
    const toFinalize = this.pendingTransactions
      .filter(p => p.assigned_category_id && p.assigned_account_id)
      .map(p => ({
        pending_transaction_id: p.id,
        account_id: p.assigned_account_id!,
        category_id: p.assigned_category_id!
      }));

    if (toFinalize.length > 0) {
      this.importService.finalizeTransactions(toFinalize).subscribe(() => this.refresh$.next(this.activeTab));
    }
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }

  onDeleteSelected(): void {
    // Get the selected rows directly from the grid's API
    const selectedNodes = this.gridApi.getSelectedNodes();
    const toDelete = selectedNodes.map(node => node.data.id);

    if (toDelete.length > 0 && confirm(`Are you sure you want to delete ${toDelete.length} selected item(s)?`)) {
      this.importService.ignorePendingTransactions(toDelete).subscribe(() => this.refresh$.next(this.activeTab));
    }
  }

  onClearAll(): void {
    if (this.pendingTransactions.length > 0 && confirm(`Are you sure you want to clear all ${this.pendingTransactions.length} pending transactions?`)) {
      this.importService.clearPendingTransactions(this.activeTab).subscribe(() => this.refresh$.next(this.activeTab));
    }
  }

  get availableCategories(): Category[] {
    return this.activeTab === 'checking' ? this.checkingCategories : this.savingsCategories;
  }

  getAccountIdForTab(): string | null {
    return (this.activeTab === 'checking' ? this.checkingAccount?.id : this.savingsAccount?.id) || null;
  }

  setActiveTab(tab: 'checking' | 'savings'): void {
    this.activeTab = tab;
    this.refresh$.next(tab);
  }
}
