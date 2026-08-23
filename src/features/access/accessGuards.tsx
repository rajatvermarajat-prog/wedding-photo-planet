'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { AccessRole, AccessUser, PermissionScope } from './accessTypes';
import { hasPermission, resolveAccessRole } from './accessDomain';

interface PermissionContextValue {
  user: AccessUser | null;
  roles: AccessRole[];
  can: (key: string, scope?: PermissionScope) => boolean;
  role?: AccessRole;
}

const PermissionContext = createContext<PermissionContextValue>({
  user: null,
  roles: [],
  can: () => false,
});

export function PermissionProvider({
  user,
  roles,
  children,
}: {
  user: AccessUser | null;
  roles: AccessRole[];
  children: React.ReactNode;
}) {
  const value = useMemo<PermissionContextValue>(() => {
    const role = resolveAccessRole(user, roles);
    return {
      user,
      roles,
      role,
      can: (key, scope) => hasPermission(user, roles, key, scope),
    };
  }, [user, roles]);
  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}

export function usePermission() {
  return useContext(PermissionContext);
}

export function useRole() {
  return useContext(PermissionContext).role;
}

export function Can({
  permission,
  scope,
  children,
  fallback = null,
}: {
  permission: string;
  scope?: PermissionScope;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { can } = usePermission();
  return can(permission, scope) ? <>{children}</> : <>{fallback}</>;
}

export function PermissionGuard({
  permission,
  scope,
  children,
  fallback = null,
}: {
  permission: string;
  scope?: PermissionScope;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <Can permission={permission} scope={scope} fallback={fallback}>
      {children}
    </Can>
  );
}

export function RoleGuard({
  roleId,
  children,
  fallback = null,
}: {
  roleId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const role = useRole();
  return role?.id === roleId ? <>{children}</> : <>{fallback}</>;
}
