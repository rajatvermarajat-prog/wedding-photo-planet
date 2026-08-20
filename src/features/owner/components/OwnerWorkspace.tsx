import React, { useState, useEffect } from 'react';
import { ConfirmDeleteModal } from '@/components/common/ConfirmDeleteModal';
import {
  Crown,
  CheckSquare,
  Camera,
  Target,
  FileText,
  Plus,
  Trash2,
  Pencil,
  Pin,
  X,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  Calendar,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Tag,
  DollarSign,
  Briefcase,
  Eye,
  EyeOff,
  GripVertical,
  UserCheck,
  Edit3
} from 'lucide-react';
import { TeamMember, Project } from '@/types';

// ==================== TYPES ==================== //

export interface OwnerTodoTask {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  dueDate?: string;
  category?: string;
  createdAt: string;
}

export interface EquipmentItem {
  id: string;
  name: string;
  category: 'Cameras' | 'Lenses' | 'Drones' | 'Lighting' | 'Audio' | 'Gimbals & Stabilizers' | 'Accessories';
  serialNumber?: string;
  status: 'available' | 'in_use' | 'maintenance';
  assignedToShoot?: string;
  assignedMember?: string;
  conditionNote?: string;
  purchaseDate?: string;
}

export type LeadStatus = 'new' | 'contacted' | 'meeting_fixed' | 'quotation_sent' | 'booked' | 'lost';

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

export interface OwnerLead {
  id: string;
  clientName: string;
  mobile: string;
  email?: string;
  eventType: string;
  eventDate?: string;
  budgetEstimate: number;
  status: LeadStatus;
  source: 'Instagram' | 'Meta Ads' | 'Google Ads' | 'Reference / Word of Mouth' | 'Website' | 'Walk-in' | 'Google Search' | string;
  assignedTo?: string;
  assignedDate?: string;
  createdBy?: string;
  notes?: string;
  createdDate: string;
  finalAmount?: number;
  advanceReceived?: number;
}

export interface OwnerNote {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  pinned?: boolean;
}

interface OwnerWorkspaceProps {
  projects?: Project[];
  activeTeamMembers?: TeamMember[];
}

// ==================== INITIAL MOCK DATA ==================== //

const INITIAL_TODOS: OwnerTodoTask[] = [
  {
    id: 'ot-1',
    title: 'Follow up on pending album approvals for Rohan & Ananya wedding',
    priority: 'high',
    completed: false,
    dueDate: '2026-08-06',
    category: 'Client Followup',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ot-2',
    title: 'Review monthly equipment maintenance schedule & lens calibration',
    priority: 'medium',
    completed: false,
    dueDate: '2026-08-10',
    category: 'Studio Gear',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ot-3',
    title: 'Check pending client installment payments & issue GST receipts',
    priority: 'high',
    completed: true,
    dueDate: '2026-08-05',
    category: 'Finance',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ot-4',
    title: 'Update pricing catalog for upcoming festival pre-wedding season',
    priority: 'low',
    completed: false,
    dueDate: '2026-08-15',
    category: 'General',
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_EQUIPMENT: EquipmentItem[] = [
  {
    id: 'eq-1',
    name: 'Sony FX3 Cinema Camera Body',
    category: 'Cameras',
    serialNumber: 'FX3-98210',
    status: 'in_use',
    assignedToShoot: 'Rohan & Ananya Royal Wedding',
    assignedMember: 'Rajat Verma',
    conditionNote: 'Pristine condition. Clean sensor.',
  },
  {
    id: 'eq-2',
    name: 'Sony A7IV Full Frame Body #1',
    category: 'Cameras',
    serialNumber: 'A74-11022',
    status: 'available',
    conditionNote: 'Dual SD card loaded.',
  },
  {
    id: 'eq-3',
    name: 'Sony A7IV Full Frame Body #2',
    category: 'Cameras',
    serialNumber: 'A74-11023',
    status: 'available',
  },
  {
    id: 'eq-4',
    name: 'Sony 24-70mm f/2.8 GM II Lens',
    category: 'Lenses',
    serialNumber: 'GM2470-33',
    status: 'in_use',
    assignedToShoot: 'Siddharth & Meera Pre-Wedding',
    assignedMember: 'Tokir',
  },
  {
    id: 'eq-5',
    name: 'Sony 85mm f/1.4 GM Lens',
    category: 'Lenses',
    serialNumber: 'GM85-004',
    status: 'available',
  },
  {
    id: 'eq-6',
    name: 'Sony 70-200mm f/2.8 GM OSS II Lens',
    category: 'Lenses',
    serialNumber: 'GM70200-12',
    status: 'available',
  },
  {
    id: 'eq-7',
    name: 'DJI Mini 4 Pro Drone + Fly More Combo',
    category: 'Drones',
    serialNumber: 'M4P-8812',
    status: 'available',
    conditionNote: '3 batteries charged to 100%.',
  },
  {
    id: 'eq-8',
    name: 'DJI RS3 Pro Gimbal Stabilizer',
    category: 'Gimbals & Stabilizers',
    serialNumber: 'RS3P-091',
    status: 'in_use',
    assignedToShoot: 'Rohan & Ananya Royal Wedding',
    assignedMember: 'Mohit',
  },
  {
    id: 'eq-9',
    name: 'Godox AD600 Pro Strobe Flash (Set of 2)',
    category: 'Lighting',
    serialNumber: 'AD600-SET1',
    status: 'available',
  },
  {
    id: 'eq-10',
    name: 'Aputure 300d II Daylight LED Light',
    category: 'Lighting',
    serialNumber: 'AP300-441',
    status: 'available',
  },
  {
    id: 'eq-11',
    name: 'Sennheiser AVX Wireless Lavalier Mic Kit',
    category: 'Audio',
    serialNumber: 'AVX-991',
    status: 'available',
  },
  {
    id: 'eq-12',
    name: 'Godox V1 Speedlight Flash for Sony',
    category: 'Lighting',
    serialNumber: 'GV1-221',
    status: 'maintenance',
    conditionNote: 'Hotshoe mount loose - sent for warranty repair.',
  },
];

const INITIAL_LEADS: OwnerLead[] = [
  {
    id: 'lead-1',
    clientName: 'Vikram & Pooja Wedding',
    mobile: '+91 9812345678',
    email: 'vikram.wedding@example.com',
    eventType: '3-Day Destination Wedding (Udaipur)',
    eventDate: '2026-11-15',
    budgetEstimate: 450000,
    status: 'quotation_sent',
    source: 'Instagram',
    notes: 'Requires 2 Photographers, 2 Cinematographers & Drone Operator.',
    createdDate: '2026-08-01',
  },
  {
    id: 'lead-2',
    clientName: 'Aarav & Simran Pre-Wedding',
    mobile: '+91 9876512340',
    email: 'aarav.simran@example.com',
    eventType: 'Pre-Wedding Shoot in Rishikesh',
    eventDate: '2026-09-10',
    budgetEstimate: 85000,
    status: 'booked',
    source: 'Reference / Word of Mouth',
    notes: 'Deposit received ₹25,000. Location permissions to be arranged.',
    createdDate: '2026-07-28',
  },
  {
    id: 'lead-3',
    clientName: 'Neha Sharma Engagement',
    mobile: '+91 9988776655',
    email: 'neha.s@example.com',
    eventType: 'Ring Ceremony & Evening Party',
    eventDate: '2026-08-28',
    budgetEstimate: 120000,
    status: 'meeting_fixed',
    source: 'Website',
    notes: 'Meeting scheduled for Friday at studio.',
    createdDate: '2026-08-03',
  },
  {
    id: 'lead-4',
    clientName: 'Karan & Tanya Wedding',
    mobile: '+91 9711223344',
    email: '',
    eventType: 'Complete Wedding & Reception',
    eventDate: '2026-12-05',
    budgetEstimate: 300000,
    status: 'new',
    source: 'Instagram',
    notes: 'Inquired via Instagram DM for full cinematic video + album.',
    createdDate: '2026-08-04',
  },
  {
    id: 'lead-5',
    clientName: 'Sahil Verma Roka',
    mobile: '+91 9899001122',
    email: '',
    eventType: 'Intimate Roka Function',
    eventDate: '2026-08-15',
    budgetEstimate: 45000,
    status: 'contacted',
    source: 'Walk-in',
    notes: 'Followed up on WhatsApp with sample portfolio link.',
    createdDate: '2026-08-02',
  },
];

const INITIAL_NOTES: OwnerNote[] = [
  {
    id: 'note-1',
    title: 'Studio Vendor & Album Printers Contacts',
    content: `• Subhash Album Printing Lab (Delhi): +91 9811223344 (Contact: Mr. Ramesh)
• Drone Permission Liaison Officer: Captain Sharma (+91 9876543210)
• Local Camera Gear Rental: CamRentals Gurgaon (+91 9810012345)
• RAW Storage HDD Wholesale Supplier: Western Digital Nehru Place - TechSupplies`,
    updatedAt: new Date().toISOString(),
    pinned: true,
  },
  {
    id: 'note-2',
    title: 'Upcoming Festival Season Special Offer Strategy 2026',
    content: `1. Offer complimentary Drone coverage on 3-day full wedding packages booked before Sept 1st.
2. Include 1 Mini Parent Velvet Album free with Signature Flush Mount Album package.
3. Launch Instagram Reel Teaser promo targeting Delhi NCR & Jaipur couples.`,
    updatedAt: new Date().toISOString(),
    pinned: false,
  },
];

// ==================== MAIN COMPONENT ==================== //

export const OwnerWorkspace: React.FC<OwnerWorkspaceProps> = ({
  projects = [],
  activeTeamMembers = [],
}) => {
  const [activeSection, setActiveSection] = useState<'all' | 'todo' | 'equipment' | 'leads' | 'notepad'>('all');

  // ---------- 1. TO-DO LIST STATE ----------
  const [todos, setTodos] = useState<OwnerTodoTask[]>(() => {
    const saved = localStorage.getItem('wpp_owner_todo_list');
    return saved ? JSON.parse(saved) : INITIAL_TODOS;
  });
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newTodoDueDate, setNewTodoDueDate] = useState('');
  const [newTodoCategory, setNewTodoCategory] = useState('General');
  const [todoFilter, setTodoFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    localStorage.setItem('wpp_owner_todo_list', JSON.stringify(todos));
  }, [todos]);

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;
    const task: OwnerTodoTask = {
      id: `ot-${Date.now()}`,
      title: newTodoTitle.trim(),
      priority: newTodoPriority,
      completed: false,
      dueDate: newTodoDueDate || undefined,
      category: newTodoCategory,
      createdAt: new Date().toISOString(),
    };
    setTodos([task, ...todos]);
    setNewTodoTitle('');
    setNewTodoDueDate('');
  };

  const handleToggleTodo = (id: string) => {
    setTodos(todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(todos.filter((t) => t.id !== id));
  };

  const handleClearCompletedTodos = () => {
    setTodos(todos.filter((t) => !t.completed));
  };

  // ---------- 2. EQUIPMENT INVENTORY STATE ----------
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>(() => {
    const saved = localStorage.getItem('wpp_owner_equipment_inventory');
    return saved ? JSON.parse(saved) : INITIAL_EQUIPMENT;
  });
  const [equipmentSearch, setEquipmentSearch] = useState('');
  const [equipmentCategoryFilter, setEquipmentCategoryFilter] = useState<string>('all');
  const [showAddEquipmentModal, setShowAddEquipmentModal] = useState(false);
  const [newEqName, setNewEqName] = useState('');
  const [newEqCategory, setNewEqCategory] = useState<EquipmentItem['category']>('Cameras');
  const [newEqSerial, setNewEqSerial] = useState('');
  const [newEqStatus, setNewEqStatus] = useState<'available' | 'in_use' | 'maintenance'>('available');
  const [newEqNote, setNewEqNote] = useState('');

  useEffect(() => {
    localStorage.setItem('wpp_owner_equipment_inventory', JSON.stringify(equipmentList));
  }, [equipmentList]);

  const handleAddEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEqName.trim()) return;
    const item: EquipmentItem = {
      id: `eq-${Date.now()}`,
      name: newEqName.trim(),
      category: newEqCategory,
      serialNumber: newEqSerial.trim() || undefined,
      status: newEqStatus,
      conditionNote: newEqNote.trim() || undefined,
    };
    setEquipmentList([item, ...equipmentList]);
    setShowAddEquipmentModal(false);
    setNewEqName('');
    setNewEqSerial('');
    setNewEqNote('');
  };

  const handleUpdateEquipmentStatus = (id: string, status: EquipmentItem['status']) => {
    setEquipmentList(
      equipmentList.map((eq) => (eq.id === id ? { ...eq, status } : eq))
    );
  };

  const handleDeleteEquipment = (id: string) => {
    setEquipmentList(equipmentList.filter((eq) => eq.id !== id));
  };

  // ---------- 3. LEADS CRM STATE ----------
  const [leads, setLeads] = useState<OwnerLead[]>(() => {
    const saved = localStorage.getItem('wpp_owner_crm_leads');
    return saved ? JSON.parse(saved) : INITIAL_LEADS;
  });
  const [leadSearch, setLeadSearch] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>('all');
  const [leadSourceFilter, setLeadSourceFilter] = useState<string>('all');
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [newLeadClient, setNewLeadClient] = useState('');
  const [newLeadMobile, setNewLeadMobile] = useState('');
  const [newLeadEmail, setNewLeadEmail] = useState('');
  const [newLeadEventType, setNewLeadEventType] = useState('Wedding');
  const [newLeadEventDate, setNewLeadEventDate] = useState('');
  const [newLeadBudget, setNewLeadBudget] = useState<number | ''>('');
  const [newLeadAdvance, setNewLeadAdvance] = useState<number | ''>('');
  const [newLeadStatus, setNewLeadStatus] = useState<LeadStatus>('new');
  const [newLeadSource, setNewLeadSource] = useState('Instagram');
  const [newLeadAssignedTo, setNewLeadAssignedTo] = useState('Ishita (Studio Manager)');
  const [newLeadNotes, setNewLeadNotes] = useState('');

  useEffect(() => {
    localStorage.setItem('wpp_owner_crm_leads', JSON.stringify(leads));
  }, [leads]);

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadClient.trim() || !newLeadMobile.trim()) return;
    const numBudget = Number(newLeadBudget) || 0;
    const numAdvance = Number(newLeadAdvance) || 0;
    const lead: OwnerLead = {
      id: `lead-${Date.now()}`,
      clientName: newLeadClient.trim(),
      mobile: newLeadMobile.trim(),
      email: newLeadEmail.trim() || undefined,
      eventType: newLeadEventType,
      eventDate: newLeadEventDate || undefined,
      budgetEstimate: numBudget,
      finalAmount: newLeadStatus === 'booked' ? numBudget : undefined,
      advanceReceived: newLeadStatus === 'booked' ? numAdvance : undefined,
      status: newLeadStatus,
      source: newLeadSource,
      assignedTo: newLeadAssignedTo.trim() || undefined,
      notes: newLeadNotes.trim() || undefined,
      createdDate: new Date().toISOString().split('T')[0],
    };
    setLeads([lead, ...leads]);
    setShowAddLeadModal(false);
    setNewLeadClient('');
    setNewLeadMobile('');
    setNewLeadEmail('');
    setNewLeadEventDate('');
    setNewLeadBudget('');
    setNewLeadAdvance('');
    setNewLeadAssignedTo('Ishita (Studio Manager)');
    setNewLeadNotes('');
  };

  const handleUpdateLeadStatus = (id: string, status: LeadStatus) => {
    setLeads(leads.map((l) => (l.id === id ? { ...l, status } : l)));
  };

  const handleUpdateLeadAssignedTo = (id: string, assignedTo: string) => {
    setLeads(leads.map((l) => (l.id === id ? { ...l, assignedTo } : l)));
  };

  const handleUpdateLeadNote = (id: string) => {
    const lead = leads.find((l) => l.id === id);
    if (!lead) return;
    const existingNote = lead.notes || '';
    const newNote = window.prompt(`Update Note for ${lead.clientName}:`, existingNote);
    if (newNote !== null) {
      setLeads(leads.map((l) => (l.id === id ? { ...l, notes: newNote.trim() || undefined } : l)));
    }
  };

  const [leadToDelete, setLeadToDelete] = useState<OwnerLead | null>(null);

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

  // ---------- 4. NOTEPAD STATE ----------
  const [isNotepadHidden, setIsNotepadHidden] = useState<boolean>(() => {
    try {
      return localStorage.getItem('wpp_owner_notepad_hidden') === 'true';
    } catch {
      return false;
    }
  });

  const toggleNotepadHide = () => {
    const next = !isNotepadHidden;
    setIsNotepadHidden(next);
    try {
      localStorage.setItem('wpp_owner_notepad_hidden', String(next));
    } catch (e) {
      console.error(e);
    }
  };

  const [notes, setNotes] = useState<OwnerNote[]>(() => {
    const saved = localStorage.getItem('wpp_owner_private_notes');
    return saved ? JSON.parse(saved) : INITIAL_NOTES;
  });
  const [activeNoteId, setActiveNoteId] = useState<string | null>(notes[0]?.id || null);
  const [noteTitleInput, setNoteTitleInput] = useState(notes[0]?.title || '');
  const [noteContentInput, setNoteContentInput] = useState(notes[0]?.content || '');
  const [noteSavedStatus, setNoteSavedStatus] = useState<string>('Saved');

  useEffect(() => {
    localStorage.setItem('wpp_owner_private_notes', JSON.stringify(notes));
  }, [notes]);

  const activeNote = notes.find((n) => n.id === activeNoteId);

  useEffect(() => {
    if (activeNote) {
      setNoteTitleInput(activeNote.title);
      setNoteContentInput(activeNote.content);
    }
  }, [activeNoteId]);

  const handleSaveActiveNote = () => {
    if (!activeNoteId) return;
    setNotes(
      notes.map((n) =>
        n.id === activeNoteId
          ? {
              ...n,
              title: noteTitleInput.trim() || 'Untitled Note',
              content: noteContentInput,
              updatedAt: new Date().toISOString(),
            }
          : n
      )
    );
    setNoteSavedStatus('Auto-saved just now');
    setTimeout(() => setNoteSavedStatus('Saved'), 2500);
  };

  const handleCreateNewNote = () => {
    const newNote: OwnerNote = {
      id: `note-${Date.now()}`,
      title: 'New Private Note',
      content: '',
      updatedAt: new Date().toISOString(),
      pinned: false,
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
    setNoteTitleInput(newNote.title);
    setNoteContentInput(newNote.content);
  };

  const handleDeleteNote = (id: string) => {
    const filtered = notes.filter((n) => n.id !== id);
    setNotes(filtered);
    if (activeNoteId === id) {
      setActiveNoteId(filtered[0]?.id || null);
    }
  };

  const [draggedNoteIndex, setDraggedNoteIndex] = useState<number | null>(null);

  const handleReorderNotes = (fromIndex: number, toIndex: number) => {
    setNotes((prevNotes) => {
      const updated = [...prevNotes];
      const [movedNote] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, movedNote);
      return updated;
    });
  };

  const handleTogglePinNote = (id: string) => {
    setNotes(
      notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    );
  };

  // Filtered lists
  const filteredTodos = todos.filter((t) => {
    if (todoFilter === 'pending') return !t.completed;
    if (todoFilter === 'completed') return t.completed;
    return true;
  });

  const filteredEquipment = equipmentList.filter((eq) => {
    const matchesSearch = eq.name.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
      (eq.serialNumber && eq.serialNumber.toLowerCase().includes(equipmentSearch.toLowerCase())) ||
      (eq.assignedToShoot && eq.assignedToShoot.toLowerCase().includes(equipmentSearch.toLowerCase()));
    const matchesCat = equipmentCategoryFilter === 'all' || eq.category === equipmentCategoryFilter;
    return matchesSearch && matchesCat;
  });

  const filteredLeads = leads.filter((l) => {
    const matchesSearch = l.clientName.toLowerCase().includes(leadSearch.toLowerCase()) ||
      l.mobile.includes(leadSearch) ||
      l.eventType.toLowerCase().includes(leadSearch.toLowerCase());
    const matchesStatus = leadStatusFilter === 'all' || l.status === leadStatusFilter;
    const matchesSource = leadSourceFilter === 'all' || l.source === leadSourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  });

  // Metric counts
  const totalLeadsCount = leads.length;
  const bookedLeadsCount = leads.filter((l) => l.status === 'booked').length;
  const activeLeadsCount = leads.filter((l) => l.status !== 'booked' && l.status !== 'lost').length;
  const totalLeadsRevenueEstimate = leads
    .filter((l) => l.status === 'booked' || l.status === 'quotation_sent')
    .reduce((sum, l) => sum + (l.budgetEstimate || 0), 0);

  const availableEqCount = equipmentList.filter((e) => e.status === 'available').length;
  const inUseEqCount = equipmentList.filter((e) => e.status === 'in_use').length;
  const maintenanceEqCount = equipmentList.filter((e) => e.status === 'maintenance').length;

  const pendingTodosCount = todos.filter((t) => !t.completed).length;

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER BANNER - EXCLUSIVE OWNER WORKSPACE */}
      <div className="owner-hero bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white border border-indigo-900/60 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <Crown className="w-3 h-3" /> OWNER EXCLUSIVE WORKSPACE
              </span>
              <span className="bg-slate-800/80 text-indigo-300 border border-slate-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-indigo-400" /> Private & Confidential
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Owner Strategic Command Desk</span>
            </h2>
            <p className="text-xs text-indigo-200/80 font-medium max-w-xl">
              Private executive control center for managing studio gear inventory, CRM client leads & quotation updates, personal task list, and studio memos.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="owner-metrics grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900/80 p-3 rounded-2xl border border-indigo-800/50 backdrop-blur-xs">
            <div className="p-2 text-center border-r border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Pending Tasks</span>
              <span className="text-lg font-black text-amber-400">{pendingTodosCount}</span>
            </div>
            <div className="p-2 text-center border-r border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Equipment</span>
              <span className="text-lg font-black text-emerald-400">{availableEqCount}/{equipmentList.length} Avail</span>
            </div>
            <div className="p-2 text-center border-r border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Active Leads</span>
              <span className="text-lg font-black text-blue-400">{activeLeadsCount}</span>
            </div>
            <div className="p-2 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Booked Deals</span>
              <span className="text-lg font-black text-indigo-300">₹ {(totalLeadsRevenueEstimate / 100000).toFixed(1)}L</span>
            </div>
          </div>
        </div>

        {/* SECTION FILTER BUTTONS */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveSection('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeSection === 'all'
                ? 'bg-indigo-600 text-white shadow-md font-extrabold'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>All Columns</span>
          </button>

          <button
            onClick={() => setActiveSection('todo')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeSection === 'todo'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>To-Do List Column ({pendingTodosCount})</span>
          </button>

          <button
            onClick={() => setActiveSection('equipment')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeSection === 'equipment'
                ? 'bg-indigo-600 text-white shadow-md font-extrabold'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>All Equipment ({equipmentList.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('notepad')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeSection === 'notepad'
                ? 'bg-purple-600 text-white shadow-md font-extrabold'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Notepad / Memos ({notes.length})</span>
          </button>
        </div>
      </div>

      {/* ==================== 1. TO-DO LIST COLUMN ==================== */}
      {(activeSection === 'all' || activeSection === 'todo') && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <span>To-Do List & Tasks</span>
                  <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 lowercase font-mono">
                    {pendingTodosCount} pending
                  </span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Private checklist for high-level manager duties, financial follow-ups, and studio tasks.
                </p>
              </div>
            </div>

            {/* Todo Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setTodoFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  todoFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({todos.length})
              </button>
              <button
                onClick={() => setTodoFilter('pending')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  todoFilter === 'pending' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pending ({pendingTodosCount})
              </button>
              <button
                onClick={() => setTodoFilter('completed')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  todoFilter === 'completed' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Completed ({todos.length - pendingTodosCount})
              </button>
            </div>
          </div>

          {/* Add Todo Input Form */}
          <form onSubmit={handleAddTodo} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center gap-2">
            <input
              type="text"
              value={newTodoTitle}
              onChange={(e) => setNewTodoTitle(e.target.value)}
              placeholder="Write new owner task here (e.g. Approve Raw Data HDD purchases, Client balances)..."
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />

            <select
              value={newTodoCategory}
              onChange={(e) => setNewTodoCategory(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 shrink-0"
            >
              <option value="General">General</option>
              <option value="Finance">Finance</option>
              <option value="Client Followup">Client Followup</option>
              <option value="Studio Gear">Studio Gear</option>
            </select>

            <select
              value={newTodoPriority}
              onChange={(e) => setNewTodoPriority(e.target.value as any)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 shrink-0"
            >
              <option value="high">🔴 High Priority</option>
              <option value="medium">🟡 Medium Priority</option>
              <option value="low">🟢 Low Priority</option>
            </select>

            <input
              type="date"
              value={newTodoDueDate}
              onChange={(e) => setNewTodoDueDate(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 shrink-0"
            />

            <button
              type="submit"
              className="w-full md:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition shrink-0 shadow-2xs"
            >
              <Plus className="w-4 h-4" /> Add Task
            </button>
          </form>

          {/* Todo List Items */}
          <div className="space-y-2">
            {filteredTodos.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No tasks match the selected filter.
              </p>
            ) : (
              filteredTodos.map((t) => (
                <div
                  key={t.id}
                  className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                    t.completed ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={t.completed}
                      onChange={() => handleToggleTodo(t.id)}
                      className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-500 cursor-pointer shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-black text-slate-900 ${t.completed ? 'line-through text-slate-400' : ''}`}>
                        {t.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          t.priority === 'high' ? 'bg-red-100 text-red-800' : t.priority === 'medium' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {t.priority} Priority
                        </span>

                        {t.category && (
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                            {t.category}
                          </span>
                        )}

                        {t.dueDate && (
                          <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" /> {t.dueDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteTodo(t.id)}
                    className="p-1.5 text-slate-300 hover:text-red-600 rounded-lg transition shrink-0"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {todos.some((t) => t.completed) && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleClearCompletedTodos}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                Clear completed tasks
              </button>
            </div>
          )}
        </div>
      )}

      {/* ==================== 2. ALL EQUIPMENT COLUMN ==================== */}
      {(activeSection === 'all' || activeSection === 'equipment') && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-indigo-100 text-indigo-800 rounded-xl">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <span>All Studio Equipment & Gear Inventory</span>
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 font-mono">
                    {equipmentList.length} Items Total
                  </span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Track camera bodies, lenses, drones, lighting & audio gear live status across wedding shoots.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAddEquipmentModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-2xs self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> Add New Equipment
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative sm:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={equipmentSearch}
                onChange={(e) => setEquipmentSearch(e.target.value)}
                placeholder="Search equipment name, serial number, assigned shoot or crew..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <select
              value={equipmentCategoryFilter}
              onChange={(e) => setEquipmentCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
            >
              <option value="all">📷 Filter Category: All ({equipmentList.length})</option>
              <option value="Cameras">Cameras</option>
              <option value="Lenses">Lenses</option>
              <option value="Drones">Drones</option>
              <option value="Lighting">Lighting</option>
              <option value="Audio">Audio</option>
              <option value="Gimbals & Stabilizers">Gimbals & Stabilizers</option>
            </select>
          </div>

          {/* Equipment Status Counts Pills */}
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
              ✓ Available: {availableEqCount}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-bold border border-amber-200">
              🎥 In Use / On Shoot: {inUseEqCount}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-red-100 text-red-800 font-bold border border-red-200">
              🛠️ Maintenance: {maintenanceEqCount}
            </span>
          </div>

          {/* Equipment Inventory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
            {filteredEquipment.length === 0 ? (
              <p className="col-span-full text-xs text-slate-400 italic text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                No studio gear matched your search criteria.
              </p>
            ) : (
              filteredEquipment.map((eq) => (
                <div key={eq.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative hover:border-indigo-300 transition shadow-2xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                        {eq.category}
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-sm">{eq.name}</h4>
                      {eq.serialNumber && (
                        <p className="text-[10px] font-mono text-slate-400">S/N: {eq.serialNumber}</p>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteEquipment(eq.id)}
                      className="p-1 text-slate-300 hover:text-red-600 rounded transition"
                      title="Delete equipment entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {eq.conditionNote && (
                    <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded-lg border border-slate-200">
                      "{eq.conditionNote}"
                    </p>
                  )}

                  {eq.assignedToShoot && (
                    <div className="text-[10px] text-slate-700 bg-indigo-50 p-2 rounded-lg border border-indigo-100 space-y-0.5">
                      <span className="font-bold text-indigo-900 block">Assigned Project:</span>
                      <span>{eq.assignedToShoot} {eq.assignedMember && `(${eq.assignedMember})`}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Live Status:</span>
                    <select
                      value={eq.status}
                      onChange={(e) => handleUpdateEquipmentStatus(eq.id, e.target.value as any)}
                      className={`text-[11px] font-black rounded-lg px-2.5 py-1 border shadow-2xs ${
                        eq.status === 'available'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : eq.status === 'in_use'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-red-100 text-red-800 border-red-300'
                      }`}
                    >
                      <option value="available">✓ Available</option>
                      <option value="in_use">🎥 In Use / On Shoot</option>
                      <option value="maintenance">🛠️ In Maintenance</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}



      {/* ==================== 4. NOTEPAD COLUMN ==================== */}
      {(activeSection === 'all' || activeSection === 'notepad') && (
        isNotepadHidden ? (
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between gap-3 transition-all">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-purple-100 text-purple-800 rounded-xl">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                  <span>Owner Private Notepad & Studio Scratchpad</span>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-mono">
                    {notes.length} {notes.length === 1 ? 'Note' : 'Notes'} Hidden
                  </span>
                </h4>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleNotepadHide}
              className="px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
            >
              <Eye className="w-4 h-4" /> Show Notepad
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-purple-100 text-purple-800 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <span>Owner Private Notepad & Studio Scratchpad</span>
                    <span className="text-xs font-bold text-slate-400 font-mono">
                      {noteSavedStatus}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Write down private studio thoughts, vendor pricing notes, ideas, and meeting scratchpad.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={toggleNotepadHide}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  title="Hide Notepad"
                >
                  <EyeOff className="w-4 h-4 text-slate-500" />
                  <span>Hide</span>
                </button>

                <button
                  onClick={handleCreateNewNote}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> + New Note
                </button>
              </div>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[350px]">
            {/* Note List Sidebar */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2 max-h-[420px] overflow-y-auto">
              <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Saved Private Notes ({notes.length})
                </span>
                <span className="text-[9px] font-extrabold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">
                  Drag ⋮⋮ to reorder
                </span>
              </div>

              {notes.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-6">No notes saved. Click + New Note above.</p>
              ) : (
                notes.map((n, idx) => (
                  <div
                    key={n.id}
                    draggable
                    onDragStart={(e) => {
                      setDraggedNoteIndex(idx);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedNoteIndex !== null && draggedNoteIndex !== idx) {
                        handleReorderNotes(draggedNoteIndex, idx);
                      }
                      setDraggedNoteIndex(null);
                    }}
                    onDragEnd={() => setDraggedNoteIndex(null)}
                    onClick={() => setActiveNoteId(n.id)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-start justify-between gap-2 ${
                      draggedNoteIndex === idx ? 'opacity-40 border-dashed border-purple-400 bg-purple-50' : ''
                    } ${
                      activeNoteId === n.id
                        ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-900 border-slate-200'
                    }`}
                  >
                    <div
                      className={`cursor-grab active:cursor-grabbing p-0.5 shrink-0 self-center ${
                        activeNoteId === n.id ? 'text-purple-200 hover:text-white' : 'text-slate-400 hover:text-purple-600'
                      }`}
                      title="Click and drag to reorder note"
                    >
                      <GripVertical className="w-3.5 h-3.5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        {n.pinned && <Pin className={`w-3 h-3 ${activeNoteId === n.id ? 'text-amber-300' : 'text-amber-500'}`} />}
                        <h5 className="font-extrabold text-xs truncate">{n.title || 'Untitled Note'}</h5>
                      </div>
                      <p className={`text-[10px] truncate mt-0.5 ${activeNoteId === n.id ? 'text-purple-100' : 'text-slate-500'}`}>
                        {n.content || 'Empty note content...'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePinNote(n.id);
                        }}
                        className={`p-1 rounded ${activeNoteId === n.id ? 'hover:bg-purple-700 text-purple-200' : 'hover:bg-slate-200 text-slate-400'}`}
                        title="Pin Note"
                      >
                        <Pin className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(n.id);
                        }}
                        className={`p-1 rounded ${activeNoteId === n.id ? 'hover:bg-purple-700 text-purple-200' : 'hover:bg-slate-200 text-slate-400'}`}
                        title="Delete Note"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Editor Area */}
            <div className="md:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col space-y-3">
              {activeNoteId ? (
                <>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={noteTitleInput}
                      onChange={(e) => setNoteTitleInput(e.target.value)}
                      onBlur={handleSaveActiveNote}
                      placeholder="Note Title..."
                      className="w-full text-base font-black text-slate-900 bg-white border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      onClick={handleSaveActiveNote}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shrink-0 shadow-2xs"
                    >
                      Save
                    </button>
                  </div>

                  <textarea
                    value={noteContentInput}
                    onChange={(e) => setNoteContentInput(e.target.value)}
                    onBlur={handleSaveActiveNote}
                    placeholder="Write down studio strategy, gear vendor notes, pricing thoughts..."
                    className="w-full flex-1 min-h-[260px] bg-white border border-slate-300 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed font-mono"
                  />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12 text-xs">
                  <FileText className="w-8 h-8 mb-2 text-slate-300" />
                  <p>Select a note from left or click "+ New Note" to start writing.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    )}

      {/* ==================== MODAL: ADD EQUIPMENT ==================== */}
      {showAddEquipmentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Camera className="w-5 h-5 text-indigo-600" />
                <span>Add New Studio Equipment</span>
              </h4>
              <button onClick={() => setShowAddEquipmentModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEquipment} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Equipment Name *</label>
                <input
                  type="text"
                  required
                  value={newEqName}
                  onChange={(e) => setNewEqName(e.target.value)}
                  placeholder="e.g. Sony FX30 / Aputure 600d Pro"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={newEqCategory}
                    onChange={(e) => setNewEqCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                  >
                    <option value="Cameras">Cameras</option>
                    <option value="Lenses">Lenses</option>
                    <option value="Drones">Drones</option>
                    <option value="Lighting">Lighting</option>
                    <option value="Audio">Audio</option>
                    <option value="Gimbals & Stabilizers">Gimbals & Stabilizers</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status</label>
                  <select
                    value={newEqStatus}
                    onChange={(e) => setNewEqStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                  >
                    <option value="available">✓ Available</option>
                    <option value="in_use">🎥 In Use / On Shoot</option>
                    <option value="maintenance">🛠️ Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Serial Number (Optional)</label>
                <input
                  type="text"
                  value={newEqSerial}
                  onChange={(e) => setNewEqSerial(e.target.value)}
                  placeholder="e.g. #SN-882103"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Condition Notes / Memo</label>
                <textarea
                  value={newEqNote}
                  onChange={(e) => setNewEqNote(e.target.value)}
                  placeholder="e.g. Includes 2 batteries, dual charger..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900 min-h-[60px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddEquipmentModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 shadow-xs"
                >
                  Save Equipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: ADD LEAD ==================== */}
      {showAddLeadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-600" />
                <span>Add New Client Lead / Inquiry</span>
              </h4>
              <button onClick={() => setShowAddLeadModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddLead} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Client / Couple Name *</label>
                  <input
                    type="text"
                    required
                    value={newLeadClient}
                    onChange={(e) => setNewLeadClient(e.target.value)}
                    placeholder="e.g. Rohan & Ananya Wedding"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contact Mobile *</label>
                  <input
                    type="text"
                    required
                    value={newLeadMobile}
                    onChange={(e) => setNewLeadMobile(e.target.value)}
                    placeholder="e.g. +91 9812345678"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Event Type</label>
                  <input
                    type="text"
                    value={newLeadEventType}
                    onChange={(e) => setNewLeadEventType(e.target.value)}
                    placeholder="e.g. Destination Wedding / Pre-Wedding"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Event Date (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 18 Nov 2026 or Winter 2026"
                    value={newLeadEventDate}
                    onChange={(e) => setNewLeadEventDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Budget Est. (₹)</label>
                  <input
                    type="number"
                    value={newLeadBudget}
                    onChange={(e) => setNewLeadBudget(Number(e.target.value))}
                    placeholder="e.g. 250000"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status</label>
                  <select
                    value={newLeadStatus}
                    onChange={(e) => setNewLeadStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 cursor-pointer"
                  >
                    <option value="new">🆕 New Inquiry</option>
                    <option value="contacted">📞 Contacted</option>
                    <option value="meeting_fixed">📅 Meeting Fixed</option>
                    <option value="quotation_sent">📄 Quotation Sent</option>
                    <option value="booked">✓ Booked Deal</option>
                  </select>
                </div>

                {newLeadStatus === 'booked' && (
                  <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-emerald-50 border border-emerald-300 rounded-xl p-3">
                    <div className="space-y-1">
                      <label className="font-extrabold text-emerald-900 text-xs flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Finalized Deal Amount (₹)</span>
                      </label>
                      <p className="text-[11px] text-emerald-700 font-medium">
                        Set total package amount in Budget Est. field above.
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="font-extrabold text-emerald-900 text-xs flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                        <span>Advance Amount Recd. (₹)</span>
                      </label>
                      <input
                        type="number"
                        value={newLeadAdvance}
                        onChange={(e) => setNewLeadAdvance(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="e.g. 50000"
                        className="w-full bg-white border border-emerald-300 rounded-lg p-2 text-xs font-mono font-extrabold text-slate-900 focus:outline-emerald-600"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Lead Source</label>
                  <select
                    value={newLeadSource}
                    onChange={(e) => setNewLeadSource(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="Meta Ads">Meta Ads (Facebook / Insta)</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="Reference / Word of Mouth">Reference</option>
                    <option value="Website">Website</option>
                    <option value="Walk-in">Walk-in</option>
                    <option value="Google Search">Google Search</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Assign Lead To (Sales / Studio Staff)</label>
                <select
                  value={newLeadAssignedTo}
                  onChange={(e) => setNewLeadAssignedTo(e.target.value)}
                  className="w-full bg-indigo-50/50 border border-indigo-200 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer text-xs"
                >
                  <option value="">-- Select Sales / Staff Member --</option>
                  {SALES_TEAM_OPTIONS.map((member) => (
                    <option key={member} value={member}>
                      {member}
                    </option>
                  ))}
                  {newLeadAssignedTo && !SALES_TEAM_OPTIONS.includes(newLeadAssignedTo) && (
                    <option value={newLeadAssignedTo}>{newLeadAssignedTo}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Inquiry Notes / Scope</label>
                <textarea
                  value={newLeadNotes}
                  onChange={(e) => setNewLeadNotes(e.target.value)}
                  placeholder="e.g. Looking for 2 day shoot in Delhi with drone & cinematic teaser..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900 min-h-[60px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddLeadModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 shadow-xs"
                >
                  Save Client Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Lead Confirmation Modal */}
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
    </div>
  );
};
