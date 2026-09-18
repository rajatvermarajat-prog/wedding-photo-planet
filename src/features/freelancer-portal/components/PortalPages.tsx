'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { ApiError } from '@/lib/api/client';
import { freelancerPortalApi, PortalPortfolioItem } from '@/lib/api/freelancerPortal';
import { getFreelancerProfileCompletion } from '../profileCompletion';
import { useFreelancerPortal } from '../useFreelancerPortal';
import { PortalCard, PortalState } from './FreelancerPortalShell';

const btn = 'inline-flex min-h-11 items-center justify-center rounded-xl bg-[#8D5265] px-4 py-2 text-sm font-black text-white transition hover:bg-[#774255] disabled:opacity-60';
const field = 'mt-1 w-full rounded-xl border border-[#DFD9D2] bg-[#F7F6F3] px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#8D5265]';
const label = 'text-xs font-extrabold text-[#686164]';

function LoadingState() {
  return <PortalState title="Loading portal" text="Fetching your latest freelancer profile." action={<Loader2 className="mx-auto size-5 animate-spin text-[#8D5265]" />} />;
}

function ErrorState({ text, retry }: { text: string; retry: () => void }) {
  return <PortalState title="Could not load portal" text={text} action={<button className={btn} onClick={retry}>Retry</button>} />;
}

export function DashboardPage() {
  const { data, loading, error, reload } = useFreelancerPortal();
  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState text={error || 'No portal data available.'} retry={reload} />;
  const profile = data.freelancer;
  const completion = getFreelancerProfileCompletion(profile);
  const subscription = profile.subscriptions[0];
  const today = new Date().toISOString().slice(0, 10);
  const todayAvailability = profile.availability.find((item) => item.date.slice(0, 10) === today);
  const futureAssignments = profile.assignments.filter((item) => item.shoot && item.shoot.shootDate.slice(0, 10) >= today);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#8D5265]">Freelancer Portal</p>
        <h1 className="text-3xl font-black">Welcome, {profile.fullName}</h1>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <PortalCard>
          <p className="text-sm font-black">Profile completion</p>
          <div className="mt-3 h-3 rounded-full bg-[#F0EDE9]"><div className="h-3 rounded-full bg-[#527A68]" style={{ width: `${completion.percentage}%` }} /></div>
          <p className="mt-2 text-2xl font-black">{completion.percentage}%</p>
          <p className="text-xs font-medium text-[#686164]">{completion.missing[0] ? `Missing: ${completion.missing.slice(0, 3).join(', ')}` : 'Profile requirements complete.'}</p>
        </PortalCard>
        <PortalCard>
          <p className="text-sm font-black">Subscription</p>
          <p className="mt-2 text-2xl font-black">{subscription?.plan?.name ?? 'No active plan'}</p>
          <p className="text-xs font-bold text-[#686164]">{subscription ? `${subscription.status} · ${subscription.currentPeriodEnd ? `until ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}` : 'no expiry set'}` : 'Choose a plan when checkout is available.'}</p>
        </PortalCard>
        <PortalCard>
          <p className="text-sm font-black">Searchability</p>
          <p className={`mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black ${data.searchable ? 'bg-[#527A68]/10 text-[#527A68]' : 'bg-[#B78332]/10 text-[#B78332]'}`}>
            {data.searchable ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}
            {data.searchable ? 'Visible to studio search' : 'Not searchable yet'}
          </p>
        </PortalCard>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <PortalCard>
          <div className="flex items-center justify-between gap-3"><h2 className="font-black">Availability</h2><Link className="text-sm font-black text-[#8D5265]" href="/freelancer/availability">Update</Link></div>
          <p className="mt-3 text-sm font-semibold text-[#686164]">Today: {todayAvailability?.status?.replaceAll('_', ' ') ?? 'No availability added'}</p>
        </PortalCard>
        <PortalCard>
          <h2 className="font-black">Connections & assignments</h2>
          <p className="mt-3 text-sm font-semibold text-[#686164]">{profile.connections.length} connection records</p>
          <p className="text-sm font-semibold text-[#686164]">{futureAssignments.length} future assignments</p>
        </PortalCard>
      </div>
    </div>
  );
}

export function ProfilePage() {
  const { data, setData, loading, error, reload } = useFreelancerPortal();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const profile = data?.freelancer;
  const [form, setForm] = useState<Record<string, string>>({});
  const value = (key: keyof NonNullable<typeof profile>) => form[String(key)] ?? String(profile?.[key] ?? '');
  if (loading) return <LoadingState />;
  if (error || !data || !profile) return <ErrorState text={error || 'No profile loaded.'} retry={reload} />;
  const completion = getFreelancerProfileCompletion(profile);
  const latestApplication = profile.applications[0];
  const latestSubscription = profile.subscriptions[0];
  const save = async () => {
    setSaving(true);
    setMessage('');
    try {
      const updated = await freelancerPortalApi.updateProfile({
        fullName: value('fullName'),
        email: value('email') || null,
        city: value('city') || null,
        experienceYears: Number(value('experienceYears')) || 0,
        skills: value('skills').split(',').map((s) => s.trim()).filter(Boolean),
        equipmentNotes: value('equipmentNotes') || null,
        notes: value('notes') || null,
      });
      setData({ ...data, freelancer: { ...profile, ...updated } });
      setMessage('Profile updated.');
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Unable to update profile.');
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-black">Profile</h1>
      <PortalCard>
        <p className="font-black">Profile status</p>
        <div className="mt-3 grid gap-2 text-sm font-bold text-[#686164] sm:grid-cols-2">
          <p>Completion: {completion.percentage}%</p><p>Application: {latestApplication?.status ?? 'No application'}</p>
          <p>Freelancer: {profile.status}</p><p>Subscription: {latestSubscription?.status ?? 'No subscription'}</p>
          <p>Searchable: {data.searchable ? 'Yes' : 'Not yet'}</p>
        </div>
      </PortalCard>
      <PortalCard>
        <div className="grid gap-4 sm:grid-cols-2">
          <label><span className={label}>Full name</span><input className={field} value={value('fullName')} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></label>
          <label><span className={label}>Email</span><input className={field} value={value('email')} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label><span className={label}>Phone</span><input className={field} value={profile.phone} disabled /></label>
          <label><span className={label}>City</span><input className={field} value={value('city')} onChange={(e) => setForm({ ...form, city: e.target.value })} /></label>
          <label><span className={label}>Experience years</span><input type="number" className={field} value={value('experienceYears')} onChange={(e) => setForm({ ...form, experienceYears: e.target.value })} /></label>
          <label><span className={label}>Skills, comma separated</span><input className={field} value={form.skills ?? profile.skills.join(', ')} onChange={(e) => setForm({ ...form, skills: e.target.value })} /></label>
          <label className="sm:col-span-2"><span className={label}>Equipment</span><textarea className={field} value={value('equipmentNotes')} onChange={(e) => setForm({ ...form, equipmentNotes: e.target.value })} /></label>
          <label className="sm:col-span-2"><span className={label}>Bio / notes</span><textarea className={field} value={value('notes')} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
        </div>
        <div className="mt-5 flex items-center gap-3"><button className={btn} onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</button>{message ? <p className="text-sm font-bold text-[#686164]">{message}</p> : null}</div>
      </PortalCard>
    </div>
  );
}

export function AvailabilityPage() {
  const { data, setData, loading, error, reload } = useFreelancerPortal();
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ date: today, status: 'AVAILABLE', startTime: '', endTime: '', notes: '' });
  const [message, setMessage] = useState('');
  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState text={error || 'No availability loaded.'} retry={reload} />;
  const save = async () => {
    if (form.startTime && form.endTime && form.endTime < form.startTime) {
      setMessage('End time cannot be before start time.');
      return;
    }
    const saved = await freelancerPortalApi.saveAvailability({
      date: form.date,
      status: form.status as 'AVAILABLE',
      startTime: form.startTime ? `${form.date}T${form.startTime}:00.000Z` : null,
      endTime: form.endTime ? `${form.date}T${form.endTime}:00.000Z` : null,
      notes: form.notes || null,
    });
    setData({ ...data, freelancer: { ...data.freelancer, availability: [saved, ...data.freelancer.availability.filter((a) => a.date.slice(0, 10) !== form.date)] } });
    setMessage('Availability saved.');
  };
  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-black">Availability</h1>
      <PortalCard>
        <div className="grid gap-4 sm:grid-cols-2">
          <label><span className={label}>Date</span><input type="date" className={field} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
          <label><span className={label}>Status</span><select className={field} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>AVAILABLE</option><option>PARTIALLY_AVAILABLE</option><option>UNAVAILABLE</option></select></label>
          <label><span className={label}>Start time</span><input type="time" className={field} value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} /></label>
          <label><span className={label}>End time</span><input type="time" className={field} value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} /></label>
          <label className="sm:col-span-2"><span className={label}>Notes</span><textarea className={field} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
        </div>
        <div className="mt-5 flex items-center gap-3"><button className={btn} onClick={save}>Save availability</button>{message ? <p className="text-sm font-bold text-[#686164]">{message}</p> : null}</div>
      </PortalCard>
      <div className="grid gap-3">{data.freelancer.availability.length ? data.freelancer.availability.map((item) => <PortalCard key={item.id}><p className="font-black">{new Date(item.date).toLocaleDateString()}</p><p className="text-sm font-bold text-[#686164]">{item.status.replaceAll('_', ' ')}</p></PortalCard>) : <PortalState title="No availability added" text="Add dates so the studio can plan assignments around your schedule." />}</div>
    </div>
  );
}

export function PortfolioPage() {
  const { data, setData, loading, error, reload } = useFreelancerPortal();
  const [form, setForm] = useState({ fileObjectId: '', title: '', description: '', category: '', isPublished: true });
  const [message, setMessage] = useState('');
  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState text={error || 'No portfolio loaded.'} retry={reload} />;
  const create = async () => {
    try {
      const item = await freelancerPortalApi.createPortfolioItem(form);
      setData({ ...data, freelancer: { ...data.freelancer, portfolioItems: [item, ...data.freelancer.portfolioItems] } });
      setForm({ fileObjectId: '', title: '', description: '', category: '', isPublished: true });
      setMessage('Portfolio item added.');
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Unable to add portfolio item.');
    }
  };
  const toggle = async (item: PortalPortfolioItem) => {
    const updated = await freelancerPortalApi.updatePortfolioItem(item.id, { isPublished: !item.isPublished });
    setData({ ...data, freelancer: { ...data.freelancer, portfolioItems: data.freelancer.portfolioItems.map((p) => p.id === item.id ? updated : p) } });
  };
  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-black">Portfolio</h1>
      <PortalCard>
        <p className="font-black">Add existing uploaded file</p>
        <p className="mt-1 text-xs font-medium text-[#686164]">Upload binaries through the existing Files API, then attach the resulting FileObject ID here.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input className={field} placeholder="FileObject ID" value={form.fileObjectId} onChange={(e) => setForm({ ...form, fileObjectId: e.target.value })} />
          <input className={field} placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className={field} placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} /> Published</label>
          <textarea className={`${field} sm:col-span-2`} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="mt-4 flex items-center gap-3"><button className={btn} onClick={create} disabled={!form.fileObjectId || !form.title}>Add item</button>{message ? <p className="text-sm font-bold text-[#686164]">{message}</p> : null}</div>
      </PortalCard>
      <div className="grid gap-3 sm:grid-cols-2">{data.freelancer.portfolioItems.length ? data.freelancer.portfolioItems.map((item) => <PortalCard key={item.id}><p className="font-black">{item.title}</p><p className="text-sm font-medium text-[#686164]">{item.description || 'No description'}</p><button onClick={() => toggle(item)} className="mt-3 text-sm font-black text-[#8D5265]">{item.isPublished ? 'Unpublish' : 'Publish'}</button></PortalCard>) : <PortalState title="No portfolio items yet" text="Add approved FileObject media to build your freelancer portfolio." />}</div>
    </div>
  );
}

export function SubscriptionPage() {
  const { data, loading, error, reload } = useFreelancerPortal();
  const [plans, setPlans] = useState<Awaited<ReturnType<typeof freelancerPortalApi.plans>> | null>(null);
  const [notice, setNotice] = useState('');
  useMemo(() => { if (data && !plans) void freelancerPortalApi.plans().then(setPlans).catch(() => setPlans([])); }, [data, plans]);
  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState text={error || 'No subscription loaded.'} retry={reload} />;
  const subscription = data.freelancer.subscriptions[0];
  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-black">Subscription</h1>
      <PortalCard>
        <p className="text-sm font-black">Current plan</p>
        <p className="mt-2 text-2xl font-black">{subscription?.plan.name ?? 'No active subscription'}</p>
        <p className="text-sm font-bold text-[#686164]">{subscription ? `${subscription.status} · ${subscription.currentPeriodEnd ? `ends ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}` : 'no expiry set'}` : 'Checkout is not enabled yet.'}</p>
      </PortalCard>
      <div className="grid gap-3 sm:grid-cols-2">{plans?.length ? plans.map((plan) => <PortalCard key={plan.id}><p className="font-black">{plan.name}</p><p className="mt-1 text-sm font-bold text-[#686164]">{plan.currency} {Number(plan.price).toLocaleString('en-IN')} · {plan.billingInterval}</p><button className={`${btn} mt-4`} onClick={() => setNotice('Subscription checkout coming soon. No transaction was created.')}>Choose Plan</button></PortalCard>) : <PortalState title="No plans available" text="The studio has not published freelancer plans yet." />}</div>
      {notice ? <p className="rounded-xl bg-[#B78332]/10 px-4 py-3 text-sm font-bold text-[#B78332]">{notice}</p> : null}
    </div>
  );
}

export function SimplePortalListPage({ kind }: { kind: 'connections' | 'assignments' | 'payments' }) {
  const { data, loading, error, reload } = useFreelancerPortal();
  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState text={error || 'No data loaded.'} retry={reload} />;
  const items = kind === 'connections' ? data.freelancer.connections : kind === 'assignments' ? data.freelancer.assignments : data.freelancer.payouts;
  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-black capitalize">{kind}</h1>
      {items.length ? items.map((item: any) => <PortalCard key={item.id}><p className="font-black">{item.status || item.paymentMethod}</p><p className="text-sm font-medium text-[#686164]">{item.notes || item.role || item.paymentDate || 'No additional details'}</p></PortalCard>) : <PortalState title={`No ${kind} yet`} text="Nothing is available here yet. The studio will update this when records exist." />}
    </div>
  );
}
