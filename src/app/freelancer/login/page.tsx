'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Camera, Loader2 } from 'lucide-react';
import { ApiError } from '@/lib/api/client';
import { freelancerPortalApi } from '@/lib/api/freelancerPortal';

export default function FreelancerLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await freelancerPortalApi.login({ identifier, password });
      router.replace(searchParams.get('returnTo') || '/freelancer/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-[#F7F6F3] px-4 py-8 text-[#302C2E] sm:place-items-center">
      <section className="w-full max-w-md rounded-2xl border border-[#DFD9D2] bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-[#5A2F3E] text-[#DDC89C]"><Camera className="size-5" /></span>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#8D5265]">Freelancer Portal</p>
            <h1 className="text-2xl font-black">Sign in</h1>
          </div>
        </div>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-xs font-extrabold text-[#686164]">Email or mobile</span>
            <input className="mt-1 w-full rounded-xl border border-[#DFD9D2] bg-[#F7F6F3] px-3 py-3 text-sm font-semibold outline-none focus:border-[#8D5265]" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
          </label>
          <label className="block">
            <span className="text-xs font-extrabold text-[#686164]">Password</span>
            <input type="password" className="mt-1 w-full rounded-xl border border-[#DFD9D2] bg-[#F7F6F3] px-3 py-3 text-sm font-semibold outline-none focus:border-[#8D5265]" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={10} />
          </label>
          {error ? <p className="rounded-xl bg-[#B95052]/10 px-3 py-2 text-sm font-bold text-[#B95052]">{error}</p> : null}
          <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#8D5265] px-4 py-3 text-sm font-black text-white transition hover:bg-[#774255] disabled:opacity-60">
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            Sign in
          </button>
        </form>
        <p className="mt-5 text-center text-sm font-medium text-[#686164]">
          New here? <Link href="/freelancer/join" className="font-black text-[#8D5265]">Submit an application</Link>
        </p>
      </section>
    </main>
  );
}
