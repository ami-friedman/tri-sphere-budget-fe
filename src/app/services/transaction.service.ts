import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Category } from './category.service';

// This interface is for creating/updating transactions
export interface TransactionCreate {
  account_id: string;
  category_id: string;
  amount: number;
  description?: string;
  transaction_date: string;
}

// This is the full transaction object returned by the API
export interface TransactionPublic extends TransactionCreate {
  id: string;
  created_at: string;
}

// This is an enhanced type for use within the frontend components
export interface TransactionWithCategory extends TransactionPublic {
  category?: Category;
}

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private http = inject(HttpClient);
  private baseUrl = environment.baseUrl;

  getTransactions(year: number, month: number): Observable<TransactionPublic[]> {
    const params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());
    return this.http.get<TransactionPublic[]>(`${this.baseUrl}/transactions`, { params });
  }

  createTransaction(transaction: TransactionCreate): Observable<TransactionPublic> {
    return this.http.post<TransactionPublic>(`${this.baseUrl}/transactions`, transaction);
  }

  updateTransaction(id: string, transaction: Partial<TransactionCreate>): Observable<TransactionPublic> {
    return this.http.put<TransactionPublic>(`${this.baseUrl}/transactions/${id}`, transaction);
  }

  deleteTransaction(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/transactions/${id}`);
  }
}
