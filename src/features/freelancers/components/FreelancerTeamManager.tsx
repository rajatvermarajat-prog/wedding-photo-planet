import React, { useState } from 'react';
import { 
  Freelancer, 
  FreelancerAssignment, 
  FreelancerPayment, 
  FreelancerAttendance, 
  FreelancerDataReceived, 
  FreelancerCategory, 
  FreelancerActivityLog,
  Project,
  FreelancerDocument
} from '@/types';

import { FreelancerDashboardView } from './FreelancerDashboardView';
import { AllFreelancersView } from './AllFreelancersView';
import { ShootAssignmentsView } from './ShootAssignmentsView';
import { ShootCalendarView } from './ShootCalendarView';
import { FreelancerPaymentsView } from './FreelancerPaymentsView';
import { FreelancerAttendanceView } from './FreelancerAttendanceView';
import { FreelancerDataReceivedView } from './FreelancerDataReceivedView';
import { FreelancerReportsView } from './FreelancerReportsView';

import { CategoriesManagerModal } from './CategoriesManagerModal';
import { FreelancerFormModal } from './FreelancerFormModal';
import { FreelancerProfileModal } from './FreelancerProfileModal';

import { 
  Users, 
  LayoutDashboard, 
  Film, 
  Calendar as CalendarIcon, 
  CreditCard, 
  Clock, 
  HardDrive, 
  BarChart3, 
  Tag, 
  Plus, 
  UserPlus 
} from 'lucide-react';

interface FreelancerTeamManagerProps {
  freelancers: Freelancer[];
  categories: FreelancerCategory[];
  assignments: FreelancerAssignment[];
  payments: FreelancerPayment[];
  attendanceRecords: FreelancerAttendance[];
  dataReceivedList: FreelancerDataReceived[];
  activityLogs: FreelancerActivityLog[];
  projects: Project[];
  onSaveFreelancer: (freelancer: Freelancer) => void;
  onSaveCategories: (categories: FreelancerCategory[]) => void;
  onSaveAssignments: (assignments: FreelancerAssignment[]) => void;
  onUpdateAssignmentStatus: (assignmentId: string, status: FreelancerAssignment['assignmentStatus']) => void;
  onSavePayment: (payment: FreelancerPayment) => void;
  onSaveAttendance: (record: FreelancerAttendance) => void;
  onUpdateAvailability: (freelancerId: string, status: Freelancer['availabilityStatus']) => void;
  onSaveDataReceived: (record: FreelancerDataReceived) => void;
  onUpdateDataStatus: (dataId: string, status: FreelancerDataReceived['dataStatus']) => void;
  onUpdateDocument?: (freelancerId: string, doc: FreelancerDocument) => void;
  onDeleteFreelancer?: (freelancerId: string) => void;
  onDeleteAssignment?: (assignmentId: string) => void;
}

export const FreelancerTeamManager: React.FC<FreelancerTeamManagerProps> = ({
  freelancers,
  categories,
  assignments,
  payments,
  attendanceRecords,
  dataReceivedList,
  activityLogs,
  projects,
  onSaveFreelancer,
  onSaveCategories,
  onSaveAssignments,
  onUpdateAssignmentStatus,
  onSavePayment,
  onSaveAttendance,
  onUpdateAvailability,
  onSaveDataReceived,
  onUpdateDataStatus,
  onUpdateDocument,
  onDeleteFreelancer,
  onDeleteAssignment,
}) => {
  // Active Sub-tab State
  const [activeSubTab, setActiveSubTab] = useState<
    'dashboard' | 'all_freelancers' | 'assignments' | 'calendar' | 'payments' | 'attendance' | 'data_received' | 'reports'
  >('dashboard');

  // Modal States
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [showFreelancerFormModal, setShowFreelancerFormModal] = useState(false);
  const [editingFreelancer, setEditingFreelancer] = useState<Freelancer | null>(null);

  const [selectedProfileFreelancer, setSelectedProfileFreelancer] = useState<Freelancer | null>(null);

  const handleOpenAddForm = () => {
    setEditingFreelancer(null);
    setShowFreelancerFormModal(true);
  };

  const handleOpenEditForm = (freelancer: Freelancer) => {
    setEditingFreelancer(freelancer);
    setShowFreelancerFormModal(true);
  };

  const handleSaveFreelancerHandler = (saved: Freelancer) => {
    onSaveFreelancer(saved);
    setShowFreelancerFormModal(false);
    setEditingFreelancer(null);
  };

  return (
    <div className="space-y-6">
      {/* Module Navigation Sub-Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'dashboard', label: '1. Dashboard', icon: LayoutDashboard },
            { id: 'all_freelancers', label: `2. All Freelancers (${freelancers.length})`, icon: Users },
            { id: 'calendar', label: '3. Shoot Calendar', icon: CalendarIcon },
            { id: 'payments', label: `4. Payments (${payments.length})`, icon: CreditCard },
            { id: 'reports', label: `5. Reports`, icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`py-2 px-3.5 rounded-xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Categories Manager Button */}
        <button
          onClick={() => setShowCategoriesModal(true)}
          className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-extrabold rounded-xl transition flex items-center gap-1.5 whitespace-nowrap border border-indigo-200"
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Categories ({categories.length})</span>
        </button>
      </div>

      {/* RENDER ACTIVE SECTION */}
      {activeSubTab === 'dashboard' && (
        <FreelancerDashboardView
          freelancers={freelancers}
          assignments={assignments}
          payments={payments}
          dataReceivedList={dataReceivedList}
          categories={categories}
          projects={projects}
          onTabChange={(tab) => setActiveSubTab(tab as any)}
          onAddFreelancerClick={handleOpenAddForm}
          onAssignShootClick={() => setActiveSubTab('assignments')}
          onRecordPaymentClick={() => setActiveSubTab('payments')}
          onManageCategoriesClick={() => setShowCategoriesModal(true)}
          onOpenProfile={(f) => setSelectedProfileFreelancer(f)}
        />
      )}

      {activeSubTab === 'all_freelancers' && (
        <AllFreelancersView
          freelancers={freelancers}
          categories={categories}
          assignments={assignments}
          payments={payments}
          onOpenProfile={(f) => setSelectedProfileFreelancer(f)}
          onEditFreelancer={handleOpenEditForm}
          onAddFreelancerClick={handleOpenAddForm}
          onAssignShootClick={() => setActiveSubTab('assignments')}
          onRecordPaymentClick={() => setActiveSubTab('payments')}
          onDeleteFreelancer={onDeleteFreelancer}
        />
      )}

      {activeSubTab === 'assignments' && (
        <ShootAssignmentsView
          assignments={assignments}
          freelancers={freelancers}
          projects={projects}
          onSaveAssignment={onSaveAssignments}
          onUpdateAssignmentStatus={onUpdateAssignmentStatus}
          onDeleteAssignment={onDeleteAssignment}
        />
      )}

      {activeSubTab === 'calendar' && (
        <ShootCalendarView
          assignments={assignments}
          freelancers={freelancers}
        />
      )}

      {activeSubTab === 'payments' && (
        <FreelancerPaymentsView
          payments={payments}
          assignments={assignments}
          freelancers={freelancers}
          onSavePayment={onSavePayment}
        />
      )}

      {activeSubTab === 'attendance' && (
        <FreelancerAttendanceView
          attendanceRecords={attendanceRecords}
          freelancers={freelancers}
          onSaveAttendance={onSaveAttendance}
          onUpdateAvailability={onUpdateAvailability}
        />
      )}

      {activeSubTab === 'data_received' && (
        <FreelancerDataReceivedView
          dataReceivedList={dataReceivedList}
          freelancers={freelancers}
          assignments={assignments}
          onSaveDataReceived={onSaveDataReceived}
          onUpdateDataStatus={onUpdateDataStatus}
        />
      )}

      {activeSubTab === 'reports' && (
        <FreelancerReportsView
          freelancers={freelancers}
          assignments={assignments}
          payments={payments}
          dataReceivedList={dataReceivedList}
          categories={categories}
        />
      )}

      {/* MODALS */}
      {showCategoriesModal && (
        <CategoriesManagerModal
          categories={categories}
          onSaveCategories={onSaveCategories}
          onClose={() => setShowCategoriesModal(false)}
        />
      )}

      {showFreelancerFormModal && (
        <FreelancerFormModal
          existingFreelancer={editingFreelancer}
          categories={categories}
          onSave={handleSaveFreelancerHandler}
          onClose={() => {
            setShowFreelancerFormModal(false);
            setEditingFreelancer(null);
          }}
        />
      )}

      {selectedProfileFreelancer && (
        <FreelancerProfileModal
          freelancer={selectedProfileFreelancer}
          assignments={assignments}
          payments={payments}
          attendanceRecords={attendanceRecords}
          dataReceivedList={dataReceivedList}
          activityLogs={activityLogs}
          onEdit={(f) => {
            setSelectedProfileFreelancer(null);
            handleOpenEditForm(f);
          }}
          onClose={() => setSelectedProfileFreelancer(null)}
          onAddPaymentClick={() => {
            setSelectedProfileFreelancer(null);
            setActiveSubTab('payments');
          }}
          onAssignShootClick={() => {
            setSelectedProfileFreelancer(null);
            setActiveSubTab('assignments');
          }}
          onUpdateDocument={onUpdateDocument}
          onDeleteFreelancer={onDeleteFreelancer}
        />
      )}
    </div>
  );
};
