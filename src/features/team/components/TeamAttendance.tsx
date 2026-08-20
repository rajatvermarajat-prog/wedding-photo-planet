import React, { useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TeamMember, AttendanceRecord, Project, TeamTask } from '@/types';
import { generateJulyToAugustAttendance } from '@/data/mockData';
import { MemberDashboardModal } from './MemberDashboardModal';
import { TeamDailyReportingWidget } from './TeamDailyReportingWidget';
import { 
  Users, 
  UserCheck, 
  Plus, 
  Phone, 
  Mail, 
  Trash2, 
  Check, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  ShieldAlert, 
  Monitor, 
  LogOut, 
  Sparkles,
  RefreshCw,
  X,
  Clock,
  IndianRupee,
  ShieldCheck,
  ExternalLink,
  Pencil,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Move,
  GripVertical,
  ChevronLeft,
  ChevronRight,
  Printer,
  Download,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  BarChart3,
  FileText,
  Building2,
  Camera,
  CheckCircle2
} from 'lucide-react';

export const SOFTWARE_OPTIONS = [
  'Adobe Premiere Pro CC (Video Editing)',
  'DaVinci Resolve Studio (Color Grading)',
  'Adobe Photoshop CC (Photo Retouching)',
  'Adobe Lightroom Classic (Coloring & Culling)',
  'Final Cut Pro X (Mac Video Editing)',
  'After Effects CC (VFX & Motion Graphics)',
  'Canvera Album Design Software',
];

export const UNAUTHORIZED_APPS_SIMULATION = [
  'Google Chrome / YouTube Shorts',
  'Instagram Web / Social Media',
  'Steam / PC Games',
  'Netflix / Video Streaming',
  'Telegram / Personal Chat App',
];

interface MemberSoftwareManagerProps {
  member: TeamMember;
  getPermittedSoftwares: (m: TeamMember) => string[];
  onAddSoftware: (member: TeamMember, software: string) => void;
  onRemoveSoftware: (member: TeamMember, software: string) => void;
}

const MemberSoftwareManager: React.FC<MemberSoftwareManagerProps> = ({
  member,
  getPermittedSoftwares,
  onAddSoftware,
  onRemoveSoftware,
}) => {
  const [customInput, setCustomInput] = useState('');
  const permitted = getPermittedSoftwares(member);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      onAddSoftware(member, customInput.trim());
      setCustomInput('');
    }
  };

  const commonPresets = [
    'Adobe Premiere Pro',
    'DaVinci Resolve',
    'Adobe Photoshop',
    'Adobe Lightroom',
    'After Effects',
    'Final Cut Pro',
  ];

  return (
    <div className="space-y-2 pt-1.5 border-t border-slate-200/60">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
          Permitted Softwares ({permitted.length}):
        </label>
        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
          Manual Tagging
        </span>
      </div>

      {/* Currently Permitted Software Badges */}
      {permitted.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
          {permitted.map((sw) => (
            <span
              key={sw}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-900 border border-indigo-200 shadow-2xs"
            >
              <span className="truncate max-w-[150px]">{sw}</span>
              <button
                type="button"
                onClick={() => onRemoveSoftware(member, sw)}
                className="w-4 h-4 rounded-full bg-indigo-100 hover:bg-red-500 hover:text-white text-indigo-600 flex items-center justify-center transition"
                title={`Remove ${sw}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-center text-[11px] text-slate-400 font-medium italic">
          No software permitted yet. Type name below to grant access.
        </div>
      )}

      {/* Manual Add Input Box */}
      <form onSubmit={handleAdd} className="flex items-center gap-1.5 pt-0.5">
        <input
          type="text"
          placeholder="Add software (e.g. Premiere Pro)..."
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden placeholder:text-slate-400"
        />
        <button
          type="submit"
          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 transition shadow-2xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </form>

      {/* Quick Suggestions Pills */}
      <div className="flex flex-wrap items-center gap-1">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Quick Add:</span>
        {commonPresets.map((preset) => {
          const isAlreadyAdded = permitted.some((p) => p.toLowerCase().includes(preset.toLowerCase()));
          if (isAlreadyAdded) return null;

          return (
            <button
              key={preset}
              type="button"
              onClick={() => onAddSoftware(member, preset)}
              className="text-[10px] font-semibold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 text-slate-600 px-1.5 py-0.5 rounded-md border border-slate-200 transition"
            >
              + {preset}
            </button>
          );
        })}
      </div>
    </div>
  );
};

interface TeamAttendanceProps {
  team: TeamMember[];
  attendance: AttendanceRecord[];
  projects: Project[];
  tasks?: TeamTask[];
  onAddTeamMember: (member: TeamMember) => void;
  onUpdateTeamMember: (member: TeamMember) => void;
  onDeleteTeamMember?: (memberId: string) => void;
  onReorderTeam?: (newTeam: TeamMember[]) => void;
  onRecordAttendance: (record: AttendanceRecord) => void;
  onUpdateAttendance: (records: AttendanceRecord[]) => void;
  onAddTask?: (task: TeamTask) => void;
  onUpdateTask?: (task: TeamTask) => void;
  onDeleteTask?: (taskId: string) => void;
}

export const TeamAttendance: React.FC<TeamAttendanceProps> = ({
  team,
  attendance,
  projects,
  tasks = [],
  onAddTeamMember,
  onUpdateTeamMember,
  onDeleteTeamMember,
  onReorderTeam,
  onRecordAttendance,
  onUpdateAttendance,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
}) => {
  const [activeTab, setActiveTab] = useState<'roster' | 'attendance' | 'payouts' | 'report'>('report');

  // Report Date Range & Filters (Default 1 Month: 01 July 2026 to 31 July 2026)
  const [reportStartDate, setReportStartDate] = useState<string>('2026-07-01');
  const [reportEndDate, setReportEndDate] = useState<string>('2026-07-31');
  const [reportMemberFilter, setReportMemberFilter] = useState<string>('all');
  const [reportStatusFilter, setReportStatusFilter] = useState<string>('all');
  const [reportSearch, setReportSearch] = useState<string>('');

  const effectiveAttendance = useMemo(() => {
    return attendance;
  }, [attendance]);

  // Filtered attendance records for reporting tab
  const filteredReportRecords = effectiveAttendance.filter((rec) => {
    // Date range filter
    if (reportStartDate && rec.date < reportStartDate) return false;
    if (reportEndDate && rec.date > reportEndDate) return false;

    // Member filter - match by ID OR by member name
    if (reportMemberFilter !== 'all') {
      const selectedMember = team.find((m) => m.id === reportMemberFilter);
      const matchId = rec.teamMemberId === reportMemberFilter;
      const matchName = selectedMember && rec.teamMemberName &&
        rec.teamMemberName.toLowerCase().trim() === selectedMember.name.toLowerCase().trim();
      if (!matchId && !matchName) return false;
    }

    // Status filter
    if (reportStatusFilter !== 'all' && rec.status !== reportStatusFilter) return false;

    // Search query
    if (reportSearch) {
      const q = reportSearch.toLowerCase();
      const nameMatch = rec.teamMemberName.toLowerCase().includes(q);
      const projMatch = (rec.projectTitle || '').toLowerCase().includes(q);
      const roleMatch = rec.role.toLowerCase().includes(q);
      const noteMatch = (rec.notes || '').toLowerCase().includes(q);
      if (!nameMatch && !projMatch && !roleMatch && !noteMatch) return false;
    }

    return true;
  }).sort((a, b) => a.date.localeCompare(b.date));

  // Export PDF Report function
  const handleExportReportPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      // Title & Header
      doc.setFontSize(16);
      doc.setTextColor(30, 41, 59);
      doc.text('WEDDING PHOTO PLANET', 14, 15);

      doc.setFontSize(11);
      doc.setTextColor(79, 70, 229);
      doc.text(`Team Attendance & Duty Performance Report (${reportStartDate || 'All'} to ${reportEndDate || 'All'})`, 14, 22);

      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated Date: ${new Date().toLocaleDateString('en-IN')} | Total Records: ${filteredReportRecords.length}`, 14, 28);

      const totalPay = filteredReportRecords.reduce((sum, r) => sum + (r.payAmount || 0), 0);

      const tableHeaders = [['S.No', 'Date', 'Member Name', 'Role', 'Duty Status', 'In - Out', 'Assigned Project', 'Pay (INR)', 'Notes']];

      const tableData = filteredReportRecords.map((r, index) => [
        index + 1,
        r.date,
        r.teamMemberName,
        r.role,
        r.status === 'present_shoot'
          ? 'Shoot Duty'
          : r.status === 'present_office'
          ? 'Office Duty'
          : r.status === 'half_day'
          ? 'Half Day'
          : 'Absent',
        r.inTime && r.outTime ? `${r.inTime} - ${r.outTime}` : '--',
        r.projectTitle || 'Studio Duty',
        `Rs. ${(r.payAmount || 0).toLocaleString('en-IN')}`,
        r.notes || '-',
      ]);

      const tableFoot = [
        ['', 'GRAND TOTAL', `${filteredReportRecords.length} Records`, '', '', '', 'Total Salary Earned:', `Rs. ${totalPay.toLocaleString('en-IN')}`, '']
      ];

      autoTable(doc, {
        startY: 32,
        head: tableHeaders,
        body: tableData,
        foot: tableFoot,
        theme: 'grid',
        headStyles: {
          fillColor: [79, 70, 229],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9,
          halign: 'center',
        },
        footStyles: {
          fillColor: [15, 23, 42],
          textColor: [52, 211, 153],
          fontStyle: 'bold',
          fontSize: 9,
        },
        styles: {
          fontSize: 8,
          cellPadding: 2,
          valign: 'middle',
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 12 },
          1: { halign: 'center', cellWidth: 24 },
          2: { fontStyle: 'bold', cellWidth: 35 },
          3: { cellWidth: 28 },
          4: { halign: 'center', cellWidth: 28 },
          5: { halign: 'center', cellWidth: 35 },
          6: { cellWidth: 40 },
          7: { halign: 'right', fontStyle: 'bold', cellWidth: 28 },
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
      });

      doc.save(`Attendance_Report_${reportStartDate}_to_${reportEndDate}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
      window.print();
    }
  };

  // Export CSV Report function
  const handleExportReportCSV = () => {
    const headers = ['Date', 'Member Name', 'Role', 'Status', 'In Time', 'Out Time', 'Assigned Project', 'Notes', 'Pay Amount (INR)'];
    const rows = filteredReportRecords.map((r) => [
      r.date,
      `"${r.teamMemberName}"`,
      `"${r.role}"`,
      r.status === 'present_shoot' ? 'Present (Shoot Duty)' : r.status === 'present_office' ? 'Present (Studio)' : r.status === 'half_day' ? 'Half Day' : 'Absent / Off',
      r.inTime || '--',
      r.outTime || '--',
      `"${r.projectTitle || 'Studio Duty'}"`,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
      r.payAmount || 0,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Wedding_Photo_Planet_Attendance_Report_${reportStartDate}_to_${reportEndDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Drag and Drop / Pick & Place state for team card reordering
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [pickedMemberIdx, setPickedMemberIdx] = useState<number | null>(null);

  const handleReorderIndices = (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx || fromIdx < 0 || toIdx < 0 || fromIdx >= team.length || toIdx >= team.length) return;
    const newTeam = [...team];
    const [moved] = newTeam.splice(fromIdx, 1);
    newTeam.splice(toIdx, 0, moved);
    if (onReorderTeam) {
      onReorderTeam(newTeam);
    }
  };

  const handleMoveMember = (idx: number, direction: 'prev' | 'next' | 'top' | 'bottom') => {
    let targetIdx = idx;
    if (direction === 'prev') targetIdx = idx - 1;
    else if (direction === 'next') targetIdx = idx + 1;
    else if (direction === 'top') targetIdx = 0;
    else if (direction === 'bottom') targetIdx = team.length - 1;

    handleReorderIndices(idx, targetIdx);
  };

  // Member Dashboard Modal State
  const [selectedMemberModal, setSelectedMemberModal] = useState<TeamMember | null>(null);

  // Simulation controls state
  const [selectedSimMemberId, setSelectedSimMemberId] = useState<string>(team[0]?.id || '');
  const [simAppChoice, setSimAppChoice] = useState<string>(UNAUTHORIZED_APPS_SIMULATION[0]);
  const [simMinutes, setSimMinutes] = useState<number>(7);

  // Unlock Modal state
  const [unlockMember, setUnlockMember] = useState<TeamMember | null>(null);
  const [unlockPin, setUnlockPin] = useState<string>('');
  const [unlockError, setUnlockError] = useState<string>('');

  // Attendance Form State (Includes In Time & Out Time)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>(team[0]?.id || '');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [attendStatus, setAttendStatus] = useState<'present_shoot' | 'present_office' | 'half_day' | 'absent'>('present_office');
  const [attendInTime, setAttendInTime] = useState<string>('09:30 AM');
  const [attendOutTime, setAttendOutTime] = useState<string>('07:30 PM');
  const [attendNotes, setAttendNotes] = useState<string>('');

  // New Team Member Form State (Supports Monthly Salary & 2-3 Permitted Softwares)
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState<TeamMember['role']>('Video Editor');
  const [memberPhone, setMemberPhone] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberPayType, setMemberPayType] = useState<'monthly' | 'daily'>('monthly');
  const [memberMonthlySalary, setMemberMonthlySalary] = useState<number>(45000);
  const [memberDailyRate, setMemberDailyRate] = useState<number>(2500);
  const [memberInTime, setMemberInTime] = useState<string>('09:30 AM');
  const [memberOutTime, setMemberOutTime] = useState<string>('07:30 PM');
  const [memberWeeklyOff, setMemberWeeklyOff] = useState<string>('Sunday');
  const [memberLunchTime, setMemberLunchTime] = useState<string>('30 Mins');
  const [selectedSoftwares, setSelectedSoftwares] = useState<string[]>([
    SOFTWARE_OPTIONS[0],
    SOFTWARE_OPTIONS[1],
  ]);
  const [modalCustomSoftwareInput, setModalCustomSoftwareInput] = useState<string>('');

  // Edit Team Member State
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<TeamMember['role']>('Video Editor');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPayType, setEditPayType] = useState<'monthly' | 'daily'>('monthly');
  const [editMonthlySalary, setEditMonthlySalary] = useState<number>(45000);
  const [editDailyRate, setEditDailyRate] = useState<number>(2500);
  const [editInTime, setEditInTime] = useState<string>('09:30 AM');
  const [editOutTime, setEditOutTime] = useState<string>('07:30 PM');
  const [editWeeklyOff, setEditWeeklyOff] = useState<string>('Sunday');
  const [editLunchTime, setEditLunchTime] = useState<string>('30 Mins');
  const [editSoftwares, setEditSoftwares] = useState<string[]>([]);

  const handleOpenEditModal = (m: TeamMember) => {
    setEditingMember(m);
    setEditName(m.name);
    setEditRole(m.role);
    setEditPhone(m.phone || '');
    setEditEmail(m.email || '');
    setEditPayType(m.payType || 'monthly');
    setEditMonthlySalary(m.monthlySalary || 45000);
    setEditDailyRate(m.dailyRate || 2500);
    setEditInTime(m.inTime || '09:30 AM');
    setEditOutTime(m.outTime || '07:30 PM');
    setEditWeeklyOff(m.weeklyOff || 'Sunday');
    setEditLunchTime(m.lunchTime || '30 Mins');
    setEditSoftwares(getPermittedSoftwares(m));
  };

  const handleSaveEditMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    const updated: TeamMember = {
      ...editingMember,
      name: editName,
      role: editRole,
      phone: editPhone,
      email: editEmail,
      payType: editPayType,
      monthlySalary: editMonthlySalary,
      dailyRate: editDailyRate,
      inTime: editInTime,
      outTime: editOutTime,
      weeklyOff: editWeeklyOff,
      lunchTime: editLunchTime,
      assignedSoftwares: editSoftwares,
    };
    onUpdateTeamMember(updated);
    setEditingMember(null);
  };

  // Calculations for alerts
  const alertingMembers = team.filter((m) => (m.unauthorizedMinutes || 0) >= 5 && !m.isLoggedOut);
  const loggedOutMembers = team.filter((m) => m.isLoggedOut);

  // Helper to get assigned permitted softwares list (1 to 3 items)
  const getPermittedSoftwares = (member: TeamMember): string[] => {
    if (member.assignedSoftwares && member.assignedSoftwares.length > 0) {
      return member.assignedSoftwares;
    }
    if (member.assignedSoftware) {
      return [member.assignedSoftware];
    }
    return [SOFTWARE_OPTIONS[0]];
  };

  // Helper to get initials
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Avatar color generator based on index
  const getAvatarStyle = (index: number) => {
    const styles = [
      'bg-blue-100 text-blue-700 border-blue-200',
      'bg-pink-100 text-pink-700 border-pink-200',
      'bg-emerald-100 text-emerald-700 border-emerald-200',
      'bg-purple-100 text-purple-700 border-purple-200',
      'bg-amber-100 text-amber-700 border-amber-200',
      'bg-indigo-100 text-indigo-700 border-indigo-200',
    ];
    return styles[index % styles.length];
  };

  // Add/Remove software permission manually
  const handleAddPermittedSoftware = (member: TeamMember, software: string) => {
    const trimmed = software.trim();
    if (!trimmed) return;
    const current = getPermittedSoftwares(member);
    if (current.includes(trimmed)) return;

    const updated = [...current, trimmed];
    const updatedMember: TeamMember = {
      ...member,
      assignedSoftwares: updated,
      assignedSoftware: updated[0] || '',
      currentSoftware: updated[0] || '',
      unauthorizedMinutes: 0,
    };
    onUpdateTeamMember(updatedMember);
  };

  const handleRemovePermittedSoftware = (member: TeamMember, software: string) => {
    const current = getPermittedSoftwares(member);
    const updated = current.filter((s) => s !== software);

    const updatedMember: TeamMember = {
      ...member,
      assignedSoftwares: updated,
      assignedSoftware: updated[0] || '',
      currentSoftware: updated[0] || '',
      unauthorizedMinutes: 0,
    };
    onUpdateTeamMember(updatedMember);
  };

  const handleWorkStatusChange = (member: TeamMember, newStatus: any) => {
    const updated: TeamMember = {
      ...member,
      workStatus: newStatus,
      isLoggedOut: newStatus === 'LOCKED',
    };
    onUpdateTeamMember(updated);
  };

  const handleClockOut = (member: TeamMember) => {
    const updated: TeamMember = {
      ...member,
      workStatus: 'CLOCKED_OUT',
    };
    onUpdateTeamMember(updated);
  };

  // SIMULATION HANDLER
  const handleSimulateUnauthorizedUsage = () => {
    const target = team.find((t) => t.id === selectedSimMemberId);
    if (!target) return;

    const permittedList = getPermittedSoftwares(target);
    const isPermitted = permittedList.some((p) => p.includes(simAppChoice) || simAppChoice.includes(p));

    if (isPermitted) {
      alert(`✅ '${simAppChoice}' is in ${target.name}'s permitted softwares list (${permittedList.length}/3 allowed)! No violation triggered.`);
      return;
    }

    const minutes = Number(simMinutes);
    const violations = (target.violationsCount || 0) + 1;
    const isAutoLogout = minutes >= 10 || violations >= 3;

    const updated: TeamMember = {
      ...target,
      currentSoftware: simAppChoice,
      unauthorizedMinutes: minutes,
      violationsCount: violations,
      isLoggedOut: isAutoLogout,
      workStatus: isAutoLogout ? 'LOCKED' : target.workStatus,
    };

    onUpdateTeamMember(updated);

    if (isAutoLogout) {
      alert(`🔒 AUTO LOGOUT ENFORCED FOR ${target.name}!\nReason: Exceeded 10 mins unauthorized app usage or repeated violations today.`);
    } else if (minutes >= 5) {
      alert(`⚠️ ALERT GENERATED FOR ${target.name}!\nReason: Using '${simAppChoice}' for ${minutes} minutes. Dashboard notification sent!`);
    }
  };

  const handleResetMemberSoftware = (member: TeamMember) => {
    const list = getPermittedSoftwares(member);
    const updated: TeamMember = {
      ...member,
      currentSoftware: list[0] || SOFTWARE_OPTIONS[0],
      unauthorizedMinutes: 0,
      isLoggedOut: false,
      workStatus: 'EDITING',
    };
    onUpdateTeamMember(updated);
  };

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlockMember) return;
    if (unlockPin !== '1234' && unlockPin.trim().length < 4) {
      setUnlockError('Invalid PIN! Use 1234 or owner password.');
      return;
    }

    const list = getPermittedSoftwares(unlockMember);
    const updated: TeamMember = {
      ...unlockMember,
      isLoggedOut: false,
      unauthorizedMinutes: 0,
      violationsCount: 0,
      currentSoftware: list[0] || SOFTWARE_OPTIONS[0],
      workStatus: 'EDITING',
    };

    onUpdateTeamMember(updated);
    setUnlockMember(null);
    setUnlockPin('');
    setUnlockError('');
    alert(`Success! ${unlockMember.name}'s account has been re-authenticated and unlocked.`);
  };

  const handleToggleSoftwareSelectionModal = (softwareName: string) => {
    if (selectedSoftwares.includes(softwareName)) {
      setSelectedSoftwares(selectedSoftwares.filter((s) => s !== softwareName));
    } else {
      setSelectedSoftwares([...selectedSoftwares, softwareName]);
    }
  };

  const handleSelectAllModalSoftwares = (selectAll: boolean) => {
    if (selectAll) {
      setSelectedSoftwares([...SOFTWARE_OPTIONS]);
    } else {
      setSelectedSoftwares([]);
    }
  };

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName) return;

    const newMem: TeamMember = {
      id: `team-${Date.now()}`,
      name: memberName,
      role: memberRole,
      phone: memberPhone || '+91 98765 00000',
      email: memberEmail || `${memberName.toLowerCase().replace(/\s+/g, '')}@weddingphotoplanet.com`,
      payType: memberPayType,
      monthlySalary: memberPayType === 'monthly' ? Number(memberMonthlySalary) : 0,
      dailyRate: memberPayType === 'daily' ? Number(memberDailyRate) : Math.round(Number(memberMonthlySalary) / 26),
      status: 'active',
      skills: [memberRole, 'Studio Staff'],
      assignedSoftwares: selectedSoftwares,
      assignedSoftware: selectedSoftwares[0] || SOFTWARE_OPTIONS[0],
      currentSoftware: selectedSoftwares[0] || SOFTWARE_OPTIONS[0],
      unauthorizedMinutes: 0,
      violationsCount: 0,
      isLoggedOut: false,
      workStatus: 'EDITING',
      inTime: memberInTime || '09:30 AM',
      outTime: memberOutTime || '07:30 PM',
      weeklyOff: memberWeeklyOff || 'Sunday',
      lunchTime: memberLunchTime || '30 Mins',
      activeTasksCount: 0,
      completedTasksCount: 0,
    };

    onAddTeamMember(newMem);
    setShowAddMemberModal(false);
    setMemberName('');
    setMemberPhone('');
    setMemberEmail('');
    setMemberMonthlySalary(45000);
    setMemberDailyRate(2500);
    setMemberWeeklyOff('Sunday');
    setMemberLunchTime('30 Mins');

    alert(`✅ Team Member "${newMem.name}" added successfully!\n\n🔑 Login Account Automatically Created:\n• Name: ${newMem.name}\n• Role: ${newMem.role}\n• Access Level: ${newMem.role === 'Studio Manager' || newMem.role === 'Manager' ? 'Full Admin Control' : 'Role Workstation Dashboard'}\n• Default PIN: 1234\n\nThey can now login or switch account anytime from the sidebar profile switcher.`);
  };

  const handleMarkAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    const member = team.find((t) => t.id === selectedMemberId);
    const proj = projects.find((p) => p.id === selectedProjectId);

    if (!member) return;

    const rateBasis = member.payType === 'monthly' && member.monthlySalary 
      ? Math.round(member.monthlySalary / 26) 
      : (member.dailyRate || 2500);

    let pay = rateBasis;
    if (attendStatus === 'half_day') pay = Math.round(rateBasis / 2);
    if (attendStatus === 'absent') pay = 0;

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      date: selectedDate,
      teamMemberId: member.id,
      teamMemberName: member.name,
      role: member.role,
      projectId: proj?.id,
      projectTitle: proj?.clientWeddingTitle,
      status: attendStatus,
      inTime: attendInTime,
      outTime: attendOutTime,
      payAmount: pay,
      paidStatus: 'pending',
      notes: attendNotes || 'Duty shift logged',
    };

    onRecordAttendance(newRecord);
    setAttendNotes('');
    alert(`Attendance marked for ${member.name} (In: ${attendInTime} - Out: ${attendOutTime})!`);
  };

  const togglePayStatus = (attId: string) => {
    const updated = attendance.map((a) => {
      if (a.id === attId) {
        return {
          ...a,
          paidStatus: a.paidStatus === 'paid' ? ('pending' as const) : ('paid' as const),
        };
      }
      return a;
    });

    onUpdateAttendance(updated);
  };

  const totalPendingPayout = attendance
    .filter((a) => a.paidStatus === 'pending')
    .reduce((acc, a) => acc + a.payAmount, 0);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Main Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>Employee & Team Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Studio roster, In/Out Shift timings, Monthly Salary & Daily Rates, and 1 to 3 Permitted Software Security
          </p>
        </div>

        {/* Header Right Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Segmented Tab Bar */}
          <div className="flex flex-wrap items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold gap-1">
            <button
              onClick={() => setActiveTab('report')}
              className={`px-3.5 py-2 rounded-lg transition-all text-xs font-bold flex items-center gap-1.5 ${
                activeTab === 'report'
                  ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/60 font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Attendance Report</span>
            </button>

            <button
              onClick={() => setActiveTab('roster')}
              className={`px-3.5 py-2 rounded-lg transition-all text-xs font-bold ${
                activeTab === 'roster'
                  ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Team Roster ({team.length})
            </button>


          </div>

          {/* Add Team Member Button */}
          <button
            onClick={() => setShowAddMemberModal(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Team Member</span>
          </button>
        </div>
      </div>

      {/* ALERT BANNERS */}
      {(alertingMembers.length > 0 || loggedOutMembers.length > 0) && (
        <div className="space-y-2">
          {alertingMembers.map((m) => (
            <div key={`alert-${m.id}`} className="bg-amber-50 border-2 border-amber-300 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs shadow-xs animate-pulse">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <span className="font-extrabold text-amber-900">⚠️ Software Misuse Warning: </span>
                  <span className="font-bold text-slate-800">{m.name}</span> has been using unapproved software <span className="font-mono font-bold text-amber-900 bg-amber-200/60 px-1.5 py-0.5 rounded">'{m.currentSoftware}'</span> for <span className="font-black text-amber-900">{m.unauthorizedMinutes} minutes</span>!
                  <span className="block text-[11px] text-amber-800 font-medium">Permitted Softwares (Limit 2-3): {getPermittedSoftwares(m).join(' | ')}</span>
                </div>
              </div>
              <button
                onClick={() => handleResetMemberSoftware(m)}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] uppercase tracking-wider flex-shrink-0"
              >
                Clear Warning
              </button>
            </div>
          ))}

          {loggedOutMembers.map((m) => (
            <div key={`lock-${m.id}`} className="bg-red-50 border-2 border-red-300 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs shadow-xs">
              <div className="flex items-center gap-2.5">
                <Lock className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <span className="font-black text-red-900">🔒 AUTO LOGOUT ENFORCED: </span>
                  <span className="font-bold text-slate-900">{m.name}</span> has been automatically logged out due to unauthorized app limit exceed!
                </div>
              </div>
              <button
                onClick={() => setUnlockMember(m)}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0 shadow-xs"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Re-Login / Unlock</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 0: DATE-RANGE REPORT (1 JULY TO 31 AUGUST) */}
      {activeTab === 'report' && (
        <div className="space-y-6">
          {/* DAILY MEMBER ACTIVITY & TASK REPORTING WIDGET */}
          <TeamDailyReportingWidget
            team={team}
            attendance={effectiveAttendance}
            tasks={tasks}
            projects={projects}
            onUpdateTask={onUpdateTask}
            onDeleteTask={(id) => {
              if (onDeleteTask) {
                onDeleteTask(id);
              } else {
                try {
                  const saved = localStorage.getItem('wpp_owner_crm_tasks') || localStorage.getItem('wpp_owner_tasks');
                  if (saved) {
                    const parsed = JSON.parse(saved);
                    const filtered = parsed.filter((t: any) => t.id !== id);
                    localStorage.setItem('wpp_owner_crm_tasks', JSON.stringify(filtered));
                    localStorage.setItem('wpp_owner_tasks', JSON.stringify(filtered));
                    window.dispatchEvent(new Event('storage'));
                  }
                } catch (e) {}
              }
            }}
            onAddTask={onAddTask}
            onOpenMemberModal={(mem) => setSelectedMemberModal(mem)}
          />

          {/* Main Report Header & Export Actions */}
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl p-6 text-white shadow-xl border border-indigo-700/50 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 font-black text-[10px] uppercase tracking-wider">
                    Official Attendance & Duty Report
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[10px] uppercase">
                    62 Days Logged (July & August)
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-indigo-400" />
                  <span>Team Attendance & Duty Performance Report</span>
                </h3>
                <p className="text-xs text-indigo-200/90 font-medium max-w-2xl leading-relaxed">
                  WEDDING PHOTO PLANET • Full studio shift logs, outdoor shoot assignments, in/out timings & payout records for <strong className="text-white">01 July 2026 to 31 July 2026</strong>.
                </p>
              </div>

              {/* PDF Export Button */}
              <div className="flex items-center gap-2.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={handleExportReportPDF}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-md transition cursor-pointer border border-indigo-400/40"
                  title="Export Report as PDF"
                >
                  <Download className="w-4 h-4 text-white" />
                  <span>Export PDF</span>
                </button>
              </div>
            </div>


          </div>

          {/* Interactive Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-indigo-600" />
                <span>Report Filters & Search Parameters</span>
              </span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-slate-500 mr-1">Quick Select:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setReportStartDate('2026-07-01');
                      setReportEndDate('2026-07-31');
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                      reportStartDate === '2026-07-01' && reportEndDate === '2026-07-31'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    July 2026 (01-07 to 31-07)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReportStartDate('2026-08-01');
                      setReportEndDate('2026-08-31');
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                      reportStartDate === '2026-08-01' && reportEndDate === '2026-08-31'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    August 2026 (01-08 to 31-08)
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setReportStartDate('2026-07-01');
                    setReportEndDate('2026-07-31');
                    setReportMemberFilter('all');
                    setReportStatusFilter('all');
                    setReportSearch('');
                  }}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline ml-2"
                >
                  Reset Default Filters
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
              {/* Start Date */}
              <div>
                <label className="block text-slate-500 font-bold uppercase text-[10px] mb-1">From Date</label>
                <input
                  type="date"
                  value={reportStartDate}
                  onChange={(e) => setReportStartDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-900"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-slate-500 font-bold uppercase text-[10px] mb-1">To Date</label>
                <input
                  type="date"
                  value={reportEndDate}
                  onChange={(e) => setReportEndDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-900"
                />
              </div>

              {/* Member Filter */}
              <div>
                <label className="block text-slate-500 font-bold uppercase text-[10px] mb-1">Team Member</label>
                <select
                  value={reportMemberFilter}
                  onChange={(e) => setReportMemberFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-900"
                >
                  <option value="all">All Members ({team.length})</option>
                  {team.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-slate-500 font-bold uppercase text-[10px] mb-1">Shift Status</label>
                <select
                  value={reportStatusFilter}
                  onChange={(e) => setReportStatusFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-900"
                >
                  <option value="all">All Statuses</option>
                  <option value="present_office">🏢 Studio Edit (Present)</option>
                  <option value="present_shoot">🎥 Outdoor Shoot Duty</option>
                  <option value="half_day">⏱️ Half Day Duty</option>
                  <option value="absent">🗓️ Weekly Off / Absent</option>
                </select>
              </div>

              {/* Search Box */}
              <div>
                <label className="block text-slate-500 font-bold uppercase text-[10px] mb-1">Search Keyword</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search member, project..."
                    value={reportSearch}
                    onChange={(e) => setReportSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-8 pr-2 font-semibold text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* High Level Summary Metrics KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-1">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Tracked Days
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {reportStartDate && reportEndDate
                  ? Math.max(
                      1,
                      Math.round(
                        (new Date(reportEndDate).getTime() - new Date(reportStartDate).getTime()) /
                          (1000 * 3600 * 24)
                      ) + 1
                    )
                  : '--'}{' '}
                <span className="text-xs font-bold text-slate-400">Days</span>
              </div>
              <p className="text-[10px] font-semibold text-slate-500">01 July to 31 August</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-1">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-indigo-600" /> Total Logs
              </div>
              <div className="text-2xl font-black text-indigo-600 font-mono">
                {filteredReportRecords.length}
              </div>
              <p className="text-[10px] font-semibold text-slate-500">Filtered Shift Entries</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-1">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-blue-600" /> Studio Edits
              </div>
              <div className="text-2xl font-black text-blue-600 font-mono">
                {filteredReportRecords.filter((r) => r.status === 'present_office').length}
              </div>
              <p className="text-[10px] font-semibold text-blue-900/70">Office Shifts</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-1">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Camera className="w-3.5 h-3.5 text-purple-600" /> Shoot Duties
              </div>
              <div className="text-2xl font-black text-purple-600 font-mono">
                {filteredReportRecords.filter((r) => r.status === 'present_shoot').length}
              </div>
              <p className="text-[10px] font-semibold text-purple-900/70">Outdoor Shoots</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-1">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" /> Offs / Absences
              </div>
              <div className="text-2xl font-black text-amber-600 font-mono">
                {filteredReportRecords.filter((r) => r.status === 'absent' || r.status === 'half_day').length}
              </div>
              <p className="text-[10px] font-semibold text-amber-900/70">Sundays & Leaves</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-1">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-600" /> Total Payout
              </div>
              <div className="text-xl font-black text-emerald-700 font-mono truncate">
                ₹{filteredReportRecords.reduce((acc, r) => acc + (r.payAmount || 0), 0).toLocaleString('en-IN')}
              </div>
              <p className="text-[10px] font-semibold text-emerald-900/70">Period Disbursed</p>
            </div>
          </div>



          {/* Detailed Day-Wise Log Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Day-by-Day Attendance Log Table ({filteredReportRecords.length} Entries)</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Showing entries from {reportStartDate || 'Beginning'} to {reportEndDate || 'Latest'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Total Period Pay:</span>
                <span className="text-xs font-black text-emerald-700 font-mono bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                  ₹{filteredReportRecords.reduce((s, r) => s + (r.payAmount || 0), 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {filteredReportRecords.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
                <h4 className="font-extrabold text-slate-800 text-sm">No Attendance Records Found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No attendance records matched your selected date range or search filters.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setReportStartDate('2026-07-01');
                    setReportEndDate('2026-07-31');
                    setReportMemberFilter('all');
                    setReportStatusFilter('all');
                    setReportSearch('');
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer"
                >
                  Reset To 1 Month (01 July - 31 July) Report
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 font-extrabold uppercase text-[10px] border-b border-slate-200">
                      <th className="p-3">Date</th>
                      <th className="p-3">Team Member</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">In / Out Time</th>
                      <th className="p-3">Assigned Project / Duty</th>
                      <th className="p-3">Notes</th>
                      <th className="p-3 text-right">Pay (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredReportRecords.map((r, i) => (
                      <tr key={r.id || `rep-${i}`} className="hover:bg-indigo-50/30 transition">
                        <td className="p-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {r.date}
                        </td>
                        <td className="p-3 font-extrabold text-slate-900">
                          {r.teamMemberName}
                        </td>
                        <td className="p-3 text-indigo-700 font-semibold">
                          {r.role}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          {r.status === 'present_shoot' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-300">
                              🎥 Outdoor Shoot
                            </span>
                          ) : r.status === 'present_office' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-300">
                              🏢 Studio Edit
                            </span>
                          ) : r.status === 'half_day' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                              ⏱️ Half Day
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-600 border border-slate-300">
                              🗓️ Weekly Off
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-mono text-[11px]">
                          <span className="text-emerald-700 font-bold">{r.inTime || '09:30 AM'}</span> -{' '}
                          <span className="text-red-700 font-bold">{r.outTime || '07:30 PM'}</span>
                        </td>
                        <td className="p-3 text-slate-800 font-bold max-w-xs truncate">
                          {r.projectTitle || 'Studio Edit Duty'}
                        </td>
                        <td className="p-3 text-slate-500 text-[11px] max-w-xs truncate">
                          {r.notes || 'Normal shift completed'}
                        </td>
                        <td className="p-3 text-right font-mono font-extrabold text-emerald-700 whitespace-nowrap">
                          ₹{(r.payAmount || 0).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-900 text-white font-extrabold text-xs border-t-2 border-slate-800">
                    <tr>
                      <td colSpan={7} className="p-3.5 text-right text-indigo-200 uppercase tracking-wide">
                        Total Period Salary / Earned Pay ({filteredReportRecords.length} Records):
                      </td>
                      <td className="p-3.5 text-right font-mono text-base text-emerald-400 font-black whitespace-nowrap bg-slate-950 border-l border-slate-800">
                        ₹{filteredReportRecords.reduce((s, r) => s + (r.payAmount || 0), 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* Total Salary Summary Bar */}
            {filteredReportRecords.length > 0 && (
              <div className="p-4 bg-slate-900 text-white border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 font-black text-lg">
                    ₹
                  </div>
                  <div>
                    <div className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                      TOTAL CALCULATED REPORT SALARY
                    </div>
                    <div className="text-xs text-slate-300">
                      Sum of pay for all {filteredReportRecords.length} displayed shift entries
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold uppercase hidden sm:inline">Grand Total:</span>
                  <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400 bg-slate-950 px-4 py-2 rounded-xl border border-emerald-500/40 shadow-inner">
                    ₹{filteredReportRecords.reduce((s, r) => s + (r.payAmount || 0), 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 1: TEAM ROSTER */}
      {activeTab === 'roster' && (
        <div className="space-y-6">

          {/* Software Guard Rules Banner */}
          <div className="bg-slate-900 rounded-2xl p-4 text-white space-y-3 shadow-md border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-extrabold text-slate-100 uppercase tracking-wide">
                  2-3 Permitted Softwares & Monthly Salary Guard System
                </h3>
              </div>
              <span className="text-[11px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-700 px-2.5 py-0.5 rounded-full">
                2-3 Software Limit per Employee
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Each team member can be assigned maximum <strong>2 to 3 Permitted Softwares</strong>. Spending <strong>5-10 minutes</strong> on any unauthorized software will trigger an Auto-Logout alert along with <strong>Monthly Fixed Salary</strong> & <strong>In/Out timing log</strong> tracking.
            </p>

            {/* Test Simulator Panel */}
            <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Test Live App Switcher:</span>
                <select
                  value={selectedSimMemberId}
                  onChange={(e) => setSelectedSimMemberId(e.target.value)}
                  className="bg-slate-900 text-slate-100 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-semibold"
                >
                  {team.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.role})
                    </option>
                  ))}
                </select>

                <select
                  value={simAppChoice}
                  onChange={(e) => setSimAppChoice(e.target.value)}
                  className="bg-slate-900 text-amber-300 border border-amber-500/50 rounded-lg px-2.5 py-1 text-xs font-bold"
                >
                  {UNAUTHORIZED_APPS_SIMULATION.map((app) => (
                    <option key={app} value={app}>
                      ⚠️ Switch to: {app}
                    </option>
                  ))}
                </select>

                <select
                  value={simMinutes}
                  onChange={(e) => setSimMinutes(Number(e.target.value))}
                  className="bg-slate-900 text-slate-100 border border-slate-700 rounded-lg px-2 py-1 text-xs font-bold"
                >
                  <option value={3}>3 Mins (Normal)</option>
                  <option value={7}>7 Mins (Trigger Dashboard Alert)</option>
                  <option value={12}>12 Mins (Trigger Auto-Logout)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSimulateUnauthorizedUsage}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-1.5 transition shadow-xs"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Simulate App Switch</span>
                </button>
                {team.find((t) => t.id === selectedSimMemberId) && (
                  <button
                    onClick={() => {
                      const t = team.find((item) => item.id === selectedSimMemberId);
                      if (t) handleResetMemberSoftware(t);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Reorder Information Header */}
          <div className="flex items-center justify-between bg-indigo-50/90 border border-indigo-200 px-4 py-2.5 rounded-2xl text-xs shadow-2xs">
            <div className="flex items-center gap-2">
              <GripVertical className="w-5 h-5 text-indigo-600 flex-shrink-0 animate-pulse" />
              <div>
                <span className="font-extrabold text-slate-900">
                  🖐️ Drag & Drop / Pick to Reorder Cards
                </span>
                <span className="text-slate-600 text-[11px] ml-2 hidden sm:inline font-medium">
                  • Pick up any card by dragging it (or click "Pick") and drop it anywhere to move Upar, Niche, Aage, Piche!
                </span>
              </div>
            </div>
            {pickedMemberIdx !== null && (
              <button
                type="button"
                onClick={() => setPickedMemberIdx(null)}
                className="text-[10px] font-extrabold text-red-600 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-full uppercase transition"
              >
                Cancel Pick
              </button>
            )}
            <span className="text-[10px] font-black text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Total {team.length} Cards
            </span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {team.map((t, idx) => {
              const permitted = getPermittedSoftwares(t);
              const isAlerting = (t.unauthorizedMinutes || 0) >= 5 && !t.isLoggedOut;
              const isLocked = t.isLoggedOut || t.workStatus === 'LOCKED';
              const isDragging = draggedIdx === idx;
              const isDragOver = dragOverIdx === idx;
              const isPicked = pickedMemberIdx === idx;

              return (
                <div
                  key={t.id}
                  draggable={true}
                  onDragStart={(e) => {
                    setDraggedIdx(idx);
                    e.dataTransfer.setData('text/plain', String(idx));
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    if (dragOverIdx !== idx) setDragOverIdx(idx);
                  }}
                  onDragLeave={() => {
                    if (dragOverIdx === idx) setDragOverIdx(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const sourceIdx = draggedIdx !== null ? draggedIdx : parseInt(e.dataTransfer.getData('text/plain'), 10);
                    if (!isNaN(sourceIdx) && sourceIdx !== idx) {
                      handleReorderIndices(sourceIdx, idx);
                    }
                    setDraggedIdx(null);
                    setDragOverIdx(null);
                  }}
                  onDragEnd={() => {
                    setDraggedIdx(null);
                    setDragOverIdx(null);
                  }}
                  className={`bg-white rounded-2xl border transition-all shadow-sm overflow-hidden flex flex-col justify-between p-4 space-y-3 relative group cursor-grab active:cursor-grabbing ${
                    isDragging
                      ? 'opacity-40 scale-[0.97] border-indigo-500 border-dashed bg-indigo-50/50'
                      : isDragOver
                      ? 'border-2 border-indigo-600 bg-indigo-50/70 ring-4 ring-indigo-300 scale-[1.02] shadow-xl z-20'
                      : isPicked
                      ? 'border-2 border-amber-500 bg-amber-50/60 ring-4 ring-amber-300 shadow-md'
                      : isLocked
                      ? 'border-red-300 bg-red-50/20 ring-2 ring-red-400/30 hover:border-red-400'
                      : isAlerting
                      ? 'border-amber-300 ring-2 ring-amber-400/40 hover:border-amber-400'
                      : 'border-slate-200/90 hover:border-indigo-400 hover:shadow-md'
                  }`}
                >
                  {/* Card Order Position Control Header */}
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200/90 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 cursor-grab active:cursor-grabbing text-slate-400 hover:text-indigo-600 transition" title="Drag to reorder card">
                        <GripVertical className="w-4 h-4" />
                        <span className="font-mono text-indigo-700 font-extrabold text-[11px]">#{idx + 1}</span>
                      </div>
                      {isPicked ? (
                        <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded uppercase">Picked</span>
                      ) : (
                        <span className="text-slate-400 text-[10px] font-normal hidden sm:inline">Position</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {pickedMemberIdx !== null ? (
                        pickedMemberIdx === idx ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPickedMemberIdx(null);
                            }}
                            className="px-2 py-0.5 text-[10px] font-extrabold text-red-600 bg-red-100 hover:bg-red-200 rounded border border-red-300 uppercase"
                          >
                            Cancel
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReorderIndices(pickedMemberIdx, idx);
                              setPickedMemberIdx(null);
                            }}
                            className="px-2.5 py-0.5 text-[10px] font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 rounded border border-indigo-700 uppercase shadow-xs animate-bounce"
                          >
                            🎯 Drop Here
                          </button>
                        )
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPickedMemberIdx(idx);
                            }}
                            className="px-2 py-0.5 text-[10px] font-extrabold bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 rounded border border-indigo-200 uppercase transition"
                            title="Pick this card to place elsewhere"
                          >
                            🖐️ Pick
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveMember(idx, 'top');
                            }}
                            disabled={idx === 0}
                            className={`px-1.5 py-0.5 text-[10px] font-extrabold rounded border transition uppercase ${
                              idx === 0
                                ? 'opacity-30 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200'
                                : 'bg-white hover:bg-indigo-600 hover:text-white text-slate-700 border-slate-300 cursor-pointer'
                            }`}
                            title="Move to Top (Sabse Upar)"
                          >
                            Top
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveMember(idx, 'prev');
                            }}
                            disabled={idx === 0}
                            className={`p-1 rounded border transition ${
                              idx === 0
                                ? 'opacity-30 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200'
                                : 'bg-white hover:bg-indigo-600 hover:text-white text-slate-700 border-slate-300 cursor-pointer shadow-2xs'
                            }`}
                            title="Piche Karein (Move Left / Up)"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveMember(idx, 'next');
                            }}
                            disabled={idx === team.length - 1}
                            className={`p-1 rounded border transition ${
                              idx === team.length - 1
                                ? 'opacity-30 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200'
                                : 'bg-white hover:bg-indigo-600 hover:text-white text-slate-700 border-slate-300 cursor-pointer shadow-2xs'
                            }`}
                            title="Aage Karein (Move Right / Down)"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  {/* Card Header */}
                  <div 
                    onClick={() => setSelectedMemberModal(t)}
                    className="flex items-start justify-between gap-3 cursor-pointer group"
                    title="Click to view full Member Dashboard"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-full border-2 flex items-center justify-center font-black text-sm tracking-wider shadow-xs ${getAvatarStyle(idx)} group-hover:scale-105 transition`}>
                        {getInitials(t.name)}
                      </div>

                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-indigo-600 transition flex items-center gap-1.5">
                          <span>{t.name}</span>
                          <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-indigo-600 transition" />
                        </h3>
                        <p className="text-xs font-bold text-indigo-600 mt-0.5">
                          {t.role}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge & Edit Button */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditModal(t);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-extrabold text-[11px] flex items-center gap-1 border border-indigo-200 transition shadow-2xs cursor-pointer"
                        title={`Edit ${t.name}'s Details & Salary`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      {isLocked ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-red-100 text-red-700 border border-red-300 flex items-center gap-1 uppercase tracking-wider">
                          <Lock className="w-3 h-3" /> LOCKED
                        </span>
                      ) : t.workStatus === 'IDLE' ? (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                          IDLE
                        </span>
                      ) : t.workStatus === 'ON_BREAK' ? (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
                          ON BREAK
                        </span>
                      ) : t.workStatus === 'CLOCKED_OUT' ? (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider">
                          CLOCKED OUT
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                          EDITING
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Contact & Softwares Container */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                    {/* Contact details */}
                    <div className="space-y-1 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium truncate">{t.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono font-medium">{t.phone}</span>
                      </div>
                    </div>

                    {/* Permitted Software Tag Manager */}
                    <MemberSoftwareManager
                      member={t}
                      getPermittedSoftwares={getPermittedSoftwares}
                      onAddSoftware={handleAddPermittedSoftware}
                      onRemoveSoftware={handleRemovePermittedSoftware}
                    />

                    {/* Live Detected App Status */}
                    <div className="text-[11px] pt-1">
                      {isLocked ? (
                        <div className="bg-red-100/80 border border-red-200 text-red-800 rounded-lg p-2 font-bold flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5 text-red-600" />
                            Session Locked (Auto Logged Out)
                          </span>
                          <button
                            onClick={() => setUnlockMember(t)}
                            className="underline text-[10px] uppercase font-black"
                          >
                            Unlock
                          </button>
                        </div>
                      ) : isAlerting ? (
                        <div className="bg-amber-100/90 border border-amber-300 text-amber-900 rounded-lg p-2 font-bold space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 text-amber-800">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              App Switch Warning!
                            </span>
                            <span className="font-black text-amber-900">{t.unauthorizedMinutes}m used</span>
                          </div>
                          <p className="text-[10px] text-amber-800 font-medium">Currently on: '{t.currentSoftware}'</p>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-slate-500 font-medium px-1">
                          <span>Live Active App:</span>
                          <span className="font-bold text-emerald-700 truncate max-w-[150px]">
                            {t.currentSoftware || permitted[0] || 'Premiere Pro'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Shift Timings (In Time, Out Time, Weekly Off & Lunch) Row */}
                    <div className="pt-2 border-t border-slate-200/60 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] flex items-center gap-1">
                            <Clock className="w-3 h-3 text-indigo-600" /> SHIFT & SCHEDULE
                          </span>
                          <span className="text-[10px] font-bold text-slate-700">Duty Hours</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold bg-indigo-50 border border-indigo-200 text-indigo-950 px-2.5 py-1 rounded-lg">
                          <span className="text-emerald-700">In: {t.inTime || '09:30 AM'}</span>
                          <span className="text-slate-300">|</span>
                          <span className="text-red-700">Out: {t.outTime || '07:30 PM'}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] bg-slate-50 p-1.5 rounded-lg border border-slate-200/70 font-semibold">
                        <span className="text-amber-800 font-bold flex items-center gap-1 text-[10px]">
                          🗓️ Off: <span className="text-slate-800 font-bold">{t.weeklyOff || 'Sunday'}</span>
                        </span>
                        <span className="text-emerald-800 font-bold flex items-center gap-1 text-[10px]">
                          🍱 Lunch: <span className="text-slate-800 font-bold">{t.lunchTime || '30 Mins'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Salary & Pay Structure Row */}
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] block">
                          PAY STRUCTURE
                        </span>
                        <span className="text-[10px] font-black uppercase text-indigo-700">
                          {t.payType === 'monthly' ? 'MONTHLY SALARY' : 'DAILY RATE'}
                        </span>
                      </div>
                      <div className="text-right">
                        {t.payType === 'monthly' ? (
                          <span className="font-extrabold text-slate-900 text-sm font-mono">
                            ₹{(t.monthlySalary || 45000).toLocaleString('en-IN')}<span className="text-[10px] font-medium text-slate-500">/mo</span>
                          </span>
                        ) : (
                          <span className="font-extrabold text-slate-900 text-sm font-mono">
                            ₹{(t.dailyRate || 2500).toLocaleString('en-IN')}<span className="text-[10px] font-medium text-slate-500">/day</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tasks stats */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 text-center">
                      <div className="text-2xl font-black text-blue-600 leading-none">
                        {t.activeTasksCount || 0}
                      </div>
                      <div className="text-[11px] font-bold text-blue-900/70 mt-1">
                        Active Tasks
                      </div>
                    </div>

                    <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 text-center">
                      <div className="text-2xl font-black text-emerald-600 leading-none">
                        {t.completedTasksCount || (t.id === 'team-akash' ? 42 : t.id === 'team-pooja' ? 68 : t.id === 'team-rohan' ? 31 : 15)}
                      </div>
                      <div className="text-[11px] font-bold text-emerald-900/70 mt-1">
                        Completed
                      </div>
                    </div>
                  </div>

                  {/* Prominent Employee Dashboard Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedMemberModal(t)}
                    className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-xs uppercase tracking-wider cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-indigo-200" />
                    <span>View {t.name}'s Dashboard</span>
                  </button>

                  {/* Bottom Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400 font-bold text-[11px]">Status:</span>
                      <select
                        value={t.workStatus || 'EDITING'}
                        onChange={(e) => handleWorkStatusChange(t, e.target.value)}
                        className="bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
                      >
                        <option value="EDITING">Editing</option>
                        <option value="IDLE">Idle</option>
                        <option value="ON_BREAK">On Break</option>
                        <option value="CLOCKED_OUT">Clocked Out</option>
                        <option value="LOCKED">Locked / Auto Logout</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      {isLocked ? (
                        <button
                          onClick={() => setUnlockMember(t)}
                          className="px-3 py-1.5 rounded-xl bg-red-600 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1 shadow-xs"
                        >
                          <Unlock className="w-3.5 h-3.5" /> Re-Login
                        </button>
                      ) : (
                        <button
                          onClick={() => handleClockOut(t)}
                          className="px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs transition"
                        >
                          Clock Out
                        </button>
                      )}

                      {onDeleteTeamMember && (
                        <button
                          onClick={() => onDeleteTeamMember(t.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                          title="Delete Team Member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: IN/OUT ATTENDANCE SHEET */}
      {activeTab === 'attendance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mark Attendance Form */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 uppercase tracking-tight border-b border-slate-100 pb-3">
              <UserCheck className="w-4 h-4 text-indigo-600" />
              <span>Mark Shift Attendance & In/Out Timings</span>
            </h3>

            <form onSubmit={handleMarkAttendance} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 font-bold uppercase text-[10px] mb-1">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 text-xs font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold uppercase text-[10px] mb-1">Team Member</label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 text-xs font-bold"
                >
                  {team.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.role} - {t.payType === 'monthly' ? `₹${t.monthlySalary}/mo` : `₹${t.dailyRate}/day`})
                    </option>
                  ))}
                </select>
              </div>

              {/* In Time & Out Time Row */}
              <div className="grid grid-cols-2 gap-2 p-2.5 bg-indigo-50/50 rounded-xl border border-indigo-100">
                <div>
                  <label className="block text-indigo-900 font-extrabold uppercase text-[10px] mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-600" /> In Time
                  </label>
                  <input
                    type="text"
                    value={attendInTime}
                    onChange={(e) => setAttendInTime(e.target.value)}
                    placeholder="09:30 AM"
                    className="w-full bg-white border border-indigo-200 rounded-lg p-2 text-slate-900 text-xs font-bold font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-indigo-900 font-extrabold uppercase text-[10px] mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-600" /> Out Time
                  </label>
                  <input
                    type="text"
                    value={attendOutTime}
                    onChange={(e) => setAttendOutTime(e.target.value)}
                    placeholder="07:30 PM"
                    className="w-full bg-white border border-indigo-200 rounded-lg p-2 text-slate-900 text-xs font-bold font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-bold uppercase text-[10px] mb-1">Assigned Client Project</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 text-xs font-medium"
                >
                  <option value="">Studio Office Duty (General Edit)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.clientWeddingTitle}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-bold uppercase text-[10px] mb-1">Attendance Status</label>
                <select
                  value={attendStatus}
                  onChange={(e) => setAttendStatus(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 text-xs font-bold"
                >
                  <option value="present_office">Present - Studio Office Edit</option>
                  <option value="present_shoot">Present - On Location Shoot</option>
                  <option value="half_day">Half Day Duty</option>
                  <option value="absent">Absent</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-bold uppercase text-[10px] mb-1">Duty Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Lead Photo shoot at Udaivilas"
                  value={attendNotes}
                  onChange={(e) => setAttendNotes(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm mt-2 flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Log Duty Attendance</span>
              </button>
            </form>
          </div>

          {/* Attendance Logs Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center justify-between uppercase tracking-tight border-b border-slate-100 pb-3">
              <span>Duty Attendance & Shift Timings Register</span>
              <span className="text-xs text-slate-400 font-normal">{attendance.length} Logs Recorded</span>
            </h3>

            <div className="space-y-2.5">
              {attendance.map((a) => (
                <div
                  key={a.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-xs">{a.teamMemberName}</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] bg-indigo-100 text-indigo-700 font-bold">{a.role}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          a.status === 'present_shoot'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {a.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-600 pt-0.5">
                      <span className="font-mono bg-white border border-slate-200 px-2 py-0.5 rounded font-bold text-slate-700 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-indigo-600" />
                        In: {a.inTime || '09:30 AM'} — Out: {a.outTime || '07:30 PM'}
                      </span>
                      <span>• {a.projectTitle || 'Studio Edit Duty'}</span>
                    </div>

                    <p className="text-slate-500 text-[11px] italic">"{a.notes}"</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900 text-xs">
                      ₹{a.payAmount.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => togglePayStatus(a.id)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition uppercase tracking-wider ${
                        a.paidStatus === 'paid'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-red-100 text-red-700 border border-red-200'
                      }`}
                    >
                      {a.paidStatus === 'paid' ? 'Payout Cleared' : 'Payout Pending'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PAYOUT LEDGER */}
      {activeTab === 'payouts' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-tight">
                Team Payout Ledger & Salary Statement
              </h3>
              <p className="text-xs text-slate-500">
                Total Pending Payouts: ₹{totalPendingPayout.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Crew Member</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Duty Date</th>
                  <th className="py-3 px-4">In Time</th>
                  <th className="py-3 px-4">Out Time</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Pay Amount</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendance.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">{a.teamMemberName}</td>
                    <td className="py-3 px-4 text-slate-500">{a.role}</td>
                    <td className="py-3 px-4 font-mono">{a.date}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-emerald-700">{a.inTime || '09:30 AM'}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-red-700">{a.outTime || '07:30 PM'}</td>
                    <td className="py-3 px-4 text-slate-600">{a.projectTitle || 'Studio Office Edit'}</td>
                    <td className="py-3 px-4 font-bold text-indigo-600">
                      ₹{a.payAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => togglePayStatus(a.id)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${
                          a.paidStatus === 'paid'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        {a.paidStatus === 'paid' ? 'Mark Unpaid' : 'Clear Payout'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD TEAM MEMBER MODAL */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <span>Add New Team Member</span>
              </h3>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMemberSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Akash Verma"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 text-xs font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role / Specialization</label>
                  <select
                    value={memberRole}
                    onChange={(e) => setMemberRole(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 text-xs font-bold"
                  >
                    <option value="Manager">Manager</option>
                    <option value="Account Manager">Account Manager</option>
                    <option value="Photo Editor">Photo Editor</option>
                    <option value="Video Editor">Video Editor</option>
                    <option value="Social Media Handler">Social Media Handler</option>
                    <option value="Sales Team">Sales Team</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={memberPhone}
                    onChange={(e) => setMemberPhone(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="name@weddingphotoplanet.com"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 text-xs"
                />
              </div>

              {/* Default Shift Timing, Weekly Off & Lunch Time */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3 text-indigo-600" /> Default Shift In-Time
                  </label>
                  <input
                    type="text"
                    placeholder="09:30 AM"
                    value={memberInTime}
                    onChange={(e) => setMemberInTime(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3 text-indigo-600" /> Default Shift Out-Time
                  </label>
                  <input
                    type="text"
                    placeholder="07:30 PM"
                    value={memberOutTime}
                    onChange={(e) => setMemberOutTime(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3 text-amber-600" /> Weekly Off Day
                  </label>
                  <select
                    value={memberWeeklyOff}
                    onChange={(e) => setMemberWeeklyOff(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 text-xs font-bold"
                  >
                    <option value="Sunday">Sunday</option>
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday & Alternate Saturday">Sunday & Alternate Saturday</option>
                    <option value="No Weekly Off">No Weekly Off</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3 text-emerald-600" /> Lunch Time / Break
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 30 Mins"
                    value={memberLunchTime}
                    onChange={(e) => setMemberLunchTime(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Monthly Salary vs Daily Rate Toggle */}
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-2">
                <label className="block font-extrabold text-indigo-950 uppercase text-[10px]">
                  Pay Structure
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 font-bold text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="payType"
                      value="monthly"
                      checked={memberPayType === 'monthly'}
                      onChange={() => setMemberPayType('monthly')}
                      className="accent-indigo-600"
                    />
                    <span>Monthly Salary (₹/month)</span>
                  </label>
                  <label className="flex items-center gap-1.5 font-bold text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="payType"
                      value="daily"
                      checked={memberPayType === 'daily'}
                      onChange={() => setMemberPayType('daily')}
                      className="accent-indigo-600"
                    />
                    <span>Daily / Shoot Rate (₹/day)</span>
                  </label>
                </div>

                {memberPayType === 'monthly' ? (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Monthly Fixed Salary (₹)</label>
                    <input
                      type="number"
                      placeholder="45000"
                      value={memberMonthlySalary || ''}
                      onChange={(e) => setMemberMonthlySalary(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 text-xs font-bold"
                      required
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Per-Day Rate (₹)</label>
                    <input
                      type="number"
                      placeholder="2500"
                      value={memberDailyRate || ''}
                      onChange={(e) => setMemberDailyRate(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 text-xs font-bold"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Multi-Software selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-extrabold text-slate-800 uppercase text-[10px]">
                    Permitted Authorized Softwares ({selectedSoftwares.length}/{SOFTWARE_OPTIONS.length})
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      Selected: {selectedSoftwares.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSelectAllModalSoftwares(selectedSoftwares.length < SOFTWARE_OPTIONS.length)}
                      className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 underline uppercase tracking-tight"
                    >
                      {selectedSoftwares.length === SOFTWARE_OPTIONS.length ? 'Unselect All' : 'Select All'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-1.5 max-h-44 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl shadow-inner">
                  {SOFTWARE_OPTIONS.map((opt) => {
                    const isChecked = selectedSoftwares.includes(opt);
                    return (
                      <label
                        key={opt}
                        className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                          isChecked
                            ? 'bg-indigo-50 border-indigo-400 text-indigo-950 font-bold shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSoftwareSelectionModal(opt)}
                          className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                        />
                        <span className="select-none">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm"
                >
                  Save Team Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TEAM MEMBER MODAL */}
      {editingMember && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-indigo-200 animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center font-bold">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Edit Team Member Details</h3>
                  <p className="text-xs text-slate-500">Update profile, role, shift timings and pay structure for {editingMember.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditMemberSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Studio Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as TeamMember['role'])}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  >
                    <option value="Studio Manager">Studio Manager (Full Access)</option>
                    <option value="Manager">Manager (Full Access)</option>
                    <option value="Sales Manager">Sales Manager</option>
                    <option value="Sales Executive">Sales Executive</option>
                    <option value="Sales Team">Sales Team</option>
                    <option value="Account Manager">Account Manager</option>
                    <option value="Video Editor">Video Editor</option>
                    <option value="Photo Editor">Photo Editor</option>
                    <option value="Cinematographer">Cinematographer</option>
                    <option value="Drone Pilot">Drone Pilot</option>
                    <option value="Album Designer">Album Designer</option>
                    <option value="Editor">Editor</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile / Phone</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 text-xs"
                    required
                  />
                </div>
              </div>

              {/* Shift Schedule */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="text-[10px] font-black uppercase text-indigo-700 tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Shift Schedule & Timings</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Duty In Time</label>
                    <input
                      type="text"
                      value={editInTime}
                      onChange={(e) => setEditInTime(e.target.value)}
                      placeholder="09:30 AM"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 font-mono font-bold text-slate-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Duty Out Time</label>
                    <input
                      type="text"
                      value={editOutTime}
                      onChange={(e) => setEditOutTime(e.target.value)}
                      placeholder="07:30 PM"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 font-mono font-bold text-slate-900 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Weekly Off</label>
                    <input
                      type="text"
                      value={editWeeklyOff}
                      onChange={(e) => setEditWeeklyOff(e.target.value)}
                      placeholder="Sunday"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold text-slate-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Lunch Break</label>
                    <input
                      type="text"
                      value={editLunchTime}
                      onChange={(e) => setEditLunchTime(e.target.value)}
                      placeholder="30 Mins"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold text-slate-900 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Pay Structure & Salary */}
              <div className="p-3 bg-indigo-50/70 rounded-2xl border border-indigo-100 space-y-2">
                <div className="text-[10px] font-black uppercase text-indigo-900 tracking-wider flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Pay Structure & Compensation</span>
                </div>
                <div className="flex items-center gap-4 py-1">
                  <label className="flex items-center gap-1.5 font-bold text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="editPayType"
                      value="monthly"
                      checked={editPayType === 'monthly'}
                      onChange={() => setEditPayType('monthly')}
                      className="accent-indigo-600"
                    />
                    <span>Monthly Fixed Salary (₹)</span>
                  </label>
                  <label className="flex items-center gap-1.5 font-bold text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="editPayType"
                      value="daily"
                      checked={editPayType === 'daily'}
                      onChange={() => setEditPayType('daily')}
                      className="accent-indigo-600"
                    />
                    <span>Per-Day Rate (₹)</span>
                  </label>
                </div>

                {editPayType === 'monthly' ? (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Monthly Base Salary (₹)</label>
                    <input
                      type="number"
                      value={editMonthlySalary}
                      onChange={(e) => setEditMonthlySalary(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 text-xs"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Per-Day Shoot Rate (₹)</label>
                    <input
                      type="number"
                      value={editDailyRate}
                      onChange={(e) => setEditDailyRate(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 text-xs"
                    />
                  </div>
                )}
              </div>

              {/* Permitted Softwares */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Permitted Softwares (App Compliance Engine)
                </label>
                <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  {SOFTWARE_OPTIONS.map((sw) => {
                    const isSelected = editSoftwares.includes(sw);
                    return (
                      <label
                        key={sw}
                        className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold cursor-pointer border transition ${
                          isSelected ? 'bg-indigo-50 border-indigo-200 text-indigo-900' : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditSoftwares([...editSoftwares, sw]);
                            } else {
                              setEditSoftwares(editSoftwares.filter((s) => s !== sw));
                            }
                          }}
                          className="accent-indigo-600 rounded"
                        />
                        <span>{sw}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    onDeleteTeamMember(editingMember.id);
                    setEditingMember(null);
                  }}
                  className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-extrabold text-xs flex items-center gap-1 border border-red-200"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Member
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingMember(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RE-LOGIN / UNLOCK SESSION MODAL */}
      {unlockMember && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-red-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600 border border-red-200">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Re-Login Required for {unlockMember.name}
              </h3>
              <p className="text-xs text-slate-500">
                Account was automatically logged out due to software violation (10+ min limit or repeated app switches). Please enter Owner PIN or Password to unlock session.
              </p>
            </div>

            <form onSubmit={handleUnlockSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Enter Password / Owner PIN (Default: 1234)
                </label>
                <input
                  type="password"
                  placeholder="Enter PIN (e.g. 1234)"
                  value={unlockPin}
                  onChange={(e) => {
                    setUnlockPin(e.target.value);
                    setUnlockError('');
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-center font-mono font-bold text-sm text-slate-900 tracking-widest focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  autoFocus
                />
                {unlockError && (
                  <p className="text-[11px] font-bold text-red-600 mt-1 text-center">{unlockError}</p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setUnlockMember(null);
                    setUnlockPin('');
                    setUnlockError('');
                  }}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-1"
                >
                  <Unlock className="w-3.5 h-3.5" /> Re-Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INDIVIDUAL MEMBER DASHBOARD MODAL */}
      {selectedMemberModal && (
        <MemberDashboardModal
          member={selectedMemberModal}
          attendance={effectiveAttendance}
          tasks={tasks}
          projects={projects}
          onClose={() => setSelectedMemberModal(null)}
          onUpdateTeamMember={(updated) => {
            onUpdateTeamMember(updated);
            setSelectedMemberModal(updated);
          }}
          onRecordAttendance={onRecordAttendance}
          onUpdateAttendance={onUpdateAttendance}
          onAddTask={onAddTask || (() => {})}
          onUpdateTask={onUpdateTask || (() => {})}
          onDeleteTask={(id) => {
            if (onDeleteTask) {
              onDeleteTask(id);
            } else {
              try {
                const saved = localStorage.getItem('wpp_owner_crm_tasks') || localStorage.getItem('wpp_owner_tasks');
                if (saved) {
                  const parsed = JSON.parse(saved);
                  const filtered = parsed.filter((t: any) => t.id !== id);
                  localStorage.setItem('wpp_owner_crm_tasks', JSON.stringify(filtered));
                  localStorage.setItem('wpp_owner_tasks', JSON.stringify(filtered));
                  window.dispatchEvent(new Event('storage'));
                }
              } catch (e) {}
            }
          }}
        />
      )}

    </div>
  );
};
