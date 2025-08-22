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

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private http = inject(HttpClient);
  private apiUrl = environment.baseUrl;

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  createCategory(category: CategoryCreate): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, category);
  }
}
