// PRD §10.4 — SpecList: key/value rows separated by 1px rule-soft lines
// Used in hero spec panel, course spec panel, etc.

/**
 * @param {{
 *   items: Array<{ key: string, value: string | import('react').ReactNode }>,
 *   className?: string,
 *   bordered?: boolean,
 * }} props
 */
export default function SpecList({ items, className = '', bordered = true }) {
  return (
    <dl
      className={[
        'w-full',
        bordered ? 'border-[1px] border-navy' : '',
        className,
      ].join(' ')}
    >
      {items.map(({ key, value }, i) => (
        <div
          key={key}
          className={[
            'flex items-baseline gap-4 px-3 py-2',
            i < items.length - 1 ? 'border-b-[1px] border-rule-soft' : '',
          ].join(' ')}
        >
          <dt className="font-mono text-[12px] uppercase tracking-[0.08em] text-navy-soft shrink-0 w-28">
            {key}
          </dt>
          <dd className="font-sans text-sm text-navy leading-snug flex-1 m-0">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

