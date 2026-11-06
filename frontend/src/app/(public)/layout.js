import { Suspense } from 'react';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import SourceTracker from '@/components/site/SourceTracker';
import PopupController from '@/components/popup/PopupController';
import { apiGet } from '@/lib/api/server';

export default async function PublicLayout({ children }) {
  let settings = {};
  try {
    settings = await apiGet('/api/public/settings', {
      tags: ['settings'],
      revalidate: 60,
      forwardCookies: false,
    });
  } catch {
    // Graceful fallback if backend is waking up
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream text-navy">
      <Suspense fallback={null}>
        <SourceTracker />
      </Suspense>
      <Header />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
      <PopupController settings={settings} />
    </div>
  );
}
