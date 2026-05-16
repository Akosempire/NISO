'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { PageHeader } from './page-header';
import { Card } from '@/components/ui/card';
import { Construction, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';

interface PlaceholderPageProps {
  title: string;
  description?: string;
  hint?: string;
  children?: ReactNode;
}

export function PlaceholderPage({
  title,
  description,
  hint,
  children,
}: PlaceholderPageProps) {
  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader title={title} description={description} />

        {children ?? (
          <Card className="p-12">
            <div className="flex flex-col items-center text-center max-w-md mx-auto">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                <Construction className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Coming soon</h2>
              <p className="text-sm text-gray-600 mt-2">
                {hint ?? `The ${title} module is part of NISO's roadmap and will be built out in an upcoming release.`}
              </p>
              <Link
                href="/dashboard"
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to dashboard
              </Link>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
