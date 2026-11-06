import { apiGet } from '@/lib/api/server';
import CampusRequestsTable from '@/components/admin/CampusRequestsTable';

export const dynamic = 'force-dynamic';

export default async function AdminCampusRequestsPage() {
  let initialData = { items: [], total: 0, page: 1, limit: 25, totalPages: 1 };

  try {
    const data = await apiGet('/api/admin/campus-requests?page=1&limit=25', {
      forwardCookies: true,
      cache: 'no-store',
    });
    if (data) {
      initialData = data;
    }
  } catch (err) {
    console.error('Failed to load initial campus requests on server:', err);
  }

  return (
    <div>
      {/* Header */}
      <div className="border-b border-navy pb-4 mb-6">
        <span className="font-mono text-xs text-navy-soft uppercase">[SECTION 04]</span>
        <h1 className="font-mono text-2xl font-bold uppercase text-navy">
          Campus Workshop Requests
        </h1>
        <p className="font-sans text-xs text-navy-soft mt-1">
          Manage institutional partnerships, campus seminar inquiries, and workshop dispatches.
        </p>
      </div>

      <CampusRequestsTable initialData={initialData} />
    </div>
  );
}
