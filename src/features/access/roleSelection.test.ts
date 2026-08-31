import { describe, expect, it } from 'vitest';
import { AccessRole, PermissionModule } from './accessTypes';
import {
  assignableRoles,
  enabledPermissionKeys,
  filterRoles,
  rolePermissionPreview,
} from './roleSelection';
import { hasPermission } from './accessDomain';

const role = (over: Partial<AccessRole> & { id: string; name: string }): AccessRole => ({
  description: '',
  type: 'custom',
  status: 'active',
  grants: {},
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
  userCount: 0,
  assignable: true,
  ...over,
});

const roles: AccessRole[] = [
  role({ id: '1', name: 'ADMIN', type: 'system', assignable: false, userCount: 1 }),
  role({ id: '2', name: 'MEMBER', type: 'system', userCount: 2 }),
  role({
    id: '3',
    name: 'Sales Manager',
    description: 'Leads, clients and sales operations',
    grants: { LEAD_VIEW: { enabled: true }, LEAD_CREATE: { enabled: true }, CLIENT_VIEW: { enabled: true } },
  }),
  role({ id: '4', name: 'Retired Desk', status: 'inactive' }),
];

describe('filterRoles', () => {
  it('returns every role when nothing is filtered', () => {
    expect(filterRoles(roles, {})).toHaveLength(4);
  });

  it('searches name and description', () => {
    expect(filterRoles(roles, { query: 'sales' }).map((r) => r.name)).toEqual(['Sales Manager']);
    expect(filterRoles(roles, { query: 'leads' }).map((r) => r.name)).toEqual(['Sales Manager']);
  });

  it('filters by system or custom', () => {
    expect(filterRoles(roles, { type: 'system' }).map((r) => r.name)).toEqual(['ADMIN', 'MEMBER']);
    expect(filterRoles(roles, { type: 'custom' })).toHaveLength(2);
  });

  it('filters by status', () => {
    expect(filterRoles(roles, { status: 'inactive' }).map((r) => r.name)).toEqual(['Retired Desk']);
  });

  it('combines filters', () => {
    expect(filterRoles(roles, { query: 'desk', type: 'custom', status: 'active' })).toEqual([]);
  });
});

describe('assignableRoles', () => {
  it('drops roles the server flagged as unassignable and inactive ones', () => {
    expect(assignableRoles(roles).map((r) => r.name)).toEqual(['MEMBER', 'Sales Manager']);
  });

  it('hides another employee’s personal role', () => {
    const withPersonal = [
      ...roles,
      role({ id: '5', name: 'Kirti — MANAGER', personalForUserId: 'user-kirti' }),
    ];
    expect(assignableRoles(withPersonal).map((r) => r.name)).toEqual(['MEMBER', 'Sales Manager']);
    expect(assignableRoles(withPersonal, 'user-swati').map((r) => r.name)).toEqual([
      'MEMBER',
      'Sales Manager',
    ]);
  });

  it('keeps a personal role visible for its own employee', () => {
    const withPersonal = [
      ...roles,
      role({ id: '5', name: 'Kirti — MANAGER', personalForUserId: 'user-kirti' }),
    ];
    expect(assignableRoles(withPersonal, 'user-kirti').map((r) => r.name)).toEqual([
      'MEMBER',
      'Sales Manager',
      'Kirti — MANAGER',
    ]);
  });
});

describe('enabledPermissionKeys', () => {
  it('returns only enabled grants', () => {
    const keys = enabledPermissionKeys({
      grants: { LEAD_VIEW: { enabled: true }, LEAD_DELETE: { enabled: false } },
    });
    expect(keys).toEqual(['LEAD_VIEW']);
  });
});

describe('rolePermissionPreview', () => {
  const modules: PermissionModule[] = [
    {
      id: 'lead',
      label: 'Leads',
      description: '',
      permissions: [{ key: 'LEAD_VIEW', label: 'View' }, { key: 'LEAD_CREATE', label: 'Create' }],
    },
    {
      id: 'finance',
      label: 'Finance',
      description: '',
      permissions: [{ key: 'PAYMENT_VIEW', label: 'View payments' }],
    },
  ];

  it('counts granted permissions per module and hides empty modules', () => {
    expect(rolePermissionPreview(roles[2], modules)).toEqual([{ module: 'Leads', count: 2 }]);
  });

  it('returns nothing without a role', () => {
    expect(rolePermissionPreview(null, modules)).toEqual([]);
  });
});

describe('hasPermission', () => {
  it('resolves through the backend permission keys on the session user', () => {
    const user = { permissions: ['PROJECT_VIEW', 'ROLE_VIEW'] };
    expect(hasPermission(user, [], 'weddings.view')).toBe(true);
    expect(hasPermission(user, [], 'ROLE_VIEW')).toBe(true);
    expect(hasPermission(user, [], 'weddings.delete')).toBe(false);
    expect(hasPermission(user, [], 'ROLE_DELETE')).toBe(false);
  });

  it('denies everything without a user', () => {
    expect(hasPermission(null, [], 'weddings.view')).toBe(false);
  });

  it('treats an employee edit as satisfied by either backing permission', () => {
    expect(hasPermission({ permissions: ['TEAM_MANAGE'] }, [], 'employees.edit')).toBe(true);
    expect(hasPermission({ permissions: ['USER_UPDATE'] }, [], 'employees.edit')).toBe(true);
    expect(hasPermission({ permissions: ['USER_VIEW'] }, [], 'employees.edit')).toBe(false);
  });
});
