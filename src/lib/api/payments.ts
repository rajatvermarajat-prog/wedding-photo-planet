import { apiRequest } from './client';

export type PaymentMethod = 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'CHEQUE' | 'OTHER';

export interface ApiProjectPayment {
  id: string;
  paymentNumber: string;
  projectId: string | null;
  clientId: string;
  amount: string | number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
  transactionReference?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface CreateProjectPaymentInput {
  clientId: string;
  projectId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  transactionReference?: string;
}

const query = (values: Record<string, string | number | undefined>) => {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined) params.set(key, String(value));
  });
  return params.toString();
};

/** Project-scoped helpers over the established finance `/payments` resource. */
export const paymentsApi = {
  async getProjectPayments(projectId: string): Promise<ApiProjectPayment[]> {
    const result = await apiRequest<ApiProjectPayment[]>(`/payments?${query({ projectId, status: 'COMPLETED', page: 1, limit: 100 })}`, { fresh: true });
    return result.data;
  },

  async listCompletedProjectPayments(): Promise<ApiProjectPayment[]> {
    const result = await apiRequest<ApiProjectPayment[]>(`/payments?${query({ status: 'COMPLETED', page: 1, limit: 100 })}`, { fresh: true });
    return result.data;
  },

  async createProjectPayment(input: CreateProjectPaymentInput, idempotencyKey: string): Promise<ApiProjectPayment> {
    const result = await apiRequest<ApiProjectPayment>('/payments', {
      method: 'POST',
      headers: { 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify(input),
    });
    return result.data;
  },

  /** Completed payments are immutable financial records; removal is a DB-backed reversal. */
  async reverseProjectPayment(paymentId: string, reason: string, idempotencyKey: string): Promise<ApiProjectPayment> {
    const result = await apiRequest<ApiProjectPayment>(`/payments/${encodeURIComponent(paymentId)}/refund`, {
      method: 'POST',
      headers: { 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify({ reason }),
    });
    return result.data;
  },
};

interface UploadIntent {
  bucket: string;
  objectKey: string;
  uploadUrl: string;
  requiredHeaders: Record<string, string>;
}

interface PaymentReceiptFile { id: string; createdAt: string; }

export async function getProjectPaymentReceiptUrl(paymentId: string): Promise<string | undefined> {
  const files = (await apiRequest<PaymentReceiptFile[]>(`/files?${query({ entityType: 'PAYMENT_RECEIPT', entityId: paymentId, page: 1, limit: 1 })}`, { fresh: true })).data;
  if (!files[0]) return undefined;
  const result = await apiRequest<{ downloadUrl: string }>(`/files/${encodeURIComponent(files[0].id)}/download-url`, { fresh: true });
  return result.data.downloadUrl;
}

/** Uses the existing signed FileObject workflow and links the receipt to the payment UUID. */
export async function uploadProjectPaymentReceipt(file: File, paymentId: string, projectId: string): Promise<void> {
  const intent = (await apiRequest<UploadIntent>('/files/upload-intent', {
    method: 'POST',
    body: JSON.stringify({ entityType: 'PAYMENT_RECEIPT', originalName: file.name, mimeType: file.type || 'application/octet-stream' }),
  })).data;

  const upload = await fetch(intent.uploadUrl, {
    method: 'PUT',
    headers: intent.requiredHeaders,
    body: file,
  });
  if (!upload.ok) throw new Error('Receipt upload failed. The payment was not changed. Please try the receipt upload again.');

  await apiRequest('/files', {
    method: 'POST',
    body: JSON.stringify({
      entityType: 'PAYMENT_RECEIPT',
      entityId: paymentId,
      projectId,
      bucket: intent.bucket,
      objectKey: intent.objectKey,
      originalName: file.name,
      mimeType: file.type || 'application/octet-stream',
      sizeBytes: file.size,
      visibility: 'PRIVATE',
    }),
  });
}

export const paymentMethodLabel = (method: PaymentMethod): string => ({
  UPI: 'UPI / GPay',
  BANK_TRANSFER: 'Bank Transfer',
  CASH: 'Cash',
  CREDIT_CARD: 'Card',
  DEBIT_CARD: 'Card',
  CHEQUE: 'Cheque',
  OTHER: 'Other',
}[method]);

export const toPaymentMethod = (label: string): PaymentMethod => ({
  'UPI / GPay': 'UPI',
  'Bank Transfer': 'BANK_TRANSFER',
  Cash: 'CASH',
  Card: 'CREDIT_CARD',
  Cheque: 'CHEQUE',
  Other: 'OTHER',
} as Record<string, PaymentMethod>)[label] ?? 'OTHER';
