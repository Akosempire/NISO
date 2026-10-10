import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BrandLogo } from '@/components/layout/brand-logo';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-16 md:px-10">
        <div className="max-w-4xl rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 md:p-12">
          <BrandLogo className="h-auto w-full max-w-3xl" title="NISO brand logo" />

          <div className="mt-10 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--brand-teal)]">
              Transmission Operations Platform
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--text-primary)] md:text-5xl">
              Centralized monitoring, reporting, and interruption control for grid operations.
            </h1>
            <p className="mt-4 text-lg leading-8 text-[var(--text-secondary)]">
              The NISO workspace brings operational readings, feeder performance, incident tracking,
              and knowledge workflows into one coordinated system.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--brand-teal)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-teal-strong)]"
            >
              Open dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/knowledge"
              className="inline-flex items-center justify-center rounded-md border border-[var(--border)] px-6 py-3 text-sm font-semibold text-[var(--brand-teal)] transition-colors hover:bg-[var(--surface-muted)]"
            >
              Browse knowledge base
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
