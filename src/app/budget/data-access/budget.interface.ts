export interface ExpenseBudget {
  id: number;
  name: string;
  category_group: string;
  amount: number;
}

export interface GetBudgetExpenseReq {
  category_id: number;
  month: string;
}

export interface MonthlyBudgetRes {
  total: number;
  category_group_id: number;
  breakdown: ExpenseBudget[];
}
