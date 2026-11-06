import { SiteSettings } from './settings.model.js';

export class SettingsRepository {
  async getSettings() {
    return SiteSettings.findOne({ key: 'main' });
  }

  async ensureDefaultSettings() {
    return SiteSettings.findOneAndUpdate(
      { key: 'main' },
      { $setOnInsert: { key: 'main' } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  async updateSettings(data) {
    return SiteSettings.findOneAndUpdate(
      { key: 'main' },
      { $set: data },
      { new: true, runValidators: true, upsert: true }
    );
  }
}

export const settingsRepository = new SettingsRepository();

