import React, { useState } from 'react';
import { Project, ShootEvent } from '@/types';
import { Film, Calendar, MapPin, Users, CheckCircle2, ChevronDown, ChevronUp, ExternalLink, Clock, AlertCircle, Sparkles, UserPlus, Edit3, Plus, Trash2, X, UserCheck, BarChart2, FileText, Copy, Check, AlertTriangle } from 'lucide-react';
import { getShootDateInfo, getShootTrackingStats } from '@/utils/shootTracking';
import { INITIAL_FREELANCERS } from '@/data/mockFreelancers';
import { INITIAL_TEAM } from '@/data/mockData';

interface ShootManagementProps {
  projects: Project[];
  onUpdateProject: (updated: Project) => void;
  onSelectProject?: (project: Project) => void;
}

export const ShootManagement: React.FC<ShootManagementProps> = ({ projects, onUpdateProject, onSelectProject }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'scheduled' | 'completed'>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  
  // Track expanded project IDs. By default, first project or none can be expanded
  const [expandedProjectIds, setExpandedProjectIds] = useState<string[]>([]);

  // State for Crew Assignment Modal
  const [editingCrewShoot, setEditingCrewShoot] = useState<{
    projectId: string;
    shootId: string;
    shootTitle: string;
    clientTitle: string;
    leadPhotographer: string;
    cinematographer: string;
    droneOperator: string;
    assistant: string;
    crewAssignments: Array<{ id: string; role: string; name: string; mobile?: string }>;
  } | null>(null);

  const toggleExpandProject = (projId: string) => {
    setExpandedProjectIds((prev) =>
      prev.includes(projId) ? prev.filter((id) => id !== projId) : [...prev, projId]
    );
  };

  const expandAll = () => {
    setExpandedProjectIds(projects.map((p) => p.id));
  };

  const collapseAll = () => {
    setExpandedProjectIds([]);
  };

  const handleOpenAssignCrew = (projectId: string, clientTitle: string, shoot: ShootEvent) => {
    setEditingCrewShoot({
      projectId,
      shootId: shoot.id,
      shootTitle: shoot.title,
      clientTitle,
      leadPhotographer: shoot.leadPhotographer || '',
      cinematographer: shoot.cinematographer || '',
      droneOperator: shoot.droneOperator || '',
      assistant: shoot.assistant || '',
      crewAssignments: shoot.crewAssignments ? [...shoot.crewAssignments] : [],
    });
  };

  const handleSaveCrewAssignments = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCrewShoot) return;

    const proj = projects.find((p) => p.id === editingCrewShoot.projectId);
    if (!proj) return;

    const updatedShoots: Project['shoots'] = proj.shoots.map((s) => {
      if (s.id === editingCrewShoot.shootId) {
        return {
          ...s,
          leadPhotographer: editingCrewShoot.leadPhotographer.trim() || undefined,
          cinematographer: editingCrewShoot.cinematographer.trim() || undefined,
          droneOperator: editingCrewShoot.droneOperator.trim() || undefined,
          assistant: editingCrewShoot.assistant.trim() || undefined,
          crewAssignments: editingCrewShoot.crewAssignments.filter(
            (c) => c.name.trim() !== '' || c.role.trim() !== ''
          ),
        };
      }
      return s;
    });

    onUpdateProject({
      ...proj,
      shoots: updatedShoots,
    });

    setEditingCrewShoot(null);
  };

  // List of candidate names from team & freelancers for easy click/fill
  const availableCrewNames = Array.from(
    new Set([
      ...INITIAL_TEAM.map((t) => t.name),
      ...INITIAL_FREELANCERS.map((f) => f.name),
      'Rajat Verma',
      'Vikram Sharma',
      'Rahul Kumar',
      'Amit Singh',
      'Pawan Pasi',
      'Amit Kholi',
      'Neha Sharma',
      'Rohan Jha',
    ])
  );

  // Extract available months from projects' shoots
  const availableMonthOptions = React.useMemo(() => {
    const map = new Map<string, string>(); // 'YYYY-MM' -> 'Month YYYY'
    projects.forEach((p) => {
      p.shoots.forEach((s) => {
        if (s.date) {
          const match = s.date.match(/^(\d{4})-(\d{2})/);
          if (match) {
            const key = `${match[1]}-${match[2]}`;
            const yearNum = parseInt(match[1]);
            const monthNum = parseInt(match[2]) - 1;
            const dateObj = new Date(yearNum, monthNum, 1);
            const label = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            map.set(key, label);
          }
        }
      });
    });
    
    const sortedKeys = Array.from(map.keys()).sort();
    return sortedKeys.map((key) => ({ value: key, label: map.get(key)! }));
  }, [projects]);

  // Group projects and filter shoots by date-based tracking status, selected month, and selected date
  const projectsWithShoots = projects
    .map((p) => {
      const isAllShootsCompleted = p.shoots.length > 0 && p.shoots.every((s) => {
        const info = getShootDateInfo(s.date, s.status);
        return info.isDone;
      });

      const filteredShoots = p.shoots.filter((s) => {
        const info = getShootDateInfo(s.date, s.status);

        // Status filter
        if (filterStatus === 'scheduled' && info.isDone) return false;
        if (filterStatus === 'completed' && !info.isDone) return false;

        // Month filter
        if (selectedMonth !== 'all') {
          if (!s.date || !s.date.startsWith(selectedMonth)) {
            return false;
          }
        }

        // Exact Date filter
        if (selectedDate) {
          if (!s.date || s.date !== selectedDate) {
            return false;
          }
        }

        return true;
      });

      return {
        project: p,
        shoots: filteredShoots,
        isAllShootsCompleted,
      };
    })
    .filter((item) => {
      if (selectedProjectId !== 'all' && item.project.id !== selectedProjectId) {
        return false;
      }
      if (filterStatus === 'completed') {
        return item.isAllShootsCompleted && item.shoots.length > 0;
      }
      return item.shoots && item.shoots.length > 0;
    });

  // State for Report Modal
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reportMonthFilter, setReportMonthFilter] = useState<string>('all');
  const [reportDateFilter, setReportDateFilter] = useState<string>('');
  const [reportStatusFilter, setReportStatusFilter] = useState<'all' | 'pending' | 'assigned'>('all');
  const [copiedText, setCopiedText] = useState<boolean>(false);

  // Extract all shoots across all projects for report calculations
  const reportShootItems = React.useMemo(() => {
    const items: Array<{
      project: Project;
      shoot: ShootEvent;
      dateKey: string;
      formattedDateLabel: string;
      requiredSlots: Array<{ role: string; name: string; isAssigned: boolean }>;
      totalRequired: number;
      totalAssigned: number;
      totalPending: number;
      isFullyAssigned: boolean;
    }> = [];

    projects.forEach((proj) => {
      proj.shoots.forEach((s) => {
        let requiredSlots: Array<{ role: string; name: string; isAssigned: boolean }> = [];

        if (s.crewAssignments && s.crewAssignments.length > 0) {
          requiredSlots = s.crewAssignments.map((c) => ({
            role: c.role || 'Team Member',
            name: c.name || '',
            isAssigned: Boolean(c.name && c.name.trim() !== ''),
          }));
        } else {
          const standard = [
            { role: 'Lead Photographer', name: s.leadPhotographer || '' },
            { role: 'Cinematographer', name: s.cinematographer || '' },
            { role: 'Drone Operator', name: s.droneOperator || '' },
            { role: 'Assistant', name: s.assistant || '' },
          ];
          requiredSlots = standard.map((st) => ({
            role: st.role,
            name: st.name,
            isAssigned: Boolean(st.name && st.name.trim() !== ''),
          }));
        }

        const totalRequired = requiredSlots.length;
        const totalAssigned = requiredSlots.filter((slot) => slot.isAssigned).length;
        const totalPending = totalRequired - totalAssigned;
        const isFullyAssigned = totalRequired > 0 && totalPending === 0;

        let dateKey = s.date || 'Unscheduled';
        let formattedDateLabel = dateKey;
        if (s.date && s.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const [y, m, d] = s.date.split('-').map(Number);
          const dt = new Date(y, m - 1, d);
          formattedDateLabel = dt.toLocaleDateString('en-IN', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });
        }

        items.push({
          project: proj,
          shoot: s,
          dateKey,
          formattedDateLabel,
          requiredSlots,
          totalRequired,
          totalAssigned,
          totalPending,
          isFullyAssigned,
        });
      });
    });

    return items;
  }, [projects]);

  // Filter report items by report filters
  const filteredReportItems = React.useMemo(() => {
    return reportShootItems.filter((item) => {
      if (reportMonthFilter !== 'all') {
        if (!item.dateKey || !item.dateKey.startsWith(reportMonthFilter)) {
          return false;
        }
      }

      if (reportDateFilter) {
        if (!item.dateKey || item.dateKey !== reportDateFilter) {
          return false;
        }
      }

      if (reportStatusFilter === 'pending' && item.isFullyAssigned) return false;
      if (reportStatusFilter === 'assigned' && !item.isFullyAssigned) return false;

      return true;
    });
  }, [reportShootItems, reportMonthFilter, reportDateFilter, reportStatusFilter]);

  // Group report items by Date
  const groupedDateReports = React.useMemo(() => {
    const map = new Map<string, typeof filteredReportItems>();

    filteredReportItems.forEach((item) => {
      const list = map.get(item.dateKey) || [];
      list.push(item);
      map.set(item.dateKey, list);
    });

    const sortedDates = Array.from(map.keys()).sort();

    return sortedDates.map((dateKey) => {
      const items = map.get(dateKey)!;
      const formattedLabel = items[0]?.formattedDateLabel || dateKey;
      const totalShoots = items.length;
      const totalRequired = items.reduce((acc, curr) => acc + curr.totalRequired, 0);
      const totalAssigned = items.reduce((acc, curr) => acc + curr.totalAssigned, 0);
      const totalPending = items.reduce((acc, curr) => acc + curr.totalPending, 0);
      const isDateFullyAssigned = totalPending === 0 && totalRequired > 0;

      return {
        dateKey,
        formattedLabel,
        items,
        totalShoots,
        totalRequired,
        totalAssigned,
        totalPending,
        isDateFullyAssigned,
      };
    });
  }, [filteredReportItems]);

  // Summary Metrics for the Report
  const reportMetrics = React.useMemo(() => {
    const totalShoots = filteredReportItems.length;
    const totalRequired = filteredReportItems.reduce((acc, c) => acc + c.totalRequired, 0);
    const totalAssigned = filteredReportItems.reduce((acc, c) => acc + c.totalAssigned, 0);
    const totalPending = filteredReportItems.reduce((acc, c) => acc + c.totalPending, 0);
    const fullyAssignedShoots = filteredReportItems.filter((c) => c.isFullyAssigned).length;
    const pendingShoots = totalShoots - fullyAssignedShoots;

    return {
      totalShoots,
      totalRequired,
      totalAssigned,
      totalPending,
      fullyAssignedShoots,
      pendingShoots,
    };
  }, [filteredReportItems]);

  const handleCopyReportSummary = () => {
    let monthLabel = reportMonthFilter === 'all' ? 'All Months' : reportMonthFilter;
    if (reportDateFilter) monthLabel += ` (Date: ${reportDateFilter})`;

    const lines = [
      `📊 *SHOOT & TEAM ALLOCATION RESOURCE REPORT*`,
      `📅 Filter Period: ${monthLabel}`,
      `----------------------------------------`,
      `• Total Scheduled Shoots: ${reportMetrics.totalShoots}`,
      `• Required Crew Slots: ${reportMetrics.totalRequired} Members`,
      `• Assigned Crew: ${reportMetrics.totalAssigned} | Pending: ${reportMetrics.totalPending}`,
      `• Fully Staffed Shoots: ${reportMetrics.fullyAssignedShoots} / ${reportMetrics.totalShoots}`,
      `----------------------------------------`,
      `*DATE-BY-DATE BREAKDOWN:*`,
      ``,
    ];

    groupedDateReports.forEach((group) => {
      lines.push(`📅 *Date: ${group.formattedLabel}* (${group.totalShoots} Shoot${group.totalShoots > 1 ? 's' : ''})`);
      lines.push(`   Status: ${group.isDateFullyAssigned ? '✅ Fully Assigned' : `⚠️ ${group.totalPending} Member(s) Pending`}`);
      lines.push(`   Crew Allocation: ${group.totalAssigned}/${group.totalRequired} Assigned`);

      group.items.forEach((item, idx) => {
        lines.push(`   ${idx + 1}. *${item.project.clientWeddingTitle || item.project.name}* - ${item.shoot.title}`);
        lines.push(`      Venue: ${item.shoot.venue || item.shoot.location || 'N/A'}`);

        const assignedNames = item.requiredSlots
          .filter((s) => s.isAssigned)
          .map((s) => `${s.role}: ${s.name}`)
          .join(', ');

        const pendingRoles = item.requiredSlots
          .filter((s) => !s.isAssigned)
          .map((s) => s.role)
          .join(', ');

        if (assignedNames) lines.push(`      ✓ Assigned: ${assignedNames}`);
        if (pendingRoles) lines.push(`      ❌ Needed: ${pendingRoles}`);
      });
      lines.push(``);
    });

    const fullText = lines.join('\n');
    navigator.clipboard.writeText(fullText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const toggleShootStatus = (projectId: string, shootId: string) => {
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return;

    const updatedShoots = proj.shoots.map((s) => {
      if (s.id === shootId) {
        return {
          ...s,
          status: s.status === 'completed' ? ('scheduled' as const) : ('completed' as const),
        };
      }
      return s;
    });

    onUpdateProject({
      ...proj,
      shoots: updatedShoots,
    });
  };

  return (
    <div className="space-y-5 pb-8 w-full">
      
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Film className="w-5 h-5 text-indigo-600" />
            <span>Shoot Management & Crew Desk</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Click on any client name to view their scheduled functions, dates, crew assignments, and gear lists.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={expandAll}
            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded border border-indigo-200 transition cursor-pointer"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="text-[11px] font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded border border-slate-200 transition cursor-pointer"
          >
            Collapse All
          </button>

          {/* Report Button */}
          <button
            onClick={() => {
              setReportMonthFilter(selectedMonth);
              setReportDateFilter(selectedDate);
              setShowReportModal(true);
            }}
            className="text-[11px] font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg shadow-xs transition cursor-pointer flex items-center gap-1.5 border border-indigo-500/30"
            title="View Date & Month Shoot Allocation Report"
          >
            <BarChart2 className="w-3.5 h-3.5 text-indigo-200" />
            <span>📊 Shoot & Crew Report</span>
          </button>

          {/* Month Filter Dropdown */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-white border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
          >
            <option value="all">📅 All Months</option>
            {availableMonthOptions.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          {/* Specific Date Picker Input */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded px-2.5 py-1">
            <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
              title="Filter by Specific Date"
            />
            {selectedDate && (
              <button
                type="button"
                onClick={() => setSelectedDate('')}
                className="text-slate-400 hover:text-red-500 p-0.5 cursor-pointer"
                title="Clear Date Filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Client Project Filter */}
          <select
            value={selectedProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              if (e.target.value !== 'all') {
                setExpandedProjectIds([e.target.value]);
              }
            }}
            className="bg-white border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
          >
            <option value="all">All Client Projects ({projects.length})</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.clientWeddingTitle}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-white border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled Only</option>
            <option value="completed">Completed Only</option>
          </select>

          {/* Reset All Filters Button */}
          {(selectedProjectId !== 'all' || filterStatus !== 'all' || selectedMonth !== 'all' || selectedDate !== '') && (
            <button
              type="button"
              onClick={() => {
                setSelectedProjectId('all');
                setFilterStatus('all');
                setSelectedMonth('all');
                setSelectedDate('');
              }}
              className="text-[11px] font-extrabold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2 py-1.5 rounded border border-red-200 transition cursor-pointer flex items-center gap-1"
              title="Reset all active filters"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Projects Accordion List */}
      {projectsWithShoots.length === 0 ? (
        <div className="bg-white rounded-xl p-10 border border-slate-200 text-center text-slate-500 text-xs font-semibold">
          No shoots found for the selected filter.
        </div>
      ) : (
        <div className="space-y-3">
          {projectsWithShoots.map(({ project, shoots }) => {
            const isExpanded = expandedProjectIds.includes(project.id);
            const stats = getShootTrackingStats(project.shoots);

            return (
              <div
                key={project.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all duration-200"
              >
                {/* Client Name Bar (Header with Shoot Tracking Overview) */}
                <div
                  onClick={() => toggleExpandProject(project.id)}
                  className={`p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 cursor-pointer select-none transition ${
                    isExpanded ? 'bg-indigo-50/50 border-b border-slate-200' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-base shrink-0 shadow-xs">
                      {project.clientWeddingTitle.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition truncate">
                          {project.clientWeddingTitle}
                        </h3>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 border border-indigo-200 shrink-0">
                          {project.primaryServiceType}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{project.venueLocation || 'Location N/A'}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{project.weddingFunctionDates || 'Dates N/A'}</span>
                        </span>
                      </div>

                      {/* All Shoot Names & Date-Based Tracking Badges Preview */}
                      {shoots.length > 0 && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 pt-1">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider shrink-0 self-start sm:self-center">
                            Shoots ({shoots.length}):
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {shoots.map((s) => {
                              const dateInfo = getShootDateInfo(s.date, s.status);
                              return (
                                <span
                                  key={s.id}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-extrabold border leading-none shadow-2xs ${dateInfo.badgeClass}`}
                                  title={`${s.title} • Date: ${s.date}`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dateInfo.badgeDotColor}`} />
                                  <span className="whitespace-nowrap">{s.title}</span>
                                  <span className="opacity-80 font-mono text-[9px] shrink-0">({s.date})</span>
                                  <span className="text-[9px] font-black uppercase px-1 py-0.5 rounded bg-white/70 tracking-wider shrink-0">
                                    {dateInfo.dateBadgeText}
                                  </span>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Badges, Progress & Expand Icon */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between lg:justify-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    
                    {/* Date-Based Status Counters */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-black text-xs border border-slate-200" title="Total Shoots">
                        {stats.total} Total
                      </span>
                      {stats.todayCount > 0 && (
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-900 font-black text-xs border border-indigo-300 animate-pulse flex items-center gap-1" title="Shoots scheduled for TODAY">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          {stats.todayCount} TODAY
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs border border-emerald-200 flex items-center gap-1" title="Shoots Completed (or Past Date)">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {stats.completed} Done
                      </span>
                      {stats.pending > 0 && (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 font-black text-xs border border-amber-200 flex items-center gap-1" title="Shoots Pending">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          {stats.pending} Pending
                        </span>
                      )}
                    </div>

                    {/* Completion Mini Bar */}
                    <div className="w-full sm:w-28 space-y-0.5">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                        <span>Done Rate</span>
                        <span className="text-indigo-600 font-extrabold">{stats.completionPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                          style={{ width: `${stats.completionPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {onSelectProject && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectProject(project);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition flex items-center gap-1 text-xs font-bold border border-indigo-200 cursor-pointer"
                          title="View full project details modal"
                        >
                          <span>Details</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <div className="p-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-700 transition">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="p-4 bg-slate-50/50 space-y-4">
                    
                    {/* Shoot Tracking Summary Dashboard Banner */}
                    <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                            <Film className="w-4 h-4 text-indigo-600" />
                            SHOOT TRACKING & PROGRESS STATUS
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Auto-calculates shoot status (Completed/Done, Today, Pending) based on event dates vs current date for {project.clientWeddingTitle}
                          </p>
                        </div>
                        <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                          {stats.completed} / {stats.total} Shoots Completed ({stats.completionPercent}%)
                        </span>
                      </div>

                      {/* Stat Cards Row */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Scheduled</span>
                          <span className="text-lg font-black text-slate-900">{stats.total}</span>
                          <span className="text-[10px] text-slate-500 block font-medium">Shoot Events</span>
                        </div>
                        <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                          <span className="text-[10px] font-bold text-emerald-700 uppercase block">Shoot Done</span>
                          <span className="text-lg font-black text-emerald-700">{stats.completed}</span>
                          <span className="text-[10px] text-emerald-600 block font-bold">Completed / Past Date</span>
                        </div>
                        <div className="bg-indigo-50 p-2.5 rounded-lg border border-indigo-200">
                          <span className="text-[10px] font-bold text-indigo-700 uppercase block">Today's Shoot</span>
                          <span className="text-lg font-black text-indigo-700">{stats.todayCount}</span>
                          <span className="text-[10px] text-indigo-600 block font-bold">Active Today</span>
                        </div>
                        <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                          <span className="text-[10px] font-bold text-amber-700 uppercase block">Pending</span>
                          <span className="text-lg font-black text-amber-800">{stats.pending}</span>
                          <span className="text-[10px] text-amber-600 block font-bold">Upcoming</span>
                        </div>
                      </div>

                      {/* Complete Progress Bar */}
                      <div className="space-y-1">
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                          <div
                            className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                            style={{ width: `${stats.completionPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {shoots.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No shoots found matching filter for this client.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {shoots.map((s, sIdx) => {
                          const dateInfo = getShootDateInfo(s.date, s.status);
                          return (
                            <div
                              key={s.id}
                              className={`rounded-xl border p-4 shadow-xs transition space-y-3 bg-white ${
                                dateInfo.isDone
                                  ? 'border-emerald-200 bg-emerald-50/20'
                                  : dateInfo.isToday
                                  ? 'border-indigo-300 bg-indigo-50/30 ring-1 ring-indigo-200'
                                  : 'border-slate-200 hover:border-indigo-300'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block mb-0.5">
                                    {project.clientWeddingTitle}
                                  </span>
                                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">EVENT #{sIdx + 1}</span>
                                  <h4 className="text-base font-bold text-slate-900">{s.title}</h4>
                                </div>

                                <button
                                  onClick={() => toggleShootStatus(project.id, s.id)}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition flex items-center gap-1 uppercase tracking-wider cursor-pointer border shadow-2xs ${
                                    s.status === 'completed'
                                      ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'
                                      : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
                                  }`}
                                  title="Toggle status manually"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>{s.status === 'completed' ? 'Shoot Done' : 'Mark Done'}</span>
                                </button>
                              </div>

                              {/* Date Tracking Banner on Card */}
                              <div className={`p-2 rounded-lg border text-xs font-medium flex items-center justify-between gap-2 ${dateInfo.badgeClass}`}>
                                <div className="flex items-center gap-1.5 font-bold">
                                  <span className={`w-2 h-2 rounded-full ${dateInfo.badgeDotColor}`} />
                                  <span>{dateInfo.statusLabel}</span>
                                </div>
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-white/80 text-slate-800 border border-slate-200">
                                  {dateInfo.hindiLabel}
                                </span>
                              </div>

                              {/* Date & Location */}
                              <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                                  <div>
                                    <span className="text-[9px] text-slate-400 block font-bold uppercase">Date & Time</span>
                                    <span className="font-bold text-slate-900">{s.date} ({s.time || 'Full Day'})</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <MapPin className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                                  <div>
                                    <span className="text-[9px] text-slate-400 block font-bold uppercase">Venue</span>
                                    <span className="font-bold text-slate-900 truncate block">{s.venue || 'Venue TBD'}</span>
                                  </div>
                                </div>
                              </div>

                            {/* Crew List */}
                            <div className="space-y-1.5 pt-2 border-t border-slate-100">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 uppercase tracking-wider">
                                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                                  Assigned Shoot Crew
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleOpenAssignCrew(project.id, project.clientWeddingTitle || project.name, s)}
                                  className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-extrabold rounded-lg flex items-center gap-1 border border-indigo-200 cursor-pointer transition shadow-2xs"
                                >
                                  <UserPlus className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>+ Assign / Edit Crew</span>
                                </button>
                              </div>

                              {s.crewAssignments && s.crewAssignments.length > 0 ? (
                                <div 
                                  onClick={() => handleOpenAssignCrew(project.id, project.clientWeddingTitle || project.name, s)}
                                  className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs cursor-pointer group"
                                  title="Click to assign or edit team crew"
                                >
                                  {s.crewAssignments.map((c, idx) => (
                                    <div key={c.id || idx} className="bg-slate-50 group-hover:bg-indigo-50/50 p-1.5 rounded border border-slate-200 group-hover:border-indigo-300 transition">
                                      <span className="text-[9px] text-indigo-600 block uppercase font-bold">{c.role} #{idx + 1}</span>
                                      <span className="font-bold text-slate-900 block truncate">{c.name || 'Unassigned'}</span>
                                      {c.mobile && (
                                        <span className="text-[10px] font-mono text-slate-500 block">{c.mobile}</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div 
                                  onClick={() => handleOpenAssignCrew(project.id, project.clientWeddingTitle || project.name, s)}
                                  className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs cursor-pointer group"
                                  title="Click to assign or edit team crew"
                                >
                                  {s.leadPhotographer && (
                                    <div className="bg-slate-50 group-hover:bg-indigo-50/50 p-1.5 rounded border border-slate-200 group-hover:border-indigo-300 transition">
                                      <span className="text-[9px] text-slate-400 group-hover:text-indigo-600 block uppercase font-semibold">Lead Photo</span>
                                      <span className="font-bold text-slate-800">{s.leadPhotographer}</span>
                                    </div>
                                  )}
                                  {s.cinematographer && (
                                    <div className="bg-slate-50 group-hover:bg-indigo-50/50 p-1.5 rounded border border-slate-200 group-hover:border-indigo-300 transition">
                                      <span className="text-[9px] text-slate-400 group-hover:text-indigo-600 block uppercase font-semibold">Cinematographer</span>
                                      <span className="font-bold text-slate-800">{s.cinematographer}</span>
                                    </div>
                                  )}
                                  {s.droneOperator && (
                                    <div className="bg-slate-50 group-hover:bg-indigo-50/50 p-1.5 rounded border border-slate-200 group-hover:border-indigo-300 transition">
                                      <span className="text-[9px] text-slate-400 group-hover:text-indigo-600 block uppercase font-semibold">Drone Pilot</span>
                                      <span className="font-bold text-slate-800">{s.droneOperator}</span>
                                    </div>
                                  )}
                                  {s.assistant && (
                                    <div className="bg-slate-50 group-hover:bg-indigo-50/50 p-1.5 rounded border border-slate-200 group-hover:border-indigo-300 transition">
                                      <span className="text-[9px] text-slate-400 group-hover:text-indigo-600 block uppercase font-semibold">Assistant</span>
                                      <span className="font-bold text-slate-800">{s.assistant}</span>
                                    </div>
                                  )}
                                  {!s.leadPhotographer && !s.cinematographer && !s.droneOperator && !s.assistant && (
                                    <div className="col-span-4 bg-amber-50/60 p-2 rounded border border-dashed border-amber-200 text-center hover:bg-amber-100/60 transition">
                                      <span className="text-xs font-extrabold text-amber-800 flex items-center justify-center gap-1">
                                        <UserPlus className="w-3.5 h-3.5 text-amber-600" />
                                        No crew assigned yet — Click here to assign team
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Gear Checklist */}
                            {s.equipmentChecklist && s.equipmentChecklist.length > 0 && (
                              <div className="pt-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Gear Checklist:</span>
                                <div className="flex flex-wrap gap-1">
                                  {s.equipmentChecklist.map((gear, idx) => (
                                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-[10px] text-slate-700 font-medium">
                                      • {gear}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                          </div>
                        );
                      })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CREW ASSIGNMENT MODAL */}
      {editingCrewShoot && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Assign Team Crew
                  </h3>
                  <p className="text-xs font-semibold text-indigo-600">
                    {editingCrewShoot.clientTitle} • {editingCrewShoot.shootTitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingCrewShoot(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCrewAssignments} className="space-y-4 pt-4">
              
              {/* Quick Select Crew Pill Tags */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Quick Select Team / Freelancers:
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {availableCrewNames.map((name) => (
                    <span
                      key={name}
                      onClick={() => {
                        if (!editingCrewShoot.leadPhotographer) {
                          setEditingCrewShoot({ ...editingCrewShoot, leadPhotographer: name });
                        } else if (!editingCrewShoot.cinematographer) {
                          setEditingCrewShoot({ ...editingCrewShoot, cinematographer: name });
                        } else if (!editingCrewShoot.droneOperator) {
                          setEditingCrewShoot({ ...editingCrewShoot, droneOperator: name });
                        } else if (!editingCrewShoot.assistant) {
                          setEditingCrewShoot({ ...editingCrewShoot, assistant: name });
                        } else {
                          setEditingCrewShoot({
                            ...editingCrewShoot,
                            crewAssignments: [
                              ...editingCrewShoot.crewAssignments,
                              { id: `c-${Date.now()}`, role: 'Team Member', name },
                            ],
                          });
                        }
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-indigo-600 hover:text-white border border-slate-200 hover:border-indigo-600 text-xs font-bold text-slate-700 rounded-lg cursor-pointer transition shadow-2xs"
                      title="Click to fill into next empty role"
                    >
                      + {name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Standard Roles Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center justify-between">
                    <span>Lead Photographer</span>
                    {editingCrewShoot.leadPhotographer && (
                      <button
                        type="button"
                        onClick={() => setEditingCrewShoot({ ...editingCrewShoot, leadPhotographer: '' })}
                        className="text-[10px] text-red-500 hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </label>
                  <input
                    type="text"
                    value={editingCrewShoot.leadPhotographer}
                    onChange={(e) => setEditingCrewShoot({ ...editingCrewShoot, leadPhotographer: e.target.value })}
                    placeholder="Enter name (e.g. Rajat Verma)"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center justify-between">
                    <span>Cinematographer</span>
                    {editingCrewShoot.cinematographer && (
                      <button
                        type="button"
                        onClick={() => setEditingCrewShoot({ ...editingCrewShoot, cinematographer: '' })}
                        className="text-[10px] text-red-500 hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </label>
                  <input
                    type="text"
                    value={editingCrewShoot.cinematographer}
                    onChange={(e) => setEditingCrewShoot({ ...editingCrewShoot, cinematographer: e.target.value })}
                    placeholder="Enter name (e.g. Vikram Sharma)"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center justify-between">
                    <span>Drone Pilot / Operator</span>
                    {editingCrewShoot.droneOperator && (
                      <button
                        type="button"
                        onClick={() => setEditingCrewShoot({ ...editingCrewShoot, droneOperator: '' })}
                        className="text-[10px] text-red-500 hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </label>
                  <input
                    type="text"
                    value={editingCrewShoot.droneOperator}
                    onChange={(e) => setEditingCrewShoot({ ...editingCrewShoot, droneOperator: e.target.value })}
                    placeholder="Enter name (e.g. Rahul Kumar)"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center justify-between">
                    <span>Assistant</span>
                    {editingCrewShoot.assistant && (
                      <button
                        type="button"
                        onClick={() => setEditingCrewShoot({ ...editingCrewShoot, assistant: '' })}
                        className="text-[10px] text-red-500 hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </label>
                  <input
                    type="text"
                    value={editingCrewShoot.assistant}
                    onChange={(e) => setEditingCrewShoot({ ...editingCrewShoot, assistant: e.target.value })}
                    placeholder="Enter name (e.g. Amit Singh)"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Additional Custom Crew Members */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                    Additional Crew Members ({editingCrewShoot.crewAssignments.length})
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingCrewShoot({
                        ...editingCrewShoot,
                        crewAssignments: [
                          ...editingCrewShoot.crewAssignments,
                          { id: `custom-${Date.now()}`, role: 'Candid Photo', name: '' },
                        ],
                      })
                    }
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Role</span>
                  </button>
                </div>

                {editingCrewShoot.crewAssignments.map((crew, idx) => (
                  <div key={crew.id || idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <div className="col-span-4">
                      <input
                        type="text"
                        value={crew.role}
                        onChange={(e) => {
                          const updated = [...editingCrewShoot.crewAssignments];
                          updated[idx].role = e.target.value;
                          setEditingCrewShoot({ ...editingCrewShoot, crewAssignments: updated });
                        }}
                        placeholder="Role (e.g. Crane)"
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-bold text-slate-800"
                      />
                    </div>
                    <div className="col-span-7">
                      <input
                        type="text"
                        value={crew.name}
                        onChange={(e) => {
                          const updated = [...editingCrewShoot.crewAssignments];
                          updated[idx].name = e.target.value;
                          setEditingCrewShoot({ ...editingCrewShoot, crewAssignments: updated });
                        }}
                        placeholder="Person Name"
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-bold text-slate-900"
                      />
                    </div>
                    <div className="col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = editingCrewShoot.crewAssignments.filter((_, i) => i !== idx);
                          setEditingCrewShoot({ ...editingCrewShoot, crewAssignments: updated });
                        }}
                        className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                        title="Remove role"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Form Footer Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCrewShoot(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-extrabold hover:bg-indigo-700 shadow-md flex items-center gap-1.5 cursor-pointer transition"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Save Crew Assignments</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* SHOOT & TEAM RESOURCE ALLOCATION REPORT MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-5 shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                    <span>Shoot & Team Resource Allocation Report</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Check shoots per date, required crew members, assigned team status, and missing crew slots.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyReportSummary}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 transition cursor-pointer flex items-center gap-1.5"
                  title="Copy formatted summary report"
                >
                  {copiedText ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-extrabold">Copied Report!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Report</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Controls / Filter Bar */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mt-3 mb-3 shrink-0 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Month Selector */}
                <div className="flex items-center gap-1">
                  <span className="font-bold text-slate-500 uppercase text-[10px]">Month:</span>
                  <select
                    value={reportMonthFilter}
                    onChange={(e) => setReportMonthFilter(e.target.value)}
                    className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="all">📅 All Months</option>
                    {availableMonthOptions.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Specific Date Filter */}
                <div className="flex items-center gap-1 bg-white border border-slate-300 rounded px-2 py-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <input
                    type="date"
                    value={reportDateFilter}
                    onChange={(e) => setReportDateFilter(e.target.value)}
                    className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                  />
                  {reportDateFilter && (
                    <button
                      type="button"
                      onClick={() => setReportDateFilter('')}
                      className="text-slate-400 hover:text-red-500 p-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1">
                  <span className="font-bold text-slate-500 uppercase text-[10px]">Status:</span>
                  <select
                    value={reportStatusFilter}
                    onChange={(e) => setReportStatusFilter(e.target.value as any)}
                    className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="all">All Shoots</option>
                    <option value="pending">⚠️ Pending Crew Needed</option>
                    <option value="assigned">✅ Fully Staffed Only</option>
                  </select>
                </div>
              </div>

              {(reportMonthFilter !== 'all' || reportDateFilter !== '' || reportStatusFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setReportMonthFilter('all');
                    setReportDateFilter('');
                    setReportStatusFilter('all');
                  }}
                  className="text-xs font-extrabold text-red-600 hover:text-red-800 underline cursor-pointer"
                >
                  Reset Report Filters
                </button>
              )}
            </div>

            {/* KPI Executive Summary Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4 shrink-0">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Shoots</span>
                <span className="text-xl font-black text-slate-900">{reportMetrics.totalShoots}</span>
                <span className="text-[10px] text-slate-500 block">Scheduled Events</span>
              </div>

              <div className="bg-indigo-50/60 border border-indigo-200 p-3 rounded-xl">
                <span className="text-[10px] font-bold text-indigo-700 uppercase block">Required Crew Slots</span>
                <span className="text-xl font-black text-indigo-900">{reportMetrics.totalRequired}</span>
                <span className="text-[10px] text-indigo-600 block">Total Team Need</span>
              </div>

              <div className="bg-emerald-50/60 border border-emerald-200 p-3 rounded-xl">
                <span className="text-[10px] font-bold text-emerald-700 uppercase block">Crew Assigned</span>
                <span className="text-xl font-black text-emerald-900">{reportMetrics.totalAssigned}</span>
                <span className="text-[10px] text-emerald-600 block">Confirmed Team</span>
              </div>

              <div className={`p-3 rounded-xl border ${reportMetrics.totalPending > 0 ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
                <span className={`text-[10px] font-bold uppercase block ${reportMetrics.totalPending > 0 ? 'text-amber-800' : 'text-slate-500'}`}>
                  Pending Crew Slots
                </span>
                <span className={`text-xl font-black ${reportMetrics.totalPending > 0 ? 'text-amber-900' : 'text-slate-900'}`}>
                  {reportMetrics.totalPending}
                </span>
                <span className={`text-[10px] block ${reportMetrics.totalPending > 0 ? 'text-amber-700 font-bold' : 'text-slate-500'}`}>
                  {reportMetrics.totalPending > 0 ? '⚠️ Action Required' : '✓ All Slots Filled'}
                </span>
              </div>
            </div>

            {/* Scrollable Date-by-Date Allocation List */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {groupedDateReports.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600">No shoots match the selected report filter criteria.</p>
                </div>
              ) : (
                groupedDateReports.map((group) => (
                  <div key={group.dateKey} className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                    
                    {/* Date Card Header */}
                    <div className="bg-slate-800 text-white p-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-300" />
                        <span className="font-extrabold text-sm tracking-wide">{group.formattedLabel}</span>
                        <span className="bg-slate-700 text-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-600">
                          {group.totalShoots} Shoot{group.totalShoots > 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-300 text-[11px]">
                          Crew Needed: <strong className="text-white">{group.totalRequired}</strong>
                        </span>
                        <span className="text-slate-300 text-[11px]">
                          Assigned: <strong className="text-emerald-400">{group.totalAssigned}</strong>
                        </span>
                        {group.totalPending > 0 ? (
                          <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">
                            ⚠️ {group.totalPending} Pending
                          </span>
                        ) : (
                          <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[10px] font-black uppercase">
                            ✓ Fully Staffed
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Shoots List under this Date */}
                    <div className="p-3 space-y-3 divide-y divide-slate-100">
                      {group.items.map((item, sIdx) => (
                        <div key={item.shoot.id || sIdx} className="pt-2 first:pt-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-slate-900 text-xs sm:text-sm">
                                  {item.project.clientWeddingTitle || item.project.name}
                                </span>
                                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                                  {item.shoot.title}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                                <span>📍 {item.shoot.venue || item.shoot.location || 'Venue Not Set'}</span>
                                {item.shoot.time && <span>⏰ {item.shoot.time}</span>}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setShowReportModal(false);
                                handleOpenAssignCrew(item.project.id, item.project.clientWeddingTitle || item.project.name, item.shoot);
                              }}
                              className="self-start sm:self-auto px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-extrabold rounded-lg flex items-center gap-1 shadow-2xs transition cursor-pointer"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>Assign Crew</span>
                            </button>
                          </div>

                          {/* Crew Slots Grid for this shoot */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-2">
                            {item.requiredSlots.map((slot, idx) => (
                              <div
                                key={idx}
                                className={`p-1.5 rounded border text-xs flex flex-col justify-between ${
                                  slot.isAssigned
                                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                                    : 'bg-amber-50/70 border-amber-300 text-amber-950'
                                }`}
                              >
                                <span className="text-[9px] font-bold uppercase tracking-wider block opacity-75">
                                  {slot.role}
                                </span>
                                {slot.isAssigned ? (
                                  <span className="font-extrabold text-emerald-900 truncate flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                    {slot.name}
                                  </span>
                                ) : (
                                  <span className="font-extrabold text-amber-800 text-[11px] flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                                    Unassigned Needed
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>

                        </div>
                      ))}
                    </div>

                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
              <span>
                Showing <strong>{filteredReportItems.length}</strong> shoot events across <strong>{groupedDateReports.length}</strong> unique dates.
              </span>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
              >
                Close Report
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

