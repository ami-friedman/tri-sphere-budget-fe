import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService, Category } from '../services/category.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CategoryModalComponent } from './category-modal/category-modal.component';

@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [CommonModule, FormsModule, CategoryModalComponent],
  templateUrl: './budget.component.html',
})
export class BudgetComponent implements OnInit {
  activeTab: 'cash' | 'monthly' | 'savings' = 'cash';

  categories$!: Observable<Category[]>;
  filteredCategories$!: Observable<Category[]>;

  isModalOpen: boolean = false;
  selectedCategoryForEdit: Category | null = null;

  private categoryService = inject(CategoryService);

  ngOnInit(): void {
    this.fetchCategories();
  }

  fetchCategories(): void {
    this.categories$ = this.categoryService.getCategories();
    this.updateFilteredCategories();
  }

  setActiveTab(tab: 'cash' | 'monthly' | 'savings'): void {
    this.activeTab = tab;
    this.updateFilteredCategories();
  }

  updateFilteredCategories(): void {
    this.filteredCategories$ = this.categories$.pipe(
      map((categories) =>
        categories.filter((c) => c.type.toLowerCase() === this.activeTab),
      ),
    );
  }

  openModal(category: Category | null = null): void {
    this.selectedCategoryForEdit = category;
    this.isModalOpen = true;
  }

  onCategorySaved(): void {
    this.fetchCategories();
  }
}
