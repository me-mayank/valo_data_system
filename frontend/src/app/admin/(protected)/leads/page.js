import { apiGet } from '@/lib/api/server';
import LeadsTable from '@/components/admin/LeadsTable';

export const dynamic = 'force-dynamic';

export default async function AdminLeadsPage() {
  let initialData = { items: [], total: 0, page: 1, limit: 25, totalPages: 1 };

  try {
    const data = await apiGet('/api/admin/leads?page=1&limit=25', {
      forwardCookies: true,
      cache: 'no-store',
    });
    if (data) {
      initialData = data;
    }
  } catch (err) {
    console.error('Failed to load initial leads on server:', err);
  }

  return (
    <div>
      {/* Header */}
      <div className="border-b border-navy pb-4 mb-6">
        <span className="font-mono text-xs text-navy-soft uppercase">[SECTION 03]</span>
        <h1 className="font-mono text-2xl font-bold uppercase text-navy">
          Student Leads Registry
        </h1>
        <p className="font-sans text-xs text-navy-soft mt-1">
          Review, filter, inspect and export interested students across web forms and campus campaigns.
        </p>
      </div>

      <LeadsTable initialData={initialData} />
    </div>
  );
}
