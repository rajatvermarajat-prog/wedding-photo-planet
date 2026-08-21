import { CreditCard, Plus } from 'lucide-react';
export interface ClientPaymentLog { id: string; clientTitle: string; amount: number; date: string; mode?: string; type?: string; receiptNumber?: string; }
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

    {/* Slim context line — full totals already live in the Monthly P&L snapshot above */}
    <p className="text-xs font-semibold text-slate-500">
      <span className="font-black text-emerald-600">{filteredClientPaymentLogs.length}</span> payment{filteredClientPaymentLogs.length === 1 ? '' : 's'} logged this period, totalling <span className="font-black text-emerald-600">₹{totalMonthlyPaymentsReceived.toLocaleString('en-IN')}</span> of <span className="font-bold text-slate-700">₹{totalRevenue.toLocaleString('en-IN')}</span> booked lifetime.
    </p>

    {/* Recent Collections Table / List */}
    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
      {filteredClientPaymentLogs.length === 0 ? (
        <p className="text-xs text-slate-400 py-4 text-center italic">No client payments recorded for selected date range ({formatDateDots(finFromDate)} to {formatDateDots(finToDate)}).</p>
      ) : (
        filteredClientPaymentLogs.map((pay) => (
          <div key={pay.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs gap-2 hover:border-emerald-200 transition">
            <div className="min-w-0">
              <div className="font-extrabold text-slate-900 truncate text-xs">{pay.clientTitle}</div>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <span className="text-xs font-mono font-bold text-slate-500">{pay.date}</span>
                {pay.type && <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 font-bold text-xs rounded">{pay.type}</span>}
                {pay.mode && <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold text-xs rounded">{pay.mode}</span>}
              </div>
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
