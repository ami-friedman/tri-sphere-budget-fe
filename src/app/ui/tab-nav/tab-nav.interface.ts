import { Type } from '@angular/core';

export interface TabNavItem {
  title: string;
  component: Type<unknown>;
  inputs: Record<string, unknown>;
}
