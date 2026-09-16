import { describe, expect, it } from 'vitest';
import { AccessRole, PermissionModule } from './accessTypes';
import {
  assignableRoles,
  enabledPermissionKeys,
  filterRoles,
  individualAccessRoles,
  rolePermissionPreview,
  roleTemplates,
} from './roleSelection';
import { backendKeysFor, canonicalPermissionKey, hasPermission } from './accessDomain';

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
  role({ id: '1', name: 'Admin', type: 'system', assignable: false, userCount: 1 }),
  role({ id: '2', name: 'Manager', type: 'system', userCount: 2 }),
  role({
    id: '3',
    name: 'Account Manager',
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
    expect(filterRoles(roles, { query: 'account' }).map((r) => r.name)).toEqual(['Account Manager']);
    expect(filterRoles(roles, { query: 'leads' }).map((r) => r.name)).toEqual(['Account Manager']);
  });

  it('filters by system or custom', () => {
    expect(filterRoles(roles, { type: 'system' }).map((r) => r.name)).toEqual(['Admin', 'Manager']);
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
    expect(assignableRoles(roles).map((r) => r.name)).toEqual(['Manager', 'Account Manager']);
  });

  it('hides another employee’s personal role', () => {
    const withPersonal = [
      ...roles,
      role({ id: '5', name: 'Kirti — MANAGER', personalForUserId: 'user-kirti' }),
    ];
    expect(assignableRoles(withPersonal).map((r) => r.name)).toEqual(['Manager', 'Account Manager']);
    expect(assignableRoles(withPersonal, 'user-swati').map((r) => r.name)).toEqual([
      'Manager',
      'Account Manager',
    ]);
  });

  it('excludes personal roles even while editing their owner', () => {
    const withPersonal = [
      ...roles,
      role({ id: '5', name: 'Kirti — MANAGER', personalForUserId: 'user-kirti' }),
    ];
    expect(assignableRoles(withPersonal, 'user-kirti').map((r) => r.name)).toEqual([
      'Manager',
      'Account Manager',
    ]);
  });
});

describe('role presentation', () => {
  it('keeps one canonical row for case-only system-role duplicates and orders templates', () => {
    const display = roleTemplates([
      role({ id: '1', name: 'Admin', type: 'system' }),
      role({ id: '2', name: 'ADMIN', type: 'system' }),
      role({ id: '3', name: 'MEMBER', type: 'system' }),
      role({ id: '4', name: 'Manager', type: 'system' }),
      role({ id: '5', name: 'MANAGER', type: 'system' }),
      role({ id: '6', name: 'Zebra' }),
      role({ id: '7', name: 'Apple' }),
      role({ id: '8', name: 'Kirti — MANAGER', personalForUserId: 'user-kirti' }),
    ]);
    expect(display.map((entry) => entry.name)).toEqual(['Admin', 'Manager']);
  });

  it('keeps personal roles out of templates and in their own display list', () => {
    const personal = role({ id: '5', name: 'Kirti — MANAGER', personalForUserId: 'user-kirti' });
    expect(roleTemplates([...roles, personal])).not.toContain(personal);
    expect(individualAccessRoles([...roles, personal])).toEqual([]);
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
  it('normalizes UI aliases to canonical backend keys', () => {
    expect(canonicalPermissionKey('finance.view_payment_milestones')).toBe('PAYMENT_MILESTONE_VIEW');
    expect(canonicalPermissionKey('weddings.view_financial')).toBe('PROJECT_FINANCIAL_VIEW');
    expect(backendKeysFor('employees.view')).toEqual(['TEAM_VIEW', 'TEAM_VIEW_ALL']);
  });

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

  it('applies canonicalization to legacy role grants and explicit denials', () => {
    const legacyRole = role({
      id: 'legacy',
      name: 'Legacy UI role',
      grants: { PROJECT_VIEW: { enabled: true }, PAYMENT_VIEW: { enabled: true } },
    });
    expect(hasPermission({ accessRoleId: 'legacy' }, [legacyRole], 'weddings.view')).toBe(true);
    expect(hasPermission({ accessRoleId: 'legacy', deniedPermissions: ['PROJECT_VIEW'] }, [legacyRole], 'weddings.view')).toBe(false);
    expect(hasPermission({ extraPermissions: ['PAYMENT_MILESTONE_VIEW'] }, [], 'finance.view_payment_milestones')).toBe(true);
  });
});
