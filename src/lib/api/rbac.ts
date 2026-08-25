import { apiRequest } from './client';

export interface BackendPermission { id: string; key: string; module: string; label: string; description: string | null; isSensitive: boolean; }
export interface BackendRole {
  id: string; name: string; description: string | null; type: 'SYSTEM' | 'CUSTOM'; isDefault: boolean; createdAt: string; updatedAt: string;
  rolePermissions: Array<{ permission: Pick<BackendPermission, 'key' | 'module'> }>;
  _count: { userRoles: number };
}

export const rbacApi = {
  async listRoles(): Promise<BackendRole[]> { const { data } = await apiRequest<BackendRole[]>('/roles'); return data; },
  async listPermissions(): Promise<BackendPermission[]> { const { data } = await apiRequest<BackendPermission[]>('/permissions'); return data; },
  async createRole(input: { name: string; description?: string; permissionKeys: string[] }): Promise<BackendRole> { const { data } = await apiRequest<BackendRole>('/roles', { method: 'POST', body: JSON.stringify(input) }); return data; },
  async updateRole(id: string, input: { name?: string; description?: string }): Promise<BackendRole> { const { data } = await apiRequest<BackendRole>(`/roles/${id}`, { method: 'PATCH', body: JSON.stringify(input) }); return data; },
  async setRolePermissions(id: string, permissionKeys: string[]): Promise<BackendRole> { const { data } = await apiRequest<BackendRole>(`/roles/${id}/permissions`, { method: 'PUT', body: JSON.stringify({ permissionKeys }) }); return data; },
  async removeRole(id: string): Promise<void> { await apiRequest<void>(`/roles/${id}`, { method: 'DELETE' }); },
};
