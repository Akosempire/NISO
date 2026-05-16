export function Checkbox({
  checked,
  onChange,
  disabled,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className={`w-4 h-4 rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500 ${className}`}
      {...props}
    />
  );
}
