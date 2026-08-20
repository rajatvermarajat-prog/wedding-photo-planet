import React, { useState } from 'react';
import { Project } from '@/types';
import { HardDrive, Cloud, ChevronDown, ChevronRight, CheckCircle2, Clock, ExternalLink } from 'lucide-react';

interface DataManagementProps {
  projects: Project[];
  onUpdateProject: (updated: Project) => void;
  onSelectProject?: (project: Project) => void;
}

export const DataManagement: React.FC<DataManagementProps> = ({ projects = [], onUpdateProject, onSelectProject }) => {
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  const totalGB = (projects || []).reduce((acc, p) => {
    const backup: Partial<Project['dataBackup']> = p.dataBackup || {};
    const projectShootsGB = (p.shoots || []).reduce((sAcc, s) => {
      const mainCrew = (s.crewAssignments || []).filter((c) => !c?.role?.toLowerCase().includes('assistant'));
      return sAcc + mainCrew.reduce((cAcc, c) => cAcc + (c?.dataSizeGB || 0), 0);
    }, 0);
    return acc + (backup.totalDataSizeGB || projectShootsGB);
  }, 0);
  const totalTB = (totalGB / 1000).toFixed(2);

  const cardOffloadedCount = (projects || []).filter(p => p.dataBackup?.offloadedFromCards).length;
  const hdd2DoneCount = (projects || []).filter(p => p.dataBackup?.hardDrive2Done).length;
  const cloudDoneCount = (projects || []).filter(p => p.dataBackup?.cloudBackupDone).length;

  const handleUpdateCrewData = (projectId: string, shootId: string, crewId: string, field: string, value: any) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    const updatedShoots = (project.shoots || []).map((s) => {
      if (s.id !== shootId) return s;
      const updatedCrew = (s.crewAssignments || []).map((c) => {
        if (c.id !== crewId) return c;
        return { ...c, [field]: value };
      });
      return { ...s, crewAssignments: updatedCrew };
    });

    const allCrew = updatedShoots.flatMap((s) => s.crewAssignments || []);
    const crewCopyHDs = Array.from(
      new Set(
        allCrew
          .map((c) => (c.copyInHD || c.hardDriveName || '').trim())
          .filter(Boolean)
      )
    ).join(', ');

    const crewBackupHDs = Array.from(
      new Set(
        allCrew
          .map((c) => (c.backupInHD || '').trim())
          .filter(Boolean)
      )
    ).join(', ');

    const backup = project.dataBackup || {
      offloadedFromCards: false,
      hardDrive1: 'HD-1',
      hardDrive1Done: false,
      hardDrive2: 'HD-2',
      hardDrive2Done: false,
      cloudBackupDone: false,
      totalDataSizeGB: 0,
      rawCleanupStatus: 'not_cleaned',
    };

    let updatedHD1 = backup.hardDrive1;
    if (!updatedHD1 || updatedHD1 === 'Pending Shoot' || updatedHD1 === 'HD-1' || field === 'copyInHD') {
      if (crewCopyHDs) updatedHD1 = crewCopyHDs;
    }

    let updatedHD2 = backup.hardDrive2;
    if (!updatedHD2 || updatedHD2 === 'Pending Shoot' || updatedHD2 === 'HD-2' || field === 'backupInHD') {
      if (crewBackupHDs) updatedHD2 = crewBackupHDs;
    }

    onUpdateProject({
      ...project,
      shoots: updatedShoots,
      dataBackup: {
        ...backup,
        hardDrive1: updatedHD1,
        hardDrive2: updatedHD2,
      },
    });
  };

  return (
    <div className="space-y-5 pb-8 w-full">
      
      {/* Title & Storage Summary */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3.5">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-indigo-600" />
            <span>RAW Data & Storage Vault Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Memory card offloading, Primary Vault HDD 1, Mirror Backup HDD 2, Cloud NAS sync, and Event-wise Shooter Data Received Logs.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Total Studio RAW Data</span>
            <span className="text-xl font-black text-indigo-600 mt-0.5 block">{totalTB} TB</span>
            <span className="text-[10px] text-slate-500">({totalGB.toLocaleString()} GB)</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Card Offloaded</span>
            <span className="text-xl font-black text-green-600 mt-0.5 block">{cardOffloadedCount} / {projects.length}</span>
            <span className="text-[10px] text-slate-500">Projects Offloaded</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Dual HDD Backed Up</span>
            <span className="text-xl font-black text-indigo-600 mt-0.5 block">{hdd2DoneCount} / {projects.length}</span>
            <span className="text-[10px] text-slate-500">Mirror Secured</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Cloud Synced</span>
            <span className="text-xl font-black text-sky-600 mt-0.5 block">{cloudDoneCount} / {projects.length}</span>
            <span className="text-[10px] text-slate-500">Google Drive / NAS</span>
          </div>
        </div>
      </div>

      {/* Projects Storage Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between font-bold text-xs text-slate-800 uppercase tracking-tight">
          <span>RAW Data Ledger & Shooter Offload Log by Project</span>
          <span className="text-[11px] text-slate-500 font-normal normal-case">Click project to expand shoot crew data log</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3.5">Client Project</th>
                <th className="py-2.5 px-3.5">Data Copy In HD</th>
                <th className="py-2.5 px-3.5">Data Backup In HD</th>
                <th className="py-2.5 px-3.5">Total Size in Both HDs</th>
                <th className="py-2.5 px-3.5">All Events Shooter Data Status</th>
                <th className="py-2.5 px-3.5">Done Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(projects || []).map((p) => {
                const isExpanded = expandedProjectId === p.id;
                const backup = p.dataBackup || {
                  offloadedFromCards: false,
                  hardDrive1: 'HD-1',
                  hardDrive1Done: false,
                  hardDrive2: 'HD-2',
                  hardDrive2Done: false,
                  cloudBackupLink: '',
                  cloudBackupDone: false,
                  totalDataSizeGB: 0,
                  rawCleanupStatus: 'not_cleaned',
                };

                const allCrew = (p.shoots || []).flatMap((s) => s.crewAssignments || []);
                const crewCopyHDs = Array.from(
                  new Set(
                    allCrew
                      .map((c) => (c.copyInHD || c.hardDriveName || '').trim())
                      .filter(Boolean)
                  )
                ).join(', ');

                const crewBackupHDs = Array.from(
                  new Set(
                    allCrew
                      .map((c) => (c.backupInHD || '').trim())
                      .filter(Boolean)
                  )
                ).join(', ');

                const effectiveHD1 = (backup.hardDrive1 && backup.hardDrive1 !== 'Pending Shoot' && backup.hardDrive1 !== 'HD-1')
                  ? backup.hardDrive1
                  : (crewCopyHDs || backup.hardDrive1 || '');

                const effectiveHD2 = (backup.hardDrive2 && backup.hardDrive2 !== 'Pending Shoot' && backup.hardDrive2 !== 'HD-2')
                  ? backup.hardDrive2
                  : (crewBackupHDs || backup.hardDrive2 || '');

                const totalCrewSlots = (p.shoots || []).reduce((acc, s) => {
                  const mainCrew = (s.crewAssignments || []).filter((c) => !c?.role?.toLowerCase().includes('assistant'));
                  return acc + mainCrew.length;
                }, 0);
                const receivedCrewSlots = (p.shoots || []).reduce((acc, s) => {
                  const mainCrew = (s.crewAssignments || []).filter((c) => !c?.role?.toLowerCase().includes('assistant'));
                  return acc + mainCrew.filter((c) => c?.dataReceived).length;
                }, 0);

                return (
                  <React.Fragment key={p.id}>
                    <tr className="hover:bg-slate-50 transition cursor-pointer" onClick={() => setExpandedProjectId(isExpanded ? null : p.id)}>
                      <td className="py-2.5 px-3.5 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-indigo-600 shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          <div>
                            <span 
                              onClick={(e) => {
                                if (onSelectProject) {
                                  e.stopPropagation();
                                  onSelectProject(p);
                                }
                              }}
                              className="text-slate-900 font-bold hover:text-indigo-600 hover:underline transition cursor-pointer flex items-center gap-1 group/link"
                              title="Click to view full project details"
                            >
                              <span>{p.clientWeddingTitle}</span>
                              <ExternalLink className="w-3 h-3 text-slate-400 group-hover/link:text-indigo-600 opacity-0 group-hover/link:opacity-100 transition" />
                            </span>
                            <span className="block text-[10px] font-normal text-slate-400">{p.primaryServiceType}</span>
                          </div>
                        </div>
                      </td>

                      {/* HDD 1 */}
                      <td className="py-2.5 px-3.5">
                        <span className="font-mono text-[11px] font-semibold text-slate-800 bg-slate-100 border border-slate-200/80 rounded px-2.5 py-1 inline-block max-w-[170px] truncate" title={effectiveHD1 || 'Pending Shoot'}>
                          {effectiveHD1 || 'Pending Shoot'}
                        </span>
                      </td>

                      {/* HDD 2 */}
                      <td className="py-2.5 px-3.5">
                        <span className="font-mono text-[11px] font-semibold text-slate-800 bg-slate-100 border border-slate-200/80 rounded px-2.5 py-1 inline-block max-w-[170px] truncate" title={effectiveHD2 || 'Pending Shoot'}>
                          {effectiveHD2 || 'Pending Shoot'}
                        </span>
                      </td>

                      {/* Size GB */}
                      <td className="py-2.5 px-3.5 font-mono font-bold text-indigo-600">
                        {(() => {
                          const projectShootsGB = (p.shoots || []).reduce((sAcc, s) => {
                            const mainCrew = (s.crewAssignments || []).filter((c) => !c?.role?.toLowerCase().includes('assistant'));
                            return sAcc + mainCrew.reduce((cAcc, c) => cAcc + (c?.dataSizeGB || 0), 0);
                          }, 0);
                          const val = backup.totalDataSizeGB || projectShootsGB;
                          return val >= 1000 ? `${parseFloat((val / 1000).toFixed(2))} TB` : `${val} GB`;
                        })()}
                      </td>

                      {/* Team Data Received Summary */}
                      <td className="py-2.5 px-3.5">
                        {totalCrewSlots > 0 ? (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            receivedCrewSlots === totalCrewSlots
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {receivedCrewSlots} / {totalCrewSlots} Crew Data Recd
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px] italic">No Crew</span>
                        )}
                      </td>

                      {/* Done Rate Progress Bar Line */}
                      <td className="py-2.5 px-3.5">
                        {(() => {
                          const crewDoneRate = totalCrewSlots > 0 ? Math.round((receivedCrewSlots / totalCrewSlots) * 100) : 0;
                          return (
                            <div className="w-28 space-y-0.5">
                              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                                <span>Done Rate</span>
                                <span className="text-indigo-600 font-extrabold">{crewDoneRate}%</span>
                              </div>
                              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                                  style={{ width: `${crewDoneRate}%` }}
                                />
                              </div>
                            </div>
                          );
                        })()}
                      </td>
                    </tr>

                    {/* EXPANDED EVENT-WISE TEAM MEMBER DATA LEDGER */}
                    {isExpanded && (
                      <tr className="bg-slate-50/80">
                        <td colSpan={6} className="p-4">
                          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4 shadow-xs">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                <HardDrive className="w-4 h-4 text-indigo-600" />
                                <span>Events & Shooter Data Received Log — {p.clientWeddingTitle}</span>
                              </h4>
                              <span className="text-[10px] font-bold text-slate-500">
                                {p.shoots?.length || 0} Event(s) Configured
                              </span>
                            </div>

                            {(!p.shoots || p.shoots.length === 0) ? (
                              <div className="text-slate-400 text-xs italic text-center p-4 bg-slate-50 rounded border border-dashed border-slate-200">
                                No shoot events added for this project yet.
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {(p.shoots || []).map((s) => {
                                  const mainCrew = (s.crewAssignments || []).filter((c) => !c?.role?.toLowerCase().includes('assistant'));
                                  const eventTotalGB = mainCrew.reduce((acc, c) => acc + (c?.dataSizeGB || 0), 0);
                                  return (
                                    <div key={s.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                                        <span>📅 {s.title || 'Wedding Event'} ({s.date})</span>
                                        <div className="flex items-center gap-2">
                                          <span className="text-[10px] font-black text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded border border-indigo-200">
                                            ⚡ Event Total: {eventTotalGB >= 1000 ? `${parseFloat((eventTotalGB / 1000).toFixed(2))} TB` : `${eventTotalGB} GB`}
                                          </span>
                                          <span className="text-[10px] text-indigo-600 font-semibold">{s.venue}</span>
                                        </div>
                                      </div>

                                      {(mainCrew.length === 0) ? (
                                        <div className="text-[10px] text-slate-400 italic p-2 bg-white rounded border border-slate-200">
                                          No main shooting team members assigned to this shoot event.
                                        </div>
                                      ) : (
                                        <div className="overflow-x-auto">
                                          <table className="w-full text-left text-xs bg-white rounded border border-slate-200 overflow-hidden">
                                            <thead className="bg-slate-100 text-slate-600 font-bold text-[10px] uppercase">
                                              <tr>
                                                <th className="p-2">Role & Team Member</th>
                                                <th className="p-2 text-center">Data Received</th>
                                                <th className="p-2 w-28">Data Size (GB)</th>
                                                <th className="p-2 min-w-[140px]">💾 Copy In HD</th>
                                                <th className="p-2 min-w-[140px]">🛡️ Backup In HD</th>
                                              </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                              {mainCrew.map((c, idx) => (
                                                <tr key={c.id || idx}>
                                                  <td className="p-2 font-bold text-slate-800">
                                                    <span className="text-[10px] text-slate-500 font-normal mr-1">[{c.role}]</span>
                                                    {c.name || 'Unassigned'}
                                                  </td>
                                                  <td className="p-2 text-center">
                                                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                                      <input
                                                        type="checkbox"
                                                        checked={!!c.dataReceived}
                                                        onChange={(e) => handleUpdateCrewData(p.id, s.id, c.id, 'dataReceived', e.target.checked)}
                                                        className="rounded text-indigo-600"
                                                      />
                                                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                                        c.dataReceived ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                                      }`}>
                                                        {c.dataReceived ? 'Received ✓' : 'Pending ⏳'}
                                                      </span>
                                                    </label>
                                                  </td>
                                                  <td className="p-2">
                                                    <div className="flex items-center gap-1">
                                                      <input
                                                        type="number"
                                                        placeholder="e.g. 250"
                                                        value={c.dataSizeGB || ''}
                                                        onChange={(e) => handleUpdateCrewData(p.id, s.id, c.id, 'dataSizeGB', Number(e.target.value))}
                                                        className="w-16 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-xs font-bold focus:bg-white outline-none"
                                                      />
                                                      <span className="text-[10px] text-slate-500 font-bold">GB</span>
                                                    </div>
                                                  </td>
                                                  <td className="p-2">
                                                    <input
                                                      type="text"
                                                      placeholder="Copy HD Name"
                                                      value={c.copyInHD ?? c.hardDriveName ?? ''}
                                                      onChange={(e) => handleUpdateCrewData(p.id, s.id, c.id, 'copyInHD', e.target.value)}
                                                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs font-medium focus:bg-white outline-none"
                                                    />
                                                  </td>
                                                  <td className="p-2">
                                                    <input
                                                      type="text"
                                                      placeholder="Backup HD Name"
                                                      value={c.backupInHD || ''}
                                                      onChange={(e) => handleUpdateCrewData(p.id, s.id, c.id, 'backupInHD', e.target.value)}
                                                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs font-medium focus:bg-white outline-none"
                                                    />
                                                  </td>
                                                </tr>
                                              ))}
                                            </tbody>
                                            <tfoot className="bg-slate-100/90 border-t-2 border-slate-200 font-bold text-slate-800">
                                              <tr>
                                                <td className="p-2 text-right text-slate-700 font-black text-[10px] uppercase tracking-tight" colSpan={2}>
                                                  📊 Total Event Data Size:
                                                </td>
                                                <td className="p-2" colSpan={3}>
                                                  <div className="flex items-center gap-2">
                                                    <span className="bg-indigo-600 text-white font-black text-xs px-2 py-0.5 rounded shadow-2xs">
                                                      {eventTotalGB} GB
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                                                      (Event RAW Storage)
                                                    </span>
                                                  </div>
                                                </td>
                                              </tr>
                                            </tfoot>
                                          </table>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* GRAND TOTAL ALL EVENTS DATA SIZE BANNER */}
                            {(() => {
                              const grandTotalGB = (p.shoots || [])
                                .flatMap((s) => (s.crewAssignments || []).filter((c) => !c?.role?.toLowerCase().includes('assistant')))
                                .reduce((acc, c) => acc + (c?.dataSizeGB || 0), 0);
                              return (
                                <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-lg p-3 flex items-center justify-between shadow-xs border border-indigo-800">
                                  <div className="flex items-center gap-2.5">
                                    <HardDrive className="w-4 h-4 text-indigo-300" />
                                    <span className="text-xs font-black uppercase text-indigo-200 tracking-wider">
                                      📊 ALL EVENTS GRAND TOTAL DATA SIZE:
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-base font-black text-amber-300 font-mono">
                                      {grandTotalGB >= 1000 ? `${parseFloat((grandTotalGB / 1000).toFixed(2))} TB` : `${grandTotalGB} GB`}
                                    </span>
                                    <span className="text-[10px] text-indigo-200 font-bold bg-white/10 px-2 py-0.5 rounded">
                                      ({grandTotalGB} GB Raw)
                                    </span>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

