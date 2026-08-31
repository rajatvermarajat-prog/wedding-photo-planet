export interface ApiMeta {
  requestId?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  [key: string]: unknown;
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  meta: ApiMeta;
}

interface ApiErrorEnvelope {
  success: false;
  error?: { code?: string; message?: string; details?: unknown[] };
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
    public readonly details?: unknown[],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5050/api/v1').replace(/\/$/, '');
const REQUEST_TIMEOUT_MS = 15_000;
const TOKEN_KEY = 'wpp.accessToken';

/**
 * The API is on a different `.vercel.app` host, so its auth cookie is
 * third-party and browsers may drop it. The bearer token keeps sessions working.
 */
export function setAccessToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

type Result = { data: unknown; meta: ApiMeta };

/**
 * GET de-duplication. Several panels legitimately need the same list, and
 * StrictMode mounts every effect twice, so identical reads used to become
 * identical concurrent requests. Callers that need certainty after a write
 * pass `fresh: true`, which also drops the entry for that path.
 */
const inFlight = new Map<string, Promise<Result>>();
const recent = new Map<string, { at: number; result: Result }>();
const DEDUPE_WINDOW_MS = 3_000;

export function invalidateReadCache(pathPrefix?: string): void {
  if (!pathPrefix) {
    recent.clear();
    return;
  }
  for (const key of [...recent.keys()]) {
    if (key.startsWith(pathPrefix)) recent.delete(key);
  }
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit & { timeoutMs?: number; fresh?: boolean } = {},
): Promise<{ data: T; meta: ApiMeta }> {
  const method = (init.method ?? 'GET').toUpperCase();
  if (method !== 'GET') {
    // Any write can change any list; the next read must hit the network.
    const result = await performRequest<T>(path, init);
    invalidateReadCache();
    return result;
  }

  if (init.fresh) {
    recent.delete(path);
    inFlight.delete(path);
  } else {
    const hit = recent.get(path);
    if (hit && Date.now() - hit.at < DEDUPE_WINDOW_MS) {
      return hit.result as { data: T; meta: ApiMeta };
    }
    const pending = inFlight.get(path);
    if (pending) return pending as Promise<{ data: T; meta: ApiMeta }>;
  }

  const request = performRequest<T>(path, init)
    .then((result) => {
      recent.set(path, { at: Date.now(), result });
      return result;
    })
    .finally(() => inFlight.delete(path));

  inFlight.set(path, request as Promise<Result>);
  return request;
}

async function performRequest<T>(
  path: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<{ data: T; meta: ApiMeta }> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), init.timeoutMs ?? REQUEST_TIMEOUT_MS);
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  headers.set('Accept', 'application/json');
  const token = getAccessToken();
  if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);

  try {
    const response = await fetch(`${baseUrl}${path.startsWith('/') ? path : `/${path}`}`, {
      ...init,
      headers,
      credentials: 'include',
      signal: controller.signal,
    });
    if (response.status === 204) return { data: undefined as T, meta: {} };

    const payload = await response.json().catch(() => null) as ApiEnvelope<T> | ApiErrorEnvelope | null;
    if (!response.ok || !payload || !payload.success) {
      const error = payload as ApiErrorEnvelope | null;
      throw new ApiError(
        response.status,
        error?.error?.message ?? statusMessage(response.status),
        error?.error?.code,
        error?.error?.details,
      );
    }
    return { data: payload.data, meta: payload.meta ?? {} };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError(408, 'The request timed out. Please try again.');
    }
    throw new ApiError(0, 'Unable to reach the CRM service. Check your connection and try again.');
  } finally {
    window.clearTimeout(timeout);
  }
}

function statusMessage(status: number): string {
  const messages: Record<number, string> = {
    400: 'Please check the submitted information.',
    401: 'Your session has expired. Please sign in again.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested record was not found.',
    409: 'This action conflicts with the current record state.',
    422: 'The request could not be processed. Please check the form.',
    429: 'Too many requests. Please wait a moment and try again.',
    500: 'The CRM service encountered an error. Please try again.',
    503: 'The CRM service is temporarily unavailable. Please try again shortly.',
  };
  return messages[status] ?? 'The request could not be completed.';
}
