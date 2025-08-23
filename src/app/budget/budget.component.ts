import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService, Category } from '../services/category.service';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, switchMap, startWith, catchError } from 'rxjs/operators';
import { CategoryModalComponent } from './category-modal/category-modal.component';
import { HttpErrorResponse } from '@angular/common/http';

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
    this.refresh$.next();
  }

  onDeleteCategory(category: Category): void {
    if (confirm(`Are you sure you want to delete the category "${category.name}"? This cannot be undone.`)) {
      this.categoryService.deleteCategory(category.id).pipe(
        catchError((err: HttpErrorResponse) => {
          if (err.status === 409) {
            alert(err.error.detail);
          } else {
            alert('An unexpected error occurred. Please try again.');
          }
          return of(null);
        })
      ).subscribe(result => {
        if (result !== null) {
          this.refresh$.next();
        }
      });
    }
  }
}
