import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'ghost-danger';

/**
 * Chunky, pressable buttons: a coloured face over a darker bottom edge (`press` in styles.css).
 * Coloured buttons use large bold text, which also keeps white on green readable.
 */
const VARIANTS: Record<Variant, string> = {
  primary: 'press border-2 border-brand-strong border-b-brand-edge bg-brand-strong text-[1.2rem] font-extrabold text-white',
  secondary: 'press border-2 border-line bg-card text-[1.05rem] font-bold text-fg',
  success: 'press border-2 border-success border-b-success-edge bg-success text-[1.2rem] font-extrabold text-white',
  danger: 'press border-2 border-danger border-b-danger-edge bg-danger text-[1.2rem] font-extrabold text-white',
  ghost: 'font-bold text-muted underline-offset-4 hover:underline',
  'ghost-danger': 'font-bold text-danger-ink underline-offset-4 hover:underline',
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
  const size = isGhost(variant) ? 'px-2 py-2' : 'min-h-14 rounded-2xl px-5 py-3';
  return (
    <button
      type={type}
      className={`${size} disabled:opacity-40 ${block ? 'w-full' : ''} ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
