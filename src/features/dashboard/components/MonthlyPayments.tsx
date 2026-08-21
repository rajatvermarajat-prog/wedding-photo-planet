import { CreditCard, Plus } from 'lucide-react';
export interface ClientPaymentLog { id: string; clientTitle: string; amount: number; date: string; }
interface Props { payments: ClientPaymentLog[]; totalReceived: number; totalRevenue: number; fromDate: string; toDate: string; formatDate: (value: string) => string; onRecordPayment: () => void; }
export function MonthlyPayments({ payments: filteredClientPaymentLogs, totalReceived: totalMonthlyPaymentsReceived, totalRevenue, fromDate: finFromDate, toDate: finToDate, formatDate: formatDateDots, onRecordPayment }: Props) {
  return (
  <section className="space-y-4 rounded-2xl border border-[#dfd9d2] bg-white p-4 shadow-[0_10px_30px_rgba(48,44,46,.07)] sm:p-5">
    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
          <CreditCard className="w-4 h-4" />
        </div>
        <div>
          <h3 className="flex flex-wrap items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-900">
            <span>Monthly Payment Received</span>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
              {formatDateDots(finFromDate)} - {formatDateDots(finToDate)}
            </span>
          </h3>
          <p className="text-xs text-slate-500 font-medium">Client Advance & Installments Ledger</p>
        </div>
      </div>

      <button
        onClick={onRecordPayment}
        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition shadow-2xs flex items-center gap-1 cursor-pointer"
      >
        <Plus className="w-3 h-3" /> Record Payment
      </button>
    </div>

    {/* Payment Summary Stats */}
    <div className="grid grid-cols-3 gap-1 text-center text-xs bg-[#faf8f6] p-3 rounded-xl border border-[#e6ded8]">
      <div className="border-r border-slate-200 pr-1">
        <span className="text-xs font-bold text-slate-400 uppercase block">Total Received</span>
        <span className="font-black text-emerald-600 text-xs">₹{totalMonthlyPaymentsReceived.toLocaleString('en-IN')}</span>
      </div>
      <div className="border-r border-slate-200 pr-1">
        <span className="text-xs font-bold text-slate-400 uppercase block">Logged Items</span>
        <span className="font-black text-slate-900 text-xs">{filteredClientPaymentLogs.length} Records</span>
      </div>
      <div>
        <span className="text-xs font-bold text-slate-400 uppercase block">Total Bookings</span>
        <span className="font-black text-slate-900 text-xs">₹{totalRevenue.toLocaleString('en-IN')}</span>
      </div>
    </div>

    {/* Recent Collections Table / List */}
    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
      {filteredClientPaymentLogs.length === 0 ? (
        <p className="text-xs text-slate-400 py-4 text-center italic">No client payments recorded for selected date range ({formatDateDots(finFromDate)} to {formatDateDots(finToDate)}).</p>
      ) : (
        filteredClientPaymentLogs.map((pay) => (
          <div key={pay.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs gap-2 hover:border-emerald-200 transition">
            <div className="min-w-0">
              <div className="font-extrabold text-slate-900 truncate text-xs">{pay.clientTitle}</div>
              <div className="text-xs font-mono font-bold text-slate-500 mt-0.5">{pay.date}</div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="font-mono font-black text-emerald-600 text-xs">
                + ₹{pay.amount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  </section>

  );
}
