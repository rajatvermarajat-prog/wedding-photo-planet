import { Expense, ExpenseBudget, RecurringExpense } from '../types';
import { INITIAL_EXPENSES, INITIAL_EXPENSE_BUDGETS, INITIAL_RECURRING_EXPENSES } from '../data/mockExpenses';

const EXPENSES_KEY = 'wpp_crm_expenses_v1';
const RECURRING_KEY = 'wpp_crm_recurring_expenses_v1';
const BUDGETS_KEY = 'wpp_crm_expense_budgets_v1';

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try { return JSON.parse(localStorage.getItem(key) || '') as T; } catch { return fallback; }
}

export const expenseService = {
  list: () => read<Expense[]>(EXPENSES_KEY, INITIAL_EXPENSES),
  save: (expenses: Expense[]) => localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses)),
  recurring: () => read<RecurringExpense[]>(RECURRING_KEY, INITIAL_RECURRING_EXPENSES),
  saveRecurring: (items: RecurringExpense[]) => localStorage.setItem(RECURRING_KEY, JSON.stringify(items)),
  budgets: () => read<ExpenseBudget[]>(BUDGETS_KEY, INITIAL_EXPENSE_BUDGETS),
  saveBudgets: (items: ExpenseBudget[]) => localStorage.setItem(BUDGETS_KEY, JSON.stringify(items)),
};
