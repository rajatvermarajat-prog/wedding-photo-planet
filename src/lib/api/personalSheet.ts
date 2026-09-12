import { apiRequest } from './client';

export type SheetCellValue = string | number;
export interface PersonalSheetData {
  columns: Array<{ id: string; label: string }>;
  rows: Array<{ id: string; cells: Record<string, SheetCellValue> }>;
}

interface PersonalSheetRecord {
  id: string;
  data: PersonalSheetData;
  updatedAt: string;
}

export const personalSheetApi = {
  async get(): Promise<PersonalSheetData> {
    const { data } = await apiRequest<PersonalSheetRecord>('/me/sheet');
    return data.data;
  },
  async save(sheet: PersonalSheetData): Promise<PersonalSheetData> {
    const { data } = await apiRequest<PersonalSheetRecord>('/me/sheet', { method: 'PUT', body: JSON.stringify(sheet) });
    return data.data;
  },
};
