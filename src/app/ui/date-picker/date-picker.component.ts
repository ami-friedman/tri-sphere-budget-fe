import {
  Component,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { DatePickerService } from './data-access/date-picker.service';

@Component({
    selector: 'tsb-date-picker',
    imports: [CalendarModule, FormsModule],
    templateUrl: './date-picker.component.html',
    styleUrl: './date-picker.component.scss'
})
export class DatePickerComponent implements OnInit {
  datePickerSvc: DatePickerService = inject(DatePickerService);
  date = input.required<Date>();
  selectedDate = signal<Date>(new Date());

  dateSelected = output<Date>();

  ngOnInit() {
    this.selectedDate.set(this.date());
  }

  moveCalFwd(): void {
    this.updateCalendar(1);
  }

  moveCalBck(): void {
    this.updateCalendar(-1);
  }

  private updateCalendar(interval: number): void {
    const newDate = new Date(this.selectedDate());
    newDate.setMonth(newDate.getMonth() + interval);
    this.selectedDate.set(newDate);
    this.dateSelected.emit(this.selectedDate());
  }
}
