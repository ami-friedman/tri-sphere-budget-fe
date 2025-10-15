import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService, Category } from '../services/category.service';
import { Observable, BehaviorSubject, of, forkJoin, combineLatest } from 'rxjs';
import { map, switchMap, startWith, catchError } from 'rxjs/operators';
import { CategoryModalComponent } from './category-modal/category-modal.component';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions } from 'ag-grid-community';
import { CategoryActionsRenderer } from './category-actions-renderer.component';
import { BudgetApiService } from './data-access/budget-api.service';
import { CategoryType } from '../services/category.service';

interface BudgetSummary { income: number; monthly: number; cash: number; savings: number; }
type BudgetTab = 'income' | 'cash' | 'monthly' | 'savings';

@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [CommonModule, FormsModule, CategoryModalComponent, CurrencyPipe, AgGridAngular],
  templateUrl: './budget.component.html',
})
export class BudgetComponent implements OnInit {
  // --- Services ---
  private categoryService = inject(CategoryService);
  private budgetApiService = inject(BudgetApiService);
  private http = inject(HttpClient);
  private baseUrl = environment.baseUrl;

  // --- State Management ---
  private refresh$ = new BehaviorSubject<void>(undefined);
  activeTab$ = new BehaviorSubject<BudgetTab>('income');
  isModalOpen: boolean = false;
  selectedCategoryForEdit: Category | null = null;
  currentYear: number = new Date().getFullYear();
  currentMonth: number = new Date().getMonth() + 1;

  // --- Data Observables ---
  private allData$!: Observable<{ categories: Category[], summary: BudgetSummary }>;
  categories$!: Observable<Category[]>;
  filteredCategories$!: Observable<Category[]>;
  budgetSummary$!: Observable<BudgetSummary>;

  // --- AG Grid Configuration ---
  colDefs: ColDef[] = [
    { headerName: 'Name', field: 'name', sortable: true, filter: true, flex: 3 },
    { headerName: 'Amount', field: 'budgeted_amount', sortable: true, filter: 'agNumberColumnFilter', valueFormatter: p => new CurrencyPipe('en-US', 'ILS').transform(p.value) || '', type: 'rightAligned', flex: 1 },
    { headerName: 'Actions', cellRenderer: CategoryActionsRenderer, colId: 'actions', flex: 1 }
  ];
  gridOptions: GridOptions = {
    context: {
      componentParent: this,
      currentYear: this.currentYear,
      currentMonth: this.currentMonth
    }
  };

  ngOnInit(): void {
    // ** THE FIX IS HERE: Refactored the observable pipeline **

    // 1. Create a single, stable stream for all backend data that refreshes when needed.
    this.allData$ = this.refresh$.pipe(
      switchMap(() => forkJoin({
        categories: this.categoryService.getCategories(),
        summary: this.http.get<BudgetSummary>(`${this.baseUrl}/budget-summary`)
      }))
    );

    // 2. Derive stable observables from the main data stream.
    this.categories$ = this.allData$.pipe(map(data => data.categories), startWith([]));
    this.budgetSummary$ = this.allData$.pipe(map(data => data.summary));

    // 3. Create a stable filtered stream that reacts to both data changes and tab changes.
    // This eliminates the infinite loop.
    this.filteredCategories$ = combineLatest([
      this.categories$,
      this.activeTab$
    ]).pipe(
      map(([categories, activeTab]) =>
        categories.filter(c => c.type.toLowerCase() === activeTab && c.is_active)
      )
    );
  }

  // --- Event Handlers ---
  setActiveTab(tab: BudgetTab): void {
    this.activeTab$.next(tab);
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
    if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
      let delete$: Observable<any>;
      if (category.type === CategoryType.MONTHLY) {
        delete$ = this.budgetApiService.deleteMonthlyBudget(category.id, this.currentYear, this.currentMonth);
      } else {
        delete$ = this.categoryService.deleteCategory(category.id);
      }

      delete$.pipe(
        catchError((err: HttpErrorResponse) => {
          alert(err.status === 409 ? err.error.detail : 'An unexpected error occurred.');
          return of(null);
        })
      ).subscribe(result => { if (result !== null) this.refresh$.next(); });
    }
  }
}
