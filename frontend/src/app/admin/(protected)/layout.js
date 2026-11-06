import { requireAdminSession } from '@/lib/api/server';
import { AdminNav } from '@/components/admin/AdminNav';
import { SlowServerNotice } from '@/components/admin/SlowServerNotice';

export const dynamic = 'force-dynamic';

export default async function ProtectedAdminLayout({ children }) {
  const admin = await requireAdminSession();

  return (
    <div className="min-h-screen bg-cream text-navy flex flex-col font-sans">
      <AdminNav adminEmail={admin.email} />
      <SlowServerNotice />
      <main className="flex-1 px-4 md:px-8 py-6">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
      <footer className="border-t border-rule-soft px-4 md:px-8 py-3 text-center font-mono text-[11px] text-navy-soft">
        DATA VALO SYSTEM INTERNAL ADMINISTRATION · RESTRICTED ACCESS
      </footer>
    </div>
  );
}
