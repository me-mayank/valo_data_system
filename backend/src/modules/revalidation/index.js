import { revalidationService } from './revalidation.service.js';

export const registerListeners = (bus) => revalidationService.registerListeners(bus);
export const revalidate = (tags) => revalidationService.revalidate(tags);

export { revalidationService };
