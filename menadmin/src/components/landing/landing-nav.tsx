'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { TenkheeLogo } from '@/components/brand/tenkhee-logo';
import { buttonVariants } from '@/components/ui/button';
import { LANDING_NAV } from '@/lib/site-config';
import { cn } from '@/lib/utils';

export function LandingNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0f14]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <TenkheeLogo
          href="/"
          size="md"
          showLabel
          className="shadow-lg shadow-black/30"
          labelClassName="hidden sm:block text-white"
        />

        <nav className="hidden items-center gap-1 md:flex">
          {LANDING_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/login"
            className={cn(
              buttonVariants({ size: 'default' }),
              'ml-2 bg-[#ff453a] text-white hover:bg-[#e63e35]'
            )}
          >
            Нэвтрэх
          </Link>
        </nav>

        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-lg text-white md:hidden"
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <div
        className={cn(
          'border-t border-white/10 bg-[#0a0f14] md:hidden',
          open ? 'block' : 'hidden'
        )}
      >
        <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
          {LANDING_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 hover:bg-white/5"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className={cn(
              buttonVariants({ size: 'default' }),
              'mt-2 w-full bg-[#ff453a] text-white hover:bg-[#e63e35]'
            )}
          >
            Нэвтрэх
          </Link>
        </nav>
      </div>
    </header>
  );
}
