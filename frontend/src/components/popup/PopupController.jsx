'use client';

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useSyncExternalStore,
} from 'react';
import { usePathname } from 'next/navigation';
import LeadDialog from './LeadDialog';
import StickyRegisterTab from './StickyRegisterTab';
import {
  shouldAutoShow,
  getPopupMode,
  isRouteSuppressed,
} from '@/lib/popup/state';
import {
  subscribePopupState,
  getPopupSnapshot,
  getPopupServerSnapshot,
  persistDismissal,
  persistSubmission,
} from '@/lib/popup/storage';
import { POPUP_WINDOW_EVENTS } from '@/lib/popup/events';

/**
 * Controller component for the automated popup engine (PRD §7.3).
 *
 * @param {{
 *   settings?: {
 *     popupEnabled?: boolean,
 *     popupDelaySeconds?: number,
 *     popupScrollPercent?: number,
 *     popupReappearSeconds?: number,
 *     popupMaxDismissals?: number,
 *   }
 * }} props
 */
export default function PopupController({ settings = {} }) {
  const pathname = usePathname();

  // Synchronize with external popup store (localStorage + cookies)
  const state = useSyncExternalStore(
    subscribePopupState,
    getPopupSnapshot,
    getPopupServerSnapshot
  );

  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const stateRef = useRef(state);
  const pageStartTimeRef = useRef(0);
  const timerRef = useRef(null);
  const scrollTriggeredRef = useRef(false);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Listen to global open and submitted window events
  useEffect(() => {
    const handleOpenModal = (e) => {
      setSelectedCourseId(e.detail?.courseId || '');
      setIsModalOpen(true);
    };

    const handleLeadSubmitted = () => {
      setIsModalOpen(false);
    };

    window.addEventListener(POPUP_WINDOW_EVENTS.OPEN_MODAL, handleOpenModal);
    window.addEventListener(POPUP_WINDOW_EVENTS.LEAD_SUBMITTED, handleLeadSubmitted);

    return () => {
      window.removeEventListener(POPUP_WINDOW_EVENTS.OPEN_MODAL, handleOpenModal);
      window.removeEventListener(POPUP_WINDOW_EVENTS.LEAD_SUBMITTED, handleLeadSubmitted);
    };
  }, []);

  const triggerModalIfEligible = useCallback(
    (reason) => {
      if (isModalOpen) return;
      const currentState = stateRef.current;
      if (currentState.submitted) return;

      const timeOnPageMs = Date.now() - (pageStartTimeRef.current || Date.now());

      const eligible = shouldAutoShow({
        state: currentState,
        settings,
        pathname,
        now: Date.now(),
        timeOnPageMs: reason === 'time' ? (settings.popupDelaySeconds ?? 8) * 1000 : timeOnPageMs,
        scrollPercent: reason === 'scroll' ? (settings.popupScrollPercent ?? 40) : 0,
      });

      if (eligible) {
        setIsModalOpen(true);
      }
    },
    [isModalOpen, pathname, settings]
  );

  // Reset triggers and start delay timer whenever pathname changes
  useEffect(() => {
    pageStartTimeRef.current = Date.now();
    scrollTriggeredRef.current = false;

    if (isRouteSuppressed(pathname) || settings.popupEnabled === false) {
      return;
    }

    const delayMs = (settings.popupDelaySeconds ?? 8) * 1000;
    timerRef.current = setTimeout(() => {
      triggerModalIfEligible('time');
    }, delayMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [pathname, settings, triggerModalIfEligible]);

  // Monitor scroll depth
  useEffect(() => {
    if (isRouteSuppressed(pathname) || settings.popupEnabled === false) {
      return;
    }

    let ticking = false;

    const handleScroll = () => {
      if (ticking || scrollTriggeredRef.current) return;

      window.requestAnimationFrame(() => {
        const docElem = document.documentElement;
        const totalHeight = docElem.scrollHeight - window.innerHeight;
        if (totalHeight <= 0) {
          ticking = false;
          return;
        }

        const scrollPercent = (window.scrollY / totalHeight) * 100;
        const targetPercent = settings.popupScrollPercent ?? 40;

        if (scrollPercent >= targetPercent) {
          scrollTriggeredRef.current = true;
          triggerModalIfEligible('scroll');
        }

        ticking = false;
      });

      ticking = true;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pathname, settings, triggerModalIfEligible]);

  const handleOpenChange = (open) => {
    setIsModalOpen(open);
    if (!open) {
      // User dismissed dialog
      persistDismissal(state, Date.now());
    }
  };

  const handleSuccess = () => {
    persistSubmission(state);
    setIsModalOpen(false);
  };

  // Derive mode: 'hidden' | 'modal' | 'tab'
  const mode = getPopupMode({
    state: { ...state, isModalOpen },
    settings,
    pathname,
  });

  return (
    <>
      {/* Sticky Tab Fallback (FR-POP-03) */}
      {mode === 'tab' && (
        <StickyRegisterTab onClick={() => setIsModalOpen(true)} />
      )}

      {/* Lead Capture Modal / Bottom Sheet */}
      <LeadDialog
        open={isModalOpen}
        onOpenChange={handleOpenChange}
        courseId={selectedCourseId}
        onSuccess={handleSuccess}
      />
    </>
  );
}
