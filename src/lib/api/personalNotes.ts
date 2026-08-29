import { apiRequest } from './client';

export interface PersonalNote {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  sortOrder: number;
  updatedAt: string;
  createdAt: string;
}

export const personalNotesApi = {
  async list(): Promise<PersonalNote[]> {
    const { data } = await apiRequest<PersonalNote[]>('/me/notes');
    return data;
  },
  async create(input: { title?: string; content?: string } = {}): Promise<PersonalNote> {
    const { data } = await apiRequest<PersonalNote>('/me/notes', { method: 'POST', body: JSON.stringify(input) });
    return data;
  },
  async update(id: string, input: Partial<Pick<PersonalNote, 'title' | 'content' | 'pinned' | 'sortOrder'>>): Promise<PersonalNote> {
    const { data } = await apiRequest<PersonalNote>(`/me/notes/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
    return data;
  },
  async reorder(ids: string[]): Promise<PersonalNote[]> {
    const { data } = await apiRequest<PersonalNote[]>('/me/notes/reorder', { method: 'PUT', body: JSON.stringify({ ids }) });
    return data;
  },
  async remove(id: string): Promise<void> {
    await apiRequest<void>(`/me/notes/${id}`, { method: 'DELETE' });
  },
};
