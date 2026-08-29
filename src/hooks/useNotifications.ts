'use client';

import { useCallback, useEffect, useState } from 'react';
import { platformApi } from '@/lib/api/resources';

export interface StudioNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  entityType?: string | null;
  entityId?: string | null;
}

export function useNotifications(enabled: boolean) {
  const [items, setItems] = useState<StudioNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    try {
      const result = await platformApi.notifications({ page: 1, limit: 20 });
      setItems((result.data || []) as StudioNotification[]);
      setUnread(Number(result.meta?.unread || 0));
    } catch {
      setItems([]);
      setUnread(0);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    void refresh();
    const timer = window.setInterval(() => void refresh(), 30_000);
    return () => window.clearInterval(timer);
  }, [enabled, refresh]);

  const markRead = useCallback(async (id: string) => {
    await platformApi.markNotificationRead(id);
    await refresh();
  }, [refresh]);

  const markAllRead = useCallback(async () => {
    await platformApi.markAllNotificationsRead();
    await refresh();
  }, [refresh]);

  return { items, unread, open, setOpen, refresh, markRead, markAllRead };
}
