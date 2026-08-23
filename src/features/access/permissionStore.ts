import { AccessRole } from './accessTypes';
import { ACCESS_STORAGE_ROLES, mergeAccessRoles } from './accessDomain';

export const PERMISSION_STORAGE_KEY = 'wedding_crm_permissions';
export const PERMISSION_CHANGE_EVENT = 'wedding-crm-permissions';

const LEGACY_KEYS = [ACCESS_STORAGE_ROLES, 'wpp_crm_access_roles'];

let memory: AccessRole[] | null = null;
const listeners = new Set<(roles: AccessRole[]) => void>();

function parseRoles(raw: string | null): AccessRole[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function readFromStorage(): AccessRole[] {
  if (typeof window === 'undefined') return mergeAccessRoles(null);
  const current = parseRoles(window.localStorage.getItem(PERMISSION_STORAGE_KEY));
  if (current) return mergeAccessRoles(current);
  for (const key of LEGACY_KEYS) {
    const legacy = parseRoles(window.localStorage.getItem(key));
    if (legacy) {
      const merged = mergeAccessRoles(legacy);
      window.localStorage.setItem(PERMISSION_STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
  }
  return mergeAccessRoles(null);
}

function emit(roles: AccessRole[]) {
  listeners.forEach((fn) => fn(roles));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PERMISSION_CHANGE_EVENT));
  }
}

export function loadPermissionRoles(): AccessRole[] {
  if (!memory) memory = readFromStorage();
  return memory;
}

export function savePermissionRoles(roles: AccessRole[]) {
  memory = roles;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(PERMISSION_STORAGE_KEY, JSON.stringify(roles));
    window.localStorage.setItem(ACCESS_STORAGE_ROLES, JSON.stringify(roles));
  }
  emit(roles);
}

export function subscribePermissionRoles(fn: (roles: AccessRole[]) => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function refreshPermissionRoles() {
  memory = readFromStorage();
  emit(memory);
}
