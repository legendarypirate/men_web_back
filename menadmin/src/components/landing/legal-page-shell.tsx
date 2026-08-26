import type { ReactNode } from 'react';
import Link from 'next/link';
import { TenkheeLogo } from '@/components/brand/tenkhee-logo';
import { SITE } from '@/lib/site-config';

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function LegalPageShell({ title, subtitle, children }: Props) {
  return (
    <div className="min-h-screen bg-[#070b10] text-white">
      <header className="border-b border-white/10 bg-[#0a0f14]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <div className="flex items-start gap-4">
            <TenkheeLogo href="/" size="md" className="mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[#ff453a]">{SITE.name}</p>
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
              <p className="mt-1 text-sm text-white/55">{subtitle}</p>
            </div>
          </div>
          <Link
            href="/login"
            className="shrink-0 text-sm font-medium text-[#ff453a] hover:underline"
          >
            Admin
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">{children}</main>

      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto max-w-3xl px-6 text-center text-sm text-white/50">
          <p>
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <p className="mt-2 space-x-4">
            <Link href="/" className="hover:text-white">
              {SITE.domain}
            </Link>
            <Link href="/support" className="hover:text-[#ff453a]">
              Дэмжлэг
            </Link>
            <Link href="/privacy" className="hover:text-[#ff453a]">
              Нууцлал
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
