// PRD §10.4 — CourseCell: bordered spec-sheet cell
// Top row: course code (left), mode flag (right)
// Title, short description, key/value rows (DURATION, MODE, LEVEL, TOOLS)
// Bottom row: VIEW SPEC →
// Optional thumbnail in 4:3 bordered frame; fallback: TypeTile

import Link from 'next/link';
import Image from 'next/image';
import TypeTile from './TypeTile';

/**
 * @param {{
 *   code?: string,
 *   title: string,
 *   shortDescription?: string,
 *   duration?: string,
 *   mode?: string,
 *   level?: string,
 *   tools?: string[],
 *   slug: string,
 *   thumbnail?: { url: string } | null,
 *   className?: string,
 * }} props
 */
export default function CourseCell({
  code,
  title,
  shortDescription,
  duration,
  mode,
  level,
  tools = [],
  slug,
  thumbnail,
  className = '',
}) {
  const specRows = [
    { key: 'DURATION', value: duration ?? '—' },
    { key: 'MODE', value: mode ? mode.toUpperCase() : '—' },
    { key: 'LEVEL', value: level ? level.toUpperCase() : '—' },
    {
      key: 'TOOLS',
      value: tools.length > 0 ? tools.join(', ') : '—',
    },
  ];

  return (
    <article
      className={[
        'border-[1px] border-navy flex flex-col bg-cream',
        className,
      ].join(' ')}
    >
      {/* Optional thumbnail / TypeTile fallback */}
      {thumbnail?.url ? (
        <div className="border-b-[1px] border-navy aspect-[4/3] overflow-hidden relative">
          <Image
            src={thumbnail.url}
            alt={title ? `${title} thumbnail` : 'Course thumbnail'}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="border-b-[1px] border-navy">
          <TypeTile
            code={code}
            tool={tools[0]}
          />
        </div>
      )}

      {/* Top meta row */}
      <div className="flex items-center justify-between px-3 py-2 border-b-[1px] border-rule-soft">
        {code ? (
          <span className="font-mono text-[12px] text-navy-soft uppercase tracking-[0.08em]">
            {code}
          </span>
        ) : (
          <span />
        )}
        {mode && (
          <span className="font-mono text-[12px] text-navy-soft uppercase tracking-[0.08em]">
            [{mode.toUpperCase()}]
          </span>
        )}
      </div>

      {/* Title + description */}
      <div className="px-3 py-3 border-b-[1px] border-rule-soft flex-1">
        <h3 className="font-mono font-semibold text-sm text-navy leading-snug mb-1">
          {title}
        </h3>
        {shortDescription && (
          <p className="font-sans text-sm text-navy-soft leading-snug">
            {shortDescription}
          </p>
        )}
      </div>

      {/* Key/value spec rows */}
      <dl className="flex flex-col border-b-[1px] border-rule-soft">
        {specRows.map(({ key, value }, i) => (
          <div
            key={key}
            className={[
              'flex items-baseline gap-3 px-3 py-1',
              i < specRows.length - 1 ? 'border-b-[1px] border-rule-soft' : '',
            ].join(' ')}
          >
            <dt className="font-mono text-[11px] text-navy-soft tracking-[0.06em] shrink-0 w-20">
              {key}
            </dt>
            <dd className="font-mono text-[12px] text-navy truncate">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      {/* Bottom action row */}
      <div className="px-3 py-2 mt-auto">
        <Link
          href={`/courses/${slug}`}
          className="font-mono text-[12px] uppercase tracking-[0.08em] text-navy font-medium hover:text-coral transition-colors duration-[100ms] inline-flex items-center gap-1 min-h-[44px]"
        >
          VIEW SPEC →
        </Link>
      </div>
    </article>
  );
}
