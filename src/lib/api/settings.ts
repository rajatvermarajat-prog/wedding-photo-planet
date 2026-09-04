import { ApiError, apiRequest, setAuthTokens } from './client';

export interface SystemSetting { key: string; value: unknown; description?: string | null; }

/** Settings workspace contract. All values are server-owned; this client never persists settings locally. */
export interface SettingsWorkspace {
  viewer: { id: string; fullName: string; email: string; phone?: string | null; imageUrl?: string | null; isAdmin: boolean };
  organization?: { name: string; logoUrl?: string | null; contactEmail?: string | null; contactPhone?: string | null; timezone?: string; currency?: string; dateFormat?: string };
  notifications: Record<string, boolean>;
  security: { sessionTimeoutMinutes?: number; notifyNewLogin?: boolean };
  grantedModules: Array<{ key: string; label: string; description?: string }>;
  availableModules: Array<{ key: string; label: string; description?: string }>;
  requests: ModuleAccessRequest[];
}
export interface ModuleAccessRequest { id: string; employeeName: string; employeeEmail: string; moduleKey: string; moduleLabel: string; reason: string; status: 'PENDING' | 'APPROVED' | 'REJECTED'; createdAt: string; reviewedAt?: string | null; reviewerName?: string | null; reviewReason?: string | null; }

/**
 * The API rejects `null` for an optional field — the schemas accept a value, or
 * `''` to clear one, or the key being absent to leave it alone. Form state is
 * seeded straight from a workspace response, whose unset fields come back as
 * `null`, so those keys are dropped rather than sent.
 */
function omitNullish<T extends object>(input: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== null && value !== undefined),
  ) as Partial<T>;
}

/**
 * A field-level validation failure carries its real reason in `details`, while
 * the envelope message is only ever "Invalid request". Surfacing the detail is
 * what turns a rejected save into something the user can act on.
 */
function withFieldDetail(error: unknown): never {
  if (error instanceof ApiError && error.details?.length) {
    const detail = error.details
      .map((entry) => {
        const { field, message } = (entry ?? {}) as { field?: string; message?: string };
        if (!message) return null;
        return field ? `${field}: ${message}` : message;
      })
      .filter(Boolean)
      .join('; ');
    if (detail) throw new ApiError(error.status, detail, error.code, error.details);
  }
  throw error;
}

const settingsRequest = async <T>(path: string, init: RequestInit): Promise<T> => {
  try {
    return (await apiRequest<T>(path, init)).data;
  } catch (error) {
    return withFieldDetail(error);
  }
};

export const settingsApi = {
  /**
   * Generic key/value studio settings. Not part of the Settings workspace —
   * the dashboard and data-management screens store their own values here.
   */
  list: async () => (await apiRequest<SystemSetting[]>('/settings')).data,
  upsert: async (key: string, value: unknown, description?: string) =>
    (await apiRequest<SystemSetting>('/settings', {
      method: 'PUT',
      body: JSON.stringify({ key, value, description }),
    })).data,

  /** The whole Settings screen in one response: viewer, studio, preferences, modules and requests. */
  workspace: async (): Promise<SettingsWorkspace> =>
    (await apiRequest<SettingsWorkspace>('/settings/workspace')).data,

  updateProfile: async (input: { fullName: string; phone?: string; imageUrl?: string }) =>
    settingsRequest<SettingsWorkspace['viewer']>('/settings/profile', {
      method: 'PATCH',
      body: JSON.stringify(omitNullish(input)),
    }),

  updateOrganization: async (input: NonNullable<SettingsWorkspace['organization']>) =>
    settingsRequest<NonNullable<SettingsWorkspace['organization']>>('/settings/organization', {
      method: 'PATCH',
      body: JSON.stringify(omitNullish(input)),
    }),

  updatePreferences: async (input: { notifications?: Record<string, boolean>; security?: SettingsWorkspace['security'] }) =>
    settingsRequest<{ notifications: Record<string, boolean>; security: SettingsWorkspace['security'] }>('/settings/preferences', {
      method: 'PATCH',
      body: JSON.stringify(omitNullish(input)),
    }),

  /**
   * Changing the password revokes every session for the account, this one
   * included, so the stored tokens are dead the moment the call succeeds.
   * Dropping them here keeps the app from retrying a revoked session and sends
   * the user back to the sign-in screen with their new password.
   */
  changePassword: async (input: { currentPassword: string; newPassword: string }) => {
    const result = await settingsRequest<{ passwordChanged: boolean }>('/settings/password', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    setAuthTokens(null);
    return result;
  },

  /** The reviewer queue. The workspace already embeds this; use it to refresh only the list. */
  moduleRequests: async (status?: ModuleAccessRequest['status']) =>
    (await apiRequest<ModuleAccessRequest[]>(
      `/settings/module-access-requests${status ? `?status=${status}` : ''}`,
    )).data,

  requestModule: async (input: { moduleKey: string; reason: string }) =>
    settingsRequest<ModuleAccessRequest>('/settings/module-access-requests', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  reviewModuleRequest: async (id: string, input: { status: 'APPROVED' | 'REJECTED'; reviewReason?: string }) =>
    settingsRequest<ModuleAccessRequest>(`/settings/module-access-requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(omitNullish(input)),
    }),
};
