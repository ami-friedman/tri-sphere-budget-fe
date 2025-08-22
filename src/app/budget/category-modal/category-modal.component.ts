import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Category,
  CategoryCreate,
  CategoryUpdate,
  CategoryService,
} from '../../services/category.service';

@Component({
  selector: 'app-category-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category-modal.component.html',
})
export class CategoryModalComponent {
  // Inputs and Outputs
  category = input<Category | null>(null);
  activeTab = input<'monthly' | 'savings' | 'cash'>('monthly');
  closeModal = output<void>();
  categorySaved = output<void>();

  // Form State
  categoryName: string = '';
  categoryType: string = '';
  categoryBudgetedAmount: number | null = null;
  errorMessage: string = '';
  isEditMode: boolean = false;

  categoryTypes = ['Cash', 'Monthly', 'Savings', 'Transfer'];

  private categoryService = inject(CategoryService);

  ngOnInit(): void {
    const currentCategory = this.category();
    this.isEditMode = !!currentCategory;

    if (this.isEditMode && currentCategory) {
      this.categoryName = currentCategory.name;
      this.categoryType = currentCategory.type;
      this.categoryBudgetedAmount = currentCategory.budgeted_amount;
    } else {
      this.categoryType =
        this.activeTab() === 'monthly'
          ? 'Monthly'
          : this.activeTab() === 'savings'
            ? 'Savings'
            : 'Cash';
      this.categoryBudgetedAmount = 0;
    }
  }

  onSaveCategory(): void {
    if (this.isEditMode) {
      this.updateCategory();
    } else {
      this.createCategory();
    }
  }

  createCategory(): void {
    const newCategory: CategoryCreate = {
      name: this.categoryName,
      type: this.categoryType,
      budgeted_amount: this.categoryBudgetedAmount ?? 0,
    };
    this.categoryService.createCategory(newCategory).subscribe({
      next: () => {
        this.categorySaved.emit();
        this.closeModal.emit();
      },
      error: (err) => {
        this.errorMessage = err.error?.detail || 'Failed to create category.';
      },
    });
  }

  updateCategory(): void {
    const categoryToUpdate: CategoryUpdate = {
      name: this.categoryName,
      type: this.categoryType,
      budgeted_amount: this.categoryBudgetedAmount ?? 0,
    };

    if (this.category()) {
      this.categoryService
        .updateCategory(this.category()!.id, categoryToUpdate)
        .subscribe({
          next: () => {
            this.categorySaved.emit();
            this.closeModal.emit();
          },
          error: (err) => {
            this.errorMessage =
              err.error?.detail || 'Failed to update category.';
          },
        });
    }
  }

  onClose(): void {
    this.closeModal.emit();
  }
}
