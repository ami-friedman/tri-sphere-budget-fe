import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Account, AccountService } from '../services/account.service';
import { Category, CategoryService, CategoryType } from '../services/category.service';
import { ImportService, PendingTransactionPublic } from '../services/import.service';

interface PendingTransaction extends PendingTransactionPublic {
  selected: boolean;
  assigned_account_id: string | null;
  assigned_category_id: string | null;
}

@Component({
  selector: 'app-import-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe],
  templateUrl: './import-transactions.component.html',
})
export class ImportTransactionsComponent implements OnInit {
  private importService = inject(ImportService);
  private accountService = inject(AccountService);
  private categoryService = inject(CategoryService);

  activeTab: 'checking' | 'savings' = 'checking';
  pendingTransactions: PendingTransaction[] = [];

  accounts: Account[] = [];
  checkingAccount: Account | undefined;
  savingsAccount: Account | undefined;

  allCategories: Category[] = [];
  checkingCategories: Category[] = [];
  savingsCategories: Category[] = [];

  private refresh$ = new BehaviorSubject<'checking' | 'savings'>('checking');

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    const data$ = this.refresh$.pipe(
      switchMap(activeTab => forkJoin({
        // Point 2: Fetch pending transactions for the active tab ONLY
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

      const defaultAccountId = (this.activeTab === 'checking' ? this.checkingAccount?.id : this.savingsAccount?.id) || null;
      this.pendingTransactions = pending.map(p => ({
        ...p,
        selected: false,
        assigned_account_id: defaultAccountId,
        assigned_category_id: null,
      }));
    });
  }

  onFileChange(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      // Point 2: Tell the backend which tab we're uploading for
      this.importService.uploadStatement(fileList[0], this.activeTab).subscribe(() => {
        this.refresh$.next(this.activeTab);
      });
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
      this.importService.finalizeTransactions(toFinalize).subscribe(() => {
        this.refresh$.next(this.activeTab);
      });
    }
  }

  onIgnoreSelected(): void {
    const toIgnore = this.pendingTransactions.filter(p => p.selected).map(p => p.id);
    if (toIgnore.length > 0) {
      this.importService.ignorePendingTransactions(toIgnore).subscribe(() => {
        this.refresh$.next(this.activeTab);
      });
    }
  }

  // Point 1: Getter to disable the "Finalize" button
  get isFinalizeDisabled(): boolean {
    if (this.pendingTransactions.length === 0) return true;
    // The button is disabled if even ONE transaction is not categorized AND not selected to be ignored.
    return this.pendingTransactions.some(p => !p.assigned_category_id && !p.selected);
  }

  get availableCategories(): Category[] {
    return this.activeTab === 'checking' ? this.checkingCategories : this.savingsCategories;
  }

  setActiveTab(tab: 'checking' | 'savings'): void {
    this.activeTab = tab;
    this.refresh$.next(tab); // Trigger a refresh for the new tab
  }
}
