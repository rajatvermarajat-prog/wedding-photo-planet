import { apiRequest, ApiMeta } from './client';

export type BackendLeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL_SENT' | 'NEGOTIATION' | 'WON' | 'LOST';
export type BackendProjectType =
  | 'ROKA'
  | 'ENGAGEMENT'
  | 'PRE_WEDDING'
  | 'WEDDING'
  | 'COMPLETE_WEDDING_SERVICES'
  | 'HALDI_MEHENDI'
  | 'SANGEET'
  | 'RECEPTION'
  | 'ANNIVERSARY'
  | 'CORPORATE'
  | 'OTHER';

export interface BackendLeadSource {
  id: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
}

export interface BackendLead {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  sourceId?: string | null;
  eventType?: BackendProjectType | null;
  eventDate?: string | null;
  venueCity?: string | null;
  estimatedValue?: string | number | null;
  status: BackendLeadStatus;
  ownerId?: string | null;
  nextFollowUpAt?: string | null;
  notes?: string | null;
  lostReason?: string | null;
  createdAt: string;
  updatedAt: string;
  source?: BackendLeadSource | null;
  owner?: { id: string; fullName: string; email?: string | null } | null;
  createdBy?: { id: string; fullName: string; email?: string | null } | null;
}

export interface LeadListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: BackendLeadStatus;
  ownerId?: string;
  sourceId?: string;
  sortBy?: 'createdAt' | 'name' | 'estimatedValue' | 'nextFollowUpAt';
  sortOrder?: 'asc' | 'desc';
}

export interface LeadInput {
  name: string;
  phone: string;
  email?: string;
  sourceId?: string;
  eventType?: BackendProjectType;
  eventDate?: string;
  venueCity?: string;
  estimatedValue?: number;
  ownerId?: string;
  nextFollowUpAt?: string;
  notes?: string;
}

export type LeadUpdateInput = Partial<LeadInput> & {
  status?: BackendLeadStatus;
  lostReason?: string;
};

const queryString = (query: LeadListQuery = {}) => {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value));
  });
  return params.toString() ? `?${params}` : '';
};

export const leadsApi = {
  list: async (query?: LeadListQuery): Promise<{ data: BackendLead[]; meta: ApiMeta }> =>
    apiRequest<BackendLead[]>(`/leads${queryString(query)}`),
  get: async (id: string) => (await apiRequest<BackendLead>(`/leads/${encodeURIComponent(id)}`)).data,
  create: async (input: LeadInput) =>
    (await apiRequest<BackendLead>('/leads', { method: 'POST', body: JSON.stringify(input) })).data,
  update: async (id: string, input: LeadUpdateInput) =>
    (await apiRequest<BackendLead>(`/leads/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(input) })).data,
  remove: async (id: string) => apiRequest<void>(`/leads/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  sources: async () => apiRequest<BackendLeadSource[]>('/leads/sources?limit=100'),
};
