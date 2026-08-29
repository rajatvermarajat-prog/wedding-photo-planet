'use client';

import { useCallback, useEffect, useState } from 'react';
import { attendanceApi, type AttendanceListQuery, type BackendAttendance } from '@/lib/api/attendance';

export function useAttendance(query: AttendanceListQuery, enabled: boolean) {
  const [data, setData] = useState<BackendAttendance[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);
  const queryKey = JSON.stringify(query);
  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true); setError(null);
    try { const result = await attendanceApi.list(query); setData(result.items); }
    catch (reason) { setError(reason instanceof Error ? reason : new Error('Unable to load attendance.')); }
    finally { setLoading(false); }
  }, [enabled, queryKey]);
  useEffect(() => { if (enabled) void refresh(); }, [enabled, refresh]);
  return { data, loading, error, refresh };
}
