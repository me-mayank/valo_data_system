// PRD §10.4 — Table component (admin use)
// Dense rows, tabular numerals, 1px rules, sticky header on sand, row hover sand
// No zebra stripes

/**
 * @param {{
 *   columns: Array<{ key: string, label: string, className?: string }>,
 *   rows: Array<Record<string, import('react').ReactNode>>,
 *   className?: string,
 *   caption?: string,
 * }} props
 */
export default function Table({ columns, rows, className = '', caption }) {
  return (
    <div className={`overflow-x-auto border-[1px] border-navy ${className}`}>
      <table className="w-full border-collapse tabular-nums font-mono text-sm text-navy">
        {caption && (
          <caption className="sr-only">{caption}</caption>
        )}
        <thead>
          <tr className="bg-sand border-b-[1px] border-navy sticky top-0">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={[
                  'text-left px-3 py-2',
                  'font-mono text-[12px] uppercase tracking-[0.08em]',
                  'whitespace-nowrap',
                  col.className ?? '',
                ].join(' ')}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-6 text-center text-navy-soft font-sans text-sm"
              >
                No records found.
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr
                key={i}
                className="border-b-[1px] border-rule-soft last:border-b-0 hover:bg-sand transition-colors duration-[100ms]"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={[
                      'px-3 py-2 font-sans text-sm',
                      col.className ?? '',
                    ].join(' ')}
                  >
                    {row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

