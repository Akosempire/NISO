import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BrandLogo } from '@/components/layout/brand-logo';

export default function Home() {
  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#eef5f1_0%,#f7faf8_45%,#ffffff_100%)]">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-16 md:px-10">
        <div className="max-w-4xl rounded-[2rem] border border-[#d8e6df] bg-white/90 p-8 shadow-[0_24px_90px_rgba(63,104,109,0.12)] backdrop-blur md:p-12">
          <BrandLogo className="h-auto w-full max-w-3xl" title="NISO brand logo" />

          <div className="mt-10 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#6c9480]">
              Transmission Operations Platform
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#163237] md:text-5xl">
              Centralized monitoring, reporting, and interruption control for grid operations.
            </h1>
            <p className="mt-4 text-lg leading-8 text-[#49686a]">
              The NISO workspace brings operational readings, feeder performance, incident tracking,
              and knowledge workflows into one coordinated system.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#3f686d] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#31555a]"
            >
              Open dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/knowledge"
              className="inline-flex items-center justify-center rounded-full border border-[#c8dad1] px-6 py-3 text-sm font-semibold text-[#31555a] transition-colors hover:border-[#3f686d] hover:text-[#163237]"
            >
              Browse knowledge base
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
