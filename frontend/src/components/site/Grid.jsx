// PRD §10.3 — Grid layout primitive
// 12 columns on desktop, 8 on tablet, 4 on mobile
// gap: 0, cells share 1px navy borders, outer container has 1px navy border
// Max content width: 1200px

/**
 * @param {{
 *   children: import('react').ReactNode,
 *   className?: string,
 *   cols?: number,
 *   bordered?: boolean,
 * }} props
 */
export default function Grid({
  children,
  className = '',
  cols,
  bordered = true,
}) {
  return (
    <div
      className={[
        'w-full max-w-[1200px] mx-auto',
        bordered ? 'border-[1px] border-navy' : '',
        'grid gap-0',
        // 12/8/4 responsive columns (PRD §10.3)
        cols
          ? `grid-cols-${cols}`
          : 'grid-cols-4 md:grid-cols-8 lg:grid-cols-12',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}

/**
 * A single cell within the grid.
 * @param {{
 *   children: import('react').ReactNode,
 *   span?: number,
 *   className?: string,
 *   bordered?: boolean,
 * }} props
 */
export function GridCell({ children, span, className = '', bordered = true }) {
  return (
    <div
      className={[
        span ? `col-span-${span}` : 'col-span-1',
        bordered ? 'border-[1px] border-navy -m-px' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}

