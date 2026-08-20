import React, { useState } from 'react';
import { 
  Camera, 
  Plus, 
  Sparkles, 
  LayoutDashboard, 
  FolderKanban, 
  Film, 
  HardDrive, 
  Users, 
  Truck, 
  Menu,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  Briefcase,
  Download,
  Upload,
  LogOut,
  ShieldCheck,
  UserCheck,
  Crown,
  Target
} from 'lucide-react';
import { ProjectStatus, TeamMember } from '@/types';

export type TabType = 'dashboard' | 'roles' | 'projects' | 'shoots' | 'data' | 'team' | 'freelancers' | 'deliveries' | 'owner_workspace' | 'leads';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isOpenOnMobile: boolean;
  setIsOpenOnMobile: (open: boolean) => void;
  currentUser?: TeamMember | { id: string; name: string; role: string; email: string } | null;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenOnMobile,
  setIsOpenOnMobile,
  currentUser,
  onLogout,
}) => {
  const isOwner = currentUser?.role === 'Owner';
  const isManager = currentUser?.role === 'Studio Manager' || currentUser?.role === 'Manager' || currentUser?.role === 'Account Manager';
  const isSales = currentUser?.role === 'Sales Executive' || currentUser?.role === 'Sales' || (currentUser?.role && currentUser.role.toLowerCase().includes('sales'));
  const isFullAdmin = isOwner || isManager;
  const canSeeLeads = true; // Leads & Inquiries accessible to all team members

  const navItems = [
    ...(isFullAdmin ? [{ id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard }] : []),
    ...(isOwner ? [{ id: 'owner_workspace' as TabType, label: 'Owner Workspace', icon: Crown }] : []),
    ...(!isOwner ? [{ id: 'roles' as TabType, label: 'Role Workspaces', icon: Briefcase }] : []),
    ...(canSeeLeads ? [{ id: 'leads' as TabType, label: 'Leads & Inquiries', icon: Target }] : []),
    { id: 'projects' as TabType, label: 'Projects', icon: FolderKanban },
    { id: 'shoots' as TabType, label: 'Shoot Management', icon: Film },
    ...(isFullAdmin ? [
      { id: 'data' as TabType, label: 'Data Management', icon: HardDrive },
      { id: 'team' as TabType, label: 'Team & Attendance', icon: Users },
      { id: 'freelancers' as TabType, label: 'Freelancer Team', icon: UserCheck },
    ] : [
      { id: 'freelancers' as TabType, label: 'Freelancer Team', icon: UserCheck },
    ]),
    { id: 'deliveries' as TabType, label: 'Deliveries', icon: Truck },
  ];

  const userInitials = currentUser?.name
    ? currentUser.name.split(' ').map((n) => n[0]).join('')
    : 'RV';

  return (
    <>
      {/* Mobile Overlay */}
      {isOpenOnMobile && (
        <div 
          onClick={() => setIsOpenOnMobile(false)} 
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`app-sidebar fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col border-r border-slate-700 transition-transform duration-200 transform ${
        isOpenOnMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Brand Header */}
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="sidebar-brand text-lg font-black tracking-tight text-indigo-400">
                WEDDING PHOTO PLANET
              </h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5 font-bold">
                CRM Studio System
              </p>
            </div>
            <button 
              onClick={() => setIsOpenOnMobile(false)}
              className="md:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="sidebar-divider h-[1px] bg-slate-700 my-3" />

          {/* User Profile Block */}
          <div className="sidebar-profile flex items-center justify-between bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs flex-shrink-0 ${
                isFullAdmin ? 'bg-indigo-600' : 'bg-emerald-600'
              }`}>
                {userInitials}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">{currentUser?.name || 'Rajat Verma'}</p>
                <p className="text-[10px] text-indigo-300 font-medium truncate flex items-center gap-1">
                  {isFullAdmin ? <ShieldCheck className="w-3 h-3 text-indigo-400 inline" /> : <UserCheck className="w-3 h-3 text-emerald-400 inline" />}
                  <span>{currentUser?.role || 'Owner'}</span>
                </p>
              </div>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                title="Switch Role / Logout"
                className="p-1.5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Item Links */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpenOnMobile(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Status & Logout button */}
        <div className="sidebar-footer p-4 mt-auto border-t border-slate-800 bg-slate-950/40 space-y-2">
          {onLogout && (
            <button
              onClick={onLogout}
              className="sidebar-switch w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition"
            >
              <LogOut className="w-3.5 h-3.5 text-indigo-400" />
              <span>Switch Account / Logout</span>
            </button>
          )}

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
            <span>Access: {isFullAdmin ? 'FULL ADMIN' : 'ROLE RESTRICTED'}</span>
            <div className="flex items-center gap-1 text-green-400">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span>Active</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

interface TopHeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  statusFilter: ProjectStatus | 'all';
  setStatusFilter: (filter: ProjectStatus | 'all') => void;
  onOpenNewProjectModal: () => void;
  onOpenAIModal: () => void;
  onToggleMobileSidebar: () => void;
  onExportData?: () => void;
  onImportData?: (file: File) => void;
  currentUser?: TeamMember | { id: string; name: string; role: string; email: string } | null;
  onLogout?: () => void;
  counts: {
    total: number;
    running: number;
    completed: number;
    readyToDeliver: number;
    pending: number;
    urgent: number;
  };
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  setActiveTab,
  statusFilter,
  setStatusFilter,
  onOpenNewProjectModal,
  onOpenAIModal,
  onToggleMobileSidebar,
  onExportData,
  onImportData,
  currentUser,
  onLogout,
  counts,
}) => {
  const isFullAdmin = currentUser?.role === 'Owner' || currentUser?.role === 'Studio Manager' || currentUser?.role === 'Manager' || currentUser?.role === 'Account Manager';

  return (
    <header className="min-h-14 bg-white border-b border-slate-200 flex flex-col md:flex-row items-stretch md:items-center px-4 sm:px-6 justify-between gap-2 z-20 py-2 md:py-0 shadow-xs">
      
      {/* Left side: Mobile Menu Toggle & Project Sub-Nav Filters */}
      <div className="flex items-center gap-4 overflow-x-auto scrollbar-none py-1">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 rounded border border-slate-200"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 sm:gap-6 text-xs sm:text-sm font-semibold text-slate-600 whitespace-nowrap">
          <button
            onClick={() => {
              setActiveTab('projects');
              setStatusFilter('all');
            }}
            className={`py-3 px-1 border-b-2 transition ${
              activeTab === 'projects' && statusFilter === 'all'
                ? 'text-indigo-600 border-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            All Projects ({counts.total})
          </button>

          <button
            onClick={() => {
              setActiveTab('projects');
              setStatusFilter('running');
            }}
            className={`py-3 px-1 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'projects' && statusFilter === 'running'
                ? 'text-indigo-600 border-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span>Running ({counts.running})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('deliveries');
            }}
            className={`py-3 px-1 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'deliveries' || (activeTab === 'projects' && statusFilter === 'ready_to_deliver')
                ? 'text-indigo-600 border-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
            <span>Ready ({counts.readyToDeliver})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('projects');
              setStatusFilter('urgent');
            }}
            className={`py-3 px-1 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'projects' && statusFilter === 'urgent'
                ? 'text-red-600 border-red-600 font-bold'
                : 'border-transparent text-red-500 hover:text-red-700'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            <span>Urgent ({counts.urgent})</span>
          </button>
        </div>
      </div>

      {/* Right side: Action Buttons & User Account Pill */}
      <div className="flex items-center justify-between md:justify-end gap-2 sm:gap-3 py-1">
        {/* User Account Quick Pill */}
        {currentUser && (
          <div className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1 rounded-xl border border-slate-200 transition">
            <div className="text-[11px] font-bold text-slate-800 leading-tight">
              <span>{currentUser.name.split(' ')[0]}</span>
              <span className="text-[9px] block text-indigo-700 font-mono font-black uppercase">
                {currentUser.role}
              </span>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                title="Logout / Switch Role"
                className="p-1 hover:bg-red-100 text-slate-500 hover:text-red-600 rounded-lg transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        <div className="flex items-center gap-1.5 sm:gap-2">
          {isFullAdmin && onExportData && (
            <button
              onClick={onExportData}
              title="Backup & Download All CRM Data"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}

          {isFullAdmin && onImportData && (
            <label
              title="Restore CRM Data from Backup JSON file"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Restore</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onImportData(file);
                    e.target.value = '';
                  }
                }}
              />
            </label>
          )}

          <button
            onClick={onOpenAIModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold border border-indigo-200 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">AI Helper</span>
          </button>

          {isFullAdmin && (
            <button
              onClick={onOpenNewProjectModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>+ New Project</span>
            </button>
          )}
        </div>
      </div>

    </header>
  );
};
