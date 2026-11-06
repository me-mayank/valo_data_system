// PRD §10.4 — Accordion component
// Table rows, M1/M2 index, +/- glyph, 1px rules between rows
// Instant open/close (no animation beyond 100ms), Radix UI primitive

'use client';

import * as RadixAccordion from '@radix-ui/react-accordion';

/**
 * @param {{
 *   items: Array<{ id: string, title: string, content: import('react').ReactNode }>,
 *   className?: string,
 * }} props
 */
export default function Accordion({ items, className = '' }) {
  return (
    <RadixAccordion.Root
      type="multiple"
      className={`border-[1px] border-navy ${className}`}
    >
      {items.map((item, i) => {
        const index = `M${i + 1}`;
        return (
          <AccordionItem key={item.id} value={item.id} index={index} title={item.title}>
            {item.content}
          </AccordionItem>
        );
      })}
    </RadixAccordion.Root>
  );
}

/**
 * @param {{
 *   value: string,
 *   index: string,
 *   title: string,
 *   children: import('react').ReactNode,
 * }} props
 */
function AccordionItem({ value, index, title, children }) {
  return (
    <RadixAccordion.Item
      value={value}
      className="border-b-[1px] border-navy last:border-b-0"
    >
      <RadixAccordion.Header asChild>
        <RadixAccordion.Trigger
          className={[
            'w-full flex items-center justify-between',
            'px-4 py-3 min-h-[44px]',
            'font-mono text-sm text-navy',
            'bg-transparent hover:bg-sand',
            'transition-colors duration-[100ms]',
            'cursor-pointer',
            'group',
          ].join(' ')}
        >
          <span className="flex items-center gap-4">
            <span className="text-navy-soft text-[12px] uppercase tracking-[0.08em] w-6 shrink-0">
              {index}
            </span>
            <span className="font-medium">{title}</span>
          </span>
          {/* + / − text glyph (PRD §10.4: prefer text glyphs over icons) */}
          <span
            aria-hidden="true"
            className="font-mono text-lg text-navy group-data-[state=open]:hidden"
          >
            +
          </span>
          <span
            aria-hidden="true"
            className="font-mono text-lg text-navy hidden group-data-[state=open]:inline"
          >
            −
          </span>
        </RadixAccordion.Trigger>
      </RadixAccordion.Header>

      <RadixAccordion.Content
        className={[
          'overflow-hidden',
          // Instant open/close — no animation (PRD §10.4)
          'data-[state=open]:block data-[state=closed]:hidden',
          'border-t-[1px] border-rule-soft',
          'px-4 pl-14 py-3',
          'font-sans text-base text-navy',
        ].join(' ')}
      >
        {children}
      </RadixAccordion.Content>
    </RadixAccordion.Item>
  );
}

