// PRD §10.4 — TypeTile: generated typographic tile fallback
// Course code and tool name in large mono type on sand background
// Used when a course has no thumbnail image

/**
 * @param {{
 *   code?: string,
 *   tool?: string,
 *   className?: string,
 * }} props
 */
export default function TypeTile({ code, tool, className = '' }) {
  const displayCode = code ?? 'DV';
  const displayTool = tool ?? 'TOOL';

  return (
    <div
      aria-hidden="true"
      className={[
        'w-full aspect-[4/3]',
        'bg-sand border-[1px] border-navy',
        'flex flex-col items-start justify-end',
        'p-3 overflow-hidden select-none',
        className,
      ].join(' ')}
    >
      {/* Large code in background (decorative) */}
      <span
        className="font-mono font-semibold text-navy leading-none"
        style={{ fontSize: 'clamp(2rem, 8vw, 4rem)', opacity: 0.12 }}
      >
        {displayCode}
      </span>
      {/* Tool name overlaid */}
      <span className="font-mono text-[12px] uppercase tracking-[0.08em] text-navy-soft mt-auto">
        {displayTool}
      </span>
      <span className="font-mono font-semibold text-sm text-navy">
        {displayCode}
      </span>
    </div>
  );
}

