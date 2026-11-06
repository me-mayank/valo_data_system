'use client';

import { openLeadForm } from '@/lib/popup/events';

/**
 * Sticky register tab rendered when fatigue threshold (5 dismissals) is reached (FR-POP-03).
 * Persistent unobtrusive floating trigger in bottom-right corner.
 *
 * @param {{
 *   onClick?: () => void,
 *   className?: string
 * }} props
 */
export default function StickyRegisterTab({ onClick, className = '' }) {
  const handleClick = () => {
    if (typeof onClick === 'function') {
      onClick();
    } else {
      openLeadForm();
    }
  };

  return (
    <div
      className={`fixed bottom-4 right-4 z-40 transition-transform duration-[100ms] ${className}`}
    >
      <button
        type="button"
        onClick={handleClick}
        aria-label="Register interest in courses"
        className={[
          'bg-coral text-navy font-mono font-bold text-xs uppercase tracking-[0.08em]',
          'border-[2px] border-navy px-4 py-3 min-h-[44px]',
          'hover:bg-sand transition-colors duration-[100ms] cursor-pointer',
          'flex items-center gap-2 select-none',
        ].join(' ')}
      >
        <span>[ REGISTER INTEREST → ]</span>
      </button>
    </div>
  );
}

