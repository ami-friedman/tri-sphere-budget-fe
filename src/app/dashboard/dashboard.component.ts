import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// Interfaces for the new combined data structure
export interface BudgetActual {
  budgeted: number;
  actual: number;
}

export interface FundBalance {
  fund_name: string;
  current_balance: number;
}

export interface SavingsSummary {
  total_balance: number;
  fund_balances: FundBalance[];
}

export interface DashboardData {
  checking_summary: {
    income: BudgetActual;
    monthly: BudgetActual;
    cash: BudgetActual;
    savings: BudgetActual;
    total_expenses: BudgetActual;
    net_cash_flow: BudgetActual;
  };
  savings_summary: SavingsSummary;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private baseUrl = environment.baseUrl;

  private refreshData$ = new BehaviorSubject<{ year: number; month: number }>({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  });

  dashboardData$!: Observable<DashboardData>;

  monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  availableYears = [new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1];
  selectedMonthName: string = this.monthNames[new Date().getMonth()];
  selectedYear: number = new Date().getFullYear();

  ngOnInit(): void {
    this.dashboardData$ = this.refreshData$.pipe(
      switchMap(params => {
        const httpParams = new HttpParams()
          .set('year', params.year.toString())
          .set('month', params.month.toString());
        // Call the new, combined endpoint
        return this.http.get<DashboardData>(`${this.baseUrl}/dashboard/v2`, { params: httpParams });
      })
    );
  }

  onMonthChange(): void {
    const monthIndex = this.monthNames.indexOf(this.selectedMonthName);
    this.refreshData$.next({ year: this.selectedYear, month: monthIndex + 1 });
  }

  changeMonth(direction: 'prev' | 'next'): void {
    let currentMonthIndex = this.monthNames.indexOf(this.selectedMonthName);
    if (direction === 'next') {
      if (currentMonthIndex === 11) {
        this.selectedMonthName = this.monthNames[0];
        this.selectedYear++;
      } else {
        this.selectedMonthName = this.monthNames[currentMonthIndex + 1];
      }
    } else {
      if (currentMonthIndex === 0) {
        this.selectedMonthName = this.monthNames[11];
        this.selectedYear--;
      } else {
        this.selectedMonthName = this.monthNames[currentMonthIndex - 1];
      }
    }
    this.onMonthChange();
  }
}
