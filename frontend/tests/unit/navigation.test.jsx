import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import sitemap from '@/app/sitemap';
import robots from '@/app/robots';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/courses',
}));

describe('Phase 2 Navigation & Layout Primitives', () => {
  describe('Header (PRD §10.3)', () => {
    it('renders the DATA-VALO-SYSTEM wordmark', () => {
      render(<Header />);
      expect(screen.getByText('DATA-VALO-SYSTEM')).toBeInTheDocument();
    });

    it('renders all public navigation links', () => {
      render(<Header />);
      expect(screen.getByRole('link', { name: /^home$/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /^courses$/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /^for colleges$/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /^about$/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /^contact$/i })).toBeInTheDocument();
    });

    it('toggles mobile menu when MENU button is clicked', () => {
      render(<Header />);
      const menuButton = screen.getByRole('button', { name: /\[ menu \]/i });
      expect(menuButton).toBeInTheDocument();

      fireEvent.click(menuButton);
      expect(screen.getByRole('button', { name: /\[ close \]/i })).toBeInTheDocument();
      expect(screen.getByRole('navigation', { name: /mobile navigation/i })).toBeInTheDocument();
    });
  });

  describe('Footer (PRD §10.3)', () => {
    it('renders labelled columns [01] SITE, [02] CONTACT, [03] LEGAL', async () => {
      const resolved = await Footer();
      render(resolved);
      expect(screen.getByText('[01] SITE')).toBeInTheDocument();
      expect(screen.getByText('[02] CONTACT')).toBeInTheDocument();
      expect(screen.getByText('[03] LEGAL')).toBeInTheDocument();
    });

    it('renders metadata document reference', async () => {
      const resolved = await Footer();
      render(resolved);
      expect(screen.getByText(/DOC DV-WEB-01/i)).toBeInTheDocument();
    });

    it('contains privacy policy and terms links', async () => {
      const resolved = await Footer();
      render(resolved);
      expect(screen.getByRole('link', { name: /privacy policy/i })).toHaveAttribute('href', '/privacy');
      expect(screen.getByRole('link', { name: /terms/i })).toHaveAttribute('href', '/terms');
    });
  });

  describe('SEO Configurations (NFR-04)', () => {
    it('generates sitemap with all public pages and course slugs', () => {
      const items = sitemap();
      expect(items.length).toBeGreaterThanOrEqual(10);
      const urls = items.map((i) => i.url);
      expect(urls.some((u) => u.endsWith('/courses'))).toBe(true);
      expect(urls.some((u) => u.endsWith('/courses/servicenow-fundamentals'))).toBe(true);
      expect(urls.some((u) => u.endsWith('/colleges'))).toBe(true);
      expect(urls.some((u) => u.endsWith('/privacy'))).toBe(true);
    });

    it('generates robots.txt with disallow for admin and internal routes', () => {
      const config = robots();
      expect(config.rules[0].disallow).toContain('/admin/');
      expect(config.rules[0].disallow).toContain('/internal/');
      expect(config.sitemap).toContain('/sitemap.xml');
    });
  });
});
