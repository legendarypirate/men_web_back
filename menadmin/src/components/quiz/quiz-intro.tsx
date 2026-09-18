'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart2,
  Clock,
  Dumbbell,
  Info,
  Lock,
  Shield,
  Tag,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const FEATURES = [
  {
    icon: Target,
    title: 'Таны одоогийн түвшин',
    body: 'Юунд илүү анхаарах хэрэгтэйгээ ойлгоно.',
  },
  {
    icon: Dumbbell,
    title: 'Танд тохирсон чиглэл',
    body: 'Ямар дасгалаас эхлэхээ мэднэ.',
  },
  {
    icon: BarChart2,
    title: 'Хувийн төлөвлөгөө',
    body: 'TenkheePlus апп дээр өдөр бүр дагах хийх хөтөлбөр авна.',
  },
  {
    icon: Shield,
    title: '100% нууцлалтай',
    body: 'Таны мэдээлэл бүрэн нууц байгаад аюулгүй.',
  },
] as const;

const META = [
  { icon: Clock, label: '1–2 минут' },
  { icon: Tag, label: 'Үнэгүй' },
  { icon: Lock, label: 'Хувийн мэдээлэл нууц' },
] as const;

const DAYS: { label: string; num: string; active?: boolean }[] = [
  { label: 'Да', num: '14' },
  { label: 'Мя', num: '15' },
  { label: 'Лх', num: '16' },
  { label: 'Пү', num: '17' },
  { label: 'Ба', num: '18', active: true },
  { label: 'Бш', num: '19' },
  { label: 'Ня', num: '20' },
];

const BOTTOM_NAV = [
  { label: 'Нүүр', active: true },
  { label: 'Мэдэр' },
  { label: 'Эмэлт' },
  { label: 'Дасгал' },
  { label: 'Профайл' },
];

type QuizIntroProps = {
  onStart: () => void;
  className?: string;
};

export function QuizIntro({ onStart, className }: QuizIntroProps) {
  return (
    <div className={cn('relative flex w-full flex-1 overflow-hidden', className)}>
      {/* ════════════════════════════════════════
          LEFT HALF — anatomy background + phone overlay
          ════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative hidden w-1/2 shrink-0 lg:block"
      >
        {/* Anatomy image fills the entire left half */}
        <Image
          src="/body-anatomy.jpg"
          alt="Аарцгийн булчин"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Gradient: fade left edge into bg */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#070b10]/70 via-transparent to-[#070b10]/80" />
        {/* Gradient: fade top into bg */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#070b10]/50 via-transparent to-[#070b10]/60" />

        {/* Phone mockup — bottom-left area, overlaid on the image */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-10 left-10"
        >
          <PhoneMockup />
        </motion.div>

        {/* Italic tagline — bottom-right of the left half */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="absolute bottom-8 right-6 space-y-0.5 text-right"
        >
          {['Илүү хүчтэй', 'Илүү итгэлтэй', 'Илүү сайн амьдрал'].map((line) => (
            <p key={line} className="font-serif text-base italic text-white/30">
              {line}
            </p>
          ))}
        </motion.div>
      </motion.div>

      {/* ════════════════════════════════════════
          RIGHT HALF — content
          ════════════════════════════════════════ */}
      <div className="flex flex-1 flex-col justify-center px-8 py-10 lg:px-12 xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Brand */}
          <p className="text-lg font-bold tracking-tight">
            <span className="text-[#ff453a]">Tenkhee</span>
            <span className="text-white">Plus</span>
          </p>

          {/* Headline */}
          <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-[2.5rem]">
            Танд яг юу хэрэгтэйг{' '}
            <span className="text-[#ff453a]">1 минутанд</span> тодорхойлъё.
          </h1>

          {/* Description */}
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/55 sm:text-[0.9rem]">
            Хэдэн асуулт хариулахад хөвчрөлт, дур тавилтын хяналт, аарцгийн
            булчин, давсагны үйл ажиллагаатай холбоотой таны одоогийн түвшинг
            үнэлнэ.
          </p>
        </motion.div>

        {/* Feature cards — 4 in a row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 grid grid-cols-2 gap-3 xl:grid-cols-4"
        >
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-[#ff453a]/30 hover:bg-white/[0.07]"
            >
              <div className="mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-[#ff453a]/15 text-[#ff453a]">
                <Icon className="size-5" strokeWidth={2} />
              </div>
              <p className="text-sm font-bold text-white">{title}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-white/45">{body}</p>
            </div>
          ))}
        </motion.div>

        {/* Meta row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/40 sm:text-sm"
        >
          {META.map(({ icon: Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-2">
              <Icon className="size-4 text-[#ff453a]/70" />
              {label}
            </span>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mt-7"
        >
          <motion.button
            type="button"
            onClick={onStart}
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 500, damping: 22 }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ff453a] to-[#e63e35] px-6 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-[#ff453a]/30 hover:from-[#e63e35] hover:to-[#d63530] sm:text-base"
          >
            Миний үнэлгээг эхлүүлэх
            <ArrowRight className="size-5" />
          </motion.button>

          <p className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-white/30 sm:text-xs">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            <span>
              Энэхүү үнэлгээ нь эмнэлгийн оношилгоо биш бөгөөд TenkheePlus доторх
              тохирох дасгал, мэдаллийн чиглэлийг сонгоход зориулагдана.
            </span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

/* ── Phone mockup ── */
function PhoneMockup() {
  return (
    <div className="relative aspect-[10/19] w-[200px] overflow-hidden rounded-[2.2rem] border border-white/15 bg-[#0d1219] shadow-2xl shadow-black/70 ring-1 ring-white/5">
      {/* Dynamic island / notch */}
      <div className="absolute left-1/2 top-2.5 z-20 h-4 w-20 -translate-x-1/2 rounded-full bg-black" />

      <div className="flex h-full flex-col">
        {/* Status bar */}
        <div className="flex shrink-0 items-center justify-between px-5 pt-8 pb-1 text-[8px] text-white/50">
          <span className="font-semibold">9:41</span>
          <div className="flex items-center gap-0.5 text-[8px]">
            <span>▲▲▲</span>
            <span className="ml-0.5">▮</span>
          </div>
        </div>

        {/* Date header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/8 px-4 pb-2 pt-0.5">
          <div>
            <p className="text-[9px] font-semibold text-white">Баасан, 8-р сар 18 2026</p>
          </div>
          <div className="size-5 rounded-full bg-white/10 text-center text-[7px] leading-5 text-white/40">⊙</div>
        </div>

        {/* Day picker */}
        <div className="flex shrink-0 items-center gap-1 overflow-hidden px-3 py-2">
          {DAYS.map(({ label, num, active }) => (
            <div
              key={num}
              className={cn(
                'flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg py-1 text-[7px]',
                active ? 'bg-[#ff453a] text-white' : 'bg-white/5 text-white/40'
              )}
            >
              <span>{label}</span>
              <span className={cn('font-bold text-[8px]', active ? 'text-white' : 'text-white/60')}>{num}</span>
            </div>
          ))}
        </div>

        {/* tenkhee + header */}
        <div className="flex shrink-0 items-center justify-between px-4 pb-1">
          <span className="text-[10px] font-bold text-white">tenkhee +</span>
          <span className="text-[7px] text-white/35">Өнөөдөр харах &rsaquo;</span>
        </div>

        {/* Workout banner with photo */}
        <div className="relative mx-3 mb-2 h-[80px] shrink-0 overflow-hidden rounded-xl">
          <Image
            src="/workout-thumb.jpg"
            alt="workout"
            fill
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-2.5">
            <p className="text-[7px] font-bold uppercase tracking-wide text-[#ff453a]">ЯАК БАЙНА</p>
            <p className="text-[9px] font-bold leading-tight text-white">
              Анхан шатны кегел<br />дасгал
            </p>
            <p className="mt-0.5 text-[6.5px] text-white/45">Дасгалын хэмж: 0/7</p>
          </div>
        </div>

        {/* Section header */}
        <div className="flex shrink-0 items-center justify-between px-4 pb-1">
          <span className="text-[9px] font-bold text-white">Дасгалын хөтөлбөр</span>
          <span className="text-[7px] text-white/35">Дэлгэрэнгүй &rsaquo;</span>
        </div>

        {/* Workout card */}
        <div className="mx-3 flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] p-2">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#ff453a]/20">
            <div className="size-4 rounded bg-[#ff453a]/70" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[8px] font-semibold text-white">Дасгалын хөтөлбөр оппоор</p>
            <button className="mt-1.5 rounded bg-[#ff453a] px-2 py-0.5 text-[6px] font-bold text-white">
              Эхлэх
            </button>
          </div>
        </div>

        <div className="flex-1" />

        {/* Bottom nav */}
        <div className="flex shrink-0 items-center justify-around border-t border-white/10 bg-[#0d1219] px-1 pb-3 pt-2">
          {BOTTOM_NAV.map(({ label, active }) => (
            <div
              key={label}
              className={cn(
                'flex flex-col items-center gap-0.5',
                active ? 'text-[#ff453a]' : 'text-white/25'
              )}
            >
              <div
                className={cn(
                  'size-3 rounded',
                  active ? 'bg-[#ff453a]' : 'bg-white/15'
                )}
              />
              <span className="text-[5.5px]">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
