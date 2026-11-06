import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SettingsForm from '@/components/admin/SettingsForm';
import { clientApi } from '@/lib/api/client';

const sampleSettings = {
  popupEnabled: true,
  popupDelaySeconds: 8,
  popupScrollPercent: 40,
  popupReappearSeconds: 120,
  popupMaxDismissals: 5,
  contactEmail: 'admissions@datavalosystem.com',
  contactPhone: '+91 98765 43210',
  instagramUrl: 'https://instagram.com/datavalo',
  linkedinUrl: 'https://linkedin.com/company/datavalo',
};

describe('Admin Global Settings UI (Phase 9)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders settings form populated with current config values', () => {
    render(<SettingsForm initialSettings={sampleSettings} />);

    expect(screen.getByLabelText(/Lead Capture Popup Enabled Globally/i)).toBeChecked();
    expect(screen.getByLabelText(/Time Trigger Delay/i)).toHaveValue(8);
    expect(screen.getByLabelText(/Scroll Trigger Depth/i)).toHaveValue(40);
    expect(screen.getByLabelText(/Dismissal Cooldown/i)).toHaveValue(120);
    expect(screen.getByLabelText(/Fatigue Threshold/i)).toHaveValue(5);
    expect(screen.getByLabelText(/Official Admissions Email/i)).toHaveValue(
      'admissions@datavalosystem.com'
    );
    expect(screen.getByLabelText(/Direct Phone Helpline/i)).toHaveValue('+91 98765 43210');
  });

  it('submits updated settings via clientApi.put and displays success notice', async () => {
    const putSpy = vi.spyOn(clientApi, 'put').mockResolvedValueOnce({
      ...sampleSettings,
      popupDelaySeconds: 12,
    });

    render(<SettingsForm initialSettings={sampleSettings} />);

    const delayInput = screen.getByLabelText(/Time Trigger Delay/i);
    fireEvent.change(delayInput, { target: { value: '12' } });

    const saveButton = screen.getByRole('button', { name: /SAVE SETTINGS/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(putSpy).toHaveBeenCalledWith(
        '/api/admin/settings',
        expect.objectContaining({
          popupDelaySeconds: 12,
          contactEmail: 'admissions@datavalosystem.com',
        })
      );
      expect(screen.getByText(/Settings saved successfully/i)).toBeInTheDocument();
    });
  });
});

