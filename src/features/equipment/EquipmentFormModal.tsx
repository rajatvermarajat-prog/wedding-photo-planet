import { Camera, X } from 'lucide-react';
import { EQUIPMENT_CATEGORIES, EquipmentItem } from './equipmentData';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (item: Omit<EquipmentItem, 'id'>) => void;
}

export function EquipmentFormModal({ open, onClose, onSubmit }: Props) {
  if (!open) return null;
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onSubmit({
      name: String(data.get('name') || '').trim(),
      category: String(data.get('category')) as EquipmentItem['category'],
      status: String(data.get('status')) as EquipmentItem['status'],
      serialNumber: String(data.get('serial') || '').trim() || undefined,
      conditionNote: String(data.get('note') || '').trim() || undefined,
    });
  };
  const field = 'w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 font-medium text-slate-900 outline-none focus:ring-2 focus:ring-rose-500';
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
    <div className="w-full max-w-md space-y-4 rounded-3xl border border-[#dfd9d2] bg-white p-6 shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3"><h4 className="flex items-center gap-2 text-base font-black text-slate-900"><Camera className="size-5 text-rose-700" />Add New Studio Equipment</h4><button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="size-5" /></button></div>
      <form onSubmit={submit} className="space-y-3 text-xs">
        <label className="block font-bold text-slate-700">Equipment Name *<input name="name" required placeholder="e.g. Sony FX30 / Aputure 600d Pro" className={`${field} mt-1`} /></label>
        <div className="grid grid-cols-2 gap-2">
          <label className="font-bold text-slate-700">Category<select name="category" className={`${field} mt-1`}>{EQUIPMENT_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></label>
          <label className="font-bold text-slate-700">Status<select name="status" className={`${field} mt-1`}><option value="available">Available</option><option value="in_use">In Use / On Shoot</option><option value="maintenance">Maintenance</option></select></label>
        </div>
        <label className="block font-bold text-slate-700">Serial Number<input name="serial" placeholder="#SN-882103" className={`${field} mt-1`} /></label>
        <label className="block font-bold text-slate-700">Condition Notes<textarea name="note" placeholder="Includes batteries, charger, condition…" className={`${field} mt-1 min-h-20`} /></label>
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-3"><button type="button" onClick={onClose} className="rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-700">Cancel</button><button type="submit" className="rounded-xl bg-[#8f3655] px-5 py-2 font-bold text-white hover:bg-[#762944]">Save Equipment</button></div>
      </form>
    </div>
  </div>;
}
