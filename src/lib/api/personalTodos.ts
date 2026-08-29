import { apiRequest, type ApiMeta } from './client';

export type PersonalTodoPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface PersonalTodo {
  id: string;
  title: string;
  priority: PersonalTodoPriority;
  dueDate: string | null;
  category?: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePersonalTodoInput {
  title: string;
  priority?: PersonalTodoPriority;
  dueDate?: string;
  category?: string;
}

export interface UpdatePersonalTodoInput {
  title?: string;
  priority?: PersonalTodoPriority;
  dueDate?: string | null;
  completed?: boolean;
  category?: string | null;
}

function queryString(query: { page?: number; limit?: number; completed?: boolean }): string {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) params.set(key, String(value));
  });
  const value = params.toString();
  return value ? `?${value}` : '';
}

export const personalTodosApi = {
  async list(query: { page?: number; limit?: number; completed?: boolean } = {}): Promise<{ items: PersonalTodo[]; meta: ApiMeta }> {
    const response = await apiRequest<PersonalTodo[]>(`/me/todos${queryString(query)}`);
    return { items: response.data, meta: response.meta };
  },
  async create(input: CreatePersonalTodoInput): Promise<PersonalTodo> {
    const { data } = await apiRequest<PersonalTodo>('/me/todos', { method: 'POST', body: JSON.stringify(input) });
    return data;
  },
  async update(id: string, input: UpdatePersonalTodoInput): Promise<PersonalTodo> {
    const { data } = await apiRequest<PersonalTodo>(`/me/todos/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
    return data;
  },
  async remove(id: string): Promise<void> {
    await apiRequest<void>(`/me/todos/${id}`, { method: 'DELETE' });
  },
  async clearCompleted(): Promise<{ cleared: number }> {
    const { data } = await apiRequest<{ cleared: number }>('/me/todos/completed', { method: 'DELETE' });
    return data;
  },
};
