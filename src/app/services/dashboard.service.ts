import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MonthlyExpense {
  sub_category: string;
  budgeted_amount: number;
  actual_spent: number;
  difference: number;
}

export interface SavingsBalance {
  sub_category: string;
  current_balance: number;
}

export interface DashboardSummary {
  total_income: number;
  total_expenses: number;
  net_balance: number;
  monthly_expenses: MonthlyExpense[];
  savings_balances: SavingsBalance[];
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);
  private baseUrl = environment.baseUrl;

  getDashboardSummary(
    year: number,
    month: number,
  ): Observable<DashboardSummary> {
    let params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());

    return this.http.get<DashboardSummary>(`${this.baseUrl}/dashboard`, {
      params,
    });
  }
}
