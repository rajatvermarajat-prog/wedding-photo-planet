'use client';

import { useCallback, useEffect, useState } from 'react';
import { attendanceApi, type BackendAttendance } from '@/lib/api/attendance';

export function useMyAttendance(userId: string | undefined, enabled: boolean) {
  const [records, setRecords] = useState<BackendAttendance[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);
  const [pending, setPending] = useState(false);
  const refresh = useCallback(async () => {
    if (!enabled || !userId) return;
    setLoading(true); setError(null);
    try { const result = await attendanceApi.list({ userId, page: 1, limit: 6 }); setRecords(result.items); }
    catch (reason) { setError(reason instanceof Error ? reason : new Error('Unable to load attendance.')); }
    finally { setLoading(false); }
  }, [enabled, userId]);
  useEffect(() => { if (enabled && userId) void refresh(); }, [enabled, refresh, userId]);
  const mark = useCallback(async (input: Parameters<typeof attendanceApi.mark>[0]) => {
    setPending(true);
    try {
      const saved = await attendanceApi.mark(input);
      setRecords((previous) => [saved, ...previous.filter((record) => record.id !== saved.id)]);
      if (enabled) await refresh();
    }
    finally { setPending(false); }
  }, [enabled, refresh]);
  return { records, loading, error, pending, refresh, mark };
}
