import React, { useState, useEffect } from 'react';
import { OwnerLead, LeadStatus, TeamMember, LeadQuotationFile, LeadActivityLog } from '@/types';
import { ConfirmDeleteModal } from '@/components/common/ConfirmDeleteModal';
import { 
  Target, 
  Plus, 
  Search, 
  Phone, 
  MessageSquare, 
  Calendar, 
  IndianRupee, 
  Filter, 
  Trash2, 
  X, 
  CheckCircle2, 
  Clock, 
  Building2, 
  UserCheck, 
  Share2, 
  Edit3,
  Check,
  TrendingUp,
  AlertCircle,
  FileText,
  Upload,
  Paperclip,
  Shield,
  Eye,
  EyeOff,
  History,
  ArrowRightLeft,
  FileSpreadsheet,
  Download,
  Lock,
  BarChart2,
  Users,
  FileCheck,
  Printer
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
  const isOwner =
    userRole === 'Owner' ||
    userRole === 'Studio Manager' ||
    userRole === 'Manager' ||
    userRole === 'Account Manager' ||
    userRole === 'Sales Manager' ||
    userRole === 'Accountant' ||
    userName === 'Studio Owner';

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
    if (!noteModalLead) return;

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
    if (!quotationModalLead || !newQuoteFileName.trim()) return;

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
    if (isOwner) return true;
    if (!userName) return true;

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
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* YEARLY & MONTHLY TARGETING & GOALS WIDGET (Visible to Owner & Managers only) */}
      {isOwner && (
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 md:p-6 text-white shadow-xl border border-indigo-500/30 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-indigo-800/60 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Target className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base md:text-lg font-black text-white flex items-center gap-2">
                    <span>Lead Goals & Target Performance</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase font-mono font-extrabold">
                      Target Tracking
                    </span>
                  </h3>
                </div>
                <p className="text-xs text-slate-300 font-medium mt-0.5">
                  Owner defined yearly ({targets.targetYear}) and monthly ({currentMonthName}) inquiry & conversion goals.
                </p>
              </div>
            </div>

            {isOwner && (
              <button
                onClick={handleOpenTargetModal}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center gap-1.5 transition shadow-md hover:scale-105 cursor-pointer shrink-0 border border-indigo-400/40"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-300" />
                <span>⚙️ Set / Edit Targets</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* YEARLY TARGET CARD */}
            <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <h4 className="font-black text-xs uppercase tracking-wider text-amber-300">
                    Yearly Target ({targets.targetYear}) • साल का लक्ष्य
                  </h4>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
                  Year {targets.targetYear}
                </span>
              </div>

              <div className="space-y-3">
                {/* Metric 1: Yearly Leads */}
                <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-700/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-400" /> Inquiry Leads Volume:
                    </span>
                    <span className="text-white font-black font-mono">
                      {yearlyLeadsCount} / {targets.yearlyLeadTarget} Leads
                      <span className={`ml-2 px-1.5 py-0.2 rounded text-[10px] ${yearlyLeadsPct >= 100 ? 'bg-emerald-500/30 text-emerald-300' : 'bg-indigo-500/30 text-indigo-300'}`}>
                        {yearlyLeadsPct}%
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                    <div
                      className={`h-full transition-all duration-500 ${yearlyLeadsPct >= 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-indigo-500 to-cyan-400'}`}
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
                  <h4 className="font-black text-xs uppercase tracking-wider text-emerald-300">
                    Monthly Target ({currentMonthName} {primaryYear}) • महीने का लक्ष्य
                  </h4>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-700/60 px-2 py-0.5 rounded">
                  Current Month
                </span>
              </div>

              <div className="space-y-3">
                {/* Metric 1: Monthly Leads */}
                <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-700/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-400" /> Monthly Inquiry Target:
                    </span>
                    <span className="text-white font-black font-mono">
                      {monthlyLeadsCount} / {targets.monthlyLeadTarget} Leads
                      <span className={`ml-2 px-1.5 py-0.2 rounded text-[10px] ${monthlyLeadsPct >= 100 ? 'bg-emerald-500/30 text-emerald-300' : 'bg-indigo-500/30 text-indigo-300'}`}>
                        {monthlyLeadsPct}%
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                    <div
                      className={`h-full transition-all duration-500 ${monthlyLeadsPct >= 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-indigo-500 to-cyan-400'}`}
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
                        {monthlyBookedPct}% {monthlyBookedPct >= 100 ? '🎉' : ''}
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
                        {monthlyRevPct}% {monthlyRevPct >= 100 ? '🚀' : ''}
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

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-indigo-700/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-400" /> Studio Lead CRM & Privacy Vault
            </span>
            <span className="text-xs font-mono font-bold text-slate-200 bg-white/10 px-2.5 py-0.5 rounded-lg border border-white/10">
              User: <strong className="text-emerald-300">{userName}</strong> ({userRole})
            </span>
            {!isOwner && (
              <span className="text-[10px] bg-amber-500/20 text-amber-200 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-400" /> Private View Active (My Leads Only)
              </span>
            )}
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white mt-2 flex items-center gap-2">
            <Target className="w-6 h-6 text-emerald-400" />
            <span>Leads & Inquiry Management</span>
          </h2>
          <p className="text-xs text-slate-300 font-medium mt-1 max-w-2xl">
            Complete lead ownership tracking, quotation file attachments, staff assignments, and audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {isOwner && (
            <div className="bg-slate-800/80 p-1 rounded-2xl border border-slate-700 flex items-center gap-1">
              <button
                onClick={() => setActiveSubTab('list')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 ${
                  activeSubTab === 'list'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> All Leads
              </button>
              <button
                onClick={() => setActiveSubTab('analytics')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 ${
                  activeSubTab === 'analytics'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5 text-emerald-400" /> Owner Analytics
              </button>
            </div>
          )}

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 transition shadow-lg hover:scale-105 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> + Add Lead / Inquiry
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Total Leads</span>
            <Target className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalLeadsCount}</p>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">
            {isOwner ? 'All Studio Leads' : 'Assigned/Created by you'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Active Pipeline</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 mt-1">{activeCount}</p>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">In followups / quotes</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Booked Deals</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-1">{bookedCount}</p>
          <p className="text-[10px] text-emerald-700 font-bold mt-0.5">
            ₹{bookedRevenue.toLocaleString('en-IN')} Secured
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-indigo-600">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Quotations Uploaded</span>
            <FileCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-indigo-900 mt-1">{totalQuotationsCount}</p>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">PDF / Excel Quotes attached</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Est. Pipeline Value</span>
            <IndianRupee className="w-4 h-4 text-slate-700" />
          </div>
          <p className="text-xl font-black text-slate-900 mt-1">₹{totalPipelineRevenue.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">Estimated budget sum</p>
        </div>
      </div>

      {/* SUB TAB VIEW SWITCH: LIST VS OWNER ANALYTICS */}
      {activeSubTab === 'analytics' && isOwner ? (
        <div className="space-y-6">
          {/* OWNER REPORTING SECTION */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
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
          {/* Filters & Search Controls */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search client name, phone, requirement..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-transparent border-none text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Lead Statuses</option>
                  <option value="new">🆕 New Inquiries</option>
                  <option value="contacted">📞 Contacted / Followup</option>
                  <option value="meeting_fixed">📅 Meeting Fixed</option>
                  <option value="quotation_sent">📄 Quotation Sent</option>
                  <option value="booked">✓ Booked Deals</option>
                  <option value="lost">❌ Lost / Unconverted</option>
                </select>
              </div>

              {/* Source Filter */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                <Share2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="w-full bg-transparent border-none text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Sources</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Meta Ads">Meta Ads</option>
                  <option value="Google Ads">Google Ads</option>
                  <option value="Reference / Word of Mouth">Reference / Word of Mouth</option>
                  <option value="Website">Website</option>
                  <option value="Walk-in">Walk-in</option>
                  <option value="Google Search">Google Search</option>
                </select>
              </div>

              {/* Staff Assignee Filter (Available for Owner or search) */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                <UserCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <select
                  value={assigneeFilter}
                  onChange={(e) => setAssigneeFilter(e.target.value)}
                  className="w-full bg-transparent border-none text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="all">Filter by Staff Assignee</option>
                  {SALES_TEAM_OPTIONS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Leads Data Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-slate-200 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-800">
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
                          : 'No leads found assigned to or created by you. Use "+ Add Lead / Inquiry" to add your new inquiries!'}
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
                          <tr className="hover:bg-slate-50/80 transition group align-top">
                            {/* Client Name & ID */}
                            <td className="p-3.5 font-black text-slate-900 align-top">
                              <div className="flex items-center gap-2 py-0.5">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center shrink-0 border border-emerald-200 text-xs">
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
                                {!lead.notes && (
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
                                  disabled={!isOwner && lead.assignedTo !== userName}
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
                                <option value="new">🆕 New Inquiry</option>
                                <option value="contacted">📞 Contacted / Followup</option>
                                <option value="meeting_fixed">📅 Meeting Fixed</option>
                                <option value="quotation_sent">📄 Quotation Sent</option>
                                <option value="booked">✓ Booked Deal</option>
                                <option value="lost">❌ Lost / Unconverted</option>
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
                              <button
                                onClick={() => handleOpenEditModal(lead)}
                                title="Edit Lead Details"
                                className="p-1.5 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              {isOwner && (
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
                                      📝 Lead Note / Reminder:
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

      {/* 1. ADD / EDIT LEAD MODAL */}
      {showAddLeadModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-600" />
                {editingLead ? 'Edit Lead Record' : 'Add New Lead / Inquiry'}
              </h3>
              <button
                onClick={() => setShowAddLeadModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLead} className="space-y-4 text-xs">
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">
                  Client Name (Optional if unknown)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Aarav & Ishita / Verma Family"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Email ID</label>
                  <input
                    type="email"
                    placeholder="client@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Event Requirement / Type</label>
                <input
                  type="text"
                  placeholder="e.g. Wedding Photography + Drone Shoot + Album"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Event Date</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Budget Est. ₹</label>
                  <input
                    type="number"
                    placeholder="e.g. 150000"
                    value={budgetEstimate}
                    onChange={(e) => setBudgetEstimate(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Lead Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as LeadStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900 cursor-pointer bg-white"
                  >
                    <option value="new">🆕 New Inquiry</option>
                    <option value="contacted">📞 Contacted / Followup</option>
                    <option value="meeting_fixed">📅 Meeting Fixed</option>
                    <option value="quotation_sent">📄 Quotation Sent</option>
                    <option value="booked">✓ Booked Deal</option>
                    <option value="lost">❌ Lost / Unconverted</option>
                  </select>
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Lead Source</label>
                  <input
                    type="text"
                    list="sources-list"
                    placeholder="e.g. Meta Ads, Google Ads, Instagram..."
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900"
                  />
                  <datalist id="sources-list">
                    <option value="Instagram" />
                    <option value="Meta Ads" />
                    <option value="Google Ads" />
                    <option value="Reference / Word of Mouth" />
                    <option value="Website" />
                    <option value="Walk-in" />
                    <option value="Google Search" />
                  </datalist>
                </div>

                {status === 'booked' && (
                  <div className="col-span-2 bg-emerald-50 border-2 border-emerald-400 rounded-xl p-3.5 space-y-3 shadow-2xs">
                    <div>
                      <label className="font-black text-emerald-900 text-xs flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Finalized Deal Amount (₹) *</span>
                      </label>
                      <p className="text-[11px] text-emerald-700 font-medium">Specify the total agreed package amount for this client.</p>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-emerald-800">₹</span>
                        <input
                          type="number"
                          placeholder="e.g. 180000"
                          value={budgetEstimate}
                          onChange={(e) => setBudgetEstimate(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full pl-7 pr-3 py-2 rounded-lg border border-emerald-300 bg-white font-black text-sm text-emerald-950 focus:outline-emerald-600"
                          required={status === 'booked'}
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-emerald-200">
                      <label className="font-black text-emerald-900 text-xs flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                        <span>Advance Amount Received (₹)</span>
                      </label>
                      <p className="text-[11px] text-emerald-700 font-medium">Advance deposit collected at booking time.</p>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-indigo-800">₹</span>
                        <input
                          type="number"
                          placeholder="e.g. 50000"
                          value={advanceReceived}
                          onChange={(e) => setAdvanceReceived(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full pl-7 pr-3 py-2 rounded-lg border border-emerald-300 bg-white font-black text-sm text-slate-950 focus:outline-emerald-600"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Assign Lead To (Sales / Studio Staff)</label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900 bg-indigo-50/40 cursor-pointer"
                >
                  <option value="">-- Select Sales / Staff Member --</option>
                  {SALES_TEAM_OPTIONS.map((member) => (
                    <option key={member} value={member}>
                      {member}
                    </option>
                  ))}
                  {assignedTo && !SALES_TEAM_OPTIONS.includes(assignedTo) && (
                    <option value={assignedTo}>{assignedTo}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Inquiry Notes / Special Remarks</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Wants 2 videographers and traditional album..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddLeadModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl transition cursor-pointer shadow-md"
                >
                  {editingLead ? 'Update Lead' : 'Save Lead Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. QUOTATION UPLOAD & MANAGED ATTACHMENTS MODAL */}
      {quotationModalLead && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 font-mono text-[10px] font-bold">
                  Lead #{quotationModalLead.id.slice(-4)}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1 flex items-center gap-2">
                  <Paperclip className="w-5 h-5 text-indigo-600" />
                  Quotation Documents
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Attached for: <strong>{quotationModalLead.clientName || 'Inquiry Record'}</strong> ({quotationModalLead.mobile})
                </p>
              </div>
              <button
                onClick={() => setQuotationModalLead(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of Attached Quotations */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                Attached Quotation Files ({quotationModalLead.quotations?.length || 0})
              </h4>

              {(!quotationModalLead.quotations || quotationModalLead.quotations.length === 0) ? (
                <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-slate-400 text-xs italic">
                  No quotation files attached yet for this lead inquiry. Use the form below to upload PDF/Word/Excel quote.
                </div>
              ) : (
                <div className="space-y-2">
                  {quotationModalLead.quotations.map((q) => (
                    <div
                      key={q.id}
                      className="flex items-center justify-between p-3 rounded-2xl border border-indigo-100 bg-indigo-50/40 hover:bg-indigo-50 transition text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-indigo-600 text-white font-extrabold text-[10px] uppercase">
                          {q.fileType || 'PDF'}
                        </div>
                        <div>
                          <p className="font-extrabold text-indigo-950">{q.fileName}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium mt-0.5">
                            <span>Size: {q.fileSize || '1.5 MB'}</span>
                            <span>•</span>
                            <span>Uploaded by: <strong className="text-slate-700">{q.uploadedBy}</strong> on {q.uploadedDate}</span>
                          </div>
                          {q.notes && (
                            <p className="text-[10px] text-indigo-800 italic mt-0.5">"{q.notes}"</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setPreviewQuotation({ file: q, lead: quotationModalLead })}
                          className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-lg transition cursor-pointer flex items-center gap-1 text-xs shadow-2xs"
                          title="View / Preview Quotation Document"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>

                        {q.fileUrl ? (
                          <a
                            href={q.fileUrl}
                            download={q.fileName}
                            className="p-1.5 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition"
                            title="Download Quotation File"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <button
                            onClick={() => alert(`Simulated Download for ${q.fileName}`)}
                            className="p-1.5 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition cursor-pointer"
                            title="Download File"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {(isOwner || q.uploadedBy === userName) && (
                          <button
                            onClick={() => handleDeleteQuotation(quotationModalLead.id, q.id, q.fileName)}
                            className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition cursor-pointer"
                            title="Delete Quotation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upload Form */}
            <form onSubmit={handleSaveQuotation} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3 text-xs">
              <h4 className="font-black text-slate-900 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-emerald-600" /> Upload New Quotation File
              </h4>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Select Quotation File (PDF, Word, Excel, Image)</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                  className="w-full text-slate-700 font-bold file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Or File Name / Reference Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ClientName_Wedding_Quotation_v1.pdf"
                  value={newQuoteFileName}
                  onChange={(e) => setNewQuoteFileName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Format Type</label>
                  <select
                    value={newQuoteFileType}
                    onChange={(e) => setNewQuoteFileType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 cursor-pointer"
                  >
                    <option value="pdf">PDF Document</option>
                    <option value="excel">Excel Spreadsheet (.xlsx)</option>
                    <option value="word">Word File (.docx)</option>
                    <option value="image">Image / JPG Quote</option>
                  </select>
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Quotation Notes / Discount</label>
                  <input
                    type="text"
                    placeholder="e.g. Includes 10% discount if booked this week"
                    value={newQuoteNotes}
                    onChange={(e) => setNewQuoteNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" /> Save Quotation File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. AUDIT HISTORY & TIMELINE MODAL */}
      {historyModalLead && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono text-[10px] font-bold">
                  Lead ID #{historyModalLead.id.slice(-4)}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1 flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-600" />
                  Lead Audit History & Timeline
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Client: <strong>{historyModalLead.clientName}</strong> | Created by: <strong>{historyModalLead.createdBy || 'Studio Owner'}</strong>
                </p>
              </div>
              <button
                onClick={() => setHistoryModalLead(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Audit Logs List */}
            <div className="space-y-3 text-xs">
              {(!historyModalLead.activityLogs || historyModalLead.activityLogs.length === 0) ? (
                <div className="p-6 text-center text-slate-400 italic">No activity logs recorded yet.</div>
              ) : (
                <div className="relative pl-4 border-l-2 border-indigo-200 space-y-4 my-2">
                  {historyModalLead.activityLogs.map((log) => (
                    <div key={log.id} className="relative group">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-white" />
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>{log.timestamp}</span>
                          <span className="font-extrabold text-indigo-900">by {log.performedBy}</span>
                        </div>
                        <p className="font-extrabold text-slate-900 text-xs mt-1">{log.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setHistoryModalLead(null)}
                className="px-4 py-2 bg-slate-900 text-white font-extrabold rounded-xl transition cursor-pointer"
              >
                Close History Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. QUICK ADD / EDIT NOTE MODAL */}
      {noteModalLead && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono text-[10px] font-bold">
                  Lead ID #{noteModalLead.id.slice(-4)}
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-600" />
                  Add / Edit Lead Note
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Client: <strong>{noteModalLead.clientName}</strong>
                </p>
              </div>
              <button
                onClick={() => setNoteModalLead(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickNote} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Note / Important Remark:
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. Client requested 3-day wedding coverage package, called today for budget negotiation."
                  value={quickNoteText}
                  onChange={(e) => setQuickNoteText(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setNoteModalLead(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. FULL QUOTATION DOCUMENT PREVIEW & PRINT MODAL */}
      {previewQuotation && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6 z-[60] animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
            {/* Header */}
            <div className="p-4 md:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded text-[10px] font-mono font-extrabold uppercase">
                      Quotation Preview
                    </span>
                    <span className="text-slate-400 text-xs">• {previewQuotation.file.fileName}</span>
                  </div>
                  <h3 className="text-base md:text-lg font-black text-white mt-0.5">
                    Client: {previewQuotation.lead.clientName || 'Inquiry Client'} ({previewQuotation.lead.mobile})
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {previewQuotation.file.fileUrl && (
                  <a
                    href={previewQuotation.file.fileUrl}
                    download={previewQuotation.file.fileName}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Download</span>
                  </a>
                )}
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                  title="Print Quotation"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Print</span>
                </button>
                <button
                  onClick={() => setPreviewQuotation(null)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body Area */}
            <div className="p-4 md:p-6 overflow-y-auto space-y-6 bg-slate-100 flex-1">
              {/* If file is an uploaded image or PDF base64 URL */}
              {previewQuotation.file.fileUrl && previewQuotation.file.fileUrl.startsWith('data:image/') ? (
                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex justify-center">
                  <img
                    src={previewQuotation.file.fileUrl || undefined}
                    alt={previewQuotation.file.fileName}
                    className="max-h-[60vh] object-contain rounded-xl"
                  />
                </div>
              ) : previewQuotation.file.fileUrl && previewQuotation.file.fileUrl.startsWith('data:application/pdf') ? (
                <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs h-[65vh]">
                  <iframe
                    src={previewQuotation.file.fileUrl || undefined}
                    title={previewQuotation.file.fileName}
                    className="w-full h-full rounded-xl"
                  />
                </div>
              ) : null}

              {/* Studio Generated Printable Quotation Sheet */}
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-md space-y-6 text-slate-900 max-w-3xl mx-auto">
                {/* Document Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-slate-900 pb-5 gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 block">Official Studio Quotation Document</span>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">AARVI PRODUCTION & FILMS</h2>
                    <p className="text-xs text-slate-500 font-bold mt-0.5">High-End Wedding Photography & Cinematography Studio</p>
                  </div>
                  <div className="text-left sm:text-right bg-slate-50 p-3 rounded-xl border border-slate-200 min-w-[180px]">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Quotation Ref No</span>
                    <p className="text-xs font-mono font-black text-indigo-700">#QT-{previewQuotation.lead.id.slice(-6).toUpperCase()}</p>
                    <p className="text-[10px] text-slate-500 font-bold mt-1">Date: {previewQuotation.file.uploadedDate}</p>
                  </div>
                </div>

                {/* Client & Event Info Box */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-indigo-50/60 p-4 rounded-xl border border-indigo-100 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-black text-indigo-900 block mb-1">Prepared For (Client):</span>
                    <p className="text-sm font-black text-slate-900">{previewQuotation.lead.clientName || 'Inquiry Client'}</p>
                    <p className="font-extrabold text-slate-700 mt-0.5">📞 Mobile: {previewQuotation.lead.mobile}</p>
                    {previewQuotation.lead.email && <p className="text-slate-600 font-medium">✉️ {previewQuotation.lead.email}</p>}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-black text-indigo-900 block mb-1">Event Requirement:</span>
                    <p className="text-sm font-black text-slate-900">{previewQuotation.lead.eventType}</p>
                    <p className="font-extrabold text-slate-700 mt-0.5">📅 Date: {previewQuotation.lead.eventDate || 'To Be Confirmed'}</p>
                    <p className="font-extrabold text-emerald-700 mt-0.5">💰 Estimated Budget: ₹{(previewQuotation.lead.budgetEstimate || 0).toLocaleString('en-IN')}</p>
                  </div>
                </div>

                {/* Quotation Item Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Quotation Services & Pricing Summary</h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-900 text-white font-extrabold text-[11px]">
                        <tr>
                          <th className="p-3">Service / Package Description</th>
                          <th className="p-3 text-right">Estimated Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-medium">
                        <tr>
                          <td className="p-3">
                            <p className="font-black text-slate-900">{previewQuotation.lead.eventType} Photography & Videography Package</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Includes Traditional Photography, Candid Photography, Cinematic Teaser, Full HD Highlights, and Color Retouched High-Res Photos.
                            </p>
                            {previewQuotation.file.notes && (
                              <p className="text-[11px] text-indigo-700 font-bold italic mt-1 bg-indigo-50 p-1.5 rounded border border-indigo-100">
                                Note: "{previewQuotation.file.notes}"
                              </p>
                            )}
                          </td>
                          <td className="p-3 text-right font-black text-slate-900 text-sm align-top">
                            ₹{(previewQuotation.lead.budgetEstimate || 0).toLocaleString('en-IN')}
                          </td>
                        </tr>
                        <tr className="bg-slate-50 font-black text-slate-900">
                          <td className="p-3 text-right uppercase text-[11px]">Total Estimated Quote:</td>
                          <td className="p-3 text-right text-base text-emerald-700">
                            ₹{(previewQuotation.lead.budgetEstimate || 0).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Payment Terms & Footer */}
                <div className="border-t border-slate-200 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
                  <div className="space-y-1 text-slate-600">
                    <span className="font-extrabold uppercase text-slate-900 block text-[10px]">Payment Schedule Terms:</span>
                    <p>• 30% Advance at the time of booking confirmation.</p>
                    <p>• 60% On the function / shoot date.</p>
                    <p>• 10% At the time of final raw & edited album handover.</p>
                  </div>
                  <div className="text-right flex flex-col justify-end items-end space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold">Uploaded By: {previewQuotation.file.uploadedBy}</span>
                    <span className="text-xs font-black text-slate-900 border-t border-slate-300 pt-2 px-4 inline-block mt-4">
                      Authorized Signature & Seal
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOOKING DEAL AMOUNT MODAL */}
      {bookingAmountModalLead && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Booked Deal Details</h3>
                  <p className="text-xs text-slate-500 font-medium">Client: {bookingAmountModalLead.clientName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setBookingAmountModalLead(null);
                  setModalFinalAmount('');
                  setModalAdvanceAmount('');
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmBookingAmount} className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-black text-emerald-900 uppercase tracking-wide">
                    Finalized Deal Amount (₹) *
                  </label>
                  <p className="text-[11px] text-emerald-700 font-medium leading-relaxed">
                    Total agreed package amount for <strong>{bookingAmountModalLead.clientName}</strong>.
                  </p>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black text-emerald-800">₹</span>
                    <input
                      type="number"
                      value={modalFinalAmount}
                      onChange={(e) => setModalFinalAmount(e.target.value)}
                      placeholder="e.g. 250000"
                      className="w-full pl-8 pr-3 py-2 bg-white border border-emerald-300 rounded-xl font-mono text-sm font-black text-emerald-950 focus:outline-emerald-600 shadow-2xs"
                      autoFocus
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1 pt-2 border-t border-emerald-200">
                  <label className="block text-xs font-black text-emerald-900 uppercase tracking-wide">
                    Advance Amount Received (₹)
                  </label>
                  <p className="text-[11px] text-emerald-700 font-medium leading-relaxed">
                    Advance deposit collected from client at booking time.
                  </p>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black text-indigo-800">₹</span>
                    <input
                      type="number"
                      value={modalAdvanceAmount}
                      onChange={(e) => setModalAdvanceAmount(e.target.value)}
                      placeholder="e.g. 50000"
                      className="w-full pl-8 pr-3 py-2 bg-white border border-emerald-300 rounded-xl font-mono text-sm font-black text-slate-950 focus:outline-emerald-600 shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setBookingAmountModalLead(null);
                    setModalFinalAmount('');
                    setModalAdvanceAmount('');
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Save Booked Deal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. CONFIRMATION MODALS FOR DELETION */}
      <ConfirmDeleteModal
        isOpen={!!leadToDelete}
        title="Delete Lead Record"
        itemTitle={leadToDelete?.clientName || 'Inquiry Record'}
        message={`Are you sure you want to delete lead "${leadToDelete?.clientName || 'Inquiry Record'}"? This action cannot be undone.`}
        onConfirm={() => {
          if (leadToDelete) {
            setLeads((prev) => prev.filter((l) => l.id !== leadToDelete.id));
            setLeadToDelete(null);
          }
        }}
        onCancel={() => setLeadToDelete(null)}
      />

      <ConfirmDeleteModal
        isOpen={!!quoteToDelete}
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

      {/* LEAD TARGETS SETTINGS MODAL */}
      {showTargetModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-100 text-indigo-700">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">
                    Set Lead & Sales Targets (लक्ष्य सेट करें)
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Configure studio yearly & monthly lead acquisition, deal conversion, and revenue goals.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTargetModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTargets} className="space-y-4">
                  {/* Target Year Selector */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex-1 w-full sm:w-auto">
                        <label className="block text-xs font-black text-slate-800 uppercase">
                          Target Year / Financial Year (लक्ष्य वर्ष)
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="text"
                            value={targetForm.targetYear}
                            onChange={(e) => setTargetForm({ ...targetForm, targetYear: e.target.value })}
                            placeholder="e.g. 2026-2027"
                            className="w-36 px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-black text-xs font-mono text-slate-900 focus:outline-indigo-600"
                          />
                          <select
                            value={['2026-2027', '2025-2026', '2027-2028', '2028-2029', '2026', '2027'].includes(String(targetForm.targetYear)) ? String(targetForm.targetYear) : 'custom'}
                            onChange={(e) => {
                              if (e.target.value !== 'custom') {
                                setTargetForm({ ...targetForm, targetYear: e.target.value });
                              }
                            }}
                            className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-extrabold text-xs text-indigo-700 cursor-pointer focus:outline-indigo-600"
                          >
                            <option value="2026-2027">2026-2027 (FY)</option>
                            <option value="2025-2026">2025-2026 (FY)</option>
                            <option value="2027-2028">2027-2028 (FY)</option>
                            <option value="2028-2029">2028-2029 (FY)</option>
                            <option value="2026">2026 (CY)</option>
                            <option value="2027">2027 (CY)</option>
                            <option value="custom">Custom / Manual Typing...</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] font-bold text-slate-500">Quick FY Presets:</span>
                      {['2025-2026', '2026-2027', '2027-2028', '2028-2029'].map((fy) => (
                        <button
                          key={fy}
                          type="button"
                          onClick={() => setTargetForm({ ...targetForm, targetYear: fy })}
                          className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold border transition ${
                            String(targetForm.targetYear) === fy
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {fy}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Section 1: Lead Inquiries Target */}
                  <div className="bg-indigo-50/60 rounded-2xl p-4 border border-indigo-100 space-y-3">
                    <h4 className="font-extrabold text-xs text-indigo-900 uppercase tracking-wide flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-indigo-600" />
                      1. Total Inquiry Lead Volume Target (इन्क्वायरी लीड टारगेट)
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Yearly Lead Target (साल का कुल लीड्स)
                        </label>
                        <input
                          type="number"
                          value={targetForm.yearlyLeadTarget}
                          onChange={(e) => {
                            const yL = Number(e.target.value) || 0;
                            setTargetForm((prev) => ({
                              ...prev,
                              yearlyLeadTarget: yL,
                              monthlyLeadTarget: Math.ceil(yL / 12),
                            }));
                          }}
                          placeholder="e.g. 120"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-black font-mono focus:outline-indigo-600"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Monthly Lead Target (महीने का लीड्स)
                        </label>
                        <input
                          type="number"
                          value={targetForm.monthlyLeadTarget}
                          onChange={(e) => {
                            const mL = Number(e.target.value) || 0;
                            setTargetForm((prev) => ({
                              ...prev,
                              monthlyLeadTarget: mL,
                              yearlyLeadTarget: mL * 12,
                            }));
                          }}
                          placeholder="e.g. 10"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-black font-mono focus:outline-indigo-600"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Booked Deals Target & Avg Ticket Size */}
                  <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100 space-y-3">
                    <h4 className="font-extrabold text-xs text-emerald-900 uppercase tracking-wide flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      2. Booked Deals & Avg Ticket Size (बुक्ड डील्स व एवरेज प्राइस)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Yearly Booked Deals (साल के बुक्ड इवेंट्स)
                        </label>
                        <input
                          type="number"
                          value={targetForm.yearlyBookedTarget}
                          onChange={(e) => {
                            const yB = Number(e.target.value) || 0;
                            const currentTicket = targetForm.avgTicketSize ?? (targetForm.yearlyBookedTarget > 0 ? Math.round(targetForm.yearlyRevenueTarget / targetForm.yearlyBookedTarget) : 125000);
                            const mB = Math.ceil(yB / 12);
                            const newYearlyRev = yB * currentTicket;
                            setTargetForm((prev) => ({
                              ...prev,
                              yearlyBookedTarget: yB,
                              monthlyBookedTarget: mB,
                              avgTicketSize: currentTicket,
                              yearlyRevenueTarget: newYearlyRev,
                              monthlyRevenueTarget: Math.round(newYearlyRev / 12),
                            }));
                          }}
                          placeholder="e.g. 24"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-black font-mono focus:outline-emerald-600"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Monthly Booked Deals (महीने के डील्स)
                        </label>
                        <input
                          type="number"
                          value={targetForm.monthlyBookedTarget}
                          onChange={(e) => {
                            const mB = Number(e.target.value) || 0;
                            const yB = mB * 12;
                            const currentTicket = targetForm.avgTicketSize ?? (targetForm.yearlyBookedTarget > 0 ? Math.round(targetForm.yearlyRevenueTarget / targetForm.yearlyBookedTarget) : 125000);
                            const newYearlyRev = yB * currentTicket;
                            setTargetForm((prev) => ({
                              ...prev,
                              monthlyBookedTarget: mB,
                              yearlyBookedTarget: yB,
                              avgTicketSize: currentTicket,
                              yearlyRevenueTarget: newYearlyRev,
                              monthlyRevenueTarget: mB * currentTicket,
                            }));
                          }}
                          placeholder="e.g. 2"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-black font-mono focus:outline-emerald-600"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-black text-emerald-900 mb-1">
                          Avg Ticket Size ₹ (एवरेज पैकेज/डील साइज़)
                        </label>
                        <input
                          type="number"
                          value={targetForm.avgTicketSize ?? (targetForm.yearlyBookedTarget > 0 ? Math.round(targetForm.yearlyRevenueTarget / targetForm.yearlyBookedTarget) : 125000)}
                          onChange={(e) => {
                            const ticket = Number(e.target.value) || 0;
                            const yB = targetForm.yearlyBookedTarget || 0;
                            const mB = targetForm.monthlyBookedTarget || Math.ceil(yB / 12);
                            const newYearlyRev = yB * ticket;
                            const newMonthlyRev = mB > 0 ? mB * ticket : Math.round(newYearlyRev / 12);
                            setTargetForm((prev) => ({
                              ...prev,
                              avgTicketSize: ticket,
                              yearlyRevenueTarget: newYearlyRev,
                              monthlyRevenueTarget: newMonthlyRev,
                            }));
                          }}
                          placeholder="e.g. 150000"
                          className="w-full px-3 py-2 bg-white border border-emerald-300 text-emerald-950 font-black rounded-xl text-xs font-mono focus:outline-emerald-600 shadow-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Revenue Target */}
                  <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-100 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <h4 className="font-extrabold text-xs text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                        <IndianRupee className="w-4 h-4 text-amber-600" />
                        3. Booked Revenue Target ₹ (रेवेन्यू टारगेट)
                      </h4>
                      <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full font-mono">
                        ⚡ {targetForm.yearlyBookedTarget || 0} Deals × ₹{(targetForm.avgTicketSize ?? (targetForm.yearlyBookedTarget > 0 ? Math.round(targetForm.yearlyRevenueTarget / targetForm.yearlyBookedTarget) : 125000)).toLocaleString('en-IN')} = ₹{(targetForm.yearlyRevenueTarget || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Yearly Revenue Target (₹)
                        </label>
                        <input
                          type="number"
                          value={targetForm.yearlyRevenueTarget}
                          onChange={(e) => {
                            const yR = Number(e.target.value) || 0;
                            const yB = targetForm.yearlyBookedTarget || 1;
                            const calcTicket = yB > 0 ? Math.round(yR / yB) : 0;
                            setTargetForm((prev) => ({
                              ...prev,
                              yearlyRevenueTarget: yR,
                              monthlyRevenueTarget: Math.round(yR / 12),
                              avgTicketSize: calcTicket,
                            }));
                          }}
                          placeholder="e.g. 3000000"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-black font-mono focus:outline-amber-600"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Monthly Revenue Target (₹)
                        </label>
                        <input
                          type="number"
                          value={targetForm.monthlyRevenueTarget}
                          onChange={(e) => {
                            const mR = Number(e.target.value) || 0;
                            const yR = mR * 12;
                            const mB = targetForm.monthlyBookedTarget || 1;
                            const calcTicket = mB > 0 ? Math.round(mR / mB) : 0;
                            setTargetForm((prev) => ({
                              ...prev,
                              monthlyRevenueTarget: mR,
                              yearlyRevenueTarget: yR,
                              avgTicketSize: calcTicket,
                            }));
                          }}
                          placeholder="e.g. 250000"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-black font-mono focus:outline-amber-600"
                          required
                        />
                      </div>
                    </div>
                  </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTargetModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Lead Targets</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
