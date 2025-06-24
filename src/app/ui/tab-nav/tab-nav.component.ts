import { Component, input } from '@angular/core';
import { TabViewModule } from 'primeng/tabview';
import { TabNavItem } from './tab-nav.interface';
import { NgComponentOutlet } from '@angular/common';

@Component({
  selector: 'tab-nav',
  imports: [TabViewModule, NgComponentOutlet],
  templateUrl: './tab-nav.component.html',
  styleUrl: './tab-nav.component.scss',
})
export class TabNavComponent {
  tabs = input<TabNavItem[] | undefined>([]);
}
