import { apiGet } from '@/lib/api/server';
import SettingsForm from '@/components/admin/SettingsForm';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  let initialSettings = {};

  try {
    const data = await apiGet('/api/admin/settings', {
      forwardCookies: true,
      cache: 'no-store',
    });
    if (data) {
      initialSettings = data;
    }
  } catch (err) {
    console.error('Failed to load settings on server:', err);
  }

  return (
    <div>
      {/* Header */}
      <div className="border-b border-navy pb-4 mb-6">
        <span className="font-mono text-xs text-navy-soft uppercase">[SECTION 05]</span>
        <h1 className="font-mono text-2xl font-bold uppercase text-navy">
          Global System Settings
        </h1>
        <p className="font-sans text-xs text-navy-soft mt-1">
          Configure visitor engagement rules, modal trigger thresholds, and institutional contact endpoints.
        </p>
      </div>

      <SettingsForm initialSettings={initialSettings} />
    </div>
  );
}
