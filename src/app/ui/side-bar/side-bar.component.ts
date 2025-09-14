import { Component, signal } from '@angular/core';
import { NavigationItem } from './side-bar.interface';

@Component({
  selector: 'side-bar',
  standalone: true,
  imports: [],

  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss',
})
export class SideBarComponent {
  navigationMenu = signal<NavigationItem[]>([
    {
      title: 'Home',
      route: '',
    },
    {
      title: 'Budget',
      route: 'budget',
    },
  ]);
}
