'use client';

// PRD §10.3 & §6.3 — Header component
// Mono wordmark DATA-VALO-SYSTEM on left; nav as row of bordered cells
// Active page: 3px coral bottom bar; Register interest button on far right
// Mobile: MENU text button opening full-width list of numbered rows

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Button from '@/components/ui/Button';

const NAV_LINKS = [
  { href: '/', label: 'Home', index: '01' },
  { href: '/courses', label: 'Courses', index: '02' },
  { href: '/colleges', label: 'For Colleges', index: '03' },
  { href: '/about', label: 'About', index: '04' },
  { href: '/contact', label: 'Contact', index: '05' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-30 bg-cream border-b-[1px] border-navy">
      <div className="max-w-[1200px] mx-auto flex items-stretch justify-between min-h-[56px]">
        {/* Wordmark (PRD §10.3) */}
        <div className="flex items-center px-4 border-r-[1px] border-navy">
          <Link
            href="/"
            className="font-mono font-semibold text-sm tracking-[0.08em] text-navy uppercase select-none hover:text-navy-soft transition-colors duration-[100ms]"
          >
            DATA-VALO-SYSTEM
          </Link>
        </div>

        {/* Desktop Navigation (bordered cells) */}
        <nav
          aria-label="Main Navigation"
          className="hidden md:flex items-stretch flex-1 justify-start"
        >
          {NAV_LINKS.map(({ href, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={[
                  'relative flex items-center px-4 border-r-[1px] border-navy',
                  'font-mono text-[12px] uppercase tracking-[0.08em] text-navy',
                  'hover:bg-sand transition-colors duration-[100ms]',
                  active ? 'font-semibold' : 'font-normal',
                ].join(' ')}
              >
                {label}
                {/* 3px coral bar under active page (PRD §10.3) */}
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-0 right-0 h-[3px] bg-coral"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA button (Desktop) */}
        <div className="hidden md:flex items-center px-3 border-l-[1px] border-navy">
          <Button
            as={Link}
            href="/contact"
            variant="primary"
            className="text-[12px] min-h-[40px] px-4"
          >
            Register Interest
          </Button>
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex md:hidden items-center border-l-[1px] border-navy">
          <button
            type="button"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="px-4 py-3 font-mono text-[12px] uppercase tracking-[0.08em] text-navy bg-transparent hover:bg-sand min-h-[56px] cursor-pointer transition-colors duration-[100ms]"
          >
            {mobileMenuOpen ? '[ CLOSE ]' : '[ MENU ]'}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (numbered stacked rows per PRD §10.3) */}
      {mobileMenuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobile Navigation"
          className="md:hidden border-t-[1px] border-navy bg-cream"
        >
          <ul className="list-none p-0 m-0 divide-y-[1px] divide-navy">
            {NAV_LINKS.map(({ href, label, index }) => {
              const active = isActive(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={[
                      'flex items-center justify-between px-4 py-3',
                      'font-mono text-sm uppercase tracking-[0.08em] text-navy',
                      'hover:bg-sand transition-colors duration-[100ms]',
                      active ? 'bg-sand font-semibold' : '',
                    ].join(' ')}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-[12px] text-navy-soft">{index}</span>
                      <span>{label}</span>
                    </span>
                    {active ? (
                      <span className="text-[12px] text-coral font-bold">[ACTIVE]</span>
                    ) : (
                      <span className="text-navy-soft">→</span>
                    )}
                  </Link>
                </li>
              );
            })}
            <li className="p-4 bg-sand">
              <Button
                as={Link}
                href="/contact"
                variant="primary"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full justify-center min-h-[44px]"
              >
                Register Interest →
              </Button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
