'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  personalTodosApi,
  type CreatePersonalTodoInput,
  type PersonalTodo,
  type UpdatePersonalTodoInput,
} from '@/lib/api/personalTodos';

export function usePersonalTodos(enabled: boolean) {
  const [data, setData] = useState<PersonalTodo[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);
  const [pending, setPending] = useState(false);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const result = await personalTodosApi.list({ page: 1, limit: 50 });
      setData(result.items);
    } catch (reason) {
      setError(reason instanceof Error ? reason : new Error('Unable to load personal to-dos.'));
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (enabled) void refresh();
  }, [enabled, refresh]);

  const run = useCallback(async <T,>(operation: () => Promise<T>) => {
    setPending(true);
    try {
      const result = await operation();
      await refresh();
      return result;
    } finally {
      setPending(false);
    }
  }, [refresh]);

  return {
    data,
    loading,
    error,
    pending,
    refresh,
    create: (input: CreatePersonalTodoInput) => run(() => personalTodosApi.create(input)),
    update: (id: string, input: UpdatePersonalTodoInput) => run(() => personalTodosApi.update(id, input)),
    remove: (id: string) => run(() => personalTodosApi.remove(id)),
    clearCompleted: () => run(() => personalTodosApi.clearCompleted()),
  };
}
