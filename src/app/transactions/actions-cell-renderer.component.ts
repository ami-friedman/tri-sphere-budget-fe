import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-actions-cell-renderer',
  standalone: true,
  template: `
    <div class="flex justify-end items-center h-full space-x-4">
      <button (click)="onEditClick()" class="font-medium text-blue-400 hover:underline">Edit</button>
      <button (click)="onDeleteClick()" class="font-medium text-red-400 hover:underline">Delete</button>
    </div>
  `
})
export class ActionsCellRenderer implements ICellRendererAngularComp {
  private params!: ICellRendererParams;

  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  refresh(params: ICellRendererParams): boolean {
    return false;
  }

  onEditClick(): void {
    // This emits an event that the main component will listen for
    this.params.context.componentParent.onEditTransaction(this.params.data);
  }

  onDeleteClick(): void {
    // This emits an event that the main component will listen for
    this.params.context.componentParent.onDeleteTransaction(this.params.data);
  }
}
