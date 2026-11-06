import { settingsService } from './settings.service.js';

export class SettingsController {
  async getPublic(req, res) {
    const data = await settingsService.getPublicSettings();
    res.json({
      ok: true,
      data,
    });
  }

  async getAdmin(req, res) {
    const data = await settingsService.getAdminSettings();
    res.json({
      ok: true,
      data,
    });
  }

  async updateAdmin(req, res) {
    const data = await settingsService.updateSettings(req.body);
    res.json({
      ok: true,
      data,
    });
  }
}

export const settingsController = new SettingsController();
