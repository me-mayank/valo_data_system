// PRD §10.4 — Button component
// Primary: coral fill, navy text; hover inverts to navy fill, cream text
// Secondary: transparent, navy border; hover fills sand
// Rectangular, 0 radius, 2px navy border, Plex Mono uppercase 14px, min-h 44px

import Link from 'next/link';

/**
 * @param {{
 *   variant?: 'primary' | 'secondary',
 *   as?: any,
 *   href?: string,
 *   children: import('react').ReactNode,
 *   className?: string,
 *   disabled?: boolean,
 *   type?: 'button' | 'submit' | 'reset',
 *   onClick?: () => void,
 *   [key: string]: unknown,
 * }} props
 */
export default function Button({
  variant = 'primary',
  as,
  href,
  children,
  className = '',
  disabled = false,
  type = 'button',
  ...rest
}) {
  let Tag = as;
  if (!Tag) {
    if (href) {
      Tag = href.startsWith('/') ? Link : 'a';
    } else {
      Tag = 'button';
    }
  }
  const base = [
    'inline-flex items-center justify-center gap-2',
    'font-mono text-sm font-medium uppercase tracking-[0.04em]',
    'border-2 border-navy',
    'min-h-[44px] px-6',
    'cursor-pointer select-none',
    'transition-colors duration-[100ms]',
    // No border-radius (enforced globally via CSS token --radius: 0px)
  ].join(' ');

  const variants = {
    primary: [
      'bg-coral text-navy',
      'hover:bg-navy hover:text-cream',
      'focus-visible:outline-[3px] focus-visible:outline-navy focus-visible:outline-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
    ].join(' '),
    secondary: [
      'bg-transparent text-navy',
      'hover:bg-sand',
      'focus-visible:outline-[3px] focus-visible:outline-navy focus-visible:outline-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
    ].join(' '),
  };

  const props = {
    className: `${base} ${variants[variant]} ${className}`,
    disabled,
    ...(Tag === 'button' ? { type } : {}),
    ...(href ? { href } : {}),
    ...rest,
  };

  return <Tag {...props}>{children}</Tag>;
}

