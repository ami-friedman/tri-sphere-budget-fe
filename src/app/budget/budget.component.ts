import { Component, signal } from '@angular/core';
import { DatePickerComponent } from '../ui/date-picker/date-picker.component';
import { TabNavComponent } from '../ui/tab-nav/tab-nav.component';
import { TabNavItem } from '../ui/tab-nav/tab-nav.interface';
import { CategoryItemsComponent } from '../ui/category-items/category-items.component';

@Component({
  selector: 'budget',
  standalone: true,
  imports: [DatePickerComponent, TabNavComponent],
  templateUrl: './budget.component.html',
  styleUrl: './budget.component.scss',
})
export class BudgetComponent {
  date = signal<Date>(new Date());
  tabs = signal<TabNavItem[]>([
    {
      title: 'Cash',
      component: CategoryItemsComponent,
      inputs: {
        body: 'Cash Expenses',
      },
    },
    {
      title: 'Monthly',
      component: CategoryItemsComponent,
      inputs: {
        body: 'Monthly Expenses',
      },
    },
    {
      title: 'Savings',
      component: CategoryItemsComponent,
      inputs: {
        body: 'Savings',
      },
    },
  ]);
  //Display a tab navigation with all expense category groups + income
  //Display the summary on the side
  //Display a button to apply last month's budget
}
