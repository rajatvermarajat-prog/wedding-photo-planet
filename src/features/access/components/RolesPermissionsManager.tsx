'use client';

import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  Eye,
  Pencil,
  Plus,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { TeamMember } from '@/types';
import { ConfirmDeleteModal } from '@/components/common/ConfirmDeleteModal';
import { useToast } from '@/components/common';
import { Badge, BTN_CREAM, BTN_GHOST, BTN_PRIMARY, CARD, EmptyState, FIELD, KpiCard, LABEL, Modal, ModalHero } from '@/features/team/components/TeamUiKit';
import { AccessAuditEntry, AccessRole, PermissionGrant, PermissionModule, PermissionScope } from '../accessTypes';
import { enabledCount, SCOPE_LABELS } from '../accessDomain';

interface Props {
  roles: AccessRole[];
  audit: AccessAuditEntry[];
  team: TeamMember[];
  currentUserName: string;
  permissions: PermissionModule[];
  onCreateRole: (input: { name: string; description: string; permissionKeys: string[] }) => Promise<void>;
  onUpdateRole: (input: { id: string; name: string; description: string; permissionKeys: string[] }) => Promise<void>;
  onDeleteRole: (id: string) => Promise<void>;
}

const Switch = ({ on, disabled, onClick }: { on: boolean; disabled?: boolean; onClick: () => void }) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    disabled={disabled}
    onClick={onClick}
    className={`relative h-6 w-11 shrink-0 rounded-full transition ${
      on ? 'bg-[#8f3655]' : 'bg-[#ded5cf]'
    } disabled:opacity-50`}
  >
    <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition ${on ? 'left-5' : 'left-0.5'}`} />
  </button>
);

export const RolesPermissionsManager: React.FC<Props> = ({
  roles,
  audit,
  team,
  currentUserName,
  permissions,
  onCreateRole,
  onUpdateRole,
  onDeleteRole,
}) => {
  const { showToast } = useToast();
  const [query, setQuery] = useState('');
  const [editorRoleId, setEditorRoleId] = useState<string | null>(null);
  const [readOnly, setReadOnly] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createDesc, setCreateDesc] = useState('');
  const [deleting, setDeleting] = useState<AccessRole | null>(null);
  const [showAudit, setShowAudit] = useState(false);

  const usersFor = (role: AccessRole) =>
    team.filter((m) => m.accessRoleId === role.id || (!m.accessRoleId && role.id === fallbackRoleId(m.role))).length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return roles.filter((r) => !q || `${r.name} ${r.description}`.toLowerCase().includes(q));
  }, [roles, query]);

  const editing = roles.find((r) => r.id === editorRoleId) || null;

  const openEditor = (role: AccessRole, view = false) => {
    setReadOnly(view);
    setEditorRoleId(role.id);
  };

  const [pending, setPending] = useState(false);
  const handleCreate = async () => {
    const name = createName.trim();
    if (!name) {
      showToast('Enter a role name.', { variant: 'error' });
      return;
    }
    setPending(true);
    try {
      await onCreateRole({ name, description: createDesc.trim(), permissionKeys: ['NOTIFICATION_VIEW'] });
      setShowCreate(false); setCreateName(''); setCreateDesc('');
      showToast(`Role “${name}” created.`);
    } catch (error) { showToast(error instanceof Error ? error.message : 'Unable to create role.', { variant: 'error' }); }
    finally { setPending(false); }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setPending(true);
    try { await onDeleteRole(deleting.id); showToast(`Deleted ${deleting.name}.`); setDeleting(null); }
    catch (error) { showToast(error instanceof Error ? error.message : 'Unable to delete role.', { variant: 'error' }); }
    finally { setPending(false); }
  };

  const handleSaveEditor = async (next: AccessRole) => {
    try {
      await onUpdateRole({ id: next.id, name: next.name, description: next.description, permissionKeys: Object.entries(next.grants).filter(([, grant]) => grant.enabled).map(([key]) => key) });
    } catch (error) { showToast(error instanceof Error ? error.message : 'Unable to update role.', { variant: 'error' }); return; }
    showToast('Permissions updated');
    setEditorRoleId(null);
  };

  if (editing) {
    return (
      <PermissionEditor
        role={editing}
        readOnly={readOnly}
        onBack={() => setEditorRoleId(null)}
        onSave={handleSaveEditor}
        permissions={permissions}
      />
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <section className="relative overflow-hidden rounded-3xl border border-[#ddc89c]/35 bg-[radial-gradient(circle_at_88%_8%,rgba(221,200,156,.2),transparent_30%),linear-gradient(125deg,#704758,#55333f_50%,#38262d)] p-5 text-white shadow-xl sm:p-7">
        <div className="absolute -bottom-20 -right-10 size-64 rounded-full border-[34px] border-white/[.04]" />
        <div className="relative flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-[.14em] text-[#f0dce3]">
              Administration
            </span>
            <h1 className="mt-3 flex items-center gap-3 text-2xl font-black tracking-tight sm:text-3xl">
              <span className="grid size-11 place-items-center rounded-2xl bg-white/10">
                <ShieldCheck className="size-6 text-[#f1c8d5]" />
              </span>
              Roles & Permissions
            </h1>
            <p className="mt-2 text-sm font-medium leading-relaxed text-[#eadfe2] sm:text-base">
              Decide what each role can see on the Dashboard, and what they can create, edit, approve or export.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setShowAudit(true)} className={`${BTN_GHOST} !border-white/20 !bg-white/10 !text-white hover:!bg-white/15`}>
              Audit Log
            </button>
            <button type="button" onClick={() => setShowCreate(true)} className={BTN_CREAM}>
              <Plus className="size-4" />
              Create Role
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Roles" value={roles.length} hint="System and custom" icon={ShieldCheck} tone="rose" />
        <KpiCard label="Active" value={roles.filter((r) => r.status === 'active').length} hint="Assignable now" icon={CheckCircle2} tone="emerald" />
        <KpiCard label="Custom Roles" value={roles.filter((r) => r.type === 'custom').length} hint="Created from this desk" icon={Sparkles} tone="amber" />
        <KpiCard label="People Mapped" value={team.length} hint="From team roster" icon={Eye} tone="stone" />
      </div>

      <div className={`${CARD} p-4`}>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 size-4 text-slate-400" />
          <input className={`${FIELD} pl-10`} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search roles" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={CARD}>
          <EmptyState icon={ShieldCheck} title="No roles found" message="Create a custom role to get started." />
        </div>
      ) : (
        <div className={`${CARD} overflow-hidden`}>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#4b303a] text-[10px] font-extrabold uppercase tracking-wider text-[#f4e8ec]">
                <tr>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3 text-right">Users</th>
                  <th className="px-4 py-3 text-right">Permissions</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((role) => (
                  <tr key={role.id} className="border-t border-[#eee7e2]">
                    <td className="px-4 py-3">
                      <p className="font-extrabold text-slate-900">{role.name}</p>
                      <p className="text-xs font-medium text-slate-500">{role.description}</p>
                      <Badge className="mt-1 border-[#ded5cf] bg-[#f6f1ee] text-slate-600">{role.type}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-extrabold">{usersFor(role)}</td>
                    <td className="px-4 py-3 text-right font-extrabold text-[#8f3655]">
                      {role.id === 'super_admin' ? 'Full Access' : enabledCount(role)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={role.status === 'active' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-500'}>
                        {role.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-500">{role.updatedAt}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button type="button" className={BTN_GHOST} onClick={() => openEditor(role, true)}><Eye className="size-3.5" /> View</button>
                        <button type="button" className={BTN_PRIMARY} onClick={() => openEditor(role)}><Pencil className="size-3.5" /> Edit</button>
                        {role.type === 'custom' && (
                          <button type="button" className={BTN_GHOST} onClick={() => setDeleting(role)}><Trash2 className="size-3.5 text-red-600" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-3 p-4 md:hidden">
            {filtered.map((role) => (
              <article key={role.id} className="rounded-2xl border border-[#eee7e2] bg-[#fbfaf8] p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-extrabold text-slate-900">{role.name}</p>
                    <p className="text-xs text-slate-500">{role.description}</p>
                  </div>
                  <Badge>{role.status}</Badge>
                </div>
                <p className="mt-2 text-xs font-bold text-slate-600">{usersFor(role)} users · {enabledCount(role)} permissions</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" className={BTN_PRIMARY} onClick={() => openEditor(role)}>Edit</button>
                  <button type="button" className={BTN_GHOST} onClick={() => openEditor(role, true)}>View</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} labelledBy="create-role-title">
        <ModalHero icon={ShieldCheck} eyebrow="Access Desk" title="Create Role" description="Custom roles can be fully configured after save." onClose={() => setShowCreate(false)} labelledBy="create-role-title" />
        <div className="space-y-4 p-5 sm:p-6">
          <label>
            <span className={LABEL}>Role name</span>
            <input className={FIELD} value={createName} onChange={(e) => setCreateName(e.target.value)} placeholder="Wedding Manager" />
          </label>
          <label>
            <span className={LABEL}>Description</span>
            <textarea className={`${FIELD} resize-none`} rows={3} value={createDesc} onChange={(e) => setCreateDesc(e.target.value)} placeholder="Can manage weddings, events, shoots and assigned team members." />
          </label>
          <p className="text-xs font-medium text-slate-500">New roles are saved as Custom Role. System roles stay protected.</p>
          <button type="button" disabled={pending} onClick={() => void handleCreate()} className={`${BTN_PRIMARY} w-full py-3`}>
            <Plus className="size-4" /> Create Role
          </button>
        </div>
      </Modal>

      <Modal isOpen={showAudit} onClose={() => setShowAudit(false)} labelledBy="audit-title" widthClass="max-w-2xl">
        <ModalHero icon={ShieldCheck} eyebrow="Activity" title="Permission Audit Log" onClose={() => setShowAudit(false)} labelledBy="audit-title" />
        <div className="max-h-[60vh] space-y-3 overflow-y-auto p-5">
          {audit.length === 0 ? (
            <p className="text-sm text-slate-500">No permission changes recorded yet.</p>
          ) : (
            audit.map((entry) => (
              <article key={entry.id} className="rounded-2xl border border-[#eee7e2] bg-white p-4">
                <p className="text-sm font-extrabold text-slate-900">{entry.roleName}</p>
                <p className="text-[11px] font-medium text-slate-500">{entry.changedBy} · {entry.date.slice(0, 16).replace('T', ' ')}</p>
                {entry.added.length > 0 && <p className="mt-2 text-xs font-bold text-emerald-700">Added: {entry.added.join(', ')}</p>}
                {entry.removed.length > 0 && <p className="mt-1 text-xs font-bold text-red-700">Removed: {entry.removed.join(', ')}</p>}
              </article>
            ))
          )}
        </div>
      </Modal>

      <ConfirmDeleteModal
        isOpen={!!deleting}
        title="Delete Role"
        itemTitle={deleting?.name}
        message={deleting ? `Delete custom role “${deleting.name}”? This cannot be undone.` : ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
};

function fallbackRoleId(title?: string) {
  const t = (title || '').toLowerCase();
  if (t.includes('owner') || t.includes('super')) return 'super_admin';
  if (t.includes('manager') || t.includes('admin')) return t === 'admin' ? 'admin' : 'manager';
  if (t.includes('sales')) return 'sales_executive';
  if (t.includes('photo editor')) return 'photo_editor';
  if (t.includes('video editor') || t === 'editor') return 'video_editor';
  if (t.includes('cinema')) return 'cinematographer';
  if (t.includes('photo')) return 'photographer';
  if (t.includes('freelance')) return 'freelancer';
  return 'employee';
}

function PermissionEditor({
  role,
  readOnly,
  onBack,
  onSave,
  permissions,
}: {
  role: AccessRole;
  readOnly: boolean;
  onBack: () => void;
  onSave: (role: AccessRole) => Promise<void>;
  permissions: PermissionModule[];
}) {
  const [draft, setDraft] = useState<Record<string, PermissionGrant>>(() => {
    const next = { ...role.grants };
    permissions
      .filter((mod) => mod.id === 'notification')
      .forEach((mod) => {
        mod.permissions.forEach((p) => {
          next[p.key] = { enabled: true, scope: next[p.key]?.scope || 'all' };
        });
      });
    return next;
  });
  const [search, setSearch] = useState('');
  const [openMods, setOpenMods] = useState<string[]>(permissions.map((m) => m.id));
  const [saving, setSaving] = useState(false);
  const [pendingSensitive, setPendingSensitive] = useState<string | null>(null);
  const isSystemAdmin = role.type === 'system' && role.name === 'ADMIN';
  const isAlwaysOn = (modId: string, key?: string) =>
    modId === 'notification' || key === 'NOTIFICATION_VIEW';
  const isLocked = (modId: string, key?: string) =>
    readOnly ||
    isAlwaysOn(modId, key) ||
    (isSystemAdmin && modId !== 'dashboard') ||
    (isSystemAdmin && key === 'DASHBOARD_VIEW');
  const dirty = JSON.stringify(draft) !== JSON.stringify(role.grants);
  const enabled = Object.values(draft).filter((grant) => grant.enabled).length;
  const q = search.trim().toLowerCase();
  const sensitiveKeys = useMemo(
    () => new Set(permissions.flatMap((module) => module.permissions.filter((permission) => permission.sensitive).map((permission) => permission.key))),
    [permissions],
  );

  const visibleModules = permissions
    .map((mod) => {
      if (!q) return mod;
      const moduleHit =
        mod.label.toLowerCase().includes(q) ||
        mod.id.toLowerCase().includes(q) ||
        (mod.description || '').toLowerCase().includes(q);
      if (moduleHit) return mod;
      return {
        ...mod,
        permissions: mod.permissions.filter(
          (p) => p.label.toLowerCase().includes(q) || p.key.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q)
        ),
      };
    })
    .filter((mod) => mod.permissions.length > 0);

  const jumpToModule = (id: string) => {
    setSearch('');
    setOpenMods((prev) => (prev.includes(id) ? prev : [...prev, id]));
    window.setTimeout(() => {
      document.getElementById(`role-mod-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const setGrant = (key: string, patch: Partial<PermissionGrant>) => {
    setDraft((prev) => ({ ...prev, [key]: { enabled: false, scope: 'all', ...prev[key], ...patch } }));
  };

  const toggle = (key: string) => {
    const modId = permissions.find((module) => module.permissions.some((p) => p.key === key))?.id || '';
    if (isLocked(modId, key)) return;
    const next = !draft[key]?.enabled;
    if (next && sensitiveKeys.has(key)) {
      setPendingSensitive(key);
      return;
    }
    setGrant(key, { enabled: next });
  };

  const selectModule = (modId: string, on: boolean) => {
    const mod = permissions.find((m) => m.id === modId);
    if (!mod || isLocked(modId)) return;
    setDraft((prev) => {
      const next = { ...prev };
      mod.permissions.forEach((p) => {
        if (isSystemAdmin && p.key === 'DASHBOARD_VIEW') return;
        next[p.key] = { enabled: on, scope: next[p.key]?.scope || 'all' };
      });
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    try { await onSave({ ...role, grants: draft }); }
    finally { setSaving(false); }
  };

  const summary = permissions.map((mod) => ({ id: mod.id, label: mod.label, total: mod.permissions.length, on: mod.permissions.filter((permission) => draft[permission.key]?.enabled).length }));

  return (
    <div className="space-y-5 pb-24">
      <section className="relative overflow-hidden rounded-3xl border border-[#ddc89c]/35 bg-[linear-gradient(125deg,#704758,#55333f_50%,#38262d)] p-5 text-white shadow-xl sm:p-6">
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <button type="button" onClick={onBack} className="text-xs font-bold text-[#ddc89c]">← All roles</button>
            <h1 className="mt-2 text-2xl font-black">{role.name}</h1>
            <p className="mt-1 text-sm text-[#eadfe2]">{role.description}</p>
            {isSystemAdmin && (
              <p className="mt-2 text-xs font-semibold text-[#ddc89c]">
                Dashboard widgets can be shown or hidden for Admin. All other Admin permissions stay granted.
              </p>
            )}
            <p className="mt-2 text-sm font-extrabold text-[#ddc89c]">{enabled} permissions enabled</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {dirty && <Badge className="border-[#ddc89c] bg-[#f9f3e8] text-[#7a5a2e]">Unsaved Changes</Badge>}
            <button type="button" className={`${BTN_GHOST} !border-white/20 !bg-white/10 !text-white`} onClick={onBack}>Cancel</button>
            {!readOnly && (
              <button type="button" disabled={!dirty || saving} onClick={save} className={BTN_CREAM}>
                <Save className="size-4" />
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {summary.map((row) => (
          <button
            key={row.id}
            type="button"
            onClick={() => jumpToModule(row.id)}
            className={`${CARD} p-3 text-left transition hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-md`}
          >
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">{row.label}</p>
            <p className="mt-1 text-sm font-black text-slate-900">{row.on}/{row.total}</p>
            <div className="mt-2 h-1.5 rounded-full bg-[#f6f1ee]">
              <div className="h-full rounded-full bg-[#8f3655]" style={{ width: `${row.total ? (row.on / row.total) * 100 : 0}%` }} />
            </div>
          </button>
        ))}
      </div>

      <div className={`${CARD} space-y-3 p-4`}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-3 size-4 text-slate-400" />
            <input className={`${FIELD} pl-10`} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search permissions, e.g. download" />
          </div>
          <div className="flex gap-2">
            <button type="button" className={BTN_GHOST} onClick={() => setOpenMods(permissions.map((m) => m.id))}>Expand All</button>
            <button type="button" className={BTN_GHOST} onClick={() => setOpenMods([])}>Collapse All</button>
          </div>
        </div>
      </div>

      {visibleModules.length === 0 && q && (
        <div className={CARD}>
          <EmptyState
            icon={Search}
            title="No permissions match this search"
            message="Try a module name like finance, clients or team — or a permission like view, create or edit."
          />
        </div>
      )}

      {visibleModules.map((mod) => {
        const open = openMods.includes(mod.id);
        const onCount = mod.permissions.filter((p) => draft[p.key]?.enabled).length;
        return (
          <section key={mod.id} id={`role-mod-${mod.id}`} className={`${CARD} scroll-mt-24`}>
            <button
              type="button"
              onClick={() => setOpenMods((prev) => (prev.includes(mod.id) ? prev.filter((id) => id !== mod.id) : [...prev, mod.id]))}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
            >
              <span>
                <span className="block text-sm font-extrabold text-slate-900">{mod.label}</span>
                <span className="text-xs font-medium text-slate-500">{mod.description} · {onCount}/{mod.permissions.length}</span>
              </span>
              <ChevronDown className={`size-4 text-slate-500 transition ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
              <div className="border-t border-[#eee7e2] px-5 py-4">
                {!readOnly && !isLocked(mod.id) && (
                  <div className="mb-3 flex gap-2">
                    <button type="button" className={BTN_GHOST} onClick={() => selectModule(mod.id, true)}>Select All</button>
                    <button type="button" className={BTN_GHOST} onClick={() => selectModule(mod.id, false)}>Clear All</button>
                  </div>
                )}
                <div className="hidden md:block">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        <th className="pb-2">Permission</th>
                        <th className="pb-2">Access</th>
                        <th className="pb-2">Data scope</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mod.permissions.map((perm) => {
                        const g = draft[perm.key] || { enabled: false, scope: 'all' as PermissionScope };
                        return (
                          <tr key={perm.key} className="border-t border-[#f3eeea]">
                            <td className="py-3 pr-3">
                              <p className="font-bold text-slate-800">{perm.label}</p>
                              {perm.sensitive && <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#8f3655]">Sensitive</p>}
                            </td>
                            <td className="py-3 pr-3">
                              <Switch on={!!g.enabled} disabled={isLocked(mod.id, perm.key)} onClick={() => toggle(perm.key)} />
                            </td>
                            <td className="py-3">
                              {g.enabled && (perm.scopes || []).length > 1 ? (
                                <select
                                  disabled={readOnly}
                                  className={FIELD}
                                  value={g.scope || 'all'}
                                  onChange={(e) => setGrant(perm.key, { scope: e.target.value as PermissionScope })}
                                >
                                  {(perm.scopes || ['all']).map((scope) => (
                                    <option key={scope} value={scope}>{SCOPE_LABELS[scope]}</option>
                                  ))}
                                </select>
                              ) : (
                                <span className="text-xs font-medium text-slate-400">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="space-y-3 md:hidden">
                  {mod.permissions.map((perm) => {
                    const g = draft[perm.key] || { enabled: false, scope: 'all' as PermissionScope };
                    return (
                      <article key={perm.key} className="rounded-2xl border border-[#eee7e2] bg-[#fbfaf8] p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-bold text-slate-800">{perm.label}</p>
                          <Switch on={!!g.enabled} disabled={isLocked(mod.id, perm.key)} onClick={() => toggle(perm.key)} />
                        </div>
                        {g.enabled && (perm.scopes || []).length > 1 && (
                          <select
                            disabled={readOnly}
                            className={`${FIELD} mt-2`}
                            value={g.scope || 'all'}
                            onChange={(e) => setGrant(perm.key, { scope: e.target.value as PermissionScope })}
                          >
                            {(perm.scopes || ['all']).map((scope) => (
                              <option key={scope} value={scope}>{SCOPE_LABELS[scope]}</option>
                            ))}
                          </select>
                        )}
                      </article>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        );
      })}

      {!readOnly && (
        <div className="sticky bottom-4 z-20 flex justify-end">
          <button type="button" disabled={!dirty || saving} onClick={save} className={`${BTN_PRIMARY} px-6 py-3 shadow-xl`}>
            <Save className="size-4" />
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={!!pendingSensitive}
        title="Enable sensitive permission"
        itemTitle={pendingSensitive || ''}
        confirmLabel="Enable"
        message="This permission provides access to sensitive studio or financial data. Are you sure you want to enable it?"
        onConfirm={() => {
          if (pendingSensitive) setGrant(pendingSensitive, { enabled: true });
          setPendingSensitive(null);
        }}
        onCancel={() => setPendingSensitive(null)}
      />
    </div>
  );
}
