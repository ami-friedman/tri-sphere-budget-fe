import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export enum CategoryType {
  CASH = 'Cash',
  MONTHLY = 'Monthly',
  SAVINGS = 'Savings',
  TRANSFER = 'Transfer',
  INCOME = 'Income',
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  budgeted_amount: number;
  created_at: string;
  is_active: boolean;
}

export interface CategoryCreate {
  name: string;
  type: CategoryType;
  budgeted_amount?: number;
}

export interface CategoryUpdate {
  name?: string;
  type?: CategoryType;
  budgeted_amount?: number;
  is_active?: boolean;
}

export interface CategoryBudgetInfo {
  budgeted_amount: number;
  spent_amount: number;
  remaining_amount: number;
}

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private http = inject(HttpClient);
  private baseUrl = environment.baseUrl;

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/categories`);
  }

  createCategory(category: CategoryCreate): Observable<Category> {
    return this.http.post<Category>(`${this.baseUrl}/categories`, category);
  }

  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/categories/all`);
  }

  updateCategory(id: string, category: CategoryUpdate): Observable<Category> {
    return this.http.put<Category>(`${this.baseUrl}/categories/${id}`, category);
  }

  deleteCategory(id: string): Observable<Category> {
    return this.http.put<Category>(`${this.baseUrl}/categories/${id}`, { is_active: false });
  }

  getCategoryBudgetInfo(id: string, year: number, month: number): Observable<CategoryBudgetInfo> {
    return this.http.get<CategoryBudgetInfo>(`${this.baseUrl}/categories/${id}/budget-info`, {
      params: { year, month }
    });
  }
}
