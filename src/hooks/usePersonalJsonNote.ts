'use client';

import { useCallback, useEffect, useState } from 'react';
import { personalNotesApi } from '@/lib/api/personalNotes';

const SYSTEM_PREFIX = '[system-json] ';

export function usePersonalJsonNote<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [noteId, setNoteId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const title = `${SYSTEM_PREFIX}${key}`;

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    void personalNotesApi.list()
      .then((notes) => {
        if (cancelled) return;
        const note = notes.find((item) => item.title === title);
        if (!note) {
          setValue(fallback);
          setNoteId(null);
          return;
        }
        setNoteId(note.id);
        try {
          setValue(JSON.parse(note.content) as T);
        } catch {
          setValue(fallback);
        }
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [fallback, title]);

  const save = useCallback(async (next: T) => {
    setValue(next);
    const content = JSON.stringify(next);
    if (noteId) {
      await personalNotesApi.update(noteId, { title, content });
      return;
    }
    const created = await personalNotesApi.create({ title, content });
    setNoteId(created.id);
  }, [noteId, title]);

  return { value, setValue, save, loaded };
}
