export type ExpenseCategory = 'Shoot' | 'Freelancer' | 'Office' | 'Travel' | 'Cab' | 'Equipment' | 'Vendor' | 'Marketing' | 'Software' | 'Utilities' | 'Miscellaneous' | 'Other';
export type ExpensePaymentStatus = 'Unpaid' | 'Pending' | 'Partially Paid' | 'Paid' | 'Overdue';
export type ExpenseApprovalStatus = 'Draft' | 'Submitted' | 'Approved' | 'Paid' | 'Rejected';
export type ExpensePaymentMethod = 'Cash' | 'UPI' | 'Bank Transfer' | 'Credit Card' | 'Debit Card' | 'Cheque' | 'Other';

export interface ExpensePayment {
  id: string;
  amount: number;
  date: string;
  method: ExpensePaymentMethod;
  note?: string;
}

export interface ExpenseReceipt {
  fileName: string;
  fileType: string;
  fileUrl: string;
  uploadDate: string;
  uploadedBy: string;
}

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  subcategory: string;
  description: string;
  amount: number;
  paidAmount: number;
  projectId?: string;
  shootId?: string;
  client?: string;
  payee?: string;
  freelancerId?: string;
  freelancerPaymentId?: string;
  vendor?: string;
  role?: string;
  workDate?: string;
  from?: string;
  to?: string;
  distance?: number;
  paymentMethod: ExpensePaymentMethod;
  paymentStatus: ExpensePaymentStatus;
  approvalStatus: ExpenseApprovalStatus;
  addedBy: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  receipt?: ExpenseReceipt;
  payments: ExpensePayment[];
}

export interface RecurringExpense {
  id: string;
  name: string;
  category: ExpenseCategory;
  vendor: string;
  amount: number;
  frequency: 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Yearly';
  startDate: string;
  nextDueDate: string;
  autoGenerate: boolean;
  status: 'Active' | 'Paused';
}

export interface ExpenseBudget {
  id: string;
  month: string;
  category: ExpenseCategory | 'Overall';
  amount: number;
}
