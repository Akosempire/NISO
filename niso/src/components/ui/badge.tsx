import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

const variantStyles = {
  default: 'bg-indigo-100 text-indigo-800',
  secondary: 'bg-gray-100 text-gray-800',
  destructive: 'bg-red-100 text-red-800',
  outline: 'border border-gray-300 text-gray-700',
};

export function Badge({ variant = 'default', className = '', ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
        variantStyles[variant]
      } ${className}`}
      {...props}
    />
  );
}