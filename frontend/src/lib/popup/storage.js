import { initialPopupState, onDismiss, onSubmit } from './state';

const STORAGE_KEYS = {
  SUBMITTED: 'dv_submitted',
  DISMISS_COUNT: 'dv_dismiss_count',
  LAST_DISMISSED_AT: 'dv_last_dismissed_at',
};

// In-memory fallback if localStorage or cookies are restricted
const memoryFallback = {
  submitted: false,
  dismissCount: 0,
  lastDismissedAt: null,
};

let currentSnapshot = initialPopupState();
const listeners = new Set();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

/**
 * Checks cookie for submitted flag.
 * @returns {boolean}
 */
function isCookieSubmitted() {
  if (typeof document === 'undefined') return false;
  return document.cookie.split(';').some((c) => c.trim().startsWith('dv_submitted=true'));
}

/**
 * Loads persisted popup state across localStorage, cookies, and memory fallback.
 * @returns {import('./state').PopupState}
 */
export function loadStoredPopupState() {
  const state = initialPopupState();

  if (typeof window === 'undefined') {
    return state;
  }

  // 1. Check conversion suppression in cookies and localStorage
  if (isCookieSubmitted() || memoryFallback.submitted) {
    state.submitted = true;
    return state;
  }

  try {
    const localSubmitted = localStorage.getItem(STORAGE_KEYS.SUBMITTED);
    if (localSubmitted === 'true') {
      state.submitted = true;
      return state;
    }

    const count = parseInt(localStorage.getItem(STORAGE_KEYS.DISMISS_COUNT) || '0', 10);
    state.dismissCount = isNaN(count) ? 0 : count;

    const lastAt = parseInt(localStorage.getItem(STORAGE_KEYS.LAST_DISMISSED_AT) || '0', 10);
    state.lastDismissedAt = isNaN(lastAt) || lastAt === 0 ? null : lastAt;
  } catch {
    // LocalStorage blocked (private mode); fallback to memory
    state.submitted = memoryFallback.submitted;
    state.dismissCount = memoryFallback.dismissCount;
    state.lastDismissedAt = memoryFallback.lastDismissedAt;
  }

  return state;
}

// Initialize snapshot in client environment
if (typeof window !== 'undefined') {
  currentSnapshot = loadStoredPopupState();
  window.addEventListener('storage', () => {
    currentSnapshot = loadStoredPopupState();
    emitChange();
  });
}

/**
 * Subscribes to popup state store changes (compatible with useSyncExternalStore).
 * @param {() => void} listener
 * @returns {() => void}
 */
export function subscribePopupState(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Returns current snapshot for client rendering.
 * @returns {import('./state').PopupState}
 */
export function getPopupSnapshot() {
  return currentSnapshot;
}

/**
 * Returns default server snapshot for SSR.
 * @returns {import('./state').PopupState}
 */
export function getPopupServerSnapshot() {
  return initialPopupState();
}

/**
 * Persists a user dismissal to storage.
 * @param {import('./state').PopupState} currentState
 * @param {number} [now=Date.now()]
 * @returns {import('./state').PopupState}
 */
export function persistDismissal(currentState, now = Date.now()) {
  const nextState = onDismiss(currentState, now);

  memoryFallback.dismissCount = nextState.dismissCount;
  memoryFallback.lastDismissedAt = nextState.lastDismissedAt;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.DISMISS_COUNT, String(nextState.dismissCount));
      localStorage.setItem(STORAGE_KEYS.LAST_DISMISSED_AT, String(nextState.lastDismissedAt));
    } catch {
      // Storage restricted
    }
  }

  currentSnapshot = nextState;
  emitChange();
  return nextState;
}

/**
 * Persists a lead conversion across localStorage and a 1-year cookie.
 * @param {import('./state').PopupState} currentState
 * @returns {import('./state').PopupState}
 */
export function persistSubmission(currentState) {
  const nextState = onSubmit(currentState);

  memoryFallback.submitted = true;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.SUBMITTED, 'true');
    } catch {
      // Storage restricted
    }

    // Set 1-year SameSite=Lax cookie for cross-tab and cross-session persistence
    try {
      const oneYearSeconds = 365 * 24 * 60 * 60;
      document.cookie = `dv_submitted=true; path=/; max-age=${oneYearSeconds}; SameSite=Lax`;
    } catch {
      // Cookie restricted
    }
  }

  currentSnapshot = nextState;
  emitChange();
  return nextState;
}
