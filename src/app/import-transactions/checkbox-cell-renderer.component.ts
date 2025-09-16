import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-checkbox-cell-renderer',
  standalone: true,
  template: `
    <div class="flex items-center justify-center h-full">
      <input
        type="checkbox"
        [checked]="params.value"
        (change)="onChange($event)"
        class="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-600">
    </div>
  `,
})
export class CheckboxCellRenderer implements ICellRendererAngularComp {
  public params!: ICellRendererParams;

  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  refresh(params: ICellRendererParams) {
    return true;
  }

  onChange(event: any) {
    if (!this.params || !this.params.setValue) {
      return;
    }

    const checked = (event.target as HTMLInputElement).checked;
    this.params.setValue(checked);
  }
}
