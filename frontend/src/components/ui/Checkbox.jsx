// PRD §10.4 — Checkbox component
// 44px touch target, navy border, ERROR: messages

/**
 * @param {{
 *   id: string,
 *   label: import('react').ReactNode,
 *   required?: boolean,
 *   error?: string,
 *   className?: string,
 *   [key: string]: unknown,
 * }} props
 */
export default function Checkbox({
  id,
  label,
  required = false,
  error,
  className = '',
  ...rest
}) {
  const hasError = Boolean(error);

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {/* 44px min touch target via the label wrapper */}
      <label
        htmlFor={id}
        className="flex items-start gap-3 min-h-[44px] cursor-pointer"
      >
        <input
          id={id}
          type="checkbox"
          aria-required={required}
          aria-invalid={hasError || undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={[
            'mt-[3px] shrink-0',
            'w-5 h-5 cursor-pointer',
            'accent-navy',
            hasError ? 'outline outline-[2px] outline-error' : '',
          ].join(' ')}
          {...rest}
        />
        <span className="font-sans text-base text-navy leading-snug">
          {label}
          {required && (
            <span className="ml-2 font-mono text-[12px] uppercase text-navy-soft tracking-[0.08em]">
              REQUIRED
            </span>
          )}
        </span>
      </label>

      {hasError && (
        <p
          id={`${id}-error`}
          role="alert"
          className="font-mono text-[12px] text-error leading-snug ml-8"
        >
          ERROR: {error}
        </p>
      )}
    </div>
  );
}

