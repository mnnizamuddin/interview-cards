import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

const VARIANTS: Record<Variant, string> = {
  primary: 'press bg-brand border-brand-dark text-white',
  secondary: 'press bg-page border-line text-fg border-2',
  danger: 'press bg-danger border-danger-dark text-white',
  ghost: 'text-muted underline-offset-4 hover:underline',
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  block?: boolean;
};

export function Button({ variant = 'primary', block = false, className = '', type = 'button', ...props }: ButtonProps) {
  const size = variant === 'ghost' ? 'px-2 py-2' : 'min-h-12 px-5 py-3 rounded-2xl';
  return (
    <button
      type={type}
      className={`${size} font-bold tracking-wide disabled:opacity-40 ${block ? 'w-full' : ''} ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
