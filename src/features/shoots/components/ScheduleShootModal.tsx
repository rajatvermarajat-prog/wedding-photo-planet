import React, { useMemo, useState } from 'react';
import { ArrowLeft, Camera, X } from 'lucide-react';
import { CrewMemberAssignment, Project, ShootEvent, TeamMember } from '@/types';
import { useToast } from '@/components/common';

interface Props {
  isOpen: boolean;
  variant?: 'modal' | 'page';
  onClose: () => void;
  projects: Project[];
  onUpdateProject: (updated: Project) => void;
  team?: TeamMember[];
  /** Pre-select a project, e.g. when opened from that project's own workspace. */
  defaultProjectId?: string;
}

const SHOOT_TYPE_SUGGESTIONS = ['Haldi', 'Mehendi', 'Sangeet', 'Wedding Ceremony', 'Reception', 'Pre-Wedding Shoot', 'Engagement'];

export function ScheduleShootModal({ isOpen, variant = 'modal', onClose, projects, onUpdateProject, team = [], defaultProjectId }: Props) {
  const { showToast } = useToast();

  const [projectId, setProjectId] = useState(defaultProjectId || '');
  const [shootType, setShootType] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [venue, setVenue] = useState('');
  const [photographer, setPhotographer] = useState('');
  const [cinematographer, setCinematographer] = useState('');
  const [editorTeam, setEditorTeam] = useState('');
  const [notes, setNotes] = useState('');

  const selectedProject = projects.find((p) => p.id === projectId);

  const photographerNames = useMemo(() => team.filter((m) => /photo/i.test(m.role)).map((m) => m.name), [team]);
  const cinematographerNames = useMemo(() => team.filter((m) => /cinemat|video/i.test(m.role)).map((m) => m.name), [team]);
  const editorNames = useMemo(() => team.filter((m) => /editor/i.test(m.role)).map((m) => m.name), [team]);

  if (!isOpen) return null;

  const resetForm = () => {
    setProjectId(defaultProjectId || '');
    setShootType('');
    setDate('');
    setStartTime('');
    setEndTime('');
    setVenue('');
    setPhotographer('');
    setCinematographer('');
    setEditorTeam('');
    setNotes('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !shootType.trim() || !date) {
      showToast('Pick a project, shoot type, and date to schedule a shoot.', { variant: 'error' });
      return;
    }

    const crewAssignments: CrewMemberAssignment[] = [];
    if (photographer.trim()) crewAssignments.push({ id: `crew-${Date.now()}-1`, name: photographer.trim(), role: 'Photographer' });
    if (cinematographer.trim()) crewAssignments.push({ id: `crew-${Date.now()}-2`, name: cinematographer.trim(), role: 'Cinematographer' });
    if (editorTeam.trim()) crewAssignments.push({ id: `crew-${Date.now()}-3`, name: editorTeam.trim(), role: 'Editor / Live' });

    const displayTime = startTime && endTime ? `${startTime} - ${endTime}` : startTime || endTime || 'Time TBD';

    const newShoot: ShootEvent = {
      id: `shoot-${Date.now()}`,
      title: shootType.trim(),
      date,
      time: displayTime,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      venue: venue.trim() || selectedProject.venueLocation,
      location: selectedProject.venueLocation,
      leadPhotographer: photographer.trim() || undefined,
      cinematographer: cinematographer.trim() || undefined,
      crewAssignments,
      status: 'scheduled',
      notes: notes.trim() || undefined,
    };

    onUpdateProject({ ...selectedProject, shoots: [...selectedProject.shoots, newShoot] });
    showToast(`${shootType.trim()} shoot scheduled for ${selectedProject.clientWeddingTitle}.`);
    handleClose();
  };

  return (
    <div className={variant === 'page' ? 'w-full space-y-3' : 'fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs'}>
      {variant === 'page' && (
        <button type="button" onClick={handleClose} className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#dfd9d2] bg-white px-3 py-2 text-slate-600 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-800">
          <ArrowLeft className="h-4 w-4" /><span className="text-xs font-bold">Back to Dashboard</span>
        </button>
      )}
      <div className={variant === 'page' ? 'mx-auto min-h-[calc(100vh-9rem)] w-full max-w-4xl space-y-5 rounded-2xl border border-[#dfd9d2] bg-white p-5 shadow-[0_12px_35px_rgba(48,31,38,.08)] sm:p-7' : 'max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-xl'}>
        <div className="flex items-center border-b border-slate-100 pb-3">
          <h4 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
            <Camera className="w-4 h-4 text-rose-600" />
            <span>Schedule a Shoot</span>
          </h4>
          {variant === 'modal' && (
            <button type="button" onClick={handleClose} className="ml-auto cursor-pointer rounded-lg p-1 text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Project / Client</label>
            <select
              required
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium cursor-pointer"
            >
              <option value="">Select a project…</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.clientWeddingTitle}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Shoot Type</label>
              <input
                required
                list="shoot-type-suggestions"
                type="text"
                placeholder="e.g. Sangeet"
                value={shootType}
                onChange={(e) => setShootType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
              />
              <datalist id="shoot-type-suggestions">
                {SHOOT_TYPE_SUGGESTIONS.map((s) => <option key={s} value={s} />)}
              </datalist>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Date</label>
              <input
                required
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Location / Venue</label>
            <input
              type="text"
              placeholder={selectedProject?.venueLocation || 'e.g. Grand Ballroom, Udaivilas'}
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Photographer</label>
              <input
                list="photographer-suggestions"
                type="text"
                placeholder="Lead photographer"
                value={photographer}
                onChange={(e) => setPhotographer(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
              />
              <datalist id="photographer-suggestions">
                {photographerNames.map((n) => <option key={n} value={n} />)}
              </datalist>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Cinematographer</label>
              <input
                list="cinematographer-suggestions"
                type="text"
                placeholder="Cinematographer"
                value={cinematographer}
                onChange={(e) => setCinematographer(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
              />
              <datalist id="cinematographer-suggestions">
                {cinematographerNames.map((n) => <option key={n} value={n} />)}
              </datalist>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Editor / Team</label>
            <input
              list="editor-suggestions"
              type="text"
              placeholder="Assigned editor or additional crew"
              value={editorTeam}
              onChange={(e) => setEditorTeam(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
            />
            <datalist id="editor-suggestions">
              {editorNames.map((n) => <option key={n} value={n} />)}
            </datalist>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Notes (Optional)</label>
            <textarea
              rows={2}
              placeholder="Anything the crew should know…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold cursor-pointer"
            >
              {variant === 'page' ? 'Back' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-xs cursor-pointer"
            >
              Schedule Shoot
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
