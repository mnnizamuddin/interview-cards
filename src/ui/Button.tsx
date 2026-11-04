import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'ghost-danger';

const VARIANTS: Record<Variant, string> = {
  primary: 'press bg-brand text-white shadow-sm shadow-brand/30 hover:bg-brand-dark',
  secondary: 'press bg-card border border-line text-fg hover:bg-surface',
  success: 'press bg-success text-white shadow-sm shadow-success/30',
  danger: 'press bg-danger text-white shadow-sm shadow-danger/30 hover:bg-danger-dark',
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
  const size = isGhost(variant) ? 'px-2 py-2' : 'min-h-13 px-5 py-3 rounded-2xl';
  return (
    <button
      type={type}
      className={`${size} font-semibold disabled:opacity-40 ${block ? 'w-full' : ''} ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
