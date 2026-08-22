import React, { useEffect, useRef, useState } from 'react';
import { Project, ServiceType, ProjectStatus, VideoPipeline, PhotoPipeline, ShootEvent, ProjectTask, EditingStatus, TeamMember, ClientVaultDocument, CrewMemberAssignment } from '@/types';
import { computeAutoProjectStatus } from '@/utils/projectStatusCalculator';
import { RoleColumnCrewManager } from './RoleColumnCrewManager';
import { ConfirmDeleteModal } from '@/components/common/ConfirmDeleteModal';
import { useToast } from '@/components/common';
import { ArrowLeft, ArrowRight, X, Save, IndianRupee, Phone, MapPin, Music, Link2, Calendar, Sparkles, Plus, Trash2, Camera, CheckSquare, UserCheck, Folder, Upload, FileText, Eye, Paperclip, Users, UserPlus } from 'lucide-react';

interface ProjectFormModalProps {
  isOpen: boolean;
  variant?: 'modal' | 'page';
  onClose: () => void;
  onSave: (project: Project) => void;
  existingProject?: Project | null;
  team?: TeamMember[];
}

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  variant = 'modal',
  onClose,
  onSave,
  existingProject,
  team = [],
}) => {
  if (!isOpen) return null;
  const { showToast } = useToast();

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

  // Form State initialized with defaults or existing values
  const [clientWeddingTitle, setClientWeddingTitle] = useState(existingProject?.clientWeddingTitle || '');
  const [clientContactMobile, setClientContactMobile] = useState(existingProject?.clientContactMobile || '');
  const [venueLocation, setVenueLocation] = useState(existingProject?.venueLocation || '');

  const STANDARD_SERVICES = [
    'Complete Wedding Services',
    'Wedding',
    'Pre Wedding',
    'Engagement',
    'Roka',
    'Haldi & Mehendi',
    'Sangeet',
    'Reception',
  ];

  const initialService = existingProject?.primaryServiceType || 'Complete Wedding Services';
  const isStandardService = STANDARD_SERVICES.includes(initialService);

  const [selectedService, setSelectedService] = useState<string>(
    isStandardService ? initialService : 'Other'
  );
  const [customServiceType, setCustomServiceType] = useState<string>(
    isStandardService ? '' : (initialService === 'Other' ? '' : initialService)
  );

  const [weddingFunctionDates, setWeddingFunctionDates] = useState(existingProject?.weddingFunctionDates || '');
  const [finalDeliveryDeadline, setFinalDeliveryDeadline] = useState(existingProject?.finalDeliveryDeadline || '');
  const [totalBudget, setTotalBudget] = useState<number>(existingProject?.totalBudget || 0);
  const [advanceReceived, setAdvanceReceived] = useState<number>(existingProject?.advanceReceived || 0);
  const [quotationLink, setQuotationLink] = useState(existingProject?.quotationLink || '');
  const [specialNotesMusicPreferences, setSpecialNotesMusicPreferences] = useState(existingProject?.specialNotesMusicPreferences || '');
  const [status, setStatus] = useState<ProjectStatus>(existingProject?.status || 'new_project');
  const [activeStep, setActiveStep] = useState(1);
  const stepContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    stepContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeStep]);

  // Internal Client Vault Documents (PDF & Payment Slips Folder)
  const [vaultDocuments, setVaultDocuments] = useState<ClientVaultDocument[]>(() => {
    if (existingProject?.clientVaultDocuments && existingProject.clientVaultDocuments.length > 0) {
      return existingProject.clientVaultDocuments;
    }
    if (existingProject?.quotationLink) {
      return [
        {
          id: `doc-${Date.now()}`,
          name: 'Client Quotation PDF',
          category: 'Quotation PDF',
          fileUrl: existingProject.quotationLink,
          fileType: 'pdf',
          uploadDate: existingProject.createdAt || new Date().toISOString().split('T')[0],
        }
      ];
    }
    return [];
  });

  const [docCategory, setDocCategory] = useState<'Quotation PDF' | 'Payment Slip' | 'Contract / Agreement' | 'Client ID Proof' | 'Other PDF / Doc'>('Quotation PDF');
  const [docUrlInput, setDocUrlInput] = useState('');

  const handleFormFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showToast('File size must be under 10MB.', { variant: 'error' });
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
          name: file.name,
          category: docCategory,
          fileUrl: reader.result,
          fileType,
          uploadDate: new Date().toISOString().split('T')[0],
          fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        };
        setVaultDocuments((prev) => [...prev, newDoc]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddDocUrl = () => {
    if (!docUrlInput.trim()) return;
    const isPdf = docUrlInput.toLowerCase().includes('.pdf');
    const newDoc: ClientVaultDocument = {
      id: `vault-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: docCategory,
      category: docCategory,
      fileUrl: docUrlInput.trim(),
      fileType: isPdf ? 'pdf' : 'doc',
      uploadDate: new Date().toISOString().split('T')[0],
    };
    setVaultDocuments((prev) => [...prev, newDoc]);
    setDocUrlInput('');
  };

  const handleRemoveVaultDoc = (id: string) => {
    setVaultDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  // Shoots State (Dynamic Add & Remove)
  const [shoots, setShoots] = useState<ShootEvent[]>(
    existingProject?.shoots && existingProject.shoots.length > 0 
      ? existingProject.shoots 
      : [
          {
            id: `shoot-${Date.now()}-1`,
            title: 'Main Wedding Shoot',
            date: existingProject?.weddingFunctionDates || '',
            time: '06:00 PM',
            venue: existingProject?.venueLocation || '',
            location: '',
            leadPhotographer: 'Rajat Verma',
            cinematographer: 'Vikram Sharma',
            droneOperator: 'Rahul Kumar',
            assistant: 'Amit Singh',
            crewAssignments: [
              { id: `c-${Date.now()}-1`, name: 'Rajat Verma', role: 'Photographer', mobile: '' },
              { id: `c-${Date.now()}-2`, name: 'Vikram Sharma', role: 'Videographer', mobile: '' },
              { id: `c-${Date.now()}-3`, name: 'Amit Singh', role: 'Assistant', mobile: '' }
            ],
            equipmentChecklist: [],
            status: 'scheduled',
          }
        ]
  );

  const handleAddShoot = () => {
    setShoots([
      ...shoots,
      {
        id: `shoot-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        title: '',
        date: weddingFunctionDates || new Date().toISOString().split('T')[0],
        time: '10:00 AM',
        venue: venueLocation || '',
        location: '',
        leadPhotographer: '',
        cinematographer: '',
        droneOperator: '',
        assistant: '',
        crewAssignments: [
          { id: `c-${Date.now()}-1`, name: '', role: 'Photographer', mobile: '' },
          { id: `c-${Date.now()}-2`, name: '', role: 'Videographer', mobile: '' },
          { id: `c-${Date.now()}-3`, name: '', role: 'Assistant', mobile: '' }
        ],
        equipmentChecklist: [],
        status: 'scheduled',
      }
    ]);
  };

  const [deleteShootModalConfig, setDeleteShootModalConfig] = useState<{
    isOpen: boolean;
    itemTitle: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    itemTitle: '',
    onConfirm: () => {},
  });

  const handleRemoveShoot = (index: number) => {
    const shoot = shoots[index];
    setDeleteShootModalConfig({
      isOpen: true,
      itemTitle: shoot?.title || `Shoot Event #${index + 1}`,
      onConfirm: () => {
        setShoots((prev) => prev.filter((_, i) => i !== index));
        setDeleteShootModalConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const syncShootCrewRoles = (shoot: ShootEvent): ShootEvent => {
    const crew = shoot.crewAssignments || [];
    const photo = crew.find((c) => c.role?.toLowerCase().includes('photo') && c.name?.trim());
    const video = crew.find((c) => (c.role?.toLowerCase().includes('video') || c.role?.toLowerCase().includes('cinema')) && c.name?.trim());
    const drone = crew.find((c) => c.role?.toLowerCase().includes('drone') && c.name?.trim());
    const assist = crew.find((c) => c.role?.toLowerCase().includes('assist') && c.name?.trim());

    return {
      ...shoot,
      leadPhotographer: photo?.name || shoot.leadPhotographer || '',
      cinematographer: video?.name || shoot.cinematographer || '',
      droneOperator: drone?.name || shoot.droneOperator || '',
      assistant: assist?.name || shoot.assistant || '',
    };
  };

  const handleShootChange = (index: number, field: keyof ShootEvent, value: any) => {
    const updated = [...shoots];
    updated[index] = syncShootCrewRoles({ ...updated[index], [field]: value });
    setShoots(updated);
  };

  const handleAddRoleQuantityToFormShoot = (shootIndex: number, role: string, quantity: number) => {
    if (quantity <= 0) return;
    const newItems: CrewMemberAssignment[] = Array.from({ length: quantity }).map((_, i) => ({
      id: `crew-${Date.now()}-${Math.random().toString(36).substr(2, 5)}-${i}`,
      name: '',
      role: role as any,
      mobile: '',
    }));
    const updated = [...shoots];
    const currentCrew = updated[shootIndex].crewAssignments || [];
    updated[shootIndex] = syncShootCrewRoles({
      ...updated[shootIndex],
      crewAssignments: [...currentCrew, ...newItems]
    });
    setShoots(updated);
  };

  const handleRemoveRoleFromFormShoot = (shootIndex: number, role: string) => {
    const updated = [...shoots];
    const currentCrew = updated[shootIndex].crewAssignments || [];
    updated[shootIndex] = syncShootCrewRoles({
      ...updated[shootIndex],
      crewAssignments: currentCrew.filter((c) => c.role !== role)
    });
    setShoots(updated);
  };

  const handleUpdateCrewByCrewId = (shootIndex: number, crewId: string, field: string, value: string) => {
    const updated = [...shoots];
    const currentCrew = (updated[shootIndex].crewAssignments || []).map((c) =>
      c.id === crewId ? { ...c, [field]: value } : c
    );
    updated[shootIndex] = syncShootCrewRoles({ ...updated[shootIndex], crewAssignments: currentCrew });
    setShoots(updated);
  };

  const handleRemoveCrewByCrewId = (shootIndex: number, crewId: string) => {
    const updated = [...shoots];
    const currentCrew = updated[shootIndex].crewAssignments || [];
    updated[shootIndex] = syncShootCrewRoles({
      ...updated[shootIndex],
      crewAssignments: currentCrew.filter((c) => c.id !== crewId)
    });
    setShoots(updated);
  };

  const handleAddCrewToShoot = (shootIndex: number) => {
    const updated = [...shoots];
    const currentCrew = updated[shootIndex].crewAssignments || [];
    updated[shootIndex] = {
      ...updated[shootIndex],
      crewAssignments: [
        ...currentCrew,
        {
          id: `crew-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: '',
          role: 'Photographer',
          mobile: '',
        }
      ]
    };
    setShoots(updated);
  };

  const handleRemoveCrewFromShoot = (shootIndex: number, crewIndex: number) => {
    const updated = [...shoots];
    const currentCrew = updated[shootIndex].crewAssignments || [];
    updated[shootIndex] = {
      ...updated[shootIndex],
      crewAssignments: currentCrew.filter((_, i) => i !== crewIndex)
    };
    setShoots(updated);
  };

  const handleCrewChange = (shootIndex: number, crewIndex: number, field: string, value: string) => {
    const updated = [...shoots];
    const currentCrew = [...(updated[shootIndex].crewAssignments || [])];
    currentCrew[crewIndex] = { ...currentCrew[crewIndex], [field]: value };
    updated[shootIndex] = { ...updated[shootIndex], crewAssignments: currentCrew };
    setShoots(updated);
  };

  // Tasks & Deliverables State (har task mai kitne bane aur kon Assigned hai)
  const [tasks, setTasks] = useState<ProjectTask[]>(
    existingProject?.tasks && existingProject.tasks.length > 0
      ? existingProject.tasks
      : [
          {
            id: `task-${Date.now()}-1`,
            taskName: 'Cinematic Teaser Video (1-2 Min)',
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
    setTasks([
      ...tasks,
      {
        id: `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        taskName: '',
        quantity: 1,
        unit: 'Pcs',
        assignedTo: 'Unassigned',
        status: 'not_started',
      }
    ]);
  };

  const handleRemoveTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleTaskChange = (index: number, field: keyof ProjectTask, value: any) => {
    const updated = [...tasks];
    updated[index] = { ...updated[index], [field]: value };
    setTasks(updated);
  };

  // Video Pipeline state
  const [videoPipeline, setVideoPipeline] = useState<VideoPipeline>(existingProject?.videoPipeline || {
    preWeddingVideo: 'not_started',
    longVideo: 'not_started',
    teaser: 'not_started',
    highlights: 'not_started',
    reels: 'not_started',
    otherVideo: '',
    assignedEditor: 'Vikram Sharma',
    notes: '',
  });

  // Photo Pipeline state
  const [photoPipeline, setPhotoPipeline] = useState<PhotoPipeline>(existingProject?.photoPipeline || {
    preWeddingPhotos: 'not_started',
    cullingSelection: 'not_started',
    colorGradingRetouching: 'not_started',
    albumDesigning: 'not_started',
    albumPrinting: 'not_sent',
    otherPhoto: '',
    assignedEditor: 'Pooja Verma',
    notes: '',
  });

  // Balance due calculation
  const balanceDue = Math.max(0, totalBudget - advanceReceived);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientWeddingTitle.trim()) {
      showToast('Please enter the Client / Wedding Title.', { variant: 'error' });
      return;
    }

    const resolvedServiceType = selectedService === 'Other'
      ? (customServiceType.trim() || 'Other')
      : selectedService;

    const computedWeddingDates = shoots.map(s => s.date).filter(Boolean).join(', ') || weddingFunctionDates || '';

    const newProject: Project = {
      id: existingProject ? existingProject.id : `proj-${Date.now()}`,
      clientWeddingTitle,
      clientContactMobile,
      venueLocation,
      primaryServiceType: resolvedServiceType as ServiceType,
      weddingFunctionDates: computedWeddingDates,
      finalDeliveryDeadline,
      totalBudget: Number(totalBudget),
      advanceReceived: Number(advanceReceived),
      balanceDue,
      quotationLink,
      clientVaultDocuments: vaultDocuments,
      specialNotesMusicPreferences,
      status,
      createdAt: existingProject ? existingProject.createdAt : new Date().toISOString().split('T')[0],
      tasks,
      videoPipeline,
      photoPipeline,
      shoots: shoots,
      dataBackup: existingProject ? existingProject.dataBackup : {
        offloadedFromCards: false,
        hardDrive1: 'Pending Shoot',
        hardDrive1Done: false,
        hardDrive2: 'Pending Shoot',
        hardDrive2Done: false,
        cloudBackupDone: false,
        totalDataSizeGB: 0,
        rawCleanupStatus: 'raw_kept',
      },
      payments: existingProject ? existingProject.payments : [
        {
          id: `pay-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          amount: Number(advanceReceived),
          type: 'advance',
          paymentMode: 'UPI / GPay',
          receiptNumber: `WPP-REC-${Math.floor(1000 + Math.random() * 9000)}`,
          notes: 'Advance booking amount',
        }
      ],
      deliveryStatus: existingProject ? existingProject.deliveryStatus : {
        rawHandoverDone: false,
        teaserLinkSent: false,
        fullFilmSent: false,
        reelsSent: false,
        highResPhotosSent: false,
        albumPrintedAndDelivered: false,
      },
    };

    const autoWork = computeAutoProjectStatus(newProject);
    newProject.status = autoWork.autoStatus;

    onSave(newProject);
    showToast(existingProject ? 'Project updated successfully.' : 'Project created successfully.');
    onClose();
  };

  return (
    <div className={variant === 'page' ? 'w-full' : 'fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#24171c]/75 p-3 backdrop-blur-sm sm:p-6'}>
      <div className={`project-form-shell ${variant === 'page' ? 'mx-auto flex h-[calc(100vh-9rem)] min-h-[720px] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-[#dfd9d2] bg-white shadow-[0_18px_50px_rgba(48,31,38,.1)]' : 'my-4 flex h-[90vh] min-h-[680px] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-white/50 bg-white shadow-[0_30px_90px_rgba(26,13,19,.42)]'}`}>
        
        {/* Modal Header */}
        <div className="relative sticky top-0 z-20 flex items-center justify-between overflow-hidden bg-[radial-gradient(circle_at_86%_10%,rgba(236,190,169,.24),transparent_32%),linear-gradient(125deg,#704758,#55333f_52%,#38262d)] px-5 py-5 text-white sm:px-7 sm:py-6">
          <div className="absolute -bottom-14 -right-8 size-44 rounded-full border-[24px] border-white/5" />
          <div className="relative flex items-center gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl border border-white/30 bg-white/15 shadow-inner"><Folder className="size-7 text-[#f6d9ca]" /></span>
            <div><p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[.18em] text-[#ecc8d3]"><Sparkles className="size-3.5"/>Project Journey Intake</p><h3 className="mt-1 text-xl font-black sm:text-2xl">{existingProject ? 'Edit Client Wedding Project' : 'Add New Client Project'}</h3><p className="mt-1 text-sm text-[#eadfe2]">Follow the sections below: client → shoots → money → documents → tasks.</p></div>
          </div>
          <button type="button" onClick={onClose} className="relative flex shrink-0 items-center gap-2 rounded-xl border border-white/20 bg-black/15 px-3 py-2.5 text-sm font-bold text-white/90 transition hover:bg-white/15 hover:text-white">
            {variant === 'page' ? <><ArrowLeft className="size-5"/><span className="hidden sm:inline">Back to Projects</span></> : <X className="size-5"/>}
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="project-guided-form flex min-h-0 flex-1 flex-col overflow-hidden p-5 pb-0 text-xs sm:p-7 sm:pb-0">
          <div ref={stepContentRef} className="min-h-0 flex-1 space-y-6 overflow-y-auto px-1 pb-8 pr-2">
          <div className="grid gap-2 rounded-2xl border border-rose-100 bg-rose-50/60 p-3 sm:grid-cols-5">
            {['Client info','Shoot plan','Budget','Documents','Tasks'].map((step, index) => <button type="button" key={step} onClick={() => setActiveStep(index + 1)} className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs font-black uppercase tracking-wide transition ${activeStep === index + 1 ? 'bg-[#6d2f45] text-white shadow-md' : index + 1 < activeStep ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'bg-white text-[#6d2f45] shadow-sm hover:bg-rose-50'}`}><span className={`grid size-6 place-items-center rounded-full text-[10px] ${activeStep === index + 1 ? 'bg-white/15' : 'bg-current/10'}`}>{index + 1}</span><span className="hidden lg:inline">{step}</span></button>)}
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-[#eadfd9] bg-[#fbfaf8] px-4 py-3"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#9b4865]">Step {activeStep} of 5</p><h4 className="mt-1 !text-base !normal-case !tracking-normal">{['Client & project basics','Shoot schedule & crew','Budget & payment plan','Client files & preferences','Tasks & deliverables'][activeStep - 1]}</h4></div><span className="text-xs font-bold text-slate-500">{Math.round(activeStep / 5 * 100)}% setup</span></div>
          
          {/* Section 1: Core Client Project Information (Required fields 01, 02, 03) */}
          <div className="space-y-3">
            <h4 className={`${activeStep === 1 ? 'flex' : 'hidden'} text-xs font-bold text-indigo-600 uppercase tracking-wider items-center gap-1.5`}>
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              01 · Client Project Info
            </h4>

            <div className={`${activeStep === 1 ? 'grid' : 'hidden'} grid-cols-1 md:grid-cols-3 gap-4`}>
              
              {/* 01 Client / Wedding Title */}
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  01 Client / Wedding Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram & Meera Royal Wedding"
                  value={clientWeddingTitle}
                  onChange={(e) => setClientWeddingTitle(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>

              {/* 02 Client Contact / Mobile */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-indigo-600" />
                  02 Contact / Mobile
                </label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={clientContactMobile}
                  onChange={(e) => setClientContactMobile(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>

            </div>

            <div className={`${activeStep === 1 ? 'grid' : 'hidden'} grid-cols-1 md:grid-cols-2 gap-4`}>
              
              {/* 03 Venue / Location */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-indigo-600" />
                  03 Venue / Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. The Taj Palace, New Delhi"
                  value={venueLocation}
                  onChange={(e) => setVenueLocation(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>

              {/* Primary Service Type */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Primary Service Type
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => {
                    setSelectedService(e.target.value);
                    if (e.target.value !== 'Other') {
                      setCustomServiceType('');
                    }
                  }}
                  className="w-full bg-white border border-slate-200 rounded px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition font-medium"
                >
                  <option value="Complete Wedding Services">Complete Wedding Services</option>
                  <option value="Wedding">Wedding</option>
                  <option value="Pre Wedding">Pre Wedding</option>
                  <option value="Engagement">Engagement</option>
                  <option value="Roka">Roka</option>
                  <option value="Haldi & Mehendi">Haldi & Mehendi</option>
                  <option value="Sangeet">Sangeet</option>
                  <option value="Reception">Reception</option>
                  <option value="Other">Other</option>
                </select>

                {selectedService === 'Other' && (
                  <div className="mt-1.5">
                    <input
                      type="text"
                      required
                      placeholder="Type custom service name (e.g. Birthday / Maternity / Fashion Shoot)..."
                      value={customServiceType}
                      onChange={(e) => setCustomServiceType(e.target.value)}
                      className="w-full bg-amber-50 border border-amber-300 rounded px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 transition text-xs font-bold placeholder-slate-400"
                    />
                  </div>
                )}
              </div>

            </div>

            <div className="space-y-3">
              
              {/* Dynamic Shoot Details Section (Before Final Delivery Deadline) */}
              <div className={`${activeStep === 2 ? 'block' : 'hidden'} p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4`}>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-indigo-600" />
                    02 · Shoot Plan & Crew
                  </label>
                  <button
                    type="button"
                    onClick={handleAddShoot}
                    className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] uppercase tracking-wider transition flex items-center gap-1 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Add Shoot</span>
                  </button>
                </div>

                {shoots.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">No shoot details added. Click "+ Add Shoot" to add function shoots.</p>
                ) : (
                  <div className="space-y-2.5">
                    {shoots.map((shoot, index) => (
                      <div key={shoot.id || index} className="p-2.5 bg-white border border-slate-200 rounded-md space-y-2 relative shadow-xs">
                        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                            Shoot #{index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveShoot(index)}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition flex items-center gap-1 text-[10px] font-bold"
                            title="Remove Shoot"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            <span>- Remove</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Shoot Title / Function</label>
                            <input
                              type="text"
                              placeholder="e.g. Ring Ceremony & Sangeet"
                              value={shoot.title}
                              onChange={(e) => handleShootChange(index, 'title', e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Function Date</label>
                            <input
                              type="date"
                              value={shoot.date}
                              onChange={(e) => handleShootChange(index, 'date', e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Start Time</label>
                            <input
                              type="time"
                              value={shoot.startTime || ''}
                              onChange={(e) => handleShootChange(index, 'startTime', e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">End Time</label>
                            <input
                              type="time"
                              value={shoot.endTime || ''}
                              onChange={(e) => handleShootChange(index, 'endTime', e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Venue / Location</label>
                            <input
                              type="text"
                              placeholder="e.g. Grand Ballroom, Udaivilas"
                              value={shoot.venue}
                              onChange={(e) => handleShootChange(index, 'venue', e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                            />
                          </div>
                        </div>

                        {/* Event Crew / Team Assignment with Role Columns */}
                        <div className="mt-2 pt-2 border-t border-slate-100">
                          <RoleColumnCrewManager
                            crewAssignments={shoot.crewAssignments || []}
                            activeTeamMembers={activeTeamMembers}
                            onAddRoleQuantity={(role, qty) => handleAddRoleQuantityToFormShoot(index, role, qty)}
                            onRemoveRoleColumn={(role) => handleRemoveRoleFromFormShoot(index, role)}
                            onUpdateMember={(crewId, field, value) => handleUpdateCrewByCrewId(index, crewId, field, value)}
                            onRemoveMember={(crewId) => handleRemoveCrewByCrewId(index, crewId)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Final Delivery Deadline */}
              <div className={activeStep === 2 ? 'block' : 'hidden'}>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-indigo-600" />
                  Final Delivery Deadline
                </label>
                <input
                  type="date"
                  value={finalDeliveryDeadline}
                  onChange={(e) => setFinalDeliveryDeadline(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>

            </div>
          </div>

          {/* Section 2: Financials & Budget (Total Budget, Advance Received, Balance Due) */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h4 className={`${activeStep === 3 ? 'flex' : 'hidden'} text-xs font-bold text-indigo-600 uppercase tracking-wider items-center gap-1.5`}>
              <IndianRupee className="w-3.5 h-3.5 text-indigo-600" />
              03 · Budget & Payments
            </h4>

            <div className={`${activeStep === 3 ? 'grid' : 'hidden'} grid-cols-1 sm:grid-cols-3 gap-4`}>
              
              {/* Total Budget */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Total Budget (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="e.g. 350000"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>

              {/* Advance Received */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Advance Received (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="e.g. 100000"
                  value={advanceReceived}
                  onChange={(e) => setAdvanceReceived(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>

              {/* Balance Due (auto) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Balance Due (₹) <span className="text-slate-400 font-normal">(Auto)</span>
                </label>
                <div className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-red-600 font-bold text-xs">
                  ₹{balanceDue.toLocaleString('en-IN')}
                </div>
              </div>

            </div>

            {/* Client Folder / Documents & Payment Slips Vault */}
            <div className={`${activeStep === 4 ? 'block' : 'hidden'} p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4`}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Folder className="w-4 h-4 text-indigo-600" />
                  04 · Client Documents (PDFs & Payment Slips)
                </label>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                  {vaultDocuments.length} Document(s)
                </span>
              </div>

              {/* Upload Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Category</label>
                  <select
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-slate-800 text-xs font-medium"
                  >
                    <option value="Quotation PDF">Quotation PDF</option>
                    <option value="Payment Slip">Payment Slip</option>
                    <option value="Contract / Agreement">Contract / Agreement</option>
                    <option value="Client ID Proof">Client ID Proof</option>
                    <option value="Other PDF / Doc">Other PDF / Doc</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Upload File / PDF Attachment</label>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer flex-1 bg-white border border-dashed border-indigo-300 hover:border-indigo-500 rounded px-3 py-1.5 text-center text-indigo-600 hover:bg-indigo-50 transition flex items-center justify-center gap-1.5 font-bold text-xs shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload PDF or Slip Image</span>
                      <input
                        type="file"
                        accept="application/pdf,image/*"
                        onChange={handleFormFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Attached Files List */}
              {vaultDocuments.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Uploaded Client Files:</span>
                  <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto pr-1">
                    {vaultDocuments.map((doc) => (
                      <div key={doc.id} className="p-2 bg-white border border-slate-200 rounded-lg flex items-center justify-between text-xs shadow-2xs">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                          <div className="truncate">
                            <span className="font-bold text-slate-800 text-xs truncate block">{doc.name}</span>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                              <span className="bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.2 rounded border border-indigo-100">{doc.category}</span>
                              <span>• {doc.uploadDate}</span>
                              {doc.fileSize && <span>• {doc.fileSize}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
                            title="View File"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleRemoveVaultDoc(doc.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Special Client Notes / Music Preferences */}
            <div className={activeStep === 4 ? 'block' : 'hidden'}>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                <Music className="w-3 h-3 text-indigo-600" />
                Special Client Notes / Music Preferences
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Romantic Lofi Bollywood for teaser, energetic Punjabi beats for Reels, couple wants no flash during rituals."
                value={specialNotesMusicPreferences}
                onChange={(e) => setSpecialNotesMusicPreferences(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          {/* Section 3: Tasks & Deliverables Assignment */}
          <div className={`${activeStep === 5 ? 'block' : 'hidden'} space-y-4 pt-3 border-t border-slate-200`}>
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                05 · Tasks & Deliverables
              </h4>
              <button
                type="button"
                onClick={handleAddTask}
                className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] uppercase tracking-wider transition flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Add Task</span>
              </button>
            </div>

            {tasks.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic">No tasks added. Click "+ Add Task" to add task items.</p>
            ) : (
              <div className="space-y-2.5">
                {tasks.map((task, index) => (
                  <div key={task.id || index} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 relative shadow-xs">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-1.5">
                      <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                        <CheckSquare className="w-3 h-3 text-indigo-600" />
                        Task #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTask(index)}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded transition flex items-center gap-1 text-[10px] font-bold"
                        title="Remove Task"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        <span>- Remove</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                      {/* Task Name */}
                      <div className="md:col-span-2">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Task / Deliverable Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Teaser / Reels / Album Design"
                          value={task.taskName}
                          onChange={(e) => handleTaskChange(index, 'taskName', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                        />
                      </div>

                      {/* Quantity (Kitne bane) */}
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Quantity</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            value={task.quantity}
                            onChange={(e) => handleTaskChange(index, 'quantity', Number(e.target.value))}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 font-bold"
                          />
                          <input
                            type="text"
                            placeholder="e.g. Pcs/Reels"
                            value={task.unit || ''}
                            onChange={(e) => handleTaskChange(index, 'unit', e.target.value)}
                            className="w-16 bg-white border border-slate-200 rounded px-1.5 py-1 text-[10px] text-slate-600"
                          />
                        </div>
                      </div>

                      {/* Assigned To (Kon Assigned hai) */}
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5 flex items-center gap-0.5">
                          <UserCheck className="w-2.5 h-2.5 text-indigo-600" />
                          Assigned To
                        </label>
                        {(() => {
                          const isStandardMember = activeTeamMembers.some((m) => m.name === task.assignedTo) || task.assignedTo === 'Unassigned' || !task.assignedTo;
                          const isCustom = !isStandardMember || task.assignedTo === 'Other';
                          return (
                            <>
                              <select
                                value={isCustom ? 'other' : task.assignedTo}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === 'other') {
                                    handleTaskChange(index, 'assignedTo', 'Other');
                                  } else {
                                    handleTaskChange(index, 'assignedTo', val);
                                  }
                                }}
                                className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 font-semibold mb-1"
                              >
                                {activeTeamMembers.map((m) => (
                                  <option key={m.id || m.name} value={m.name}>
                                    {m.name} ({m.role})
                                  </option>
                                ))}
                                <option value="Unassigned">Unassigned</option>
                                <option value="other">Other</option>
                              </select>

                              {isCustom && (
                                <input
                                  type="text"
                                  placeholder="Type custom name..."
                                  value={task.assignedTo === 'Other' ? '' : task.assignedTo}
                                  onChange={(e) => handleTaskChange(index, 'assignedTo', e.target.value || 'Other')}
                                  className="w-full bg-amber-50 border border-amber-300 rounded px-2 py-1 text-xs text-slate-800 font-bold placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                                />
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Actions */}
          </div>
          <div className="z-20 -mx-5 mt-0 flex shrink-0 flex-col-reverse items-stretch justify-between gap-2 border-t border-[#eee7e2] bg-white px-5 py-4 sm:-mx-7 sm:flex-row sm:items-center sm:px-7">
            <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveStep((step) => Math.max(1, step - 1))}
              disabled={activeStep === 1}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="flex items-center gap-2"><ArrowLeft className="size-4"/>Previous</span>
            </button>
            </div>
            {activeStep < 5 ? <button key="wizard-next" type="button" onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              if (activeStep === 1 && !clientWeddingTitle.trim()) { showToast('Please enter the Client / Wedding Title before continuing.', { variant: 'error' }); return; }
              setActiveStep((step) => Math.min(5, step + 1));
            }} className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8f3655] to-[#6d2f45] px-6 py-2.5 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(109,47,69,.25)] transition hover:-translate-y-0.5 hover:shadow-lg"><span>{`Save & Next: ${['Shoot Plan','Budget','Documents','Tasks'][activeStep - 1]}`}</span><ArrowRight className="size-4"/></button> :
            <button
              key="wizard-submit"
              type="submit"
              className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8f3655] to-[#6d2f45] px-6 py-2.5 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(109,47,69,.25)] transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <Save className="size-4" />
              <span>{existingProject ? 'Save Project Changes' : 'Save & Create Project'}</span>
            </button>
            }
          </div>

        </form>

        <ConfirmDeleteModal
          isOpen={deleteShootModalConfig.isOpen}
          title="Delete Shoot Event"
          itemTitle={deleteShootModalConfig.itemTitle}
          onConfirm={deleteShootModalConfig.onConfirm}
          onCancel={() => setDeleteShootModalConfig((prev) => ({ ...prev, isOpen: false }))}
        />

      </div>
    </div>
  );
};
