import { publicSettingsRouter, settingsRouter } from './settings.routes.js';
import { settingsService } from './settings.service.js';
import { SiteSettings } from './settings.model.js';
import { SETTINGS_EVENTS } from './settings.events.js';

export const getPublicSettings = () => settingsService.getPublicSettings();
export const getSettings = () => settingsService.getAdminSettings();
export const ensureDefaultSettings = () => settingsService.ensureDefaultSettings();

export {
  publicSettingsRouter,
  settingsRouter,
  settingsRouter as adminSettingsRouter,
  SiteSettings,
  SETTINGS_EVENTS,
  settingsService,
};
