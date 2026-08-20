import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Project, VideoPipeline, PhotoPipeline, ShootEvent, PaymentRecord, EditingStatus, ProjectTask, TeamMember, ClientVaultDocument, CrewMemberAssignment, DataBackup, ProjectStatus, ScheduledPayment } from '@/types';
import { getShootDateInfo, getShootTrackingStats, formatDateDDMMYYYY } from '@/utils/shootTracking';
import { computeAutoProjectStatus } from '@/utils/projectStatusCalculator';
import { ConfirmDeleteModal } from '@/components/common/ConfirmDeleteModal';
import { RoleColumnCrewManager } from './RoleColumnCrewManager';
import { 
  X, 
  Phone, 
  MapPin, 
  Calendar, 
  IndianRupee, 
  Music, 
  Link2, 
  Film, 
  Image as ImageIcon, 
  HardDrive, 
  Plus, 
  FileText,
  Truck,
  ExternalLink,
  Save,
  Trash2,
  Pencil,
  CheckSquare,
  UserCheck,
  Upload,
  Eye,
  Maximize2,
  Paperclip,
  Folder,
  FolderPlus,
  Download,
  FileCheck,
  Users,
  UserPlus,
  Camera,
  Video,
  CheckCircle2,
  CalendarCheck,
  Send,
  Sparkles,
  Clock,
  AlertTriangle
} from 'lucide-react';

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
  onUpdateProject: (updated: Project) => void;
  onGenerateInvoice: (project: Project) => void;
  onDeleteProject?: (projectId: string) => void;
  team?: TeamMember[];
  currentUser?: TeamMember | null;
  userRole?: string;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  onClose,
  onUpdateProject,
  onGenerateInvoice,
  onDeleteProject,
  team = [],
  currentUser,
  userRole,
}) => {
  if (!project) return null;

  const effectiveRole = currentUser?.role || userRole || '';
  const isOwner = effectiveRole === 'Owner';
  const isFullAdmin = isOwner || effectiveRole === 'Studio Manager' || effectiveRole === 'Manager' || effectiveRole === 'Account Manager';
  const isVideoEditor = !isFullAdmin;

  const activeTeamMembers = team && team.length > 0
    ? team
    : [
        { id: 't1', name: 'Rajat Verma', role: 'Owner / Lead' },
        { id: 't2', name: 'Vikram Sharma', role: 'Video Editor' },
        { id: 't3', name: 'Pooja Verma', role: 'Photo Editor' },
        { id: 't4', name: 'Rahul Kapoor', role: 'Cinematographer' },
        { id: 't5', name: 'Amit Kumar', role: 'Drone Operator' },
        { id: 't6', name: 'Sunil Sharma', role: 'Assistant' },
        { id: 't7', name: 'Deepak Saini', role: 'Assistant' },
      ];

  const [activeTab, setActiveTab] = useState<'overview' | 'vault' | 'tasks' | 'shoots' | 'data' | 'payments' | 'deliveries'>('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!isFullAdmin && (activeTab === 'vault' || activeTab === 'payments')) {
      setActiveTab('overview');
    }
  }, [isFullAdmin, activeTab]);

  // Client Folder Vault State
  const [vaultDocs, setVaultDocs] = useState<ClientVaultDocument[]>(() => {
    if (project.clientVaultDocuments && project.clientVaultDocuments.length > 0) {
      return project.clientVaultDocuments;
    }
    if (project.quotationLink) {
      return [
        {
          id: `doc-${Date.now()}-1`,
          name: 'Client Quotation PDF',
          category: 'Quotation PDF',
          fileUrl: project.quotationLink,
          fileType: 'pdf',
          uploadDate: project.createdAt || new Date().toISOString().split('T')[0],
        }
      ];
    }
    return [];
  });

  const [vaultCategory, setVaultCategory] = useState<'Quotation PDF' | 'Payment Slip' | 'Contract / Agreement' | 'Client ID Proof' | 'Other PDF / Doc'>('Quotation PDF');
  const [vaultDocName, setVaultDocName] = useState('');

  const handleVaultFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be under 10MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const isPdf = file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf');
        const isImg = file.type.includes('image');
        const fileType = isPdf ? 'pdf' : (isImg ? 'image' : 'doc');

        const newDoc: ClientVaultDocument = {
          id: `vault-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: vaultDocName.trim() || file.name,
          category: vaultCategory,
          fileUrl: reader.result,
          fileType,
          uploadDate: new Date().toISOString().split('T')[0],
          fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        };

        const updatedDocs = [...vaultDocs, newDoc];
        setVaultDocs(updatedDocs);
        setVaultDocName('');
        onUpdateProject({
          ...project,
          clientVaultDocuments: updatedDocs,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Payment Schedule State
  const [paymentSchedules, setPaymentSchedules] = useState<ScheduledPayment[]>(() => {
    const total = project.totalBudget || 0;
    const advance = project.advanceReceived || (project.payments ? project.payments.reduce((acc, p) => acc + p.amount, 0) : 0);
    const balance = project.balanceDue ?? Math.max(0, total - advance);

    const initialSchedules = (project.paymentSchedule && project.paymentSchedule.length > 0)
      ? project.paymentSchedule
      : [
          {
            id: `sched-1`,
            stageName: '30% Booking Token Advance',
            dueDate: project.createdAt || new Date().toISOString().split('T')[0],
            amount: Math.round(total * 0.30),
            status: 'pending' as const,
            notes: 'Token amount on booking confirmation',
          },
          {
            id: `sched-2`,
            stageName: '60% On Wedding Shoot Date',
            dueDate: project.weddingFunctionDates ? project.weddingFunctionDates.split(' ')[0] : 'Shoot Date',
            amount: Math.round(total * 0.60),
            status: 'pending' as const,
            notes: 'Second installment on main shoot day',
          },
          {
            id: `sched-3`,
            stageName: '10% Final Delivery & Album Handover',
            dueDate: project.finalDeliveryDeadline || 'Final Delivery',
            amount: Math.round(total * 0.10),
            status: 'pending' as const,
            notes: 'Final settlement on deliverable handover',
          },
        ];

    let cumulative = 0;
    return initialSchedules.map((item) => {
      cumulative += item.amount;
      const isMet = balance === 0 || (advance >= cumulative && cumulative > 0);
      return {
        ...item,
        status: isMet ? ('received' as const) : ('pending' as const),
      };
    });
  });

  // Payments local state
  const [payments, setPayments] = useState<PaymentRecord[]>(project.payments || []);

  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false);
  const [editingScheduleItem, setEditingScheduleItem] = useState<ScheduledPayment | null>(null);
  const [schedStageName, setSchedStageName] = useState('');
  const [schedDueDate, setSchedDueDate] = useState('');
  const [schedAmount, setSchedAmount] = useState<number>(0);
  const [schedStatus, setSchedStatus] = useState<'pending' | 'received' | 'overdue'>('pending');
  const [schedNotes, setSchedNotes] = useState('');

  const handleSaveScheduleItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedStageName.trim()) {
      alert('Please enter stage/milestone name');
      return;
    }

    let updated: ScheduledPayment[];
    if (editingScheduleItem) {
      updated = paymentSchedules.map((item) =>
        item.id === editingScheduleItem.id
          ? {
              ...item,
              stageName: schedStageName.trim(),
              dueDate: schedDueDate || 'TBD',
              amount: Number(schedAmount) || 0,
              status: schedStatus,
              notes: schedNotes.trim(),
            }
          : item
      );
    } else {
      const newItem: ScheduledPayment = {
        id: `sched-${Date.now()}`,
        stageName: schedStageName.trim(),
        dueDate: schedDueDate || 'TBD',
        amount: Number(schedAmount) || 0,
        status: schedStatus,
        notes: schedNotes.trim(),
      };
      updated = [...paymentSchedules, newItem];
    }

    setPaymentSchedules(updated);
    onUpdateProject({
      ...project,
      paymentSchedule: updated,
    });

    setShowAddScheduleModal(false);
    setEditingScheduleItem(null);
    setSchedStageName('');
    setSchedDueDate('');
    setSchedAmount(0);
    setSchedStatus('pending');
    setSchedNotes('');
  };

  const handleToggleScheduleStatus = (itemId: string) => {
    const updated = paymentSchedules.map((item) => {
      if (item.id === itemId) {
        const nextStatus: 'pending' | 'received' | 'overdue' = item.status === 'received' ? 'pending' : 'received';
        return { ...item, status: nextStatus };
      }
      return item;
    });

    setPaymentSchedules(updated);
    onUpdateProject({
      ...project,
      paymentSchedule: updated,
    });
  };

  const handleDeleteScheduleItem = (item: ScheduledPayment) => {
    setGenericDeleteModal({
      isOpen: true,
      title: 'Delete Payment Milestone',
      itemTitle: `${item.stageName} (₹${item.amount.toLocaleString('en-IN')})`,
      onConfirm: () => {
        const updated = paymentSchedules.filter((s) => s.id !== item.id);
        setPaymentSchedules(updated);
        onUpdateProject({
          ...project,
          paymentSchedule: updated,
        });
        setGenericDeleteModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleShareScheduleWhatsApp = () => {
    const milestonesText = paymentSchedules
      .map(
        (item, idx) =>
          `📌 *${idx + 1}. ${item.stageName}*\n   • Amount: ₹${item.amount.toLocaleString('en-IN')}\n   • Due Date: ${formatDateDDMMYYYY(item.dueDate) || item.dueDate}\n   • Status: ${item.status === 'received' ? '✅ Received' : item.status === 'overdue' ? '🚨 Overdue' : '⏳ Pending'}`
      )
      .join('\n\n');

    const totalScheduled = paymentSchedules.reduce((acc, i) => acc + i.amount, 0);

    const message = `📋 *PAYMENT SCHEDULE & MILESTONES*\nClient: ${project.clientWeddingTitle}\nTotal Package Budget: ₹${project.totalBudget.toLocaleString('en-IN')}\nTotal Scheduled: ₹${totalScheduled.toLocaleString('en-IN')}\nReceived Till Date: ₹${project.advanceReceived.toLocaleString('en-IN')}\nBalance Remaining: ₹${project.balanceDue.toLocaleString('en-IN')}\n\n*Payment Terms Breakdown:*\n${milestonesText}\n\n- Wedding Photo Planet Accounts`;

    const cleanMobile = (project.clientContactMobile || '').replace(/\D/g, '');
    window.open(`https://wa.me/${cleanMobile}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleDownloadSchedulePDF = () => {
    const doc = new jsPDF();

    // Company Header Branding
    doc.setFillColor(79, 70, 229); // Indigo banner
    doc.rect(0, 0, 210, 25, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('WEDDING PHOTO PLANET', 14, 13);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('OFFICIAL STATEMENT OF ACCOUNT & PAYMENT LOG', 14, 19);

    doc.setTextColor(50, 50, 50);

    // Client Details Block
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('CLIENT & PROJECT DETAILS:', 14, 34);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Client / Wedding: ${project.clientWeddingTitle}`, 14, 40);
    doc.text(`Contact Number: ${project.clientContactMobile || 'N/A'}`, 14, 45);
    doc.text(`Wedding Function Dates: ${project.weddingFunctionDates || 'N/A'}`, 14, 50);
    doc.text(`Statement Issue Date: ${new Date().toLocaleDateString('en-IN')}`, 14, 55);

    // Financial Overview Box calculation
    const totalBudget = project.totalBudget || 0;
    const totalReceived = payments.length > 0
      ? payments.reduce((sum, p) => sum + (p.amount || 0), 0)
      : (project.advanceReceived || 0);
    const balanceDue = Math.max(0, totalBudget - totalReceived);

    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(120, 30, 76, 28, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('TOTAL BUDGET:', 124, 36);
    doc.text('TOTAL RECEIVED:', 124, 43);
    doc.text('BALANCE DUE:', 124, 50);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(`INR ${totalBudget.toLocaleString('en-IN')}`, 160, 36);
    doc.setTextColor(16, 185, 129); // Emerald
    doc.text(`INR ${totalReceived.toLocaleString('en-IN')}`, 160, 43);
    doc.setTextColor(balanceDue > 0 ? 225 : 16, balanceDue > 0 ? 29 : 185, balanceDue > 0 ? 72 : 129); // Red or Emerald
    doc.text(`INR ${balanceDue.toLocaleString('en-IN')}`, 160, 50);

    doc.setTextColor(50, 50, 50);

    // SECTION 1: Scheduled Payment Milestones Plan
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('1. Scheduled Payment Milestones Plan', 14, 65);

    const scheduleTableData = paymentSchedules.map((item, idx) => [
      `${idx + 1}`,
      item.stageName,
      formatDateDDMMYYYY(item.dueDate) || item.dueDate || 'TBD',
      `INR ${item.amount.toLocaleString('en-IN')}`,
      item.notes || '-'
    ]);

    autoTable(doc, {
      startY: 68,
      head: [['#', 'Milestone Stage Name', 'Due Date', 'Scheduled Amount', 'Notes / Terms']],
      body: scheduleTableData,
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      bodyStyles: {
        fontSize: 8,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 68 },
        2: { cellWidth: 32 },
        3: { cellWidth: 38, fontStyle: 'bold' },
        4: { cellWidth: 34 },
      },
    });

    let currentY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 130;

    // SECTION 2: Received Payment Receipts & Installment Log
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('2. Received Payment Receipts & Installment Log', 14, currentY);

    const paymentsTableData = payments.length > 0
      ? payments.map((p, idx) => [
          `${idx + 1}`,
          p.receiptNumber ? `#${p.receiptNumber}` : `REC-${idx + 1}`,
          formatDateDDMMYYYY(p.date) || p.date || 'N/A',
          p.paymentMode || 'N/A',
          `INR ${(p.amount || 0).toLocaleString('en-IN')}`,
          p.notes || '-'
        ])
      : [['-', '-', '-', 'No installment payments recorded yet', 'INR 0', '-']];

    autoTable(doc, {
      startY: currentY + 4,
      head: [['#', 'Receipt #', 'Received Date', 'Payment Mode', 'Amount Received', 'Remarks / Ref']],
      body: paymentsTableData,
      headStyles: {
        fillColor: [16, 185, 129], // Emerald green header
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      bodyStyles: {
        fontSize: 8,
      },
      alternateRowStyles: {
        fillColor: [240, 253, 244],
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 28 },
        2: { cellWidth: 28 },
        3: { cellWidth: 32 },
        4: { cellWidth: 35, fontStyle: 'bold', textColor: [16, 185, 129] },
        5: { cellWidth: 49 },
      },
    });

    currentY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : currentY + 40;

    // SECTION 3: Outstanding Summary Box
    doc.setFillColor(balanceDue > 0 ? 254 : 240, balanceDue > 0 ? 242 : 253, balanceDue > 0 ? 242 : 244);
    doc.setDrawColor(balanceDue > 0 ? 254 : 187, balanceDue > 0 ? 202 : 247, balanceDue > 0 ? 202 : 208);
    doc.roundedRect(14, currentY, 182, 22, 2, 2, 'FD');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('STATEMENT ACCOUNT SUMMARY:', 18, currentY + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(`Total Package Cost: INR ${totalBudget.toLocaleString('en-IN')}`, 18, currentY + 14);
    doc.text(`Total Collections Logged: INR ${totalReceived.toLocaleString('en-IN')}`, 95, currentY + 14);

    doc.setFont('helvetica', 'bold');
    if (balanceDue > 0) {
      doc.setTextColor(225, 29, 72); // Red
      doc.text(`NET OUTSTANDING BALANCE: INR ${balanceDue.toLocaleString('en-IN')}`, 18, currentY + 19);
    } else {
      doc.setTextColor(16, 185, 129); // Green
      doc.text(`NET BALANCE DUE: INR 0 (FULL PAYMENT CLEARED)`, 18, currentY + 19);
    }

    currentY += 28;

    // Footer terms
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text('Note: This is an official payment statement reflecting recorded installment logs and scheduled milestones.', 14, currentY);
    doc.text('Thank you for choosing Wedding Photo Planet! - Studio Operations & Accounts Team', 14, currentY + 5);

    doc.save(`Payment_Statement_${(project.clientWeddingTitle || 'Client').replace(/\s+/g, '_')}.pdf`);
  };

  // Generic Delete Confirmation Modal State
  const [genericDeleteModal, setGenericDeleteModal] = useState<{
    isOpen: boolean;
    title: string;
    itemTitle: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    itemTitle: '',
    onConfirm: () => {},
  });

  // State for Editing Event Details in Data/Shoots tab
  const [editingEventData, setEditingEventData] = useState<{
    shootId: string;
    title: string;
    date: string;
    time: string;
    venue: string;
    status: 'scheduled' | 'completed' | 'cancelled';
  } | null>(null);

  // State for Adding Crew Slot directly in Data/Shoots tab
  const [addingCrewShootId, setAddingCrewShootId] = useState<string | null>(null);
  const [newCrewRoleInput, setNewCrewRoleInput] = useState<string>('Photographer');
  const [newCrewNameInput, setNewCrewNameInput] = useState<string>('');

  // State for Editing Crew Member details in Modal
  const [editingCrewData, setEditingCrewData] = useState<{
    shootId: string;
    crewId: string;
    role: string;
    name: string;
    mobile: string;
    dataSizeGB: number;
    copyInHD: string;
    backupInHD: string;
  } | null>(null);

  const handleDeleteVaultDoc = (id: string) => {
    const targetDoc = vaultDocs.find((d) => d.id === id);
    setGenericDeleteModal({
      isOpen: true,
      title: 'Delete Document',
      itemTitle: targetDoc?.title || 'Vault Document',
      onConfirm: () => {
        const updatedDocs = vaultDocs.filter((d) => d.id !== id);
        setVaultDocs(updatedDocs);
        onUpdateProject({
          ...project,
          clientVaultDocuments: updatedDocs,
        });
        setGenericDeleteModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Local Tasks state
  const [taskList, setTaskList] = useState<ProjectTask[]>(
    project.tasks && project.tasks.length > 0
      ? project.tasks
      : [
          {
            id: `task-${Date.now()}-1`,
            taskName: 'Cinematic Teaser Video',
            quantity: 1,
            unit: 'Video',
            assignedTo: 'Vikram Sharma',
            status: 'not_started',
          },
          {
            id: `task-${Date.now()}-2`,
            taskName: 'Instagram Reels / Shorts',
            quantity: 5,
            unit: 'Reels',
            assignedTo: 'Rahul Editor',
            status: 'not_started',
          },
          {
            id: `task-${Date.now()}-3`,
            taskName: 'Wedding Film / Long Video',
            quantity: 1,
            unit: 'Video',
            assignedTo: 'Amit Editor',
            status: 'not_started',
          },
          {
            id: `task-${Date.now()}-4`,
            taskName: 'Photo Selection & Retouching',
            quantity: 100,
            unit: 'Photos',
            assignedTo: 'Pooja Verma',
            status: 'not_started',
          },
          {
            id: `task-${Date.now()}-5`,
            taskName: 'Wedding Albums (12x36)',
            quantity: 2,
            unit: 'Albums',
            assignedTo: 'Rajat Verma',
            status: 'not_started',
          }
        ]
  );

  const handleAddTask = () => {
    const newTask: ProjectTask = {
      id: `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      taskName: '',
      quantity: 1,
      unit: 'Pcs',
      assignedTo: 'Unassigned',
      status: 'not_started',
    };
    const updatedTasks = [...taskList, newTask];
    setTaskList(updatedTasks);

    const updatedProject: Project = {
      ...project,
      tasks: updatedTasks,
    };
    updatedProject.status = computeAutoProjectStatus(updatedProject).autoStatus;
    onUpdateProject(updatedProject);
  };

  const handleRemoveTask = (index: number) => {
    const task = taskList[index];
    setGenericDeleteModal({
      isOpen: true,
      title: 'Delete Task',
      itemTitle: task?.taskName || `Task #${index + 1}`,
      onConfirm: () => {
        const updatedTasks = taskList.filter((_, i) => i !== index);
        setTaskList(updatedTasks);
        setGenericDeleteModal((prev) => ({ ...prev, isOpen: false }));

        const updatedProject: Project = {
          ...project,
          tasks: updatedTasks,
        };
        updatedProject.status = computeAutoProjectStatus(updatedProject).autoStatus;
        onUpdateProject(updatedProject);
      },
    });
  };

  const handleTaskChange = (index: number, field: keyof ProjectTask, value: any) => {
    const updated = [...taskList];
    updated[index] = { ...updated[index], [field]: value };
    setTaskList(updated);

    const updatedProject: Project = {
      ...project,
      tasks: updated,
    };
    updatedProject.status = computeAutoProjectStatus(updatedProject).autoStatus;
    onUpdateProject(updatedProject);
  };

  const handleSaveTasks = () => {
    const updatedProject: Project = {
      ...project,
      tasks: taskList,
    };
    const autoWork = computeAutoProjectStatus(updatedProject);
    updatedProject.status = autoWork.autoStatus;
    onUpdateProject(updatedProject);
    alert('Tasks & Assignments saved successfully!');
  };

  // Video Pipeline local state
  const [videoPipe, setVideoPipe] = useState<VideoPipeline>(project.videoPipeline);
  // Photo Pipeline local state
  const [photoPipe, setPhotoPipe] = useState<PhotoPipeline>(project.photoPipeline);
  // Data Backup local state
  const [dataBackup, setDataBackup] = useState<DataBackup>(
    project.dataBackup || {
      offloadedFromCards: false,
      hardDrive1: 'HD-1',
      hardDrive1Done: false,
      hardDrive2: 'HD-2',
      hardDrive2Done: false,
      cloudBackupLink: '',
      cloudBackupDone: false,
      totalDataSizeGB: 0,
      rawCleanupStatus: 'archived',
    }
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleUpdateDataBackup = (updatedFields: Partial<DataBackup>) => {
    const updatedBackup = { ...dataBackup, ...updatedFields };
    setDataBackup(updatedBackup);
    onUpdateProject({
      ...project,
      dataBackup: updatedBackup,
    });
  };

  // New Payment Form
  const [newPayAmount, setNewPayAmount] = useState<number>(0);
  const [newPayMode, setNewPayMode] = useState<'UPI / GPay' | 'Bank Transfer' | 'Cash' | 'Cheque'>('UPI / GPay');
  const [newPayNotes, setNewPayNotes] = useState<string>('');
  const [newPayScreenshot, setNewPayScreenshot] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be under 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setNewPayScreenshot(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdatePaymentScreenshot = (paymentId: string, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be under 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const updatedPayments = payments.map((p) =>
          p.id === paymentId ? { ...p, receiptScreenshot: reader.result as string } : p
        );
        setPayments(updatedPayments);
        const totalAdv = updatedPayments.reduce((acc, p) => acc + p.amount, 0);
        const balDue = Math.max(0, project.totalBudget - totalAdv);
        onUpdateProject({
          ...project,
          payments: updatedPayments,
          advanceReceived: totalAdv,
          balanceDue: balDue,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // New Shoot Form
  const [showAddShoot, setShowAddShoot] = useState(false);
  const [shootTitle, setShootTitle] = useState('');
  const [shootDate, setShootDate] = useState('');
  const [shootStartTime, setShootStartTime] = useState('');
  const [shootEndTime, setShootEndTime] = useState('');
  const [shootVenue, setShootVenue] = useState('');
  const [shootLead, setShootLead] = useState('Rajat Verma');
  const [shootTime, setShootTime] = useState('09:00 AM - 09:00 PM');
  const [newShootCrew, setNewShootCrew] = useState<CrewMemberAssignment[]>([
    { id: 'c1', name: 'Rajat Verma', role: 'Photographer', mobile: '' },
    { id: 'c2', name: 'Rahul Kapoor', role: 'Videographer', mobile: '' },
    { id: 'c3', name: 'Sunil Sharma', role: 'Assistant', mobile: '' }
  ]);

  const handleAddNewShootCrewRow = () => {
    setNewShootCrew((prev) => [
      ...prev,
      { id: `c-${Date.now()}-${Math.floor(Math.random() * 1000)}`, name: '', role: 'Photographer', mobile: '' }
    ]);
  };

  const handleRemoveNewShootCrewRow = (idx: number) => {
    setNewShootCrew((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleNewShootCrewChange = (idx: number, field: string, value: string) => {
    setNewShootCrew((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  // Role Column Quantity Add/Remove handlers for existing shoots
  const handleAddRoleQuantityToShoot = (shootId: string, role: string, quantity: number) => {
    if (quantity <= 0) return;
    const newItems: CrewMemberAssignment[] = Array.from({ length: quantity }).map((_, i) => ({
      id: `c-${Date.now()}-${Math.random().toString(36).substr(2, 5)}-${i}`,
      name: '',
      role: role as any,
      mobile: '',
    }));

    const updatedShoots = project.shoots.map((s) => {
      if (s.id !== shootId) return s;
      return {
        ...s,
        crewAssignments: [...(s.crewAssignments || []), ...newItems]
      };
    });
    onUpdateProject({ ...project, shoots: updatedShoots });
  };

  const handleRemoveRoleFromShoot = (shootId: string, role: string) => {
    const updatedShoots = project.shoots.map((s) => {
      if (s.id !== shootId) return s;
      return {
        ...s,
        crewAssignments: (s.crewAssignments || []).filter((c) => c.role !== role)
      };
    });
    onUpdateProject({ ...project, shoots: updatedShoots });
  };

  // Role Column handlers for New Shoot Form
  const handleAddRoleQuantityToNewShoot = (role: string, quantity: number) => {
    if (quantity <= 0) return;
    const newItems: CrewMemberAssignment[] = Array.from({ length: quantity }).map((_, i) => ({
      id: `c-${Date.now()}-${Math.random().toString(36).substr(2, 5)}-${i}`,
      name: '',
      role: role as any,
      mobile: '',
    }));
    setNewShootCrew((prev) => [...prev, ...newItems]);
  };

  const handleRemoveRoleFromNewShoot = (role: string) => {
    setNewShootCrew((prev) => prev.filter((c) => c.role !== role));
  };

  const handleRemoveCrewFromExistingShoot = (shootId: string, crewId: string) => {
    const updatedShoots = project.shoots.map((s) => {
      if (s.id !== shootId) return s;
      return {
        ...s,
        crewAssignments: (s.crewAssignments || []).filter((c) => c.id !== crewId)
      };
    });
    onUpdateProject({ ...project, shoots: updatedShoots });
  };

  const handleUpdateCrewInExistingShoot = (shootId: string, crewId: string, field: string, value: any) => {
    const updatedShoots = project.shoots.map((s) => {
      if (s.id !== shootId) return s;
      const updatedCrew = (s.crewAssignments || []).map((c) => {
        if (c.id !== crewId) return c;
        return { ...c, [field]: value };
      });
      return { ...s, crewAssignments: updatedCrew };
    });

    const allCrew = updatedShoots.flatMap((s) => s.crewAssignments || []);
    const crewCopyHDs = Array.from(
      new Set(
        allCrew
          .map((c) => (c.copyInHD || c.hardDriveName || '').trim())
          .filter(Boolean)
      )
    ).join(', ');

    const crewBackupHDs = Array.from(
      new Set(
        allCrew
          .map((c) => (c.backupInHD || '').trim())
          .filter(Boolean)
      )
    ).join(', ');

    const backup = project.dataBackup || {
      offloadedFromCards: false,
      hardDrive1: '',
      hardDrive1Done: false,
      hardDrive2: '',
      hardDrive2Done: false,
      cloudBackupDone: false,
      totalDataSizeGB: 0,
      rawCleanupStatus: 'raw_kept',
    };

    let updatedHD1 = backup.hardDrive1;
    if (!updatedHD1 || updatedHD1 === 'Pending Shoot' || updatedHD1 === 'HD-1' || field === 'copyInHD') {
      if (crewCopyHDs) updatedHD1 = crewCopyHDs;
    }

    let updatedHD2 = backup.hardDrive2;
    if (!updatedHD2 || updatedHD2 === 'Pending Shoot' || updatedHD2 === 'HD-2' || field === 'backupInHD') {
      if (crewBackupHDs) updatedHD2 = crewBackupHDs;
    }

    onUpdateProject({
      ...project,
      shoots: updatedShoots,
      dataBackup: {
        ...backup,
        hardDrive1: updatedHD1,
        hardDrive2: updatedHD2,
      },
    });
  };

  const handleDeleteShootEvent = (shootId: string) => {
    const shoot = project.shoots.find((s) => s.id === shootId);
    setGenericDeleteModal({
      isOpen: true,
      title: 'Delete Shoot Event',
      itemTitle: shoot?.title || 'Shoot Event',
      onConfirm: () => {
        const updatedShoots = project.shoots.filter((s) => s.id !== shootId);
        onUpdateProject({ ...project, shoots: updatedShoots });
        setGenericDeleteModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleSaveEditedEvent = () => {
    if (!editingEventData) return;
    const updatedShoots = project.shoots.map((s) => {
      if (s.id !== editingEventData.shootId) return s;
      return {
        ...s,
        title: editingEventData.title.trim() || s.title,
        date: editingEventData.date.trim() || s.date,
        time: editingEventData.time.trim() || s.time,
        venue: editingEventData.venue.trim() || s.venue,
        status: editingEventData.status || s.status || 'scheduled',
      };
    });
    onUpdateProject({ ...project, shoots: updatedShoots });
    setEditingEventData(null);
  };

  const handleAddCrewSlotToShoot = (shootId: string) => {
    if (!newCrewRoleInput) return;
    const newMember: CrewMemberAssignment = {
      id: `c-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      role: newCrewRoleInput as any,
      name: newCrewNameInput.trim(),
      mobile: '',
      dataReceived: false,
      dataSizeGB: 0,
      copyInHD: '',
      backupInHD: '',
    };
    const updatedShoots = project.shoots.map((s) => {
      if (s.id !== shootId) return s;
      return {
        ...s,
        crewAssignments: [...(s.crewAssignments || []), newMember],
      };
    });
    onUpdateProject({ ...project, shoots: updatedShoots });
    setAddingCrewShootId(null);
    setNewCrewNameInput('');
  };

  const handleSaveEditedCrewData = () => {
    if (!editingCrewData) return;
    handleUpdateCrewInExistingShoot(editingCrewData.shootId, editingCrewData.crewId, 'role', editingCrewData.role);
    handleUpdateCrewInExistingShoot(editingCrewData.shootId, editingCrewData.crewId, 'name', editingCrewData.name);
    handleUpdateCrewInExistingShoot(editingCrewData.shootId, editingCrewData.crewId, 'mobile', editingCrewData.mobile);
    handleUpdateCrewInExistingShoot(editingCrewData.shootId, editingCrewData.crewId, 'dataSizeGB', editingCrewData.dataSizeGB);
    handleUpdateCrewInExistingShoot(editingCrewData.shootId, editingCrewData.crewId, 'copyInHD', editingCrewData.copyInHD);
    handleUpdateCrewInExistingShoot(editingCrewData.shootId, editingCrewData.crewId, 'backupInHD', editingCrewData.backupInHD);
    setEditingCrewData(null);
  };

  const handleDeleteCrewMemberSlot = (shootId: string, crewId: string, roleName: string, memberName: string) => {
    setGenericDeleteModal({
      isOpen: true,
      title: 'Delete Team Member Entry',
      itemTitle: `${roleName}: ${memberName || 'Unassigned Slot'}`,
      onConfirm: () => {
        handleRemoveCrewFromExistingShoot(shootId, crewId);
        setGenericDeleteModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleDeletePayment = (paymentId: string) => {
    const p = payments.find((item) => item.id === paymentId);
    setGenericDeleteModal({
      isOpen: true,
      title: 'Delete Payment',
      itemTitle: `₹${p?.amount ? p.amount.toLocaleString('en-IN') : 0} (${p?.paymentMode || 'Payment'})`,
      onConfirm: () => {
        const updatedPayments = payments.filter((item) => item.id !== paymentId);
        const updatedAdvance = updatedPayments.reduce((acc, pay) => acc + pay.amount, 0);
        const updatedBalance = Math.max(0, project.totalBudget - updatedAdvance);
        setPayments(updatedPayments);
        onUpdateProject({
          ...project,
          payments: updatedPayments,
          advanceReceived: updatedAdvance,
          balanceDue: updatedBalance,
        });
        setGenericDeleteModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Save changes
  const handleSavePipeline = () => {
    const updatedAdvance = payments.reduce((acc, p) => acc + p.amount, 0);
    const updatedBalance = Math.max(0, project.totalBudget - updatedAdvance);

    const updatedProject: Project = {
      ...project,
      videoPipeline: videoPipe,
      photoPipeline: photoPipe,
      dataBackup,
      payments,
      advanceReceived: updatedAdvance,
      balanceDue: updatedBalance,
    };

    const autoWork = computeAutoProjectStatus(updatedProject);
    updatedProject.status = autoWork.autoStatus;

    onUpdateProject(updatedProject);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2500);
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPayAmount <= 0) return;

    const newPay: PaymentRecord = {
      id: `pay-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      amount: Number(newPayAmount),
      type: 'installment',
      paymentMode: newPayMode,
      receiptNumber: `WPP-REC-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: newPayNotes || 'Installment received',
      receiptScreenshot: newPayScreenshot || undefined,
    };

    const updatedPayments = [...payments, newPay];
    const totalAdv = updatedPayments.reduce((acc, p) => acc + p.amount, 0);
    const balDue = Math.max(0, project.totalBudget - totalAdv);

    setPayments(updatedPayments);
    setNewPayAmount(0);
    setNewPayNotes('');
    setNewPayScreenshot('');

    let cumulativeReq = 0;
    const syncSchedules = paymentSchedules.map((item) => {
      cumulativeReq += item.amount;
      const isMet = balDue === 0 || (totalAdv >= cumulativeReq && cumulativeReq > 0);
      return { ...item, status: isMet ? ('received' as const) : ('pending' as const) };
    });

    setPaymentSchedules(syncSchedules);

    const updatedProject: Project = {
      ...project,
      payments: updatedPayments,
      advanceReceived: totalAdv,
      balanceDue: balDue,
      paymentSchedule: syncSchedules,
    };

    onUpdateProject(updatedProject);
  };

  const handleAddShoot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shootTitle || !shootDate) return;

    const displayTime = shootStartTime && shootEndTime
      ? `${shootStartTime} - ${shootEndTime}`
      : shootStartTime || shootEndTime || shootTime || '09:00 AM - 09:00 PM';

    const newShoot: ShootEvent = {
      id: `shoot-${Date.now()}`,
      title: shootTitle,
      date: shootDate,
      time: displayTime,
      startTime: shootStartTime,
      endTime: shootEndTime,
      venue: shootVenue || project.venueLocation,
      location: project.venueLocation,
      leadPhotographer: shootLead,
      cinematographer: 'Rahul Kapoor',
      droneOperator: 'Amit Kumar',
      assistant: 'Sunil Sharma',
      crewAssignments: newShootCrew.filter((c) => c.name || c.role),
      equipmentChecklist: ['Sony A7IV', 'Sony FX3', 'Gimbal', 'Lights'],
      status: 'scheduled',
    };

    const updatedShoots = [...project.shoots, newShoot];
    const updatedProject: Project = {
      ...project,
      shoots: updatedShoots,
    };

    onUpdateProject(updatedProject);
    setShowAddShoot(false);
    setShootTitle('');
    setShootDate('');
    setShootStartTime('');
    setShootEndTime('');
    setShootVenue('');
    setNewShootCrew([
      { id: 'c1', name: '', role: 'Photographer', mobile: '' },
      { id: 'c2', name: '', role: 'Videographer', mobile: '' },
      { id: 'c3', name: '', role: 'Assistant', mobile: '' }
    ]);
  };

  const workInfo = computeAutoProjectStatus(project);
  const displayStatus = project.status === 'ready_to_deliver'
    ? 'ready_to_deliver'
    : (workInfo.autoStatus === 'completed' || workInfo.autoStatus === 'ready_to_deliver')
    ? workInfo.autoStatus
    : project.status || workInfo.autoStatus;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl md:w-[92vw] lg:w-[1024px] shadow-2xl overflow-hidden h-[92vh] max-h-[92vh] my-auto flex flex-col">
        
        {/* Header */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200 flex items-start justify-between shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                {project.primaryServiceType}
              </span>
              <select
                value={
                  displayStatus === 'completed'
                    ? 'completed'
                    : displayStatus === 'ready_to_deliver'
                    ? 'ready_to_deliver'
                    : 'running'
                }
                onChange={(e) => {
                  onUpdateProject({
                    ...project,
                    status: e.target.value as ProjectStatus,
                  });
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider cursor-pointer border outline-none shadow-2xs ${
                  displayStatus === 'ready_to_deliver'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                    : displayStatus === 'completed'
                    ? 'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200'
                    : 'bg-indigo-100 text-indigo-800 border-indigo-300 hover:bg-indigo-200'
                }`}
                title="Auto-tracked from project tasks & work status"
              >
                <option value="running" className="bg-white text-slate-900 font-bold">
                  🏃 RUNNING
                </option>
                <option value="completed" className="bg-white text-slate-900 font-bold">
                  ✓ COMPLETED
                </option>
                <option value="ready_to_deliver" className="bg-white text-slate-900 font-bold">
                  🚚 DELIVERED
                </option>
              </select>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {project.clientWeddingTitle}
            </h2>
            <p className="text-xs text-slate-500 flex items-center gap-3">
              <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-indigo-600" /> {project.clientContactMobile}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-indigo-600" /> {project.venueLocation}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isVideoEditor && (
              <button
                onClick={() => onGenerateInvoice(project)}
                className="px-3 py-1.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs uppercase tracking-wider border border-indigo-200 transition flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Invoice / Receipt</span>
              </button>
            )}

            {!isVideoEditor && onDeleteProject && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition"
                title="Delete Project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 border-b border-slate-200 px-3 sm:px-4 flex items-center gap-1.5 overflow-x-auto text-xs pt-1.5 scrollbar-thin scrollbar-thumb-slate-300 pr-8 w-full shrink-0 sticky top-0 z-10">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2 font-bold border-b-2 uppercase tracking-wider text-[11px] transition whitespace-nowrap shrink-0 rounded-t-md ${
              activeTab === 'overview' ? 'border-indigo-600 text-indigo-600 bg-white shadow-2xs font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
            }`}
          >
            Overview
          </button>
          {!isVideoEditor && (
            <button
              onClick={() => setActiveTab('vault')}
              className={`px-3 py-2 font-bold border-b-2 uppercase tracking-wider text-[11px] transition whitespace-nowrap shrink-0 flex items-center gap-1.5 rounded-t-md ${
                activeTab === 'vault' ? 'border-indigo-600 text-indigo-600 bg-white shadow-2xs font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
              }`}
            >
              <Folder className="w-3.5 h-3.5 text-indigo-600" />
              Client Vault ({vaultDocs.length})
            </button>
          )}
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3 py-2 font-bold border-b-2 uppercase tracking-wider text-[11px] transition whitespace-nowrap shrink-0 flex items-center gap-1.5 rounded-t-md ${
              activeTab === 'tasks' ? 'border-indigo-600 text-indigo-600 bg-white shadow-2xs font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Tasks ({taskList.length})
          </button>
          <button
            onClick={() => setActiveTab('shoots')}
            className={`px-3 py-2 font-bold border-b-2 uppercase tracking-wider text-[11px] transition whitespace-nowrap shrink-0 flex items-center gap-1.5 rounded-t-md ${
              activeTab === 'shoots' ? 'border-indigo-600 text-indigo-600 bg-white shadow-2xs font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Shoots ({project.shoots.length})
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`px-3 py-2 font-bold border-b-2 uppercase tracking-wider text-[11px] transition whitespace-nowrap shrink-0 flex items-center gap-1.5 rounded-t-md ${
              activeTab === 'data' ? 'border-indigo-600 text-indigo-600 bg-white shadow-2xs font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            RAW Data
          </button>
          {!isVideoEditor && (
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-3 py-2 font-bold border-b-2 uppercase tracking-wider text-[11px] transition whitespace-nowrap shrink-0 flex items-center gap-1.5 rounded-t-md ${
                activeTab === 'payments' ? 'border-indigo-600 text-indigo-600 bg-white shadow-2xs font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
              }`}
            >
              <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
              Payments ({project.balanceDue > 0 ? `Due: ₹${project.balanceDue.toLocaleString('en-IN')}` : 'Paid'})
            </button>
          )}
          <button
            onClick={() => setActiveTab('deliveries')}
            className={`px-3 py-2 font-bold border-b-2 uppercase tracking-wider text-[11px] transition whitespace-nowrap shrink-0 flex items-center gap-1.5 rounded-t-md ${
              activeTab === 'deliveries' ? 'border-indigo-600 text-indigo-600 bg-white shadow-2xs font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            Deliveries
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-slate-800 text-xs w-full">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              
              {/* Financial Box */}
              {!isVideoEditor && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Budget</span>
                    <div className="text-xl font-black text-slate-900 mt-0.5">₹{project.totalBudget.toLocaleString('en-IN')}</div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-green-700 uppercase font-bold tracking-wider">Total Received</span>
                    <div className="text-xl font-black text-green-700 mt-0.5">₹{project.advanceReceived.toLocaleString('en-IN')}</div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-red-600 uppercase font-bold tracking-wider">Balance Due</span>
                    <div className={`text-xl font-black mt-0.5 ${project.balanceDue > 0 ? 'text-red-600' : 'text-green-700'}`}>
                      ₹{project.balanceDue.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              )}

              {/* PAYMENT SCHEDULE CARD (Right above DATES & SCHEDULE) */}
              {!isVideoEditor && (
                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                        <CalendarCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                          <span>Payment Schedule & Milestones</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Stage-wise payment terms, due dates & collection progress
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={handleShareScheduleWhatsApp}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center gap-1 border border-emerald-200 transition cursor-pointer"
                        title="Share Payment Schedule on WhatsApp"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">WhatsApp Schedule</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadSchedulePDF}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1 border border-indigo-200 transition cursor-pointer"
                        title="Download Official Payment Schedule PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Download PDF</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const defaults: ScheduledPayment[] = [
                              {
                                id: `sched-${Date.now()}-1`,
                                stageName: '30% Booking Token Advance',
                                dueDate: project.createdAt || new Date().toISOString().split('T')[0],
                                amount: Math.round((project.totalBudget || 0) * 0.30),
                                status: (project.advanceReceived || 0) >= Math.round((project.totalBudget || 0) * 0.30) ? 'received' : 'pending',
                                notes: 'Token advance on booking',
                              },
                              {
                                id: `sched-${Date.now()}-2`,
                                stageName: '60% On Wedding Shoot Date',
                                dueDate: project.weddingFunctionDates ? project.weddingFunctionDates.split(' ')[0] : 'Shoot Date',
                                amount: Math.round((project.totalBudget || 0) * 0.60),
                                status: (project.advanceReceived || 0) >= Math.round((project.totalBudget || 0) * 0.90) ? 'received' : 'pending',
                                notes: 'Second installment on main event',
                              },
                              {
                                id: `sched-${Date.now()}-3`,
                                stageName: '10% Final Delivery & Album Handover',
                                dueDate: project.finalDeliveryDeadline || 'Final Delivery',
                                amount: Math.round((project.totalBudget || 0) * 0.10),
                                status: (project.balanceDue || 0) === 0 ? 'received' : 'pending',
                                notes: 'Final settlement on deliverable handover',
                              },
                            ];
                            setPaymentSchedules(defaults);
                            onUpdateProject({ ...project, paymentSchedule: defaults });
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs flex items-center gap-1 border border-amber-300 transition cursor-pointer"
                        title="Reset schedule to standard 30%-60%-10% plan"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span className="hidden md:inline">Set 30%-60%-10% Plan</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingScheduleItem(null);
                          setSchedStageName('');
                          setSchedDueDate(project.weddingFunctionDates ? project.weddingFunctionDates.split(' ')[0] : '');
                          setSchedAmount(Math.max(0, project.balanceDue));
                          setSchedStatus('pending');
                          setSchedNotes('');
                          setShowAddScheduleModal(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center gap-1 shadow-xs transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Add Milestone</span>
                      </button>
                    </div>
                  </div>

                  {/* Schedule Items List */}
                  {paymentSchedules.length === 0 ? (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-3">
                      <p className="text-xs font-bold text-slate-500">No payment schedule defined yet.</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const defaults: ScheduledPayment[] = [
                              {
                                id: `sched-${Date.now()}-1`,
                                stageName: '30% Booking Token Advance',
                                dueDate: project.createdAt || new Date().toISOString().split('T')[0],
                                amount: Math.round((project.totalBudget || 0) * 0.30),
                                status: (project.advanceReceived || 0) >= Math.round((project.totalBudget || 0) * 0.30) ? 'received' : 'pending',
                                notes: 'Token advance on booking',
                              },
                              {
                                id: `sched-${Date.now()}-2`,
                                stageName: '60% On Wedding Shoot Date',
                                dueDate: project.weddingFunctionDates ? project.weddingFunctionDates.split(' ')[0] : 'Shoot Date',
                                amount: Math.round((project.totalBudget || 0) * 0.60),
                                status: (project.advanceReceived || 0) >= Math.round((project.totalBudget || 0) * 0.90) ? 'received' : 'pending',
                                notes: 'Second installment on main event',
                              },
                              {
                                id: `sched-${Date.now()}-3`,
                                stageName: '10% Final Delivery & Album Handover',
                                dueDate: project.finalDeliveryDeadline || 'Final Delivery',
                                amount: Math.round((project.totalBudget || 0) * 0.10),
                                status: (project.balanceDue || 0) === 0 ? 'received' : 'pending',
                                notes: 'Final settlement on deliverable handover',
                              },
                            ];
                            setPaymentSchedules(defaults);
                            onUpdateProject({ ...project, paymentSchedule: defaults });
                          }}
                          className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>Auto-Generate Standard 30%-60%-10% Plan</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const defaults: ScheduledPayment[] = [
                              {
                                id: `sched-${Date.now()}-1`,
                                stageName: '25% Booking Token Advance',
                                dueDate: project.createdAt || new Date().toISOString().split('T')[0],
                                amount: Math.round((project.totalBudget || 0) * 0.25),
                                status: (project.advanceReceived || 0) >= Math.round((project.totalBudget || 0) * 0.25) ? 'received' : 'pending',
                                notes: 'Token advance on booking',
                              },
                              {
                                id: `sched-${Date.now()}-2`,
                                stageName: '50% On Wedding Shoot Date',
                                dueDate: project.weddingFunctionDates ? project.weddingFunctionDates.split(' ')[0] : 'Shoot Date',
                                amount: Math.round((project.totalBudget || 0) * 0.50),
                                status: (project.advanceReceived || 0) >= Math.round((project.totalBudget || 0) * 0.75) ? 'received' : 'pending',
                                notes: 'Second installment on main event',
                              },
                              {
                                id: `sched-${Date.now()}-3`,
                                stageName: '25% Final Delivery & Album Handover',
                                dueDate: project.finalDeliveryDeadline || 'Final Delivery',
                                amount: Math.round((project.totalBudget || 0) * 0.25),
                                status: (project.balanceDue || 0) === 0 ? 'received' : 'pending',
                                notes: 'Final settlement on deliverable handover',
                              },
                            ];
                            setPaymentSchedules(defaults);
                            onUpdateProject({ ...project, paymentSchedule: defaults });
                          }}
                          className="px-3 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Alternate 25%-50%-25% Plan</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {paymentSchedules.map((item, idx) => {
                        let cumulativeReq = 0;
                        for (let i = 0; i <= idx; i++) {
                          cumulativeReq += paymentSchedules[i].amount;
                        }
                        const currentAdvance = project.advanceReceived || (project.payments ? project.payments.reduce((acc, p) => acc + p.amount, 0) : 0);
                        const isFullyPaid = (project.balanceDue ?? (project.totalBudget - currentAdvance)) <= 0;

                        const isReceived = item.status === 'received' || isFullyPaid || (currentAdvance >= cumulativeReq && cumulativeReq > 0);
                        const isOverdue = !isReceived && item.status === 'overdue';
                        const pct = project.totalBudget > 0 ? Math.round((item.amount / project.totalBudget) * 100) : 0;

                        return (
                          <div
                            key={item.id}
                            className={`p-3 rounded-xl border transition space-y-2 relative flex flex-col justify-between ${
                              isReceived
                                ? 'bg-emerald-50/60 border-emerald-200'
                                : isOverdue
                                ? 'bg-red-50/60 border-red-200'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-start justify-between gap-1 min-w-0">
                                <div className="font-extrabold text-slate-900 text-xs min-w-0 flex-1 pr-1">{item.stageName}</div>
                                <span
                                  className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 whitespace-nowrap ${
                                    isReceived
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      : isOverdue
                                      ? 'bg-red-100 text-red-800 border border-red-200'
                                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                                  }`}
                                >
                                  {isReceived ? 'Received' : isOverdue ? 'Overdue' : 'Pending'}
                                </span>
                              </div>

                              <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                <span>Due: {formatDateDDMMYYYY(item.dueDate) || item.dueDate || 'TBD'}</span>
                              </div>
                            </div>

                            <div className="flex items-baseline justify-between border-t border-slate-200/60 pt-2">
                              <span className="text-base font-black font-mono text-slate-900">
                                ₹{item.amount.toLocaleString('en-IN')}
                              </span>
                              <span className="text-[10px] font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                {pct}% of Total
                              </span>
                            </div>

                            {item.notes && (
                              <p className="text-[10px] text-slate-500 truncate italic">{item.notes}</p>
                            )}

                            <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 gap-1 mt-auto">
                              <button
                                type="button"
                                onClick={() => handleToggleScheduleStatus(item.id)}
                                className={`px-2 py-1 rounded-md text-[10px] font-extrabold flex items-center gap-1 transition cursor-pointer ${
                                  isReceived
                                    ? 'bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs'
                                }`}
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{isReceived ? 'Mark Pending' : 'Mark Paid'}</span>
                              </button>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingScheduleItem(item);
                                    setSchedStageName(item.stageName);
                                    setSchedDueDate(item.dueDate);
                                    setSchedAmount(item.amount);
                                    setSchedStatus(item.status);
                                    setSchedNotes(item.notes || '');
                                    setShowAddScheduleModal(true);
                                  }}
                                  className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-white rounded transition cursor-pointer"
                                  title="Edit Milestone"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteScheduleItem(item)}
                                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-white rounded transition cursor-pointer"
                                  title="Delete Milestone"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Function Dates & Schedule */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                          <span>Dates & Function Events Schedule</span>
                          <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                            {project.shoots?.length || 0} Event(s)
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Overview of primary project dates and individual function shoot events
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    <div>
                      <span className="text-slate-500 block font-bold text-[10px] uppercase">Wedding Function Date(s)</span>
                      <span className="text-slate-900 font-extrabold text-xs">{formatDateDDMMYYYY(project.weddingFunctionDates) || 'Not set'}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block font-bold text-[10px] uppercase">Final Delivery Deadline</span>
                      <span className="text-indigo-600 font-extrabold text-xs">{formatDateDDMMYYYY(project.finalDeliveryDeadline) || 'Not set'}</span>
                    </div>
                  </div>

                  {/* Added Events List */}
                  {project.shoots && project.shoots.length > 0 ? (
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">
                          Added Function Shoot Events ({project.shoots.length}):
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">Click <Pencil className="w-3 h-3 inline text-indigo-600" /> to edit details</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {project.shoots.map((evt, idx) => {
                          const isEditingThis = editingEventData?.shootId === evt.id;

                          if (isEditingThis) {
                            return (
                              <div key={evt.id || idx} className="p-3.5 rounded-xl bg-indigo-50/90 border-2 border-indigo-500 space-y-2.5 shadow-md col-span-1 sm:col-span-2 md:col-span-3">
                                <div className="flex items-center justify-between border-b border-indigo-200 pb-1.5">
                                  <span className="text-xs font-black text-indigo-900 uppercase tracking-wide flex items-center gap-1.5">
                                    <Pencil className="w-3.5 h-3.5 text-indigo-600" /> Edit Function Event ({evt.title || `Event #${idx + 1}`})
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setEditingEventData(null)}
                                    className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-xs">
                                  <div>
                                    <label className="text-[10px] font-extrabold text-slate-700 block mb-0.5">Event Title</label>
                                    <input
                                      type="text"
                                      value={editingEventData.title}
                                      onChange={(e) => setEditingEventData({ ...editingEventData, title: e.target.value })}
                                      placeholder="e.g. Ring Ceremony / Haldi"
                                      className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-900 focus:outline-indigo-600"
                                    />
                                  </div>

                                  <div>
                                    <label className="text-[10px] font-extrabold text-slate-700 block mb-0.5">Date</label>
                                    <input
                                      type="date"
                                      value={editingEventData.date}
                                      onChange={(e) => setEditingEventData({ ...editingEventData, date: e.target.value })}
                                      className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-900 focus:outline-indigo-600"
                                    />
                                  </div>

                                  <div>
                                    <label className="text-[10px] font-extrabold text-slate-700 block mb-0.5">Time / Schedule</label>
                                    <input
                                      type="text"
                                      value={editingEventData.time}
                                      onChange={(e) => setEditingEventData({ ...editingEventData, time: e.target.value })}
                                      placeholder="e.g. 06:00 PM / Full Day"
                                      className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-900 focus:outline-indigo-600"
                                    />
                                  </div>

                                  <div>
                                    <label className="text-[10px] font-extrabold text-slate-700 block mb-0.5">Venue / Location</label>
                                    <input
                                      type="text"
                                      value={editingEventData.venue}
                                      onChange={(e) => setEditingEventData({ ...editingEventData, venue: e.target.value })}
                                      placeholder="e.g. Delhi / Hotel Grand"
                                      className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-900 focus:outline-indigo-600"
                                    />
                                  </div>

                                  <div>
                                    <label className="text-[10px] font-extrabold text-slate-700 block mb-0.5">Status</label>
                                    <select
                                      value={editingEventData.status}
                                      onChange={(e) => setEditingEventData({ ...editingEventData, status: e.target.value as any })}
                                      className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-900 focus:outline-indigo-600"
                                    >
                                      <option value="scheduled">Scheduled</option>
                                      <option value="completed">Completed</option>
                                      <option value="cancelled">Cancelled</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-1 border-t border-indigo-100">
                                  <button
                                    type="button"
                                    onClick={() => setEditingEventData(null)}
                                    className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleSaveEditedEvent}
                                    className="px-3.5 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-2xs cursor-pointer"
                                  >
                                    Save Changes
                                  </button>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div key={evt.id || idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 relative hover:border-indigo-300 transition">
                              <div className="flex items-start justify-between gap-1 min-w-0">
                                <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5 min-w-0 flex-1 pr-1">
                                  <span className="text-indigo-600 text-sm shrink-0">🎉</span>
                                  <span className="truncate">{evt.title || `Function ${idx + 1}`}</span>
                                </span>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => setEditingEventData({
                                      shootId: evt.id,
                                      title: evt.title || '',
                                      date: evt.date || '',
                                      time: evt.time || evt.startTime || '',
                                      venue: evt.venue || evt.location || '',
                                      status: evt.status || 'scheduled'
                                    })}
                                    className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-100 rounded-lg transition cursor-pointer"
                                    title="Edit Function Event Details"
                                  >
                                    <Pencil className="w-3.5 h-3.5 text-indigo-600" />
                                  </button>
                                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 whitespace-nowrap ${
                                    evt.status === 'completed'
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      : evt.status === 'cancelled'
                                      ? 'bg-red-100 text-red-800 border border-red-200'
                                      : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                  }`}>
                                    {evt.status || 'Scheduled'}
                                  </span>
                                </div>
                              </div>

                              <div className="text-[11px] font-bold text-indigo-700 flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-slate-200/80">
                                <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                <span>{formatDateDDMMYYYY(evt.date) || 'No Date'} {evt.time ? `• ${evt.time}` : evt.startTime ? `• ${evt.startTime}` : ''}</span>
                              </div>

                              {(evt.venue || evt.location) && (
                                <div className="text-[10px] font-medium text-slate-600 flex items-center gap-1 truncate pt-0.5">
                                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span className="truncate">{evt.venue || evt.location}</span>
                                </div>
                              )}

                              {evt.crewAssignments && evt.crewAssignments.length > 0 ? (
                                <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200/60 flex flex-wrap items-center gap-1">
                                  <Users className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span className="font-bold text-slate-700">{evt.crewAssignments.length} Crew:</span>
                                  <span className="text-slate-600 truncate max-w-[180px]">
                                    {evt.crewAssignments.map((c) => c.name || c.role).filter(Boolean).join(', ')}
                                  </span>
                                </div>
                              ) : (
                                <div className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-200/60">
                                  No crew assigned yet
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-slate-100 text-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-xs font-bold text-slate-500">No function shoot events added to this project yet.</p>
                      <p className="text-[11px] text-slate-400">Events added during project creation or in the Shoots tab will appear here.</p>
                    </div>
                  )}
                </div>

              {/* Internal Client Folder & Documents Vault */}
              {!isVideoEditor && (
                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <Folder className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Client Documents Folder (PDFs & Payment Slips)
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Upload and view Quotation PDFs, Payment Slips, Contracts & Receipts
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                        {vaultDocs.length} File(s)
                      </span>
                    </div>
                  </div>

                  {/* Quick Add Form */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs items-center">
                    <div>
                      <select
                        value={vaultCategory}
                        onChange={(e) => setVaultCategory(e.target.value as any)}
                        className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-800 text-xs font-medium"
                      >
                        <option value="Quotation PDF">Quotation PDF</option>
                        <option value="Payment Slip">Payment Slip</option>
                        <option value="Contract / Agreement">Contract / Agreement</option>
                        <option value="Client ID Proof">Client ID Proof</option>
                        <option value="Other PDF / Doc">Other PDF / Doc</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow-xs w-full">
                        <Upload className="w-3.5 h-3.5" />
                        <span>+ Upload PDF / Payment Slip File</span>
                        <input
                          type="file"
                          accept="application/pdf,image/*"
                          onChange={handleVaultFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Document Cards List */}
                  {vaultDocs.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-1">No documents in client folder yet. Upload PDF or payment slip above.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {vaultDocs.map((doc) => (
                        <div key={doc.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2 shadow-2xs hover:border-indigo-200 transition">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <div className={`p-2 rounded-lg shrink-0 ${doc.fileType === 'pdf' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                              <span className="font-bold text-slate-900 text-xs truncate block">{doc.name}</span>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                                <span className="bg-white text-indigo-700 font-bold px-1.5 py-0.2 rounded border border-slate-200">{doc.category}</span>
                                <span>• {doc.uploadDate}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-white hover:bg-indigo-50 border border-slate-200 rounded-lg text-indigo-600 transition"
                              title="View / Open File"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={() => handleDeleteVaultDoc(doc.id)}
                              className="p-1.5 bg-white hover:bg-red-50 border border-slate-200 rounded-lg text-red-500 transition"
                              title="Delete Document"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Special Client Notes & Music Preferences */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-xs">
                <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5" />
                  Special Client Notes & Music Preferences
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded border border-slate-200 italic">
                  {project.specialNotesMusicPreferences || 'No specific music notes added yet.'}
                </p>
              </div>

              {/* Tasks Summary */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5" />
                    Tasks & Deliverables Summary
                  </h4>
                  <button
                    onClick={() => setActiveTab('tasks')}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wider"
                  >
                    Manage Tasks →
                  </button>
                </div>
                {taskList.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">No tasks assigned yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                    {taskList.map((task, i) => (
                      <div key={i} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 text-xs truncate">{task.taskName || `Task #${i+1}`}</span>
                          <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded font-bold text-[10px]">
                            {task.quantity} {task.unit || 'Pcs'}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[10px]">
                          <span className="text-slate-500 font-medium flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-indigo-500" />
                            {task.assignedTo || 'Unassigned'}
                          </span>
                          <span className="font-bold text-slate-600 capitalize bg-white px-1.5 py-0.5 rounded border border-slate-200">
                            {(task.status || '').replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* CLIENT VAULT / DOCUMENTS FOLDER TAB */}
          {activeTab === 'vault' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-indigo-50/60 p-4 rounded-xl border border-indigo-100">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <Folder className="w-5 h-5 text-indigo-600" />
                    Client Documents Folder & Vault
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Store Quotation PDFs, Payment Slips/Receipts, Contracts, and Client ID Proofs for <span className="font-bold text-slate-900">{project.clientWeddingTitle}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-white border border-indigo-200 rounded-lg text-indigo-700 font-extrabold text-xs shadow-2xs">
                    📁 {vaultDocs.length} File(s)
                  </span>
                </div>
              </div>

              {/* Upload New Client Document Card */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <FolderPlus className="w-4 h-4 text-indigo-600" />
                  Upload New Document / Payment Slip PDF
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 mb-1 font-extrabold text-[10px] uppercase">Document Title / Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Final Quotation Rev 2"
                      value={vaultDocName}
                      onChange={(e) => setVaultDocName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-extrabold text-[10px] uppercase">Category</label>
                    <select
                      value={vaultCategory}
                      onChange={(e) => setVaultCategory(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-medium"
                    >
                      <option value="Quotation PDF">Quotation PDF</option>
                      <option value="Payment Slip">Payment Slip</option>
                      <option value="Contract / Agreement">Contract / Agreement</option>
                      <option value="Client ID Proof">Client ID Proof</option>
                      <option value="Other PDF / Doc">Other PDF / Doc</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-extrabold text-[10px] uppercase">Select PDF / Image File</label>
                    <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-3 py-2 rounded-lg text-xs transition flex items-center justify-center gap-2 shadow-xs w-full">
                      <Upload className="w-4 h-4" />
                      <span>Choose File to Upload</span>
                      <input
                        type="file"
                        accept="application/pdf,image/*"
                        onChange={handleVaultFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* All Documents Grid */}
              <div className="space-y-2">
                <h5 className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">
                  Vault Files & Payment Receipts ({vaultDocs.length})
                </h5>

                {vaultDocs.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-2">
                    <Folder className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-xs text-slate-500 font-medium">No files uploaded in this client's folder yet.</p>
                    <p className="text-[11px] text-slate-400">Use the form above to upload quotation PDFs, payment slip screenshots, or client agreements.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {vaultDocs.map((doc) => (
                      <div key={doc.id} className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs hover:shadow-md hover:border-indigo-200 transition space-y-2 flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className={`p-2.5 rounded-xl shrink-0 ${doc.fileType === 'pdf' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="truncate">
                              <h6 className="font-extrabold text-slate-900 text-xs truncate">{doc.name}</h6>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded text-[10px] border border-indigo-100">
                                  {doc.category}
                                </span>
                                <span className="text-[10px] text-slate-400">{doc.uploadDate}</span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteVaultDoc(doc.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete file"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-[10px] text-slate-400 font-mono">{doc.fileSize || 'Attached File'}</span>
                          <div className="flex items-center gap-2">
                            {doc.fileUrl.startsWith('data:image') ? (
                              <button
                                onClick={() => setSelectedImage(doc.fileUrl)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded-md transition flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5 text-indigo-600" /> View
                              </button>
                            ) : null}
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] rounded-md transition flex items-center gap-1 shadow-2xs"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> Open / Download
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TASKS & ASSIGNMENTS TAB */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-indigo-600" />
                    Tasks & Deliverables
                  </h4>
                  <p className="text-xs text-slate-500">Track task breakdown, quantity created, assigned editors/team member, and status</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddTask}
                    className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Task</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveTasks}
                    className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Tasks</span>
                  </button>
                </div>
              </div>

              {taskList.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <p className="text-xs text-slate-500 mb-2">No tasks added to this project yet.</p>
                  <button
                    onClick={handleAddTask}
                    className="px-3 py-1.5 bg-indigo-600 text-white font-bold text-xs rounded hover:bg-indigo-700 transition"
                  >
                    + Add First Task
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {taskList.map((task, index) => (
                    <div key={task.id || index} className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2 shadow-xs">
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                        <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                          Task #{index + 1}: {task.taskName || 'Untitled Task'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTask(index)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition flex items-center gap-1 text-[10px] font-bold"
                          title="Remove Task"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          <span>- Remove</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 pt-1">
                        {/* Task Title */}
                        <div className="md:col-span-2">
                          <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Task / Deliverable Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Teaser / Reels / Album Design"
                            value={task.taskName}
                            onChange={(e) => handleTaskChange(index, 'taskName', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 font-medium"
                          />
                        </div>

                        {/* Quantity */}
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Quantity</label>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="1"
                              value={task.quantity}
                              onChange={(e) => handleTaskChange(index, 'quantity', Number(e.target.value))}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-800 font-bold"
                            />
                            <input
                              type="text"
                              placeholder="Unit"
                              value={task.unit || ''}
                              onChange={(e) => handleTaskChange(index, 'unit', e.target.value)}
                              className="w-16 bg-slate-50 border border-slate-200 rounded px-1.5 py-1.5 text-[10px] text-slate-600"
                            />
                          </div>
                        </div>

                        {/* Assigned Person */}
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5 flex items-center gap-0.5">
                            <UserCheck className="w-2.5 h-2.5 text-indigo-600" />
                            Assigned To
                          </label>
                          {(() => {
                            const isKnownMember = activeTeamMembers.some((m) => m.name === task.assignedTo) || task.assignedTo === 'Unassigned' || !task.assignedTo;
                            return (
                              <>
                                <select
                                  value={isKnownMember ? (task.assignedTo || 'Unassigned') : 'other'}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === 'other') {
                                      handleTaskChange(index, 'assignedTo', isKnownMember ? '' : task.assignedTo);
                                    } else {
                                      handleTaskChange(index, 'assignedTo', val);
                                    }
                                  }}
                                  className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 font-bold mb-1"
                                >
                                  {activeTeamMembers.map((m) => (
                                    <option key={m.id || m.name} value={m.name}>
                                      {m.name} ({m.role})
                                    </option>
                                  ))}
                                  <option value="Unassigned">Unassigned</option>
                                  <option value="other">Other (Custom Name)</option>
                                </select>

                                {!isKnownMember && (
                                  <input
                                    type="text"
                                    placeholder="Type custom name..."
                                    value={task.assignedTo}
                                    onChange={(e) => handleTaskChange(index, 'assignedTo', e.target.value)}
                                    className="w-full bg-amber-50 border border-amber-300 rounded px-2 py-1 text-xs text-slate-800 font-medium placeholder-slate-400"
                                  />
                                )}
                              </>
                            );
                          })()}
                        </div>

                        {/* Status */}
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Status</label>
                          <select
                            value={task.status}
                            onChange={(e) => handleTaskChange(index, 'status', e.target.value as EditingStatus)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 font-bold"
                          >
                            <option value="not_started">Not Started</option>
                            <option value="in_progress">In Progress</option>
                            <option value="client_review">Client Review</option>
                            <option value="revision">Revision</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SHOOTS TAB */}
          {activeTab === 'shoots' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <Camera className="w-4 h-4 text-indigo-600" />
                    Shoots & Event Crew Management
                  </h4>
                  <p className="text-xs text-slate-500">Scheduled functions & team allocations (e.g. Ring Ceremony: 3 Photographers, 3 Videographers, 3 Assistants)</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddShoot(!showAddShoot)}
                  className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>+ Add Shoot Event</span>
                </button>
              </div>

              {/* Add New Shoot Form with Crew Management */}
              {showAddShoot && (
                <form onSubmit={handleAddShoot} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-indigo-700 uppercase tracking-wider text-xs flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-indigo-600" />
                      Add New Function Shoot Details
                    </span>
                    <button type="button" onClick={() => setShowAddShoot(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Shoot Title / Function</label>
                      <input
                        type="text"
                        placeholder="e.g. Ring Ceremony & Sangeet"
                        value={shootTitle}
                        onChange={(e) => setShootTitle(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded p-1.5 text-slate-800 font-semibold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Function Date</label>
                      <input
                        type="date"
                        value={shootDate}
                        onChange={(e) => setShootDate(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded p-1.5 text-slate-800"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Start Time</label>
                      <input
                        type="time"
                        value={shootStartTime}
                        onChange={(e) => setShootStartTime(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded p-1.5 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">End Time</label>
                      <input
                        type="time"
                        value={shootEndTime}
                        onChange={(e) => setShootEndTime(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded p-1.5 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Venue / Location</label>
                      <input
                        type="text"
                        placeholder="e.g. Grand Ballroom, Udaivilas"
                        value={shootVenue}
                        onChange={(e) => setShootVenue(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded p-1.5 text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Team Crew Assignment in New Shoot with Role Columns */}
                  <div className="pt-2 border-t border-slate-200">
                    <RoleColumnCrewManager
                      crewAssignments={newShootCrew}
                      activeTeamMembers={activeTeamMembers}
                      onAddRoleQuantity={(role, qty) => handleAddRoleQuantityToNewShoot(role, qty)}
                      onRemoveRoleColumn={(role) => handleRemoveRoleFromNewShoot(role)}
                      onUpdateMember={(crewId, field, value) => {
                        setNewShootCrew((prev) =>
                          prev.map((c) => (c.id === crewId ? { ...c, [field]: value } : c))
                        );
                      }}
                      onRemoveMember={(crewId) => {
                        setNewShootCrew((prev) => prev.filter((c) => c.id !== crewId));
                      }}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                    <button type="button" onClick={() => setShowAddShoot(false)} className="px-3.5 py-1.5 rounded bg-slate-200 text-slate-700 font-bold text-xs">Cancel</button>
                    <button type="submit" className="px-4 py-1.5 rounded bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider shadow-xs hover:bg-indigo-700 transition">Save Shoot Event</button>
                  </div>
                </form>
              )}

              {/* Scheduled Shoot Events List */}
              <div className="space-y-3">
                {project.shoots.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center bg-slate-50 rounded-lg border border-slate-200 border-dashed">
                    No shoot events scheduled yet. Click "+ Add Shoot Event" above to create functions and assign team members.
                  </p>
                ) : (
                  (() => {
                    const stats = getShootTrackingStats(project.shoots);
                    return (
                      <>
                        {/* Shoot Tracking Summary Banner */}
                        <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3 space-y-2 text-xs">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-black text-slate-900 uppercase text-[11px] tracking-wide">
                                Date-Based Shoot Status:
                              </span>
                              <span className="bg-white text-slate-800 font-black px-2 py-0.5 rounded border border-slate-200 text-[10px]">
                                {stats.total} Total
                              </span>
                              {stats.todayCount > 0 && (
                                <span className="bg-indigo-600 text-white font-black px-2 py-0.5 rounded border border-indigo-700 text-[10px] animate-pulse">
                                  {stats.todayCount} Today
                                </span>
                              )}
                              <span className="bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                                {stats.completed} Done
                              </span>
                              {stats.pending > 0 && (
                                <span className="bg-amber-100 text-amber-800 font-black px-2 py-0.5 rounded border border-amber-200 text-[10px]">
                                  {stats.pending} Pending
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-extrabold text-indigo-700 bg-white px-2.5 py-0.5 rounded-full border border-indigo-200">
                              {stats.completionPercent}% Completed
                            </span>
                          </div>

                          {/* All Shoot Names and Dates List with Date Status Badges */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 pt-1.5 border-t border-indigo-100/80">
                            <span className="text-[10px] font-black uppercase text-slate-400 shrink-0 self-start sm:self-center">All Events:</span>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {project.shoots.map((s) => {
                                const dateInfo = getShootDateInfo(s.date, s.status);
                                return (
                                  <span
                                    key={s.id}
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-extrabold border leading-none shadow-2xs ${dateInfo.badgeClass}`}
                                    title={`${s.title} • Date: ${s.date}`}
                                  >
                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dateInfo.badgeDotColor}`} />
                                    <span className="whitespace-nowrap">{s.title}</span>
                                    <span className="opacity-80 font-mono text-[9px] shrink-0">({formatDateDDMMYYYY(s.date)})</span>
                                    <span className="text-[8px] font-black uppercase px-1 py-0.5 rounded bg-white/70 tracking-wider shrink-0">
                                      {dateInfo.dateBadgeText}
                                    </span>
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {project.shoots.map((s, sIdx) => {
                          const crewList = s.crewAssignments || [];
                          const dateInfo = getShootDateInfo(s.date, s.status);
                          
                          // Summarize crew by role
                          const roleCounts: Record<string, number> = {};
                          crewList.forEach((c) => {
                            const r = c.role || 'Photographer';
                            roleCounts[r] = (roleCounts[r] || 0) + 1;
                          });

                          return (
                            <div key={s.id} className={`p-3.5 rounded-xl bg-white border text-xs space-y-3 shadow-xs hover:border-slate-300 transition ${
                              dateInfo.isDone ? 'border-emerald-200' : dateInfo.isToday ? 'border-indigo-300 ring-1 ring-indigo-200' : 'border-slate-200'
                            }`}>
                              
                              {/* Event Header */}
                              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
                                      EVENT #{sIdx + 1}
                                    </span>
                                    {/* Date Status Badge */}
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${dateInfo.badgeClass}`}>
                                      {dateInfo.statusLabel}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-slate-900 text-sm sm:text-base">{s.title || 'Wedding Function'}</span>
                                  </div>
                                  <div className="flex items-center gap-3 text-slate-500 text-xs mt-0.5">
                                    <span className="flex items-center gap-1 font-bold text-slate-800">
                                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                      {formatDateDDMMYYYY(s.date)} ({s.time || 'Full Day'})
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1 text-slate-600">
                                      <MapPin className="w-3.5 h-3.5 text-amber-500" />
                                      {s.venue || 'Venue TBD'}
                                    </span>
                                  </div>
                                </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setEditingEventData({
                                  shootId: s.id,
                                  title: s.title || '',
                                  date: s.date || '',
                                  time: s.time || s.startTime || '',
                                  venue: s.venue || s.location || '',
                                  status: s.status || 'scheduled'
                                })}
                                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                                title="Edit Event Details"
                              >
                                <Pencil className="w-4 h-4 text-indigo-600" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteShootEvent(s.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                title="Delete Shoot Event"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </div>

                          {/* INLINE EDIT EVENT FORM */}
                          {editingEventData?.shootId === s.id && (
                            <div className="p-3 bg-indigo-50/80 rounded-lg border border-indigo-200 space-y-2.5 my-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-indigo-900 uppercase tracking-wide">Edit Event Details</span>
                                <button
                                  type="button"
                                  onClick={() => setEditingEventData(null)}
                                  className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                                <div>
                                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Event Title</label>
                                  <input
                                    type="text"
                                    value={editingEventData.title}
                                    onChange={(e) => setEditingEventData({ ...editingEventData, title: e.target.value })}
                                    placeholder="e.g. Pre wedding / Haldi"
                                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Date</label>
                                  <input
                                    type="date"
                                    value={editingEventData.date}
                                    onChange={(e) => setEditingEventData({ ...editingEventData, date: e.target.value })}
                                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Time</label>
                                  <input
                                    type="text"
                                    value={editingEventData.time}
                                    onChange={(e) => setEditingEventData({ ...editingEventData, time: e.target.value })}
                                    placeholder="e.g. 06:00 PM / Full Day"
                                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Venue / Location</label>
                                  <input
                                    type="text"
                                    value={editingEventData.venue}
                                    onChange={(e) => setEditingEventData({ ...editingEventData, venue: e.target.value })}
                                    placeholder="e.g. Venue TBD"
                                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => setEditingEventData(null)}
                                  className="px-2.5 py-1 bg-white border border-slate-300 rounded text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={handleSaveEditedEvent}
                                  className="px-3 py-1 bg-indigo-600 text-white rounded text-xs font-bold hover:bg-indigo-700 shadow-2xs cursor-pointer"
                                >
                                  Save Changes
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Team Allocation Summary Badges */}
                          <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-indigo-600" />
                              Team Breakdown:
                            </span>
                            {Object.keys(roleCounts).length === 0 ? (
                              <span className="text-[10px] text-slate-400 italic">No crew assigned</span>
                            ) : (
                              Object.entries(roleCounts).map(([role, count]) => (
                                <span key={role} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-800 rounded font-bold text-[10px]">
                                  {role}: <span className="text-indigo-600 font-extrabold">{count}</span>
                                </span>
                              ))
                            )}
                          </div>

                          {/* Role Column Crew Manager Component */}
                          <RoleColumnCrewManager
                            crewAssignments={s.crewAssignments || []}
                            activeTeamMembers={activeTeamMembers}
                            onAddRoleQuantity={(role, qty) => handleAddRoleQuantityToShoot(s.id, role, qty)}
                            onRemoveRoleColumn={(role) => handleRemoveRoleFromShoot(s.id, role)}
                            onUpdateMember={(crewId, field, value) => handleUpdateCrewInExistingShoot(s.id, crewId, field, value)}
                            onRemoveMember={(crewId) => handleRemoveCrewFromExistingShoot(s.id, crewId)}
                          />

                        </div>
                      );
                    })}
                  </>
                );
              })()
            )}
              </div>
            </div>
          )}

          {/* RAW DATA TAB */}
          {activeTab === 'data' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight">RAW Data Backup Management</h4>
                  <p className="text-xs text-slate-500">Memory cards offload status, Hard Drive 1, Hard Drive 2, Cloud NAS backup & Shoot Team Data Offloading</p>
                </div>
                <button
                  onClick={handleSavePipeline}
                  className={`px-3.5 py-1.5 rounded-lg font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm cursor-pointer transition-all duration-300 ${
                    saveSuccess
                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-300 scale-105'
                      : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white'
                  }`}
                >
                  {saveSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-200 animate-bounce" />
                      <span>Data Log Saved ✓</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Data Log</span>
                    </>
                  )}
                </button>
              </div>

              {/* Main Storage Vault Controls - Data Copy In HD, Data Backup In HD, Total Size & Tracking */}
              {(() => {
                const allShoots = project.shoots || [];
                const totalEventsCount = allShoots.length;
                const allCrew = allShoots.flatMap((s) => (s.crewAssignments || []).filter((c) => !c?.role?.toLowerCase().includes('assistant')));
                const totalSlots = allCrew.length;
                
                const grandTotalAllDataGB = allCrew.reduce((acc, c) => acc + (c?.dataSizeGB || 0), 0);

                const currentBackup = dataBackup || {
                  hardDrive1: '',
                  hardDrive1Done: false,
                  hardDrive2: '',
                  hardDrive2Done: false,
                  totalDataSizeGB: 0,
                };

                const crewCopyHDs = Array.from(
                  new Set(
                    allCrew
                      .map((c) => (c.copyInHD || c.hardDriveName || '').trim())
                      .filter(Boolean)
                  )
                ).join(', ');

                const crewBackupHDs = Array.from(
                  new Set(
                    allCrew
                      .map((c) => (c.backupInHD || '').trim())
                      .filter(Boolean)
                  )
                ).join(', ');

                const effectiveHD1 = (currentBackup.hardDrive1 && currentBackup.hardDrive1 !== 'Pending Shoot' && currentBackup.hardDrive1 !== 'HD-1')
                  ? currentBackup.hardDrive1
                  : (crewCopyHDs || currentBackup.hardDrive1 || '');

                const effectiveHD2 = (currentBackup.hardDrive2 && currentBackup.hardDrive2 !== 'Pending Shoot' && currentBackup.hardDrive2 !== 'HD-2')
                  ? currentBackup.hardDrive2
                  : (crewBackupHDs || currentBackup.hardDrive2 || '');

                const totalProjectDataGB = currentBackup.totalDataSizeGB || grandTotalAllDataGB;
                const formatGB = (gb: number) => gb >= 1000 ? `${parseFloat((gb / 1000).toFixed(2))} TB` : `${gb} GB`;

                // Event-wise completion counters across all events
                const completedReceivedEventsCount = allShoots.filter((s) => {
                  const crew = (s.crewAssignments || []).filter((c) => !c?.role?.toLowerCase().includes('assistant'));
                  return crew.length > 0 && crew.every((c) => !!c.dataReceived);
                }).length;

                const completedCopiedEventsCount = allShoots.filter((s) => {
                  const crew = (s.crewAssignments || []).filter((c) => !c?.role?.toLowerCase().includes('assistant'));
                  return crew.length > 0 && crew.every((c) => !!(c.copyInHD || c.hardDriveName)?.trim());
                }).length;

                const completedBackedUpEventsCount = allShoots.filter((s) => {
                  const crew = (s.crewAssignments || []).filter((c) => !c?.role?.toLowerCase().includes('assistant'));
                  return crew.length > 0 && crew.every((c) => !!c.backupInHD?.trim());
                }).length;

                // 1. DATA RECEIVED TRACKING (ALL EVENTS)
                const receivedCrew = allCrew.filter((c) => !!c?.dataReceived);
                const receivedCount = receivedCrew.length;
                const receivedGB = receivedCrew.reduce((acc, c) => acc + (c?.dataSizeGB || 0), 0);
                const pendingReceivedGB = Math.max(0, totalProjectDataGB - receivedGB);
                const receivedPercent = totalProjectDataGB > 0 ? Math.min(100, Math.round((receivedGB / totalProjectDataGB) * 100)) : (totalSlots > 0 ? Math.round((receivedCount / totalSlots) * 100) : 0);

                // 2. DATA COPY IN HD TRACKING (ALL EVENTS)
                const copiedCrew = allCrew.filter((c) => !!(c?.copyInHD || c?.hardDriveName)?.trim());
                const copiedCrewCount = copiedCrew.length;
                const explicitCopiedGB = copiedCrew.reduce((acc, c) => acc + (c?.dataSizeGB || 0), 0);

                const isCopyDone = totalSlots > 0 && copiedCrewCount === totalSlots;
                const isCopyAutoCompleted = isCopyDone;
                
                let copiedGB = 0;
                if (totalSlots > 0 && totalProjectDataGB > 0) {
                  if (explicitCopiedGB > 0 && grandTotalAllDataGB > 0 && explicitCopiedGB < grandTotalAllDataGB) {
                    copiedGB = Math.min(totalProjectDataGB, explicitCopiedGB);
                  } else {
                    copiedGB = Math.round((copiedCrewCount / totalSlots) * totalProjectDataGB);
                  }
                }
                const pendingCopyGB = Math.max(0, totalProjectDataGB - copiedGB);
                const copyPercent = totalSlots > 0 ? Math.min(100, Math.round((copiedCrewCount / totalSlots) * 100)) : 0;

                const displayCopiedCrewCount = copiedCrewCount;
                const displayCopiedEventsCount = completedCopiedEventsCount;

                // 3. DATA BACKUP IN HD TRACKING (ALL EVENTS)
                const backedUpCrew = allCrew.filter((c) => !!c?.backupInHD?.trim());
                const backedUpCrewCount = backedUpCrew.length;
                const explicitBackedUpGB = backedUpCrew.reduce((acc, c) => acc + (c?.dataSizeGB || 0), 0);

                const isBackupDone = totalSlots > 0 && backedUpCrewCount === totalSlots;
                const isBackupAutoCompleted = isBackupDone;

                let backedUpGB = 0;
                if (totalSlots > 0 && totalProjectDataGB > 0) {
                  if (explicitBackedUpGB > 0 && grandTotalAllDataGB > 0 && explicitBackedUpGB < grandTotalAllDataGB) {
                    backedUpGB = Math.min(totalProjectDataGB, explicitBackedUpGB);
                  } else {
                    backedUpGB = Math.round((backedUpCrewCount / totalSlots) * totalProjectDataGB);
                  }
                }
                const pendingBackupGB = Math.max(0, totalProjectDataGB - backedUpGB);
                const backupPercent = totalSlots > 0 ? Math.min(100, Math.round((backedUpCrewCount / totalSlots) * 100)) : 0;

                const displayBackedUpCrewCount = backedUpCrewCount;
                const displayBackedUpEventsCount = completedBackedUpEventsCount;

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    {/* Data Copy In HD */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <label className="font-extrabold text-slate-900 text-[11px] uppercase tracking-tight block">
                          💾 Data Copy In HD
                        </label>
                        {isCopyAutoCompleted && (
                          <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full border border-emerald-200 animate-pulse">
                            ⚡ Auto 100%
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={effectiveHD1}
                        onChange={(e) => handleUpdateDataBackup({ hardDrive1: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Primary Drive e.g. HDD-01 WD Black 5TB"
                      />

                      {/* Progress Bar & Copy Stats */}
                      <div className="space-y-1 pt-1.5 border-t border-slate-200/80">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-emerald-700 font-mono">Copied: {formatGB(copiedGB)}</span>
                          <span className="text-emerald-800 font-mono font-black">{copyPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
                          <div 
                            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                            style={{ width: `${copyPercent}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] pt-0.5">
                          <span className="text-slate-500 font-medium">
                            Pending: <strong className={pendingCopyGB > 0 ? "text-amber-700 font-mono font-bold" : "text-emerald-700 font-mono font-bold"}>{formatGB(pendingCopyGB)}</strong>
                          </span>
                          <span className="text-slate-500 font-semibold">{displayCopiedCrewCount}/{totalSlots} Shooters ({displayCopiedEventsCount}/{totalEventsCount} Events)</span>
                        </div>
                      </div>
                    </div>

                    {/* Data Backup In HD */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <label className="font-extrabold text-slate-900 text-[11px] uppercase tracking-tight block">
                          🛡️ Data Backup In HD
                        </label>
                        {isBackupAutoCompleted && (
                          <span className="text-[10px] font-extrabold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded-full border border-blue-200 animate-pulse">
                            ⚡ Auto 100%
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={effectiveHD2}
                        onChange={(e) => handleUpdateDataBackup({ hardDrive2: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Backup Drive e.g. HDD-02 SanDisk SSD 4TB"
                      />

                      {/* Progress Bar & Backup Stats */}
                      <div className="space-y-1 pt-1.5 border-t border-slate-200/80">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-blue-700 font-mono">Backup: {formatGB(backedUpGB)}</span>
                          <span className="text-blue-800 font-mono font-black">{backupPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
                          <div 
                            className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${backupPercent}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] pt-0.5">
                          <span className="text-slate-500 font-medium">
                            Pending: <strong className={pendingBackupGB > 0 ? "text-amber-700 font-mono font-bold" : "text-blue-700 font-mono font-bold"}>{formatGB(pendingBackupGB)}</strong>
                          </span>
                          <span className="text-slate-500 font-semibold">{displayBackedUpCrewCount}/{totalSlots} Shooters ({displayBackedUpEventsCount}/{totalEventsCount} Events)</span>
                        </div>
                      </div>
                    </div>

                    {/* Total Size of Data in Both HDs */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <label className="font-extrabold text-slate-900 text-[11px] uppercase tracking-tight">
                          📊 Total Size in Both HDs
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            if (grandTotalAllDataGB > 0) {
                              handleUpdateDataBackup({ totalDataSizeGB: grandTotalAllDataGB });
                            }
                          }}
                          className="text-[10px] font-black text-indigo-600 hover:underline cursor-pointer bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100"
                        >
                          ⚡ Auto-Sum
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          value={currentBackup.totalDataSizeGB || ''}
                          onChange={(e) => handleUpdateDataBackup({ totalDataSizeGB: Number(e.target.value) })}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 pr-10 text-slate-900 font-black text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                          placeholder={grandTotalAllDataGB > 0 ? `${grandTotalAllDataGB}` : "e.g. 1250"}
                        />
                        <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">GB</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-500 font-medium">All Events Total:</span>
                        <span className="font-extrabold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                          {formatGB(grandTotalAllDataGB)}
                        </span>
                      </div>
                    </div>

                    {/* All Events Multi-Stage Tracker */}
                    <div className="p-3 rounded-xl bg-indigo-950 text-white border border-indigo-900 space-y-2 shadow-2xs flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-indigo-200 text-[11px] uppercase tracking-tight block">
                          ⚡ All Events Tracker
                        </span>
                        <span className="text-[10px] font-black bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded">
                          {formatGB(totalProjectDataGB)} Total
                        </span>
                      </div>

                      <div className="space-y-1.5 text-[10px]">
                        {/* Data Received */}
                        <div className="flex items-center justify-between border-b border-indigo-900/80 pb-1">
                          <span className="text-indigo-200 font-semibold">1. Data Recd:</span>
                          <div className="text-right">
                            <span className="font-black text-emerald-400 font-mono">{receivedCount}/{totalSlots}</span>
                            <span className="text-indigo-300 text-[9px] ml-1">({completedReceivedEventsCount}/{totalEventsCount} Events)</span>
                            <span className="text-slate-400 ml-1">({formatGB(receivedGB)})</span>
                          </div>
                        </div>

                        {/* Copy In HD */}
                        <div className="flex items-center justify-between border-b border-indigo-900/80 pb-1">
                          <div className="flex items-center gap-1">
                            <span className="text-indigo-200 font-semibold">2. Copy In HD:</span>
                            {currentBackup.hardDrive1 && (
                              <span className="text-[9px] font-mono font-bold bg-teal-900/90 text-teal-200 px-1 py-0.2 rounded border border-teal-700/60 truncate max-w-[70px]" title={currentBackup.hardDrive1}>
                                {currentBackup.hardDrive1}
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="font-black text-teal-300 font-mono">{displayCopiedCrewCount}/{totalSlots}</span>
                            <span className="text-teal-200/80 text-[9px] ml-1">({displayCopiedEventsCount}/{totalEventsCount} Events)</span>
                            <span className="text-slate-400 ml-1">({formatGB(copiedGB)})</span>
                          </div>
                        </div>

                        {/* Backup In HD */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className="text-indigo-200 font-semibold">3. Backup HD:</span>
                            {currentBackup.hardDrive2 && (
                              <span className="text-[9px] font-mono font-bold bg-blue-900/90 text-blue-200 px-1 py-0.2 rounded border border-blue-700/60 truncate max-w-[70px]" title={currentBackup.hardDrive2}>
                                {currentBackup.hardDrive2}
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="font-black text-blue-300 font-mono">{displayBackedUpCrewCount}/{totalSlots}</span>
                            <span className="text-blue-200/80 text-[9px] ml-1">({displayBackedUpEventsCount}/{totalEventsCount} Events)</span>
                            <span className="text-slate-400 ml-1">({formatGB(backedUpGB)})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* EVENT-WISE SHOOT TEAM MEMBER DATA RECEIVED LEDGER */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div>
                    <h5 className="text-xs font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-indigo-600" />
                      <span>Shoot Events & Team Member Data Log</span>
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      Events and shoot team members assigned in the shoot tab automatically appear here. Log data received, GB size, and storage hard drive name for each shooter.
                    </p>
                  </div>
                </div>

                {(!project.shoots || project.shoots.length === 0) ? (
                  <div className="p-5 text-center text-slate-400 text-xs bg-slate-50 rounded-lg border border-dashed border-slate-200 italic">
                    No shoot events added yet. Add events and crew members in the "Shoots & Events" tab first.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {project.shoots.map((s, sIdx) => {
                      const nonAssistantCrew = (s.crewAssignments || []).filter((c) => !c.role?.toLowerCase().includes('assistant'));
                      const eventTotalGB = nonAssistantCrew.reduce((acc, c) => acc + (c.dataSizeGB || 0), 0);
                      const recdCount = nonAssistantCrew.filter((c) => c.dataReceived).length;
                      const copyCount = nonAssistantCrew.filter((c) => !!(c.copyInHD || c.hardDriveName)?.trim()).length;
                      const backupCount = nonAssistantCrew.filter((c) => !!c.backupInHD?.trim()).length;
                      const totalCrew = nonAssistantCrew.length;

                      return (
                        <div key={s.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                            <div>
                              <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 block mb-0.5">EVENT #{sIdx + 1}</span>
                              <span className="font-extrabold text-slate-900 text-xs sm:text-sm">{s.title || 'Wedding Function'}</span>
                              <span className="text-[11px] text-slate-500 ml-2 font-medium">({s.date} • {s.venue || 'Venue TBD'})</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] font-black text-indigo-900 bg-indigo-100/90 px-2 py-0.5 rounded border border-indigo-200">
                                ⚡ Total: {eventTotalGB >= 1000 ? `${parseFloat((eventTotalGB / 1000).toFixed(2))} TB` : `${eventTotalGB} GB`}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${recdCount === totalCrew && totalCrew > 0 ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                                Data Recd: {recdCount}/{totalCrew}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${copyCount === totalCrew && totalCrew > 0 ? 'bg-teal-100 text-teal-800 border-teal-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                                Copy HD: {copyCount}/{totalCrew}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${backupCount === totalCrew && totalCrew > 0 ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                                Backup HD: {backupCount}/{totalCrew}
                              </span>

                              {/* ACTION BUTTONS FOR EVENT: EDIT, + MEMBER, DELETE */}
                              <div className="flex items-center gap-1 ml-2 border-l border-slate-200 pl-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingEventData({
                                    shootId: s.id,
                                    title: s.title || '',
                                    date: s.date || '',
                                    time: s.time || '',
                                    venue: s.venue || '',
                                    status: s.status || 'scheduled',
                                  })}
                                  className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-indigo-600 rounded text-[10px] font-bold flex items-center gap-1 transition shadow-2xs"
                                  title="Edit Event Title, Date & Venue"
                                >
                                  <Pencil className="w-3 h-3 text-indigo-500" />
                                  <span className="hidden sm:inline">Edit Event</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setAddingCrewShootId(s.id);
                                    setNewCrewRoleInput('Photographer');
                                    setNewCrewNameInput('');
                                  }}
                                  className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded text-[10px] font-bold flex items-center gap-1 transition shadow-2xs"
                                  title="Add team member slot to this event"
                                >
                                  <Plus className="w-3 h-3 text-indigo-600" />
                                  <span className="hidden sm:inline">+ Member</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteShootEvent(s.id)}
                                  className="p-1 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-400 hover:text-red-600 rounded transition shadow-2xs"
                                  title="Delete Event"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* INLINE EDIT EVENT FORM */}
                          {editingEventData?.shootId === s.id && (
                            <div className="p-3 bg-indigo-50/80 rounded-lg border border-indigo-200 space-y-2.5">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-indigo-900 uppercase tracking-wide">Edit Event Details</span>
                                <button
                                  type="button"
                                  onClick={() => setEditingEventData(null)}
                                  className="text-slate-400 hover:text-slate-600 p-0.5"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <div>
                                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Event Title</label>
                                  <input
                                    type="text"
                                    value={editingEventData.title}
                                    onChange={(e) => setEditingEventData({ ...editingEventData, title: e.target.value })}
                                    placeholder="e.g. Wedding Function / Haldi"
                                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-bold text-slate-900"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Date</label>
                                  <input
                                    type="date"
                                    value={editingEventData.date}
                                    onChange={(e) => setEditingEventData({ ...editingEventData, date: e.target.value })}
                                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-bold text-slate-900"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Venue / Location</label>
                                  <input
                                    type="text"
                                    value={editingEventData.venue}
                                    onChange={(e) => setEditingEventData({ ...editingEventData, venue: e.target.value })}
                                    placeholder="e.g. Venue TBD"
                                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-bold text-slate-900"
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => setEditingEventData(null)}
                                  className="px-2.5 py-1 bg-white border border-slate-300 rounded text-xs font-bold text-slate-600 hover:bg-slate-100"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={handleSaveEditedEvent}
                                  className="px-3 py-1 bg-indigo-600 text-white rounded text-xs font-bold hover:bg-indigo-700 shadow-2xs"
                                >
                                  Save Changes
                                </button>
                              </div>
                            </div>
                          )}

                          {/* INLINE ADD MEMBER FORM */}
                          {addingCrewShootId === s.id && (
                            <div className="p-3 bg-emerald-50/80 rounded-lg border border-emerald-200 space-y-2.5">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-emerald-900 uppercase tracking-wide">+ Add Team Member / Slot to Event</span>
                                <button
                                  type="button"
                                  onClick={() => setAddingCrewShootId(null)}
                                  className="text-slate-400 hover:text-slate-600 p-0.5"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Role / Designation</label>
                                  <select
                                    value={newCrewRoleInput}
                                    onChange={(e) => setNewCrewRoleInput(e.target.value)}
                                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-bold text-slate-900"
                                  >
                                    <option value="Photographer">Photographer</option>
                                    <option value="Videographer">Videographer</option>
                                    <option value="Cinematographer">Cinematographer</option>
                                    <option value="Drone Operator">Drone Operator</option>
                                    <option value="Lead Photographer">Lead Photographer</option>
                                    <option value="Assistant">Assistant</option>
                                    <option value="Editor">Editor</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Team Member Name</label>
                                  <input
                                    type="text"
                                    list={`team-add-options-${s.id}`}
                                    value={newCrewNameInput}
                                    onChange={(e) => setNewCrewNameInput(e.target.value)}
                                    placeholder="Select or enter member name..."
                                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-bold text-slate-900"
                                  />
                                  <datalist id={`team-add-options-${s.id}`}>
                                    {activeTeamMembers.map((m) => (
                                      <option key={m.id} value={m.name} />
                                    ))}
                                  </datalist>
                                </div>
                              </div>
                              <div className="flex justify-end gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => setAddingCrewShootId(null)}
                                  className="px-2.5 py-1 bg-white border border-slate-300 rounded text-xs font-bold text-slate-600 hover:bg-slate-100"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAddCrewSlotToShoot(s.id)}
                                  className="px-3 py-1 bg-emerald-600 text-white rounded text-xs font-bold hover:bg-emerald-700 shadow-2xs"
                                >
                                  + Add Member
                                </button>
                              </div>
                            </div>
                          )}

                          {(nonAssistantCrew.length === 0) ? (
                            <div className="text-[11px] text-slate-400 italic bg-white p-3 rounded border border-slate-200 text-center">
                              No main team members allocated to {s.title || 'this event'} yet.
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs bg-white rounded-lg border border-slate-200 overflow-hidden">
                                <thead className="bg-slate-100 text-slate-600 font-bold text-[10px] uppercase border-b border-slate-200">
                                  <tr>
                                    <th className="p-2">Role & Team Member Name</th>
                                    <th className="p-2 text-center">Data Received</th>
                                    <th className="p-2 w-28">Data Size (GB)</th>
                                    <th className="p-2 min-w-[140px]">💾 Copy In HD</th>
                                    <th className="p-2 min-w-[140px]">🛡️ Backup In HD</th>
                                    <th className="p-2 text-center w-20">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {nonAssistantCrew.map((c, idx) => (
                                  <tr key={c.id || idx} className="hover:bg-slate-50 transition">
                                    <td className="p-2 font-bold text-slate-800">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono shrink-0">
                                          {c.role} #{idx + 1}
                                        </span>
                                        <input
                                          type="text"
                                          list={`team-member-options-${c.id || idx}`}
                                          value={c.name || ''}
                                          onChange={(e) => handleUpdateCrewInExistingShoot(s.id, c.id, 'name', e.target.value)}
                                          placeholder="Enter or select name"
                                          className="bg-transparent hover:bg-slate-100 focus:bg-white border border-transparent focus:border-slate-300 rounded px-1.5 py-0.5 text-xs font-bold text-slate-900 w-full outline-none"
                                        />
                                        <datalist id={`team-member-options-${c.id || idx}`}>
                                          {activeTeamMembers.map((m) => (
                                            <option key={m.id} value={m.name} />
                                          ))}
                                        </datalist>
                                      </div>
                                    </td>

                                    <td className="p-2 text-center">
                                      <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={!!c.dataReceived}
                                          onChange={(e) => handleUpdateCrewInExistingShoot(s.id, c.id, 'dataReceived', e.target.checked)}
                                          className="rounded text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                          c.dataReceived
                                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                                        }`}>
                                          {c.dataReceived ? 'Received ✓' : 'Pending ⏳'}
                                        </span>
                                      </label>
                                    </td>

                                    <td className="p-2">
                                      <div className="flex items-center gap-1">
                                        <input
                                          type="number"
                                          placeholder="e.g. 250"
                                          value={c.dataSizeGB || ''}
                                          onChange={(e) => handleUpdateCrewInExistingShoot(s.id, c.id, 'dataSizeGB', Number(e.target.value))}
                                          className="w-18 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-bold text-slate-900 focus:bg-white outline-none"
                                        />
                                        <span className="text-[10px] text-slate-500 font-bold">GB</span>
                                      </div>
                                    </td>

                                    {/* Copy In HD Column */}
                                    <td className="p-2">
                                      <input
                                        type="text"
                                        placeholder="Copy HD Name"
                                        value={c.copyInHD ?? c.hardDriveName ?? ''}
                                        onChange={(e) => handleUpdateCrewInExistingShoot(s.id, c.id, 'copyInHD', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-medium text-slate-900 focus:bg-white outline-none"
                                      />
                                    </td>

                                    {/* Backup In HD Column */}
                                    <td className="p-2">
                                      <input
                                        type="text"
                                        placeholder="Backup HD Name"
                                        value={c.backupInHD || ''}
                                        onChange={(e) => handleUpdateCrewInExistingShoot(s.id, c.id, 'backupInHD', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-medium text-slate-900 focus:bg-white outline-none"
                                      />
                                    </td>

                                    {/* Actions Column: Edit & Delete Icons */}
                                    <td className="p-2 text-center">
                                      <div className="flex items-center justify-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => setEditingCrewData({
                                            shootId: s.id,
                                            crewId: c.id,
                                            role: c.role || 'Photographer',
                                            name: c.name || '',
                                            mobile: c.mobile || '',
                                            dataSizeGB: c.dataSizeGB || 0,
                                            copyInHD: c.copyInHD || c.hardDriveName || '',
                                            backupInHD: c.backupInHD || ''
                                          })}
                                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition"
                                          title="Edit Member Details"
                                        >
                                          <Pencil className="w-3.5 h-3.5 text-indigo-600" />
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => handleDeleteCrewMemberSlot(s.id, c.id, c.role || 'Crew', c.name || 'Unassigned Slot')}
                                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                                          title="Delete Team Member Entry"
                                        >
                                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot className="bg-slate-100/90 border-t-2 border-slate-200 font-bold text-slate-800">
                                <tr>
                                  <td className="p-2.5 text-right text-slate-700 font-black text-[11px] uppercase tracking-tight" colSpan={2}>
                                    📊 Event Total Data Size:
                                  </td>
                                  <td className="p-2.5" colSpan={4}>
                                    <div className="flex items-center gap-2">
                                      <span className="bg-indigo-600 text-white font-black text-xs px-2.5 py-0.5 rounded-md shadow-2xs">
                                        {eventTotalGB >= 1000 ? `${parseFloat((eventTotalGB / 1000).toFixed(2))} TB` : `${eventTotalGB} GB`}
                                      </span>
                                      <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                                        (Total RAW storage logged for {s.title || 'this event'})
                                      </span>
                                    </div>
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  </div>
                )}

                {/* GRAND TOTAL SUMMARY BANNER FOR ALL EVENTS */}
                {(() => {
                  const grandTotalAllDataGB = (project.shoots || [])
                    .flatMap((s) => (s.crewAssignments || []).filter((c) => !c?.role?.toLowerCase().includes('assistant')))
                    .reduce((acc, c) => acc + (c?.dataSizeGB || 0), 0);
                  return (
                    <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md border border-indigo-800/80 mt-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600/30 rounded-lg border border-indigo-400/30">
                          <HardDrive className="w-5 h-5 text-indigo-300" />
                        </div>
                        <div>
                          <span className="text-xs font-black uppercase text-indigo-200 tracking-wider block">
                            📊 ALL EVENTS GRAND TOTAL DATA SIZE
                          </span>
                          <span className="text-[11px] text-slate-300 font-medium">
                            Total RAW data size accumulated across all shoot functions and team members
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-white/10 px-3.5 py-1.5 rounded-lg border border-white/10 shrink-0">
                        <span className="text-xl font-black text-amber-300 font-mono">
                          {grandTotalAllDataGB >= 1000 ? parseFloat((grandTotalAllDataGB / 1000).toFixed(2)) : grandTotalAllDataGB}{' '}
                          <span className="text-xs text-white">{grandTotalAllDataGB >= 1000 ? 'TB' : 'GB'}</span>
                        </span>
                        <span className="text-[10px] font-bold text-indigo-200 border-l border-white/20 pl-2">
                          ({grandTotalAllDataGB} GB Raw)
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* PAYMENTS TAB */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Payment Receipts & Installment Log</h4>
                  <p className="text-xs text-slate-500">Log new payment installments, upload receipt slips/screenshots, and track client balance</p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSchedulePDF}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs inline-flex items-center gap-1.5 shadow-xs transition cursor-pointer shrink-0"
                  title="Download Statement PDF with all receipts & pending balance"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF Statement</span>
                </button>
              </div>

              {/* Add Payment Form */}
              <form onSubmit={handleAddPayment} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs items-end">
                <div>
                  <label className="block text-slate-600 mb-1 font-extrabold text-[10px] uppercase tracking-wider">Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 50000"
                    value={newPayAmount || ''}
                    onChange={(e) => setNewPayAmount(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 font-bold focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-extrabold text-[10px] uppercase tracking-wider">Mode</label>
                  <select
                    value={newPayMode}
                    onChange={(e) => setNewPayMode(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 font-medium"
                  >
                    <option value="UPI / GPay">UPI / GPay</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-extrabold text-[10px] uppercase tracking-wider">Note / Remarks</label>
                  <input
                    type="text"
                    placeholder="e.g. 2nd Installment"
                    value={newPayNotes}
                    onChange={(e) => setNewPayNotes(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800"
                  />
                </div>

                {/* Slip & Screenshot Upload */}
                <div>
                  <label className="block text-slate-600 mb-1 font-extrabold text-[10px] uppercase tracking-wider flex items-center justify-between">
                    <span>Slip / ScreenShot</span>
                    {newPayScreenshot && <span className="text-[9px] text-emerald-600 font-bold">Uploaded ✓</span>}
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer flex-1 bg-white border border-dashed border-slate-300 hover:border-indigo-500 rounded-lg p-1.5 text-center text-slate-600 hover:text-indigo-600 transition flex items-center justify-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="text-[11px] font-bold truncate">
                        {newPayScreenshot ? 'Change File' : 'Upload Slip'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshotUpload}
                        className="hidden"
                      />
                    </label>
                    {newPayScreenshot && newPayScreenshot.trim() && (
                      <div className="relative group shrink-0">
                        <img
                          src={newPayScreenshot}
                          alt="Preview"
                          onClick={() => setSelectedImage(newPayScreenshot)}
                          className="w-9 h-9 rounded-lg object-cover border border-slate-300 cursor-pointer hover:opacity-80 transition"
                        />
                        <button
                          type="button"
                          onClick={() => setNewPayScreenshot('')}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow-xs"
                          title="Remove screenshot"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 rounded-lg bg-emerald-600 text-white font-extrabold hover:bg-emerald-700 uppercase tracking-wider text-xs transition shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Record Payment</span>
                </button>
              </form>

              {/* Payment History List */}
              <div className="space-y-2 pt-1">
                <h5 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Payment History</h5>
                {payments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">No payment installments recorded yet.</p>
                ) : (
                  payments.map((p) => (
                    <div key={p.id} className="p-3 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs hover:border-slate-300 transition">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-sm">₹{p.amount.toLocaleString('en-IN')}</span>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-bold text-[10px] border border-slate-200">
                            {p.paymentMode}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium">
                          {p.notes} • <span className="font-mono text-slate-500">Receipt #{p.receiptNumber}</span> • <span className="text-slate-400">{p.date}</span>
                        </p>
                      </div>

                      {/* Right side: Screenshot Preview & Upload Controls */}
                      <div className="flex items-center gap-2 shrink-0">
                        {p.receiptScreenshot && p.receiptScreenshot.trim() ? (
                          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedImage(p.receiptScreenshot!)}
                              className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
                            >
                              <img
                                src={p.receiptScreenshot}
                                alt="Receipt Slip"
                                className="w-8 h-8 rounded border border-slate-300 object-cover"
                              />
                              <span className="flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5" /> View Slip
                              </span>
                            </button>
                            <label className="cursor-pointer text-[10px] text-slate-500 hover:text-indigo-600 font-bold px-1.5 border-l border-slate-200" title="Change Slip">
                              Change
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleUpdatePaymentScreenshot(p.id, file);
                                }}
                                className="hidden"
                              />
                            </label>
                          </div>
                        ) : (
                          <label className="cursor-pointer px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-lg text-xs font-extrabold transition flex items-center gap-1.5">
                            <Upload className="w-3.5 h-3.5 text-amber-600" />
                            <span>Upload Slip / Screenshot</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUpdatePaymentScreenshot(p.id, file);
                              }}
                              className="hidden"
                            />
                          </label>
                        )}

                        {/* Delete Payment Button */}
                        <button
                          type="button"
                          onClick={() => handleDeletePayment(p.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Delete Payment Record"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* DELIVERIES TAB */}
          {activeTab === 'deliveries' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Deliveries & Client Handover Checklist</h4>
                <p className="text-xs text-slate-500">Mark deliverables handed over to client</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2 text-xs shadow-xs">
                <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                  <span className="font-medium text-slate-800">RAW Data Hard Drive Handover</span>
                  <input
                    type="checkbox"
                    checked={project.deliveryStatus.rawHandoverDone}
                    onChange={(e) => {
                      const updated = {
                        ...project,
                        deliveryStatus: { ...project.deliveryStatus, rawHandoverDone: e.target.checked }
                      };
                      onUpdateProject(updated);
                    }}
                  />
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                  <span className="font-medium text-slate-800">Teaser Video Link Sent</span>
                  <input
                    type="checkbox"
                    checked={project.deliveryStatus.teaserLinkSent}
                    onChange={(e) => {
                      const updated = {
                        ...project,
                        deliveryStatus: { ...project.deliveryStatus, teaserLinkSent: e.target.checked }
                      };
                      updated.status = computeAutoProjectStatus(updated).autoStatus;
                      onUpdateProject(updated);
                    }}
                  />
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                  <span className="font-medium text-slate-800">Full Wedding Film & Long Videos Handed Over</span>
                  <input
                    type="checkbox"
                    checked={project.deliveryStatus.fullFilmSent}
                    onChange={(e) => {
                      const updated = {
                        ...project,
                        deliveryStatus: { ...project.deliveryStatus, fullFilmSent: e.target.checked }
                      };
                      updated.status = computeAutoProjectStatus(updated).autoStatus;
                      onUpdateProject(updated);
                    }}
                  />
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                  <span className="font-medium text-slate-800">Instagram Reels & Shorts Folder</span>
                  <input
                    type="checkbox"
                    checked={project.deliveryStatus.reelsSent}
                    onChange={(e) => {
                      const updated = {
                        ...project,
                        deliveryStatus: { ...project.deliveryStatus, reelsSent: e.target.checked }
                      };
                      updated.status = computeAutoProjectStatus(updated).autoStatus;
                      onUpdateProject(updated);
                    }}
                  />
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                  <span className="font-medium text-slate-800">High-Res Photo Gallery Delivered</span>
                  <input
                    type="checkbox"
                    checked={project.deliveryStatus.highResPhotosSent}
                    onChange={(e) => {
                      const updated = {
                        ...project,
                        deliveryStatus: { ...project.deliveryStatus, highResPhotosSent: e.target.checked }
                      };
                      updated.status = computeAutoProjectStatus(updated).autoStatus;
                      onUpdateProject(updated);
                    }}
                  />
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                  <span className="font-medium text-slate-800">Printed Wedding Albums Handed Over</span>
                  <input
                    type="checkbox"
                    checked={project.deliveryStatus.albumPrintedAndDelivered}
                    onChange={(e) => {
                      const updated = {
                        ...project,
                        deliveryStatus: { ...project.deliveryStatus, albumPrintedAndDelivered: e.target.checked }
                      };
                      updated.status = computeAutoProjectStatus(updated).autoStatus;
                      onUpdateProject(updated);
                    }}
                  />
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Lightbox Modal for Payment Receipt / Screenshot */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative bg-white rounded-2xl p-4 max-w-2xl w-full shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-600" /> Payment Slip / Screenshot Proof
              </span>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center justify-center bg-slate-950/5 rounded-xl p-2 max-h-[70vh] overflow-auto border border-slate-200">
              <img
                src={selectedImage || undefined}
                alt="Payment Slip Screenshot"
                className="max-h-[65vh] w-auto object-contain rounded-lg shadow-md"
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500 font-medium">Click outside or press X to close</span>
              <a
                href={selectedImage}
                download="payment-receipt-screenshot.png"
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Download / View Full</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Edit Crew Data Modal */}
      {editingCrewData && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full border border-slate-200 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Pencil className="w-4 h-4 text-indigo-600" />
                <span>Edit Team Member & Storage Details</span>
              </h4>
              <button
                type="button"
                onClick={() => setEditingCrewData(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Role / Designation</label>
                <select
                  value={editingCrewData.role}
                  onChange={(e) => setEditingCrewData({ ...editingCrewData, role: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-900"
                >
                  <option value="Photographer">Photographer</option>
                  <option value="Videographer">Videographer</option>
                  <option value="Cinematographer">Cinematographer</option>
                  <option value="Drone Operator">Drone Operator</option>
                  <option value="Lead Photographer">Lead Photographer</option>
                  <option value="Assistant">Assistant</option>
                  <option value="Editor">Editor</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Team Member Name</label>
                <input
                  type="text"
                  list="edit-crew-modal-list"
                  value={editingCrewData.name}
                  onChange={(e) => setEditingCrewData({ ...editingCrewData, name: e.target.value })}
                  placeholder="e.g. Rajat Verma"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-900"
                />
                <datalist id="edit-crew-modal-list">
                  {activeTeamMembers.map((m) => (
                    <option key={m.id} value={m.name} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Contact Mobile Number</label>
                <input
                  type="text"
                  value={editingCrewData.mobile}
                  onChange={(e) => setEditingCrewData({ ...editingCrewData, mobile: e.target.value })}
                  placeholder="e.g. +91 9876543210"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Data Size (GB)</label>
                  <input
                    type="number"
                    value={editingCrewData.dataSizeGB || ''}
                    onChange={(e) => setEditingCrewData({ ...editingCrewData, dataSizeGB: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Copy In HD</label>
                  <input
                    type="text"
                    value={editingCrewData.copyInHD}
                    onChange={(e) => setEditingCrewData({ ...editingCrewData, copyInHD: e.target.value })}
                    placeholder="e.g. HDD-01"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Backup In HD</label>
                  <input
                    type="text"
                    value={editingCrewData.backupInHD}
                    onChange={(e) => setEditingCrewData({ ...editingCrewData, backupInHD: e.target.value })}
                    placeholder="e.g. HDD-02"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingCrewData(null)}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 font-bold rounded-lg text-xs hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEditedCrewData}
                className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-lg text-xs hover:bg-indigo-700 shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal to Add/Edit Payment Schedule Item */}
      {showAddScheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                <CalendarCheck className="w-4 h-4 text-indigo-600" />
                <span>{editingScheduleItem ? 'Edit Payment Milestone' : 'Add Payment Milestone'}</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddScheduleModal(false);
                  setEditingScheduleItem(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveScheduleItem} className="space-y-3.5 text-xs">
              {/* Total Package Amount Banner at Top */}
              <div className="bg-slate-900 text-white p-3 rounded-xl flex items-center justify-between shadow-xs">
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Package Amount</div>
                  <div className="text-base sm:text-lg font-black font-mono text-emerald-400">
                    ₹{(project.totalBudget || 0).toLocaleString('en-IN')}
                  </div>
                </div>
                {project.totalBudget > 0 && (
                  <div className="text-right">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">This Milestone</div>
                    <div className="text-xs sm:text-sm font-extrabold font-mono text-indigo-300">
                      {schedAmount > 0 ? `${((schedAmount / project.totalBudget) * 100).toFixed(1)}% of Total` : '0% of Total'}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Stage / Milestone Title</label>
                <input
                  type="text"
                  placeholder="e.g. Booking Token Advance or On Shoot Date"
                  value={schedStageName}
                  onChange={(e) => setSchedStageName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 font-bold focus:outline-indigo-600"
                  required
                />
              </div>

              {/* Column Layout: Left side Booking Amount (₹), Right side Percentage (%) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Booking Amount (₹)</label>
                  <input
                    type="number"
                    value={schedAmount || ''}
                    onChange={(e) => setSchedAmount(Number(e.target.value))}
                    placeholder="e.g. 84000"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 font-mono font-bold focus:outline-indigo-600"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Percentage (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 30"
                      value={
                        project.totalBudget > 0 && schedAmount > 0
                          ? Number(((schedAmount / project.totalBudget) * 100).toFixed(2))
                          : ''
                      }
                      onChange={(e) => {
                        const pct = parseFloat(e.target.value);
                        if (!isNaN(pct) && project.totalBudget > 0) {
                          setSchedAmount(Math.round((project.totalBudget * pct) / 100));
                        } else if (e.target.value === '') {
                          setSchedAmount(0);
                        }
                      }}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 pr-8 text-slate-900 font-mono font-bold focus:outline-indigo-600"
                    />
                    <span className="absolute right-3 top-2.5 font-bold text-slate-400 text-sm">%</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={schedDueDate.includes('-') && schedDueDate.length === 10 ? schedDueDate : ''}
                  onChange={(e) => setSchedDueDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 font-medium focus:outline-indigo-600"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Milestone Status</label>
                <select
                  value={schedStatus}
                  onChange={(e) => setSchedStatus(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 font-bold"
                >
                  <option value="pending">Pending (Upcoming Payment)</option>
                  <option value="received">Received (Paid by Client)</option>
                  <option value="overdue">Overdue (Delayed Payment)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Milestone Notes / Payment Terms</label>
                <input
                  type="text"
                  placeholder="e.g. Payable via UPI/Bank transfer on shoot day"
                  value={schedNotes}
                  onChange={(e) => setSchedNotes(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider transition shadow-md mt-2 flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{editingScheduleItem ? 'Update Milestone' : 'Save Payment Milestone'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Generic Item Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={genericDeleteModal.isOpen}
        title={genericDeleteModal.title}
        itemTitle={genericDeleteModal.itemTitle}
        onConfirm={genericDeleteModal.onConfirm}
        onCancel={() => setGenericDeleteModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Delete Project Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        projectTitle={project.clientWeddingTitle}
        onConfirm={() => {
          if (onDeleteProject) {
            onDeleteProject(project.id);
            setShowDeleteConfirm(false);
            onClose();
          }
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};
