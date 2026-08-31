/** Placeholder for a dashboard panel whose data is still loading. */
export function PanelSkeleton({ rows = 3, title }: { rows?: number; title?: string }) {
  return (
    <section
      className="rounded-2xl border border-[#e6ded8] bg-white p-4 shadow-[0_10px_30px_rgba(48,44,46,.05)]"
      aria-busy="true"
      aria-label={title ? `${title} loading` : 'Loading'}
    >
      {title && (
        <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">{title}</p>
      )}
      <div className="mt-3 animate-pulse space-y-2" aria-hidden="true">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="h-9 rounded-xl bg-[#f1ece8]" />
        ))}
      </div>
    </section>
  );
}
