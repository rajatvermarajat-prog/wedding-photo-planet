export type ProjectStatus = 'new_project' | 'running' | 'completed' | 'pending' | 'urgent' | 'ready_to_deliver';

export type ServiceType = 
  | 'Roka'
  | 'Pre Wedding'
  | 'Engagement'
  | 'Wedding'
  | 'Complete Wedding Services'
  | 'Haldi & Mehendi'
  | 'Sangeet'
  | 'Reception'
  | 'Other'
  | (string & {});

export type EditingStatus = 'not_started' | 'in_progress' | 'client_review' | 'revision' | 'completed';

export interface VideoPipeline {
  preWeddingVideo: EditingStatus;
  longVideo: EditingStatus; // Traditional / Full Length Film
  teaser: EditingStatus; // 1-2 min Cinematic Teaser
  highlights: EditingStatus; // 3-5 min Highlights
  reels: EditingStatus; // Instagram Reels / Shorts
  otherVideo: string; // Special requests, Drone edits, etc.
  assignedEditor?: string;
  notes?: string;
}

export interface PhotoPipeline {
  preWeddingPhotos: EditingStatus;
  cullingSelection: EditingStatus; // Client photo selection
  colorGradingRetouching: EditingStatus;
  albumDesigning: EditingStatus; // Couple / Parent Albums
  albumPrinting: 'not_sent' | 'design_sent' | 'proof_approved' | 'printing' | 'delivered';
  otherPhoto: string;
  assignedEditor?: string;
  notes?: string;
}

export interface CrewMemberAssignment {
  id: string;
  name: string;
  role: 'Photographer' | 'Videographer' | 'Cinematographer' | 'Drone Operator' | 'Assistant' | 'Candid Photographer' | 'Traditional Video' | 'Editor / Live' | string;
  mobile?: string;
  dataReceived?: boolean;
  dataSizeGB?: number;
  hardDriveName?: string;
  copyInHD?: string;
  backupInHD?: string;
}

export interface ShootEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string;
  startTime?: string;
  endTime?: string;
  venue: string;
  location: string;
  leadPhotographer?: string;
  cinematographer?: string;
  droneOperator?: string;
  assistant?: string;
  crewAssignments?: CrewMemberAssignment[];
  equipmentChecklist?: string[];
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export interface DataBackup {
  offloadedFromCards: boolean;
  hardDrive1: string; // e.g. "HDD 01 - Western Digital 4TB (Office Vault)"
  hardDrive1Done: boolean;
  hardDrive2: string; // e.g. "HDD 02 - Seagate 4TB (Backup)"
  hardDrive2Done: boolean;
  cloudBackupDone: boolean;
  cloudBackupLink?: string;
  totalDataSizeGB: number;
  rawCleanupStatus: 'not_cleaned' | 'raw_kept' | 'archived' | 'cleaned_up';
}

export interface ScheduledPayment {
  id: string;
  stageName: string; // e.g. "30% Booking Advance", "60% On Shoot Date", "10% Final Delivery"
  dueDate: string; // e.g. "2026-06-20"
  amount: number;
  status: 'pending' | 'received' | 'overdue';
  notes?: string;
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  type: 'advance' | 'installment' | 'final' | 'other' | 'settlement';
  paymentMode: 'UPI / GPay' | 'Bank Transfer' | 'Cash' | 'Cheque';
  receiptNumber: string;
  notes?: string;
  receiptScreenshot?: string; // Base64 image data URL or image link for slip/screenshot
}

export interface ClientVaultDocument {
  id: string;
  name: string;
  title?: string;
  category: 'Quotation PDF' | 'Payment Slip' | 'Contract / Agreement' | 'Client ID Proof' | 'Other PDF / Doc';
  fileUrl: string; // Base64 or URL
  fileType: 'pdf' | 'image' | 'doc';
  uploadDate: string;
  fileSize?: string;
  notes?: string;
}

export interface ProjectTask {
  id: string;
  taskName: string; // e.g. "Cinematic Teaser", "Instagram Reels", "Wedding Full Film", "Album Design (12x36)"
  quantity: number; // e.g. 1, 5, 2, 100
  unit?: string; // e.g. "Video", "Reels", "Albums", "Photos"
  assignedTo: string; // e.g. "Vikram Editor", "Pooja Retoucher"
  status: EditingStatus; // 'not_started' | 'in_progress' | 'client_review' | 'revision' | 'completed'
  notes?: string;
}

export interface Project {
  id: string;
  name?: string;
  projectName?: string;
  // Requested fields 01 to 03 + details
  clientWeddingTitle: string; // 01 Client / Wedding Title
  clientContactMobile: string; // 02 Client Contact / Mobile
  venueLocation: string; // 03 Venue / Location
  primaryServiceType: ServiceType; // Primary Service Type
  weddingFunctionDates: string; // Wedding Function Date(s)
  finalDeliveryDeadline: string; // Final Delivery Deadline
  totalBudget: number; // Total Budget (₹)
  advanceReceived: number; // Advance Received (₹)
  balanceDue: number; // Balance Due (₹) - computed
  quotationLink?: string; // Legacy / quotation link
  clientVaultDocuments?: ClientVaultDocument[]; // Internal Client Folder for PDFs & Payment Slips
  specialNotesMusicPreferences: string; // Special Client Notes / Music Preferences
  
  // Workflow fields
  status: ProjectStatus;
  createdAt: string;
  
  // Extended Wedding Photography & Videography Management
  tasks?: ProjectTask[]; // Custom tasks with quantity (kitne bane) and assigned team member
  videoPipeline: VideoPipeline;
  photoPipeline: PhotoPipeline;
  shoots: ShootEvent[];
  dataBackup: DataBackup;
  payments: PaymentRecord[];
  paymentSchedule?: ScheduledPayment[];
  
  // Delivery Handover Status
  deliveryStatus: {
    rawHandoverDone: boolean;
    teaserLinkSent: boolean;
    fullFilmSent: boolean;
    reelsSent: boolean;
    highResPhotosSent: boolean;
    albumPrintedAndDelivered: boolean;
    clientFeedbackRating?: number;
    finalDeliveryDate?: string;
  };
}

export type TeamRole = 
  | 'Manager'
  | 'Account Manager'
  | 'Photo Editor' 
  | 'Video Editor' 
  | 'Social Media Handler' 
  | 'Sales Team'
  | 'Studio Manager'
  | 'Other'
  | string;

export interface TeamTask {
  id: string;
  title: string;
  assignedToId: string;
  assignedToName: string;
  assignedRole: TeamRole;
  domainName?: string; // Target website domain for domain handlers
  projectId?: string;
  projectTitle?: string;
  category: 'editing_video' | 'editing_photo' | 'sales_lead' | 'sales_target' | 'social_media' | 'management' | string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'not_started' | 'in_progress' | 'review' | 'completed';
  notes?: string;
  bookingTarget?: number; // Target number of booked deals/weddings
  targetRevenue?: number; // Target revenue in ₹
  targetLeadsCount?: number; // Target number of leads/calls
}

export interface TeamMember {
  id: string;
  name: string;
  role: TeamRole;
  phone?: string;
  mobile?: string;
  email?: string;
  dailyRate?: number; // Per shoot / per day rate (₹)
  payType?: 'daily' | 'monthly';
  monthlySalary?: number; // Fixed monthly salary (₹)
  status?: 'active' | 'inactive';
  skills?: string[];
  
  // Software assignment & Monitoring (Up to 2-3 permitted softwares)
  assignedSoftware?: string; // Legacy fallback single string
  assignedSoftwares?: string[]; // Array of up to 2-3 authorized softwares
  currentSoftware?: string; // Live detected app
  unauthorizedMinutes?: number; // Minutes spent on unauthorized app
  violationsCount?: number; // Times switched to unauthorized app today
  isLoggedOut?: boolean; // Force logged out due to repeated violation
  workStatus?: 'EDITING' | 'IDLE' | 'ON_BREAK' | 'CLOCKED_OUT' | 'LOCKED';
  inTime?: string; // e.g. "09:30 AM"
  outTime?: string; // e.g. "07:30 PM"
  weeklyOff?: string; // e.g. "Sunday"
  lunchTime?: string; // e.g. "01:30 PM - 02:30 PM"
  activeTasksCount?: number;
  completedTasksCount?: number;
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  teamMemberId: string;
  teamMemberName: string;
  role: TeamRole;
  projectId?: string;
  projectTitle?: string;
  status: 'present' | 'present_shoot' | 'present_office' | 'half_day' | 'absent';
  inTime?: string; // e.g. "09:30 AM"
  outTime?: string; // e.g. "07:00 PM"
  lunchTime?: string;
  payAmount: number;
  paidStatus: 'paid' | 'pending';
  notes?: string;
}

export interface OfficeExpense {
  id: string;
  title: string;
  amount: number;
  category: 'Rent' | 'Electricity & Water' | 'Studio Equipment & Repair' | 'Food & Tea/Chai' | 'Travel & Fuel' | 'Software & Subscriptions' | 'Marketing & Ads' | 'Exposing & Operating' | 'Albums Print' | 'Photo & Video Edit' | 'Miscellaneous' | 'Other' | string;
  expenseDate: string; // YYYY-MM-DD
  spentBy: 'Owner' | 'Studio Manager' | 'Account Manager' | 'Other Staff' | string;
  paidVia: 'UPI / GPay' | 'Cash' | 'Bank Transfer' | 'Credit Card';
  notes?: string;
  monthYear: string; // e.g. "2026-08" or "August 2026"
}

export type LeadStatus = 'new' | 'contacted' | 'meeting_fixed' | 'quotation_sent' | 'booked' | 'lost';

export interface LeadActivityLog {
  id: string;
  type: 'created' | 'status_changed' | 'assigned' | 'quotation_uploaded' | 'note_added' | 'edited';
  description: string;
  performedBy: string;
  timestamp: string;
}

export interface LeadQuotationFile {
  id: string;
  fileName: string;
  fileSize?: string;
  fileType?: string; // 'pdf' | 'excel' | 'word' | 'image' | string
  fileUrl?: string; // base64 or file preview url
  uploadedBy: string;
  uploadedDate: string;
  notes?: string;
}

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
  finalAmount?: number; // Finalized deal amount in ₹ when booked
  advanceReceived?: number; // Advance deposit received
  quotations?: LeadQuotationFile[];
  activityLogs?: LeadActivityLog[];
}

// ----------------------------------------------------
// FREELANCER TEAM MANAGEMENT TYPES
// ----------------------------------------------------

export interface FreelancerCategory {
  id: string;
  name: string; // e.g. "Photographer", "Cinematographer"
  subCategories: string[]; // e.g. ["Candid Photographer", "Traditional Photographer", "Photographer Operator"]
  isActive: boolean;
  description?: string;
}

export interface FreelancerDocument {
  id: string;
  title: string;
  type: 'id_proof' | 'agreement' | 'bank_details' | 'other';
  fileUrl: string;
  fileName?: string;
  status: 'uploaded' | 'missing' | 'verified';
  uploadDate: string;
}

export interface Freelancer {
  id: string;
  freelancerId: string; // e.g. "FL-1001"
  name: string;
  profilePhoto?: string;
  mobile: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  emergencyContact: string;
  joiningDate: string;
  status: 'active' | 'inactive';

  // Professional Information
  mainCategory: string; // "Photographer" | "Cinematographer" | string
  subCategory: string; // "Candid Photographer" etc.
  experienceYears: number;
  skills: string[];
  equipmentAvailable: string;
  cameraDetails: string;
  lensDetails: string;
  otherEquipment: string;

  // Rate Card / Charges (₹)
  perDayCharges: number;
  halfDayCharges: number;
  eventCharges: number;
  overtimeCharges: number;
  extraHourCharges: number;
  travelCharges: number;
  otherCharges: number;
  notes?: string;

  // Bank & Payment Information
  paymentMethod: 'UPI' | 'Bank Transfer' | 'Cash' | 'Other';
  upiId?: string;
  bankName?: string;
  accountHolderName?: string;
  accountNumber?: string;
  ifsc?: string;
  paymentNotes?: string;

  // Availability status
  availabilityStatus?: 'Available' | 'Busy' | 'On Shoot' | 'Leave' | 'Unavailable';

  // Documents attached
  documents?: FreelancerDocument[];
}

export interface FreelancerAssignment {
  id: string;
  projectId?: string;
  projectName: string;
  clientName: string;
  eventName: string; // e.g. "Wedding", "Sangeet", "Haldi"
  shootDate: string; // YYYY-MM-DD
  startTime: string; // e.g. "09:00 AM"
  endTime: string; // e.g. "10:00 PM"
  shootLocation: string;
  venue: string;

  freelancerId: string;
  freelancerName: string;
  category: string;
  subCategory: string;
  role: string;

  freelancerCharges: number;
  travelCharges: number;
  extraCharges: number;
  totalAgreedAmount: number; // Charges + Travel + Extra
  advancePaid: number;
  pendingAmount: number;

  paymentStatus: 'unpaid' | 'partially_paid' | 'paid' | 'overpaid';
  assignmentStatus: 'assigned' | 'confirmed' | 'on_shoot' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface FreelancerPayment {
  id: string;
  freelancerId: string;
  freelancerName: string;
  assignmentId?: string;
  projectName?: string;
  shootDate?: string;

  agreedAmount?: number;
  advanceAmount?: number;
  secondPayment?: number;
  finalPayment?: number;
  travelPayment?: number;
  overtimePayment?: number;
  otherPayment?: number;
  
  paymentType?: 'advance' | 'second_payment' | 'final_settlement' | 'travel' | 'extra' | string;
  amountPaid: number; // Amount paid in this specific transaction
  totalPaidSoFar?: number;
  pendingAmount?: number;

  paymentDate: string; // YYYY-MM-DD
  paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer' | 'Check' | 'Other' | string;
  transactionId?: string;
  notes?: string;
  receiptScreenshot?: string;
  receiptUrl?: string;
  createdBy?: string;
}

export interface FreelancerAttendance {
  id: string;
  freelancerId: string;
  freelancerName: string;
  assignmentId?: string;
  projectName?: string;
  shootDate: string; // YYYY-MM-DD
  checkInTime?: string;
  checkOutTime?: string;
  attendanceStatus: 'present' | 'absent' | 'half_day' | 'late' | 'cancelled';
  availabilityStatus?: 'Available' | 'Busy' | 'On Shoot' | 'Leave' | 'Unavailable';
  notes?: string;
  remarks?: string;
}

export interface FreelancerDataReceived {
  id: string;
  freelancerId: string;
  freelancerName: string;
  assignmentId?: string;
  projectName: string;
  shootDate?: string;
  dataType: 'Photos' | 'Videos' | 'Raw Photos & Videos' | 'Drone Footage' | 'RAW Photos' | '4K S-Log Video' | 'Audio Stems' | 'Other' | string;
  dataReceivedDate: string;
  numberOfCardsOrDrives: number;
  approxDataSizeGB: number;
  photosReceivedCount?: number;
  videosReceivedCount?: number;
  rawReceived?: boolean;
  isRawReceived?: boolean;
  backupReceived?: boolean;
  isBackupDone?: boolean;
  hardDiskReceived?: boolean;
  dataLocation?: string; // e.g. "Vault SSD 01", "Studio Server"
  cloudDriveLink?: string;
  dataStatus: 'pending' | 'partially_received' | 'received' | 'verified' | 'backup_completed' | 'partial' | 'backed_up' | string;
  receivedBy: string;
  notes?: string;
  files?: { name: string; url: string }[];
}

export interface FreelancerActivityLog {
  id: string;
  timestamp: string;
  freelancerId?: string;
  freelancerName?: string;
  action: string;
  performedBy: string;
}
