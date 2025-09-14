import { Component, computed, inject } from '@angular/core';
import { BudgetApiService } from '../../budget/data-access/budget-api.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MonthlyBudgetRes } from '../../budget/data-access/budget.interface';
import { DatePickerService } from '../date-picker/data-access/date-picker.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'category-items',
  imports: [],
  templateUrl: './category-items.component.html',
  styleUrl: './category-items.component.scss',
})
export class CategoryItemsComponent {
  private budgetApiSvc: BudgetApiService = inject(BudgetApiService);
  private datePickerSvc: DatePickerService = inject(DatePickerService);
  budgetData = toSignal<MonthlyBudgetRes>(
    toObservable(this.datePickerSvc.selectedDate).pipe(
      switchMap((date) =>
        this.budgetApiSvc.getExpense({
          category_id: 1,
          month: date.toISOString().split('T')[0],
        }),
      ),
    ),
  );

  total = computed(() => this.budgetData()?.total);
  breakdown = computed(() => this.budgetData()?.breakdown);
}
