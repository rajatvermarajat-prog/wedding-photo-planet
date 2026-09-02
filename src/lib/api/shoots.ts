import { apiRequest, ApiMeta } from './client';

export type BackendShootStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED';
export type BackendShootType = 'PHOTO' | 'VIDEO' | 'PHOTO_AND_VIDEO' | 'DRONE' | 'CANDID' | 'TRADITIONAL' | 'PRE_WEDDING' | 'OTHER';
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

export interface BackendShootAssignment {
  id: string;
  role: BackendCrewRole;
  dataReceived?: boolean;
  dataSizeGb?: string | number | null;
  storageReference?: string | null;
  notes?: string | null;
  user?: { id: string; fullName: string } | null;
  freelancer?: { id: string; fullName: string; code?: string } | null;
}

export interface BackendShoot {
  id: string;
  projectId: string;
  title: string;
  shootDate: string;
  startTime?: string | null;
  endTime?: string | null;
  location?: string | null;
  city?: string | null;
  notes?: string | null;
  status: BackendShootStatus;
  dataSizeGb?: string | number | null;
  dataReceivedAt?: string | null;
  backupDoneAt?: string | null;
  assignments?: BackendShootAssignment[];
  project?: { id: string; name: string };
}

export interface CreateShootInput {
  projectId: string;
  title: string;
  shootDate: string;
  location?: string;
  city?: string;
  notes?: string;
  shootType?: BackendShootType;
}

export interface UpdateShootInput {
  title?: string;
  shootDate?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  notes?: string;
  status?: BackendShootStatus;
  dataSizeGb?: string | number;
  dataReceivedAt?: string;
  backupDoneAt?: string;
}

export interface UpdateAssignmentInput {
  dataReceived?: boolean;
  dataSizeGb?: string | number;
  storageReference?: string;
  notes?: string;
}

export interface AssignCrewInput {
  userId?: string;
  freelancerId?: string;
  role: BackendCrewRole;
}

function queryString(query: Record<string, string | number | undefined> = {}) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value));
  });
  const value = params.toString();
  return value ? `?${value}` : '';
}

export const shootsApi = {
  async list(query: { page?: number; limit?: number; projectId?: string } = {}): Promise<{ items: BackendShoot[]; meta: ApiMeta }> {
    const response = await apiRequest<BackendShoot[]>(`/shoots${queryString(query)}`);
    return { items: Array.isArray(response.data) ? response.data : [], meta: response.meta };
  },
  async create(input: CreateShootInput): Promise<BackendShoot> {
    const { data } = await apiRequest<BackendShoot>('/shoots', { method: 'POST', body: JSON.stringify(input) });
    return data;
  },
  async update(id: string, input: UpdateShootInput): Promise<BackendShoot> {
    const { data } = await apiRequest<BackendShoot>(`/shoots/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(input) });
    return data;
  },
  async remove(id: string): Promise<void> {
    await apiRequest<void>(`/shoots/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },
  async assign(id: string, input: AssignCrewInput): Promise<BackendShootAssignment> {
    const { data } = await apiRequest<BackendShootAssignment>(`/shoots/${encodeURIComponent(id)}/assignments`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return data;
  },
  async updateAssignment(id: string, assignmentId: string, input: UpdateAssignmentInput): Promise<BackendShootAssignment> {
    const { data } = await apiRequest<BackendShootAssignment>(
      `/shoots/${encodeURIComponent(id)}/assignments/${encodeURIComponent(assignmentId)}`,
      { method: 'PATCH', body: JSON.stringify(input) },
    );
    return data;
  },
  async removeAssignment(id: string, assignmentId: string): Promise<void> {
    await apiRequest<void>(`/shoots/${encodeURIComponent(id)}/assignments/${encodeURIComponent(assignmentId)}`, { method: 'DELETE' });
  },
};
