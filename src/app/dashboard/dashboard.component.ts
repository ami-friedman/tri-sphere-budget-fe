import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DashboardService,
  DashboardSummary,
  MonthlyExpense,
  SavingsBalance,
} from '../services/dashboard.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  dashboardSummary$!: Observable<DashboardSummary>;

  monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  selectedMonthName: string = this.monthNames[new Date().getMonth()];
  selectedYear: number = new Date().getFullYear();

  private dashboardService = inject(DashboardService);
  private refreshDashboard$ = new BehaviorSubject<{
    year: number;
    month: number;
  }>({ year: this.selectedYear, month: new Date().getMonth() + 1 });

  ngOnInit(): void {
    this.dashboardSummary$ = this.refreshDashboard$.pipe(
      switchMap((params) =>
        this.dashboardService.getDashboardSummary(params.year, params.month),
      ),
    );
  }

  onMonthChange(): void {
    const monthIndex = this.monthNames.indexOf(this.selectedMonthName);
    this.refreshDashboard$.next({
      year: this.selectedYear,
      month: monthIndex + 1,
    });
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

  isOverBudget(expense: MonthlyExpense): boolean {
    return expense.actual_spent > expense.budgeted_amount;
  }

  isNegativeBalance(balance: SavingsBalance): boolean {
    return balance.current_balance < 0;
  }
}
