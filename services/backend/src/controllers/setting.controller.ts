import { Response, NextFunction } from 'express';
import { SettingService } from '../services/setting.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class SettingController {
  public static async getAllSettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const settings = await SettingService.getAllSettings();
      return sendSuccess(res, settings);
    } catch (error) {
      return next(error);
    }
  }

  public static async updateSetting(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { key, value } = req.body;
      const setting = await SettingService.updateSetting(key, value, req);
      return sendSuccess(res, setting, 'Setting updated successfully');
    } catch (error) {
      return next(error);
    }
  }
}
