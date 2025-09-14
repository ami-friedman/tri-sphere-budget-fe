import { Component, inject, input, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Transaction,
  TransactionCreate,
  TransactionUpdate,
  TransactionService,
} from '../../services/transaction.service';
import { Category, CategoryService } from '../../services/category.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-transaction-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction-modal.component.html',
})
export class TransactionModalComponent implements OnInit {
  transaction = input<Transaction | null>(null);
  closeModal = output<void>();
  transactionSaved = output<void>();

  transactionAmount: number | null = null;
  transactionDescription: string = '';
  transactionDate: string = '';
  selectedCategoryId: string | null = null;
  errorMessage: string = '';
  isEditMode: boolean = false;

  categories$!: Observable<Category[]>;
  private transactionService = inject(TransactionService);
  private categoryService = inject(CategoryService);

  ngOnInit(): void {
    this.categories$ = this.categoryService.getCategories();
    const currentTransaction = this.transaction();
    this.isEditMode = !!currentTransaction;

    if (this.isEditMode && currentTransaction) {
      this.transactionAmount = currentTransaction.amount;
      this.transactionDescription = currentTransaction.description ?? '';
      this.transactionDate = currentTransaction.transaction_date;
      this.selectedCategoryId = currentTransaction.category_id;
    } else {
      this.transactionDate = new Date().toISOString().substring(0, 10);
    }
  }

  onSaveTransaction(): void {
    if (this.isEditMode) {
      this.updateTransaction();
    } else {
      this.createTransaction();
    }
  }

  createTransaction(): void {
    const newTransaction: TransactionCreate = {
      category_id: this.selectedCategoryId!,
      amount: this.transactionAmount!,
      description: this.transactionDescription,
      transaction_date: this.transactionDate,
    };
    this.transactionService.createTransaction(newTransaction).subscribe({
      next: () => {
        this.transactionSaved.emit();
        this.closeModal.emit();
      },
      error: (err) => {
        this.errorMessage =
          err.error?.detail || 'Failed to create transaction.';
      },
    });
  }

  updateTransaction(): void {
    const transactionToUpdate: TransactionUpdate = {
      category_id: this.selectedCategoryId ?? undefined,
      amount: this.transactionAmount ?? undefined,
      description: this.transactionDescription,
      transaction_date: this.transactionDate,
    };

    if (this.transaction()) {
      this.transactionService
        .updateTransaction(this.transaction()!.id, transactionToUpdate)
        .subscribe({
          next: () => {
            this.transactionSaved.emit();
            this.closeModal.emit();
          },
          error: (err) => {
            this.errorMessage =
              err.error?.detail || 'Failed to update transaction.';
          },
        });
    }
  }

  onClose(): void {
    this.closeModal.emit();
  }
}
