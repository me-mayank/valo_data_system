// Pure state module with no DOM access (PRD §7.3, Implementation Plan Phase 8)
// 100% deterministic and testable

/**
 * @typedef {Object} PopupState
 * @property {boolean} submitted
 * @property {number} dismissCount
 * @property {number|null} lastDismissedAt
 * @property {boolean} isModalOpen
 */

/**
 * @typedef {Object} PopupSettings
 * @property {boolean} [popupEnabled=true]
 * @property {number} [popupDelaySeconds=8]
 * @property {number} [popupScrollPercent=40]
 * @property {number} [popupReappearSeconds=120]
 * @property {number} [popupMaxDismissals=5]
 */

/**
 * Generates fresh initial popup state.
 * @returns {PopupState}
 */
export function initialPopupState() {
  return {
    submitted: false,
    dismissCount: 0,
    lastDismissedAt: null,
    isModalOpen: false,
  };
}

/**
 * Checks if a route is suppressed from showing lead popups (FR-POP-05).
 * @param {string} pathname
 * @returns {boolean}
 */
export function isRouteSuppressed(pathname = '/') {
  if (!pathname) return false;
  const path = pathname.split('?')[0].toLowerCase();

  if (path === '/contact' || path.startsWith('/contact/')) return true;
  if (path === '/privacy' || path.startsWith('/privacy/')) return true;
  if (path === '/terms' || path.startsWith('/terms/')) return true;
  if (path === '/admin' || path.startsWith('/admin/')) return true;
  if (path === '/_design' || path.startsWith('/_design/')) return true;
  if (path === '/internal' || path.startsWith('/internal/')) return true;

  return false;
}

/**
 * Evaluates whether the lead modal should auto-open on the current page.
 * @param {{
 *   state: PopupState,
 *   settings: PopupSettings,
 *   pathname?: string,
 *   now?: number,
 *   timeOnPageMs?: number,
 *   scrollPercent?: number
 * }} params
 * @returns {boolean}
 */
export function shouldAutoShow({
  state,
  settings,
  pathname = '/',
  now = Date.now(),
  timeOnPageMs = 0,
  scrollPercent = 0,
}) {
  if (!state || !settings) return false;
  if (settings.popupEnabled === false) return false;
  if (state.submitted) return false;
  if (isRouteSuppressed(pathname)) return false;

  const maxDismissals = settings.popupMaxDismissals ?? 5;
  if (state.dismissCount >= maxDismissals) return false;

  const reappearMs = (settings.popupReappearSeconds ?? 120) * 1000;
  if (state.lastDismissedAt && now - state.lastDismissedAt < reappearMs) {
    return false;
  }

  const delayMs = (settings.popupDelaySeconds ?? 8) * 1000;
  if (timeOnPageMs >= delayMs) return true;

  const targetScroll = settings.popupScrollPercent ?? 40;
  if (scrollPercent >= targetScroll) return true;

  return false;
}

/**
 * Derives current visual presentation mode: 'hidden' | 'modal' | 'tab' (FR-POP-03).
 * @param {{
 *   state: PopupState,
 *   settings: PopupSettings,
 *   pathname?: string
 * }} params
 * @returns {'hidden' | 'modal' | 'tab'}
 */
export function getPopupMode({ state, settings, pathname = '/' }) {
  if (!state || !settings) return 'hidden';
  if (settings.popupEnabled === false) return 'hidden';
  if (state.submitted) return 'hidden';
  if (isRouteSuppressed(pathname)) return 'hidden';

  if (state.isModalOpen) return 'modal';

  const maxDismissals = settings.popupMaxDismissals ?? 5;
  if (state.dismissCount >= maxDismissals) return 'tab';

  return 'hidden';
}

/**
 * Transitions state on user dismissal.
 * @param {PopupState} state
 * @param {number} [now=Date.now()]
 * @returns {PopupState}
 */
export function onDismiss(state, now = Date.now()) {
  return {
    ...state,
    dismissCount: (state?.dismissCount || 0) + 1,
    lastDismissedAt: now,
    isModalOpen: false,
  };
}

/**
 * Transitions state on successful lead submission (FR-POP-04).
 * @param {PopupState} state
 * @returns {PopupState}
 */
export function onSubmit(state) {
  return {
    ...state,
    submitted: true,
    isModalOpen: false,
  };
}

/**
 * Transitions state when modal is opened explicitly.
 * @param {PopupState} state
 * @returns {PopupState}
 */
export function onOpen(state) {
  return {
    ...state,
    isModalOpen: true,
  };
}

/**
 * Transitions state when modal is closed explicitly.
 * @param {PopupState} state
 * @returns {PopupState}
 */
export function onClose(state) {
  return {
    ...state,
    isModalOpen: false,
  };
}

