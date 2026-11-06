// PRD §10.4 — Dialog (popup) component
// Rectangular panel, 2px navy border. Navy title bar, cream mono text.
// Desktop: centred, max-w 520px. Mobile: full-width bottom sheet.
// Backdrop: flat navy at 60% opacity, NO blur. Focus-trapped. Esc to close.

'use client';

import * as RadixDialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

/**
 * @param {{
 *   open: boolean,
 *   onOpenChange: (open: boolean) => void,
 *   title?: string,
 *   docRef?: string,
 *   children: import('react').ReactNode,
 * }} props
 */
export default function Dialog({
  open,
  onOpenChange,
  title = 'REGISTER INTEREST',
  docRef = 'FORM DV-01',
  children,
}) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        {/* Backdrop: flat navy 60%, no blur (PRD §10.4) */}
        <RadixDialog.Overlay
          className={[
            'fixed inset-0 z-40',
            // Navy at 60% opacity — using inline style to avoid hardcoded hex in className
          ].join(' ')}
          style={{ backgroundColor: 'rgba(11, 31, 58, 0.6)' }}
        />

        {/* Panel: desktop centred, mobile bottom sheet */}
        <RadixDialog.Content
          className={[
            'fixed z-50',
            // Desktop: centred
            'md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2',
            'md:w-full md:max-w-[520px]',
            // Mobile: bottom sheet
            'max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:w-full',
            // Panel styling
            'bg-cream border-[2px] border-navy',
            'flex flex-col',
            'max-h-[90vh] overflow-y-auto',
            // Focus: no box-shadow (PRD §10.7)
          ].join(' ')}
          aria-modal="true"
          onEscapeKeyDown={() => onOpenChange(false)}
        >
          {/* Title bar: navy bg, cream mono text, [X] button */}
          <div className="flex items-center justify-between bg-navy px-4 py-3 shrink-0">
            <div className="font-mono text-cream text-[12px] uppercase tracking-[0.08em] leading-none">
              <span className="text-rule-soft mr-2">{docRef}</span>
              <span>/</span>
              <span className="ml-2">{title}</span>
            </div>

            <RadixDialog.Close asChild>
              <button
                type="button"
                aria-label="Close dialog"
                className={[
                  'font-mono text-cream text-sm',
                  'border-[1px] border-cream px-2 py-1 min-h-[32px] min-w-[32px]',
                  'flex items-center justify-center',
                  'hover:bg-cream hover:text-navy',
                  'transition-colors duration-[100ms]',
                  'cursor-pointer',
                ].join(' ')}
              >
                <X size={16} strokeWidth={2} aria-hidden="true" />
                <span className="font-mono text-[12px] ml-1 sr-only md:not-sr-only">[X]</span>
              </button>
            </RadixDialog.Close>
          </div>

          {/* Body */}
          <div className="p-6 flex-1">{children}</div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

export { RadixDialog as DialogPrimitive };

