import { Pencil, Wallet } from 'lucide-react';
import { MemberSalaryRecord } from './dashboardTypes';
interface Props { records: MemberSalaryRecord[]; totalMonthlyPayroll: number; totalPaidPayroll: number; totalPendingPayroll: number; onTeam: () => void; onEdit: (record: MemberSalaryRecord) => void; }
export function MonthlyStaffSalary({ records: salaryRecords, totalMonthlyPayroll, totalPaidPayroll, totalPendingPayroll, onTeam, onEdit: handleOpenEditModal }: Props) {
  return (
  <div className="lg:col-span-1">
    <section className="flex h-full min-h-[460px] flex-col gap-4 rounded-2xl border border-[#dfd9d2] bg-white p-4 shadow-[0_10px_30px_rgba(48,44,46,.07)] sm:p-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wide text-slate-900">
              Monthly Staff Salary Status
            </h3>
            <p className="text-xs text-slate-500 font-medium">Payroll Tracker & Pending Dues</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onTeam}
            className="text-xs font-bold text-rose-700 hover:underline uppercase hidden sm:inline"
          >
            Team Roster →
          </button>
        </div>
      </div>

      {/* Overall Payroll Summary Pills */}
      <div className="grid grid-cols-3 gap-1 text-center text-xs bg-[#faf8f6] p-3 rounded-xl border border-[#e6ded8] shrink-0">
        <div className="border-r border-slate-200 pr-1">
          <span className="text-xs font-bold text-slate-400 uppercase block">Total Base</span>
          <span className="font-black text-slate-900 text-xs">₹{totalMonthlyPayroll.toLocaleString('en-IN')}</span>
        </div>
        <div className="border-r border-slate-200 pr-1">
          <span className="text-xs font-bold text-emerald-600 uppercase block">Total Paid</span>
          <span className="font-black text-emerald-700 text-xs">₹{totalPaidPayroll.toLocaleString('en-IN')}</span>
        </div>
        <div>
          <span className="text-xs font-bold text-red-600 uppercase block">Pending Due</span>
          <span className="font-black text-red-700 text-xs">₹{totalPendingPayroll.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Individual Team Salary Rows */}
      <div className="space-y-2 flex-1 min-h-0 max-h-[500px] overflow-y-auto pr-1">
        {salaryRecords.map((m) => {
          const pending = Math.max(0, m.monthlySalary - m.paidAmount);
          const isFull = pending === 0;
          const isPartial = m.paidAmount > 0 && pending > 0;

          return (
            <div key={m.memberId} className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200 hover:border-rose-200 transition space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-slate-900 text-xs truncate">{m.memberName}</span>
                    <span className="text-xs text-slate-500 font-medium truncate">({m.role})</span>
                  </div>
                  <span className="text-xs text-slate-600 font-bold block">
                    Fixed Salary: <span className="font-mono text-slate-900 font-black">₹{m.monthlySalary.toLocaleString('en-IN')}</span>/mo
                  </span>
                </div>

                <span className={`px-2 py-0.5 rounded text-xs font-black uppercase shrink-0 ${
                  isFull
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : isPartial
                    ? 'bg-amber-100 text-amber-900 border border-amber-200'
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {isFull ? '✓ Paid' : isPartial ? 'Partially Paid' : 'Pending'}
                </span>
              </div>

              {/* Installments / Payment Parts Breakdown */}
              {m.installments && m.installments.length > 0 && (
                <div className="text-xs bg-rose-50/80 rounded-lg p-1.5 space-y-1 border border-rose-100">
                  <span className="font-extrabold text-rose-950 block text-xs uppercase tracking-wider">
                    Payment Parts ({m.installments.length} Installment{m.installments.length !== 1 ? 's' : ''}):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {m.installments.map((inst, idx) => (
                      <span key={inst.id || idx} className="bg-white border border-rose-200 text-rose-950 px-1.5 py-0.5 rounded font-bold text-xs shadow-2xs">
                        Part #{idx + 1}: <span className="font-mono text-emerald-700 font-extrabold">₹{(inst.amount || 0).toLocaleString('en-IN')}</span> ({inst.mode || 'GPay'})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-emerald-700">
                    Paid: ₹{m.paidAmount.toLocaleString('en-IN')}
                  </span>
                  <span className={`font-bold ${pending > 0 ? 'text-red-600 font-extrabold' : 'text-slate-400'}`}>
                    Due: ₹{pending.toLocaleString('en-IN')}
                  </span>
                </div>

                <button
                  onClick={() => handleOpenEditModal(m)}
                  className="px-2 py-0.5 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded text-xs transition shadow-2xs flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Pencil className="w-3 h-3" /> Pay / Edit
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  </div>
  );
}
