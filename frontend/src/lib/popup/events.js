import { persistSubmission, loadStoredPopupState } from './storage';

export const POPUP_WINDOW_EVENTS = {
  OPEN_MODAL: 'datavalo:open-lead-modal',
  LEAD_SUBMITTED: 'datavalo:lead-submitted',
};

/**
 * Triggers the lead capture modal dialog globally from any CTA button or link.
 * @param {{ courseId?: string }} [params]
 */
export function openLeadForm({ courseId = '' } = {}) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(POPUP_WINDOW_EVENTS.OPEN_MODAL, {
      detail: { courseId },
    })
  );
}

/**
 * Notifies the popup engine of a successful lead submission from any form.
 */
export function markLeadSubmitted() {
  if (typeof window === 'undefined') return;
  const current = loadStoredPopupState();
  persistSubmission(current);

  window.dispatchEvent(new CustomEvent(POPUP_WINDOW_EVENTS.LEAD_SUBMITTED));
}

