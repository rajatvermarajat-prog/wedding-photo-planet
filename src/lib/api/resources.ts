import { ApiMeta, apiRequest } from './client';

export type QueryValue = string | number | boolean | undefined;
export type ListQuery = Record<string, QueryValue>;

function queryString(query: ListQuery = {}): string {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value));
  });
  const value = params.toString();
  return value ? `?${value}` : '';
}

export interface Page<T> { items: T[]; meta: ApiMeta; }

function resource<T, Create = Partial<T>, Update = Partial<T>>(path: string) {
  return {
    async list(query?: ListQuery): Promise<Page<T>> {
      const result = await apiRequest<T[]>(`${path}${queryString(query)}`);
      return { items: result.data, meta: result.meta };
    },
    get: async (id: string) => (await apiRequest<T>(`${path}/${encodeURIComponent(id)}`)).data,
    create: async (input: Create) => (await apiRequest<T>(path, { method: 'POST', body: JSON.stringify(input) })).data,
    update: async (id: string, input: Update) => (await apiRequest<T>(`${path}/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(input) })).data,
    remove: async (id: string) => { await apiRequest<void>(`${path}/${encodeURIComponent(id)}`, { method: 'DELETE' }); },
  };
}

// These paths and HTTP methods mirror the standalone Express route contract.
export const crmApi = {
  clients: resource<unknown, Record<string, unknown>, Record<string, unknown>>('/clients'),
  leads: resource<unknown, Record<string, unknown>, Record<string, unknown>>('/leads'),
  projects: resource<unknown, Record<string, unknown>, Record<string, unknown>>('/projects'),
  events: resource<unknown, Record<string, unknown>, Record<string, unknown>>('/events'),
  shoots: resource<unknown, Record<string, unknown>, Record<string, unknown>>('/shoots'),
  freelancers: resource<unknown, Record<string, unknown>, Record<string, unknown>>('/freelancers'),
  tasks: resource<unknown, Record<string, unknown>, Record<string, unknown>>('/tasks'),
  attendance: resource<unknown, Record<string, unknown>, never>('/attendance'),
  deliveries: resource<unknown, Record<string, unknown>, Record<string, unknown>>('/deliveries'),
  quotations: resource<unknown, Record<string, unknown>, never>('/quotations'),
  invoices: resource<unknown, Record<string, unknown>, never>('/invoices'),
  expenses: resource<unknown, Record<string, unknown>, Record<string, unknown>>('/expenses'),
  payments: resource<unknown, Record<string, unknown>, never>('/payments'),
  users: resource<unknown, Record<string, unknown>, Record<string, unknown>>('/users'),
};

export const platformApi = {
  dataManagementOverview: async (query?: ListQuery) =>
    (await apiRequest<unknown>(`/data-management/overview${queryString(query)}`)).data,
  notifications: async (query?: ListQuery) => apiRequest<unknown[]>(`/notifications${queryString(query)}`),
  markNotificationRead: async (id: string) =>
    (await apiRequest<unknown>(`/notifications/${encodeURIComponent(id)}/read`, { method: 'POST' })).data,
  markAllNotificationsRead: async () =>
    (await apiRequest<unknown>('/notifications/read-all', { method: 'POST' })).data,
};
