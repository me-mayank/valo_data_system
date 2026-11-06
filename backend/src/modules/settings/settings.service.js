import { settingsRepository } from './settings.repository.js';
import { eventBus } from '../../shared/events/event-bus.js';
import { SETTINGS_EVENTS } from './settings.events.js';
import { updateSettingsSchema } from './settings.validation.js';

export class SettingsService {
  async getPublicSettings() {
    const settings = await settingsRepository.ensureDefaultSettings();
    return {
      popupEnabled: settings.popupEnabled,
      popupDelaySeconds: settings.popupDelaySeconds,
      popupScrollPercent: settings.popupScrollPercent,
      popupReappearSeconds: settings.popupReappearSeconds,
      popupMaxDismissals: settings.popupMaxDismissals,
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone,
      instagramUrl: settings.instagramUrl,
      linkedinUrl: settings.linkedinUrl,
    };
  }

  async getAdminSettings() {
    return settingsRepository.ensureDefaultSettings();
  }

  async ensureDefaultSettings() {
    return settingsRepository.ensureDefaultSettings();
  }

  async updateSettings(data) {
    const validated = updateSettingsSchema.parse(data);
    const updated = await settingsRepository.updateSettings(validated);
    eventBus.emit(SETTINGS_EVENTS.SETTINGS_CHANGED, {
      action: 'update',
      settings: updated,
    });
    return updated;
  }
}

export const settingsService = new SettingsService();
