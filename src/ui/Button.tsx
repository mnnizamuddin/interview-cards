import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'ghost-danger';

const VARIANTS: Record<Variant, string> = {
  primary: 'press bg-brand border-brand-dark text-white',
  secondary: 'press bg-page border-line text-fg border-2',
  danger: 'press bg-danger border-danger-dark text-white',
  ghost: 'text-muted underline-offset-4 hover:underline',
  'ghost-danger': 'text-danger underline-offset-4 hover:underline',
};

/** Ghost buttons are text links: no padding box or rounded corners. */
function isGhost(variant: Variant): boolean {
  return variant === 'ghost' || variant === 'ghost-danger';
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  block?: boolean;
};

export function Button({ variant = 'primary', block = false, className = '', type = 'button', ...props }: ButtonProps) {
  const size = isGhost(variant) ?'px-2 py-2' : 'min-h-12 px-5 py-3 rounded-2xl';
  return (
    <button
      type={type}
      className={`${size} font-bold tracking-wide disabled:opacity-40 ${block ? 'w-full' : ''} ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
