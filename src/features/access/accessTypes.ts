export type PermissionScope = 'all' | 'assigned' | 'team' | 'own' | 'custom';
export type AccessRoleType = 'system' | 'custom';
export type AccessRoleStatus = 'active' | 'inactive';

export interface PermissionDef {
  key: string;
  label: string;
  description?: string;
  scopes?: PermissionScope[];
  sensitive?: boolean;
}

export interface PermissionModule {
  id: string;
  label: string;
  description: string;
  permissions: PermissionDef[];
}

export interface PermissionGrant {
  enabled: boolean;
  scope?: PermissionScope;
  customIds?: string[];
}

export interface AccessRole {
  id: string;
  name: string;
  description: string;
  type: AccessRoleType;
  status: AccessRoleStatus;
  grants: Record<string, PermissionGrant>;
  createdAt: string;
  updatedAt: string;
}

export interface AccessAuditEntry {
  id: string;
  roleId: string;
  roleName: string;
  added: string[];
  removed: string[];
  changedBy: string;
  date: string;
}

export type AccessUser = {
  id?: string;
  name?: string;
  role?: string;
  accessRoleId?: string;
  extraPermissions?: string[];
  deniedPermissions?: string[];
  /** Authoritative permission keys returned by GET /auth/me. */
  permissions?: string[];
};
