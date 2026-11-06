'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clientApi } from '@/lib/api/client';

const NAV_ITEMS = [
  { label: '[01] OVERVIEW', href: '/admin/overview' },
  { label: '[02] COURSES', href: '/admin/courses' },
  { label: '[03] LEADS', href: '/admin/leads' },
  { label: '[04] CAMPUS REQUESTS', href: '/admin/campus-requests' },
  { label: '[05] SETTINGS', href: '/admin/settings' },
];

export function AdminNav({ adminEmail }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await clientApi.post('/api/admin/auth/logout');
    } catch {
      // Ignore network errors on logout and proceed with client redirect
    }
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div>
      {/* Top Admin Header Bar */}
      <header className="border-b border-navy bg-navy text-cream px-4 md:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/courses" className="font-mono text-sm font-bold tracking-widest text-cream uppercase">
            DATA VALO SYSTEM
          </Link>
          <span className="bg-coral px-2 py-0.5 font-mono text-[10px] font-bold text-navy">
            ADMIN CONSOLE
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-sand hidden sm:inline">
            OPERATOR: <span className="text-white font-bold">{adminEmail}</span>
          </span>
          <button
            onClick={handleLogout}
            className="border border-cream/30 hover:border-coral hover:text-coral px-2.5 py-1 text-xs transition-colors"
          >
            [LOGOUT]
          </button>
        </div>
      </header>

      {/* Secondary Navigation Strip */}
      <nav aria-label="Admin Navigation" className="border-b border-navy bg-sand/30 overflow-x-auto">
        <div className="flex items-center px-4 md:px-8 font-mono text-xs">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/admin/overview' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`py-2.5 px-4 border-r border-rule-soft whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-cream text-navy font-bold border-b-2 border-b-coral -mb-[1px]'
                    : 'text-navy-soft hover:text-navy hover:bg-sand/60'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
