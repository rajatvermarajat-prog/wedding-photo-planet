import { Clock, Plus, Trash2, Wallet, X } from 'lucide-react';
import { AttendanceRecord } from '@/types';
import { MemberSalaryRecord, SalaryInstallment } from './dashboardTypes';
interface Props { member: MemberSalaryRecord | null; close: () => void; editPaidAmount: number | ''; setEditPaidAmount: (value: number | '') => void; selectedSalaryMonth: string; setSelectedSalaryMonth: (value: string) => void; attendanceLogs: AttendanceRecord[]; presentDays: number; halfDays: number; absentDays: number; attendanceEarnedPay: number; estimatedDailyRate: number; pendingAttendanceBalance: number; pendingBaseBalance: number; installments: SalaryInstallment[]; setInstallments: (value: SalaryInstallment[]) => void; addInstallment: () => void; removeInstallment: (id: string) => void; changeInstallment: (id: string, field: keyof SalaryInstallment, value: unknown) => void; save: () => void | Promise<void>; }
export function SalaryPaymentModal({ member: editingSalaryMember, close, editPaidAmount, setEditPaidAmount, selectedSalaryMonth, setSelectedSalaryMonth, attendanceLogs: memberAttendanceLogs, presentDays, halfDays, absentDays, attendanceEarnedPay, estimatedDailyRate, pendingAttendanceBalance, pendingBaseBalance, installments: editInstallments, setInstallments: setEditInstallments, addInstallment: handleAddInstallment, removeInstallment: handleRemoveInstallment, changeInstallment: handleInstallmentChange, save: handleSaveMemberSalary }: Props) {
  const setEditingSalaryMember = (_value: null) => close();
  if (!editingSalaryMember) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-5 max-w-md w-full border border-slate-200 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <Wallet className="w-4 h-4 text-rose-700" />
            <span>Update Salary Payment ({editingSalaryMember.memberName})</span></h4>
          <button
            type="button"
            onClick={() => setEditingSalaryMember(null)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3.5 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <p className="font-bold text-slate-800 text-xs">
                  Role: <span className="font-semibold text-slate-600">{editingSalaryMember.role}</span></p>
                <p className="font-bold text-slate-800 text-xs">
                  Monthly Base Salary: <span className="font-mono text-rose-800 font-black">₹{editingSalaryMember.monthlySalary.toLocaleString('en-IN')}</span></p>
              </div>
              <div className="text-right bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-xs font-black text-slate-500 block uppercase tracking-wider">
                  Current Pending Balance</span>
                <span className="font-mono text-base font-black text-red-600">
                  ₹{pendingAttendanceBalance.toLocaleString('en-IN')}</span>
                <span className="text-xs text-slate-400 block font-medium">
                  (Base: ₹{pendingBaseBalance.toLocaleString('en-IN')})</span>
              </div>
            </div>
            <div className="bg-rose-50/90 rounded-lg p-2.5 border border-rose-100 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-rose-200/60 pb-1.5">
                <span className="font-extrabold text-rose-950 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-rose-700" />
                  <span>Live Attendance Tracked Pay</span></span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setSelectedSalaryMonth('2026-07')}
                    className={`px-2 py-0.5 rounded text-xs font-extrabold transition cursor-pointer ${
                      selectedSalaryMonth === '2026-07'
                        ? 'bg-rose-700 text-white shadow-2xs'
                        : 'bg-white text-rose-950 border border-rose-200 hover:bg-rose-50'
                    }`}>
                    July 2026</button>
                  <button
                    type="button"
                    onClick={() => setSelectedSalaryMonth('2026-08')}
                    className={`px-2 py-0.5 rounded text-xs font-extrabold transition cursor-pointer ${
                      selectedSalaryMonth === '2026-08'
                        ? 'bg-rose-700 text-white shadow-2xs'
                        : 'bg-white text-rose-950 border border-rose-200 hover:bg-rose-50'
                    }`}>
                    August 2026</button>
                  <span className="text-xs font-black text-rose-900 bg-white px-2 py-0.5 rounded border border-rose-200 shadow-2xs ml-0.5">
                    {memberAttendanceLogs.length} Days (1 Month)</span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                <div className="bg-white p-1.5 rounded-lg border border-emerald-200 shadow-2xs">
                  <span className="text-emerald-700 font-extrabold block text-xs uppercase">Present</span>
                  <span className="font-black text-slate-900 text-xs">{presentDays} Days</span>
                </div>
                <div className="bg-white p-1.5 rounded-lg border border-amber-200 shadow-2xs">
                  <span className="text-amber-700 font-extrabold block text-xs uppercase">Half Day</span>
                  <span className="font-black text-slate-900 text-xs">{halfDays} Days</span>
                </div>
                <div className="bg-white p-1.5 rounded-lg border border-red-200 shadow-2xs">
                  <span className="text-red-700 font-extrabold block text-xs uppercase">Absent</span>
                  <span className="font-black text-slate-900 text-xs">{absentDays} Days</span>
                </div>
                <div className="bg-white p-1.5 rounded-lg border border-rose-200 shadow-2xs">
                  <span className="text-rose-800 font-extrabold block text-xs uppercase">Daily Rate</span>
                  <span className="font-black font-mono text-slate-900 text-xs">₹{estimatedDailyRate.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-rose-200/60 text-xs">
                <div>
                  <span className="text-slate-600 font-bold">Attendance Earned: </span>
                  <span className="font-mono font-black text-emerald-700 text-xs bg-white px-1.5 py-0.5 rounded border border-emerald-200">
                    ₹{attendanceEarnedPay.toLocaleString('en-IN')}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditPaidAmount(attendanceEarnedPay)}
                  className="px-2 py-1 bg-rose-700 hover:bg-rose-800 text-white font-extrabold text-xs rounded transition cursor-pointer shadow-2xs flex items-center justify-center gap-1"
                  title="Set Paid Amount equal to Attendance Earned Salary">
                  ⚡ Pay Attendance Salary (₹{attendanceEarnedPay.toLocaleString('en-IN')})</button>
              </div>
            </div>
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Total Amount Paid (₹)</label>
            <input
              type="number"
              value={editPaidAmount}
              onChange={(e) => setEditPaidAmount(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Enter Amount Paid (₹)"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <button
                type="button"
                onClick={() => setEditPaidAmount(attendanceEarnedPay)}
                className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-xs hover:bg-emerald-200 cursor-pointer">
                Pay Attendance (₹{attendanceEarnedPay.toLocaleString('en-IN')})</button>
              <button
                type="button"
                onClick={() => setEditPaidAmount(editingSalaryMember.monthlySalary)}
                className="px-2 py-0.5 bg-rose-100 text-rose-900 font-bold rounded text-xs hover:bg-rose-200 cursor-pointer">
                Mark Full Base Paid (₹{editingSalaryMember.monthlySalary.toLocaleString('en-IN')})</button>
              <button
                type="button"
                onClick={() => {
                  setEditPaidAmount(0);
                  setEditInstallments([]);
                }}
                className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded text-xs hover:bg-slate-200 cursor-pointer">
                Reset (₹0)</button>
            </div>
          </div>
          <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-rose-950 text-xs flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-rose-700" />
                <span>Pay in Parts / Installments</span></label>
              <button
                type="button"
                onClick={handleAddInstallment}
                className="px-2.5 py-1 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-lg transition flex items-center gap-1 cursor-pointer shadow-2xs">
                <Plus className="w-3 h-3 stroke-[3]" />
                <span>+ Add Payment Part</span></button>
            </div>
            {editInstallments.length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                If paying in 2-3 parts/installments, click "+ Add Payment Part" above.</p>
            ) : (
              <div className="space-y-2">
                {editInstallments.map((inst, index) => (
                  <div key={inst.id} className="bg-white p-2.5 rounded-lg border border-rose-200 space-y-2 text-xs shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                      <span className="font-black text-rose-950 text-xs uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                        Part #{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveInstallment(inst.id)}
                        className="text-slate-400 hover:text-red-600 transition p-0.5 cursor-pointer"
                        title="Remove this installment">
                        <Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-bold text-slate-600 block mb-0.5">Amount (₹)</label>
                        <input
                          type="number"
                          value={inst.amount === 0 ? '' : inst.amount}
                          onChange={(e) => handleInstallmentChange(inst.id, 'amount', e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="e.g. 20000"
                          className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 font-bold text-slate-900 text-xs focus:ring-1 focus:ring-rose-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-600 block mb-0.5">Payment Date</label>
                        <input
                          type="date"
                          value={inst.date}
                          onChange={(e) => handleInstallmentChange(inst.id, 'date', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 font-medium text-slate-900 text-xs focus:ring-1 focus:ring-rose-500 outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-bold text-slate-600 block mb-0.5">Payment Mode</label>
                        <select
                          value={inst.mode}
                          onChange={(e) => handleInstallmentChange(inst.id, 'mode', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 font-bold text-slate-800 text-xs outline-none">
                          <option value="GPay">GPay / Google Pay</option>
                          <option value="PhonePe">PhonePe</option>
                          <option value="Paytm">Paytm</option>
                          <option value="UPI">UPI / QR Code</option>
                          <option value="Cash">Cash Handover</option>
                          <option value="Bank Transfer">Bank Transfer (NEFT)</option>
                          <option value="Cheque">Cheque</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-600 block mb-0.5">Remarks / Notes</label>
                        <input
                          type="text"
                          value={inst.notes || ''}
                          onChange={(e) => handleInstallmentChange(inst.id, 'notes', e.target.value)}
                          placeholder="e.g. Part 1 advance"
                          className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 font-medium text-slate-900 text-xs focus:ring-1 focus:ring-rose-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="text-xs font-bold text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200 flex items-center justify-between">
                  <span>Total of Installments:</span>
                  <span className="font-black font-mono text-xs text-emerald-900">
                    ₹{editInstallments.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setEditingSalaryMember(null)}
            className="px-3 py-1.5 bg-slate-100 text-slate-700 font-bold rounded-lg text-xs hover:bg-slate-200 cursor-pointer">
            Cancel</button>
          <button
            type="button"
            onClick={handleSaveMemberSalary}
            className="px-4 py-1.5 bg-rose-700 text-white font-bold rounded-lg text-xs hover:bg-rose-800 shadow-xs cursor-pointer">
            Save Payment Record</button>
        </div>
      </div>
    </div>
  );
}
