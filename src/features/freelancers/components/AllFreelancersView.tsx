import React, { useState } from 'react';
import { Freelancer, FreelancerCategory, FreelancerAssignment, FreelancerPayment } from '@/types';
import { ConfirmDeleteModal } from '@/components/common/ConfirmDeleteModal';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  MapPin, 
  Award, 
  DollarSign, 
  Eye, 
  Edit3, 
  ExternalLink,
  Tag,
  Grid,
  List,
  MessageSquare,
  Trash2
} from 'lucide-react';

interface AllFreelancersViewProps {
  freelancers: Freelancer[];
  categories: FreelancerCategory[];
  assignments?: FreelancerAssignment[];
  payments?: FreelancerPayment[];
  onOpenProfile: (freelancer: Freelancer) => void;
  onEditFreelancer: (freelancer: Freelancer) => void;
  onAddFreelancerClick: () => void;
  onAssignShootClick: (freelancerId: string) => void;
  onRecordPaymentClick: (freelancerId: string) => void;
  onDeleteFreelancer?: (freelancerId: string) => void;
}

export const AllFreelancersView: React.FC<AllFreelancersViewProps> = ({
  freelancers,
  categories,
  assignments = [],
  payments = [],
  onOpenProfile,
  onEditFreelancer,
  onAddFreelancerClick,
  onAssignShootClick,
  onRecordPaymentClick,
  onDeleteFreelancer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [deletingFreelancer, setDeletingFreelancer] = useState<Freelancer | null>(null);

  const filteredFreelancers = freelancers.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.freelancerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.mobile.includes(searchQuery) ||
      f.subCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' || f.mainCategory === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header controls bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-xs">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              All Production Freelancers ({freelancers.length})
            </h2>
            <p className="text-xs text-slate-500">Photographers, Cinematographers, Drone Pilots & Operators Directory</p>
          </div>
        </div>

        <button
          onClick={onAddFreelancerClick}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-2 justify-center"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Add New Freelancer</span>
        </button>
      </div>

      {/* Filter and View Toggles */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search name, FL-ID, mobile, skills, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2 py-1 text-xs bg-transparent font-bold text-slate-700 focus:outline-hidden"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-700'}`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition ${viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-700'}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid or Table View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFreelancers.map((freelancer) => {
            const flAssignments = assignments.filter((a) => a?.freelancerId === freelancer.id);
            const flPayments = payments.filter((p) => p?.freelancerId === freelancer.id);
            const totalAmount = flAssignments.reduce((sum, a) => sum + (a?.totalAgreedAmount || 0), 0);
            const totalPaid = flPayments.reduce((sum, p) => sum + (p?.amountPaid || 0), 0);
            const balance = Math.max(0, totalAmount - totalPaid);

            return (
              <div
                key={freelancer.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div
                  onClick={() => onOpenProfile(freelancer)}
                  className="cursor-pointer group"
                >
                  {/* Header */}
                  <div className="flex items-start gap-3.5">
                    <img
                      src={freelancer.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
                      alt={freelancer.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-500 shadow-2xs flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="font-black text-sm text-slate-900 truncate">{freelancer.name}</h3>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">
                          {freelancer.freelancerId}
                        </span>
                      </div>

                      <p className="text-xs font-bold text-indigo-600 mt-0.5">{freelancer.subCategory}</p>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-slate-500">
                          {freelancer.experienceYears} Yrs Exp • {freelancer.city || 'Jaipur'}
                        </span>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            freelancer.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Rate & Financials Badge */}
                  <div className="mt-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Per Day Rate</span>
                    <span className="font-black text-indigo-700 text-sm font-mono">
                      ₹{freelancer.perDayCharges.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="mt-2 grid grid-cols-3 gap-1 bg-slate-50 p-2 rounded-xl border border-slate-100 text-[10px]">
                    <div className="text-center">
                      <span className="text-slate-400 font-extrabold block uppercase text-[9px]">Total</span>
                      <span className="font-black text-slate-900 font-mono">₹{totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-slate-400 font-extrabold block uppercase text-[9px]">Paid</span>
                      <span className="font-black text-emerald-600 font-mono">₹{totalPaid.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-slate-400 font-extrabold block uppercase text-[9px]">Balance</span>
                      <span className={`font-black font-mono ${balance > 0 ? 'text-red-600' : 'text-slate-600'}`}>
                        ₹{balance.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Skills Badges */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {freelancer.skills.slice(0, 3).map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-[10px] font-semibold"
                      >
                        {skill}
                      </span>
                    ))}
                    {freelancer.skills.length > 3 && (
                      <span className="text-[10px] text-slate-400 font-bold self-center">
                        +{freelancer.skills.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => onOpenProfile(freelancer)}
                    className="flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-extrabold rounded-xl transition flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Profile</span>
                  </button>

                  <button
                    onClick={() => onAssignShootClick(freelancer.id)}
                    className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl transition flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Assign</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditFreelancer(freelancer);
                    }}
                    className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition flex-shrink-0 cursor-pointer"
                    title="Edit Freelancer Profile"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <a
                    href={`https://wa.me/${(freelancer.whatsapp || freelancer.mobile || '').replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition flex-shrink-0"
                    title="WhatsApp Freelancer"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>

                  {onDeleteFreelancer && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingFreelancer(freelancer);
                      }}
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition flex-shrink-0"
                      title="Delete Freelancer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-extrabold text-[10px] uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Freelancer</th>
                <th className="p-3.5">Category & Sub</th>
                <th className="p-3.5">Mobile</th>
                <th className="p-3.5">City</th>
                <th className="p-3.5">Per Day Charge</th>
                <th className="p-3.5 text-right">Total Amount</th>
                <th className="p-3.5 text-right">Paid</th>
                <th className="p-3.5 text-right">Balance</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFreelancers.map((f) => {
                const flAssignments = assignments.filter((a) => a?.freelancerId === f.id);
                const flPayments = payments.filter((p) => p?.freelancerId === f.id);
                const totalAmount = flAssignments.reduce((sum, a) => sum + (a?.totalAgreedAmount || 0), 0);
                const totalPaid = flPayments.reduce((sum, p) => sum + (p?.amountPaid || 0), 0);
                const balance = Math.max(0, totalAmount - totalPaid);

                return (
                  <tr key={f.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-extrabold text-slate-900 flex items-center gap-2">
                      <img src={f.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'} alt={f.name} className="w-7 h-7 rounded-full object-cover" />
                      <span>{f.name}</span>
                    </td>
                    <td className="p-3.5 text-slate-700">
                      <strong>{f.mainCategory}</strong> ({f.subCategory})
                    </td>
                    <td className="p-3.5 font-bold text-slate-800">{f.mobile}</td>
                    <td className="p-3.5 text-slate-600">{f.city || 'Jaipur'}</td>
                    <td className="p-3.5 font-black text-indigo-700 font-mono">₹{f.perDayCharges.toLocaleString('en-IN')}</td>
                    <td className="p-3.5 font-black text-slate-900 font-mono text-right">₹{totalAmount.toLocaleString('en-IN')}</td>
                    <td className="p-3.5 font-black text-emerald-600 font-mono text-right">₹{totalPaid.toLocaleString('en-IN')}</td>
                    <td className={`p-3.5 font-black font-mono text-right ${balance > 0 ? 'text-red-600' : 'text-slate-600'}`}>
                      ₹{balance.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full uppercase">
                        {f.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1">
                      <button
                        onClick={() => onOpenProfile(f)}
                        className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold rounded hover:bg-indigo-100"
                      >
                        View
                      </button>
                      <button
                        onClick={() => onEditFreelancer(f)}
                        className="px-2.5 py-1 bg-slate-100 text-slate-700 font-bold rounded hover:bg-slate-200"
                      >
                        Edit
                      </button>
                      {onDeleteFreelancer && (
                        <button
                          onClick={() => setDeletingFreelancer(f)}
                          className="px-2.5 py-1 bg-red-50 text-red-600 font-bold rounded hover:bg-red-100"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!deletingFreelancer}
        title="Delete Freelancer Profile"
        itemTitle={deletingFreelancer?.name}
        message={deletingFreelancer ? `Are you sure you want to permanently delete freelancer profile "${deletingFreelancer.name}" (${deletingFreelancer.freelancerId})? All assigned shoots and details will be removed.` : ''}
        onConfirm={() => {
          if (deletingFreelancer && onDeleteFreelancer) {
            onDeleteFreelancer(deletingFreelancer.id);
          }
          setDeletingFreelancer(null);
        }}
        onCancel={() => setDeletingFreelancer(null)}
      />
    </div>
  );
};
