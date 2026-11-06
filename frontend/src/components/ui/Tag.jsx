// PRD §10.4 — Tag / chip component
// Square, 1px navy border, bracket style [LABEL]
// Selected: navy fill, cream text

/**
 * @param {{
 *   children: import('react').ReactNode,
 *   selected?: boolean,
 *   onClick?: () => void,
 *   as?: 'span' | 'button',
 *   className?: string,
 * }} props
 */
export default function Tag({
  children,
  selected = false,
  onClick,
  as: Tag = onClick ? 'button' : 'span',
  className = '',
}) {
  return (
    <Tag
      onClick={onClick}
      type={Tag === 'button' ? 'button' : undefined}
      className={[
        'inline-flex items-center',
        'font-mono text-[12px] uppercase tracking-[0.08em]',
        'border-[1px] border-navy',
        'px-2 py-1 min-h-[28px]',
        'transition-colors duration-[100ms]',
        selected
          ? 'bg-navy text-cream'
          : 'bg-transparent text-navy hover:bg-sand',
        onClick ? 'cursor-pointer' : '',
        className,
      ].join(' ')}
    >
      [{children}]
    </Tag>
  );
}

