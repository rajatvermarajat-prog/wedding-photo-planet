import { OfficeExpense } from '@/types';
import { MemberSalaryRecord } from './dashboardTypes';

export const DEFAULT_SALARY_RECORDS: MemberSalaryRecord[] = [
  { memberId: 'team-ishita', memberName: 'Ishita', role: 'Studio Manager', monthlySalary: 65000, paidAmount: 45000 },
  { memberId: 'team-tokir', memberName: 'Tokir', role: 'Lead Photographer', monthlySalary: 65000, paidAmount: 65000 },
  { memberId: 'team-mohit', memberName: 'Mohit', role: 'Cinematographer', monthlySalary: 55000, paidAmount: 35000 },
  { memberId: 'team-rahul', memberName: 'Rahul', role: 'Video Editor', monthlySalary: 42000, paidAmount: 20000 },
  { memberId: 'team-pooja', memberName: 'Pooja', role: 'Photo Editor', monthlySalary: 45000, paidAmount: 45000 },
  { memberId: 'team-vicky', memberName: 'Vicky', role: 'Assistant / Lighting', monthlySalary: 28000, paidAmount: 15000 },
];

const today = () => new Date().toISOString().split('T')[0];

export const DEFAULT_OFFICE_EXPENSES: OfficeExpense[] = [
  { id: 'exp-1', title: 'Studio Premises & Editing Room Rent', amount: 35000, category: 'Rent', expenseDate: today(), spentBy: 'Owner', paidVia: 'Bank Transfer', monthYear: '2026-08', notes: 'Monthly studio building rent' },
  { id: 'exp-2', title: 'Shoot Location Generator Diesel & Travel Fuel', amount: 12500, category: 'Travel & Fuel', expenseDate: today(), spentBy: 'Studio Manager', paidVia: 'UPI / GPay', monthYear: '2026-08', notes: 'Crew car travel & location fuel' },
  { id: 'exp-3', title: 'New Camera Lens & High-Speed Memory Cards', amount: 18000, category: 'Studio Equipment & Repair', expenseDate: today(), spentBy: 'Owner', paidVia: 'UPI / GPay', monthYear: '2026-08', notes: 'Sony lens & SanDisk Extreme Pro 128GB' },
  { id: 'exp-4', title: 'High-speed Fiber Internet & Electricity Bill', amount: 6800, category: 'Electricity & Water', expenseDate: today(), spentBy: 'Studio Manager', paidVia: 'UPI / GPay', monthYear: '2026-08', notes: 'Monthly power & internet bill' },
  { id: 'exp-5', title: 'Daily Crew Chai, Snacks & Client Hospitality', amount: 4200, category: 'Food & Tea/Chai', expenseDate: today(), spentBy: 'Account Manager', paidVia: 'Cash', monthYear: '2026-08', notes: 'Daily studio tea & client snacks' },
];
