import Link from 'next/link';
import { SITE } from '@/lib/site-config';

type Props = {
  className?: string;
  size?: 'default' | 'large';
};

export function StoreBadges({ className, size = 'default' }: Props) {
  const large = size === 'large';

  return (
    <div className={className}>
      <div className={`flex flex-wrap items-center gap-3 ${large ? 'gap-4' : ''}`}>
        <Link
          href={SITE.appStoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 transition hover:border-white/30 hover:bg-white/10 ${
            large ? 'px-5 py-3.5' : 'px-4 py-3'
          }`}
        >
          <AppleIcon />
          <span className="text-left">
            <span className="block text-[10px] uppercase tracking-wide text-white/60">
              Download on the
            </span>
            <span className={`block font-semibold text-white ${large ? 'text-base' : 'text-sm'}`}>
              App Store
            </span>
          </span>
        </Link>

        <Link
          href={SITE.playStoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 transition hover:border-white/30 hover:bg-white/10 ${
            large ? 'px-5 py-3.5' : 'px-4 py-3'
          }`}
        >
          <PlayIcon />
          <span className="text-left">
            <span className="block text-[10px] uppercase tracking-wide text-white/60">
              Get it on
            </span>
            <span className={`block font-semibold text-white ${large ? 'text-base' : 'text-sm'}`}>
              Google Play
            </span>
          </span>
        </Link>
      </div>
    </div>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-7 fill-white" aria-hidden>
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-7" aria-hidden>
      <path
        fill="#34A853"
        d="M3.6 2.5A1.5 1.5 0 0 0 2 4v16a1.5 1.5 0 0 0 2.3 1.27l12.6-7.2a1.5 1.5 0 0 0 0-2.54L3.6 2.5z"
      />
      <path fill="#FBBC04" d="M14.9 12 3.6 19.27V4.73L14.9 12z" opacity=".9" />
    </svg>
  );
}
