import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService, Category } from '../services/category.service';
import {
  Transaction,
  TransactionService,
} from '../services/transaction.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { TransferModalComponent } from './transfer-modal/transfer-modal.component';

@Component({
  selector: 'app-transfer',
  standalone: true,
  imports: [CommonModule, FormsModule, TransferModalComponent],
  templateUrl: './transfer.component.html',
})
export class TransferComponent implements OnInit {
  transfers$!: Observable<Transaction[]>;
  categories$!: Observable<Category[]>;
  isModalOpen: boolean = false;
  selectedTransferForEdit: Transaction | null = null;

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
  private refreshTransfers$ = new BehaviorSubject<{
    year: number;
    month: number;
  }>({ year: this.selectedYear, month: new Date().getMonth() + 1 });

  ngOnInit(): void {
    this.categories$ = this.categoryService.getCategories();
    this.onMonthChange();

    this.transfers$ = this.refreshTransfers$.pipe(
      switchMap((params) =>
        this.transactionService.getTransfers(params.year, params.month),
      ),
    );
  }

  onMonthChange(): void {
    const monthIndex = this.monthNames.indexOf(this.selectedMonthName);
    this.refreshTransfers$.next({
      year: this.selectedYear,
      month: monthIndex + 1,
    });
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
    transfer: Transaction,
    categories: Category[] | null,
  ): string {
    if (!categories) return 'Loading...';
    const category = categories.find((c) => c.id === transfer.category_id);
    return category ? category.name : 'Unknown';
  }

  openModal(transfer: Transaction | null = null): void {
    this.selectedTransferForEdit = transfer;
    this.isModalOpen = true;
  }

  onTransferSaved(): void {
    this.onMonthChange();
  }

  onDeleteTransfer(transferId: string): void {
    if (confirm('Are you sure you want to delete this transfer?')) {
      this.transactionService.deleteTransfer(transferId).subscribe({
        next: () => {
          this.onMonthChange();
        },
        error: (err) => {
          console.error('Failed to delete transfer', err);
        },
      });
    }
  }
}
