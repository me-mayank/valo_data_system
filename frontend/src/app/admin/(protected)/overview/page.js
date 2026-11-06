import { apiGet } from '@/lib/api/server';
import OverviewDashboard from '@/components/admin/OverviewDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminOverviewPage() {
  let initialData = {
    totalLeads: 0,
    leadsLast7Days: 0,
    publishedCoursesCount: 0,
    campusRequestCount: 0,
    topSources: [],
    topCourses: [],
    latestLeads: [],
  };

  try {
    const data = await apiGet('/api/admin/overview', {
      forwardCookies: true,
      cache: 'no-store',
    });
    if (data) {
      initialData = data;
    }
  } catch (err) {
    console.error('Failed to load overview data on server:', err);
  }

  return (
    <div>
      {/* Header */}
      <div className="border-b border-navy pb-4 mb-6">
        <span className="font-mono text-xs text-navy-soft uppercase">[SECTION 01]</span>
        <h1 className="font-mono text-2xl font-bold uppercase text-navy">
          Operations Overview
        </h1>
        <p className="font-sans text-xs text-navy-soft mt-1">
          High-level operational metrics, lead capture velocity, top acquisition channels, and campaign tracking generator.
        </p>
      </div>

      <OverviewDashboard initialData={initialData} />
    </div>
  );
}
