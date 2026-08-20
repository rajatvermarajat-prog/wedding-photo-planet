import React, { useState } from 'react';
import { ConfirmDeleteModal } from '@/components/common/ConfirmDeleteModal';
import { 
  Freelancer, 
  FreelancerAssignment, 
  FreelancerPayment, 
  FreelancerAttendance, 
  FreelancerDataReceived, 
  FreelancerActivityLog,
  FreelancerDocument
} from '@/types';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  DollarSign, 
  CreditCard, 
  FileText, 
  HardDrive, 
  ShieldCheck, 
  Plus, 
  Edit3, 
  ExternalLink,
  Award,
  Layers,
  Upload,
  Activity,
  Film,
  Trash2
} from 'lucide-react';

interface FreelancerProfileModalProps {
  freelancer: Freelancer;
  assignments: FreelancerAssignment[];
  payments: FreelancerPayment[];
  attendanceRecords: FreelancerAttendance[];
  dataReceivedList: FreelancerDataReceived[];
  activityLogs: FreelancerActivityLog[];
  onEdit: (freelancer: Freelancer) => void;
  onClose: () => void;
  onAddPaymentClick?: (freelancerId: string) => void;
  onAssignShootClick?: (freelancerId: string) => void;
  onUpdateDocument?: (freelancerId: string, doc: FreelancerDocument) => void;
  onDeleteFreelancer?: (freelancerId: string) => void;
}

export const FreelancerProfileModal: React.FC<FreelancerProfileModalProps> = ({
  freelancer,
  assignments,
  payments,
  attendanceRecords,
  dataReceivedList,
  activityLogs,
  onEdit,
  onClose,
  onAddPaymentClick,
  onAssignShootClick,
  onUpdateDocument,
  onDeleteFreelancer,
}) => {
  const [activeProfileTab, setActiveProfileTab] = useState<
    'shoots' | 'overview' | 'payments' | 'attendance' | 'data' | 'documents' | 'notes'
  >('shoots');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Filter freelancer specific records
  const myAssignments = assignments.filter((a) => a.freelancerId === freelancer.id);
  const myPayments = payments.filter((p) => p.freelancerId === freelancer.id);
  const myAttendance = attendanceRecords.filter((att) => att.freelancerId === freelancer.id);
  const myDataReceived = dataReceivedList.filter((d) => d.freelancerId === freelancer.id);
  const myLogs = activityLogs.filter((l) => l.freelancerId === freelancer.id || l.freelancerName === freelancer.name);

  // Stats calculation
  const totalShoots = myAssignments.length;
  const upcomingShoots = myAssignments.filter((a) => a.assignmentStatus === 'assigned' || a.assignmentStatus === 'confirmed').length;
  const completedShoots = myAssignments.filter((a) => a.assignmentStatus === 'completed').length;

  const totalEarnings = myAssignments.reduce((sum, a) => sum + (a.totalAgreedAmount || 0), 0);
  const paidAmount = myPayments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
  const pendingAmount = Math.max(0, totalEarnings - paidAmount);

  // New Document Upload State
  const [showAddDocForm, setShowAddDocForm] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState<'id_proof' | 'agreement' | 'bank_details' | 'other'>('id_proof');
  const [docUrl, setDocUrl] = useState('');

  const handleAddDocumentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) return;

    const newDoc: FreelancerDocument = {
      id: `doc-${Date.now()}`,
      title: docTitle.trim(),
      type: docType,
      fileUrl: docUrl.trim() || 'https://weddingphotoplanet.com/docs/placeholder.pdf',
      fileName: `${docTitle.trim().replace(/\s+/g, '_')}.pdf`,
      status: 'uploaded',
      uploadDate: new Date().toISOString().split('T')[0],
    };

    if (onUpdateDocument) {
      onUpdateDocument(freelancer.id, newDoc);
    }
    setShowAddDocForm(false);
    setDocTitle('');
    setDocUrl('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden my-6">
        {/* Header Profile Banner */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={freelancer.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
                alt={freelancer.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500 shadow-md flex-shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black tracking-tight">{freelancer.name}</h2>
                  <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-md font-mono text-xs font-bold">
                    {freelancer.freelancerId}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-black rounded-full uppercase ${
                      freelancer.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                        : 'bg-red-500/20 text-red-300 border border-red-400/30'
                    }`}
                  >
                    {freelancer.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                  <span className="font-bold text-indigo-300">{freelancer.mainCategory}</span>
                  <span>•</span>
                  <span>{freelancer.subCategory}</span>
                  <span>•</span>
                  <span>{freelancer.experienceYears} Yrs Experience</span>
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{freelancer.mobile}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{freelancer.city || 'Jaipur'}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Joined {freelancer.joiningDate}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap md:flex-col gap-2 w-full md:w-auto">
              <button
                onClick={() => onEdit(freelancer)}
                className="flex-1 md:flex-none px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 transition flex items-center justify-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Edit Profile</span>
              </button>

              {onAssignShootClick && (
                <button
                  onClick={() => onAssignShootClick(freelancer.id)}
                  className="flex-1 md:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Assign to Shoot</span>
                </button>
              )}

              {onAddPaymentClick && (
                <button
                  onClick={() => onAddPaymentClick(freelancer.id)}
                  className="flex-1 md:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Record Payment</span>
                </button>
              )}

              {onDeleteFreelancer && (
                <button
                  onClick={() => setShowConfirmDelete(true)}
                  className="flex-1 md:flex-none px-4 py-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white text-xs font-bold rounded-xl border border-red-500/30 transition shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Profile</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-slate-800">
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Shoots</span>
              <span className="text-lg font-black text-white">{totalShoots}</span>
            </div>

            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Upcoming</span>
              <span className="text-lg font-black text-indigo-400">{upcomingShoots}</span>
            </div>

            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Completed</span>
              <span className="text-lg font-black text-emerald-400">{completedShoots}</span>
            </div>

            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Earnings</span>
              <span className="text-lg font-black text-white font-mono">₹{totalEarnings.toLocaleString('en-IN')}</span>
            </div>

            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Paid Amount</span>
              <span className="text-lg font-black text-emerald-400 font-mono">₹{paidAmount.toLocaleString('en-IN')}</span>
            </div>

            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Pending Amount</span>
              <span className="text-lg font-black text-red-400 font-mono">₹{pendingAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Profile Navigation Tabs */}
        <div className="bg-slate-100 px-6 border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'shoots', label: `🎬 Assigned Shoots (${totalShoots})` },
            { id: 'overview', label: 'Rate Card & Profile' },
            { id: 'payments', label: `Payments (${myPayments.length})` },
            { id: 'attendance', label: `Attendance (${myAttendance.length})` },
            { id: 'data', label: `Data Received (${myDataReceived.length})` },
            { id: 'documents', label: `Documents (${freelancer.documents?.length || 0})` },
            { id: 'notes', label: `Notes & Logs (${myLogs.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveProfileTab(tab.id as any)}
              className={`py-3 px-3 text-xs font-bold border-b-2 transition whitespace-nowrap ${
                activeProfileTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Content Body */}
        <div className="p-6 max-h-[55vh] overflow-y-auto">
          {/* TAB 1: OVERVIEW */}
          {activeProfileTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rate Card & Charges */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <DollarSign className="w-4 h-4 text-indigo-600" />
                  <span>Rate Card & Daily Charges</span>
                </h3>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Full Event</span>
                    <span className="font-extrabold text-indigo-700 text-sm font-mono">₹{freelancer.perDayCharges.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Small Event</span>
                    <span className="font-extrabold text-slate-800 font-mono">₹{freelancer.halfDayCharges.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Full Day Event</span>
                    <span className="font-extrabold text-slate-800 font-mono">₹{freelancer.eventCharges.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Travel Charges</span>
                    <span className="font-extrabold text-slate-800 font-mono">₹{freelancer.travelCharges.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {freelancer.notes && (
                  <p className="text-xs text-slate-600 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                    <strong>Rate Terms:</strong> {freelancer.notes}
                  </p>
                )}
              </div>

              {/* Equipment & Gear Specs */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <span>Gear & Camera Equipment</span>
                </h3>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Camera Bodies:</span>
                    <p className="font-semibold text-slate-800">{freelancer.cameraDetails || 'Not specified'}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Lens Kit:</span>
                    <p className="font-semibold text-slate-800">{freelancer.lensDetails || 'Not specified'}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Lighting / Gimbal / Audio:</span>
                    <p className="font-semibold text-slate-800">{freelancer.otherEquipment || 'Not specified'}</p>
                  </div>

                  {freelancer.equipmentAvailable && (
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Complete Equipment Brief:</span>
                      <p className="text-slate-700">{freelancer.equipmentAvailable}</p>
                    </div>
                  )}

                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Key Skills:</span>
                    <div className="flex flex-wrap gap-1">
                      {freelancer.skills.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-[11px] font-semibold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank & Payment Information */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 md:col-span-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <span>Bank Account & Settlement Details</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Preferred Mode</span>
                    <span className="font-bold text-slate-900">{freelancer.paymentMethod}</span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">UPI ID</span>
                    <span className="font-mono font-bold text-indigo-700">{freelancer.upiId || 'N/A'}</span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Bank Name</span>
                    <span className="font-bold text-slate-800">{freelancer.bankName || 'N/A'}</span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">A/C Holder</span>
                    <span className="font-bold text-slate-800">{freelancer.accountHolderName || freelancer.name}</span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Account Number</span>
                    <span className="font-mono font-bold text-slate-900">{freelancer.accountNumber || 'N/A'}</span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">IFSC Code</span>
                    <span className="font-mono font-bold text-slate-900">{freelancer.ifsc || 'N/A'}</span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 col-span-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Emergency Contact</span>
                    <span className="font-bold text-slate-800">{freelancer.emergencyContact || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ASSIGNED SHOOTS */}
          {activeProfileTab === 'shoots' && (
            <div className="space-y-4">
              {/* Filter Notice Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-4 rounded-xl text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-indigo-500/30 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600/30 border border-indigo-400/40 text-indigo-300 rounded-xl flex items-center justify-center font-bold">
                    <Layers className="w-5 h-5 text-indigo-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-white">{freelancer.name}'s Assigned Shoots</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 rounded-full font-bold">
                        {freelancer.subCategory}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Showing strictly the shoots assigned to <strong className="text-amber-300">{freelancer.name}</strong> ({freelancer.freelancerId})
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-extrabold px-3 py-1 bg-indigo-600 text-white rounded-lg shadow-2xs">
                    {totalShoots} {totalShoots === 1 ? 'Shoot' : 'Shoots'} Assigned
                  </span>
                  {onAssignShootClick && (
                    <button
                      onClick={() => {
                        onClose();
                        onAssignShootClick(freelancer.id);
                      }}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-lg transition flex items-center gap-1 shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Assign New Shoot</span>
                    </button>
                  )}
                </div>
              </div>

              {myAssignments.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <Film className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-600 font-extrabold">No shoots assigned to {freelancer.name} yet.</p>
                  <p className="text-[11px] text-slate-400 mt-1">Click "+ Assign New Shoot" above to allocate upcoming wedding events.</p>
                </div>
              ) : (
                myAssignments.map((assignment) => {
                  const waMessage = `Hi ${freelancer.name},\nHere are your shoot assignment details:\n*Project:* ${assignment.projectName}\n*Event:* ${assignment.eventName}\n*Role:* ${assignment.role}\n*Date:* ${assignment.shootDate} (${assignment.startTime} - ${assignment.endTime})\n*Venue:* ${assignment.venue}, ${assignment.shootLocation}\n*Agreed Pay:* ₹${assignment.totalAgreedAmount.toLocaleString('en-IN')}\n*Advance:* ₹${assignment.advancePaid.toLocaleString('en-IN')}\n*Pending:* ₹${assignment.pendingAmount.toLocaleString('en-IN')}`;
                  const waUrl = `https://wa.me/${(freelancer.whatsapp || freelancer.mobile || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(waMessage)}`;

                  return (
                    <div
                      key={assignment.id}
                      className="p-4.5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition space-y-3"
                    >
                      {/* Top Row: Project & Status */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-sm text-slate-900">{assignment.projectName}</h4>
                            <span
                              className={`px-2.5 py-0.5 text-[10px] font-black rounded-full uppercase tracking-wider ${
                                assignment.assignmentStatus === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : assignment.assignmentStatus === 'confirmed'
                                  ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                  : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {assignment.assignmentStatus}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-indigo-600 mt-0.5">
                            Role: <span className="text-slate-800">{assignment.role}</span>
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          <p className="text-sm font-black text-indigo-700 font-mono">
                            ₹{assignment.totalAgreedAmount.toLocaleString('en-IN')}
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Paid: <span className="text-emerald-600 font-bold font-mono">₹{assignment.advancePaid.toLocaleString('en-IN')}</span> | 
                            Pending: <span className="text-red-600 font-bold font-mono">₹{assignment.pendingAmount.toLocaleString('en-IN')}</span>
                          </p>
                        </div>
                      </div>

                      {/* Middle Grid: Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                          <span><strong>Date:</strong> {assignment.shootDate}</span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                          <span><strong>Time:</strong> {assignment.startTime} - {assignment.endTime}</span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-700 col-span-1 sm:col-span-2">
                          <MapPin className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                          <span><strong>Venue:</strong> {assignment.venue}, {assignment.shootLocation}</span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-700 col-span-1 sm:col-span-2">
                          <Film className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                          <span><strong>Event Coverage:</strong> {assignment.eventName}</span>
                        </div>
                      </div>

                      {/* Notes / Special Instructions */}
                      {assignment.notes && (
                        <p className="text-xs text-slate-600 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200">
                          <strong>Note:</strong> {assignment.notes}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="pt-1 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-slate-400 font-mono font-bold">
                          Shoot Ref: {assignment.id}
                        </span>

                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-2xs"
                        >
                          <span>Share Shoot Info on WhatsApp</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 3: PAYMENTS */}
          {activeProfileTab === 'payments' && (
            <div className="space-y-3">
              {myPayments.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <p className="text-xs text-slate-500 font-medium">No payment transactions recorded for this freelancer.</p>
                </div>
              ) : (
                myPayments.map((pay) => (
                  <div key={pay.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{pay.projectName || 'General Shoot Payment'}</span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded font-mono">
                          {pay.paymentMethod}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Date: {pay.paymentDate} {pay.transactionId && `• Txn Ref: ${pay.transactionId}`}
                      </p>
                      {pay.notes && <p className="text-xs text-slate-600 italic mt-0.5">"{pay.notes}"</p>}
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-emerald-600 font-mono">+₹{pay.amountPaid.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: ATTENDANCE */}
          {activeProfileTab === 'attendance' && (
            <div className="space-y-3">
              {myAttendance.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <p className="text-xs text-slate-500 font-medium">No attendance logs found for this freelancer.</p>
                </div>
              ) : (
                myAttendance.map((att) => (
                  <div key={att.id} className="p-3 bg-white rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{att.shootDate}</span>
                      <span className="text-slate-500 ml-2">• {att.projectName || 'Studio Duty'}</span>
                      {att.checkInTime && (
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          Check-in: {att.checkInTime} {att.checkOutTime && `| Check-out: ${att.checkOutTime}`}
                        </p>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-black rounded uppercase ${
                      att.attendanceStatus === 'present' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {att.attendanceStatus}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 5: DATA RECEIVED */}
          {activeProfileTab === 'data' && (
            <div className="space-y-3">
              {myDataReceived.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <p className="text-xs text-slate-500 font-medium">No data delivery records for this freelancer.</p>
                </div>
              ) : (
                myDataReceived.map((data) => (
                  <div key={data.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-slate-900">{data.projectName}</span>
                      <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded">
                        {data.dataStatus.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">
                      <strong>Media Type:</strong> {data.dataType} • <strong>Received Date:</strong> {data.dataReceivedDate} • <strong>Size:</strong> {data.approxDataSizeGB} GB ({data.numberOfCardsOrDrives} Drives/Cards)
                    </p>

                    {data.cloudDriveLink && (
                      <a
                        href={data.cloudDriveLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Cloud Storage Link</span>
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 6: DOCUMENTS */}
          {activeProfileTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Attached ID Proofs & Agreements</h3>
                <button
                  onClick={() => setShowAddDocForm(!showAddDocForm)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload Document</span>
                </button>
              </div>

              {showAddDocForm && (
                <form onSubmit={handleAddDocumentSubmit} className="bg-indigo-50/60 p-3.5 rounded-xl border border-indigo-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">Document Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Aadhaar Card / Agreement"
                        value={docTitle}
                        onChange={(e) => setDocTitle(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">Document Type</label>
                      <select
                        value={docType}
                        onChange={(e) => setDocType(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white font-bold"
                      >
                        <option value="id_proof">ID Proof (Aadhaar/PAN)</option>
                        <option value="agreement">Signed Agreement</option>
                        <option value="bank_details">Bank Passbook / Cheque</option>
                        <option value="other">Other Document</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">Document URL / Link</label>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={docUrl}
                        onChange={(e) => setDocUrl(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddDocForm(false)}
                      className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1 bg-indigo-600 text-white text-xs font-bold rounded"
                    >
                      Save Document
                    </button>
                  </div>
                </form>
              )}

              {(!freelancer.documents || freelancer.documents.length === 0) ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <p className="text-xs text-slate-500 font-medium">No documents uploaded for this freelancer.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {freelancer.documents.map((doc) => (
                    <div key={doc.id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        <div>
                          <p className="font-bold text-xs text-slate-900">{doc.title}</p>
                          <p className="text-[10px] text-slate-500">Uploaded {doc.uploadDate}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded uppercase">
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: NOTES & ACTIVITY LOGS */}
          {activeProfileTab === 'notes' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Activity & Assignment History</h3>

              {myLogs.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <p className="text-xs text-slate-500 font-medium">No recent logs recorded.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {myLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-1">
                        <span>{log.timestamp}</span>
                        <span>By {log.performedBy}</span>
                      </div>
                      <p className="font-medium text-slate-800">{log.action}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-between items-center">
          <div className="text-xs text-slate-500 font-medium">
            Category: <strong className="text-slate-800">{freelancer.mainCategory} ({freelancer.subCategory})</strong>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-xs"
          >
            Close
          </button>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={showConfirmDelete}
        title="Delete Freelancer Profile"
        itemTitle={freelancer.name}
        message={`Are you sure you want to permanently delete freelancer profile "${freelancer.name}" (${freelancer.freelancerId})?`}
        onConfirm={() => {
          if (onDeleteFreelancer) {
            onDeleteFreelancer(freelancer.id);
          }
          setShowConfirmDelete(false);
          onClose();
        }}
        onCancel={() => setShowConfirmDelete(false)}
      />
    </div>
  );
};
