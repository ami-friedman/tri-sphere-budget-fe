import { Component, computed, inject } from '@angular/core';

import { toObservable, toSignal } from '@angular/core/rxjs-interop';

import { switchMap } from 'rxjs';
import { BudgetCategory } from '../budget.enums';
import { DatePickerService } from '../../ui/date-picker/data-access/date-picker.service';
import { MonthlyBudgetRes } from '../data-access/budget.interface';
import { BudgetApiService } from '../data-access/budget-api.service';

@Component({
  selector: 'budget-cash',
  imports: [],
  templateUrl: './budget-cash.component.html',
  styleUrl: './budget-cash.component.scss',
})
export class BudgetCashComponent {
  private budgetApiSvc: BudgetApiService = inject(BudgetApiService);
  private datePickerSvc: DatePickerService = inject(DatePickerService);
  budgetData = toSignal<MonthlyBudgetRes>(
    toObservable(this.datePickerSvc.selectedDate).pipe(
      switchMap((date) =>
        this.budgetApiSvc.getExpense({
          category: BudgetCategory.Cash,
          month: date.toISOString().split('T')[0],
        }),
      ),
    ),
  );

  total = computed(() => this.budgetData()?.total);
  breakdown = computed(() => this.budgetData()?.breakdown);
}
