'use client';

import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BriefcaseBusiness, CalendarDays, CheckCircle2, CircleDollarSign, MapPin, Sparkles, UserPlus } from 'lucide-react';
import { BTN_CREAM, BTN_GHOST, BTN_PRIMARY, CARD, FIELD, LABEL } from '@/features/team/components/TeamUiKit';
import { indianMobileError, nextIndianMobileValue } from '@/lib/validation/indianMobile';

const STEPS = ['Account', 'Profile', 'Skills', 'Availability', 'Rates', 'Review'];
const roles = ['Wedding Photographer', 'Wedding Videographer', 'Cinematographer', 'Second Shooter', 'Drone Operator', 'Photo Editor', 'Video Editor', 'Album Designer'];

export const PublicFreelancerRegistration: React.FC = () => {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', headline: '', bio: '', role: roles[0], experience: '0', skills: '', city: '', travel: true, availability: 'Open to Work', from: '', until: '', dailyRate: '', eventRate: '', negotiable: true });
  const set = (key: keyof typeof form, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  const errors = useMemo(() => ({
    account: !form.name.trim() || !form.email.includes('@') || !!indianMobileError(form.phone, true),
    profile: !form.headline.trim() || !form.role,
    availability: !form.city.trim(),
    rates: !form.dailyRate || Number(form.dailyRate) < 0,
  }), [form]);
  const invalid = (index: number) => index === 0 ? errors.account : index === 1 ? errors.profile : index === 3 ? errors.availability : index === 4 ? errors.rates : false;
  const next = () => { if (!invalid(step)) setStep((current) => Math.min(STEPS.length - 1, current + 1)); };

  if (submitted) return (
    <main className="min-h-screen bg-[#fbfaf8] p-5 sm:p-10">
      <section className="mx-auto max-w-2xl text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><CheckCircle2 className="size-8" /></div>
        <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-900">Application submitted</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm font-medium leading-relaxed text-slate-600">Thanks, {form.name}. Your Wedding Photo Planet freelancer profile is under review. We&apos;ll contact you at {form.email} with the next step.</p>
        <button type="button" onClick={() => { setSubmitted(false); setStep(0); }} className={`${BTN_PRIMARY} mt-6`}>Start another application</button>
      </section>
    </main>
  );

  return (
    <main className="min-h-screen bg-[#fbfaf8] pb-12">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_88%_8%,rgba(221,200,156,.2),transparent_30%),linear-gradient(125deg,#704758,#55333f_50%,#38262d)] px-5 py-8 text-white sm:px-8 sm:py-12">
        <div className="absolute -bottom-20 -right-10 size-64 rounded-full border-[34px] border-white/[.04]" />
        <div className="relative mx-auto max-w-5xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-[.14em] text-[#f0dce3]"><Sparkles className="size-3.5" /> Wedding Photo Planet</span>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Join our freelancer network</h1>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-[#eadfe2] sm:text-base">Find meaningful wedding assignments, build a trusted studio relationship, and keep your profile ready for the right production opportunity.</p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold text-[#f1dce3]"><span className="rounded-full bg-white/10 px-3 py-1.5">Professional opportunities</span><span className="rounded-full bg-white/10 px-3 py-1.5">Clear assignment terms</span><span className="rounded-full bg-white/10 px-3 py-1.5">One trusted profile</span></div>
        </div>
      </section>

      <section className="mx-auto mt-6 max-w-5xl px-5 sm:px-8">
        <div className={`${CARD} p-3 sm:p-4`}>
          <ol className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {STEPS.map((label, index) => <li key={label} className={`rounded-xl px-2 py-2 text-center text-[10px] font-extrabold uppercase tracking-wide ${index === step ? 'bg-[#6d2f45] text-white shadow-sm' : index < step ? 'bg-emerald-50 text-emerald-700' : 'text-slate-400'}`}>{index < step ? 'Done' : `${index + 1}. ${label}`}</li>)}
          </ol>
        </div>
        <form className={`${CARD} mt-5 p-5 sm:p-7`} onSubmit={(event) => { event.preventDefault(); if (!invalid(step)) step === STEPS.length - 1 ? setSubmitted(true) : next(); }}>
          <div className="mb-6 flex items-start gap-3"><span className="grid size-10 place-items-center rounded-xl bg-rose-50 text-[#8f3655]">{step === 0 ? <UserPlus className="size-5" /> : step === 3 ? <CalendarDays className="size-5" /> : step === 4 ? <CircleDollarSign className="size-5" /> : <BriefcaseBusiness className="size-5" />}</span><div><h2 className="text-lg font-black text-slate-900">{STEPS[step]}</h2><p className="text-xs font-medium text-slate-500">{step === 5 ? 'Review your details before submitting the application.' : 'You can save and complete the remaining details later after review.'}</p></div></div>
          {step === 0 && <div className="grid gap-3 sm:grid-cols-2"><label><span className={LABEL}>Full name *</span><input required className={FIELD} value={form.name} onChange={(e) => set('name', e.target.value)} /></label><label><span className={LABEL}>Email *</span><input required type="email" className={FIELD} value={form.email} onChange={(e) => set('email', e.target.value)} /></label><label><span className={LABEL}>Mobile *</span><input required inputMode="numeric" maxLength={10} className={FIELD} value={form.phone} onChange={(e) => set('phone', nextIndianMobileValue(e.target.value, form.phone))} placeholder="9876543210" /></label></div>}
          {step === 1 && <div className="grid gap-3 sm:grid-cols-2"><label className="sm:col-span-2"><span className={LABEL}>Professional headline *</span><input required className={FIELD} value={form.headline} onChange={(e) => set('headline', e.target.value)} placeholder="e.g. Wedding cinematographer & storyteller" /></label><label><span className={LABEL}>Primary role *</span><select className={FIELD} value={form.role} onChange={(e) => set('role', e.target.value)}>{roles.map((role) => <option key={role}>{role}</option>)}</select></label><label><span className={LABEL}>Experience (years)</span><input type="number" min="0" className={FIELD} value={form.experience} onChange={(e) => set('experience', e.target.value)} /></label><label className="sm:col-span-2"><span className={LABEL}>About you</span><textarea className={`${FIELD} min-h-28`} maxLength={700} value={form.bio} onChange={(e) => set('bio', e.target.value)} placeholder="Tell us about the weddings and work you enjoy." /></label></div>}
          {step === 2 && <div className="grid gap-3"><label><span className={LABEL}>Skills & services</span><input className={FIELD} value={form.skills} onChange={(e) => set('skills', e.target.value)} placeholder="Candid photography, Lightroom, drone…" /></label><p className="text-xs font-medium text-slate-500">Separate skills with commas. You can add detailed experience, portfolio and equipment after your account is created.</p></div>}
          {step === 3 && <div className="grid gap-3 sm:grid-cols-2"><label><span className={LABEL}>City *</span><input required className={FIELD} value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Jaipur" /></label><label><span className={LABEL}>Work status</span><select className={FIELD} value={form.availability} onChange={(e) => set('availability', e.target.value)}><option>Open to Work</option><option>Limited Availability</option><option>Unavailable</option><option>Not Looking</option></select></label><label><span className={LABEL}>Available from</span><input type="date" className={FIELD} value={form.from} onChange={(e) => set('from', e.target.value)} /></label><label><span className={LABEL}>Available until</span><input type="date" min={form.from || undefined} className={FIELD} value={form.until} onChange={(e) => set('until', e.target.value)} /></label><label className="flex items-center gap-2 text-xs font-bold text-slate-700"><input type="checkbox" checked={form.travel} onChange={(e) => set('travel', e.target.checked)} /> Willing to travel / outstation work</label></div>}
          {step === 4 && <div className="grid gap-3 sm:grid-cols-2"><label><span className={LABEL}>Daily rate (₹) *</span><input required min="0" type="number" className={FIELD} value={form.dailyRate} onChange={(e) => set('dailyRate', e.target.value)} /></label><label><span className={LABEL}>Per-event rate (₹)</span><input min="0" type="number" className={FIELD} value={form.eventRate} onChange={(e) => set('eventRate', e.target.value)} /></label><label className="flex items-center gap-2 text-xs font-bold text-slate-700"><input type="checkbox" checked={form.negotiable} onChange={(e) => set('negotiable', e.target.checked)} /> Rates are negotiable by project</label></div>}
          {step === 5 && <div className="grid gap-3 rounded-2xl border border-[#eee7e2] bg-[#fbfaf8] p-4 text-sm sm:grid-cols-2"><p><b className="text-[#6d2f45]">{form.name}</b><br /><span className="text-xs text-slate-500">{form.email} · {form.phone}</span></p><p><b>{form.role}</b><br /><span className="text-xs text-slate-500">{form.experience} years · {form.city}</span></p><p><b>{form.availability}</b><br /><span className="text-xs text-slate-500">{form.travel ? 'Open to travel' : 'Local work only'}</span></p><p><b>₹{Number(form.dailyRate || 0).toLocaleString('en-IN')} / day</b><br /><span className="text-xs text-slate-500">{form.negotiable ? 'Negotiable' : 'Fixed rate'}</span></p></div>}
          <div className="mt-7 flex items-center justify-between gap-3 border-t border-[#eee7e2] pt-5"><button type="button" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0} className={BTN_GHOST}><ArrowLeft className="size-3.5" /> Back</button><button type="submit" className={BTN_PRIMARY}>{step === STEPS.length - 1 ? 'Submit application' : <>Continue <ArrowRight className="size-3.5" /></>}</button></div>
        </form>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs font-medium text-slate-500"><MapPin className="size-3.5 text-[#8f3655]" /> Your details are reviewed by the Wedding Photo Planet production team.</p>
      </section>
    </main>
  );
};
