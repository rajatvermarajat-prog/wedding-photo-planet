'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError, ApiMeta } from '@/lib/api/client';
import { BackendLead, LeadListQuery, leadsApi } from '@/lib/api/leads';

export function useLeads(query: LeadListQuery = {}, enabled = true) {
  const [data, setData] = useState<BackendLead[]>([]);
  const [meta, setMeta] = useState<ApiMeta>({});
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(enabled);
  const queryKey = useMemo(() => JSON.stringify(query), [query]);

  const load = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await leadsApi.list(query);
      setData(response.data);
      setMeta(response.meta);
    } catch (error) {
      setError(error instanceof ApiError ? error : new ApiError(0, 'Unable to load leads.'));
    } finally {
      setLoading(false);
    }
  }, [enabled, queryKey]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, meta, error, loading, retry: load };
}
