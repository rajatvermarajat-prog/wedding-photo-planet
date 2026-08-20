import React, { useState, useEffect } from 'react';
import { Project, TeamMember, AttendanceRecord, OfficeExpense, TeamTask } from '@/types';
import { generateJulyToAugustAttendance } from '@/data/mockData';
import { ConfirmDeleteModal } from '@/components/common/ConfirmDeleteModal';
import { TeamDailyReportingWidget } from '@/features/team/components/TeamDailyReportingWidget';
import { 
  IndianRupee, 
  Briefcase, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Truck, 
  ArrowUpRight, 
  Calendar, 
  Film, 
  HardDrive, 
  Plus, 
  TrendingUp,
  User,
  Users,
  MapPin,
  Phone,
  ShieldAlert,
  Lock,
  Monitor,
  Wallet,
  Pencil,
  X,
  Trash2,
  Settings,
  SlidersHorizontal,
  PlusCircle,
  Tag,
  CreditCard,
  Receipt,
  TrendingDown,
  Building2,
  FileText,
  RotateCcw
} from 'lucide-react';

export interface SalaryColumn {
  id: string;
  name: string;
  type: 'number' | 'text';
}

export interface SalaryInstallment {
  id: string;
  amount: number;
  date: string;
  mode: string;
  notes?: string;
}

export interface MemberSalaryRecord {
  memberId: string;
  memberName: string;
  role: string;
  monthlySalary: number;
  paidAmount: number;
  lastPaymentDate?: string;
  paymentMonth?: string;
  notes?: string;
  customValues?: Record<string, number | string>;
  installments?: SalaryInstallment[];
}

const DEFAULT_SALARY_COLUMNS: SalaryColumn[] = [];

const DEFAULT_SALARY_RECORDS: MemberSalaryRecord[] = [
  { memberId: 'team-ishita', memberName: 'Ishita', role: 'Studio Manager', monthlySalary: 65000, paidAmount: 45000 },
  { memberId: 'team-tokir', memberName: 'Tokir', role: 'Lead Photographer', monthlySalary: 65000, paidAmount: 65000 },
  { memberId: 'team-mohit', memberName: 'Mohit', role: 'Cinematographer', monthlySalary: 55000, paidAmount: 35000 },
  { memberId: 'team-rahul', memberName: 'Rahul', role: 'Video Editor', monthlySalary: 42000, paidAmount: 20000 },
  { memberId: 'team-pooja', memberName: 'Pooja', role: 'Photo Editor', monthlySalary: 45000, paidAmount: 45000 },
  { memberId: 'team-vicky', memberName: 'Vicky', role: 'Assistant / Lighting', monthlySalary: 28000, paidAmount: 15000 },
];

const DEFAULT_OFFICE_EXPENSES: OfficeExpense[] = [
  {
    id: 'exp-1',
    title: 'Studio Premises & Editing Room Rent',
    amount: 35000,
    category: 'Rent',
    expenseDate: new Date().toISOString().split('T')[0],
    spentBy: 'Owner',
    paidVia: 'Bank Transfer',
    monthYear: '2026-08',
    notes: 'Monthly studio building rent',
  },
  {
    id: 'exp-2',
    title: 'Shoot Location Generator Diesel & Travel Fuel',
    amount: 12500,
    category: 'Travel & Fuel',
    expenseDate: new Date().toISOString().split('T')[0],
    spentBy: 'Studio Manager',
    paidVia: 'UPI / GPay',
    monthYear: '2026-08',
    notes: 'Crew car travel & location fuel',
  },
  {
    id: 'exp-3',
    title: 'New Camera Lens & High-Speed Memory Cards',
    amount: 18000,
    category: 'Studio Equipment & Repair',
    expenseDate: new Date().toISOString().split('T')[0],
    spentBy: 'Owner',
    paidVia: 'UPI / GPay',
    monthYear: '2026-08',
    notes: 'Sony lens & SanDisk Extreme Pro 128GB',
  },
  {
    id: 'exp-4',
    title: 'High-speed Fiber Internet & Electricity Bill',
    amount: 6800,
    category: 'Electricity & Water',
    expenseDate: new Date().toISOString().split('T')[0],
    spentBy: 'Studio Manager',
    paidVia: 'UPI / GPay',
    monthYear: '2026-08',
    notes: 'Monthly power & internet bill',
  },
  {
    id: 'exp-5',
    title: 'Daily Crew Chai, Snacks & Client Hospitality',
    amount: 4200,
    category: 'Food & Tea/Chai',
    expenseDate: new Date().toISOString().split('T')[0],
    spentBy: 'Account Manager',
    paidVia: 'Cash',
    monthYear: '2026-08',
    notes: 'Daily studio tea & client snacks',
  },
];

interface OwnerDashboardProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onOpenNewProjectModal: () => void;
  onOpenAllPaymentsModal?: () => void;
  setActiveTab: (tab: 'dashboard' | 'projects' | 'shoots' | 'data' | 'team' | 'deliveries') => void;
  team?: TeamMember[];
  attendance?: AttendanceRecord[];
  tasks?: TeamTask[];
  onUpdateTask?: (task: TeamTask) => void;
  onDeleteTask?: (taskId: string) => void;
  onAddTask?: (task: TeamTask) => void;
  onOpenMemberModal?: (member: TeamMember) => void;
  currentUser?: TeamMember | { id?: string; name?: string; role?: string; email?: string } | null;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  projects,
  onSelectProject,
  onOpenNewProjectModal,
  onOpenAllPaymentsModal,
  setActiveTab,
  team = [],
  attendance = [],
  tasks = [],
  onUpdateTask,
  onDeleteTask,
  onAddTask,
  onOpenMemberModal,
  currentUser,
}) => {
  // Custom Salary Columns State
  const [salaryColumns, setSalaryColumns] = useState<SalaryColumn[]>(() => {
    const saved = localStorage.getItem('wpp_salary_custom_columns');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_SALARY_COLUMNS;
  });

  useEffect(() => {
    localStorage.setItem('wpp_salary_custom_columns', JSON.stringify(salaryColumns));
  }, [salaryColumns]);

  const [showColumnManager, setShowColumnManager] = useState<boolean>(false);
  const [newColNameInput, setNewColNameInput] = useState<string>('');
  const [newColTypeInput, setNewColTypeInput] = useState<'number' | 'text'>('number');

  // Salary State Management
  const [salaryRecords, setSalaryRecords] = useState<MemberSalaryRecord[]>(() => {
    const saved = localStorage.getItem('wpp_owner_monthly_salary_ledger');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }

    if (team && team.length > 0) {
      return team.map((m) => {
        const match = DEFAULT_SALARY_RECORDS.find((d) => d.memberId === m.id || d.memberName.toLowerCase() === m.name.toLowerCase());
        const sal = m.monthlySalary || (m.dailyRate ? m.dailyRate * 26 : 45000);
        return {
          memberId: m.id,
          memberName: m.name,
          role: m.role || 'Team Member',
          monthlySalary: sal,
          paidAmount: match ? match.paidAmount : Math.round(sal * 0.6),
        };
      });
    }

    return DEFAULT_SALARY_RECORDS;
  });

  useEffect(() => {
    localStorage.setItem('wpp_owner_monthly_salary_ledger', JSON.stringify(salaryRecords));
  }, [salaryRecords]);

  // Add / Remove Salary Column handlers
  const handleAddSalaryColumn = (name: string, type: 'number' | 'text' = 'number') => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const exists = salaryColumns.some((c) => c.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      alert(`Column "${trimmed}" already exists!`);
      return;
    }
    const newCol: SalaryColumn = {
      id: `col_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: trimmed,
      type,
    };
    setSalaryColumns((prev) => [...prev, newCol]);
    setNewColNameInput('');
  };

  const handleRemoveSalaryColumn = (colId: string) => {
    const col = salaryColumns.find((c) => c.id === colId);
    if (!col) return;
    setSalaryColumns((prev) => prev.filter((c) => c.id !== colId));
    setEditCustomValues((prev) => {
      const copy = { ...prev };
      delete copy[colId];
      return copy;
    });
  };

  // Modal State for Updating Salary Payments
  const [editingSalaryMember, setEditingSalaryMember] = useState<MemberSalaryRecord | null>(null);
  const [editPaidAmount, setEditPaidAmount] = useState<number | ''>('');
  const [editPaymentMonth, setEditPaymentMonth] = useState<string>('');
  const [editSalaryNotes, setEditSalaryNotes] = useState<string>('');
  const [editCustomValues, setEditCustomValues] = useState<Record<string, number | string>>({});
  const [editInstallments, setEditInstallments] = useState<SalaryInstallment[]>([]);
  const [selectedSalaryMonth, setSelectedSalaryMonth] = useState<string>('2026-07');

  // Member's Attendance logs and calculations for live tracking inside the Update Salary Modal (1 Month filter)
  const memberAttendanceLogs = React.useMemo(() => {
    if (!editingSalaryMember) return [];
    
    const filterId = editingSalaryMember.memberId;
    const filterName = editingSalaryMember.memberName.toLowerCase();

    let logs = attendance && attendance.length > 0
      ? attendance.filter((a) => a.teamMemberId === filterId || a.teamMemberName.toLowerCase() === filterName)
      : [];

    // Filter to exactly 1 month (e.g. 2026-07 or 2026-08)
    if (selectedSalaryMonth) {
      logs = logs.filter((a) => a.date.startsWith(selectedSalaryMonth));
    }

    return logs;
  }, [editingSalaryMember, attendance, team, selectedSalaryMonth]);

  const presentDays = memberAttendanceLogs.filter((a) => a.status === 'present_shoot' || a.status === 'present_office').length;
  const halfDays = memberAttendanceLogs.filter((a) => a.status === 'half_day').length;
  const absentDays = memberAttendanceLogs.filter((a) => a.status === 'absent').length;

  const attendanceEarnedPay = memberAttendanceLogs.length > 0
    ? memberAttendanceLogs.reduce((acc, log) => acc + (log.payAmount || 0), 0)
    : (editingSalaryMember ? editingSalaryMember.monthlySalary : 0);

  const estimatedDailyRate = editingSalaryMember
    ? Math.round(editingSalaryMember.monthlySalary / 26)
    : 0;

  const currentEnteredPaid = Number(editPaidAmount) || 0;
  const pendingAttendanceBalance = Math.max(0, attendanceEarnedPay - currentEnteredPaid);
  const pendingBaseBalance = Math.max(0, (editingSalaryMember?.monthlySalary || 0) - currentEnteredPaid);

  const handleOpenEditModal = (m: MemberSalaryRecord) => {
    setEditingSalaryMember(m);
    setEditPaidAmount(m.paidAmount);
    setEditPaymentMonth(m.paymentMonth || new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }));
    setEditSalaryNotes(m.notes || '');
    setEditCustomValues(m.customValues ? { ...m.customValues } : {});
    setEditInstallments(m.installments ? m.installments.map((i) => ({ ...i })) : []);
  };

  const handleAddInstallment = () => {
    const nextNum = editInstallments.length + 1;
    const newInst: SalaryInstallment = {
      id: `inst_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      mode: 'GPay',
      notes: `Payment Part ${nextNum}`,
    };
    const updated = [...editInstallments, newInst];
    setEditInstallments(updated);
  };

  const handleRemoveInstallment = (id: string) => {
    const updated = editInstallments.filter((i) => i.id !== id);
    setEditInstallments(updated);
    if (updated.length > 0) {
      const sum = updated.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
      setEditPaidAmount(sum);
    }
  };

  const handleInstallmentChange = (id: string, field: keyof SalaryInstallment, value: any) => {
    const updated = editInstallments.map((inst) => {
      if (inst.id === id) {
        return { ...inst, [field]: value };
      }
      return inst;
    });
    setEditInstallments(updated);
    const sum = updated.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    setEditPaidAmount(sum);
  };

  const handleSaveMemberSalary = () => {
    if (!editingSalaryMember) return;
    const activeInstallments = editInstallments.filter((i) => Number(i.amount) > 0 || i.notes);
    const installmentsSum = activeInstallments.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
    const updatedPaid = activeInstallments.length > 0 ? installmentsSum : (Number(editPaidAmount) || 0);

    setSalaryRecords(
      salaryRecords.map((r) =>
        r.memberId === editingSalaryMember.memberId
          ? {
              ...r,
              paidAmount: updatedPaid,
              lastPaymentDate: new Date().toISOString().split('T')[0],
              paymentMonth: editPaymentMonth.trim() || undefined,
              notes: editSalaryNotes.trim() || undefined,
              customValues: { ...editCustomValues },
              installments: activeInstallments,
            }
          : r
      )
    );
    setEditingSalaryMember(null);
  };

  const totalMonthlyPayroll = salaryRecords.reduce((acc, r) => acc + (r.monthlySalary || 0), 0);
  const totalPaidPayroll = salaryRecords.reduce((acc, r) => acc + (r.paidAmount || 0), 0);
  const totalPendingPayroll = Math.max(0, totalMonthlyPayroll - totalPaidPayroll);

  // Office Expenses State & Persistence
  const [officeExpenses, setOfficeExpenses] = useState<OfficeExpense[]>(() => {
    const saved = localStorage.getItem('wpp_studio_office_expenses');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_OFFICE_EXPENSES;
  });

  useEffect(() => {
    localStorage.setItem('wpp_studio_office_expenses', JSON.stringify(officeExpenses));
  }, [officeExpenses]);

  // Modal State for Log New Office Expense
  const [showAddExpenseModal, setShowAddExpenseModal] = useState<boolean>(false);
  const [editingExpense, setEditingExpense] = useState<OfficeExpense | null>(null);
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState<string>('all');
  const [expenseSpentByFilter, setExpenseSpentByFilter] = useState<string>('all');
  const [newExpTitle, setNewExpTitle] = useState<string>('');
  const [newExpAmount, setNewExpAmount] = useState<number | ''>('');
  const [newExpCategory, setNewExpCategory] = useState<string>('Rent');
  const [customExpCategory, setCustomExpCategory] = useState<string>('');
  const [newExpDate, setNewExpDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newExpSpentBy, setNewExpSpentBy] = useState<string>('Owner');
  const [customExpSpentBy, setCustomExpSpentBy] = useState<string>('');
  const [newExpPaidVia, setNewExpPaidVia] = useState<OfficeExpense['paidVia']>('UPI / GPay');
  const [newExpNotes, setNewExpNotes] = useState<string>('');

  const handleOpenAddExpenseWithCategory = (cat: string) => {
    setEditingExpense(null);
    setNewExpTitle(cat === 'Rent' ? 'Office Rent' : cat === 'Electricity & Water' ? 'Electricity Bill' : cat === 'Food & Tea/Chai' ? 'Tea & Refreshments' : cat === 'Travel & Fuel' ? 'Fuel & Vehicle Charge' : cat === 'Albums Print' ? 'Album Printing & Sheets' : cat === 'Photo & Video Edit' ? 'Editing Charge' : '');
    setNewExpAmount('');
    setNewExpCategory(cat);
    setNewExpDate(new Date().toISOString().split('T')[0]);
    setNewExpSpentBy('Owner');
    setNewExpPaidVia('UPI / GPay');
    setNewExpNotes('');
    setShowAddExpenseModal(true);
  };

  const handleOpenEditExpense = (exp: OfficeExpense) => {
    setEditingExpense(exp);
    setNewExpTitle(exp.title);
    setNewExpAmount(exp.amount);
    setNewExpCategory(exp.category);
    setNewExpDate(exp.expenseDate);
    setNewExpSpentBy(exp.spentBy);
    setNewExpPaidVia(exp.paidVia);
    setNewExpNotes(exp.notes || '');
    setShowAddExpenseModal(true);
  };

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpTitle.trim() || !newExpAmount || Number(newExpAmount) <= 0) {
      alert('Please enter a valid expense title and amount!');
      return;
    }
    const finalCategory = newExpCategory || 'Miscellaneous';
    const finalSpentBy = newExpSpentBy.trim() || 'Owner';

    if (editingExpense) {
      setOfficeExpenses((prev) =>
        prev.map((item) =>
          item.id === editingExpense.id
            ? {
                ...item,
                title: newExpTitle.trim(),
                amount: Number(newExpAmount),
                category: finalCategory,
                expenseDate: newExpDate || new Date().toISOString().split('T')[0],
                spentBy: finalSpentBy,
                paidVia: newExpPaidVia,
                notes: newExpNotes.trim() || undefined,
                monthYear: newExpDate ? newExpDate.substring(0, 7) : '2026-08',
              }
            : item
        )
      );
    } else {
      const newExp: OfficeExpense = {
        id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        title: newExpTitle.trim(),
        amount: Number(newExpAmount),
        category: finalCategory,
        expenseDate: newExpDate || new Date().toISOString().split('T')[0],
        spentBy: finalSpentBy,
        paidVia: newExpPaidVia,
        notes: newExpNotes.trim() || undefined,
        monthYear: newExpDate ? newExpDate.substring(0, 7) : '2026-08',
      };

      setOfficeExpenses((prev) => [newExp, ...prev]);
    }

    setShowAddExpenseModal(false);
    setEditingExpense(null);
    setNewExpTitle('');
    setNewExpAmount('');
    setNewExpNotes('');
    setCustomExpCategory('');
    setCustomExpSpentBy('');
  };

  // State for Undo Delete notification & Confirm Delete Modal
  const [undoToast, setUndoToast] = useState<{ message: string; onUndo: () => void } | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<OfficeExpense | null>(null);

  const confirmDeleteExpense = (deletedItem: OfficeExpense) => {
    const idx = officeExpenses.findIndex((e) => e.id === deletedItem.id);
    if (idx === -1) return;

    setOfficeExpenses((prev) => prev.filter((e) => e.id !== deletedItem.id));
    setUndoToast({
      message: `Expense "${deletedItem.title}" (₹${deletedItem.amount.toLocaleString('en-IN')}) deleted`,
      onUndo: () => {
        setOfficeExpenses((prev) => {
          const copy = [...prev];
          copy.splice(idx >= 0 && idx <= copy.length ? idx : 0, 0, deletedItem);
          return copy;
        });
        setUndoToast(null);
      },
    });
  };

  // Date Range Filter State for Financial Ledger (Defaulting to All Time)
  const [finFromDate, setFinFromDate] = useState<string>('');
  const [finToDate, setFinToDate] = useState<string>('');

  // Date Formatting Helper: YYYY-MM-DD -> DD-MM-YYYY
  const formatDateDots = (dateStr: string) => {
    if (!dateStr) return 'ALL';
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3 && parts[0].length === 4) {
        return `${parts[2].padStart(2, '0')}-${parts[1].padStart(2, '0')}-${parts[0]}`;
      }
    }
    return dateStr;
  };

  // Helper to check if a date string falls inside [startDate, endDate]
  const isDateInRange = (dateStr: string, startDate: string, endDate: string) => {
    if (!startDate && !endDate) return true;
    if (!dateStr || dateStr === 'N/A') return false;

    let norm = dateStr.trim().replace(/\//g, '-');
    const parts = norm.split('-');
    if (parts.length === 3) {
      if (parts[2].length === 4) {
        norm = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      } else if (parts[0].length === 4) {
        norm = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      }
    }

    if (startDate && norm < startDate) return false;
    if (endDate && norm > endDate) return false;
    return true;
  };

  // Calculate Monthly Payments Received from Projects (Client Collections Ledger)
  const clientPaymentLogs = React.useMemo(() => {
    const list: {
      id: string;
      clientTitle: string;
      amount: number;
      date: string;
      mode: string;
      type: string;
      receiptNumber?: string;
    }[] = [];

    projects.forEach((p) => {
      if (p.payments && p.payments.length > 0) {
        p.payments.forEach((pay) => {
          list.push({
            id: pay.id,
            clientTitle: p.clientWeddingTitle,
            amount: pay.amount || 0,
            date: pay.date || 'N/A',
            mode: pay.paymentMode || 'UPI / GPay',
            type: pay.type === 'advance' ? 'Advance Payment' : pay.type === 'installment' ? 'Installment' : pay.type === 'settlement' ? 'Final Settlement' : 'Client Payment',
            receiptNumber: pay.receiptNumber,
          });
        });
      } else if (p.advanceReceived && p.advanceReceived > 0) {
        list.push({
          id: `adv_${p.id}`,
          clientTitle: p.clientWeddingTitle,
          amount: p.advanceReceived,
          date: p.createdAt || new Date().toISOString().split('T')[0],
          mode: 'Advance Token',
          type: 'Advance Token',
          receiptNumber: 'ADVANCE',
        });
      }
    });

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [projects]);

  // Filtered Client Payments & Office Expenses by Date Range
  const filteredClientPaymentLogs = React.useMemo(() => {
    return clientPaymentLogs.filter((pay) => isDateInRange(pay.date, finFromDate, finToDate));
  }, [clientPaymentLogs, finFromDate, finToDate]);

  const filteredOfficeExpenses = React.useMemo(() => {
    return officeExpenses
      .filter((exp) => isDateInRange(exp.expenseDate, finFromDate, finToDate))
      .filter((exp) => expenseCategoryFilter === 'all' || exp.category === expenseCategoryFilter)
      .filter((exp) => expenseSpentByFilter === 'all' || exp.spentBy === expenseSpentByFilter);
  }, [officeExpenses, finFromDate, finToDate, expenseCategoryFilter, expenseSpentByFilter]);

  const totalMonthlyPaymentsReceived = React.useMemo(() => {
    return filteredClientPaymentLogs.reduce((acc, item) => acc + item.amount, 0);
  }, [filteredClientPaymentLogs]);

  const totalMonthlyExpenses = React.useMemo(() => {
    return filteredOfficeExpenses.reduce((acc, exp) => acc + exp.amount, 0);
  }, [filteredOfficeExpenses]);

  // Calculations
  const totalRevenue = projects.reduce((acc, p) => acc + (p.totalBudget || 0), 0);
  const totalAdvanceReceived = projects.reduce((acc, p) => acc + (p.advanceReceived || 0), 0);
  const totalBalanceDue = projects.reduce((acc, p) => acc + (p.balanceDue || 0), 0);

  const allProjectsCount = projects.length;
  const readyToDeliverCount = projects.filter(p => p.status === 'ready_to_deliver').length;
  const deliveredProjectsCount = projects.filter(p => p.status === 'completed').length;
  const pendingProjectsCount = projects.filter(p => p.status === 'pending').length;
  const urgentProjectsCount = projects.filter(p => p.status === 'urgent').length;
  const runningProjectsCount = projects.filter(p => p.status === 'running').length;

  const upcomingShoots = projects.flatMap(p => p.shoots.map(s => ({ ...s, clientTitle: p.clientWeddingTitle, projectId: p.id })))
    .filter(s => s.status === 'scheduled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4);

  const isEditor = currentUser?.role === 'Video Editor' || 
                   currentUser?.role === 'Photo Editor' || 
                   currentUser?.role === 'Cinematographer' || 
                   currentUser?.role === 'Lead Photographer' || 
                   (!!currentUser?.role && currentUser.role.toLowerCase().includes('editor'));

  const urgentProjectsList = projects.filter(p => p.status === 'urgent' || p.status === 'running').slice(0, 4);

  return (
    <div className="space-y-6 pb-8">
      
      {/* Welcome Banner */}
      <div className="dashboard-hero bg-slate-900 rounded-xl p-5 border border-slate-800 shadow-md text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-bold tracking-wider uppercase mb-0.5">
            <User className="w-3.5 h-3.5" />
            <span>Studio Dashboard Overview • Wedding Photo Planet CRM</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Welcome Back, {currentUser?.name || 'Manager'}
          </h2>
          <p className="mt-0.5 text-slate-300 text-xs">
            Live studio status: Total revenue, pending deliverables, upcoming shoots, and client balances.
          </p>
        </div>
      </div>

      {/* Live Team Software Alerts for Owner */}
      {(() => {
        const softwareAlerts = team.filter((m) => (m.unauthorizedMinutes || 0) >= 5 || m.isLoggedOut);
        if (softwareAlerts.length === 0) return null;

        return (
          <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl space-y-2 shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
              <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 animate-pulse" />
                <span>Live Software Security & Auto-Logout Alerts ({softwareAlerts.length})</span>
              </h4>
              <button
                onClick={() => setActiveTab('team')}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wider underline flex items-center gap-1"
              >
                <Monitor className="w-3.5 h-3.5" /> Manage Team Roster →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {softwareAlerts.map((m) => (
                <div
                  key={m.id}
                  className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 ${
                    m.isLoggedOut
                      ? 'bg-red-100/90 border-red-300 text-red-900 font-bold'
                      : 'bg-white border-amber-200 text-amber-950 font-medium'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900">{m.name}</span>
                      {m.isLoggedOut ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-red-600 text-white uppercase flex items-center gap-1">
                          <Lock className="w-3 h-3" /> AUTO LOGGED OUT
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-200 text-amber-900 uppercase">
                          {m.unauthorizedMinutes}m UNAUTHORIZED
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Current App: <span className="font-bold text-slate-800">{m.currentSoftware}</span> (Assigned: {m.assignedSoftwares?.join(' | ') || m.assignedSoftware || 'N/A'})
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('team')}
                    className="px-2.5 py-1 bg-indigo-600 text-white rounded font-bold text-[10px] uppercase flex-shrink-0"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* KPI Stats Row matching exact High Density HTML scale */}
      <section className="dashboard-kpis grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        
        {/* Total Revenue */}
        <div 
          onClick={onOpenAllPaymentsModal}
          className="dashboard-kpi dashboard-kpi--revenue bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs cursor-pointer hover:border-indigo-500 hover:ring-2 hover:ring-indigo-100 transition group relative"
          title="Click to view full client payment details, modes & receipts"
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-indigo-600 transition">Total Revenue</p>
            <span className="text-[9px] font-extrabold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition">
              View Audit →
            </span>
          </div>
          <p className="text-xl font-black text-slate-900 mt-1 group-hover:text-indigo-700 transition">₹{totalRevenue.toLocaleString('en-IN')}</p>
          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span className="text-emerald-600 font-bold">Adv: ₹{totalAdvanceReceived.toLocaleString('en-IN')}</span>
            <span className="text-red-500 font-bold">Due: ₹{totalBalanceDue.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* All Projects */}
        <div 
          onClick={() => setActiveTab('projects')}
          className="dashboard-kpi dashboard-kpi--projects bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs cursor-pointer hover:border-indigo-300 transition"
        >
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">All Projects</p>
          <p className="text-xl font-black text-slate-900 mt-1">{allProjectsCount < 10 ? `0${allProjectsCount}` : allProjectsCount}</p>
          <p className="text-[10px] font-semibold text-indigo-600 mt-1">{runningProjectsCount} Currently Running</p>
        </div>

        {/* Ready to Deliver */}
        <div 
          onClick={() => setActiveTab('deliveries')}
          className="dashboard-kpi dashboard-kpi--ready bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs cursor-pointer hover:border-indigo-300 transition"
        >
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ready to Deliver</p>
          <p className="text-xl font-black text-indigo-600 mt-1">{readyToDeliverCount < 10 ? `0${readyToDeliverCount}` : readyToDeliverCount}</p>
          <p className="text-[10px] text-slate-500 mt-1">Films & Albums Ready</p>
        </div>

        {/* Delivered */}
        <div 
          onClick={() => setActiveTab('projects')}
          className="dashboard-kpi dashboard-kpi--delivered bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs cursor-pointer hover:border-green-300 transition"
        >
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Delivered</p>
          <p className="text-xl font-black text-green-600 mt-1">{deliveredProjectsCount < 10 ? `0${deliveredProjectsCount}` : deliveredProjectsCount}</p>
          <p className="text-[10px] text-slate-500 mt-1">Completed Archive</p>
        </div>

        {/* Pending */}
        <div 
          onClick={() => setActiveTab('projects')}
          className="dashboard-kpi dashboard-kpi--pending bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs cursor-pointer hover:border-amber-300 transition"
        >
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending</p>
          <p className="text-xl font-black text-amber-500 mt-1">{pendingProjectsCount < 10 ? `0${pendingProjectsCount}` : pendingProjectsCount}</p>
          <p className="text-[10px] text-slate-500 mt-1">Awaiting Shoots/Edits</p>
        </div>

        {/* Urgent */}
        <div 
          onClick={() => setActiveTab('projects')}
          className="dashboard-kpi dashboard-kpi--urgent bg-red-50 p-3.5 rounded-lg border border-red-200 shadow-xs cursor-pointer hover:border-red-300 transition"
        >
          <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Urgent</p>
          <p className="text-xl font-black text-red-600 mt-1">{urgentProjectsCount < 10 ? `0${urgentProjectsCount}` : urgentProjectsCount}</p>
          <p className="text-[10px] text-red-500 font-medium mt-1">Deadline Approaching</p>
        </div>

      </section>

      {/* Main Grid: Financial & Pipeline Radar + Upcoming Shoots */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left Column (2 Cols wide): Active Projects & Revenue Summary */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Revenue Breakdown Box */}
          <section className="dashboard-panel dashboard-panel--finance bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                  <IndianRupee className="w-4 h-4 text-indigo-600" />
                  Financial Collection Status (₹)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Studio revenue collection progress vs pending client balances</p>
              </div>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full uppercase">
                {currentUser?.name ? `${currentUser.name} Studio Ledger` : 'Studio Ledger'}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-green-700">Advance Received: ₹{totalAdvanceReceived.toLocaleString('en-IN')}</span>
                <span className="text-red-600">Balance Due: ₹{totalBalanceDue.toLocaleString('en-IN')}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200">
                <div 
                  className="bg-green-500 h-full transition-all duration-500" 
                  style={{ width: `${totalRevenue > 0 ? (totalAdvanceReceived / totalRevenue) * 100 : 0}%` }}
                />
                <div 
                  className="bg-red-500 h-full transition-all duration-500" 
                  style={{ width: `${totalRevenue > 0 ? (totalBalanceDue / totalRevenue) * 100 : 0}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                <span>Total Bookings: ₹{totalRevenue.toLocaleString('en-IN')}</span>
                <span>{totalRevenue > 0 ? Math.round((totalAdvanceReceived / totalRevenue) * 100) : 0}% Collected</span>
              </div>
            </div>
          </section>

          {/* Urgent & Active Projects List */}
          <section className="dashboard-panel dashboard-panel--projects bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  Client Projects & Delivery Deadlines
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('projects')}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 uppercase tracking-wider"
              >
                <span>View All ({projects.length})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 space-y-2.5">
              {urgentProjectsList.map((project) => (
                <div
                  key={project.id}
                  onClick={() => onSelectProject(project)}
                  className="dashboard-row p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-indigo-300 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition text-sm">
                        {project.clientWeddingTitle}
                      </h4>
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider ${
                        project.status === 'urgent'
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : project.status === 'ready_to_deliver'
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                      }`}>
                        {(project.status || '').replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {project.venueLocation}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {project.clientContactMobile}
                      </span>
                      <span>•</span>
                      <span className="text-indigo-600 font-semibold">{project.primaryServiceType}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto text-right">
                    {!isEditor && (
                      <div>
                        <div className="text-[11px] font-semibold text-slate-600">
                          Budget: ₹{project.totalBudget.toLocaleString('en-IN')}
                        </div>
                        <div className={`text-xs font-bold ${project.balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {project.balanceDue > 0 ? `Due: ₹${project.balanceDue.toLocaleString('en-IN')}` : 'Paid in Full'}
                        </div>
                      </div>
                    )}
                    <div className="w-7 h-7 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </section>

        </div>

        {/* Right Column (1 Col wide): Upcoming Shoots & Quick Controls */}
        <div className="space-y-5">
          
          {/* Upcoming Shoot Schedule */}
          <section className="dashboard-panel dashboard-panel--shoots bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col">
            <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 rounded-t-xl flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-600" />
                Upcoming Shoots
              </h3>
              <button
                onClick={() => setActiveTab('shoots')}
                className="text-[10px] font-bold text-indigo-600 hover:underline uppercase"
              >
                Shoot Hub
              </button>
            </div>

            <div className="p-3.5 space-y-2.5">
              {upcomingShoots.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center italic">No upcoming shoots scheduled.</p>
              ) : (
                upcomingShoots.map((shoot) => (
                  <div key={shoot.id} className="dashboard-shoot p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{shoot.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono font-bold">
                        {shoot.date}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] truncate font-medium">{shoot.clientTitle}</p>
                    <div className="text-slate-500 flex items-center gap-1 text-[11px]">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span className="truncate">{shoot.venue}</span>
                    </div>
                    <div className="pt-1.5 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-200 font-medium">
                      <span>Lead: {shoot.leadPhotographer}</span>
                      <span className="text-indigo-600 font-bold">Drone: {shoot.droneOperator}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Monthly Staff Salary Status relocated into unified master grid below */}
        </div>

      </div>

      {/* TEAM MEMBERS DAILY REPORTING & LOG-IN STATUS WIDGET */}
      <TeamDailyReportingWidget
        team={team}
        attendance={attendance}
        tasks={tasks}
        projects={projects}
        onUpdateTask={onUpdateTask}
        onDeleteTask={onDeleteTask}
        onAddTask={onAddTask}
        onOpenMemberModal={onOpenMemberModal}
      />

      {/* Date Selection Filter Bar for Financials */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-3.5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-indigo-100 text-indigo-800 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-black text-slate-900 uppercase tracking-tight">
              Monthly Financial & Expense Ledger
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Select a month to see total client payments received vs office expenses & staff salaries</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Filter Month Preset Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setFinFromDate('2026-08-01');
                setFinToDate('2026-08-31');
              }}
              className={`px-2.5 py-1 rounded-lg font-extrabold text-[11px] transition cursor-pointer ${
                finFromDate === '2026-08-01' && finToDate === '2026-08-31'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200'
              }`}
            >
              📅 This Month (Aug 2026)
            </button>
            <button
              type="button"
              onClick={() => {
                setFinFromDate('2026-07-01');
                setFinToDate('2026-07-31');
              }}
              className={`px-2.5 py-1 rounded-lg font-extrabold text-[11px] transition cursor-pointer ${
                finFromDate === '2026-07-01' && finToDate === '2026-07-31'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              📅 July 2026
            </button>
            <button
              type="button"
              onClick={() => {
                setFinFromDate('2026-06-01');
                setFinToDate('2026-06-30');
              }}
              className={`px-2.5 py-1 rounded-lg font-extrabold text-[11px] transition cursor-pointer ${
                finFromDate === '2026-06-01' && finToDate === '2026-06-30'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              📅 June 2026
            </button>
            <button
              type="button"
              onClick={() => {
                setFinFromDate('');
                setFinToDate('');
              }}
              className={`px-2.5 py-1 rounded-lg font-extrabold text-[11px] transition cursor-pointer ${
                !finFromDate && !finToDate
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              🌐 All Time
            </button>
          </div>

          {/* Custom Date Range Picker */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase">From:</span>
            <input
              type="date"
              value={finFromDate}
              onChange={(e) => setFinFromDate(e.target.value)}
              className="text-[11px] font-mono font-bold bg-white border border-slate-300 rounded px-1.5 py-0.5 text-slate-800 focus:outline-indigo-600 shadow-2xs"
            />
            <span className="text-[10px] font-extrabold text-slate-500 uppercase">To:</span>
            <input
              type="date"
              value={finToDate}
              onChange={(e) => setFinToDate(e.target.value)}
              className="text-[11px] font-mono font-bold bg-white border border-slate-300 rounded px-1.5 py-0.5 text-slate-800 focus:outline-indigo-600 shadow-2xs"
            />
            {(finFromDate || finToDate) && (
              <button
                type="button"
                onClick={() => {
                  setFinFromDate('');
                  setFinToDate('');
                }}
                className="text-[10px] bg-slate-200 hover:bg-red-50 text-slate-700 hover:text-red-600 font-extrabold px-1.5 py-0.5 rounded cursor-pointer ml-1"
                title="Show All Time"
              >
                ✕ Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MONTHLY SUMMARY CASHFLOW & P&L BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-4 md:p-5 text-white shadow-xl border border-indigo-500/30 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-indigo-800/60 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 font-extrabold text-[10px] uppercase tracking-wider">
                Monthly Profit & Loss Summary
              </span>
              <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                Period: {formatDateDots(finFromDate)} to {formatDateDots(finToDate)}
              </span>
            </div>
            <h3 className="text-base md:text-lg font-black text-white mt-1">
              Monthly Inflow vs Outflow
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddExpenseModal(true)}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold rounded-xl transition shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> + Add Expense
            </button>
            <button
              onClick={() => {
                if (onOpenAllPaymentsModal) {
                  onOpenAllPaymentsModal();
                } else {
                  setActiveTab('projects');
                }
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl transition shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" /> + Record Payment
            </button>
          </div>
        </div>

        {/* 4 Financial KPI Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Card 1: Total Client Payments Received */}
          <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-xl p-3.5 backdrop-blur-xs">
            <div className="flex items-center justify-between text-emerald-300">
              <span className="text-[10px] font-extrabold uppercase tracking-wider">Payments Received</span>
              <CreditCard className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xl md:text-2xl font-black text-emerald-400 mt-1">
              ₹{totalMonthlyPaymentsReceived.toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] text-emerald-200/80 font-medium mt-1">
              From {filteredClientPaymentLogs.length} client payments
            </p>
          </div>

          {/* Card 2: Total Office Expenses */}
          <div className="bg-rose-950/50 border border-rose-500/40 rounded-xl p-3.5 backdrop-blur-xs">
            <div className="flex items-center justify-between text-rose-300">
              <span className="text-[10px] font-extrabold uppercase tracking-wider">Office Expenses</span>
              <Receipt className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-xl md:text-2xl font-black text-rose-400 mt-1">
              ₹{totalMonthlyExpenses.toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] text-rose-200/80 font-medium mt-1">
              Rent, Chai, Fuel, Bills & Repair
            </p>
          </div>

          {/* Card 3: Staff Salary / Payroll Paid */}
          <div className="bg-sky-950/50 border border-sky-500/40 rounded-xl p-3.5 backdrop-blur-xs">
            <div className="flex items-center justify-between text-sky-300">
              <span className="text-[10px] font-extrabold uppercase tracking-wider">Staff Salaries Paid</span>
              <Users className="w-4 h-4 text-sky-400" />
            </div>
            <p className="text-xl md:text-2xl font-black text-sky-400 mt-1">
              ₹{totalPaidPayroll.toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] text-sky-200/80 font-medium mt-1">
              Team Member Salary Disbursed
            </p>
          </div>

          {/* Card 4: Net Profit / Cash Balance */}
          {(() => {
            const totalOutflow = totalMonthlyExpenses + totalPaidPayroll;
            const netProfit = totalMonthlyPaymentsReceived - totalOutflow;
            const isProfit = netProfit >= 0;

            return (
              <div
                className={`border rounded-xl p-3.5 backdrop-blur-xs ${
                  isProfit
                    ? 'bg-indigo-950/80 border-indigo-400/50 text-indigo-100'
                    : 'bg-red-950/80 border-red-500/50 text-red-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider">
                    {isProfit ? '🟢 Net Profit' : '🔻 Deficit'}
                  </span>
                  <IndianRupee className="w-4 h-4" />
                </div>
                <p
                  className={`text-xl md:text-2xl font-black mt-1 ${
                    isProfit ? 'text-amber-300' : 'text-red-300'
                  }`}
                >
                  ₹{Math.abs(netProfit).toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] opacity-80 font-medium mt-1">
                  Outflow: ₹{totalOutflow.toLocaleString('en-IN')}
                </p>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Monthly Financials & Payroll Master Grid: Payments Received + Monthly Expense (Left) & Staff Salary Status (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-1">
        
        {/* Left Column (2 Cols wide): Monthly Payment Received & Monthly Expense */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Card 1: Monthly Payment Received (Client Collections) */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <span>Monthly Payment Received</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      {formatDateDots(finFromDate)} - {formatDateDots(finToDate)}
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium">Client Advance & Installments Ledger</p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (onOpenAllPaymentsModal) {
                    onOpenAllPaymentsModal();
                  } else {
                    setActiveTab('projects');
                  }
                }}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] transition shadow-2xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Record Payment
              </button>
            </div>

            {/* Payment Summary Stats */}
            <div className="grid grid-cols-3 gap-1 text-center text-xs bg-slate-50 p-2 rounded-xl border border-slate-200">
              <div className="border-r border-slate-200 pr-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Total Received</span>
                <span className="font-black text-emerald-600 text-[11px]">₹{totalMonthlyPaymentsReceived.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-r border-slate-200 pr-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Logged Items</span>
                <span className="font-black text-slate-900 text-[11px]">{filteredClientPaymentLogs.length} Records</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Total Bookings</span>
                <span className="font-black text-slate-900 text-[11px]">₹{totalRevenue.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Recent Collections Table / List */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {filteredClientPaymentLogs.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center italic">No client payments recorded for selected date range ({formatDateDots(finFromDate)} to {formatDateDots(finToDate)}).</p>
              ) : (
                filteredClientPaymentLogs.map((pay) => (
                  <div key={pay.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs gap-2 hover:border-emerald-200 transition">
                    <div className="min-w-0">
                      <div className="font-extrabold text-slate-900 truncate text-[11px]">{pay.clientTitle}</div>
                      <div className="text-[10px] font-mono font-bold text-slate-500 mt-0.5">{pay.date}</div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-black text-emerald-600 text-xs">
                        + ₹{pay.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Card 2: Monthly Expense (Studio & Office Outflow) */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-100 text-rose-800 rounded-xl">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <span>Monthly Office Expense</span>
                    <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                      {formatDateDots(finFromDate)} - {formatDateDots(finToDate)}
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium">Rent, Fuel, Equipment, Snacks & Bills Ledger</p>
                </div>
              </div>

              <button
                onClick={() => setShowAddExpenseModal(true)}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[10px] transition shadow-2xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Log New Expense
              </button>
            </div>

            {/* Expense Summary Stats */}
            <div className="grid grid-cols-3 gap-1 text-center text-xs bg-slate-50 p-2 rounded-xl border border-slate-200">
              <div className="border-r border-slate-200 pr-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Office Expenses</span>
                <span className="font-black text-rose-600 text-[11px]">₹{totalMonthlyExpenses.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-r border-slate-200 pr-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Staff Salaries</span>
                <span className="font-black text-slate-900 text-[11px]">₹{totalPaidPayroll.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-indigo-700 uppercase block">Total Outflow</span>
                <span className="font-black text-indigo-700 text-[11px]">₹{(totalMonthlyExpenses + totalPaidPayroll).toLocaleString('en-IN')}</span>
              </div>
            </div>



            {/* Category & Spent By Filters */}
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-0.5">Filter Category</label>
                <select
                  value={expenseCategoryFilter}
                  onChange={(e) => setExpenseCategoryFilter(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800 font-bold text-[11px] focus:ring-2 focus:ring-rose-500 cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  <option value="Rent">Rent</option>
                  <option value="Electricity & Water">Electricity & Water</option>
                  <option value="Studio Equipment & Repair">Equipment & Repair</option>
                  <option value="Food & Tea/Chai">Food & Tea/Chai</option>
                  <option value="Travel & Fuel">Travel & Fuel</option>
                  <option value="Software & Subscriptions">Software & Subscriptions</option>
                  <option value="Marketing & Ads">Marketing & Ads</option>
                  <option value="Exposing & Operating">Exposing & Operating</option>
                  <option value="Albums Print">Albums Print</option>
                  <option value="Photo & Video Edit">Photo & Video Edit</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                  <option value="Other">Other</option>
                  {Array.from(new Set<string>(officeExpenses.map(e => String(e.category))))
                    .filter((c: string) => !['Rent', 'Electricity & Water', 'Studio Equipment & Repair', 'Food & Tea/Chai', 'Travel & Fuel', 'Software & Subscriptions', 'Marketing & Ads', 'Exposing & Operating', 'Albums Print', 'Photo & Video Edit', 'Miscellaneous', 'Other'].includes(c))
                    .map(customCat => (
                      <option key={customCat} value={customCat}>{customCat}</option>
                    ))
                  }
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-0.5">Filter Spent By</label>
                <select
                  value={expenseSpentByFilter}
                  onChange={(e) => setExpenseSpentByFilter(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800 font-bold text-[11px] focus:ring-2 focus:ring-rose-500 cursor-pointer"
                >
                  <option value="all">All Persons / Roles</option>
                  <option value="Owner">Spent by Owner</option>
                  <option value="Studio Manager">Spent by Studio Manager</option>
                  <option value="Account Manager">Spent by Account Manager</option>
                  <option value="Other Staff">Spent by Other Staff</option>
                  {Array.from(new Set<string>(officeExpenses.map(e => String(e.spentBy))))
                    .filter((sb: string) => !['Owner', 'Studio Manager', 'Account Manager', 'Other Staff'].includes(sb))
                    .map(customSb => (
                      <option key={customSb} value={customSb}>{customSb}</option>
                    ))
                  }
                </select>
              </div>
            </div>

            {/* Expenses List */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {filteredOfficeExpenses.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center italic">No office expenses logged for selected filters.</p>
              ) : (
                filteredOfficeExpenses.map((exp) => (
                  <div key={exp.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs gap-2 hover:border-rose-200 transition">
                    <div className="min-w-0 flex-1">
                      <div className="font-extrabold text-slate-900 truncate text-[11px]">{exp.title}</div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-mono font-bold text-slate-500">{exp.expenseDate}</span>
                        <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 font-bold text-[9px] rounded">
                          {exp.category}
                        </span>
                        <span className="px-1.5 py-0.2 bg-rose-50 text-rose-700 border border-rose-100 font-bold text-[9px] rounded">
                          Spent by: {exp.spentBy}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-black text-rose-600 text-xs">
                        - ₹{exp.amount.toLocaleString('en-IN')}
                      </span>
                      <button
                        onClick={() => handleOpenEditExpense(exp)}
                        className="text-slate-400 hover:text-indigo-600 p-1 rounded transition cursor-pointer"
                        title="Edit expense"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setExpenseToDelete(exp)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded transition cursor-pointer"
                        title="Delete expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>

        {/* Right Column (1 Col wide): Monthly Staff Salary Status */}
        <div className="lg:col-span-1">
          <section className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col gap-3.5 h-full min-h-[460px]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">
                    Monthly Staff Salary Status
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium">Payroll Tracker & Pending Dues</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('team')}
                  className="text-[10px] font-bold text-indigo-600 hover:underline uppercase hidden sm:inline"
                >
                  Team Roster →
                </button>
              </div>
            </div>

            {/* Overall Payroll Summary Pills */}
            <div className="grid grid-cols-3 gap-1 text-center text-xs bg-slate-50 p-2 rounded-xl border border-slate-200 shrink-0">
              <div className="border-r border-slate-200 pr-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Total Base</span>
                <span className="font-black text-slate-900 text-[11px]">₹{totalMonthlyPayroll.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-r border-slate-200 pr-1">
                <span className="text-[9px] font-bold text-emerald-600 uppercase block">Total Paid</span>
                <span className="font-black text-emerald-700 text-[11px]">₹{totalPaidPayroll.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-red-600 uppercase block">Pending Due</span>
                <span className="font-black text-red-700 text-[11px]">₹{totalPendingPayroll.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Individual Team Salary Rows */}
            <div className="space-y-2 flex-1 min-h-0 max-h-[500px] overflow-y-auto pr-1">
              {salaryRecords.map((m) => {
                const pending = Math.max(0, m.monthlySalary - m.paidAmount);
                const isFull = pending === 0;
                const isPartial = m.paidAmount > 0 && pending > 0;

                return (
                  <div key={m.memberId} className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200 hover:border-indigo-200 transition space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-slate-900 text-xs truncate">{m.memberName}</span>
                          <span className="text-[10px] text-slate-500 font-medium truncate">({m.role})</span>
                        </div>
                        <span className="text-[10px] text-slate-600 font-bold block">
                          Fixed Salary: <span className="font-mono text-slate-900 font-black">₹{m.monthlySalary.toLocaleString('en-IN')}</span>/mo
                        </span>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase shrink-0 ${
                        isFull
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : isPartial
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {isFull ? '✓ Paid' : isPartial ? 'Partially Paid' : 'Pending'}
                      </span>
                    </div>

                    {/* Installments / Payment Parts Breakdown */}
                    {m.installments && m.installments.length > 0 && (
                      <div className="text-[10px] bg-indigo-50/80 rounded-lg p-1.5 space-y-1 border border-indigo-100">
                        <span className="font-extrabold text-indigo-900 block text-[9px] uppercase tracking-wider">
                          Payment Parts ({m.installments.length} Installment{m.installments.length !== 1 ? 's' : ''}):
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {m.installments.map((inst, idx) => (
                            <span key={inst.id || idx} className="bg-white border border-indigo-200 text-indigo-950 px-1.5 py-0.5 rounded font-bold text-[9px] shadow-2xs">
                              Part #{idx + 1}: <span className="font-mono text-emerald-700 font-extrabold">₹{(inst.amount || 0).toLocaleString('en-IN')}</span> ({inst.mode || 'GPay'})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="font-bold text-emerald-700">
                          Paid: ₹{m.paidAmount.toLocaleString('en-IN')}
                        </span>
                        <span className={`font-bold ${pending > 0 ? 'text-red-600 font-extrabold' : 'text-slate-400'}`}>
                          Due: ₹{pending.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <button
                        onClick={() => handleOpenEditModal(m)}
                        className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded text-[10px] transition shadow-2xs flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <Pencil className="w-3 h-3" /> Pay / Edit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

      </div>


      {/* Edit Salary Modal */}
      {editingSalaryMember && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full border border-slate-200 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Wallet className="w-4 h-4 text-indigo-600" />
                <span>Update Salary Payment ({editingSalaryMember.memberName})</span>
              </h4>
              <button
                type="button"
                onClick={() => setEditingSalaryMember(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Role, Base Salary & Attendance Tracked Pending Balance */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-800 text-xs">
                      Role: <span className="font-semibold text-slate-600">{editingSalaryMember.role}</span>
                    </p>
                    <p className="font-bold text-slate-800 text-xs">
                      Monthly Base Salary: <span className="font-mono text-indigo-700 font-black">₹{editingSalaryMember.monthlySalary.toLocaleString('en-IN')}</span>
                    </p>
                  </div>
                  <div className="text-right bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-[9px] font-black text-slate-500 block uppercase tracking-wider">
                      Current Pending Balance
                    </span>
                    <span className="font-mono text-base font-black text-red-600">
                      ₹{pendingAttendanceBalance.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[9px] text-slate-400 block font-medium">
                      (Base: ₹{pendingBaseBalance.toLocaleString('en-IN')})
                    </span>
                  </div>
                </div>

                {/* Live Attendance Tracking Summary Box */}
                <div className="bg-indigo-50/90 rounded-lg p-2.5 border border-indigo-100 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-indigo-200/60 pb-1.5">
                    <span className="font-extrabold text-indigo-950 text-[11px] flex items-center gap-1.5 uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Live Attendance Tracked Pay</span>
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setSelectedSalaryMonth('2026-07')}
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold transition cursor-pointer ${
                          selectedSalaryMonth === '2026-07'
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-white text-indigo-900 border border-indigo-200 hover:bg-indigo-50'
                        }`}
                      >
                        July 2026
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedSalaryMonth('2026-08')}
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold transition cursor-pointer ${
                          selectedSalaryMonth === '2026-08'
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-white text-indigo-900 border border-indigo-200 hover:bg-indigo-50'
                        }`}
                      >
                        August 2026
                      </button>
                      <span className="text-[10px] font-black text-indigo-800 bg-white px-2 py-0.5 rounded border border-indigo-200 shadow-2xs ml-0.5">
                        {memberAttendanceLogs.length} Days (1 Month)
                      </span>
                    </div>
                  </div>

                  {/* Attendance Stats Badges Grid */}
                  <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                    <div className="bg-white p-1.5 rounded-lg border border-emerald-200 shadow-2xs">
                      <span className="text-emerald-700 font-extrabold block text-[9px] uppercase">Present</span>
                      <span className="font-black text-slate-900 text-xs">{presentDays} Days</span>
                    </div>
                    <div className="bg-white p-1.5 rounded-lg border border-amber-200 shadow-2xs">
                      <span className="text-amber-700 font-extrabold block text-[9px] uppercase">Half Day</span>
                      <span className="font-black text-slate-900 text-xs">{halfDays} Days</span>
                    </div>
                    <div className="bg-white p-1.5 rounded-lg border border-red-200 shadow-2xs">
                      <span className="text-red-700 font-extrabold block text-[9px] uppercase">Absent</span>
                      <span className="font-black text-slate-900 text-xs">{absentDays} Days</span>
                    </div>
                    <div className="bg-white p-1.5 rounded-lg border border-indigo-200 shadow-2xs">
                      <span className="text-indigo-700 font-extrabold block text-[9px] uppercase">Daily Rate</span>
                      <span className="font-black font-mono text-slate-900 text-xs">₹{estimatedDailyRate.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Attendance Earned Amount vs Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-indigo-200/60 text-xs">
                    <div>
                      <span className="text-slate-600 font-bold">Attendance Earned: </span>
                      <span className="font-mono font-black text-emerald-700 text-xs bg-white px-1.5 py-0.5 rounded border border-emerald-200">
                        ₹{attendanceEarnedPay.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setEditPaidAmount(attendanceEarnedPay)}
                      className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] rounded transition cursor-pointer shadow-2xs flex items-center justify-center gap-1"
                      title="Set Paid Amount equal to Attendance Earned Salary"
                    >
                      ⚡ Pay Attendance Salary (₹{attendanceEarnedPay.toLocaleString('en-IN')})
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Total Amount Paid (₹)</label>
                <input
                  type="number"
                  value={editPaidAmount}
                  onChange={(e) => setEditPaidAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Enter Amount Paid (₹)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setEditPaidAmount(attendanceEarnedPay)}
                    className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px] hover:bg-emerald-200 cursor-pointer"
                  >
                    Pay Attendance (₹{attendanceEarnedPay.toLocaleString('en-IN')})
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditPaidAmount(editingSalaryMember.monthlySalary)}
                    className="px-2 py-0.5 bg-indigo-100 text-indigo-800 font-bold rounded text-[10px] hover:bg-indigo-200 cursor-pointer"
                  >
                    Mark Full Base Paid (₹{editingSalaryMember.monthlySalary.toLocaleString('en-IN')})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditPaidAmount(0);
                      setEditInstallments([]);
                    }}
                    className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded text-[10px] hover:bg-slate-200 cursor-pointer"
                  >
                    Reset (₹0)
                  </button>
                </div>
              </div>

              {/* Installments / Part Payments Breakdown (2-3 parts) */}
              <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-indigo-950 text-xs flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Pay in Parts / Installments</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddInstallment}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg transition flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3 h-3 stroke-[3]" />
                    <span>+ Add Payment Part</span>
                  </button>
                </div>

                {editInstallments.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic">
                    If paying in 2-3 parts/installments, click "+ Add Payment Part" above.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {editInstallments.map((inst, index) => (
                      <div key={inst.id} className="bg-white p-2.5 rounded-lg border border-indigo-200 space-y-2 text-xs shadow-2xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                          <span className="font-black text-indigo-900 text-[10px] uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                            Part #{index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveInstallment(inst.id)}
                            className="text-slate-400 hover:text-red-600 transition p-0.5 cursor-pointer"
                            title="Remove this installment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Amount (₹)</label>
                            <input
                              type="number"
                              value={inst.amount === 0 ? '' : inst.amount}
                              onChange={(e) => handleInstallmentChange(inst.id, 'amount', e.target.value === '' ? '' : Number(e.target.value))}
                              placeholder="e.g. 20000"
                              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 font-bold text-slate-900 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Payment Date</label>
                            <input
                              type="date"
                              value={inst.date}
                              onChange={(e) => handleInstallmentChange(inst.id, 'date', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 font-medium text-slate-900 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Payment Mode</label>
                            <select
                              value={inst.mode}
                              onChange={(e) => handleInstallmentChange(inst.id, 'mode', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 font-bold text-slate-800 text-xs outline-none"
                            >
                              <option value="GPay">GPay / Google Pay</option>
                              <option value="PhonePe">PhonePe</option>
                              <option value="Paytm">Paytm</option>
                              <option value="UPI">UPI / QR Code</option>
                              <option value="Cash">Cash Handover</option>
                              <option value="Bank Transfer">Bank Transfer (NEFT)</option>
                              <option value="Cheque">Cheque</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Remarks / Notes</label>
                            <input
                              type="text"
                              value={inst.notes || ''}
                              onChange={(e) => handleInstallmentChange(inst.id, 'notes', e.target.value)}
                              placeholder="e.g. Part 1 advance"
                              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 font-medium text-slate-900 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="text-[10px] font-bold text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200 flex items-center justify-between">
                      <span>Total of Installments:</span>
                      <span className="font-black font-mono text-xs text-emerald-900">
                        ₹{editInstallments.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                )}
              </div>


            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingSalaryMember(null)}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 font-bold rounded-lg text-xs hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveMemberSalary}
                className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-lg text-xs hover:bg-indigo-700 shadow-xs cursor-pointer"
              >
                Save Payment Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Log / Edit Office Expense */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full border border-slate-200 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Receipt className="w-4 h-4 text-rose-600" />
                <span>{editingExpense ? 'Edit Office Expense Record' : 'Log New Studio & Office Expense'}</span>
              </h4>
              <button
                type="button"
                onClick={() => {
                  setShowAddExpenseModal(false);
                  setEditingExpense(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddExpenseSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Expense Title / Item Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Studio Rent, Electricity Bill, Chai & Biscuits, Sony Lens Repair"
                  value={newExpTitle}
                  onChange={(e) => setNewExpTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g., 5000"
                    value={newExpAmount}
                    onChange={(e) => setNewExpAmount(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expense Date</label>
                  <input
                    type="date"
                    required
                    value={newExpDate}
                    onChange={(e) => setNewExpDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newExpCategory}
                    onChange={(e) => setNewExpCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium cursor-pointer"
                  >
                    <option value="Rent">Rent</option>
                    <option value="Electricity & Water">Electricity & Water</option>
                    <option value="Studio Equipment & Repair">Studio Equipment & Repair</option>
                    <option value="Food & Tea/Chai">Food & Tea/Chai</option>
                    <option value="Travel & Fuel">Travel & Fuel</option>
                    <option value="Software & Subscriptions">Software & Subscriptions</option>
                    <option value="Marketing & Ads">Marketing & Ads</option>
                    <option value="Exposing & Operating">Exposing & Operating</option>
                    <option value="Albums Print">Albums Print</option>
                    <option value="Photo & Video Edit">Photo & Video Edit</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Mode</label>
                  <select
                    value={newExpPaidVia}
                    onChange={(e) => setNewExpPaidVia(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium cursor-pointer"
                  >
                    <option value="UPI / GPay">UPI / GPay</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Credit Card">Credit Card</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Spent By (Person / Staff Name)</label>
                <input
                  type="text"
                  placeholder="Enter person name / role (e.g. Owner, Studio Manager, Ramesh)"
                  value={newExpSpentBy}
                  onChange={(e) => setNewExpSpentBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium text-xs bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes / Voucher Ref (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Bill #102, paid via PhonePe"
                  value={newExpNotes}
                  onChange={(e) => setNewExpNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddExpenseModal(false);
                    setEditingExpense(null);
                  }}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-xs cursor-pointer"
                >
                  {editingExpense ? 'Update Expense Record' : 'Save Office Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Expense Modal */}
      <ConfirmDeleteModal
        isOpen={!!expenseToDelete}
        title="Delete Office Expense"
        itemTitle={expenseToDelete ? `${expenseToDelete.title} (₹${expenseToDelete.amount.toLocaleString('en-IN')})` : ''}
        message={expenseToDelete ? `Are you sure you want to delete expense "${expenseToDelete.title}" (₹${expenseToDelete.amount.toLocaleString('en-IN')})?` : ''}
        onConfirm={() => {
          if (expenseToDelete) {
            confirmDeleteExpense(expenseToDelete);
            setExpenseToDelete(null);
          }
        }}
        onCancel={() => setExpenseToDelete(null)}
      />

      {/* Floating Undo Notification */}
      {undoToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700">
          <span className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg text-sm">🗑️</span>
          <div className="text-xs">
            <span className="font-bold">{undoToast.message}</span>
          </div>
          <button
            onClick={undoToast.onUndo}
            className="ml-2 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-black text-xs rounded-xl shadow transition cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Undo / Restore
          </button>
          <button
            onClick={() => setUndoToast(null)}
            className="text-slate-400 hover:text-white text-xs font-bold px-1.5 py-1 cursor-pointer"
            title="Close"
          >
            ✕
          </button>
        </div>
      )}

    </div>

  );
};
