import { apiRequest, ApiError, ApiMeta } from './client';

export type BackendUserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DISABLED';

export interface BackendUserRole {
  role: { id: string; name: string; type: 'SYSTEM' | 'CUSTOM' };
}

export interface BackendUser {
  id: string;
  organizationId: string;
  branchId: string | null;
  employeeCode: string | null;
  fullName: string;
  email: string;
  phone: string | null;
  status: BackendUserStatus;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  userRoles: BackendUserRole[];
  employeeProfile: {
    employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN' | null;
    joiningDate: string | null;
    workLocation: 'OFFICE' | 'WFH' | 'HYBRID' | 'ON_SHOOT' | null;
    skills: string[];
  } | null;
}

export interface UserListQuery { page?: number; limit?: number; search?: string; status?: BackendUserStatus; roleId?: string; branchId?: string; }
export interface CreateUserInput {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  employeeCode?: string;
  branchId?: string;
  roleIds: string[];
}
export interface UpdateUserInput { fullName?: string; phone?: string; employeeCode?: string; branchId?: string; status?: BackendUserStatus; }

function queryString(query: UserListQuery): string {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => { if (value !== undefined && value !== '') params.set(key, String(value)); });
  const value = params.toString();
  return value ? `?${value}` : '';
}

export const usersApi = {
  async list(query: UserListQuery = {}): Promise<{ items: BackendUser[]; meta: ApiMeta }> {
    try {
      const response = await apiRequest<BackendUser[]>(`/team${queryString(query)}`);
      return { items: Array.isArray(response.data) ? response.data : [], meta: response.meta };
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 403) throw error;
      const response = await apiRequest<BackendUser[]>(`/users${queryString(query)}`);
      return { items: Array.isArray(response.data) ? response.data : [], meta: response.meta };
    }
  },
  async create(input: CreateUserInput): Promise<BackendUser> {
    const { data } = await apiRequest<BackendUser>('/users', { method: 'POST', body: JSON.stringify(input) });
    return data;
  },
  async update(id: string, input: UpdateUserInput): Promise<BackendUser> {
    const { data } = await apiRequest<BackendUser>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
    return data;
  },
  async setRoles(id: string, roleIds: string[]): Promise<BackendUser> {
    const { data } = await apiRequest<BackendUser>(`/users/${id}/roles`, { method: 'PUT', body: JSON.stringify({ roleIds }) });
    return data;
  },
  async remove(id: string): Promise<void> { await apiRequest<void>(`/users/${id}`, { method: 'DELETE' }); },
};
