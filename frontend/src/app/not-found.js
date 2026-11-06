// FR: NFR-02 (responsive), NFR-03 (accessibility)
// 404 page — Utilitarian style: no decorative elements

import Link from 'next/link';

export const metadata = {
  title: '404 — Page Not Found | Data Valo System',
};

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-cream)',
        color: 'var(--color-navy)',
        fontFamily: 'var(--font-mono)',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <p
        style={{
          fontSize: '0.75rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--color-navy-soft)',
          marginBottom: '1rem',
        }}
      >
        ERROR 404
      </p>
      <h1
        style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 600,
          fontSize: 'clamp(1.75rem, 5vw, 3.5rem)',
          lineHeight: 1.2,
          marginBottom: '1.5rem',
          margin: '0 0 1.5rem 0',
        }}
      >
        Page not found.
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '1rem',
          lineHeight: 1.5,
          color: 'var(--color-navy-soft)',
          maxWidth: '480px',
          marginBottom: '2rem',
        }}
      >
        The page you requested does not exist or has been moved.
      </p>
      <Link
        href="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.875rem',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          color: 'var(--color-navy)',
          backgroundColor: 'var(--color-coral)',
          border: '2px solid var(--color-navy)',
          padding: '0.75rem 1.5rem',
          minHeight: '44px',
          textDecoration: 'none',
        }}
      >
        Return home →
      </Link>
    </main>
  );
}

