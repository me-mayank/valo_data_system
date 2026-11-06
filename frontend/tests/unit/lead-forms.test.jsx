import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StudentLeadForm from '@/components/forms/StudentLeadForm';
import CampusRequestForm from '@/components/forms/CampusRequestForm';
import { clientApi } from '@/lib/api/client';

const mockCourses = [
  { _id: 'c1', code: 'SN-101', title: 'ServiceNow Fundamentals', duration: '6 weeks' },
  { _id: 'c2', code: 'JR-101', title: 'Jira Software & Agile', duration: '4 weeks' },
];

describe('Phase 7: Lead Capture Forms', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
    localStorage.clear();
  });

  describe('StudentLeadForm component', () => {
    it('renders all required fields in full/contact variant', () => {
      render(<StudentLeadForm variant="contact" availableCourses={mockCourses} />);

      expect(screen.getByLabelText(/Full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Phone \/ WhatsApp/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/College name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Course and year/i)).toBeInTheDocument();
      expect(screen.getByText('COURSES INTERESTED IN')).toBeInTheDocument();
      expect(screen.getByLabelText(/I agree to be contacted/i)).toBeInTheDocument();

      // Extended contact variant fields are visible
      expect(screen.getByLabelText(/City/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Preferred mode/i)).toBeInTheDocument();
    });

    it('hides extended fields in popup variant', () => {
      render(<StudentLeadForm variant="popup" availableCourses={mockCourses} />);

      expect(screen.getByLabelText(/Full name/i)).toBeInTheDocument();
      expect(screen.queryByLabelText(/City/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/Preferred mode/i)).not.toBeInTheDocument();
    });

    it('shows validation errors when submitted empty', async () => {
      render(<StudentLeadForm variant="contact" availableCourses={mockCourses} />);

      fireEvent.click(screen.getByRole('button', { name: /Submit registration/i }));

      await waitFor(() => {
        expect(screen.getByText(/Full name must be at least 2 characters/i)).toBeInTheDocument();
      });
    });

    it('validates 10-digit Indian phone number starting with 6-9', async () => {
      render(<StudentLeadForm variant="contact" availableCourses={mockCourses} />);

      fireEvent.change(screen.getByLabelText(/Full name/i), { target: { value: 'Aarav Sharma' } });
      fireEvent.change(screen.getByLabelText(/Phone \/ WhatsApp/i), { target: { value: '12345' } });
      fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 'aarav@college.edu' } });
      fireEvent.change(screen.getByLabelText(/College name/i), { target: { value: 'IIT BHU' } });
      fireEvent.change(screen.getByLabelText(/Course and year/i), { target: { value: 'B.Tech 3rd year' } });

      fireEvent.click(screen.getByRole('button', { name: /Submit registration/i }));

      await waitFor(() => {
        expect(screen.getByText(/Enter a valid 10-digit Indian mobile number/i)).toBeInTheDocument();
      });
    });

    it('submits successfully and renders OK: REGISTRATION RECEIVED banner', async () => {
      const postSpy = vi.spyOn(clientApi, 'post').mockResolvedValueOnce({ ok: true });
      const onSuccessMock = vi.fn();

      render(
        <StudentLeadForm
          variant="contact"
          availableCourses={mockCourses}
          initialCourseId="c1"
          onSuccess={onSuccessMock}
        />
      );

      fireEvent.change(screen.getByLabelText(/Full name/i), { target: { value: 'Aarav Sharma' } });
      fireEvent.change(screen.getByLabelText(/Phone \/ WhatsApp/i), { target: { value: '9876543210' } });
      fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 'aarav@college.edu' } });
      fireEvent.change(screen.getByLabelText(/College name/i), { target: { value: 'IIT BHU' } });
      fireEvent.change(screen.getByLabelText(/Course and year/i), { target: { value: 'B.Tech 3rd year' } });

      // Accept consent
      fireEvent.click(screen.getByRole('checkbox', { name: /I agree to be contacted/i }));

      fireEvent.click(screen.getByRole('button', { name: /Submit registration/i }));

      await waitFor(() => {
        expect(postSpy).toHaveBeenCalledTimes(1);
        expect(screen.getByText('OK: REGISTRATION RECEIVED')).toBeInTheDocument();
        expect(onSuccessMock).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('CampusRequestForm component', () => {
    it('renders all required institutional fields', () => {
      render(<CampusRequestForm />);

      expect(screen.getByLabelText(/College \/ University Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Contact Person Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Designation \/ Role/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Official Email Address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Phone \/ Mobile Number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/I represent an academic institution/i)).toBeInTheDocument();
    });

    it('submits successfully and displays OK: INSTITUTIONAL ENQUIRY RECEIVED banner', async () => {
      const postSpy = vi.spyOn(clientApi, 'post').mockResolvedValueOnce({ ok: true });

      render(<CampusRequestForm />);

      fireEvent.change(screen.getByLabelText(/College \/ University Name/i), {
        target: { value: 'NIT Trichy' },
      });
      fireEvent.change(screen.getByLabelText(/Contact Person Name/i), {
        target: { value: 'Dr. R. Kumar' },
      });
      fireEvent.change(screen.getByLabelText(/Designation \/ Role/i), {
        target: { value: 'TPO Head' },
      });
      fireEvent.change(screen.getByLabelText(/Official Email Address/i), {
        target: { value: 'tpo@nitt.edu' },
      });
      fireEvent.change(screen.getByLabelText(/Phone \/ Mobile Number/i), {
        target: { value: '9876543210' },
      });

      fireEvent.click(screen.getByRole('checkbox', { name: /I represent an academic institution/i }));

      fireEvent.click(screen.getByRole('button', { name: /Submit institutional request/i }));

      await waitFor(() => {
        expect(postSpy).toHaveBeenCalledTimes(1);
        expect(screen.getByText('OK: INSTITUTIONAL ENQUIRY RECEIVED')).toBeInTheDocument();
      });
    });
  });
});

