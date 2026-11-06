import { describe, it, expect } from 'vitest';
import {
  initialPopupState,
  isRouteSuppressed,
  shouldAutoShow,
  getPopupMode,
  onDismiss,
  onSubmit,
  onOpen,
  onClose,
} from '@/lib/popup/state';

const defaultSettings = {
  popupEnabled: true,
  popupDelaySeconds: 8,
  popupScrollPercent: 40,
  popupReappearSeconds: 120,
  popupMaxDismissals: 5,
};

describe('Phase 8: Popup Engine State Machine (FR-POP-01 to FR-POP-08)', () => {
  describe('Route Suppression (FR-POP-05)', () => {
    it.each([
      ['/contact', true],
      ['/contact?src=iit', true],
      ['/privacy', true],
      ['/terms', true],
      ['/admin', true],
      ['/admin/courses', true],
      ['/admin/leads', true],
      ['/internal/revalidate', true],
      ['/', false],
      ['/courses', false],
      ['/courses/servicenow-fundamentals', false],
      ['/colleges', false],
      ['/about', false],
    ])('evaluates suppression correctly for %s -> %s', (path, expected) => {
      expect(isRouteSuppressed(path)).toBe(expected);
    });
  });

  describe('Auto-Trigger Evaluation (FR-POP-01 & FR-POP-02)', () => {
    const baseParams = {
      state: initialPopupState(),
      settings: defaultSettings,
      pathname: '/',
      now: 1000000,
      timeOnPageMs: 0,
      scrollPercent: 0,
    };

    it('does not trigger immediately on fresh page load (0s, 0% scroll)', () => {
      expect(shouldAutoShow(baseParams)).toBe(false);
    });

    it('triggers when 8s time on page is reached', () => {
      expect(
        shouldAutoShow({
          ...baseParams,
          timeOnPageMs: 8000,
        })
      ).toBe(true);
    });

    it('triggers when 40% scroll depth is reached before 8s', () => {
      expect(
        shouldAutoShow({
          ...baseParams,
          timeOnPageMs: 2000,
          scrollPercent: 40,
        })
      ).toBe(true);
    });

    it('respects custom delay and scroll settings from admin', () => {
      const customSettings = {
        ...defaultSettings,
        popupDelaySeconds: 15,
        popupScrollPercent: 60,
      };

      // 10s is not enough for 15s setting
      expect(
        shouldAutoShow({
          ...baseParams,
          settings: customSettings,
          timeOnPageMs: 10000,
          scrollPercent: 30,
        })
      ).toBe(false);

      // 60% scroll triggers with custom settings
      expect(
        shouldAutoShow({
          ...baseParams,
          settings: customSettings,
          timeOnPageMs: 1000,
          scrollPercent: 60,
        })
      ).toBe(true);
    });

    it('never auto-triggers on suppressed routes even if time or scroll met', () => {
      expect(
        shouldAutoShow({
          ...baseParams,
          pathname: '/contact',
          timeOnPageMs: 10000,
          scrollPercent: 80,
        })
      ).toBe(false);
    });

    it('never auto-triggers when popupEnabled is false', () => {
      expect(
        shouldAutoShow({
          ...baseParams,
          settings: { ...defaultSettings, popupEnabled: false },
          timeOnPageMs: 10000,
          scrollPercent: 50,
        })
      ).toBe(false);
    });

    it('blocks auto-trigger during 120s cooldown period after dismissal', () => {
      const dismissedState = onDismiss(initialPopupState(), 1000000);

      // 60s after dismissal (cooldown not expired)
      expect(
        shouldAutoShow({
          ...baseParams,
          state: dismissedState,
          now: 1060000,
          timeOnPageMs: 10000,
          scrollPercent: 50,
        })
      ).toBe(false);

      // 121s after dismissal (cooldown expired)
      expect(
        shouldAutoShow({
          ...baseParams,
          state: dismissedState,
          now: 1121000,
          timeOnPageMs: 10000,
          scrollPercent: 50,
        })
      ).toBe(true);
    });
  });

  describe('Fatigue Threshold & Mode Switching (FR-POP-03)', () => {
    it('switches to tab mode after 5 dismissals', () => {
      let state = initialPopupState();
      for (let i = 1; i <= 5; i++) {
        state = onDismiss(state, 1000000 + i * 150000);
      }

      expect(state.dismissCount).toBe(5);

      // Auto-show is permanently disabled for modal
      expect(
        shouldAutoShow({
          state,
          settings: defaultSettings,
          pathname: '/',
          now: 2000000,
          timeOnPageMs: 20000,
          scrollPercent: 90,
        })
      ).toBe(false);

      // Mode is 'tab' on eligible pages
      expect(
        getPopupMode({
          state,
          settings: defaultSettings,
          pathname: '/courses',
        })
      ).toBe('tab');

      // Mode is 'hidden' on suppressed pages
      expect(
        getPopupMode({
          state,
          settings: defaultSettings,
          pathname: '/contact',
        })
      ).toBe('hidden');
    });

    it('re-enters modal mode if explicitly opened via onOpen (user clicked sticky tab or CTA)', () => {
      let state = initialPopupState();
      state.dismissCount = 5;

      const openState = onOpen(state);
      expect(
        getPopupMode({
          state: openState,
          settings: defaultSettings,
          pathname: '/courses',
        })
      ).toBe('modal');
    });
  });

  describe('Conversion Suppression (FR-POP-04)', () => {
    it('permanently suppresses all popups and tabs once submitted is true', () => {
      const submittedState = onSubmit(initialPopupState());
      expect(submittedState.submitted).toBe(true);

      // shouldAutoShow is false
      expect(
        shouldAutoShow({
          state: submittedState,
          settings: defaultSettings,
          pathname: '/',
          now: 5000000,
          timeOnPageMs: 20000,
          scrollPercent: 90,
        })
      ).toBe(false);

      // getPopupMode is always 'hidden'
      expect(
        getPopupMode({
          state: submittedState,
          settings: defaultSettings,
          pathname: '/',
        })
      ).toBe('hidden');

      expect(
        getPopupMode({
          state: submittedState,
          settings: defaultSettings,
          pathname: '/courses',
        })
      ).toBe('hidden');
    });
  });
});

