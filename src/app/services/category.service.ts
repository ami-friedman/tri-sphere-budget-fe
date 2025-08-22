import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Category {
  id: string;
  name: string;
  type: string;
  budgeted_amount: number;
}

export interface CategoryCreate {
  name: string;
  type: string;
  budgeted_amount?: number;
}

// New interface for updating a Category
export interface CategoryUpdate {
  name?: string;
  type?: string;
  budgeted_amount?: number;
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

  updateCategory(id: string, category: CategoryUpdate): Observable<Category> {
    return this.http.put<Category>(
      `${this.baseUrl}/categories/${id}`,
      category,
    );
  }
}
