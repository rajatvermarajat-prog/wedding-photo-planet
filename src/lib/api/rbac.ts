import { apiRequest } from './client';

export interface BackendPermission { id: string; key: string; module: string; label: string; description: string | null; isSensitive: boolean; }
export interface BackendRole {
  id: string; name: string; description: string | null; type: 'SYSTEM' | 'CUSTOM'; status: 'ACTIVE' | 'INACTIVE';
  isDefault: boolean; createdAt: string; updatedAt: string;
  rolePermissions: Array<{ permission: Pick<BackendPermission, 'key'> }>;
  _count: { userRoles: number };
  /** Server-computed: the signed-in actor may hand this role to an employee. */
  assignable?: boolean;
}

export interface RoleAuditEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  summary: string | null;
  oldData: { permissions?: string[]; name?: string; status?: string } | null;
  newData: { permissions?: string[]; added?: string[]; removed?: string[]; name?: string; status?: string } | null;
  createdAt: string;
  actor: { id: string; fullName: string } | null;
}

export interface RoleMember {
  id: string;
  fullName: string;
  email: string;
  employeeCode: string | null;
  status: string;
  assignedAt: string;
  roles: Array<{ id: string; name: string; type: 'SYSTEM' | 'CUSTOM' }>;
}

export const rbacApi = {
  async listRoles(): Promise<BackendRole[]> { const { data } = await apiRequest<BackendRole[]>('/roles'); return data; },
  async listPermissions(): Promise<BackendPermission[]> { const { data } = await apiRequest<BackendPermission[]>('/permissions'); return data; },
  async createRole(input: { name: string; description?: string; status?: 'ACTIVE' | 'INACTIVE'; permissionKeys: string[] }): Promise<BackendRole> { const { data } = await apiRequest<BackendRole>('/roles', { method: 'POST', body: JSON.stringify(input) }); return data; },
  async updateRole(id: string, input: { name?: string; description?: string; status?: 'ACTIVE' | 'INACTIVE' }): Promise<BackendRole> { const { data } = await apiRequest<BackendRole>(`/roles/${id}`, { method: 'PATCH', body: JSON.stringify(input) }); return data; },
  async setRolePermissions(id: string, permissionKeys: string[]): Promise<BackendRole> { const { data } = await apiRequest<BackendRole>(`/roles/${id}/permissions`, { method: 'PUT', body: JSON.stringify({ permissionKeys }) }); return data; },
  async removeRole(id: string): Promise<void> { await apiRequest<void>(`/roles/${id}`, { method: 'DELETE' }); },
  async roleUsers(id: string): Promise<RoleMember[]> { const { data } = await apiRequest<RoleMember[]>(`/roles/${id}/users`); return data; },
  /** Role-scoped slice of the shared audit trail; needs `AUDIT_VIEW`. */
  async roleAudit(limit = 25): Promise<RoleAuditEntry[]> {
    const { data } = await apiRequest<RoleAuditEntry[]>(`/audit?entityType=Role&limit=${limit}`);
    return data;
  },
};
