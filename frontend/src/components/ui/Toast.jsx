// PRD §10.4 — Toast component
// Bordered rectangle, bottom-left, prefixed OK: or ERROR:
// Appears/disappears within 100ms

'use client';

import { useEffect } from 'react';

/**
 * @param {{
 *   message: string,
 *   type?: 'ok' | 'error',
 *   onDismiss: () => void,
 *   duration?: number,
 * }} props
 */
export default function Toast({
  message,
  type = 'ok',
  onDismiss,
  duration = 4000,
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [onDismiss, duration]);

  const prefix = type === 'ok' ? 'OK:' : 'ERROR:';
  const borderColor =
    type === 'error' ? 'var(--color-error)' : 'var(--color-navy)';

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style={{ borderColor }}
      className={[
        'fixed bottom-6 left-6 z-[9999]',
        'bg-cream border-[2px]',
        'px-4 py-3',
        'font-mono text-sm text-navy',
        'max-w-[360px] min-h-[44px]',
        'flex items-start gap-2',
      ].join(' ')}
    >
      <span
        className={
          type === 'error' ? 'text-error font-medium' : 'font-medium'
        }
      >
        {prefix}
      </span>
      <span>{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className={[
          'ml-auto shrink-0',
          'font-mono text-[12px] text-navy-soft',
          'hover:text-navy',
          'cursor-pointer min-w-[24px] min-h-[24px]',
          'flex items-center justify-center',
        ].join(' ')}
      >
        ×
      </button>
    </div>
  );
}

