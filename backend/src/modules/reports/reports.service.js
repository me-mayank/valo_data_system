import { getLeadStats, getLatestLeads, getTopSources, getTopCourses } from '../leads/index.js';
import { countCourses } from '../courses/index.js';
import { getCampusRequestCount } from '../campus-requests/index.js';

export class ReportsService {
  async getOverview() {
    const [
      leadStats,
      latestLeads,
      topSources,
      topCourses,
      publishedCoursesCount,
      campusRequestCount,
    ] = await Promise.all([
      getLeadStats(),
      getLatestLeads(10),
      getTopSources(5),
      getTopCourses(5),
      countCourses({ status: 'published' }),
      getCampusRequestCount(),
    ]);

    return {
      totalLeads: leadStats.total,
      leadsLast7Days: leadStats.last7Days,
      publishedCoursesCount,
      campusRequestCount,
      topSources,
      topCourses,
      latestLeads,
    };
  }
}

export const reportsService = new ReportsService();
