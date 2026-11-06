import { publicCampusRouter, adminCampusRouter } from './campus-requests.routes.js';
import { campusRequestsService } from './campus-requests.service.js';
import { CampusRequest } from './campus-requests.model.js';

export const getCampusRequestCount = () => campusRequestsService.getCampusRequestCount();

export { publicCampusRouter, adminCampusRouter, CampusRequest };

