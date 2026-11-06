import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CampusRequestsTable from '@/components/admin/CampusRequestsTable';
import { clientApi } from '@/lib/api/client';

const sampleRequests = [
  {
    _id: 'req-1',
    institution: 'Indian Institute of Technology, Bombay',
    contactPerson: 'Prof. Sharma',
    designation: 'HOD Computer Science',
    email: 'sharma@iitb.ac.in',
    phone: '9876543210',
    approxStudents: '120+',
    preferredFormat: 'on-campus',
    message: 'We would like to conduct a 2-day hands-on workshop on ServiceNow.',
    source: 'campus-fair',
    consent: true,
    createdAt: '2026-11-06T10:00:00.000Z',
  },
];

describe('Admin Campus Requests UI (Phase 9 FR-ADM-05)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders campus requests table with initial inquiries', () => {
    render(
      <CampusRequestsTable
        initialData={{
          items: sampleRequests,
          total: 1,
          page: 1,
          limit: 25,
          totalPages: 1,
        }}
      />
    );

    expect(screen.getByText('Indian Institute of Technology, Bombay')).toBeInTheDocument();
    expect(screen.getByText('Prof. Sharma')).toBeInTheDocument();
    expect(screen.getByText('HOD Computer Science')).toBeInTheDocument();
    expect(screen.getByText('sharma@iitb.ac.in')).toBeInTheDocument();
    expect(screen.getByText(/SHOWING 1 OF 1 INQUIRIES/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /\[ EXPORT CSV \]/i })).toBeInTheDocument();
  });

  it('opens inspect dialog displaying full proposal message when clicking inspect', async () => {
    render(
      <CampusRequestsTable
        initialData={{
          items: sampleRequests,
          total: 1,
          page: 1,
          limit: 25,
          totalPages: 1,
        }}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'INSPECT' }));

    await waitFor(() => {
      expect(screen.getByText('CAMPUS INQUIRY RECORD')).toBeInTheDocument();
      expect(screen.getByText(/2-day hands-on workshop on ServiceNow/i)).toBeInTheDocument();
      expect(screen.getByText('CONSENT: YES')).toBeInTheDocument();
    });
  });

  it('opens delete confirmation modal when clicking delete button', async () => {
    render(
      <CampusRequestsTable
        initialData={{
          items: sampleRequests,
          total: 1,
          page: 1,
          limit: 25,
          totalPages: 1,
        }}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'DELETE' }));

    await waitFor(() => {
      expect(screen.getByText('CONFIRM INQUIRY DELETION')).toBeInTheDocument();
      expect(
        screen.getByText(/permanently delete the institutional inquiry from/i)
      ).toBeInTheDocument();
    });
  });

  it('filters requests by search input', async () => {
    const getSpy = vi.spyOn(clientApi, 'get').mockResolvedValueOnce({
      items: sampleRequests,
      total: 1,
      page: 1,
      limit: 25,
      totalPages: 1,
    });

    render(
      <CampusRequestsTable
        initialData={{
          items: sampleRequests,
          total: 1,
          page: 1,
          limit: 25,
          totalPages: 1,
        }}
      />
    );

    const input = screen.getByPlaceholderText(/Institution, contact person, email, phone/i);
    fireEvent.change(input, { target: { value: 'Bombay' } });

    fireEvent.click(screen.getByRole('button', { name: /APPLY FILTERS/i }));

    await waitFor(() => {
      expect(getSpy).toHaveBeenCalledWith(expect.stringContaining('search=Bombay'));
    });
  });
});

