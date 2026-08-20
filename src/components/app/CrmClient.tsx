'use client';

import dynamic from 'next/dynamic';

const CrmApplication = dynamic(() => import('./CrmApplication'), {
  ssr: false,
  loading: () => (
    <main className="grid min-h-screen place-items-center bg-slate-100 text-slate-600" aria-live="polite">
      <div className="flex items-center gap-3 text-sm font-semibold">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        Loading studio workspace…
      </div>
    </main>
  ),
});

export function CrmClient() {
  return <CrmApplication />;
}
