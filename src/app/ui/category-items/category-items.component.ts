import { Component, input } from '@angular/core';

@Component({
  selector: 'tsb-category-items',
  standalone: true,
  imports: [],
  templateUrl: './category-items.component.html',
  styleUrl: './category-items.component.scss',
})
export class CategoryItemsComponent {
  body = input<string>();
}
