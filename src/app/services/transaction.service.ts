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

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private http = inject(HttpClient);
  private apiUrl = environment.baseUrl;

  createTransaction(transaction: TransactionCreate): Observable<Transaction> {
    return this.http.post<Transaction>(
      `${this.apiUrl}/transactions`,
      transaction,
    );
  }
}
