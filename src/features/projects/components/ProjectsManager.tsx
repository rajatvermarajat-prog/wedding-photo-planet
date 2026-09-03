import React, { useState } from 'react';
import { Project, ProjectStatus } from '@/types';
import { computeAutoProjectStatus } from '@/utils/projectStatusCalculator';
import { formatDateDDMMYYYY } from '@/utils/shootTracking';
import { ConfirmDeleteModal } from '@/components/common/ConfirmDeleteModal';
import { usePermission } from '@/features/access';
import { 
  Search, 
  Plus, 
  Phone, 
  MapPin, 
  Calendar, 
  ExternalLink, 
  Eye, 
  Edit3, 
  Trash2
} from 'lucide-react';

interface ProjectsManagerProps {
  projects: Project[];
  statusFilter: ProjectStatus | 'all';
  setStatusFilter: (filter: ProjectStatus | 'all') => void;
  onSelectProject: (project: Project) => void;
  onUpdateProject?: (project: Project) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onOpenNewProjectModal: () => void;
  onOpenAllPaymentsModal?: () => void;
  onGenerateInvoice: (project: Project) => void;
  currentUser?: any;
  userRole?: string;
}

export const ProjectsManager: React.FC<ProjectsManagerProps> = ({
  projects,
  statusFilter,
  setStatusFilter,
  onSelectProject,
  onUpdateProject,
  onEditProject,
  onDeleteProject,
  onOpenNewProjectModal,
  onOpenAllPaymentsModal,
  onGenerateInvoice,
  currentUser,
  userRole,
}) => {
  const { can } = usePermission();
  const canCreateWedding = can('weddings.create');
  const canEditWedding = can('weddings.edit');
  const canDeleteWedding = can('weddings.delete');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedServiceType, setSelectedServiceType] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Dynamic unique list of months from project dates
  const availableMonths = Array.from(
    new Set(
      projects.flatMap((p) => {
        const dates: string[] = [];
        if (p.weddingFunctionDates) dates.push(p.weddingFunctionDates.slice(0, 7));
        if (p.finalDeliveryDeadline) dates.push(p.finalDeliveryDeadline.slice(0, 7));
        if (p.createdAt) dates.push(p.createdAt.slice(0, 7));
        return dates;
      }).filter((d) => /^\d{4}-\d{2}$/.test(d))
    )
  ).sort().reverse();

  // Helper to format YYYY-MM to human readable month (e.g., "June 2026")
  const formatMonthYear = (yearMonth: string) => {
    try {
      const [y, m] = yearMonth.split('-');
      const date = new Date(parseInt(y), parseInt(m) - 1, 1);
      return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    } catch {
      return yearMonth;
    }
  };

  // Dynamic unique list of service types for filtering
  const allServiceTypes = Array.from(
    new Set([
      'Complete Wedding Services',
      'Wedding',
      'Pre Wedding',
      'Engagement',
      'Roka',
      'Haldi & Mehendi',
      'Sangeet',
      'Reception',
      'Other',
      ...projects.map((p) => p.primaryServiceType).filter(Boolean)
    ])
  );

  // Filtered logic focusing on Running, Completed, Delivered
  const filteredProjects = projects.filter((p) => {
    const workInfo = computeAutoProjectStatus(p);
    const effStatus = p.status === 'ready_to_deliver'
      ? 'ready_to_deliver'
      : (workInfo.autoStatus === 'completed' || workInfo.autoStatus === 'ready_to_deliver')
      ? workInfo.autoStatus
      : p.status || workInfo.autoStatus;

    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'running' && (effStatus === 'running' || effStatus === 'new_project' || effStatus === 'pending' || effStatus === 'urgent')) ||
      (statusFilter === 'completed' && (effStatus === 'completed' || effStatus === 'ready_to_deliver')) ||
      (statusFilter === 'ready_to_deliver' && effStatus === 'ready_to_deliver') ||
      effStatus === statusFilter;

    const matchesService = selectedServiceType === 'all' || p.primaryServiceType === selectedServiceType;

    const matchesMonth = 
      selectedMonth === 'all' ||
      (p.weddingFunctionDates && p.weddingFunctionDates.startsWith(selectedMonth)) ||
      (p.finalDeliveryDeadline && p.finalDeliveryDeadline.startsWith(selectedMonth)) ||
      (p.createdAt && p.createdAt.startsWith(selectedMonth));

    const matchesDateRange = (() => {
      if (!fromDate && !toDate) return true;
      const projectDates: string[] = [];
      if (p.weddingFunctionDates) {
        const matches = p.weddingFunctionDates.match(/\d{4}-\d{2}-\d{2}/g);
        if (matches) projectDates.push(...matches);
      }
      if (p.finalDeliveryDeadline) {
        const matches = p.finalDeliveryDeadline.match(/\d{4}-\d{2}-\d{2}/g);
        if (matches) projectDates.push(...matches);
      }
      if (p.createdAt) {
        const matches = p.createdAt.match(/\d{4}-\d{2}-\d{2}/g);
        if (matches) projectDates.push(...matches);
      }

      if (projectDates.length === 0) return false;

      return projectDates.some((d) => {
        if (fromDate && d < fromDate) return false;
        if (toDate && d > toDate) return false;
        return true;
      });
    })();

    const matchesSearch = 
      p.clientWeddingTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.clientContactMobile.includes(searchTerm) ||
      p.venueLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.primaryServiceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.weddingFunctionDates && p.weddingFunctionDates.includes(searchTerm));

    return matchesStatus && matchesService && matchesMonth && matchesDateRange && matchesSearch;
  });

  return (
    <div className="space-y-5 pb-8">
      
      {/* Top Title & Filters Bar */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3.5">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Client Project Management</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200 font-bold uppercase">
                {filteredProjects.length} Projects
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Client wedding titles, contacts, venues, budget, advance & balance, quotation links, and music notes.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {canCreateWedding && (
              <button
                onClick={onOpenNewProjectModal}
                className="px-3.5 py-1.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Add New Project</span>
              </button>
            )}
          </div>
        </div>

        {/* Search & Secondary Filter row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Client / Wedding Title, Mobile, Venue Location, Date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Service Type Filter */}
          <div>
            <select
              value={selectedServiceType}
              onChange={(e) => setSelectedServiceType(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition font-medium"
            >
              <option value="all">All Service Types ({projects.length})</option>
              {allServiceTypes.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Date Range Selector Bar (From Date / To Date) */}
        <div className="bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* From Date Input */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
              <span className="font-extrabold text-slate-700 uppercase text-[10px]">From Date:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-indigo-900 focus:outline-none cursor-pointer"
              />
            </div>

            {/* To Date Input */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
              <span className="font-extrabold text-slate-700 uppercase text-[10px]">To Date:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-indigo-900 focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          {(fromDate || toDate) && (
            <button
              type="button"
              onClick={() => { setFromDate(''); setToDate(''); }}
              className="px-3 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 font-extrabold rounded-lg text-xs transition border border-rose-200"
            >
              Clear Date Filter
            </button>
          )}
        </div>

        {/* Status Filter Tabs (Focused on Running, Completed, Delivered) */}
        <div className="flex items-center gap-1.5 pt-2 overflow-x-auto text-xs scrollbar-none border-t border-slate-100">
          <span className="text-slate-400 font-bold uppercase text-[10px] pr-1">Work Tracking:</span>

          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition uppercase tracking-wider ${
              statusFilter === 'all'
                ? 'bg-slate-800 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Projects
          </button>

          <button
            onClick={() => setStatusFilter('running')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition uppercase tracking-wider ${
              statusFilter === 'running'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
            }`}
          >
            🏃 Running
          </button>

          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition uppercase tracking-wider ${
              statusFilter === 'completed'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'bg-purple-50 text-purple-700 border border-purple-200'
            }`}
          >
            ✓ Completed
          </button>

          <button
            onClick={() => setStatusFilter('ready_to_deliver')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition uppercase tracking-wider ${
              statusFilter === 'ready_to_deliver'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            🚚 Delivered
          </button>
        </div>

      </div>

      {/* Projects Cards Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-xl p-10 border border-slate-200 text-center space-y-2">
          <p className="text-slate-500 text-xs">No projects match the current filter or search query.</p>
          {canCreateWedding && (
          <button
            onClick={onOpenNewProjectModal}
            className="px-3.5 py-1.5 rounded bg-indigo-600 text-white font-bold text-xs uppercase"
          >
            Create First Project
          </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project, idx) => {
            const workInfo = computeAutoProjectStatus(project);
            const displayStatus = project.status === 'ready_to_deliver'
              ? 'ready_to_deliver'
              : (workInfo.autoStatus === 'completed' || workInfo.autoStatus === 'ready_to_deliver')
              ? workInfo.autoStatus
              : project.status || workInfo.autoStatus;

            return (
              <div
                key={project.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden hover:border-indigo-300 transition flex flex-col justify-between group"
              >
                {/* Card Header */}
                <div className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      #{`0${idx + 1}`} • {project.primaryServiceType}
                    </span>
                    
                    {/* Quick Interactive Auto-Tracked Status Badge */}
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={
                          displayStatus === 'completed'
                            ? 'completed'
                            : displayStatus === 'ready_to_deliver'
                            ? 'ready_to_deliver'
                            : 'running'
                        }
                        onChange={(e) => {
                          e.stopPropagation();
                          if (onUpdateProject) {
                            onUpdateProject({
                              ...project,
                              status: e.target.value as ProjectStatus,
                            });
                          }
                        }}
                        className={`px-2 py-0.5 text-[10px] font-black rounded-lg border uppercase tracking-wider cursor-pointer outline-none transition shadow-2xs ${
                          displayStatus === 'ready_to_deliver'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                            : displayStatus === 'completed'
                            ? 'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200'
                            : 'bg-indigo-100 text-indigo-800 border-indigo-300 hover:bg-indigo-200'
                        }`}
                        title="Auto-tracked from project tasks & work status"
                      >
                        <option value="new_project" className="bg-white text-slate-900 font-bold">
                          ◷ UPCOMING
                        </option>
                        <option value="running" className="bg-white text-slate-900 font-bold">
                          🏃 RUNNING
                        </option>
                        <option value="completed" className="bg-white text-slate-900 font-bold">
                          ✓ COMPLETED
                        </option>
                        <option value="ready_to_deliver" className="bg-white text-slate-900 font-bold">
                          🚚 DELIVERED
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* 01 Client Title */}
                  <h3 
                    onClick={() => onSelectProject(project)}
                    className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition cursor-pointer leading-snug"
                  >
                    {project.clientWeddingTitle}
                  </h3>

                  {/* Task Work Auto Progress Bar */}
                  {workInfo.totalItems > 0 && (
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-700">
                        <span className="flex items-center gap-1">
                          📊 Task Tracking:
                        </span>
                        <span className="font-mono text-indigo-700">
                          {workInfo.completedItems}/{workInfo.totalItems} Done ({workInfo.completionPercent}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            workInfo.completionPercent === 100 
                              ? 'bg-purple-600' 
                              : workInfo.completionPercent > 50 
                              ? 'bg-indigo-600' 
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${workInfo.completionPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                {/* 02 Contact & 03 Venue & Date Column */}
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                    <span className="font-mono text-slate-800">{project.clientContactMobile || 'N/A'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                    <span className="truncate text-slate-700">{project.venueLocation || 'N/A'}</span>
                  </div>

                  {/* Date & Month Column Badge */}
                  <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-indigo-50/70 border border-indigo-100">
                    <div className="flex items-center gap-2 text-indigo-900">
                      <Calendar className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <div>
                        <span className="text-[10px] text-indigo-600 font-extrabold uppercase block tracking-wider">Date & Schedule</span>
                        <span className="text-xs font-bold text-slate-900">{formatDateDDMMYYYY(project.weddingFunctionDates) || 'TBD'}</span>
                      </div>
                    </div>
                    {project.weddingFunctionDates && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-200/80 text-indigo-800 uppercase">
                        {formatMonthYear(project.weddingFunctionDates.slice(0, 7))}
                      </span>
                    )}
                  </div>
                </div>



              </div>

              {/* Card Footer Action Bar */}
              <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 text-xs">
                
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onSelectProject(project)}
                    className="px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200/60 transition flex items-center gap-1 text-[11px] uppercase tracking-wider"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  {project.quotationLink && (
                    <a
                      href={project.quotationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded bg-white hover:bg-slate-100 text-indigo-600 border border-slate-200 transition"
                      title="Open Quotation Link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {canEditWedding && (
                  <button
                    onClick={() => onEditProject(project)}
                    className="p-1 rounded bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition"
                    title="Edit Project"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  )}

                  {canDeleteWedding && (
                  <button
                    onClick={() => setProjectToDelete(project)}
                    className="p-1 rounded bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 transition"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  )}
                </div>

              </div>

            </div>
          );
        })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!projectToDelete}
        projectTitle={projectToDelete?.clientWeddingTitle || ''}
        onConfirm={() => {
          if (canDeleteWedding && projectToDelete) {
            onDeleteProject(projectToDelete.id);
            setProjectToDelete(null);
          }
        }}
        onCancel={() => setProjectToDelete(null)}
      />

    </div>
  );
};
