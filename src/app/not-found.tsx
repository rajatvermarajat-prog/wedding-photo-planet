import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 p-6 text-center">
      <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-xl">
        <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">404</p>
        <h1 className="mt-2 text-2xl font-black text-slate-900">Workspace not found</h1>
        <Link className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white" href="/dashboard">
          Return to dashboard
        </Link>
      </div>
    </main>
  );
}
