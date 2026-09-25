import { ApiError, ApiMeta } from './client';

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5050/api/v1';
const baseUrl = configuredApiUrl.replace(/[“”"']/g, '').trim().replace(/\/$/, '');
const SESSION_COOKIE = 'wpp_freelancer_session';
const DEMO_SESSION_KEY = 'wpp_demo_freelancer_session';
const DEMO_EMAIL = 'freelancer@gmail.com';
const DEMO_PASSWORD = '1234';

function apiBaseUrl(): string {
  if (typeof window === 'undefined' || baseUrl.startsWith('/')) return baseUrl;
  const url = new URL(baseUrl);
  if (url.origin === window.location.origin) return baseUrl;
  return url.pathname.replace(/\/$/, '') || '/api/v1';
}

export type PortalStatus = 'ACTIVE' | 'INACTIVE' | 'UNAVAILABLE' | 'SUSPENDED';
export type AvailabilityStatus = 'AVAILABLE' | 'PARTIALLY_AVAILABLE' | 'UNAVAILABLE';

export interface PortalFileObject {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: string | number;
}

export interface PortalPortfolioItem {
  id: string;
  fileObjectId: string;
  title: string;
  description?: string | null;
  category?: string | null;
  sortOrder: number;
  isPublished: boolean;
  fileObject?: PortalFileObject;
}

export interface PortalAvailability {
  id: string;
  date: string;
  status: AvailabilityStatus;
  startTime?: string | null;
  endTime?: string | null;
  notes?: string | null;
}

export interface PortalPlan {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: string | number;
  currency: string;
  billingInterval: string;
  features?: unknown;
}

export interface PortalSubscription {
  id: string;
  status: string;
  startedAt?: string | null;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  canceledAt?: string | null;
  plan: PortalPlan;
}

export interface PortalApplication {
  id: string;
  status: string;
  rejectionReason?: string | null;
  submittedAt?: string | null;
  reviewedAt?: string | null;
}

export interface PortalConnection {
  id: string;
  status: string;
  notes?: string | null;
  projectId?: string | null;
  shootId?: string | null;
}

export interface PortalAssignment {
  id: string;
  role: string;
  status: string;
  agreedAmount: string | number;
  shoot?: { id: string; title: string; shootDate: string; status: string; project?: { id: string; projectNumber: string; name: string } };
}

export interface PortalPayout {
  id: string;
  amount: string | number;
  paymentDate: string;
  paymentMethod: string;
  transactionRef?: string | null;
  notes?: string | null;
  assignment?: { id: string; role: string; status: string; shoot?: { id: string; title: string; shootDate: string; project?: PortalProjectSummary } | null } | null;
}

export interface PortalProjectSummary {
  id: string;
  projectNumber: string;
  name: string;
  type: string;
  status: string;
  weddingDate?: string | null;
  venueName?: string | null;
  venueCity?: string | null;
}

export interface PortalShootSummary {
  id: string;
  title: string;
  shootType: string;
  shootDate: string;
  startTime?: string | null;
  endTime?: string | null;
  location?: string | null;
  city?: string | null;
  status: string;
  project?: PortalProjectSummary;
  assignment?: { id: string; role: string; status: string; callTime?: string | null; assignedAt?: string | null };
  crew?: Array<{ id: string; role: string; status: string; isSelf: boolean; displayName?: string | null }>;
}

export interface PortalTaskSummary {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  status: string;
  priority: string;
  dueDate?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  project?: PortalProjectSummary | null;
  shoot?: Omit<PortalShootSummary, 'project' | 'assignment' | 'crew'> | null;
}

export interface PortalNotification {
  id: string;
  type: string;
  channel?: string;
  title: string;
  message: string;
  entityType?: string | null;
  entityId?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface PortalList<T> {
  items: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface PortalDashboard {
  profile: PortalMe;
  subscription: PortalSubscription | null;
  upcomingShoots: PortalShootSummary[];
  todaysWork: { shoots: PortalShootSummary[]; tasks: PortalTaskSummary[] };
  tasks: PortalTaskSummary[];
  payments: { recent: PortalPayout[]; summary: { paidAmount: number; currency: string } };
  notifications: PortalNotification[];
}

export interface PortalFreelancer {
  id: string;
  code: string;
  fullName: string;
  phone: string;
  whatsapp?: string | null;
  email?: string | null;
  city?: string | null;
  addressLine?: string | null;
  primarySkill: string;
  skills: string[];
  experienceYears?: number | null;
  rate?: string | number | null;
  rateType?: string | null;
  status: PortalStatus;
  travelAvailable: boolean;
  maxShootsPerDay: number;
  equipmentNotes?: string | null;
  notes?: string | null;
  subscriptions: PortalSubscription[];
  availability: PortalAvailability[];
  portfolioItems: PortalPortfolioItem[];
  applications: PortalApplication[];
  connections: PortalConnection[];
  assignments: PortalAssignment[];
  payouts: PortalPayout[];
}

export interface PortalMe {
  freelancer: PortalFreelancer;
  searchable: boolean;
}

export interface PublicApplicationInput {
  organizationSlug?: string;
  fullName: string;
  phone: string;
  email?: string;
  city?: string;
  primarySkill?: string;
  skills?: string[];
  experienceYears?: number;
  portfolioUrl?: string;
  expectedRate?: string;
  notes?: string;
}

export interface OnboardingValidation {
  valid: boolean;
  status: 'valid' | 'invalid' | 'expired' | 'used' | 'revoked';
  freelancer?: {
    displayName: string;
    email?: string | null;
  };
  expiresAt?: string;
}

interface Envelope<T> { success: boolean; data: T; meta?: ApiMeta; error?: { message?: string; code?: string; details?: unknown[] } }
type PortalShootDetail = PortalShootSummary & { notes?: string | null; event?: { id: string; name: string; eventDate: string; venueName?: string | null; city?: string | null; status: string } | null; tasks: PortalTaskSummary[] };

const demoProject: PortalProjectSummary = {
  id: 'demo-project-1',
  projectNumber: 'WPP-2026-014',
  name: 'Aarav & Meera Wedding',
  type: 'Wedding',
  status: 'IN_PROGRESS',
  weddingDate: '2026-10-12T00:00:00.000Z',
  venueName: 'The Rose Courtyard',
  venueCity: 'Delhi',
};

const demoShoots: PortalShootSummary[] = [
  {
    id: 'demo-shoot-1',
    title: 'Haldi & Mehendi',
    shootType: 'PRE_WEDDING',
    shootDate: '2026-10-11T00:00:00.000Z',
    startTime: '2026-10-11T09:00:00.000Z',
    endTime: '2026-10-11T16:00:00.000Z',
    location: 'The Rose Courtyard',
    city: 'Delhi',
    status: 'SCHEDULED',
    project: demoProject,
    assignment: { id: 'demo-assignment-1', role: 'LEAD_PHOTOGRAPHER', status: 'CONFIRMED', callTime: '2026-10-11T08:30:00.000Z' },
  },
  {
    id: 'demo-shoot-2',
    title: 'Wedding Ceremony',
    shootType: 'WEDDING',
    shootDate: '2026-10-12T00:00:00.000Z',
    startTime: '2026-10-12T06:30:00.000Z',
    endTime: '2026-10-12T22:00:00.000Z',
    location: 'The Rose Courtyard',
    city: 'Delhi',
    status: 'SCHEDULED',
    project: demoProject,
    assignment: { id: 'demo-assignment-2', role: 'CANDID_PHOTOGRAPHER', status: 'CONFIRMED', callTime: '2026-10-12T06:00:00.000Z' },
  },
];

const demoTasks: PortalTaskSummary[] = [
  { id: 'demo-task-1', title: 'Confirm call time with studio', category: 'SHOOT', status: 'TODO', priority: 'HIGH', dueDate: '2026-10-10T12:00:00.000Z', project: demoProject, shoot: demoShoots[0] },
  { id: 'demo-task-2', title: 'Upload portfolio highlights', category: 'PROFILE', status: 'IN_PROGRESS', priority: 'MEDIUM', dueDate: '2026-10-09T12:00:00.000Z', project: demoProject },
];

const demoPayouts: PortalPayout[] = [
  { id: 'demo-payout-1', amount: 18000, paymentDate: '2026-09-18T00:00:00.000Z', paymentMethod: 'UPI', transactionRef: 'DEMO-UPI-9182', assignment: { id: 'demo-assignment-old', role: 'CANDID_PHOTOGRAPHER', status: 'PAID', shoot: { id: 'demo-shoot-old', title: 'Pre-wedding', shootDate: '2026-09-08T00:00:00.000Z', project: demoProject } } },
  { id: 'demo-payout-2', amount: 22000, paymentDate: '2026-10-01T00:00:00.000Z', paymentMethod: 'Bank Transfer', transactionRef: 'DEMO-BANK-1204', assignment: { id: 'demo-assignment-1', role: 'LEAD_PHOTOGRAPHER', status: 'ADVANCE_PAID', shoot: { id: demoShoots[0].id, title: demoShoots[0].title, shootDate: demoShoots[0].shootDate, project: demoProject } } },
];

const demoFreelancer: PortalFreelancer = {
  id: 'demo-freelancer',
  code: 'FL-DEMO',
  fullName: 'Freelancer Demo',
  phone: '9876543210',
  whatsapp: '9876543210',
  email: DEMO_EMAIL,
  city: 'Delhi',
  primarySkill: 'PHOTOGRAPHER',
  skills: ['Candid Photography', 'Wedding Portraits', 'Albums'],
  experienceYears: 5,
  rate: 18000,
  rateType: 'PER_DAY',
  status: 'ACTIVE',
  travelAvailable: true,
  maxShootsPerDay: 1,
  equipmentNotes: 'Full-frame camera kit, prime lenses and lighting.',
  subscriptions: [],
  availability: [],
  portfolioItems: [],
  applications: [],
  connections: [],
  assignments: demoShoots.map((shoot) => ({
    id: shoot.assignment?.id ?? shoot.id,
    role: shoot.assignment?.role ?? 'PHOTOGRAPHER',
    status: shoot.assignment?.status ?? 'CONFIRMED',
    agreedAmount: 22000,
    shoot: { id: shoot.id, title: shoot.title, shootDate: shoot.shootDate, status: shoot.status, project: demoProject },
  })),
  payouts: demoPayouts,
};

const demoMe: PortalMe = { freelancer: demoFreelancer, searchable: true };
const demoList = <T>(items: T[]): PortalList<T> => ({ items, meta: { page: 1, limit: items.length || 20, total: items.length, totalPages: 1 } });

function isDemoFreelancerSession() {
  return typeof window !== 'undefined' && window.localStorage.getItem(DEMO_SESSION_KEY) === '1';
}

function setDemoFreelancerSession(active: boolean) {
  if (typeof window === 'undefined') return;
  if (active) window.localStorage.setItem(DEMO_SESSION_KEY, '1');
  else window.localStorage.removeItem(DEMO_SESSION_KEY);
}

export function setFreelancerSessionMarker(active: boolean, maxAge = 60 * 60 * 24 * 7) {
  if (typeof window === 'undefined') return;
  if (!active) {
    document.cookie = `${SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
    return;
  }
  document.cookie = `${SESSION_COOKIE}=1; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

async function portalRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  headers.set('Accept', 'application/json');
  const response = await fetch(`${apiBaseUrl()}/freelancer-portal${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });
  if (response.status === 204) return undefined as T;
  const payload = await response.json().catch(() => null) as Envelope<T> | null;
  if (!response.ok || !payload?.success) {
    throw new ApiError(response.status, payload?.error?.message ?? 'The request could not be completed.', payload?.error?.code, payload?.error?.details);
  }
  return payload.data;
}

export const freelancerPortalApi = {
  submitApplication: (input: PublicApplicationInput) => portalRequest<PortalApplication>('/applications', { method: 'POST', body: JSON.stringify(input) }),
  validateOnboarding: (token: string) => portalRequest<OnboardingValidation>(`/onboarding/${encodeURIComponent(token)}`),
  setOnboardingPassword: (token: string, input: { password: string; confirmPassword: string }) =>
    portalRequest<{ passwordSet: boolean }>(`/onboarding/${encodeURIComponent(token)}/password`, { method: 'POST', body: JSON.stringify(input) }),
  login: async (input: { identifier: string; password: string }) => {
    if (input.identifier.trim().toLowerCase() === DEMO_EMAIL && input.password === DEMO_PASSWORD) {
      setDemoFreelancerSession(true);
      setFreelancerSessionMarker(true);
      return demoMe;
    }
    const result = await portalRequest<{ me: PortalMe; session: { expiresIn?: number } }>('/auth/login', { method: 'POST', body: JSON.stringify(input) });
    setFreelancerSessionMarker(true, result.session.expiresIn);
    return result.me;
  },
  logout: async () => {
    try {
      await portalRequest('/auth/logout', { method: 'POST' });
    } finally {
      setDemoFreelancerSession(false);
      setFreelancerSessionMarker(false);
    }
  },
  me: () => isDemoFreelancerSession() ? Promise.resolve(demoMe) : portalRequest<PortalMe>('/me'),
  dashboard: () => isDemoFreelancerSession()
    ? Promise.resolve({ profile: demoMe, subscription: null, upcomingShoots: demoShoots, todaysWork: { shoots: [demoShoots[0]], tasks: demoTasks }, tasks: demoTasks, payments: { recent: demoPayouts, summary: { paidAmount: 40000, currency: 'INR' } }, notifications: [{ id: 'demo-notification-1', type: 'ASSIGNMENT', title: 'New assignment confirmed', message: 'The studio confirmed your role for Aarav & Meera Wedding.', isRead: false, createdAt: new Date().toISOString() }] })
    : portalRequest<PortalDashboard>('/dashboard'),
  projects: (query = '') => isDemoFreelancerSession() ? Promise.resolve(demoList([{ ...demoProject, shoots: demoShoots }])) : portalRequest<PortalList<PortalProjectSummary & { shoots?: Array<{ id: string; title: string; shootDate: string; status: string }> }>>(`/projects${query}`),
  project: (id: string) => isDemoFreelancerSession() ? Promise.resolve({ ...demoProject, shoots: demoShoots, tasks: demoTasks }) : portalRequest<PortalProjectSummary & { venueAddress?: string | null; shoots: PortalShootSummary[]; tasks: PortalTaskSummary[] }>(`/projects/${encodeURIComponent(id)}`),
  shoots: (query = '') => isDemoFreelancerSession() ? Promise.resolve(demoList(demoShoots)) : portalRequest<PortalList<PortalShootSummary>>(`/shoots${query}`),
  shoot: (id: string) => isDemoFreelancerSession() ? Promise.resolve<PortalShootDetail>({ ...(demoShoots.find((shoot) => shoot.id === id) ?? demoShoots[0]), notes: 'Demo shoot brief. Confirm call time and carry backup cards.', tasks: demoTasks }) : portalRequest<PortalShootDetail>(`/shoots/${encodeURIComponent(id)}`),
  tasks: (query = '') => isDemoFreelancerSession() ? Promise.resolve(demoList(demoTasks)) : portalRequest<PortalList<PortalTaskSummary>>(`/tasks${query}`),
  updateTaskStatus: (id: string, status: string) => portalRequest<PortalTaskSummary>(`/tasks/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  payments: (query = '') => isDemoFreelancerSession() ? Promise.resolve(demoList(demoPayouts)) : portalRequest<PortalList<PortalPayout>>(`/payments${query}`),
  notifications: (query = '') => isDemoFreelancerSession() ? Promise.resolve(demoList([{ id: 'demo-notification-1', type: 'ASSIGNMENT', title: 'New assignment confirmed', message: 'The studio confirmed your role for Aarav & Meera Wedding.', isRead: false, createdAt: new Date().toISOString() }])) : portalRequest<PortalList<PortalNotification>>(`/notifications${query}`),
  updateProfile: (input: Partial<PortalFreelancer>) => portalRequest<PortalFreelancer>('/profile', { method: 'PATCH', body: JSON.stringify(input) }),
  setPassword: (password: string) => portalRequest<{ passwordSet: boolean }>('/password', { method: 'POST', body: JSON.stringify({ password }) }),
  saveAvailability: (input: { date: string; status: AvailabilityStatus; startTime?: string | null; endTime?: string | null; notes?: string | null }) =>
    portalRequest<PortalAvailability>('/availability', { method: 'PUT', body: JSON.stringify(input) }),
  createPortfolioItem: (input: { fileObjectId: string; title: string; description?: string; category?: string; sortOrder?: number; isPublished?: boolean }) =>
    portalRequest<PortalPortfolioItem>('/portfolio', { method: 'POST', body: JSON.stringify(input) }),
  updatePortfolioItem: (id: string, input: Partial<PortalPortfolioItem>) =>
    portalRequest<PortalPortfolioItem>(`/portfolio/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(input) }),
  deletePortfolioItem: (id: string) => portalRequest<void>(`/portfolio/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  plans: () => portalRequest<PortalPlan[]>('/plans'),
};
