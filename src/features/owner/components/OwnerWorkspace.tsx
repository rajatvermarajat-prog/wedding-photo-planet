import React, { useState } from 'react';
import { OwnerNote, OwnerNotepad } from './OwnerNotepad';
import { OwnerTodoList } from './OwnerTodoList';
import {
  Crown,
  ShieldCheck,
  LayoutGrid,
  ListTodo,
  NotebookPen,
} from 'lucide-react';
import { TeamMember, Project } from '@/types';

// ==================== TYPES ==================== //

interface OwnerWorkspaceProps {
  projects?: Project[];
  activeTeamMembers?: TeamMember[];
}

// ==================== INITIAL MOCK DATA ==================== //

const INITIAL_NOTES: OwnerNote[] = [
  {
    id: 'note-1',
    title: 'Studio Vendor & Album Printers Contacts',
    content: `• Subhash Album Printing Lab (Delhi): +91 9811223344 (Contact: Mr. Ramesh)
• Drone Permission Liaison Officer: Captain Sharma (+91 9876543210)
• Local Camera Gear Rental: CamRentals Gurgaon (+91 9810012345)
• RAW Storage HDD Wholesale Supplier: Western Digital Nehru Place - TechSupplies`,
    updatedAt: new Date().toISOString(),
    pinned: true,
  },
  {
    id: 'note-2',
    title: 'Upcoming Festival Season Special Offer Strategy 2026',
    content: `1. Offer complimentary Drone coverage on 3-day full wedding packages booked before Sept 1st.
2. Include 1 Mini Parent Velvet Album free with Signature Flush Mount Album package.
3. Launch Instagram Reel Teaser promo targeting Delhi NCR & Jaipur couples.`,
    updatedAt: new Date().toISOString(),
    pinned: false,
  },
];

// ==================== MAIN COMPONENT ==================== //

export const OwnerWorkspace: React.FC<OwnerWorkspaceProps> = ({
  projects = [],
  activeTeamMembers = [],
}) => {
  const [activeSection, setActiveSection] = useState<'all' | 'todo' | 'notepad'>('all');
  const [pendingTodosCount, setPendingTodosCount] = useState(0);
  const activeProjectsCount = projects.filter((project) => project.status !== 'completed').length;

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER BANNER - EXCLUSIVE OWNER WORKSPACE */}
      <div className="owner-hero bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 rounded-3xl p-6 text-white border border-rose-900/60 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-rose-600/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-slate-950 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <Crown className="size-4" /> OWNER EXCLUSIVE WORKSPACE
              </span>
              <span className="bg-slate-800/80 text-rose-300 border border-slate-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-rose-400" /> Private & Confidential
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2 sm:text-3xl">
              <span>Owner Strategic Command Desk</span>
            </h2>
            <p className="max-w-xl text-sm font-medium leading-relaxed text-rose-100/90 sm:text-base">
              Private executive control center for project oversight, personal tasks, and studio memos.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="owner-metrics grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-900/80 p-3 rounded-2xl border border-rose-900/50 backdrop-blur-xs">
            <div className="p-2 text-center border-r border-slate-800">
              <span className="block text-xs font-bold uppercase text-slate-300 sm:text-sm">Pending Tasks</span>
              <span className="text-xl font-black text-amber-400">{pendingTodosCount}</span>
            </div>
            <div className="p-2 text-center border-r border-slate-800">
              <span className="block text-xs font-bold uppercase text-slate-300 sm:text-sm">Active Projects</span>
              <span className="text-xl font-black text-rose-300">{activeProjectsCount}</span>
            </div>
            <div className="p-2 text-center">
              <span className="block text-xs font-bold uppercase text-slate-300 sm:text-sm">Studio Team</span>
              <span className="text-xl font-black text-emerald-300">{activeTeamMembers.length}</span>
            </div>
          </div>
        </div>

        {/* SECTION FILTER BUTTONS */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveSection('all')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 shrink-0 ${
              activeSection === 'all'
                ? 'bg-rose-700 text-white shadow-md font-extrabold'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
            }`}
          >
            <LayoutGrid className="size-4" />
            <span>All Columns</span>
          </button>

          <button
            onClick={() => setActiveSection('todo')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 shrink-0 ${
              activeSection === 'todo'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
            }`}
          >
            <ListTodo className="size-4" />
            <span>To-Do List Column ({pendingTodosCount})</span>
          </button>

          <button
            onClick={() => setActiveSection('notepad')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 shrink-0 ${
              activeSection === 'notepad'
                ? 'bg-rose-700 text-white shadow-md font-extrabold'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
            }`}
          >
            <NotebookPen className="size-4" />
            <span>Notepad / Memos</span>
          </button>
        </div>
      </div>

      {(activeSection === 'all' || activeSection === 'todo') && <OwnerTodoList onPendingCountChange={setPendingTodosCount} />}

      {(activeSection === 'all' || activeSection === 'notepad') && <OwnerNotepad initialNotes={INITIAL_NOTES} />}
    </div>
  );
};
