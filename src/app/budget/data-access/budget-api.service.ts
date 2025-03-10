import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { GetBudgetExpenseReq, MonthlyBudgetRes } from './budget.interface';

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
}
