import { apiRequest } from './client';

export const CLIENT_ASSET_ACCEPT = [
  'image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;
export const CLIENT_ASSET_MAX_BYTES = 10 * 1024 * 1024;

export interface ProjectClientAsset {
  id: string;
  projectId: string | null;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  metadata?: { category?: string; title?: string; notes?: string } | null;
  createdAt: string;
  updatedAt: string;
  uploadedBy?: { id: string; fullName: string } | null;
}

interface UploadIntent { bucket: string; objectKey: string; uploadUrl: string; requiredHeaders: Record<string, string>; }
export interface ProjectClientAssetInput { category?: string; title?: string; notes?: string; }

const path = (projectId: string) => `/projects/${encodeURIComponent(projectId)}/client-assets`;

export const clientAssetsApi = {
  async getProjectClientAssets(projectId: string): Promise<ProjectClientAsset[]> {
    return (await apiRequest<ProjectClientAsset[]>(path(projectId), { fresh: true })).data;
  },
  async updateProjectClientAsset(projectId: string, assetId: string, input: ProjectClientAssetInput): Promise<ProjectClientAsset> {
    return (await apiRequest<ProjectClientAsset>(`${path(projectId)}/${encodeURIComponent(assetId)}`, { method: 'PATCH', body: JSON.stringify(input) })).data;
  },
  async deleteProjectClientAsset(projectId: string, assetId: string): Promise<void> {
    await apiRequest(`${path(projectId)}/${encodeURIComponent(assetId)}`, { method: 'DELETE' });
  },
  async getProjectClientAssetDownloadUrl(projectId: string, assetId: string): Promise<string> {
    return (await apiRequest<{ downloadUrl: string }>(`${path(projectId)}/${encodeURIComponent(assetId)}/download-url`, { fresh: true })).data.downloadUrl;
  },
};

/** Upload binary through the existing signed FileObject flow, then link it to this project. */
export async function uploadProjectClientAsset(projectId: string, file: File, input: ProjectClientAssetInput = {}): Promise<ProjectClientAsset> {
  const mimeType = file.type || mimeTypeFromName(file.name);
  if (!CLIENT_ASSET_ACCEPT.includes(mimeType as typeof CLIENT_ASSET_ACCEPT[number])) throw new Error('Only JPG, PNG, WEBP, PDF, DOC, and DOCX files are supported.');
  if (file.size <= 0 || file.size > CLIENT_ASSET_MAX_BYTES) throw new Error('Each client asset must be under 10MB.');
  const intent = (await apiRequest<UploadIntent>(`${path(projectId)}/upload-intent`, {
    method: 'POST', body: JSON.stringify({ originalName: file.name, mimeType }),
  })).data;
  const response = await fetch(intent.uploadUrl, { method: 'PUT', headers: intent.requiredHeaders, body: file });
  if (!response.ok) throw new Error('Client asset upload failed. Please try again.');
  return (await apiRequest<ProjectClientAsset>(path(projectId), {
    method: 'POST',
    body: JSON.stringify({ bucket: intent.bucket, objectKey: intent.objectKey, originalName: file.name, mimeType, sizeBytes: file.size, ...input }),
  })).data;
}

function mimeTypeFromName(name: string): string {
  const extension = name.split('.').pop()?.toLowerCase();
  return ({ jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', pdf: 'application/pdf', doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' } as Record<string, string>)[extension || ''] || '';
}
