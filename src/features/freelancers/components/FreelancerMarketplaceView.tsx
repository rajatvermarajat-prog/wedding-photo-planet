'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { BriefcaseBusiness, CalendarDays, CheckCircle2, Eye, Loader2, MapPin, Search, SlidersHorizontal, UserPlus, X } from 'lucide-react';
import { ApiError } from '@/lib/api/client';
import { BackendCrewRole, FreelancerConnection, FreelancerSearchResult, freelancersApi } from '@/lib/api/freelancers';
import { Project } from '@/types';
import { BTN_GHOST, BTN_PRIMARY, CARD, FIELD, LABEL } from '@/features/team/components/TeamUiKit';
import { useToast } from '@/components/common';

const roles: BackendCrewRole[] = ['LEAD_PHOTOGRAPHER', 'CANDID_PHOTOGRAPHER', 'TRADITIONAL_PHOTOGRAPHER', 'CINEMATOGRAPHER', 'TRADITIONAL_VIDEOGRAPHER', 'DRONE_OPERATOR', 'ASSISTANT', 'LIGHT_ASSISTANT', 'LIVE_EDITOR', 'COORDINATOR', 'OTHER'];
type AvailabilityFilter = 'AVAILABLE' | 'PARTIALLY_AVAILABLE' | 'UNAVAILABLE';
const roleLabel = (role?: string | null) => (role || 'OTHER').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase());

type Mode = 'find' | 'interested';

interface Props {
  mode: Mode;
  projects: Project[];
}

interface Filters {
  q: string;
  location: string;
  specialization: string;
  skill: string;
  availabilityDate: string;
  availabilityStatus: '' | AvailabilityFilter;
}

export function FreelancerMarketplaceView({ mode, projects }: Props) {
  const { showToast } = useToast();
  const [filters, setFilters] = useState<Filters>({ q: '', location: '', specialization: '', skill: '', availabilityDate: '', availabilityStatus: '' });
  const [results, setResults] = useState<FreelancerSearchResult[]>([]);
  const [connections, setConnections] = useState<FreelancerConnection[]>([]);
  const [loading, setLoading] = useState(false);
  const [mutatingId, setMutatingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<FreelancerSearchResult | null>(null);
  const [connecting, setConnecting] = useState<FreelancerConnection | null>(null);

  const loadSearch = async () => {
    setLoading(true);
    try {
      const response = await freelancersApi.search({
        q: filters.q || undefined,
        location: filters.location || undefined,
        specialization: filters.specialization as BackendCrewRole || undefined,
        skill: filters.skill || undefined,
        availabilityDate: filters.availabilityDate || undefined,
        availabilityStatus: filters.availabilityStatus || undefined,
        pageSize: 20,
      });
      setResults(response.data);
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Unable to search freelancers.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadInterested = async () => {
    setLoading(true);
    try {
      const response = await freelancersApi.listConnections({ status: 'INTERESTED', limit: 50 });
      setConnections(response.data);
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Unable to load interested freelancers.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === 'find') void loadSearch();
    else void loadInterested();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const interestedIds = useMemo(() => new Set(connections.map((item) => item.freelancerId)), [connections]);

  const markInterested = async (freelancer: FreelancerSearchResult) => {
    if (mutatingId) return;
    setMutatingId(freelancer.id);
    try {
      const created = await freelancersApi.createConnection({ freelancerId: freelancer.id, status: 'INTERESTED' });
      setConnections((current) => [created, ...current]);
      setResults((current) => current.map((item) => item.id === freelancer.id ? { ...item, connection: created } : item));
      showToast('Added to Interested');
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Unable to mark interested.', { variant: 'error' });
    } finally {
      setMutatingId(null);
    }
  };

  const clear = () => {
    setFilters({ q: '', location: '', specialization: '', skill: '', availabilityDate: '', availabilityStatus: '' });
  };

  return (
    <div className="space-y-5">
      {mode === 'find' ? (
        <>
          <section className={`${CARD} p-4`}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-black uppercase tracking-wide text-slate-900">Find Freelancer</h2>
                <p className="text-xs font-medium text-slate-500">Search approved, active and searchable freelancers from the production network.</p>
              </div>
              <button type="button" className={BTN_GHOST} onClick={clear}><SlidersHorizontal className="size-3.5" /> Clear</button>
            </div>
            <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-6">
              <label className="xl:col-span-2"><span className={LABEL}>Search</span><input className={FIELD} value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} placeholder="Name, city, skill" /></label>
              <label><span className={LABEL}>Date</span><input type="date" className={FIELD} value={filters.availabilityDate} onChange={(e) => setFilters({ ...filters, availabilityDate: e.target.value })} /></label>
              <label><span className={LABEL}>Specialization</span><select className={FIELD} value={filters.specialization} onChange={(e) => setFilters({ ...filters, specialization: e.target.value })}><option value="">All</option>{roles.map((role) => <option key={role} value={role}>{roleLabel(role)}</option>)}</select></label>
              <label><span className={LABEL}>Location</span><input className={FIELD} value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} placeholder="Jaipur" /></label>
              <label><span className={LABEL}>Availability</span><select className={FIELD} value={filters.availabilityStatus} onChange={(e) => setFilters({ ...filters, availabilityStatus: e.target.value as Filters['availabilityStatus'] })}><option value="">Available or partial</option><option value="AVAILABLE">Available</option><option value="PARTIALLY_AVAILABLE">Partial</option><option value="UNAVAILABLE">Unavailable</option></select></label>
            </div>
            <div className="mt-3 flex justify-end"><button type="button" onClick={loadSearch} className={BTN_PRIMARY}><Search className="size-4" /> Search</button></div>
          </section>
          {loading ? <Skeleton /> : results.length === 0 ? <Empty title="No freelancers match these filters." action={loadSearch} /> : (
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
              {results.map((freelancer) => (
                <FreelancerCard
                  key={freelancer.id}
                  freelancer={freelancer}
                  interested={Boolean(freelancer.connection) || interestedIds.has(freelancer.id)}
                  busy={mutatingId === freelancer.id}
                  onView={() => setSelected(freelancer)}
                  onInterested={() => markInterested(freelancer)}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <section className={`${CARD} p-4`}>
            <h2 className="text-base font-black uppercase tracking-wide text-slate-900">Interested</h2>
            <p className="text-xs font-medium text-slate-500">Freelancers marked for follow-up before project or shoot assignment.</p>
          </section>
          {loading ? <Skeleton /> : connections.length === 0 ? <Empty title="You haven't marked any freelancers as interested yet." /> : (
            <div className="space-y-2">
              {connections.map((connection) => (
                <article key={connection.id} className={`${CARD} flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between`}>
                  <div>
                    <p className="font-black text-slate-900">{connection.freelancer?.fullName || 'Freelancer'}</p>
                    <p className="text-xs font-bold text-[#8D5265]">{roleLabel(connection.freelancer?.primarySkill)} · {connection.freelancer?.city || 'Location not set'}</p>
                    <p className="mt-1 text-xs font-medium text-slate-500">Interested on {new Date(connection.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className={BTN_GHOST} onClick={() => setConnecting(connection)}><BriefcaseBusiness className="size-3.5" /> Connect</button>
                    <button type="button" className={BTN_GHOST} onClick={async () => { await freelancersApi.updateConnection(connection.id, { status: 'EXPIRED' }); setConnections((items) => items.filter((item) => item.id !== connection.id)); }}><X className="size-3.5" /> Remove</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
      {selected && <ProfileDrawer freelancer={selected} onClose={() => setSelected(null)} onInterested={() => markInterested(selected)} busy={mutatingId === selected.id} />}
      {connecting && <ConnectDialog connection={connecting} projects={projects} onClose={() => setConnecting(null)} onConnected={(updated) => { setConnections((items) => items.map((item) => item.id === updated.id ? updated : item)); setConnecting(null); showToast('Freelancer connected to project'); }} />}
    </div>
  );
}

function FreelancerCard({ freelancer, interested, busy, onView, onInterested }: { freelancer: FreelancerSearchResult; interested: boolean; busy: boolean; onView: () => void; onInterested: () => void }) {
  return (
    <article className={`${CARD} p-4`}>
      <div className="flex items-start gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#f0dce3] text-sm font-black text-[#6d2f45]">{freelancer.displayName.slice(0, 2).toUpperCase()}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-black text-slate-900">{freelancer.displayName}</p>
          <p className="text-xs font-bold text-[#8D5265]">{roleLabel(freelancer.specialization)}</p>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500"><MapPin className="size-3" />{freelancer.city || 'Location not set'}<span>{freelancer.experienceYears ?? 0} years</span></p>
          <div className="mt-2 flex flex-wrap gap-1">{freelancer.skills.slice(0, 4).map((skill) => <span key={skill} className="rounded-full border border-[#e8ded8] bg-[#fbfaf8] px-2 py-1 text-[11px] font-bold text-slate-600">{skill}</span>)}</div>
          <p className="mt-2 text-xs font-bold text-slate-600"><CalendarDays className="mr-1 inline size-3.5 text-[#8D5265]" />{freelancer.availability ? `${freelancer.availability.status.replaceAll('_', ' ')} · ${new Date(freelancer.availability.date).toLocaleDateString()}` : 'No upcoming availability record'}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <button type="button" className={BTN_GHOST} onClick={onView}><Eye className="size-3.5" /> View Profile</button>
        <button type="button" className={BTN_PRIMARY} disabled={interested || busy} onClick={onInterested}>{busy ? <Loader2 className="size-3.5 animate-spin" /> : <UserPlus className="size-3.5" />}{interested ? 'Interested' : 'Interested'}</button>
      </div>
    </article>
  );
}

function ProfileDrawer({ freelancer, busy, onClose, onInterested }: { freelancer: FreelancerSearchResult; busy: boolean; onClose: () => void; onInterested: () => void }) {
  return (
    <div className="fixed inset-0 z-[90] flex justify-end bg-[#24171c]/60 p-3 backdrop-blur-sm">
      <aside className="h-full w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div><h3 className="text-xl font-black text-slate-900">{freelancer.displayName}</h3><p className="text-sm font-bold text-[#8D5265]">{roleLabel(freelancer.specialization)} · {freelancer.city || 'Location not set'}</p></div>
          <button className={BTN_GHOST} onClick={onClose} aria-label="Close profile"><X className="size-4" /></button>
        </div>
        <div className="mt-5 grid gap-4">
          <section><h4 className="text-xs font-black uppercase tracking-wide text-slate-500">Professional</h4><p className="mt-2 text-sm font-medium text-slate-700">{freelancer.experienceYears ?? 0} years experience. Skills: {freelancer.skills.join(', ') || 'Not provided'}.</p></section>
          <section><h4 className="text-xs font-black uppercase tracking-wide text-slate-500">Portfolio</h4><div className="mt-2 grid gap-2">{freelancer.portfolioPreview.length ? freelancer.portfolioPreview.map((item) => <div key={item.id} className="rounded-xl border border-[#eee7e2] p-3 text-sm font-bold text-slate-700">{item.title}<span className="ml-2 text-xs font-medium text-slate-400">{item.fileObject?.originalName}</span></div>) : <p className="text-sm font-medium text-slate-500">No published portfolio preview.</p>}</div></section>
          <section><h4 className="text-xs font-black uppercase tracking-wide text-slate-500">Availability</h4><p className="mt-2 text-sm font-medium text-slate-700">{freelancer.availability ? `${freelancer.availability.status.replaceAll('_', ' ')} on ${new Date(freelancer.availability.date).toLocaleDateString()}` : 'No relevant availability record.'}</p></section>
        </div>
        <div className="mt-6 flex justify-end gap-2"><button className={BTN_PRIMARY} disabled={busy || Boolean(freelancer.connection)} onClick={onInterested}>{busy ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />} Interested</button></div>
      </aside>
    </div>
  );
}

function ConnectDialog({ connection, projects, onClose, onConnected }: { connection: FreelancerConnection; projects: Project[]; onClose: () => void; onConnected: (connection: FreelancerConnection) => void }) {
  const { showToast } = useToast();
  const [projectId, setProjectId] = useState('');
  const [shootId, setShootId] = useState('');
  const [role, setRole] = useState<BackendCrewRole>('LEAD_PHOTOGRAPHER');
  const [saving, setSaving] = useState(false);
  const project = projects.find((item) => item.id === projectId);
  const shoots = project?.shoots || [];
  const submit = async () => {
    if (!projectId) return;
    setSaving(true);
    try {
      const result = await freelancersApi.connect(connection.id, { projectId, shootId: shootId || undefined, role, notes: 'Connected from Find Freelancer workspace.' });
      onConnected(result.connection);
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Unable to connect freelancer.', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="fixed inset-0 z-[95] grid place-items-center bg-[#24171c]/60 p-4 backdrop-blur-sm">
      <section className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
        <h3 className="text-lg font-black text-slate-900">Connect Freelancer</h3>
        <p className="text-sm font-medium text-slate-500">{connection.freelancer?.fullName}</p>
        <div className="mt-4 grid gap-3">
          <label><span className={LABEL}>Project</span><select className={FIELD} value={projectId} onChange={(event) => { setProjectId(event.target.value); setShootId(''); }}><option value="">Select project</option>{projects.map((item) => <option key={item.id} value={item.id}>{item.projectName || item.name || item.clientWeddingTitle}</option>)}</select></label>
          <label><span className={LABEL}>Shoot</span><select className={FIELD} value={shootId} onChange={(event) => setShootId(event.target.value)} disabled={!projectId}><option value="">Project connection only</option>{shoots.map((shoot) => <option key={shoot.id} value={shoot.id}>{shoot.title} · {shoot.date}</option>)}</select></label>
          <label><span className={LABEL}>Role</span><select className={FIELD} value={role} onChange={(event) => setRole(event.target.value as BackendCrewRole)}>{roles.map((item) => <option key={item} value={item}>{roleLabel(item)}</option>)}</select></label>
        </div>
        <div className="mt-5 flex justify-end gap-2"><button className={BTN_GHOST} onClick={onClose}>Cancel</button><button className={BTN_PRIMARY} disabled={!projectId || saving} onClick={submit}>{saving ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />} Confirm</button></div>
      </section>
    </div>
  );
}

function Skeleton() {
  return <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">{[0, 1, 2, 3].map((item) => <div key={item} className={`${CARD} h-36 animate-pulse bg-white p-4`} />)}</div>;
}

function Empty({ title, action }: { title: string; action?: () => void }) {
  return <section className={`${CARD} p-8 text-center`}><p className="font-black text-slate-900">{title}</p>{action ? <button className={`${BTN_GHOST} mt-3`} onClick={action}>Reset search</button> : null}</section>;
}
