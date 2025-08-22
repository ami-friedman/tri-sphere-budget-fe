import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CategoryService,
  CategoryCreate,
  Category,
} from '../services/category.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './budget.component.html',
})
export class BudgetComponent implements OnInit {
  activeTab: 'monthly' | 'savings' | 'cash' = 'monthly';
  categoryName: string = '';
  categoryBudgetedAmount: number | null = null;
  categorySuccessMessage: string = '';
  categoryErrorMessage: string = '';

  categories$!: Observable<Category[]>;
  filteredCategories$!: Observable<Category[]>;

  private categoryService = inject(CategoryService);

  ngOnInit(): void {
    this.categories$ = this.categoryService.getCategories();
    this.updateFilteredCategories();
  }

  setActiveTab(tab: 'monthly' | 'savings' | 'cash'): void {
    this.activeTab = tab;
    this.updateFilteredCategories();
    this.resetForm();
  }

  updateFilteredCategories(): void {
    this.filteredCategories$ = this.categories$.pipe(
      map((categories) =>
        categories.filter((c) => c.type.toLowerCase() === this.activeTab),
      ),
    );
  }

  onCreateCategory(): void {
    const newCategory: CategoryCreate = {
      name: this.categoryName,
      type:
        this.activeTab === 'monthly'
          ? 'Monthly'
          : this.activeTab === 'savings'
            ? 'Savings'
            : 'Cash',
      budgeted_amount: this.categoryBudgetedAmount ?? 0,
    };
    this.categoryService.createCategory(newCategory).subscribe({
      next: (category) => {
        this.categorySuccessMessage = `Category '${category.name}' created successfully!`;
        this.categoryErrorMessage = '';
        this.categories$ = this.categoryService.getCategories(); // Refresh all categories
        this.updateFilteredCategories(); // Filter the new data
        this.resetForm();
      },
      error: (err) => {
        this.categoryErrorMessage =
          err.error?.detail || 'Failed to create category.';
        this.categorySuccessMessage = '';
      },
    });
  }

  private resetForm(): void {
    this.categoryName = '';
    this.categoryBudgetedAmount = null;
    this.categorySuccessMessage = '';
    this.categoryErrorMessage = '';
  }
}
