'use client';

import { useEffect, useState } from 'react';

/**
 * Becomes true once the browser is idle after the first paint. Used to keep
 * below-the-fold datasets off the critical path: the dashboard shell and its
 * summary render first, then these queries start without competing for the
 * connection pool.
 */
export function useDeferredLoad(enabled: boolean, timeoutMs = 1200): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled || ready) return;
    const idle = window.requestIdleCallback;
    if (idle) {
      const handle = idle(() => setReady(true), { timeout: timeoutMs });
      return () => window.cancelIdleCallback?.(handle);
    }
    const timer = window.setTimeout(() => setReady(true), 200);
    return () => window.clearTimeout(timer);
  }, [enabled, ready, timeoutMs]);

  return ready;
}
