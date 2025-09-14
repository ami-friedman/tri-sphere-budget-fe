import { Component, ElementRef, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Category, CategoryCreate, CategoryService, CategoryType, CategoryUpdate } from '../../services/category.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-category-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TitleCasePipe],
  templateUrl: './category-modal.component.html',
})
export class CategoryModalComponent implements OnInit, OnDestroy {
  @Input() category: Category | null = null;
  @Input() activeTab: 'income' | 'cash' | 'monthly' | 'savings' = 'income';

  @Output() closeModal = new EventEmitter<void>();
  @Output() categorySaved = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);

  categoryForm!: FormGroup;
  isEditMode = false;
  errorMessage: string | null = null;
  private formChangesSubscription!: Subscription;

  ngOnInit(): void {
    this.isEditMode = !!this.category;
    const categoryType = new TitleCasePipe().transform(this.activeTab) as CategoryType;

    this.categoryForm = this.fb.group({
      name: [this.category?.name || '', Validators.required],
      budgeted_amount: [this.category?.budgeted_amount || 0.00, Validators.min(0)],
      type: [this.category?.type || categoryType, Validators.required],
    });

    this.formChangesSubscription = this.categoryForm.valueChanges.subscribe(() => {
      this.errorMessage = null;
    });
  }

  // **NEW METHOD** to handle backdrop clicks cleanly
  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal.emit();
    }
  }

  ngOnDestroy(): void {
    if (this.formChangesSubscription) {
      this.formChangesSubscription.unsubscribe();
    }
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      return;
    }
    this.errorMessage = null;

    const formValue = this.categoryForm.value;
    const payload: CategoryCreate | CategoryUpdate = {
      name: formValue.name,
      budgeted_amount: formValue.budgeted_amount,
      type: formValue.type as CategoryType,
    };

    const apiCall = this.isEditMode && this.category
      ? this.categoryService.updateCategory(this.category.id, payload)
      : this.categoryService.createCategory(payload as CategoryCreate);

    apiCall.subscribe({
      next: () => {
        this.categorySaved.emit();
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 409) {
          this.errorMessage = `A category named "${payload.name}" already exists.`;
        } else {
          this.errorMessage = 'An unexpected error occurred. Please try again.';
        }
      }
    });
  }
}
