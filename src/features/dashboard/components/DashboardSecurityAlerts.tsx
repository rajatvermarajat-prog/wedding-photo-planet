import { Lock, Monitor, ShieldAlert } from 'lucide-react';
import { TeamMember } from '@/types';

export function DashboardSecurityAlerts({ team, onTeam }: { team: TeamMember[]; onTeam: () => void }) {
  const alerts = team.filter((member) => (member.unauthorizedMinutes || 0) >= 5 || member.isLoggedOut);
  if (!alerts.length) return null;
  return <div className="space-y-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 shadow-sm sm:p-5">
    <div className="flex items-center justify-between border-b border-amber-200/80 pb-2"><h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-900"><ShieldAlert className="size-4 animate-pulse text-amber-600" />Live Software Security & Auto-Logout Alerts ({alerts.length})</h4><button onClick={onTeam} className="flex items-center gap-1 text-xs font-bold uppercase text-rose-700 underline"><Monitor className="size-3.5" /> Manage Team Roster →</button></div>
    <div className="grid grid-cols-1 gap-2 text-xs md:grid-cols-2">{alerts.map((member) => <div key={member.id} className={`flex items-center justify-between gap-2 rounded-lg border p-2.5 ${member.isLoggedOut ? 'border-red-300 bg-red-100/90 text-red-900' : 'border-amber-200 bg-white text-amber-950'}`}><div><div className="flex items-center gap-2"><strong className="text-slate-900">{member.name}</strong><span className={`flex items-center gap-1 rounded px-1.5 py-0.5 font-bold uppercase ${member.isLoggedOut ? 'bg-red-600 text-white' : 'bg-amber-200 text-amber-900'}`}>{member.isLoggedOut && <Lock className="size-3" />}{member.isLoggedOut ? 'Auto Logged Out' : `${member.unauthorizedMinutes}m Unauthorized`}</span></div><p className="mt-1 text-slate-600">Current App: <strong>{member.currentSoftware}</strong> (Assigned: {member.assignedSoftwares?.join(' | ') || member.assignedSoftware || 'N/A'})</p></div><button onClick={onTeam} className="rounded bg-rose-700 px-2.5 py-1 font-bold uppercase text-white">View</button></div>)}</div>
  </div>;
}
