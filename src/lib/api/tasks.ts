import { apiRequest, type ApiMeta } from './client';

export type BackendTaskStatus = 'TODO' | 'ASSIGNED' | 'IN_PROGRESS' | 'PAUSED' | 'IN_REVIEW' | 'COMPLETED' | 'CANCELLED';
export type BackendTaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type BackendTaskCategory = 'PHOTO_EDITING' | 'VIDEO_EDITING' | 'CULLING' | 'COLOR_GRADING' | 'ALBUM_DESIGN' | 'ALBUM_PRINTING' | 'SHOOT_COVERAGE' | 'DATA_BACKUP' | 'CLIENT_MEETING' | 'DELIVERY' | 'ADMIN' | 'OTHER';

export interface BackendTask {
  id: string;
  title: string;
  description: string | null;
  category: BackendTaskCategory;
  priority: BackendTaskPriority;
  status: BackendTaskStatus;
  quantity: number | null;
  unit: string | null;
  dueDate: string | null;
  assigneeId: string | null;
  projectId: string | null;
  completedAt: string | null;
  assignee?: { id: string; fullName: string };
  project?: { id: string; projectNumber: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface TaskListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: BackendTaskStatus;
  priority?: BackendTaskPriority;
  category?: BackendTaskCategory;
  assigneeId?: string;
  projectId?: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  category?: BackendTaskCategory;
  priority?: BackendTaskPriority;
  quantity?: number;
  unit?: string;
  dueDate?: string;
  assigneeId?: string;
  projectId?: string;
}

function queryString(query: TaskListQuery): string {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value));
  });
  const value = params.toString();
  return value ? `?${value}` : '';
}

export const tasksApi = {
  async list(query: TaskListQuery): Promise<{ items: BackendTask[]; meta: ApiMeta }> {
    const response = await apiRequest<BackendTask[]>(`/tasks${queryString(query)}`);
    return { items: response.data, meta: response.meta };
  },
  async create(input: CreateTaskInput): Promise<BackendTask> {
    const { data } = await apiRequest<BackendTask>('/tasks', { method: 'POST', body: JSON.stringify(input) });
    return data;
  },
  async update(id: string, input: Omit<Partial<CreateTaskInput>, 'assigneeId'>): Promise<BackendTask> {
    const { data } = await apiRequest<BackendTask>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
    return data;
  },
  async changeStatus(id: string, status: BackendTaskStatus): Promise<BackendTask> {
    const { data } = await apiRequest<BackendTask>(`/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    return data;
  },
  async reassign(id: string, toUserId: string, reason?: string): Promise<BackendTask> {
    const { data } = await apiRequest<BackendTask>(`/tasks/${id}/reassign`, {
      method: 'POST',
      body: JSON.stringify({ toUserId, ...(reason ? { reason } : {}) }),
    });
    return data;
  },
  async remove(id: string): Promise<void> {
    await apiRequest<void>(`/tasks/${id}`, { method: 'DELETE' });
  },
};
