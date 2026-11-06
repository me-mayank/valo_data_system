import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StickyRegisterTab from '@/components/popup/StickyRegisterTab';
import LeadDialog from '@/components/popup/LeadDialog';
import {
  loadStoredPopupState,
  persistDismissal,
  persistSubmission,
} from '@/lib/popup/storage';
import {
  openLeadForm,
  markLeadSubmitted,
  POPUP_WINDOW_EVENTS,
} from '@/lib/popup/events';

describe('Phase 8: Popup UI Primitives & Storage Adapter', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    // Clear cookies
    document.cookie = 'dv_submitted=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    vi.restoreAllMocks();
  });

  describe('StickyRegisterTab component (FR-POP-03)', () => {
    it('renders the utilitarian sticky tab button', () => {
      render(<StickyRegisterTab />);

      const tabBtn = screen.getByRole('button', { name: /Register interest in courses/i });
      expect(tabBtn).toBeInTheDocument();
      expect(screen.getByText(/\[ REGISTER INTEREST → \]/i)).toBeInTheDocument();
      expect(tabBtn.className).toContain('bg-coral');
      expect(tabBtn.className).toContain('text-navy');
      expect(tabBtn.className).toContain('min-h-[44px]');
    });

    it('dispatches openLeadForm when clicked', () => {
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
      render(<StickyRegisterTab />);

      const tabBtn = screen.getByRole('button', { name: /Register interest in courses/i });
      fireEvent.click(tabBtn);

      expect(dispatchSpy).toHaveBeenCalled();
      const event = dispatchSpy.mock.calls[0][0];
      expect(event.type).toBe(POPUP_WINDOW_EVENTS.OPEN_MODAL);
    });
  });

  describe('LeadDialog modal component (FR-POP-06)', () => {
    it('renders dialog panel with FORM DV-01 / REGISTER INTEREST header when open', () => {
      render(<LeadDialog open={true} onOpenChange={() => {}} />);

      expect(screen.getByText(/FORM DV-01/i)).toBeInTheDocument();
      expect(screen.getByText(/REGISTER INTEREST/i)).toBeInTheDocument();
      // Popup variant fields are present
      expect(screen.getByLabelText(/Full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Phone \/ WhatsApp/i)).toBeInTheDocument();
    });

    it('calls onOpenChange(false) when close button is clicked', () => {
      const onOpenChange = vi.fn();
      render(<LeadDialog open={true} onOpenChange={onOpenChange} />);

      const closeBtn = screen.getByRole('button', { name: /Close dialog/i });
      fireEvent.click(closeBtn);

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Storage Adapter & Cookie Persistence (FR-POP-04)', () => {
    it('records dismiss count and timestamp in localStorage', () => {
      const initial = loadStoredPopupState();
      expect(initial.dismissCount).toBe(0);
      expect(initial.lastDismissedAt).toBeNull();

      const after1 = persistDismissal(initial, 1793992000000);
      expect(after1.dismissCount).toBe(1);
      expect(after1.lastDismissedAt).toBe(1793992000000);

      // Re-read from storage
      const reloaded = loadStoredPopupState();
      expect(reloaded.dismissCount).toBe(1);
      expect(reloaded.lastDismissedAt).toBe(1793992000000);
    });

    it('records conversion in localStorage and document.cookie', () => {
      const initial = loadStoredPopupState();
      expect(initial.submitted).toBe(false);

      const afterSubmit = persistSubmission(initial);
      expect(afterSubmit.submitted).toBe(true);

      expect(localStorage.getItem('dv_submitted')).toBe('true');
      expect(document.cookie).toContain('dv_submitted=true');

      // Re-read confirms submitted is true
      const reloaded = loadStoredPopupState();
      expect(reloaded.submitted).toBe(true);
    });
  });

  describe('Global Event Dispatchers (FR-POP-07)', () => {
    it('openLeadForm dispatches custom event with courseId', () => {
      const listener = vi.fn();
      window.addEventListener(POPUP_WINDOW_EVENTS.OPEN_MODAL, listener);

      openLeadForm({ courseId: 'c123' });

      expect(listener).toHaveBeenCalledTimes(1);
      const customEvent = listener.mock.calls[0][0];
      expect(customEvent.detail.courseId).toBe('c123');

      window.removeEventListener(POPUP_WINDOW_EVENTS.OPEN_MODAL, listener);
    });

    it('markLeadSubmitted persists submission and dispatches event', () => {
      const listener = vi.fn();
      window.addEventListener(POPUP_WINDOW_EVENTS.LEAD_SUBMITTED, listener);

      markLeadSubmitted();

      expect(listener).toHaveBeenCalledTimes(1);
      expect(localStorage.getItem('dv_submitted')).toBe('true');

      window.removeEventListener(POPUP_WINDOW_EVENTS.LEAD_SUBMITTED, listener);
    });
  });
});

