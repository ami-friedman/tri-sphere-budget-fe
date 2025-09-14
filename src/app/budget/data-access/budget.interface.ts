import { BudgetCategory } from '../budget.enums';

export interface ExpenseBudget {
  id: number;
  name: string;
  category_group: string;
  amount: number;
}

export interface GetBudgetExpenseReq {
  category: BudgetCategory;
  month: string;
}

export interface MonthlyBudgetRes {
  total: number;
  category_group_id: number;
  breakdown: ExpenseBudget[];
}
