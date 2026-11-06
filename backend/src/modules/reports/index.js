import { reportsRouter } from './reports.routes.js';
import { reportsService } from './reports.service.js';

export const getOverview = () => reportsService.getOverview();

export { reportsRouter };

