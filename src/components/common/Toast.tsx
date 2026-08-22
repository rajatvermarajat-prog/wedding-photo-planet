'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { CheckCircle2, RotateCcw, TriangleAlert, X } from 'lucide-react';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastOptions {
  variant?: 'success' | 'error';
  action?: ToastAction;
  durationMs?: number;
}

interface ToastItem {
  id: string;
  message: string;
  variant: 'success' | 'error';
  action?: ToastAction;
}

interface ToastContextValue {
  showToast: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/** Studio-wide toast notifications — replaces alert()-style feedback on save/delete actions. */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // A missing provider should never break the save/delete action that
    // triggered it — degrade to a silent no-op instead of throwing.
    return { showToast: () => {} };
  }
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const showToast = useCallback((message: string, options: ToastOptions = {}) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const variant = options.variant || 'success';
    setToasts((prev) => [...prev, { id, message, variant, action: options.action }]);
    // A toast with an action (e.g. Undo) waits for the user; a plain
    // confirmation dismisses itself.
    if (!options.action) {
      timers.current[id] = setTimeout(() => dismiss(id), options.durationMs ?? 3500);
    }
  }, [dismiss]);

  useEffect(() => {
    const nativeAlert = window.alert;
    window.alert = (message?: unknown) => showToast(String(message ?? ''), { durationMs: 5000 });
    return () => { window.alert = nativeAlert; };
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[calc(100vw-2rem)] max-w-[30rem] flex-col items-stretch gap-2 sm:right-6 sm:top-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200 ${
              t.variant === 'error'
                ? 'bg-red-950/95 border-red-800 text-red-50'
                : 'bg-slate-900/95 border-slate-700 text-white'
            }`}
          >
            <span className={`p-1.5 rounded-lg ${t.variant === 'error' ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-400'}`}>
              {t.variant === 'error' ? <TriangleAlert className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            </span>
            <span className="font-bold">{t.message}</span>
            {t.action && (
              <button
                onClick={() => {
                  t.action!.onClick();
                  dismiss(t.id);
                }}
                className="ml-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-black rounded-xl shadow transition cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> {t.action.label}
              </button>
            )}
            <button
              onClick={() => dismiss(t.id)}
              className="text-slate-400 hover:text-white font-bold p-1 cursor-pointer"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
