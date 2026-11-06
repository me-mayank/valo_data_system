import { notificationsService } from './notifications.service.js';

export const registerListeners = (bus) => notificationsService.registerListeners(bus);

