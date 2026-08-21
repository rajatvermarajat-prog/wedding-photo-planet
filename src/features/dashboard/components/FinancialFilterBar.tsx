import { Calendar } from 'lucide-react';
interface Props { fromDate: string; toDate: string; setFromDate: (value: string) => void; setToDate: (value: string) => void; }
export function FinancialFilterBar({ fromDate: finFromDate, toDate: finToDate, setFromDate: setFinFromDate, setToDate: setFinToDate }: Props) {
  return (
  <div className="flex flex-col items-stretch justify-between gap-4 rounded-2xl border border-[#dfd9d2] bg-white p-4 shadow-[0_10px_30px_rgba(48,44,46,.07)] sm:p-5 xl:flex-row xl:items-center">
    <div className="flex items-center gap-2.5">
      <div className="p-2.5 bg-rose-100 text-rose-900 rounded-xl">
        <Calendar className="w-5 h-5" />
      </div>
      <div>
        <div className="text-sm font-black uppercase tracking-wide text-slate-900">
          Monthly Financial & Expense Ledger
        </div>
        <p className="text-xs text-slate-500 font-medium">Select a month to see total client payments received vs office expenses & staff salaries</p>
      </div>
    </div>

    <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
      {/* Quick Filter Month Preset Chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => {
            setFinFromDate('2026-08-01');
            setFinToDate('2026-08-31');
          }}
          className={`px-2.5 py-1 rounded-lg font-extrabold text-xs transition cursor-pointer ${
            finFromDate === '2026-08-01' && finToDate === '2026-08-31'
              ? 'bg-rose-700 text-white shadow-xs'
              : 'bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200'
          }`}
        >
          📅 This Month (Aug 2026)
        </button>
        <button
          type="button"
          onClick={() => {
            setFinFromDate('2026-07-01');
            setFinToDate('2026-07-31');
          }}
          className={`px-2.5 py-1 rounded-lg font-extrabold text-xs transition cursor-pointer ${
            finFromDate === '2026-07-01' && finToDate === '2026-07-31'
              ? 'bg-rose-700 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
          }`}
        >
          📅 July 2026
        </button>
        <button
          type="button"
          onClick={() => {
            setFinFromDate('2026-06-01');
            setFinToDate('2026-06-30');
          }}
          className={`px-2.5 py-1 rounded-lg font-extrabold text-xs transition cursor-pointer ${
            finFromDate === '2026-06-01' && finToDate === '2026-06-30'
              ? 'bg-rose-700 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
          }`}
        >
          📅 June 2026
        </button>
        <button
          type="button"
          onClick={() => {
            setFinFromDate('');
            setFinToDate('');
          }}
          className={`px-2.5 py-1 rounded-lg font-extrabold text-xs transition cursor-pointer ${
            !finFromDate && !finToDate
              ? 'bg-rose-700 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
          }`}
        >
          🌐 All Time
        </button>
      </div>

      {/* Custom Date Range Picker */}
      <div className="grid w-full grid-cols-[auto_1fr] items-center gap-2 rounded-xl border border-[#e6ded8] bg-[#faf8f6] p-2.5 sm:grid-cols-[auto_1fr_auto_1fr_auto] lg:w-auto">
        <span className="text-xs font-extrabold text-slate-500 uppercase">From:</span>
        <input
          type="date"
          value={finFromDate}
          onChange={(e) => setFinFromDate(e.target.value)}
          className="min-h-9 min-w-0 rounded-lg border border-slate-300 bg-white px-2 text-xs font-bold text-slate-800 shadow-2xs focus:border-[#8d5265] focus:outline-none focus:ring-2 focus:ring-[#8d5265]/15"
        />
        <span className="text-xs font-extrabold text-slate-500 uppercase">To:</span>
        <input
          type="date"
          value={finToDate}
          onChange={(e) => setFinToDate(e.target.value)}
          className="min-h-9 min-w-0 rounded-lg border border-slate-300 bg-white px-2 text-xs font-bold text-slate-800 shadow-2xs focus:border-[#8d5265] focus:outline-none focus:ring-2 focus:ring-[#8d5265]/15"
        />
        {(finFromDate || finToDate) && (
          <button
            type="button"
            onClick={() => {
              setFinFromDate('');
              setFinToDate('');
            }}
            className="text-xs bg-slate-200 hover:bg-red-50 text-slate-700 hover:text-red-600 font-extrabold px-1.5 py-0.5 rounded cursor-pointer ml-1"
            title="Show All Time"
          >
            ✕ Clear
          </button>
        )}
      </div>
    </div>
  </div>
  );
}
