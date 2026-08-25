'use client';

import { useCallback, useEffect, useState } from 'react';
import { rbacApi, type BackendPermission, type BackendRole } from '@/lib/api/rbac';

export function useRbac(enabled = true) {
  const [roles, setRoles] = useState<BackendRole[]>([]);
  const [permissions, setPermissions] = useState<BackendPermission[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);
  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true); setError(null);
    try { const [nextRoles, nextPermissions] = await Promise.all([rbacApi.listRoles(), rbacApi.listPermissions()]); setRoles(nextRoles); setPermissions(nextPermissions); }
    catch (reason) { setError(reason instanceof Error ? reason : new Error('Unable to load roles and permissions.')); }
    finally { setLoading(false); }
  }, [enabled]);
  useEffect(() => { if (enabled) void refresh(); }, [enabled, refresh]);
  return { roles, permissions, loading, error, refresh };
}
