import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Category } from './category.service'; // Import Category

export interface Transaction {
  id: string;
  category_id: string;
  amount: number;
  description?: string;
  transaction_date: string; // ISO 8601 format
}

// NEW: This interface represents a transaction bundled with its full category object.
export interface TransactionWithCategory extends Transaction {
  category?: Category;
}

export interface TransactionCreate {
  category_id: string;
  amount: number;
  description?: string;
  transaction_date: string;
}

export interface TransactionUpdate {
  category_id?: string;
  amount?: number;
  description?: string;
  transaction_date?: string;
}

export interface TransferCreate {
  category_id: string;
  amount: number;
  description?: string;
  transaction_date: string;
}

export interface TransferUpdate {
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

  getTransactions(year: number, month: number): Observable<Transaction[]> {
    let params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());
    return this.http.get<Transaction[]>(`${this.baseUrl}/transactions`, { params });
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

  getTransfers(year: number, month: number): Observable<Transaction[]> {
    let params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());
    return this.http.get<Transaction[]>(`${this.baseUrl}/transfers`, { params });
  }

  createTransfer(transfer: TransferCreate): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.baseUrl}/transfers`, transfer);
  }

  updateTransfer(id: string, transfer: TransferUpdate): Observable<Transaction> {
    return this.http.put<Transaction>(
      `${this.baseUrl}/transfers/${id}`,
      transfer,
    );
  }

  deleteTransfer(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/transfers/${id}`);
  }
}
