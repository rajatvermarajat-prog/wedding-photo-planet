import { prisma } from '../config/prisma';
import { logAudit } from '../middleware/audit';
import { AuthenticatedRequest } from '../types';

export class SettingService {
  public static async getAllSettings() {
    return prisma.systemSetting.findMany({
      orderBy: { key: 'asc' },
    });
  }

  public static async getSetting(key: string) {
    const setting = await prisma.systemSetting.findUnique({
      where: { key },
    });
    return setting ? setting.value : null;
  }

  public static async updateSetting(key: string, value: string, req?: AuthenticatedRequest) {
    const existing = await prisma.systemSetting.findUnique({ where: { key } });

    const updated = await prisma.systemSetting.upsert({
      where: { key },
      update: {
        value,
        updated_by: req?.user?.id || null,
      },
      create: {
        key,
        value,
        updated_by: req?.user?.id || null,
      },
    });

    await logAudit({
      action: 'SETTING_UPDATED',
      module: 'SETTINGS',
      referenceId: key,
      oldValue: existing ? existing.value : null,
      newValue: value,
      req,
    });

    return updated;
  }
}
