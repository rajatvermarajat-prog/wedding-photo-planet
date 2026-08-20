import React from 'react';
import { Project } from '@/types';
import { Truck, CheckCircle2 } from 'lucide-react';

interface DeliveriesManagerProps {
  projects: Project[];
  onUpdateProject: (updated: Project) => void;
  onSelectProject: (project: Project) => void;
}

export const DeliveriesManager: React.FC<DeliveriesManagerProps> = ({
  projects,
  onUpdateProject,
  onSelectProject,
}) => {
  const readyToDeliverProjects = projects.filter(p => p.status === 'ready_to_deliver');

  return (
    <div className="space-y-5 pb-8">
      
      {/* Banner */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-indigo-600" />
            <span>Deliveries & Client Handover Hub</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track final deliverables: RAW Data HDD, Cinematic Teasers, Full Films, Instagram Reels, High-Res Photos, and Printed Albums.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-green-100 text-green-700 font-bold text-xs border border-green-200 uppercase tracking-wider">
            {readyToDeliverProjects.length} Ready for Handover
          </span>
        </div>
      </div>

      {/* Ready to Deliver Cards Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          Ready to Deliver Projects
        </h3>

        {readyToDeliverProjects.length === 0 ? (
          <div className="bg-white rounded-xl p-8 border border-slate-200 text-center text-slate-500 text-xs">
            No projects currently marked as 'Ready to Deliver'.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {readyToDeliverProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3 hover:border-indigo-300 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[9px] font-bold text-green-700 uppercase tracking-wider block mb-0.5">
                      Ready for Handover
                    </span>
                    <h4 
                      onClick={() => onSelectProject(project)}
                      className="text-base font-bold text-slate-900 hover:text-indigo-600 cursor-pointer transition"
                    >
                      {project.clientWeddingTitle}
                    </h4>
                  </div>

                  <button
                    onClick={() => {
                      const updated: Project = {
                        ...project,
                        status: 'completed',
                        deliveryStatus: {
                          ...project.deliveryStatus,
                          finalDeliveryDate: new Date().toISOString().split('T')[0],
                        }
                      };
                      onUpdateProject(updated);
                      alert(`${project.clientWeddingTitle} marked as Fully Delivered & Completed!`);
                    }}
                    className="px-2.5 py-1 rounded bg-green-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-green-700 transition shadow-xs"
                  >
                    Mark Delivered
                  </button>
                </div>

                {/* Handover Checklist with Select All / Unselect All */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                      Handover Deliverables Checklist
                    </span>
                    {(() => {
                      const allChecked = 
                        project.deliveryStatus.rawHandoverDone &&
                        project.deliveryStatus.teaserLinkSent &&
                        project.deliveryStatus.fullFilmSent &&
                        project.deliveryStatus.reelsSent &&
                        project.deliveryStatus.highResPhotosSent &&
                        project.deliveryStatus.albumPrintedAndDelivered;

                      return (
                        <button
                          type="button"
                          onClick={() => {
                            const val = !allChecked;
                            onUpdateProject({
                              ...project,
                              deliveryStatus: {
                                ...project.deliveryStatus,
                                rawHandoverDone: val,
                                teaserLinkSent: val,
                                fullFilmSent: val,
                                reelsSent: val,
                                highResPhotosSent: val,
                                albumPrintedAndDelivered: val,
                              }
                            });
                          }}
                          className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 underline uppercase tracking-tight"
                        >
                          {allChecked ? 'Unselect All' : 'Select All'}
                        </button>
                      );
                    })()}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <label className="flex items-center gap-2 p-1 rounded hover:bg-slate-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={project.deliveryStatus.rawHandoverDone}
                        onChange={(e) => {
                          onUpdateProject({
                            ...project,
                            deliveryStatus: { ...project.deliveryStatus, rawHandoverDone: e.target.checked }
                          });
                        }}
                        className="w-4 h-4 accent-indigo-600 rounded"
                      />
                      <span className="text-slate-800 text-xs font-semibold">RAW HDD Handed Over</span>
                    </label>

                    <label className="flex items-center gap-2 p-1 rounded hover:bg-slate-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={project.deliveryStatus.teaserLinkSent}
                        onChange={(e) => {
                          onUpdateProject({
                            ...project,
                            deliveryStatus: { ...project.deliveryStatus, teaserLinkSent: e.target.checked }
                          });
                        }}
                        className="w-4 h-4 accent-indigo-600 rounded"
                      />
                      <span className="text-slate-800 text-xs font-semibold">Teaser Sent</span>
                    </label>

                    <label className="flex items-center gap-2 p-1 rounded hover:bg-slate-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={project.deliveryStatus.fullFilmSent}
                        onChange={(e) => {
                          onUpdateProject({
                            ...project,
                            deliveryStatus: { ...project.deliveryStatus, fullFilmSent: e.target.checked }
                          });
                        }}
                        className="w-4 h-4 accent-indigo-600 rounded"
                      />
                      <span className="text-slate-800 text-xs font-semibold">Full Film Sent</span>
                    </label>

                    <label className="flex items-center gap-2 p-1 rounded hover:bg-slate-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={project.deliveryStatus.reelsSent}
                        onChange={(e) => {
                          onUpdateProject({
                            ...project,
                            deliveryStatus: { ...project.deliveryStatus, reelsSent: e.target.checked }
                          });
                        }}
                        className="w-4 h-4 accent-indigo-600 rounded"
                      />
                      <span className="text-slate-800 text-xs font-semibold">Reels Drive Delivered</span>
                    </label>

                    <label className="flex items-center gap-2 p-1 rounded hover:bg-slate-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={project.deliveryStatus.highResPhotosSent}
                        onChange={(e) => {
                          onUpdateProject({
                            ...project,
                            deliveryStatus: { ...project.deliveryStatus, highResPhotosSent: e.target.checked }
                          });
                        }}
                        className="w-4 h-4 accent-indigo-600 rounded"
                      />
                      <span className="text-slate-800 text-xs font-semibold">Photos Gallery</span>
                    </label>

                    <label className="flex items-center gap-2 p-1 rounded hover:bg-slate-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={project.deliveryStatus.albumPrintedAndDelivered}
                        onChange={(e) => {
                          onUpdateProject({
                            ...project,
                            deliveryStatus: { ...project.deliveryStatus, albumPrintedAndDelivered: e.target.checked }
                          });
                        }}
                        className="w-4 h-4 accent-indigo-600 rounded"
                      />
                      <span className="text-slate-800 text-xs font-semibold">Printed Album Received</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Deadline: {project.finalDeliveryDeadline}</span>
                  <span className="font-bold text-red-600">Balance: ₹{project.balanceDue.toLocaleString('en-IN')}</span>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

