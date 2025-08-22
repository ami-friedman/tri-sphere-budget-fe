import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Transaction {
  id: string;
  category_id: string;
  amount: number;
  description?: string;
  transaction_date: string; // ISO 8601 format
}

export interface TransactionCreate {
  category_id: string;
  amount: number;
  description?: string;
  transaction_date: string;
}

// New interface for updating a Transaction
export interface TransactionUpdate {
  category_id?: string;
  amount?: number;
  description?: string;
  transaction_date?: string;
}

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private http = inject(HttpClient);
  private baseUrl = environment.baseUrl;

  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.baseUrl}/transactions`);
  }

  createTransaction(transaction: TransactionCreate): Observable<Transaction> {
    return this.http.post<Transaction>(
      `${this.baseUrl}/transactions`,
      transaction,
    );
  }

  updateTransaction(
    id: string,
    transaction: TransactionUpdate,
  ): Observable<Transaction> {
    return this.http.put<Transaction>(
      `${this.baseUrl}/transactions/${id}`,
      transaction,
    );
  }

  deleteTransaction(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/transactions/${id}`);
  }
}
