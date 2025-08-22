import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DashboardService,
  DashboardSummary,
  MonthlyExpense,
  SavingsBalance,
} from '../services/dashboard.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss', // This will be an empty file for now
})
export class DashboardComponent implements OnInit {
  dashboardSummary$!: Observable<DashboardSummary>;

  private dashboardService = inject(DashboardService);

  ngOnInit(): void {
    this.dashboardSummary$ = this.dashboardService.getDashboardSummary();
  }

  isOverBudget(expense: MonthlyExpense): boolean {
    return expense.actual_spent > expense.budgeted_amount;
  }

  isNegativeBalance(balance: SavingsBalance): boolean {
    return balance.current_balance < 0;
  }
}
