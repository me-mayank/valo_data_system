import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LeadsTable from '@/components/admin/LeadsTable';
import { clientApi } from '@/lib/api/client';

const sampleLeads = [
  {
    _id: 'lead-1',
    fullName: 'Aarav Sharma',
    email: 'aarav@iitbhu.ac.in',
    phone: '9876543210',
    college: 'IIT (BHU) Varanasi',
    courseYear: '3rd Year B.Tech',
    courses: [{ id: 'c1', title: 'ServiceNow Masterclass' }],
    source: 'qr-iit-bhu',
    formVariant: 'popup',
    consent: true,
    consentAt: '2026-11-06T12:00:00.000Z',
    createdAt: '2026-11-06T12:00:00.000Z',
  },
  {
    _id: 'lead-2',
    fullName: 'Pooja Verma',
    email: 'pooja@nit.ac.in',
    phone: '9876543211',
    college: 'NIT Trichy',
    courseYear: '4th Year B.Tech',
    courses: [{ id: 'c2', title: 'Jira Agile Lead' }],
    source: 'linkedin',
    formVariant: 'contact',
    consent: true,
    consentAt: '2026-11-06T13:00:00.000Z',
    createdAt: '2026-11-06T13:00:00.000Z',
  },
];

describe('Admin Leads Management UI (Phase 9 FR-ADM-03 / FR-ADM-04)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders student leads table with initial data and metadata', () => {
    render(
      <LeadsTable
        initialData={{
          items: sampleLeads,
          total: 2,
          page: 1,
          limit: 25,
          totalPages: 1,
        }}
      />
    );

    expect(screen.getByText('Aarav Sharma')).toBeInTheDocument();
    expect(screen.getByText('aarav@iitbhu.ac.in')).toBeInTheDocument();
    expect(screen.getByText('IIT (BHU) Varanasi')).toBeInTheDocument();
    expect(screen.getByText('ServiceNow Masterclass')).toBeInTheDocument();
    expect(screen.getByText('qr-iit-bhu')).toBeInTheDocument();

    expect(screen.getByText('Pooja Verma')).toBeInTheDocument();
    expect(screen.getByText('pooja@nit.ac.in')).toBeInTheDocument();
    expect(screen.getByText('NIT Trichy')).toBeInTheDocument();

    expect(screen.getByText(/SHOWING 2 OF 2 LEADS/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /\[ EXPORT CSV \]/i })).toBeInTheDocument();
  });

  it('opens inspect dialog with full detail when clicking inspect', async () => {
    render(
      <LeadsTable
        initialData={{
          items: sampleLeads,
          total: 2,
          page: 1,
          limit: 25,
          totalPages: 1,
        }}
      />
    );

    const inspectButtons = screen.getAllByRole('button', { name: 'INSPECT' });
    fireEvent.click(inspectButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('STUDENT LEAD RECORD')).toBeInTheDocument();
      expect(screen.getByText('ACCEPTED: YES')).toBeInTheDocument();
      expect(screen.getAllByText('3rd Year B.Tech').length).toBeGreaterThan(0);
    });
  });

  it('opens delete confirmation modal when clicking delete button', async () => {
    render(
      <LeadsTable
        initialData={{
          items: sampleLeads,
          total: 2,
          page: 1,
          limit: 25,
          totalPages: 1,
        }}
      />
    );

    const deleteButtons = screen.getAllByRole('button', { name: 'DELETE' });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('CONFIRM DELETION')).toBeInTheDocument();
      expect(
        screen.getByText(/Are you sure you want to permanently delete the student lead for/i)
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'CONFIRM DELETE' })).toBeInTheDocument();
    });
  });

  it('applies search filters and triggers clientApi.get with search query', async () => {
    const getSpy = vi.spyOn(clientApi, 'get').mockResolvedValueOnce({
      items: [sampleLeads[0]],
      total: 1,
      page: 1,
      limit: 25,
      totalPages: 1,
    });

    render(
      <LeadsTable
        initialData={{
          items: sampleLeads,
          total: 2,
          page: 1,
          limit: 25,
          totalPages: 1,
        }}
      />
    );

    const searchInput = screen.getByPlaceholderText(/Name, email, phone, college.../i);
    fireEvent.change(searchInput, { target: { value: 'Aarav' } });

    const applyButton = screen.getByRole('button', { name: /APPLY FILTERS/i });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(getSpy).toHaveBeenCalledWith(expect.stringContaining('search=Aarav'));
    });
  });
});
