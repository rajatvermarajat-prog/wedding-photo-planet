import { prisma } from '../config/prisma';
import { extractDeviceInfo } from '../utils/userAgent';
import { AuthenticatedRequest } from '../types';

export interface AuditParams {
  userId?: string | null;
  action: string;
  module: string;
  referenceId?: string | null;
  oldValue?: any;
  newValue?: any;
  req?: AuthenticatedRequest | any;
}

export const logAudit = async ({
  userId,
  action,
  module,
  referenceId,
  oldValue,
  newValue,
  req,
}: AuditParams) => {
  try {
    let ipAddress: string | undefined;
    let userAgent: string | undefined;

    if (req) {
      const dev = extractDeviceInfo(req);
      ipAddress = dev.ipAddress;
      userAgent = dev.userAgent;
      if (!userId && req.user) {
        userId = req.user.id;
      }
    }

    await prisma.auditLog.create({
      data: {
        user_id: userId || null,
        action,
        module,
        reference_id: referenceId ? String(referenceId) : null,
        old_value: oldValue ? JSON.stringify(oldValue) : null,
        new_value: newValue ? JSON.stringify(newValue) : null,
        ip_address: ipAddress || null,
        user_agent: userAgent || null,
      },
    });
  } catch (error) {
    console.error('⚠️ Failed to record audit log:', error);
  }
};
