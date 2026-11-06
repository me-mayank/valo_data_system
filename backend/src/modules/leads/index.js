import { publicLeadsRouter, adminLeadsRouter } from './leads.routes.js';
import { leadsService } from './leads.service.js';
import { Lead } from './leads.model.js';

export const getLeadStats = () => leadsService.getLeadStats();
export const getLatestLeads = (n) => leadsService.getLatestLeads(n);
export const getTopSources = (limit) => leadsService.getTopSources(limit);
export const getTopCourses = (limit) => leadsService.getTopCourses(limit);

export { publicLeadsRouter, adminLeadsRouter, Lead, leadsService };
