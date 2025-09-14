import { Component, input } from '@angular/core';
import { TabNavItem } from './tab-nav.interface';
import { NgComponentOutlet } from '@angular/common';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';

@Component({
  selector: 'tab-nav',
  imports: [NgComponentOutlet, Tabs, TabList, TabPanels, Tab, TabPanel],
  templateUrl: './tab-nav.component.html',
  styleUrl: './tab-nav.component.scss',
})
export class TabNavComponent {
  tabs = input<TabNavItem[] | undefined>([]);
}
