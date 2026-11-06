// PRD §10.4 — Input component
// White bg, 1px→2px navy border on focus, 0 radius, min-h 44px
// Label: uppercase mono with index (e.g. "01 FULL NAME")
// Error: 2px --error border + "ERROR: <text>" below field

/**
 * @param {{
 *   id: string,
 *   label: string,
 *   index?: string,
 *   required?: boolean,
 *   error?: string,
 *   helper?: string,
 *   className?: string,
 *   [key: string]: unknown,
 * }} props
 */
export default function Input({
  id,
  label,
  index,
  required = false,
  error,
  helper,
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

      <input
        id={id}
        aria-required={required}
        aria-invalid={hasError || undefined}
        aria-describedby={
          error ? `${id}-error` : helper ? `${id}-helper` : undefined
        }
        className={[
          'bg-white text-navy font-sans text-base',
          'border-navy min-h-[44px] px-3 py-2 w-full',
          'outline-none',
          hasError
            ? 'border-[2px] border-error focus:border-[2px] focus:border-error'
            : 'border-[1px] focus:border-[2px] focus:border-navy',
          // No border-radius (global reset)
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

