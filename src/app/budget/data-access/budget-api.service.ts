import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { GetBudgetExpenseReq, MonthlyBudgetRes } from './budget.interface';
import { BudgetCategory } from '../budget.enums';

@Injectable({
  providedIn: 'root',
})
export class BudgetApiService {
  private readonly baseUrl = `${environment.baseUrl}/budget`;
  private http: HttpClient = inject(HttpClient);

  getExpense(req: GetBudgetExpenseReq): Observable<MonthlyBudgetRes> {
    return this.http.get<MonthlyBudgetRes>(`${this.baseUrl}/expense`, {
      params: { ...req },
    });
  }

  deleteMonthlyBudget(categoryId: string, year: number, month: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/monthly-budgets`, {
      params: { category_id: categoryId, year: year, month: month },
    });
  }
}
