import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DatePickerService {
  selectedDate = signal<Date>(new Date());

  setSelectedDate(date: Date) {
    this.selectedDate.set(date);
  }
}
