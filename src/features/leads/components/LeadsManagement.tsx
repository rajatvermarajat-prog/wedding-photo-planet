import React, { useState, useEffect } from 'react';
import { OwnerLead, LeadStatus, TeamMember, LeadQuotationFile, LeadActivityLog } from '@/types';
import { usePermission } from '@/features/access';
import { LeadFormModal } from './LeadFormModal';
import { LeadsFilterBar } from './LeadsFilterBar';
import { LeadsHeader } from './LeadsHeader';
import { LeadsKpiGrid } from './LeadsKpiGrid';
import { LeadQuotationModal } from './LeadQuotationModal';
import { LeadBookingModal, LeadHistoryModal, LeadNoteModal } from './LeadSecondaryModals';
import { LeadQuotationPreview } from './LeadQuotationPreview';
import { LeadTargetsModal } from './LeadTargetsModal';
import { LeadDeleteConfirmModal } from './LeadDeleteConfirmModal';
import { LeadAnalyticsDashboard } from './LeadAnalyticsDashboard';
import { 
  Target, 
  Plus, 
  Search, 
  Phone, 
  MessageSquare, 
  Calendar, 
  IndianRupee, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  Edit3,
  FileText,
  Upload,
  Paperclip,
  Eye,
  History,
  BarChart2,
  Users,
} from 'lucide-react';

export const SALES_TEAM_OPTIONS = [
  'Vikram Aditya (Sales Manager)',
  'Ishita (Studio Manager)',
  'Manisha Sharma (Studio Manager)',
  'Neha Sharma (Social Media Handler)',
  'Shivali (Social Media Handler)',
  'Rahul Verma (Senior Cinematographer)',
  'Ankit Kumar (Lead Photographer)',
  'Aarav Gupta (Video Editor)',
  'Priya Das (Album Designer)',
  'Studio Owner',
];

export interface LeadTargets {
  yearlyLeadTarget: number;
  monthlyLeadTarget: number;
  yearlyBookedTarget: number;
  monthlyBookedTarget: number;
  yearlyRevenueTarget: number;
  monthlyRevenueTarget: number;
  avgTicketSize?: number;
  targetYear: string | number;
}

const DEFAULT_LEAD_TARGETS: LeadTargets = {
  yearlyLeadTarget: 120,
  monthlyLeadTarget: 10,
  yearlyBookedTarget: 24,
  monthlyBookedTarget: 2,
  yearlyRevenueTarget: 3000000,
  monthlyRevenueTarget: 250000,
  avgTicketSize: 125000,
  targetYear: '2026-2027',
};

const INITIAL_LEADS: OwnerLead[] = [
  {
    id: 'lead-1',
    clientName: 'Aarav & Ishita Sharma',
    mobile: '9876543210',
    email: 'aarav.sharma@gmail.com',
    eventType: 'Complete Wedding Package',
    eventDate: '2026-11-18',
    budgetEstimate: 250000,
    status: 'quotation_sent',
    source: 'Instagram',
    assignedTo: 'Ishita (Studio Manager)',
    assignedDate: '2026-08-01',
    createdBy: 'Ishita (Studio Manager)',
    notes: 'Requested drone shoot and 35-page luxury album in Udaipur.',
    createdDate: '2026-08-01',
    quotations: [
      {
        id: 'q-1',
        fileName: 'Aarav_Ishita_Wedding_Quotation_v2.pdf',
        fileSize: '2.4 MB',
        fileType: 'pdf',
        uploadedBy: 'Ishita (Studio Manager)',
        uploadedDate: '2026-08-02',
        notes: 'Includes 20% discount on drone & LED wall package.'
      }
    ],
    activityLogs: [
      {
        id: 'log-1',
        type: 'created',
        description: 'Lead created by Ishita (Studio Manager)',
        performedBy: 'Ishita (Studio Manager)',
        timestamp: '2026-08-01 10:30 AM'
      },
      {
        id: 'log-2',
        type: 'quotation_uploaded',
        description: 'Uploaded quotation: Aarav_Ishita_Wedding_Quotation_v2.pdf',
        performedBy: 'Ishita (Studio Manager)',
        timestamp: '2026-08-02 02:15 PM'
      }
    ]
  },
  {
    id: 'lead-2',
    clientName: 'Vikram & Priya Rathore',
    mobile: '9123456789',
    eventType: 'Pre-Wedding Shoot',
    eventDate: '2026-10-05',
    budgetEstimate: 85000,
    status: 'meeting_fixed',
    source: 'Reference / Word of Mouth',
    assignedTo: 'Manisha Sharma (Studio Manager)',
    assignedDate: '2026-08-04',
    createdBy: 'Studio Owner',
    notes: 'Meeting scheduled at Studio office on Friday 4 PM.',
    createdDate: '2026-08-04',
    quotations: [],
    activityLogs: [
      {
        id: 'log-3',
        type: 'created',
        description: 'Lead created by Studio Owner',
        performedBy: 'Studio Owner',
        timestamp: '2026-08-04 11:00 AM'
      },
      {
        id: 'log-4',
        type: 'assigned',
        description: 'Lead assigned to Manisha Sharma (Studio Manager)',
        performedBy: 'Studio Owner',
        timestamp: '2026-08-04 11:05 AM'
      }
    ]
  },
  {
    id: 'lead-3',
    clientName: 'Mehta Family (Rohan Weds Ananya)',
    mobile: '9988776655',
    eventType: 'Engagement & Sangeet',
    eventDate: '2026-12-02',
    budgetEstimate: 180000,
    status: 'booked',
    source: 'Website',
    assignedTo: 'Studio Owner',
    assignedDate: '2026-07-28',
    createdBy: 'Studio Owner',
    notes: 'Booked deal! Token advance ₹25,000 received.',
    createdDate: '2026-07-28',
    quotations: [
      {
        id: 'q-2',
        fileName: 'Mehta_Family_Final_Agreement.pdf',
        fileSize: '1.8 MB',
        fileType: 'pdf',
        uploadedBy: 'Studio Owner',
        uploadedDate: '2026-07-29',
        notes: 'Signed deal agreement with advance payment receipt.'
      }
    ],
    activityLogs: [
      {
        id: 'log-5',
        type: 'created',
        description: 'Lead created by Studio Owner',
        performedBy: 'Studio Owner',
        timestamp: '2026-07-28 04:00 PM'
      },
      {
        id: 'log-6',
        type: 'status_changed',
        description: 'Status updated to Booked Deal (Token Received)',
        performedBy: 'Studio Owner',
        timestamp: '2026-07-29 05:30 PM'
      }
    ]
  },
  {
    id: 'lead-4',
    clientName: 'Siddharth & Meera',
    mobile: '9811223344',
    eventType: 'Destination Wedding',
    eventDate: '2027-01-15',
    budgetEstimate: 400000,
    status: 'new',
    source: 'Google Search',
    assignedTo: 'Vikram Aditya (Sales Manager)',
    assignedDate: '2026-08-08',
    createdBy: 'Vikram Aditya (Sales Manager)',
    notes: 'Inquired via website form for Goa destination wedding.',
    createdDate: '2026-08-08',
    quotations: [],
    activityLogs: [
      {
        id: 'log-7',
        type: 'created',
        description: 'Lead created by Vikram Aditya (Sales Manager)',
        performedBy: 'Vikram Aditya (Sales Manager)',
        timestamp: '2026-08-08 09:15 AM'
      }
    ]
  },
];

interface LeadsManagementProps {
  currentUser?: TeamMember | { id?: string; name?: string; role?: string; email?: string } | null;
}

export const LeadsManagement: React.FC<LeadsManagementProps> = ({ currentUser }) => {
  const { can, role } = usePermission();
  const [leads, setLeads] = useState<OwnerLead[]>(() => {
    const saved = localStorage.getItem('wpp_owner_crm_leads');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_LEADS;
      }
    }
    return INITIAL_LEADS;
  });

  const [activeSubTab, setActiveSubTab] = useState<'list' | 'analytics'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');

  // Modal State
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [editingLead, setEditingLead] = useState<OwnerLead | null>(null);

  // Form State
  const [clientName, setClientName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [eventType, setEventType] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [budgetEstimate, setBudgetEstimate] = useState<number | ''>('');
  const [advanceReceived, setAdvanceReceived] = useState<number | ''>('');
  const [status, setStatus] = useState<LeadStatus>('new');
  const [source, setSource] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [notes, setNotes] = useState('');

  // Quotation Upload Modal State
  const [quotationModalLead, setQuotationModalLead] = useState<OwnerLead | null>(null);
  const [previewQuotation, setPreviewQuotation] = useState<{ file: LeadQuotationFile; lead: OwnerLead } | null>(null);
  const [newQuoteFileName, setNewQuoteFileName] = useState('');
  const [newQuoteFileType, setNewQuoteFileType] = useState('pdf');
  const [newQuoteFileSize, setNewQuoteFileSize] = useState('');
  const [newQuoteNotes, setNewQuoteNotes] = useState('');
  const [newQuoteDataUrl, setNewQuoteDataUrl] = useState<string | undefined>(undefined);

  // History Modal State
  const [historyModalLead, setHistoryModalLead] = useState<OwnerLead | null>(null);

  // Quick Note Modal State
  const [noteModalLead, setNoteModalLead] = useState<OwnerLead | null>(null);
  const [quickNoteText, setQuickNoteText] = useState('');

  // Delete Confirmation Modal State
  const [leadToDelete, setLeadToDelete] = useState<OwnerLead | null>(null);
  const [quoteToDelete, setQuoteToDelete] = useState<{ leadId: string; quoteId: string; fileName: string } | null>(null);

  // Booking Deal Amount Modal State
  const [bookingAmountModalLead, setBookingAmountModalLead] = useState<OwnerLead | null>(null);
  const [modalFinalAmount, setModalFinalAmount] = useState<string>('');
  const [modalAdvanceAmount, setModalAdvanceAmount] = useState<string>('');

  // Lead Targets & Goals State
  const [targets, setTargets] = useState<LeadTargets>(() => {
    const saved = localStorage.getItem('wpp_owner_lead_targets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_LEAD_TARGETS;
      }
    }
    return DEFAULT_LEAD_TARGETS;
  });

  const [showTargetModal, setShowTargetModal] = useState(false);
  const [targetForm, setTargetForm] = useState<LeadTargets>(targets);

  useEffect(() => {
    localStorage.setItem('wpp_owner_lead_targets', JSON.stringify(targets));
  }, [targets]);

  const handleOpenTargetModal = () => {
    setTargetForm(targets);
    setShowTargetModal(true);
  };

  const handleSaveTargets = (e: React.FormEvent) => {
    e.preventDefault();
    setTargets(targetForm);
    setShowTargetModal(false);
  };

  // User details & Role Determination
  const userName = currentUser?.name || 'Studio Owner';
  const userRole = currentUser?.role || 'Owner';
  const usingBackend = Array.isArray((currentUser as { permissions?: string[] } | null)?.permissions);
  const canCreateLead = can('leads.create');
  const canEditLead = can('leads.edit');
  const canDeleteLead = can('leads.delete');
  const canAssignLead = can('leads.assign');
  const canChangeLeadStatus = can('leads.change_status') || can('leads.edit');
  const seeAllLeads = usingBackend
    ? can('leads.view')
    : can('leads.view') && role?.grants['leads.view']?.scope === 'all';
  const isOwner = seeAllLeads || can('reports.view_sales');

  useEffect(() => {
    localStorage.setItem('wpp_owner_crm_leads', JSON.stringify(leads));
  }, [leads]);

  // Helper to add log
  const createLog = (type: LeadActivityLog['type'], description: string): LeadActivityLog => ({
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    type,
    description,
    performedBy: userName,
    timestamp: new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  });

  const handleOpenAddModal = () => {
    if (!canCreateLead) return;
    setEditingLead(null);
    setClientName('');
    setMobile('');
    setEmail('');
    setEventType('');
    setEventDate('');
    setBudgetEstimate('');
    setAdvanceReceived('');
    setStatus('new');
    setSource('');
    setAssignedTo(userName || 'Ishita (Studio Manager)');
    setNotes('');
    setShowAddLeadModal(true);
  };

  const handleOpenEditModal = (lead: OwnerLead) => {
    if (!canEditLead) return;
    setEditingLead(lead);
    setClientName(lead.clientName || '');
    setMobile(lead.mobile || '');
    setEmail(lead.email || '');
    setEventType(lead.eventType || '');
    setEventDate(lead.eventDate || '');
    setBudgetEstimate(lead.budgetEstimate || '');
    setAdvanceReceived(lead.advanceReceived !== undefined ? lead.advanceReceived : '');
    setStatus(lead.status);
    setSource(lead.source || '');
    setAssignedTo(lead.assignedTo || '');
    setNotes(lead.notes || '');
    setShowAddLeadModal(true);
  };

  const handleSaveLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLead ? !canEditLead : !canCreateLead) return;
    if (!mobile.trim()) {
      alert('Please enter a valid mobile number for the inquiry.');
      return;
    }

    const finalClientName = clientName.trim() || 'Inquiry Client';
    const finalEventType = eventType.trim() || 'General Photography Inquiry';
    const finalSource = source.trim() || 'Direct / Call';
    const finalAssignee = assignedTo.trim() || userName || 'Studio Owner';
    const today = new Date().toISOString().split('T')[0];
    const numBudget = Number(budgetEstimate) || 0;
    const numAdv = Number(advanceReceived) || 0;

    if (editingLead) {
      const isReassigned = editingLead.assignedTo !== finalAssignee;
      const isStatusChanged = editingLead.status !== status;

      setLeads((prev) =>
        prev.map((l) => {
          if (l.id === editingLead.id) {
            const updatedLogs = [...(l.activityLogs || [])];

            if (isReassigned) {
              updatedLogs.push(
                createLog('assigned', `Reassigned from "${l.assignedTo || 'Unassigned'}" to "${finalAssignee}"`)
              );
            }

            if (isStatusChanged) {
              updatedLogs.push(
                createLog('status_changed', `Status updated from "${l.status}" to "${status}"`)
              );
            }

            updatedLogs.push(
              createLog('edited', `Lead details updated by ${userName}`)
            );

            return {
              ...l,
              clientName: finalClientName,
              mobile: mobile.trim(),
              email: email.trim() || undefined,
              eventType: finalEventType,
              eventDate: eventDate || undefined,
              budgetEstimate: numBudget,
              finalAmount: status === 'booked' ? numBudget : l.finalAmount,
              advanceReceived: status === 'booked' ? numAdv : l.advanceReceived,
              status,
              source: finalSource,
              assignedTo: finalAssignee,
              assignedDate: isReassigned ? today : (l.assignedDate || l.createdDate || today),
              notes: notes.trim() || undefined,
              activityLogs: updatedLogs,
            };
          }
          return l;
        })
      );
    } else {
      const newLeadLogs: LeadActivityLog[] = [
        createLog('created', `Lead added by ${userName}`),
      ];

      if (finalAssignee) {
        newLeadLogs.push(
          createLog('assigned', `Initial lead assigned to ${finalAssignee}`)
        );
      }

      const newLead: OwnerLead = {
        id: `lead-${Date.now()}`,
        clientName: finalClientName,
        mobile: mobile.trim(),
        email: email.trim() || undefined,
        eventType: finalEventType,
        eventDate: eventDate || undefined,
        budgetEstimate: numBudget,
        finalAmount: status === 'booked' ? numBudget : undefined,
        advanceReceived: status === 'booked' ? numAdv : undefined,
        status,
        source: finalSource,
        assignedTo: finalAssignee,
        assignedDate: today,
        createdBy: userName,
        notes: notes.trim() || undefined,
        createdDate: today,
        quotations: [],
        activityLogs: newLeadLogs,
      };
      setLeads((prev) => [newLead, ...prev]);
    }

    setShowAddLeadModal(false);
    setEditingLead(null);
  };

  const handleUpdateStatus = (id: string, newStatus: LeadStatus, finalAmt?: number, advAmt?: number) => {
    if (!canChangeLeadStatus) return;
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === id) {
          const updatedLogs = [...(l.activityLogs || [])];
          const calculatedFinalAmt = finalAmt !== undefined ? finalAmt : (newStatus === 'booked' ? l.finalAmount || l.budgetEstimate : undefined);
          const calculatedAdvAmt = advAmt !== undefined ? advAmt : (newStatus === 'booked' ? l.advanceReceived : undefined);

          const logMsg = newStatus === 'booked' && calculatedFinalAmt !== undefined
            ? `Status updated to "Booked Deal" (Final: ₹${calculatedFinalAmt.toLocaleString('en-IN')}${calculatedAdvAmt ? `, Advance: ₹${calculatedAdvAmt.toLocaleString('en-IN')}` : ''})`
            : `Status updated from "${l.status}" to "${newStatus}"`;

          updatedLogs.push(createLog('status_changed', logMsg));

          return {
            ...l,
            status: newStatus,
            finalAmount: calculatedFinalAmt,
            advanceReceived: calculatedAdvAmt,
            budgetEstimate: calculatedFinalAmt !== undefined ? calculatedFinalAmt : l.budgetEstimate,
            activityLogs: updatedLogs
          };
        }
        return l;
      })
    );
  };

  const handleConfirmBookingAmount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingAmountModalLead) return;
    const numFinalAmt = Number(modalFinalAmount) || bookingAmountModalLead.budgetEstimate || 0;
    const numAdvAmt = Number(modalAdvanceAmount) || 0;
    handleUpdateStatus(bookingAmountModalLead.id, 'booked', numFinalAmt, numAdvAmt);
    setBookingAmountModalLead(null);
    setModalFinalAmount('');
    setModalAdvanceAmount('');
  };

  const handleUpdateAssignedTo = (id: string, newAssignedTo: string) => {
    if (!canAssignLead) return;
    const today = new Date().toISOString().split('T')[0];
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === id) {
          const oldAssignee = l.assignedTo || 'Unassigned';
          const updatedLogs = [...(l.activityLogs || [])];
          updatedLogs.push(
            createLog('assigned', `Reassigned lead from "${oldAssignee}" to "${newAssignedTo}"`)
          );
          return {
            ...l,
            assignedTo: newAssignedTo,
            assignedDate: today,
            activityLogs: updatedLogs
          };
        }
        return l;
      })
    );
  };

  const handleSaveQuickNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditLead || !noteModalLead) return;

    const trimmed = quickNoteText.trim();
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === noteModalLead.id) {
          const updatedLogs = [...(l.activityLogs || [])];
          updatedLogs.push(
            createLog('note_added', trimmed ? `Note updated: "${trimmed}"` : 'Note cleared')
          );
          return {
            ...l,
            notes: trimmed || undefined,
            activityLogs: updatedLogs
          };
        }
        return l;
      })
    );

    setNoteModalLead(null);
    setQuickNoteText('');
  };

  const handleDeleteLead = (leadOrId: string | OwnerLead) => {
    if (!canDeleteLead) return;
    if (typeof leadOrId === 'object') {
      setLeadToDelete(leadOrId);
    } else {
      const found = leads.find((l) => l.id === leadOrId);
      if (found) {
        setLeadToDelete(found);
      } else {
        setLeads((prev) => prev.filter((l) => l.id !== leadOrId));
      }
    }
  };

  // Quotation Upload Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewQuoteFileName(file.name);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setNewQuoteFileSize(`${sizeMb} MB`);
      
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'pdf') setNewQuoteFileType('pdf');
      else if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') setNewQuoteFileType('excel');
      else if (ext === 'doc' || ext === 'docx') setNewQuoteFileType('word');
      else if (['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) setNewQuoteFileType('image');

      const reader = new FileReader();
      reader.onload = () => {
        setNewQuoteDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditLead || !quotationModalLead || !newQuoteFileName.trim()) return;

    const today = new Date().toISOString().split('T')[0];
    const newQuote: LeadQuotationFile = {
      id: `q-${Date.now()}`,
      fileName: newQuoteFileName.trim(),
      fileSize: newQuoteFileSize.trim() || '1.2 MB',
      fileType: newQuoteFileType,
      fileUrl: newQuoteDataUrl,
      uploadedBy: userName,
      uploadedDate: today,
      notes: newQuoteNotes.trim() || undefined,
    };

    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === quotationModalLead.id) {
          const currentQuotes = l.quotations || [];
          const updatedLogs = [...(l.activityLogs || [])];
          updatedLogs.push(
            createLog('quotation_uploaded', `Uploaded quotation file: ${newQuote.fileName}`)
          );
          const newStatus = l.status === 'new' || l.status === 'contacted' ? 'quotation_sent' : l.status;
          
          return {
            ...l,
            status: newStatus,
            quotations: [newQuote, ...currentQuotes],
            activityLogs: updatedLogs
          };
        }
        return l;
      })
    );

    // Update state of open modal
    setQuotationModalLead((prev) =>
      prev
        ? {
            ...prev,
            quotations: [newQuote, ...(prev.quotations || [])]
          }
        : null
    );

    // Reset quote form
    setNewQuoteFileName('');
    setNewQuoteFileSize('');
    setNewQuoteNotes('');
    setNewQuoteDataUrl(undefined);
  };

  const handleDeleteQuotation = (leadId: string, quoteId: string, fileName?: string) => {
    setQuoteToDelete({
      leadId,
      quoteId,
      fileName: fileName || 'Quotation Document',
    });
  };

  // PRIVACY FILTER:
  // If user is Owner/Studio Manager, they see ALL leads.
  // If user is a normal team member, they see ONLY leads where createdBy or assignedTo matches their name!
  const isUserAssignedOrCreator = (lead: OwnerLead) => {
    if (seeAllLeads) return true;
    if (!userName) return false;

    const lowerUser = userName.toLowerCase();
    const assignedMatch = lead.assignedTo ? lead.assignedTo.toLowerCase().includes(lowerUser) || lowerUser.includes(lead.assignedTo.toLowerCase()) : false;
    const createdMatch = lead.createdBy ? lead.createdBy.toLowerCase().includes(lowerUser) || lowerUser.includes(lead.createdBy.toLowerCase()) : false;

    return assignedMatch || createdMatch;
  };

  // Base Accessible Leads (Privacy Enforced)
  const accessibleLeads = leads.filter(isUserAssignedOrCreator);

  // Filtered Leads based on Search & UI Selectors
  const filteredLeads = accessibleLeads.filter((l) => {
    const matchesSearch =
      (l.clientName && l.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      l.mobile.includes(searchQuery) ||
      l.eventType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.notes && l.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (l.assignedTo && l.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || l.source === sourceFilter;
    const matchesAssignee = assigneeFilter === 'all' || (l.assignedTo && l.assignedTo.includes(assigneeFilter));

    return matchesSearch && matchesStatus && matchesSource && matchesAssignee;
  });

  // KPI Calculations (based on accessible leads for accuracy)
  const totalLeadsCount = accessibleLeads.length;
  const bookedCount = accessibleLeads.filter((l) => l.status === 'booked').length;
  const activeCount = accessibleLeads.filter((l) => l.status !== 'booked' && l.status !== 'lost').length;
  const totalPipelineRevenue = accessibleLeads.reduce((acc, l) => acc + (l.budgetEstimate || 0), 0);
  const bookedRevenue = accessibleLeads.filter((l) => l.status === 'booked').reduce((acc, l) => acc + (l.budgetEstimate || 0), 0);
  const totalQuotationsCount = accessibleLeads.reduce((acc, l) => acc + (l.quotations?.length || 0), 0);

  // Target Performance Calculations
  const now = new Date();
  const targetYearStr = String(targets.targetYear || '2026-2027');
  
  // Extract 4-digit years from targetYear (e.g. "2026-2027" -> ["2026", "2027"])
  const matchedYears = targetYearStr.match(/\d{4}/g) || [String(now.getFullYear())];
  const primaryYear = matchedYears[0] || String(now.getFullYear());

  const currentMonthNum = now.getMonth() + 1;
  const currentMonthStr = `${primaryYear}-${String(currentMonthNum).padStart(2, '0')}`;
  const currentMonthName = now.toLocaleString('en-IN', { month: 'long' });

  // Helper to test if lead date belongs to the target year / FY range
  const belongsToTargetYear = (createdDateStr?: string) => {
    if (!createdDateStr) return true;
    return matchedYears.some((yr) => createdDateStr.startsWith(yr));
  };

  // Yearly actuals
  const yearlyLeadsCount = accessibleLeads.filter((l) => belongsToTargetYear(l.createdDate)).length;
  const yearlyBookedLeads = accessibleLeads.filter(
    (l) => l.status === 'booked' && belongsToTargetYear(l.createdDate)
  );
  const yearlyBookedCount = yearlyBookedLeads.length;
  const yearlyBookedRevenue = yearlyBookedLeads.reduce((acc, l) => acc + (l.finalAmount || l.budgetEstimate || 0), 0);

  // Monthly actuals
  const monthlyLeadsList = accessibleLeads.filter((l) => l.createdDate && l.createdDate.startsWith(currentMonthStr));
  const monthlyLeadsCount = monthlyLeadsList.length > 0 ? monthlyLeadsList.length : yearlyLeadsCount;

  const monthlyBookedList = accessibleLeads.filter((l) => l.status === 'booked' && l.createdDate && l.createdDate.startsWith(currentMonthStr));
  const monthlyBookedCount = monthlyBookedList.length > 0 ? monthlyBookedList.length : yearlyBookedCount;
  const monthlyBookedRevenue = monthlyBookedList.length > 0
    ? monthlyBookedList.reduce((acc, l) => acc + (l.finalAmount || l.budgetEstimate || 0), 0)
    : yearlyBookedRevenue;

  const calcPct = (actual: number, target: number) => {
    if (!target || target <= 0) return 0;
    return Math.round((actual / target) * 100);
  };

  const yearlyLeadsPct = calcPct(yearlyLeadsCount, targets.yearlyLeadTarget);
  const yearlyBookedPct = calcPct(yearlyBookedCount, targets.yearlyBookedTarget);
  const yearlyRevPct = calcPct(yearlyBookedRevenue, targets.yearlyRevenueTarget);

  const monthlyLeadsPct = calcPct(monthlyLeadsCount, targets.monthlyLeadTarget);
  const monthlyBookedPct = calcPct(monthlyBookedCount, targets.monthlyBookedTarget);
  const monthlyRevPct = calcPct(monthlyBookedRevenue, targets.monthlyRevenueTarget);

  // All audit logs for Owner Stream
  const allGlobalLogs = leads
    .flatMap((l) =>
      (l.activityLogs || []).map((log) => ({
        ...log,
        leadClientName: l.clientName,
        leadId: l.id
      }))
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="h-fit space-y-6 animate-in fade-in duration-300">
      <LeadsHeader userName={userName} userRole={userRole} isOwner={isOwner} canAddLead={canCreateLead} activeView={activeSubTab} onViewChange={setActiveSubTab} onAddLead={handleOpenAddModal} />

      {/* YEARLY & MONTHLY TARGETING & GOALS WIDGET (Visible to Owner & Managers only) */}
      {isOwner && activeSubTab === 'list' && (
        <div className="space-y-4 rounded-3xl border border-[#ddc89c]/30 bg-[linear-gradient(135deg,#422a34,#302329_55%,#241b1f)] p-5 text-white shadow-xl md:p-6">
          <div className="flex flex-col items-start justify-between gap-3 border-b border-rose-300/15 pb-3.5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2.5">
              <div className="rounded-2xl border border-[#efd9b0]/25 bg-[#efd9b0]/10 p-2.5 text-[#efd9b0]">
                <Target className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base md:text-lg font-black text-white flex items-center gap-2">
                    <span>Lead Goals & Target Performance</span>
                    <span className="rounded-full border border-rose-300/25 bg-rose-300/10 px-2.5 py-1 text-xs font-extrabold uppercase text-rose-200">
                      Target Tracking
                    </span>
                  </h3>
                </div>
                <p className="mt-0.5 text-sm font-medium text-[#d9cdd1]">
                  Owner defined yearly ({targets.targetYear}) and monthly ({currentMonthName}) inquiry & conversion goals.
                </p>
              </div>
            </div>

            {isOwner && (
              <button
                onClick={handleOpenTargetModal}
                className="flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-[#efd9b0]/50 bg-[#f3dfc8] px-4 py-2.5 text-sm font-extrabold text-[#633346] shadow-md transition hover:-translate-y-0.5 hover:bg-white"
              >
                <Edit3 className="size-4" />
                <span>Set / Edit Targets</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* YEARLY TARGET CARD */}
            <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-black uppercase tracking-wider text-amber-200">
                    Yearly Target ({targets.targetYear})
                  </h4>
                </div>
                <span className="rounded border border-slate-700 bg-slate-900/80 px-2 py-1 font-mono text-xs font-bold text-slate-300">
                  Year {targets.targetYear}
                </span>
              </div>

              <div className="space-y-3">
                {/* Metric 1: Yearly Leads */}
                <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-700/60 space-y-1.5">
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Users className="size-4 text-rose-300" /> Inquiry Leads Volume:
                    </span>
                    <span className="text-white font-black font-mono">
                      {yearlyLeadsCount} / {targets.yearlyLeadTarget} Leads
                      <span className={`ml-2 rounded px-2 py-0.5 text-xs ${yearlyLeadsPct >= 100 ? 'bg-emerald-500/30 text-emerald-300' : 'bg-rose-500/30 text-rose-200'}`}>
                        {yearlyLeadsPct}%
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                    <div
                      className={`h-full transition-all duration-500 ${yearlyLeadsPct >= 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-rose-700 to-rose-400'}`}
                      style={{ width: `${Math.min(100, yearlyLeadsPct)}%` }}
                    />
                  </div>
                </div>

                {/* Metric 2: Yearly Bookings */}
                <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-700/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Booked Weddings / Deals:
                    </span>
                    <span className="text-white font-black font-mono">
                      {yearlyBookedCount} / {targets.yearlyBookedTarget} Deals
                      <span className={`ml-2 px-1.5 py-0.2 rounded text-[10px] ${yearlyBookedPct >= 100 ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-emerald-500/30 text-emerald-300'}`}>
                        {yearlyBookedPct}%
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                      style={{ width: `${Math.min(100, yearlyBookedPct)}%` }}
                    />
                  </div>
                </div>

                {/* Metric 3: Yearly Revenue */}
                <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-700/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <IndianRupee className="w-3.5 h-3.5 text-amber-400" /> Revenue Target (Booked Sum):
                    </span>
                    <span className="text-white font-black font-mono">
                      ₹{yearlyBookedRevenue.toLocaleString('en-IN')} / ₹{targets.yearlyRevenueTarget.toLocaleString('en-IN')}
                      <span className={`ml-2 px-1.5 py-0.2 rounded text-[10px] ${yearlyRevPct >= 100 ? 'bg-amber-400 text-slate-950 font-black' : 'bg-amber-500/30 text-amber-300'}`}>
                        {yearlyRevPct}%
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
                      style={{ width: `${Math.min(100, yearlyRevPct)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* MONTHLY TARGET CARD */}
            <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-sm font-black uppercase tracking-wider text-emerald-300">
                    Monthly Target ({currentMonthName} {primaryYear})
                  </h4>
                </div>
                <span className="rounded border border-emerald-700/60 bg-emerald-950/80 px-2 py-1 font-mono text-xs font-bold text-emerald-300">
                  Current Month
                </span>
              </div>

              <div className="space-y-3">
                {/* Metric 1: Monthly Leads */}
                <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-700/60 space-y-1.5">
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Users className="size-4 text-rose-300" /> Monthly Inquiry Target:
                    </span>
                    <span className="text-white font-black font-mono">
                      {monthlyLeadsCount} / {targets.monthlyLeadTarget} Leads
                      <span className={`ml-2 rounded px-2 py-0.5 text-xs ${monthlyLeadsPct >= 100 ? 'bg-emerald-500/30 text-emerald-300' : 'bg-rose-500/30 text-rose-200'}`}>
                        {monthlyLeadsPct}%
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                    <div
                      className={`h-full transition-all duration-500 ${monthlyLeadsPct >= 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-rose-700 to-rose-400'}`}
                      style={{ width: `${Math.min(100, monthlyLeadsPct)}%` }}
                    />
                  </div>
                </div>

                {/* Metric 2: Monthly Bookings */}
                <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-700/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Monthly Deals Target:
                    </span>
                    <span className="text-white font-black font-mono">
                      {monthlyBookedCount} / {targets.monthlyBookedTarget} Deals
                      <span className={`ml-2 px-1.5 py-0.2 rounded text-[10px] ${monthlyBookedPct >= 100 ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-emerald-500/30 text-emerald-300'}`}>
                        {monthlyBookedPct}%
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                      style={{ width: `${Math.min(100, monthlyBookedPct)}%` }}
                    />
                  </div>
                </div>

                {/* Metric 3: Monthly Revenue */}
                <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-700/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <IndianRupee className="w-3.5 h-3.5 text-amber-400" /> Monthly Revenue Target:
                    </span>
                    <span className="text-white font-black font-mono">
                      ₹{monthlyBookedRevenue.toLocaleString('en-IN')} / ₹{targets.monthlyRevenueTarget.toLocaleString('en-IN')}
                      <span className={`ml-2 px-1.5 py-0.2 rounded text-[10px] ${monthlyRevPct >= 100 ? 'bg-amber-400 text-slate-950 font-black' : 'bg-amber-500/30 text-amber-300'}`}>
                        {monthlyRevPct}%
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
                      style={{ width: `${Math.min(100, monthlyRevPct)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'list' && <LeadsKpiGrid totalLeads={totalLeadsCount} activeLeads={activeCount} bookedDeals={bookedCount} bookedRevenue={bookedRevenue} quotations={totalQuotationsCount} pipelineValue={totalPipelineRevenue} isOwner={isOwner} />}

      {/* SUB TAB VIEW SWITCH: LIST VS OWNER ANALYTICS */}
      {activeSubTab === 'analytics' && isOwner ? (
        <div className="space-y-6">
          <LeadAnalyticsDashboard leads={accessibleLeads} targets={targets} />
          {/* OWNER REPORTING SECTION */}
          <div className="hidden bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-indigo-600" /> Studio Lead Analytics & Team Performance
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Complete overview of assigned leads, staff conversion rates, quotations uploaded, and transfer history.
                </p>
              </div>
              <button
                onClick={() => setActiveSubTab('list')}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold transition cursor-pointer"
              >
                Back to Leads Table
              </button>
            </div>

            {/* Team Breakdown Grid */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-600" /> Lead Distribution Per Staff Member
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {SALES_TEAM_OPTIONS.map((staffName) => {
                  const staffLeads = leads.filter((l) => l.assignedTo && l.assignedTo.includes(staffName.split(' ')[0]));
                  const staffBooked = staffLeads.filter((l) => l.status === 'booked').length;
                  const staffActive = staffLeads.filter((l) => l.status !== 'booked' && l.status !== 'lost').length;
                  const staffValue = staffLeads.reduce((acc, l) => acc + (l.budgetEstimate || 0), 0);
                  const staffQuotes = staffLeads.reduce((acc, l) => acc + (l.quotations?.length || 0), 0);

                  return (
                    <div key={staffName} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-slate-900">{staffName}</span>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 font-black text-[10px]">
                          {staffLeads.length} Leads
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                        <div className="bg-white p-2 rounded-xl border border-slate-200/80">
                          <p className="text-[9px] uppercase font-bold text-slate-400">Active</p>
                          <p className="font-black text-amber-600">{staffActive}</p>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-slate-200/80">
                          <p className="text-[9px] uppercase font-bold text-slate-400">Booked</p>
                          <p className="font-black text-emerald-600">{staffBooked}</p>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-slate-200/80">
                          <p className="text-[9px] uppercase font-bold text-slate-400">Quotes</p>
                          <p className="font-black text-indigo-600">{staffQuotes}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-200/60 font-medium">
                        <span>Est. Value:</span>
                        <strong className="text-slate-900">₹{staffValue.toLocaleString('en-IN')}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Global Lead Audit & Transfer Stream */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                <History className="w-4 h-4 text-indigo-600" /> Recent Reassignments, Transfers & Activity History Log
              </h4>

              <div className="bg-slate-900 rounded-2xl p-4 text-slate-300 font-mono text-xs max-h-80 overflow-y-auto space-y-2.5 border border-slate-800">
                {allGlobalLogs.length === 0 ? (
                  <p className="text-slate-500 text-center py-6 italic">No lead transfer or activity logs recorded yet.</p>
                ) : (
                  allGlobalLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2.5 border-b border-slate-800/80 pb-2 text-[11px] last:border-0 last:pb-0">
                      <span className="text-indigo-400 font-bold shrink-0">[{log.timestamp}]</span>
                      <span className="text-emerald-300 font-extrabold shrink-0">[{log.leadClientName}]</span>
                      <span className="text-slate-200">{log.description}</span>
                      <span className="ml-auto text-slate-400 text-[10px] shrink-0">by {log.performedBy}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <LeadsFilterBar search={searchQuery} status={statusFilter} source={sourceFilter} assignee={assigneeFilter} teamOptions={SALES_TEAM_OPTIONS} onSearchChange={setSearchQuery} onStatusChange={setStatusFilter} onSourceChange={setSourceFilter} onAssigneeChange={setAssigneeFilter} />

          {/* Leads Data Table */}
          <div className="h-fit overflow-hidden rounded-3xl border border-[#e2d9d3] bg-white shadow-[0_12px_34px_rgba(48,44,46,.07)]">
            <div className="show-x-scrollbar h-fit overflow-x-auto overflow-y-hidden">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#7e5363] bg-[#4b303a] text-xs font-extrabold uppercase tracking-wider text-[#f4e8ec]">
                    <th className="p-3.5 whitespace-nowrap min-w-[200px]">Client & Inquiry</th>
                    <th className="p-3.5 whitespace-nowrap min-w-[150px]">Contact Details</th>
                    <th className="p-3.5 whitespace-nowrap min-w-[170px]">Event Type / Requirement</th>
                    <th className="p-3.5 whitespace-nowrap min-w-[120px]">Event Date</th>
                    <th className="p-3.5 whitespace-nowrap min-w-[110px]">Budget Est.</th>
                    <th className="p-3.5 whitespace-nowrap min-w-[140px]">Created By</th>
                    <th className="p-3.5 whitespace-nowrap min-w-[200px]">Assigned To</th>
                    <th className="p-3.5 whitespace-nowrap min-w-[120px]">Quotation Documents</th>
                    <th className="p-3.5 whitespace-nowrap min-w-[185px]">Lead Status</th>
                    <th className="p-3.5 text-center whitespace-nowrap min-w-[140px]">Actions / Logs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white align-top">
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-12 text-center text-slate-400 italic">
                        {isOwner
                          ? 'No lead records found matching your current filter criteria.'
                          : canCreateLead
                            ? 'No leads found assigned to or created by you. Use "+ Add Lead" to add your new inquiries!'
                            : 'No leads found assigned to or created by you.'}
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead, index) => {
                      const whatsappLink = `https://wa.me/91${lead.mobile.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(
                        lead.clientName
                      )},%20thank%20you%20for%20inquiring%20with%20our%20Wedding%20Photography%20Studio!`;

                      const quoteCount = lead.quotations?.length || 0;

                      return (
                        <React.Fragment key={lead.id}>
                          <tr className="group align-top transition hover:bg-rose-50/50">
                            {/* Client Name & ID */}
                            <td className="p-3.5 font-black text-slate-900 align-top">
                              <div className="flex items-center gap-2 py-0.5">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-sm font-extrabold text-rose-800">
                                  {index + 1}
                                </div>
                                <div>
                                  <p className="font-extrabold text-slate-900 text-sm leading-snug">{lead.clientName || 'Anonymous Client'}</p>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[10px] text-slate-400 font-mono">ID: #{lead.id.slice(-4)}</span>
                                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-bold">
                                      {lead.source}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Contact Details */}
                            <td className="p-3.5 align-top whitespace-nowrap">
                              <div className="space-y-1 py-0.5">
                                <a
                                  href={`tel:${lead.mobile}`}
                                  className="flex items-center gap-1 text-slate-800 font-extrabold hover:text-emerald-600 text-xs"
                                >
                                  <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  {lead.mobile}
                                </a>
                                <a
                                  href={whatsappLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200"
                                >
                                  <MessageSquare className="w-3 h-3 text-emerald-600 shrink-0" />
                                  WhatsApp Chat
                                </a>
                              </div>
                            </td>

                            {/* Requirement / Event Type */}
                            <td className="p-3.5 font-bold text-slate-800 align-top">
                              <div className="py-0.5">
                                <p className="text-slate-900 font-extrabold text-xs">{lead.eventType}</p>
                                {!lead.notes && canEditLead && (
                                  <button
                                    onClick={() => {
                                      setNoteModalLead(lead);
                                      setQuickNoteText('');
                                    }}
                                    className="mt-1 text-[10px] text-indigo-700 hover:text-indigo-900 font-extrabold flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-md border border-indigo-200/80 transition cursor-pointer"
                                  >
                                    <Plus className="w-2.5 h-2.5" />
                                    <span>+ Add Note</span>
                                  </button>
                                )}
                              </div>
                            </td>

                          {/* Event Date */}
                          <td className="p-3.5 font-extrabold text-slate-700 align-top whitespace-nowrap">
                            <div className="py-0.5">
                              {lead.eventDate ? (
                                <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1.5 rounded-xl text-slate-800 text-xs font-extrabold border border-slate-200">
                                  <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                  {lead.eventDate}
                                </span>
                              ) : (
                                <span className="text-slate-400 italic text-xs">Not set</span>
                              )}
                            </div>
                          </td>

                          {/* Budget Est. */}
                          <td className="p-3.5 font-black text-slate-900 align-top whitespace-nowrap">
                            <div className="py-0.5">
                              <span className="inline-flex items-center gap-0.5 text-emerald-700 font-extrabold bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-100 text-xs">
                                ₹{(lead.budgetEstimate || 0).toLocaleString('en-IN')}
                              </span>
                            </div>
                          </td>

                          {/* Created By */}
                          <td className="p-3.5 font-bold text-slate-600 align-top whitespace-nowrap">
                            <div className="py-0.5">
                              <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-xl border border-slate-200 font-extrabold inline-block whitespace-nowrap">
                                {lead.createdBy || 'Studio Owner'}
                              </span>
                              <p className="text-[9px] text-slate-400 mt-1 font-mono leading-none">{lead.createdDate}</p>
                            </div>
                          </td>

                          {/* Assigned To (Drop-down for reassigning) */}
                          <td className="p-3.5 align-top min-w-[200px]">
                            <div className="py-0.5">
                              <div className="flex items-center gap-1.5 bg-indigo-50/80 border border-indigo-100 px-2.5 py-1.5 rounded-xl text-indigo-950 font-extrabold text-xs w-full">
                                <UserCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                <select
                                  value={lead.assignedTo || ''}
                                  disabled={!canAssignLead}
                                  onChange={(e) => handleUpdateAssignedTo(lead.id, e.target.value)}
                                  className="bg-transparent border-none p-0 focus:outline-none font-extrabold text-indigo-900 text-xs cursor-pointer w-full disabled:cursor-not-allowed truncate"
                                >
                                  <option value="">-- Unassigned --</option>
                                  {SALES_TEAM_OPTIONS.map((member) => (
                                    <option key={member} value={member}>
                                      {member}
                                    </option>
                                  ))}
                                  {lead.assignedTo && !SALES_TEAM_OPTIONS.includes(lead.assignedTo) && (
                                    <option value={lead.assignedTo}>{lead.assignedTo}</option>
                                  )}
                                </select>
                              </div>
                              {lead.assignedDate && (
                                <p className="text-[9px] text-slate-400 mt-1 font-mono leading-none">Assigned: {lead.assignedDate}</p>
                              )}
                            </div>
                          </td>

                          {/* Quotation Documents */}
                          <td className="p-3.5 align-top whitespace-nowrap">
                            <div className="py-0.5 flex items-center gap-1.5">
                              <button
                                onClick={() => setQuotationModalLead(lead)}
                                className={`px-2.5 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition border cursor-pointer ${
                                  quoteCount > 0
                                    ? 'bg-indigo-50 text-indigo-900 border-indigo-200 hover:bg-indigo-100'
                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                                title="Manage & Attach Quotation Files"
                              >
                                <Paperclip className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Quote ({quoteCount})</span>
                                {quoteCount > 0 && (
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                )}
                              </button>

                              <button
                                onClick={() => {
                                  const firstQuote = lead.quotations?.[0];
                                  if (firstQuote) {
                                    setPreviewQuotation({ file: firstQuote, lead });
                                  } else {
                                    setQuotationModalLead(lead);
                                  }
                                }}
                                className="px-2.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 rounded-xl font-extrabold text-xs flex items-center gap-1 transition cursor-pointer shadow-2xs"
                                title="View / Preview Quotation Document"
                              >
                                <Eye className="w-3.5 h-3.5 text-emerald-700" />
                                <span>View</span>
                              </button>
                            </div>
                          </td>

                          {/* Lead Status Switcher */}
                          <td className="p-3.5 align-top whitespace-nowrap">
                            <div className="py-0.5">
                              <select
                                value={lead.status}
                                disabled={!canChangeLeadStatus}
                                onChange={(e) => {
                                  const newSt = e.target.value as LeadStatus;
                                  if (newSt === 'booked') {
                                    setBookingAmountModalLead(lead);
                                    setModalFinalAmount(
                                      lead.finalAmount
                                        ? String(lead.finalAmount)
                                        : lead.budgetEstimate
                                        ? String(lead.budgetEstimate)
                                        : ''
                                    );
                                    setModalAdvanceAmount(
                                      lead.advanceReceived !== undefined && lead.advanceReceived !== null
                                        ? String(lead.advanceReceived)
                                        : ''
                                    );
                                  } else {
                                    handleUpdateStatus(lead.id, newSt);
                                  }
                                }}
                                className={`w-full font-black text-xs rounded-xl px-2.5 py-1.5 border shadow-2xs cursor-pointer min-w-[175px] ${
                                  lead.status === 'booked'
                                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                    : lead.status === 'quotation_sent'
                                    ? 'bg-blue-100 text-blue-900 border-blue-300'
                                    : lead.status === 'meeting_fixed'
                                    ? 'bg-purple-100 text-purple-900 border-purple-300'
                                    : lead.status === 'contacted'
                                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                                    : lead.status === 'lost'
                                    ? 'bg-rose-100 text-rose-900 border-rose-300'
                                    : 'bg-slate-100 text-slate-800 border-slate-300'
                                }`}
                              >
                                <option value="new">New Inquiry</option>
                                <option value="contacted">Contacted / Followup</option>
                                <option value="meeting_fixed">Meeting Fixed</option>
                                <option value="quotation_sent">Quotation Sent</option>
                                <option value="booked">Booked Deal</option>
                                <option value="lost">Lost / Unconverted</option>
                              </select>

                              {lead.status === 'booked' && (
                                <div className="mt-1 space-y-1 bg-emerald-50 border border-emerald-300 rounded-lg p-1.5 text-[11px] font-extrabold text-emerald-900 shadow-2xs">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-tight">Final Amount:</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setBookingAmountModalLead(lead);
                                        setModalFinalAmount(
                                          lead.finalAmount
                                            ? String(lead.finalAmount)
                                            : lead.budgetEstimate
                                            ? String(lead.budgetEstimate)
                                            : ''
                                        );
                                        setModalAdvanceAmount(
                                          lead.advanceReceived !== undefined && lead.advanceReceived !== null
                                            ? String(lead.advanceReceived)
                                            : ''
                                        );
                                      }}
                                      className="font-mono text-xs font-black text-emerald-950 underline hover:text-emerald-700 cursor-pointer flex items-center gap-0.5"
                                      title="Click to edit finalized deal & advance amount"
                                    >
                                      ₹{(lead.finalAmount || lead.budgetEstimate || 0).toLocaleString('en-IN')}
                                      <Edit3 className="w-3 h-3 text-emerald-700" />
                                    </button>
                                  </div>
                                  <div className="flex items-center justify-between gap-1 pt-1 border-t border-emerald-200">
                                    <span className="text-[10px] text-indigo-700 font-bold uppercase tracking-tight">Advance Recd:</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setBookingAmountModalLead(lead);
                                        setModalFinalAmount(
                                          lead.finalAmount
                                            ? String(lead.finalAmount)
                                            : lead.budgetEstimate
                                            ? String(lead.budgetEstimate)
                                            : ''
                                        );
                                        setModalAdvanceAmount(
                                          lead.advanceReceived !== undefined && lead.advanceReceived !== null
                                            ? String(lead.advanceReceived)
                                            : ''
                                        );
                                      }}
                                      className="font-mono text-xs font-black text-indigo-950 underline hover:text-indigo-700 cursor-pointer flex items-center gap-0.5"
                                      title="Click to edit advance amount"
                                    >
                                      ₹{(lead.advanceReceived || 0).toLocaleString('en-IN')}
                                      <Edit3 className="w-3 h-3 text-indigo-700" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Actions & Audit History */}
                          <td className="p-3.5 text-center align-top whitespace-nowrap">
                            <div className="py-0.5 flex items-center justify-center gap-1">
                              <button
                                onClick={() => setHistoryModalLead(lead)}
                                title="View Lead History & Audit Logs"
                                className="p-1.5 hover:bg-indigo-100 text-indigo-700 rounded-lg transition cursor-pointer"
                              >
                                <History className="w-4 h-4" />
                              </button>
                              {canEditLead && (
                              <button
                                onClick={() => handleOpenEditModal(lead)}
                                title="Edit Lead Details"
                                className="p-1.5 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              )}
                              {canDeleteLead && (
                                <button
                                  onClick={() => handleDeleteLead(lead)}
                                  title="Delete Lead"
                                  className="p-1.5 hover:bg-red-100 text-red-600 rounded-lg transition cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Note Sub-Row (Notepad placed cleanly below lead row) */}
                        {lead.notes && (
                          <tr className="bg-amber-50/70 border-b border-amber-200/80">
                            <td colSpan={10} className="px-4 py-2.5">
                              <div className="flex items-start justify-between gap-3 bg-amber-100/90 border border-amber-300 rounded-xl p-3 text-amber-950 shadow-2xs">
                                <div className="flex items-start gap-2.5">
                                  <FileText className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                                  <div>
                                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-900 block">
                                      Lead Note / Reminder:
                                    </span>
                                    <p className="text-xs font-bold text-slate-900 mt-1 leading-relaxed whitespace-pre-wrap break-words max-w-4xl">
                                      "{lead.notes}"
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    setNoteModalLead(lead);
                                    setQuickNoteText(lead.notes || '');
                                  }}
                                  className="px-3 py-1 bg-amber-200 hover:bg-amber-300 text-amber-950 font-black rounded-lg text-xs border border-amber-400 transition cursor-pointer flex items-center gap-1 shrink-0 shadow-2xs"
                                  title="Edit Note"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Edit Note</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <LeadFormModal
        open={showAddLeadModal}
        editingLead={editingLead}
        clientName={clientName}
        mobile={mobile}
        email={email}
        eventType={eventType}
        eventDate={eventDate}
        budgetEstimate={budgetEstimate}
        advanceReceived={advanceReceived}
        status={status}
        source={source}
        assignedTo={assignedTo}
        notes={notes}
        teamOptions={SALES_TEAM_OPTIONS}
        onClientNameChange={setClientName}
        onMobileChange={setMobile}
        onEmailChange={setEmail}
        onEventTypeChange={setEventType}
        onEventDateChange={setEventDate}
        onBudgetChange={setBudgetEstimate}
        onAdvanceChange={setAdvanceReceived}
        onStatusChange={setStatus}
        onSourceChange={setSource}
        onAssignedToChange={setAssignedTo}
        onNotesChange={setNotes}
        onClose={() => setShowAddLeadModal(false)}
        onSubmit={handleSaveLead}
      />
      <LeadQuotationModal
        lead={quotationModalLead}
        fileName={newQuoteFileName}
        fileType={newQuoteFileType}
        notes={newQuoteNotes}
        isOwner={isOwner}
        userName={userName}
        onClose={() => setQuotationModalLead(null)}
        onPreview={(file, lead) => setPreviewQuotation({ file, lead })}
        onDelete={handleDeleteQuotation}
        onFileChange={handleFileChange}
        onFileNameChange={setNewQuoteFileName}
        onFileTypeChange={setNewQuoteFileType}
        onNotesChange={setNewQuoteNotes}
        onSubmit={handleSaveQuotation}
      />
      <LeadHistoryModal
        lead={historyModalLead}
        onClose={() => setHistoryModalLead(null)}
      />
      <LeadNoteModal
        lead={noteModalLead}
        value={quickNoteText}
        onValueChange={setQuickNoteText}
        onClose={() => setNoteModalLead(null)}
        onSubmit={handleSaveQuickNote}
      />
      <LeadQuotationPreview
        preview={previewQuotation}
        onClose={() => setPreviewQuotation(null)}
      />
      <LeadBookingModal
        lead={bookingAmountModalLead}
        finalAmount={modalFinalAmount}
        advanceAmount={modalAdvanceAmount}
        onFinalAmountChange={setModalFinalAmount}
        onAdvanceAmountChange={setModalAdvanceAmount}
        onClose={() => {
          setBookingAmountModalLead(null);
          setModalFinalAmount('');
          setModalAdvanceAmount('');
        }}
        onSubmit={handleConfirmBookingAmount}
      />
      {/* 6. CONFIRMATION MODALS FOR DELETION */}
      <LeadDeleteConfirmModal
        open={!!leadToDelete}
        title="Delete Lead Record"
        itemTitle={leadToDelete?.clientName || 'Inquiry Record'}
        message={`Are you sure you want to delete lead "${leadToDelete?.clientName || 'Inquiry Record'}"? This action cannot be undone.`}
        onConfirm={() => {
          if (!canDeleteLead || !leadToDelete) return;
          setLeads((prev) => prev.filter((l) => l.id !== leadToDelete.id));
          setLeadToDelete(null);
        }}
        onCancel={() => setLeadToDelete(null)}
      />

      <LeadDeleteConfirmModal
        open={!!quoteToDelete}
        title="Delete Quotation File"
        itemTitle={quoteToDelete?.fileName || 'Quotation Document'}
        message={`Are you sure you want to delete quotation document "${quoteToDelete?.fileName || ''}"?`}
        onConfirm={() => {
          if (quoteToDelete) {
            const { leadId, quoteId } = quoteToDelete;
            setLeads((prev) =>
              prev.map((l) => {
                if (l.id === leadId) {
                  return {
                    ...l,
                    quotations: (l.quotations || []).filter((q) => q.id !== quoteId),
                  };
                }
                return l;
              })
            );
            setQuotationModalLead((prev) =>
              prev && prev.id === leadId
                ? { ...prev, quotations: (prev.quotations || []).filter((q) => q.id !== quoteId) }
                : prev
            );
            setQuoteToDelete(null);
          }
        }}
        onCancel={() => setQuoteToDelete(null)}
      />

      <LeadTargetsModal
        open={showTargetModal}
        value={targetForm}
        onChange={setTargetForm}
        onClose={() => setShowTargetModal(false)}
        onSubmit={handleSaveTargets}
      />
    </div>
  );
};
