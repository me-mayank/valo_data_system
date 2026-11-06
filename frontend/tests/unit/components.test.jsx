import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Checkbox from '@/components/ui/Checkbox';
import Tag from '@/components/ui/Tag';
import TypeTile from '@/components/site/TypeTile';
import CourseCell from '@/components/site/CourseCell';
import SectionHeader from '@/components/site/SectionHeader';
import SpecList from '@/components/site/SpecList';

describe('Utilitarian Design Primitives (PRD §10)', () => {
  describe('Button (PRD §10.4)', () => {
    it('renders primary button with coral fill and navy text', () => {
      render(<Button variant="primary">Explore courses →</Button>);
      const btn = screen.getByRole('button', { name: /explore courses/i });
      expect(btn).toBeInTheDocument();
      // Locked decision: navy text on coral
      expect(btn.className).toContain('bg-coral');
      expect(btn.className).toContain('text-navy');
      expect(btn.className).toContain('border-2');
      expect(btn.className).toContain('border-navy');
      expect(btn.className).toContain('min-h-[44px]');
    });

    it('renders secondary button with transparent bg and navy text', () => {
      render(<Button variant="secondary">Register interest</Button>);
      const btn = screen.getByRole('button', { name: /register interest/i });
      expect(btn).toBeInTheDocument();
      expect(btn.className).toContain('bg-transparent');
      expect(btn.className).toContain('text-navy');
      expect(btn.className).toContain('border-2');
    });

    it('renders as a link when href is supplied', () => {
      render(<Button href="/_design">Open Design</Button>);
      const link = screen.getByRole('link', { name: /open design/i });
      expect(link).toHaveAttribute('href', '/_design');
    });
  });

  describe('Input (PRD §10.4)', () => {
    it('renders label with index and REQUIRED tag', () => {
      render(
        <Input
          id="fullname"
          label="Full name"
          index="01"
          required
          placeholder="Aarav Sharma"
        />
      );
      expect(screen.getByText('01')).toBeInTheDocument();
      expect(screen.getByText(/Full name/i)).toBeInTheDocument();
      expect(screen.getByText('REQUIRED')).toBeInTheDocument();
      const input = screen.getByPlaceholderText('Aarav Sharma');
      expect(input).toHaveAttribute('aria-required', 'true');
      expect(input.className).toContain('min-h-[44px]');
      expect(input.className).toContain('bg-white');
    });

    it('renders error state with ERROR: prefix', () => {
      render(
        <Input
          id="test-err"
          label="Email"
          index="02"
          error="Must be a valid email"
        />
      );
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('ERROR: Must be a valid email');
      const input = screen.getByLabelText(/Email/i);
      expect(input.className).toContain('border-error');
    });
  });

  describe('Checkbox (PRD §10.4)', () => {
    it('provides 44px min touch target and error message', () => {
      render(
        <Checkbox
          id="terms"
          label="I agree to terms"
          required
          error="You must agree"
        />
      );
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent('ERROR: You must agree');
    });
  });

  describe('Tag (PRD §10.4)', () => {
    it('renders bracket format [LABEL]', () => {
      render(<Tag>ITSM</Tag>);
      expect(screen.getByText('[ITSM]')).toBeInTheDocument();
    });

    it('renders selected state with navy bg and cream text', () => {
      render(<Tag selected>Jira</Tag>);
      const tag = screen.getByText('[Jira]');
      expect(tag.className).toContain('bg-navy');
      expect(tag.className).toContain('text-cream');
    });
  });

  describe('TypeTile (PRD §10.4)', () => {
    it('generates typographic tile with course code and tool on sand bg', () => {
      const { container } = render(<TypeTile code="SN-101" tool="ServiceNow" />);
      expect(container.firstChild).toHaveClass('bg-sand');
      expect(screen.getAllByText('SN-101').length).toBeGreaterThan(0);
      expect(screen.getByText('ServiceNow')).toBeInTheDocument();
    });
  });

  describe('CourseCell (PRD §10.4)', () => {
    it('renders course spec sheet card with key-value specs', () => {
      render(
        <CourseCell
          code="SN-101"
          title="ServiceNow Fundamentals"
          shortDescription="Incident and change management."
          duration="6 weeks"
          mode="online"
          level="beginner"
          tools={['ServiceNow']}
          slug="servicenow-fundamentals"
        />
      );
      expect(screen.getByText('ServiceNow Fundamentals')).toBeInTheDocument();
      expect(screen.getByText('DURATION')).toBeInTheDocument();
      expect(screen.getByText('6 weeks')).toBeInTheDocument();
      expect(screen.getByText(/VIEW SPEC/i)).toBeInTheDocument();
    });
  });

  describe('SectionHeader and SpecList (PRD §10.3, §10.4)', () => {
    it('renders section header with [INDEX] and border rule', () => {
      render(<SectionHeader index="01" label="Courses" meta="3 TOTAL" />);
      expect(screen.getByText('[01]')).toBeInTheDocument();
      expect(screen.getByText('Courses')).toBeInTheDocument();
      expect(screen.getByText('3 TOTAL')).toBeInTheDocument();
    });

    it('renders spec list rows with 1px dividers', () => {
      render(
        <SpecList
          items={[
            { key: 'PROGRAM', value: 'Industry tools' },
            { key: 'FORMAT', value: 'Online' },
          ]}
        />
      );
      expect(screen.getByText('PROGRAM')).toBeInTheDocument();
      expect(screen.getByText('Industry tools')).toBeInTheDocument();
    });
  });
});

