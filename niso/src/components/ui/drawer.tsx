export function Drawer({
  open,
  onClose,
  direction = 'right',
  children,
}: {
  open: boolean;
  onClose: () => void;
  direction?: 'left' | 'right' | 'top' | 'bottom';
  children: React.ReactNode;
}) {
  if (!open) return null;

  const directionClasses = {
    right: 'inset-y-0 right-0 animate-in slide-in-from-right',
    left: 'inset-y-0 left-0 animate-in slide-in-from-left',
    top: 'inset-x-0 top-0 animate-in slide-in-from-top',
    bottom: 'inset-x-0 bottom-0 animate-in slide-in-from-bottom',
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      <div className={`fixed ${directionClasses[direction]} z-50 bg-white`}>
        {children}
      </div>
    </>
  );
}

export function DrawerContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

export function DrawerHeader({ children }: { children: React.ReactNode }) {
  return <div className="border-b border-gray-200 p-6">{children}</div>;
}

export function DrawerTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold text-gray-900">{children}</h2>;
}

export function DrawerDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-600 mt-1">{children}</p>;
}