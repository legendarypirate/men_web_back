import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { SITE } from '@/lib/site-config';

const sizes = {
  sm: { box: 'size-8', img: 32, rounded: 'rounded-lg' },
  md: { box: 'size-10', img: 40, rounded: 'rounded-xl' },
  lg: { box: 'size-14', img: 56, rounded: 'rounded-2xl' },
  xl: { box: 'size-16', img: 64, rounded: 'rounded-2xl' },
} as const;

type Props = {
  size?: keyof typeof sizes;
  className?: string;
  href?: string;
  showLabel?: boolean;
  labelClassName?: string;
};

export function TenkheeLogo({
  size = 'md',
  className,
  href,
  showLabel = false,
  labelClassName,
}: Props) {
  const spec = sizes[size];

  const mark = (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-black',
        spec.box,
        spec.rounded,
        className
      )}
    >
      <Image
        src="/logo.png"
        alt={SITE.name}
        width={spec.img}
        height={spec.img}
        className="h-full w-full object-contain"
        priority
      />
    </span>
  );

  if (!showLabel && !href) return mark;

  const content = (
    <span className="inline-flex items-center gap-3">
      {mark}
      {showLabel && (
        <span className={labelClassName}>
          <span className="block text-sm font-bold leading-tight">{SITE.name}</span>
          <span className="block text-xs opacity-60">{SITE.domain}</span>
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center gap-3">
        {content}
      </Link>
    );
  }

  return content;
}
