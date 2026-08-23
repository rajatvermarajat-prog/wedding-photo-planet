'use client';

import { useEffect, useState } from 'react';
import { AccessRole } from './accessTypes';
import {
  loadPermissionRoles,
  PERMISSION_CHANGE_EVENT,
  PERMISSION_STORAGE_KEY,
  refreshPermissionRoles,
  savePermissionRoles,
  subscribePermissionRoles,
} from './permissionStore';
import { ACCESS_STORAGE_ROLES } from './accessDomain';

export function usePermissionRoles() {
  const [roles, setRoles] = useState<AccessRole[]>(() => loadPermissionRoles());

  useEffect(() => {
    const unsub = subscribePermissionRoles(setRoles);
    const onStorage = (event: StorageEvent) => {
      if (event.key === PERMISSION_STORAGE_KEY || event.key === ACCESS_STORAGE_ROLES) {
        refreshPermissionRoles();
      }
    };
    const onCustom = () => setRoles(loadPermissionRoles());
    window.addEventListener('storage', onStorage);
    window.addEventListener(PERMISSION_CHANGE_EVENT, onCustom);
    return () => {
      unsub();
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(PERMISSION_CHANGE_EVENT, onCustom);
    };
  }, []);

  return [roles, savePermissionRoles] as const;
}
