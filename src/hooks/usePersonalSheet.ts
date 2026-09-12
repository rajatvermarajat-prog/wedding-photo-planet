'use client';

import { useCallback, useEffect, useState } from 'react';
import { personalSheetApi, type PersonalSheetData } from '@/lib/api/personalSheet';

export function usePersonalSheet() {
  const [data, setData] = useState<PersonalSheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await personalSheetApi.get());
    } catch (reason) {
      setError(reason instanceof Error ? reason : new Error('Unable to load your sheet.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const save = useCallback(async (sheet: PersonalSheetData) => {
    const saved = await personalSheetApi.save(sheet);
    setData(saved);
    return saved;
  }, []);

  return { data, setData, loading, error, refresh, save };
}
