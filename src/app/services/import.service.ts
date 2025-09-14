import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

// Interfaces for the import feature
export interface PendingTransactionPublic {
  id: string;
  statement_description: string;
  transaction_date: string;
  amount: number;
}

export interface FinalizeTransactionPayload {
  pending_transaction_id: string;
  account_id: string;
  category_id: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImportService {
  private http = inject(HttpClient);
  private baseUrl = environment.baseUrl;

  // ** THIS METHOD IS FIXED **
  uploadStatement(file: File, accountType: 'checking' | 'savings'): Observable<{ message: string }> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    // Capitalize the first letter to match the backend enum ('checking' -> 'Checking')
    const capitalizedAccountType = accountType.charAt(0).toUpperCase() + accountType.slice(1);
    return this.http.post<{ message: string }>(`${this.baseUrl}/transactions/upload?account_type=${capitalizedAccountType}`, formData);
  }

  // ** THIS METHOD IS FIXED **
  getPendingTransactions(accountType: 'checking' | 'savings'): Observable<PendingTransactionPublic[]> {
    // Capitalize the first letter to match the backend enum
    const capitalizedAccountType = accountType.charAt(0).toUpperCase() + accountType.slice(1);
    return this.http.get<PendingTransactionPublic[]>(`${this.baseUrl}/transactions/pending?account_type=${capitalizedAccountType}`);
  }

  ignorePendingTransactions(pendingIds: string[]): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/transactions/pending/ignore`, pendingIds);
  }

  finalizeTransactions(payload: FinalizeTransactionPayload[]): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/transactions/finalize`, payload);
  }
}
