import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login.component';
import { RegisterComponent } from './auth/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { BudgetComponent } from './budget/budget.component';
import { TransactionComponent } from './transactions/transaction.component';
import { authGuard, publicGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [publicGuard],
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [publicGuard],
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'budget',
    component: BudgetComponent,
    canActivate: [authGuard],
  },
  {
    path: 'transactions',
    component: TransactionComponent,
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
];
