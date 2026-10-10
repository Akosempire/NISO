export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={`w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--text-primary)] shadow-none outline-none placeholder:text-[var(--text-secondary)] focus:border-[var(--brand-teal)] focus:ring-2 focus:ring-[color:rgba(67,106,109,0.14)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-secondary)] ${className}`}
      {...props}
    />
  );
}
