import { ApiError, ApiMeta } from './client';

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5050/api/v1';
const baseUrl = configuredApiUrl.replace(/[“”"']/g, '').trim().replace(/\/$/, '');
const ACCESS_KEY = 'wpp.freelancerAccessToken';
const SESSION_COOKIE = 'wpp_freelancer_session';

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
  objectKey: string;
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
  notes?: string | null;
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

interface Envelope<T> { success: boolean; data: T; meta?: ApiMeta; error?: { message?: string; code?: string; details?: unknown[] } }

export function setFreelancerToken(token: string | null, maxAge = 60 * 60 * 24 * 7) {
  if (typeof window === 'undefined') return;
  if (!token) {
    window.localStorage.removeItem(ACCESS_KEY);
    document.cookie = `${SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
    return;
  }
  window.localStorage.setItem(ACCESS_KEY, token);
  document.cookie = `${SESSION_COOKIE}=1; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

export function getFreelancerToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(ACCESS_KEY);
}

async function portalRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  headers.set('Accept', 'application/json');
  const token = getFreelancerToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
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
  login: async (input: { identifier: string; password: string }) => {
    const result = await portalRequest<{ me: PortalMe; tokens: { accessToken: string; accessTokenExpiresIn?: number; refreshTokenExpiresIn?: number } }>('/auth/login', { method: 'POST', body: JSON.stringify(input) });
    setFreelancerToken(result.tokens.accessToken, result.tokens.refreshTokenExpiresIn);
    return result.me;
  },
  logout: async () => {
    try {
      await portalRequest('/auth/logout', { method: 'POST' });
    } finally {
      setFreelancerToken(null);
    }
  },
  me: () => portalRequest<PortalMe>('/me'),
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
