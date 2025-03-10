import { Component, Input } from '@angular/core';
import { TabViewModule } from 'primeng/tabview';
import { TabNavItem } from './tab-nav.interface';
import { NgComponentOutlet } from '@angular/common';

@Component({
  selector: 'tsb-tab-nav',
  standalone: true,
  imports: [TabViewModule, NgComponentOutlet],
  templateUrl: './tab-nav.component.html',
  styleUrl: './tab-nav.component.scss',
})
export class TabNavComponent {
  @Input() tabs: TabNavItem[] | undefined;
}
