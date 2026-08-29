'use client';

import { useCallback, useEffect, useState } from 'react';
import { personalNotesApi, type PersonalNote } from '@/lib/api/personalNotes';

export function usePersonalNotes() {
  const [data, setData] = useState<PersonalNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pending, setPending] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await personalNotesApi.list());
    } catch (reason) {
      setError(reason instanceof Error ? reason : new Error('Unable to load notes.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const run = useCallback(async <T,>(operation: () => Promise<T>) => {
    setPending(true);
    try {
      return await operation();
    } finally {
      setPending(false);
    }
  }, []);

  return {
    data,
    setData,
    loading,
    error,
    pending,
    refresh,
    create: (input?: { title?: string; content?: string }) =>
      run(async () => {
        const note = await personalNotesApi.create(input);
        setData((current) => [note, ...current]);
        return note;
      }),
    update: (id: string, input: Partial<Pick<PersonalNote, 'title' | 'content' | 'pinned' | 'sortOrder'>>) =>
      run(async () => {
        const note = await personalNotesApi.update(id, input);
        setData((current) => current.map((item) => (item.id === id ? note : item)));
        return note;
      }),
    reorder: (ids: string[]) =>
      run(async () => {
        const notes = await personalNotesApi.reorder(ids);
        setData(notes);
        return notes;
      }),
    remove: (id: string) =>
      run(async () => {
        await personalNotesApi.remove(id);
        setData((current) => current.filter((item) => item.id !== id));
      }),
  };
}
