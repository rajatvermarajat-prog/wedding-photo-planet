import type { AuthenticatedUser } from '@/components/auth/AuthSessionProvider';
import { safeReturnPath } from './routeProtection';

const ADMIN_ROLE_KEYS = new Set(['admin', 'super_admin', 'owner', 'studio_owner']);
const ADMIN_PERMISSION_KEYS = new Set(['USER_MANAGE', 'PERMISSION_ASSIGN', 'ORG_UPDATE']);

function roleKey(value: string): string {
  return value.trim().toLowerCase().replace(/[\s-]+/g, '_');
}

export function isAdminCrmAccount(user: AuthenticatedUser): boolean {
  const roles = [user.role, ...(user.roles ?? [])].filter(Boolean).map((role) => roleKey(String(role)));
  if (roles.some((role) => ADMIN_ROLE_KEYS.has(role))) return true;
  return (user.permissions ?? []).some((permission) => ADMIN_PERMISSION_KEYS.has(permission));
}

export function isFreelancerAccount(user: AuthenticatedUser | null): boolean {
  return Boolean(user?.freelancerProfile);
}

export function destinationForAuthenticatedUser(user: AuthenticatedUser, requestedReturnTo?: string | null): string {
  const returnTo = safeReturnPath(requestedReturnTo ?? null);
  if (isFreelancerAccount(user)) {
    return returnTo.startsWith('/freelancer/') ? returnTo : '/freelancer/dashboard';
  }
  if (isAdminCrmAccount(user)) {
    return returnTo.startsWith('/freelancer/') ? '/dashboard' : returnTo;
  }
  return returnTo.startsWith('/freelancer/') ? '/dashboard' : returnTo;
}
