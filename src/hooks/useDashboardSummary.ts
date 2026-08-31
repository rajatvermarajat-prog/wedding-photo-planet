'use client';

import { useCallback, useEffect, useState } from 'react';
import { dashboardApi, DashboardSummary } from '@/lib/api/dashboard';

export function useDashboardSummary(enabled: boolean) {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      setData(await dashboardApi.summary());
    } catch (reason) {
      setError(reason instanceof Error ? reason : new Error('Unable to load the dashboard.'));
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (enabled) void refresh();
  }, [enabled, refresh]);

  return { data, loading, error, refresh };
}
