import { describe, expect, it } from 'vitest';
import { destinationForAuthenticatedUser, isFreelancerAccount } from './accountRouting';
import type { AuthenticatedUser } from '@/components/auth/AuthSessionProvider';

function user(overrides: Partial<AuthenticatedUser> = {}): AuthenticatedUser {
  return {
    id: 'user-1',
    organizationId: 'org-1',
    branchId: null,
    email: 'user@example.com',
    fullName: 'Test User',
    name: 'Test User',
    employeeCode: null,
    status: 'active',
    role: 'User',
    roles: ['User'],
    permissions: [],
    organization: { id: 'org-1', name: 'Studio', slug: 'studio', currency: 'INR', timezone: 'Asia/Kolkata' },
    freelancerProfile: null,
    ...overrides,
  };
}

describe('authenticated account routing', () => {
  it('uses freelancerProfile as the freelancer source of truth', () => {
    expect(isFreelancerAccount(user())).toBe(false);
    expect(isFreelancerAccount(user({ freelancerProfile: { id: 'freelancer-1', status: 'ACTIVE' } }))).toBe(true);
  });

  it('routes freelancer accounts to the freelancer dashboard even with a stale CRM returnTo', () => {
    const freelancer = user({ freelancerProfile: { id: 'freelancer-1', status: 'ACTIVE' } });
    expect(destinationForAuthenticatedUser(freelancer, '/dashboard')).toBe('/freelancer/dashboard');
    expect(destinationForAuthenticatedUser(freelancer, '/projects')).toBe('/freelancer/dashboard');
  });

  it('preserves valid freelancer return paths for freelancer accounts', () => {
    const freelancer = user({ freelancerProfile: { id: 'freelancer-1', status: 'ACTIVE' } });
    expect(destinationForAuthenticatedUser(freelancer, '/freelancer/projects')).toBe('/freelancer/projects');
  });

  it('routes CRM accounts away from freelancer return paths', () => {
    expect(destinationForAuthenticatedUser(user({ roles: ['Admin'], role: 'Admin' }), '/freelancer/dashboard')).toBe('/dashboard');
    expect(destinationForAuthenticatedUser(user({ roles: ['Admin'], role: 'Admin' }), '/projects')).toBe('/projects');
  });
});
