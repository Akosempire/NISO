import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

const variantStyles = {
  default:
    'bg-[var(--brand-teal)] text-white hover:bg-[var(--brand-teal-strong)] focus:ring-[var(--brand-teal)]',
  outline:
    'border border-[var(--border)] bg-white text-[var(--text-primary)] hover:bg-[var(--surface-muted)] focus:ring-[var(--brand-teal)]',
  ghost:
    'text-[var(--text-primary)] hover:bg-[var(--surface-muted)] focus:ring-[var(--brand-teal)]',
  destructive: 'bg-[var(--danger)] text-white hover:opacity-90 focus:ring-[var(--danger)]',
};

const sizeStyles = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-6 text-base',
};

export function Button({
  variant = 'default',
  size = 'md',
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        variantStyles[variant]
      } ${sizeStyles[size]} ${className}`}
      disabled={disabled}
      {...props}
    />
  );
}
