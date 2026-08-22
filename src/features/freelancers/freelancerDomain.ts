import {
  Freelancer,
  FreelancerApplicationStatus,
  FreelancerAssignment,
  FreelancerCategory,
  FreelancerPayment,
  FreelancerWorkingStatus,
} from '@/types';

export function getApplicationStatus(f: Freelancer): FreelancerApplicationStatus {
  return f.applicationStatus || 'approved';
}

export function getWorkingStatus(f: Freelancer): FreelancerWorkingStatus {
  if (f.workingStatus) return f.workingStatus;
  return f.status === 'active' ? 'active' : 'inactive';
}

export function isApprovedFreelancer(f: Freelancer): boolean {
  return getApplicationStatus(f) === 'approved';
}

export function isPendingApplication(f: Freelancer): boolean {
  return ['applied', 'under_review', 'shortlisted', 'verification', 'changes_requested'].includes(getApplicationStatus(f));
}

export function formatInr(amount: number): string {
  return `₹${Math.round(amount || 0).toLocaleString('en-IN')}`;
}

export function freelancerLedger(freelancerId: string, assignments: FreelancerAssignment[], payments: FreelancerPayment[]) {
  const agreed = assignments.filter((a) => a.freelancerId === freelancerId).reduce((s, a) => s + (a.totalAgreedAmount || 0), 0);
  const paid = payments.filter((p) => p.freelancerId === freelancerId).reduce((s, p) => s + (p.amountPaid || 0), 0);
  return { agreed, paid, pending: Math.max(0, agreed - paid) };
}

export function findDateConflicts(
  freelancerId: string,
  dateKey: string,
  assignments: FreelancerAssignment[],
  ignoreAssignmentId?: string
): FreelancerAssignment[] {
  return assignments.filter(
    (a) =>
      a.freelancerId === freelancerId &&
      a.shootDate === dateKey &&
      a.assignmentStatus !== 'cancelled' &&
      a.id !== ignoreAssignmentId
  );
}

export function getFreelancerKpis(
  freelancers: Freelancer[],
  assignments: FreelancerAssignment[],
  payments: FreelancerPayment[],
  today: string
) {
  const monthPrefix = today.slice(0, 7);
  const approved = freelancers.filter(isApprovedFreelancer);
  const active = approved.filter((f) => getWorkingStatus(f) === 'active');
  const availableToday = approved.filter((f) => (f.availabilityStatus || 'Available') === 'Available' && getWorkingStatus(f) === 'active');
  const onShootToday = assignments.filter((a) => a.shootDate === today && (a.assignmentStatus === 'on_shoot' || a.assignmentStatus === 'confirmed' || a.assignmentStatus === 'assigned')).length;
  const upcoming = assignments.filter((a) => a.shootDate >= today && a.assignmentStatus !== 'cancelled' && a.assignmentStatus !== 'completed').length;
  const agreed = assignments.reduce((s, a) => s + (a.totalAgreedAmount || 0), 0);
  const paid = payments.reduce((s, p) => s + (p.amountPaid || 0), 0);
  const monthCost = payments.filter((p) => (p.paymentDate || '').startsWith(monthPrefix)).reduce((s, p) => s + (p.amountPaid || 0), 0);
  return {
    total: freelancers.length,
    active: active.length,
    availableToday: availableToday.length,
    onShootToday,
    pendingApplications: freelancers.filter(isPendingApplication).length,
    upcomingShoots: upcoming,
    pendingPayments: Math.max(0, agreed - paid),
    monthCost,
    preferred: freelancers.filter(isPreferredFreelancer).length,
    recentlyAdded: freelancers.filter((f) => (f.joiningDate || '') >= thirtyDaysAgo(today)).length,
  };
}

export function isPreferredFreelancer(f: Freelancer): boolean {
  return f.preferredTier === 'preferred';
}

function thirtyDaysAgo(today: string): string {
  const d = new Date(`${today}T00:00:00`);
  d.setDate(d.getDate() - 30);
  return d.toISOString().split('T')[0];
}

export function assignmentPaid(assignmentId: string, payments: FreelancerPayment[]): number {
  return payments.filter((p) => p.assignmentId === assignmentId).reduce((s, p) => s + (p.amountPaid || 0), 0);
}

export function assignmentBalance(assignment: FreelancerAssignment, payments: FreelancerPayment[]) {
  const paid = assignmentPaid(assignment.id, payments);
  const agreed = assignment.totalAgreedAmount || 0;
  return { agreed, paid, pending: Math.max(0, agreed - paid) };
}

export const DEFAULT_FREELANCER_CATEGORIES: FreelancerCategory[] = [
  {
    id: 'cat-1',
    name: 'Photographer',
    subCategories: ['Wedding Photographer', 'Candid Photographer', 'Traditional Photographer', 'Senior Photographer', 'Second Photographer', 'Assistant Photographer', 'Portrait Specialist'],
    isActive: true,
    description: 'Still photography for rituals, portraits and traditional coverage.',
  },
  {
    id: 'cat-2',
    name: 'Videographer',
    subCategories: ['Cinematographer', 'Wedding Videographer', 'Traditional Videographer', 'Wedding Film Cinematographer', 'Assistant Cinematographer', 'Video Director', 'Video Operator'],
    isActive: true,
    description: 'Wedding films, teasers and traditional video coverage.',
  },
  {
    id: 'cat-3',
    name: 'Drone Operator',
    subCategories: ['Drone Operator', 'FPV Pilot', 'Aerial Cinematographer', 'Standard 4K Drone Operator'],
    isActive: true,
    description: 'Aerial coverage for venues and couple entries.',
  },
  {
    id: 'cat-4',
    name: 'Assistant',
    subCategories: ['Lighting Assistant', 'Camera Assistant', 'Production Assistant', 'Runner', 'Coordinator', 'Gimbal Assistant', 'General Helper'],
    isActive: true,
    description: 'On-location lighting, camera and production support.',
  },
  {
    id: 'cat-5',
    name: 'Other',
    subCategories: ['On-Location Editor', 'Reels Maker', 'Misc Crew'],
    isActive: true,
    description: 'Miscellaneous production roles.',
  },
  {
    id: 'cat-6',
    name: 'Editor',
    subCategories: ['Video Editor', 'Wedding Film Editor', 'Short-form/Reels Editor', 'Colorist', 'Retoucher', 'Photo Editor'],
    isActive: true,
    description: 'Post-production photo and film editing.',
  },
  {
    id: 'cat-7',
    name: 'Design',
    subCategories: ['Album Designer', 'Graphic Designer', 'Motion Designer'],
    isActive: true,
    description: 'Album and motion design.',
  },
];

export function mergeFreelancerCategories(existing: FreelancerCategory[]): FreelancerCategory[] {
  const byName = new Map(existing.map((c) => [c.name, { ...c, subCategories: [...c.subCategories] }]));
  DEFAULT_FREELANCER_CATEGORIES.forEach((def) => {
    const cur = byName.get(def.name);
    if (!cur) {
      byName.set(def.name, def);
      return;
    }
    const extras = def.subCategories.filter((s) => !cur.subCategories.includes(s));
    cur.subCategories = [...cur.subCategories, ...extras];
  });
  return [...byName.values()];
}

export function todayKey(): string {
  return new Date().toISOString().split('T')[0];
}

export const APPLICATION_LABELS: Record<FreelancerApplicationStatus, string> = {
  applied: 'Applied',
  under_review: 'Under Review',
  shortlisted: 'Shortlisted',
  verification: 'Verification',
  approved: 'Approved',
  rejected: 'Rejected',
  changes_requested: 'Action Required',
};

export const WORKING_LABELS: Record<FreelancerWorkingStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  unavailable: 'Temporarily Unavailable',
  suspended: 'Suspended',
};

export function isVerifiedFreelancer(f: Freelancer): boolean {
  const v = f.verification;
  if (!v) return false;
  return !!(v.mobile && v.email && v.identity && v.portfolio && v.agreement && v.bank);
}

export function freelancerPerformance(freelancer: Freelancer, assignments: FreelancerAssignment[], payments: FreelancerPayment[]) {
  const mine = assignments.filter((a) => a.freelancerId === freelancer.id);
  const completed = mine.filter((a) => a.assignmentStatus === 'completed');
  const cancelled = mine.filter((a) => a.assignmentStatus === 'cancelled');
  const ledger = freelancerLedger(freelancer.id, assignments, payments);
  const reviews = freelancer.reviews || [];
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + (r.overall || 0), 0) / reviews.length
      : freelancer.rating || 0;
  const lastAssigned = [...mine].sort((a, b) => (b.shootDate || '').localeCompare(a.shootDate || ''))[0];
  const uniqueProjects = new Set(mine.map((a) => a.projectName)).size;
  return {
    totalShoots: mine.length,
    completed: completed.length,
    cancelled: cancelled.length,
    averageRating: avgRating,
    repeatHireRate: mine.length > 1 && uniqueProjects > 0 ? Math.round(((mine.length - uniqueProjects) / mine.length) * 100) : 0,
    lastAssigned: lastAssigned?.shootDate,
    lastReview: reviews[0],
    ...ledger,
  };
}

export function matchesTalentSearch(
  f: Freelancer,
  query: {
    text?: string;
    category?: string;
    subCategory?: string;
    city?: string;
    minExperience?: number;
    minRating?: number;
    availability?: string;
    dateKey?: string;
    minRate?: number;
    maxRate?: number;
    preferredOnly?: boolean;
    hasUpcoming?: boolean;
  },
  assignments: FreelancerAssignment[] = []
): boolean {
  const q = (query.text || '').trim().toLowerCase();
  if (q) {
    const hay = [
      f.name,
      f.freelancerId,
      f.mobile,
      f.whatsapp,
      f.email,
      f.city,
      f.subCategory,
      f.mainCategory,
      f.cameraDetails,
      f.lensDetails,
      f.otherEquipment,
      f.equipmentAvailable,
      ...(f.skills || []),
    ]
      .join(' ')
      .toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (query.category && query.category !== 'all' && f.mainCategory !== query.category) return false;
  if (query.subCategory && query.subCategory !== 'all' && f.subCategory !== query.subCategory) return false;
  if (query.city && !((f.city || '').toLowerCase().includes(query.city.toLowerCase()))) return false;
  if (query.minExperience && (f.experienceYears || 0) < query.minExperience) return false;
  if (query.minRating && (f.rating || 0) < query.minRating) return false;
  if (query.availability && query.availability !== 'all' && (f.availabilityStatus || 'Available') !== query.availability) return false;
  if (query.minRate != null && (f.perDayCharges || 0) < query.minRate) return false;
  if (query.maxRate != null && query.maxRate > 0 && (f.perDayCharges || 0) > query.maxRate) return false;
  if (query.dateKey && findDateConflicts(f.id, query.dateKey, assignments).length > 0) return false;
  if (query.preferredOnly && !isPreferredFreelancer(f)) return false;
  if (query.hasUpcoming) {
    const today = todayKey();
    const upcoming = assignments.some(
      (a) => a.freelancerId === f.id && a.shootDate >= today && a.assignmentStatus !== 'cancelled' && a.assignmentStatus !== 'completed'
    );
    if (!upcoming) return false;
  }
  return true;
}
