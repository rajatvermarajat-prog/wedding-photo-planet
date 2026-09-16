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

const queryString = (query: FreelancerListQuery = {}) => {
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
};
