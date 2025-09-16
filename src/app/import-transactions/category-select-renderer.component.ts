import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { Category } from '../services/category.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-category-select-renderer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if(params.data) {
      <select [(ngModel)]="selectedValue" (ngModelChange)="onChange($event)" class="w-full py-1 px-2 rounded-lg bg-gray-700 border border-gray-600 text-sm">
        <option [ngValue]="null">-- Select --</option>
        @for(cat of availableCategories; track cat.id) {
          <option [value]="cat.id">{{ cat.name }} ({{cat.type}})</option>
        }
      </select>
    }
  `
})
export class CategorySelectRenderer implements ICellRendererAngularComp {
  public params!: ICellRendererParams;
  public availableCategories: Category[] = [];
  public selectedValue: string | null = null;

  agInit(params: ICellRendererParams): void {
    this.params = params;
    this.availableCategories = this.params.context.componentParent.availableCategories;
    this.selectedValue = this.params.value;
  }

  refresh(params: ICellRendererParams) {
    return true;
  }

  onChange(value: string | null) {
    if (!this.params || !this.params.setValue) {
      return;
    }

    this.params.setValue(value);
    // Also ensure data exists before trying to set the account_id
    if (this.params.data) {
      this.params.data.assigned_account_id = this.params.context.componentParent.getAccountIdForTab();
    }
  }
}
