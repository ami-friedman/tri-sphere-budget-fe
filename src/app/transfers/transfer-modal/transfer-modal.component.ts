import { Component, inject, Input, OnInit, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category, CategoryService } from '../../services/category.service';
import { Transaction, TransactionService, TransferCreate, TransferUpdate } from '../../services/transaction.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-transfer-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transfer-modal.component.html',
})
export class TransferModalComponent implements OnInit {
  @Input() transfer: Transaction | null = null;
  transferSaved = output<void>();
  closeModal = output<void>();

  transferAmount: number | null = null;
  transferDescription: string = '';
  selectedCategoryId: string | null = null;
  errorMessage: string = '';
  isEditMode: boolean = false;

  savingsCategories$!: Observable<Category[]>;
  private categoryService = inject(CategoryService);
  private transactionService: TransactionService = inject(TransactionService);

  ngOnInit(): void {
    this.savingsCategories$ = this.categoryService.getCategories().pipe(
      map((categories: Category[]) => categories.filter((c: Category) => c.type === 'Savings')),
    );

    const currentTransfer = this.transfer;
    this.isEditMode = !!currentTransfer;

    if (this.isEditMode && currentTransfer) {
      this.transferAmount = currentTransfer.amount;
      this.transferDescription = currentTransfer.description ?? '';
      this.selectedCategoryId = currentTransfer.category_id;
    } else {
      this.transferAmount = null;
      this.transferDescription = '';
      this.selectedCategoryId = null;
    }
  }

  onSaveTransfer(): void {
    if (this.isEditMode) {
      this.updateTransfer();
    } else {
      this.createTransfer();
    }
  }

  createTransfer(): void {
    const newTransfer: TransferCreate = {
      category_id: this.selectedCategoryId!,
      amount: this.transferAmount!,
      description: this.transferDescription,
      transaction_date: new Date().toISOString().substring(0, 10),
    };
    this.transactionService.createTransfer(newTransfer).subscribe({
      next: () => {
        this.transferSaved.emit();
        this.closeModal.emit();
      },
      error: (err: any) => {
        this.errorMessage = err.error?.detail || 'Failed to create transfer.';
      },
    });
  }

  updateTransfer(): void {
    const transferToUpdate: TransferUpdate = {
      category_id: this.selectedCategoryId ?? undefined,
      amount: this.transferAmount ?? undefined,
      description: this.transferDescription,
      transaction_date: new Date().toISOString().substring(0, 10),
    };

    if (this.transfer) {
      this.transactionService
        .updateTransfer(this.transfer.id, transferToUpdate)
        .subscribe({
          next: () => {
            this.transferSaved.emit();
            this.closeModal.emit();
          },
          error: (err: any) => {
            this.errorMessage =
              err.error?.detail || 'Failed to update transfer.';
          },
        });
    }
  }

  onClose(): void {
    this.closeModal.emit();
  }
}
