'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError } from '@/lib/api/client';
import { freelancerPortalApi, PortalMe } from '@/lib/api/freelancerPortal';

export function useFreelancerPortal() {
  const router = useRouter();
  const [data, setData] = useState<PortalMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await freelancerPortalApi.me());
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace(`/freelancer/login?returnTo=${encodeURIComponent(window.location.pathname)}`);
        return;
      }
      setError(err instanceof Error ? err.message : 'Unable to load freelancer portal.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, setData, loading, error, reload: load };
}
