import React from 'react';
import { AlertTriangle, ShieldCheck, Trash2, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  itemTitle?: string;
  projectTitle?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title = 'Delete Item',
  message,
  itemTitle,
  projectTitle,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const displayTitle = itemTitle || projectTitle || '';
  const isDelete = confirmLabel.toLowerCase() === 'delete';
  const ConfirmIcon = isDelete ? Trash2 : ShieldCheck;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 bg-red-50 border-b border-red-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
              <ConfirmIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-900 uppercase tracking-tight">
                {title}
              </h3>
              <p className="text-[11px] text-red-600 font-medium">
                Confirmation Required
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-red-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-slate-700 text-xs">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold">Warning</p>
              <p className="text-[11px]">
                This action is permanent and cannot be undone.
              </p>
            </div>
          </div>

          {message ? (
            <p className="text-sm text-slate-800 font-medium leading-relaxed">{message}</p>
          ) : (
            <p className="text-sm text-slate-800 font-medium leading-relaxed">
              Are you sure you want to delete {displayTitle ? <strong className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{displayTitle}</strong> : 'this item'}?
            </p>
          )}

          <p className="text-slate-500 text-[11px]">
            To confirm, please click <strong className="text-red-600">{confirmLabel}</strong> button below.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-xs transition flex items-center gap-1.5 cursor-pointer font-black"
          >
            <ConfirmIcon className="w-3.5 h-3.5" />
            <span>{confirmLabel}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

