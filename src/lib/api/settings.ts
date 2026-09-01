import { apiRequest } from './client';

export interface SystemSetting { key: string; value: unknown; description?: string | null; }

export const settingsApi = {
  list: async () => (await apiRequest<SystemSetting[]>('/settings')).data,
  upsert: async (key: string, value: unknown, description?: string) =>
    (await apiRequest<SystemSetting>('/settings', {
      method: 'PUT',
      body: JSON.stringify({ key, value, description }),
    })).data,
};
