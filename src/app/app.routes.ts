import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login.component';
import { RegisterComponent } from './auth/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { BudgetComponent } from './budget/budget.component';
import { TransactionComponent } from './transactions/transaction.component';
// ** NEW: Import the new SavingsTransactionsComponent **
import { authGuard, publicGuard } from './auth/auth.guard';
import {SavingsTransactionsComponent} from './savings-transactions/savings-transactions.component';
import {ImportTransactionsComponent} from './import-transactions/import-transactions.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [publicGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [publicGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'budget', component: BudgetComponent, canActivate: [authGuard] },
  { path: 'transactions', component: TransactionComponent, canActivate: [authGuard] },
  // ** NEW: Add the route for the savings ledger **
  { path: 'savings-transactions', component: SavingsTransactionsComponent, canActivate: [authGuard] },
  { path: 'import-transactions', component: ImportTransactionsComponent, canActivate: [authGuard] },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
];
