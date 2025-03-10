import { Component, signal } from '@angular/core';
import { DatePickerComponent } from '../ui/date-picker/date-picker.component';

@Component({
  selector: 'budget',
  standalone: true,
  imports: [DatePickerComponent],
  templateUrl: './budget.component.html',
  styleUrl: './budget.component.scss',
})
export class BudgetComponent {
  date = signal<Date>(new Date());
  //Display a tab navigation with all expense category groups + income
  //Display the summary on the side
  //Display a button to apply last month's budget
}
