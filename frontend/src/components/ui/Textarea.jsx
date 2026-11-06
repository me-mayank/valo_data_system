// PRD §10.4 — Textarea component (same spec as Input)

/**
 * @param {{
 *   id: string,
 *   label: string,
 *   index?: string,
 *   required?: boolean,
 *   error?: string,
 *   helper?: string,
 *   rows?: number,
 *   className?: string,
 *   [key: string]: unknown,
 * }} props
 */
export default function Textarea({
  id,
  label,
  index,
  required = false,
  error,
  helper,
  rows = 4,
  className = '',
  ...rest
}) {
  const hasError = Boolean(error);

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label
        htmlFor={id}
        className="font-mono text-[12px] uppercase tracking-[0.08em] text-navy leading-none"
      >
        {index && <span className="text-navy-soft mr-2">{index}</span>}
        {label}
        {required && (
          <span className="ml-2 text-navy-soft font-mono text-[12px]">
            REQUIRED
          </span>
        )}
      </label>

      <textarea
        id={id}
        rows={rows}
        aria-required={required}
        aria-invalid={hasError || undefined}
        aria-describedby={
          error ? `${id}-error` : helper ? `${id}-helper` : undefined
        }
        className={[
          'bg-white text-navy font-sans text-base',
          'px-3 py-2 w-full resize-y',
          'outline-none',
          hasError
            ? 'border-[2px] border-error focus:border-[2px] focus:border-error'
            : 'border-[1px] border-navy focus:border-[2px] focus:border-navy',
        ].join(' ')}
        {...rest}
      />

      {helper && !hasError && (
        <p
          id={`${id}-helper`}
          className="font-sans text-[12px] text-navy-soft leading-snug"
        >
          {helper}
        </p>
      )}

      {hasError && (
        <p
          id={`${id}-error`}
          role="alert"
          className="font-mono text-[12px] text-error leading-snug"
        >
          ERROR: {error}
        </p>
      )}
    </div>
  );
}

