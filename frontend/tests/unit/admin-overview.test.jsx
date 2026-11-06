import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OverviewDashboard from '@/components/admin/OverviewDashboard';

const sampleOverview = {
  totalLeads: 42,
  leadsLast7Days: 15,
  publishedCoursesCount: 6,
  campusRequestCount: 4,
  topSources: [
    { source: 'qr-iit-bhu', count: 18 },
    { source: 'linkedin', count: 12 },
  ],
  topCourses: [
    { courseId: 'c1', title: 'ServiceNow Masterclass', count: 24 },
    { courseId: 'c2', title: 'Jira Agile Lead', count: 18 },
  ],
  latestLeads: [
    {
      _id: 'lead-1',
      fullName: 'Aarav Sharma',
      email: 'aarav@iitbhu.ac.in',
      college: 'IIT (BHU) Varanasi',
      courses: [{ id: 'c1', title: 'ServiceNow Masterclass' }],
      source: 'qr-iit-bhu',
      createdAt: '2026-11-06T12:00:00.000Z',
    },
  ],
};

describe('Admin Operations Overview & Campaign Link Generator UI (Phase 9 FR-ADM-06 / FR-ADM-07)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders all 4 overview metric summary tiles', () => {
    render(<OverviewDashboard initialData={sampleOverview} />);

    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText(/TOTAL LEADS/i)).toBeInTheDocument();

    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText(/LAST 7 DAYS/i)).toBeInTheDocument();

    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText(/ACTIVE COURSES/i)).toBeInTheDocument();

    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText(/CAMPUS INQUIRIES/i)).toBeInTheDocument();
  });

  it('renders top sources and top courses rankings', () => {
    render(<OverviewDashboard initialData={sampleOverview} />);

    expect(screen.getAllByText('qr-iit-bhu').length).toBeGreaterThan(0);
    expect(screen.getByText('18 leads')).toBeInTheDocument();

    expect(screen.getAllByText('ServiceNow Masterclass').length).toBeGreaterThan(0);
    expect(screen.getByText('24 inquiries')).toBeInTheDocument();
  });

  it('renders recent leads table with quick view inspect modal', async () => {
    render(<OverviewDashboard initialData={sampleOverview} />);

    expect(screen.getByText('Aarav Sharma')).toBeInTheDocument();
    expect(screen.getByText('IIT (BHU) Varanasi')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'VIEW' }));

    await waitFor(() => {
      expect(screen.getByText('STUDENT LEAD RECORD')).toBeInTheDocument();
      expect(screen.getByText('aarav@iitbhu.ac.in')).toBeInTheDocument();
    });
  });

  it('generates campaign tracking URL slug and copies to clipboard (FR-ADM-07)', async () => {
    const clipboardSpy = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: clipboardSpy,
      },
    });

    render(<OverviewDashboard initialData={sampleOverview} />);

    const nameInput = screen.getByPlaceholderText(/e\.g\. IIT BHU Placement 2026/i);
    fireEvent.change(nameInput, { target: { value: 'IIT BHU Placement 2026!' } });

    expect(screen.getByText('iit-bhu-placement-2026')).toBeInTheDocument();

    const copyBtn = screen.getByRole('button', { name: 'COPY' });
    expect(copyBtn).not.toBeDisabled();

    fireEvent.click(copyBtn);

    await waitFor(() => {
      expect(clipboardSpy).toHaveBeenCalledWith(
        expect.stringContaining('/?src=iit-bhu-placement-2026')
      );
      expect(screen.getByRole('button', { name: 'COPIED!' })).toBeInTheDocument();
    });
  });
});
