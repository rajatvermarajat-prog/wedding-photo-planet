'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { rbacApi, type BackendPermission, type BackendRole } from '@/lib/api/rbac';

/**
 * Roles and the permission catalogue are fetched independently: the table only
 * needs roles, so waiting for both before painting anything made the screen feel
 * slower than it is. The catalogue is session-stable and served from the request
 * cache after the first load.
 */
export function useRbac(enabled = true) {
  const [roles, setRoles] = useState<BackendRole[]>([]);
  const [permissions, setPermissions] = useState<BackendPermission[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);
  const loaded = useRef(false);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    // A refresh after a write keeps the current table on screen; only the very
    // first load blocks on a spinner.
    if (!loaded.current) setLoading(true);
    setError(null);

    const catalogue = rbacApi
      .listPermissions()
      .then(setPermissions)
      .catch(() => undefined);

    try {
      setRoles(await rbacApi.listRoles());
      loaded.current = true;
    } catch (reason) {
      setError(reason instanceof Error ? reason : new Error('Unable to load roles and permissions.'));
    } finally {
      setLoading(false);
    }

    await catalogue;
  }, [enabled]);

  useEffect(() => {
    if (enabled) void refresh();
  }, [enabled, refresh]);

  return { roles, permissions, loading, error, refresh };
}
