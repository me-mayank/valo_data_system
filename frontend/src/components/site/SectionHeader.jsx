// PRD §10.3 — SectionHeader pattern
// [01] LABEL on left, 1px rule beneath it, optional meta text on right

/**
 * @param {{
 *   index?: string,
 *   label: string,
 *   meta?: string,
 *   className?: string,
 * }} props
 */
export default function SectionHeader({ index, label, meta, className = '' }) {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-baseline justify-between mb-2 gap-4">
        <div className="font-mono text-[12px] uppercase tracking-[0.08em] text-navy leading-none flex items-baseline gap-2">
          {index && (
            <span className="text-navy-soft">[{index}]</span>
          )}
          <span className="font-medium">{label}</span>
        </div>
        {meta && (
          <span className="font-mono text-[12px] text-navy-soft uppercase tracking-[0.08em] whitespace-nowrap">
            {meta}
          </span>
        )}
      </div>
      {/* 1px rule beneath (PRD §10.3) */}
      <div className="border-b-[1px] border-navy" />
    </div>
  );
}

