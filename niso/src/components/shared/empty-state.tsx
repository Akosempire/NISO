'use client';

import { AlertCircle, Search } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon = <Search className="w-12 h-12" />,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-gray-400 mb-4">{icon}</div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-600 text-center max-w-sm mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'An error occurred while loading the data. Please try again.',
  action,
}: Omit<EmptyStateProps, 'icon'>) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-red-400 mb-4">
        <AlertCircle className="w-12 h-12" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-600 text-center max-w-sm mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
