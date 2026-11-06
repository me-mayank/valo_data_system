'use client';

import { useState, useEffect } from 'react';

export function SlowServerNotice() {
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    const handleSlowEvent = (e) => {
      setIsSlow(Boolean(e.detail?.isSlow));
    };

    window.addEventListener('datavalo:slow-server', handleSlowEvent);
    return () => {
      window.removeEventListener('datavalo:slow-server', handleSlowEvent);
    };
  }, []);

  if (!isSlow) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-4 right-4 z-50 max-w-md border-2 border-coral bg-sand p-4 text-navy"
    >
      <div className="flex items-start gap-3">
        <span className="bg-coral px-2 py-0.5 font-mono text-xs font-bold text-navy">
          STATUS: WAKING UP
        </span>
        <div className="font-mono text-xs leading-relaxed">
          SERVER IS WAKING UP. PLEASE WAIT.
          <p className="mt-1 text-[11px] text-navy-soft">
            Free-tier container initialization in progress (up to 60s).
          </p>
        </div>
      </div>
    </div>
  );
}
