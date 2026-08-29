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

export async function apiRequest<T>(
  path: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<{ data: T; meta: ApiMeta }> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), init.timeoutMs ?? REQUEST_TIMEOUT_MS);
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  headers.set('Accept', 'application/json');

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
