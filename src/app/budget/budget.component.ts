import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService, Category, CategoryType } from '../services/category.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, switchMap, startWith } from 'rxjs/operators';
import { CategoryModalComponent } from './category-modal/category-modal.component';

@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [CommonModule, FormsModule, CategoryModalComponent, TitleCasePipe],
  templateUrl: './budget.component.html',
})
export class BudgetComponent implements OnInit {
  activeTab: 'income' | 'cash' | 'monthly' | 'savings' = 'income';

  private categoryService = inject(CategoryService);
  private refresh$ = new BehaviorSubject<void>(undefined);

  categories$!: Observable<Category[]>;
  filteredCategories$!: Observable<Category[]>;

  isModalOpen: boolean = false;
  selectedCategoryForEdit: Category | null = null;

  ngOnInit(): void {
    this.categories$ = this.refresh$.pipe(
      switchMap(() => this.categoryService.getCategories())
    );
    this.updateFilteredCategories();
  }

  setActiveTab(tab: 'income' | 'cash' | 'monthly' | 'savings'): void {
    this.activeTab = tab;
    this.updateFilteredCategories();
  }

  updateFilteredCategories(): void {
    this.filteredCategories$ = this.categories$.pipe(
      map(categories =>
        categories.filter(c => c.type.toLowerCase() === this.activeTab)
      ),
      startWith([])
    );
  }

  openModal(category: Category | null = null): void {
    this.selectedCategoryForEdit = category;
    this.isModalOpen = true;
  }

  onCategorySaved(): void {
    this.isModalOpen = false;
    this.refresh$.next(); // Trigger a refresh
  }
}
