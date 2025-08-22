import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService, CategoryCreate } from '../services/category.service';
import { Observable } from 'rxjs';
import { Category } from '../services/category.service';

@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './budget.component.html',
})
export class BudgetComponent implements OnInit {
  categoryName: string = '';
  categoryType: string = 'Monthly';
  categoryBudgetedAmount: number | null = null;
  categorySuccessMessage: string = '';
  categoryErrorMessage: string = '';

  categories$!: Observable<Category[]>;
  categoryTypes = ['Cash', 'Monthly', 'Savings', 'Transfer'];

  private categoryService = inject(CategoryService);

  ngOnInit(): void {
    this.categories$ = this.categoryService.getCategories();
  }

  onCreateCategory(): void {
    const newCategory: CategoryCreate = {
      name: this.categoryName,
      type: this.categoryType,
      budgeted_amount: this.categoryBudgetedAmount ?? 0,
    };
    this.categoryService.createCategory(newCategory).subscribe({
      next: (category) => {
        this.categorySuccessMessage = `Category '${category.name}' created successfully!`;
        this.categoryErrorMessage = '';
        this.categories$ = this.categoryService.getCategories(); // Refresh categories
        this.resetCategoryForm();
      },
      error: (err) => {
        this.categoryErrorMessage =
          err.error?.detail || 'Failed to create category.';
        this.categorySuccessMessage = '';
      },
    });
  }

  private resetCategoryForm(): void {
    this.categoryName = '';
    this.categoryType = 'Monthly';
    this.categoryBudgetedAmount = null;
  }
}
