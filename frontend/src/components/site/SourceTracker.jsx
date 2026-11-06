'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const STORAGE_KEY = 'dv_src';
const SRC_REGEX = /^[a-z0-9-]{1,40}$/;

/**
 * Returns the currently tracked source tag from client storage, if any.
 * @returns {string}
 */
export function getTrackedSource() {
  if (typeof window === 'undefined') return '';
  try {
    return sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

/**
 * Returns the current device type according to viewport width.
 * @returns {'mobile' | 'tablet' | 'desktop'}
 */
export function getDeviceType() {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Client component that monitors the `?src=` search param and stores it in session/local storage.
 */
export default function SourceTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const rawSrc = searchParams?.get('src');
    if (!rawSrc) return;

    const sanitized = rawSrc.trim().toLowerCase().slice(0, 40);
    if (SRC_REGEX.test(sanitized)) {
      try {
        sessionStorage.setItem(STORAGE_KEY, sanitized);
        localStorage.setItem(STORAGE_KEY, sanitized);
      } catch {
        // Storage access might fail in private browsing mode
      }
    }
  }, [searchParams]);

  return null;
}

