// PRD §10.3 — Footer component
// Navy block, labelled columns ([01] SITE / [02] CONTACT / [03] LEGAL)
// Meta line: DATA VALO SYSTEM / DOC DV-WEB-01
// Settings & contact details loaded dynamically from API (Phase 6 acceptance criterion)

import Link from 'next/link';
import { apiGet } from '@/lib/api/server';

export default async function Footer() {
  let settings = null;
  try {
    settings = await apiGet('/api/public/settings', {
      tags: ['settings'],
      revalidate: 60,
      forwardCookies: false,
    });
  } catch {
    // Graceful fallback if backend is starting up
  }

  const email = settings?.contactEmail || 'info@datavalosystem.com';
  const phone = settings?.contactPhone || '+91 98765 43210';
  const instagramUrl = settings?.instagramUrl;
  const linkedinUrl = settings?.linkedinUrl;

  return (
    <footer className="bg-navy text-cream border-t-[2px] border-navy mt-auto">
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b-[1px] border-rule-soft">
          {/* Column 1: Site */}
          <div className="space-y-4">
            <h4 className="font-mono text-[12px] uppercase tracking-[0.08em] text-rule-soft">
              [01] SITE
            </h4>
            <ul className="list-none p-0 m-0 space-y-2 font-mono text-sm">
              <li>
                <Link
                  href="/"
                  className="hover:text-coral transition-colors duration-[100ms]"
                >
                  Home →
                </Link>
              </li>
              <li>
                <Link
                  href="/courses"
                  className="hover:text-coral transition-colors duration-[100ms]"
                >
                  Courses →
                </Link>
              </li>
              <li>
                <Link
                  href="/colleges"
                  className="hover:text-coral transition-colors duration-[100ms]"
                >
                  For Colleges →
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-coral transition-colors duration-[100ms]"
                >
                  About →
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-coral transition-colors duration-[100ms]"
                >
                  Contact & Register →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Contact */}
          <div className="space-y-4">
            <h4 className="font-mono text-[12px] uppercase tracking-[0.08em] text-rule-soft">
              [02] CONTACT
            </h4>
            <div className="space-y-2 font-mono text-sm">
              <p>
                <span className="text-[12px] text-rule-soft block uppercase tracking-[0.08em]">
                  EMAIL
                </span>
                <a
                  href={`mailto:${email}`}
                  className="hover:text-coral transition-colors duration-[100ms]"
                >
                  {email}
                </a>
              </p>
              <p>
                <span className="text-[12px] text-rule-soft block uppercase tracking-[0.08em]">
                  PHONE
                </span>
                <a
                  href={`tel:${phone.replace(/\s+/g, '')}`}
                  className="hover:text-coral transition-colors duration-[100ms]"
                >
                  {phone}
                </a>
              </p>
              {(instagramUrl || linkedinUrl) && (
                <div className="pt-2 flex items-center gap-3 font-mono text-xs">
                  {instagramUrl && (
                    <a
                      href={instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-coral underline underline-offset-2"
                    >
                      Instagram ↗
                    </a>
                  )}
                  {linkedinUrl && (
                    <a
                      href={linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-coral underline underline-offset-2"
                    >
                      LinkedIn ↗
                    </a>
                  )}
                </div>
              )}
              <p className="pt-1">
                <span className="text-[12px] text-rule-soft block uppercase tracking-[0.08em]">
                  PROGRAM STATUS
                </span>
                <span>Active client-gathering & campus talks</span>
              </p>
            </div>
          </div>

          {/* Column 3: Legal */}
          <div className="space-y-4">
            <h4 className="font-mono text-[12px] uppercase tracking-[0.08em] text-rule-soft">
              [03] LEGAL
            </h4>
            <ul className="list-none p-0 m-0 space-y-2 font-mono text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-coral transition-colors duration-[100ms]"
                >
                  Privacy Policy (DPDP Act, 2023) →
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-coral transition-colors duration-[100ms]"
                >
                  Terms & Conditions →
                </Link>
              </li>
              <li className="pt-2 text-xs text-rule-soft font-sans leading-relaxed">
                Registered in India. Utilitarian spec-sheet web interface.
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Document Meta Line (PRD §10.3) */}
        <div className="pt-6 flex flex-col sm:flex-row items-baseline justify-between font-mono text-[12px] text-rule-soft gap-2">
          <span>DATA VALO SYSTEM</span>
          <span>DOC DV-WEB-01 · REV 2026.11</span>
        </div>
      </div>
    </footer>
  );
}
