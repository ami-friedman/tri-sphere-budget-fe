import { Component, inject, signal } from '@angular/core';
import { DatePickerComponent } from '../ui/date-picker/date-picker.component';
import { TabNavComponent } from '../ui/tab-nav/tab-nav.component';
import { TabNavItem } from '../ui/tab-nav/tab-nav.interface';
import { BudgetCategory } from './budget.enums';
import { BudgetCashComponent } from './budget-cash/budget-cash.component';
import { DatePickerService } from '../ui/date-picker/data-access/date-picker.service';

@Component({
  selector: 'budget',
  imports: [DatePickerComponent, TabNavComponent],
  templateUrl: './budget.component.html',
  styleUrl: './budget.component.scss',
})
export class BudgetComponent {
  datePickerService: DatePickerService = inject(DatePickerService);
  date = signal<Date>(new Date());
  tabs = signal<TabNavItem[]>([
    {
      title: BudgetCategory.Cash,
      component: BudgetCashComponent,
      inputs: {},
    },
  ]);
  //Display a tab navigation with all expense category groups + income
  //Display the summary on the side
  //Display a button to apply last month's budget
}
