import { apiRequest, ApiMeta } from './client';

export type BackendCrewRole =
  | 'LEAD_PHOTOGRAPHER'
  | 'CANDID_PHOTOGRAPHER'
  | 'TRADITIONAL_PHOTOGRAPHER'
  | 'CINEMATOGRAPHER'
  | 'TRADITIONAL_VIDEOGRAPHER'
  | 'DRONE_OPERATOR'
  | 'ASSISTANT'
  | 'LIGHT_ASSISTANT'
  | 'LIVE_EDITOR'
  | 'COORDINATOR'
  | 'OTHER';

export type BackendFreelancerStatus = 'ACTIVE' | 'INACTIVE' | 'UNAVAILABLE' | 'SUSPENDED';
export type BackendRateType = 'PER_DAY' | 'PER_HALF_DAY' | 'PER_EVENT' | 'PER_HOUR' | 'FIXED';
export type BackendPaymentMethod =
  | 'CASH'
  | 'UPI'
  | 'BANK_TRANSFER'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'CHEQUE'
  | 'OTHER';

export interface BackendFreelancer {
  id: string;
  code: string;
  fullName: string;
  phone: string;
  whatsapp?: string | null;
  email?: string | null;
  city?: string | null;
  addressLine?: string | null;
  primarySkill?: BackendCrewRole | null;
  skills: string[];
  experienceYears?: number | null;
  rate?: string | number | null;
  rateType?: BackendRateType | null;
  rating?: string | number | null;
  status: BackendFreelancerStatus;
  travelAvailable?: boolean | null;
  maxShootsPerDay?: number | null;
  equipmentNotes?: string | null;
  paymentMethod?: BackendPaymentMethod | null;
  upiId?: string | null;
  bankName?: string | null;
  accountHolder?: string | null;
  accountNumber?: string | null;
  ifsc?: string | null;
  panNumber?: string | null;
  gstNumber?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { assignments?: number };
}

export interface FreelancerListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: BackendFreelancerStatus;
  primarySkill?: BackendCrewRole;
  city?: string;
  sortBy?: 'createdAt' | 'fullName' | 'rate' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

export interface FreelancerSearchQuery {
  q?: string;
  location?: string;
  specialization?: BackendCrewRole;
  skill?: string;
  availabilityDate?: string;
  availabilityStatus?: 'AVAILABLE' | 'PARTIALLY_AVAILABLE' | 'UNAVAILABLE';
  page?: number;
  pageSize?: number;
}

export interface FreelancerSearchResult {
  id: string;
  code: string;
  displayName: string;
  city?: string | null;
  specialization: BackendCrewRole;
  experienceYears?: number | null;
  skills: string[];
  searchable: boolean;
  availability?: { id: string; date: string; status: string; startTime?: string | null; endTime?: string | null } | null;
  portfolioCount: number;
  portfolioPreview: Array<{ id: string; title: string; fileObject?: { id: string; originalName: string; mimeType: string; sizeBytes: string | number } | null }>;
  connection?: { id: string; status: string; projectId?: string | null; shootId?: string | null; createdAt: string } | null;
}

export interface FreelancerConnection {
  id: string;
  freelancerId: string;
  projectId?: string | null;
  shootId?: string | null;
  status: 'INTERESTED' | 'CONTACTED' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED' | 'ASSIGNED';
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  freelancer?: { id: string; code: string; fullName: string; primarySkill: BackendCrewRole; city?: string | null };
  project?: { id: string; projectNumber: string; name: string } | null;
  shoot?: { id: string; title: string; shootDate: string } | null;
}

export interface FreelancerInput {
  fullName: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  city?: string;
  addressLine?: string;
  primarySkill?: BackendCrewRole;
  skills?: string[];
  experienceYears?: number;
  rate?: number;
  rateType?: BackendRateType;
  travelAvailable?: boolean;
  maxShootsPerDay?: number;
  equipmentNotes?: string;
  paymentMethod?: BackendPaymentMethod;
  upiId?: string;
  bankName?: string;
  accountHolder?: string;
  accountNumber?: string;
  ifsc?: string;
  panNumber?: string;
  gstNumber?: string;
  notes?: string;
  status?: BackendFreelancerStatus;
}

const queryString = (query: object = {}) => {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value));
  });
  return params.toString() ? `?${params}` : '';
};

export const freelancersApi = {
  list: async (query?: FreelancerListQuery): Promise<{ data: BackendFreelancer[]; meta: ApiMeta }> =>
    apiRequest<BackendFreelancer[]>(`/freelancers${queryString(query)}`),
  get: async (id: string) => (await apiRequest<BackendFreelancer>(`/freelancers/${encodeURIComponent(id)}`)).data,
  create: async (input: FreelancerInput) =>
    (await apiRequest<BackendFreelancer>('/freelancers', { method: 'POST', body: JSON.stringify(input) })).data,
  update: async (id: string, input: Partial<FreelancerInput>) =>
    (await apiRequest<BackendFreelancer>(`/freelancers/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(input) })).data,
  remove: async (id: string) => apiRequest<void>(`/freelancers/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  search: async (query?: FreelancerSearchQuery): Promise<{ data: FreelancerSearchResult[]; meta: ApiMeta }> =>
    apiRequest<FreelancerSearchResult[]>(`/freelancers/search${queryString(query)}`),
  listConnections: async (query?: { status?: FreelancerConnection['status']; freelancerId?: string; projectId?: string; shootId?: string; page?: number; limit?: number }) =>
    apiRequest<FreelancerConnection[]>(`/freelancers/connections${queryString(query)}`),
  createConnection: async (input: { freelancerId: string; projectId?: string; shootId?: string; status?: FreelancerConnection['status']; notes?: string }) =>
    (await apiRequest<FreelancerConnection>('/freelancers/connections', { method: 'POST', body: JSON.stringify(input) })).data,
  updateConnection: async (id: string, input: { status?: FreelancerConnection['status']; notes?: string | null }) =>
    (await apiRequest<FreelancerConnection>(`/freelancers/connections/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(input) })).data,
  connect: async (id: string, input: { projectId: string; shootId?: string; role?: BackendCrewRole; notes?: string }) =>
    (await apiRequest<{ connection: FreelancerConnection; assignment?: unknown }>(`/freelancers/connections/${encodeURIComponent(id)}/connect`, { method: 'POST', body: JSON.stringify(input) })).data,
};
