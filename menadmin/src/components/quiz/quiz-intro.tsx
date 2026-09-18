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

/* Days row in the phone mockup */
const DAYS: { label: string; num: string; active?: boolean }[] = [
  { label: 'Да', num: '14' },
  { label: 'Мя', num: '15' },
  { label: 'Лх', num: '16' },
  { label: 'Пү', num: '17' },
  { label: 'Ба', num: '18', active: true },
  { label: 'Бш', num: '19' },
  { label: 'Ня', num: '20' },
];


const BOTTOM_NAV = ['Нүүр', 'Мэдэр', 'Эмэлт', 'Дасгал', 'Профайл'] as const;

type QuizIntroProps = {
  onStart: () => void;
  className?: string;
};

export function QuizIntro({ onStart, className }: QuizIntroProps) {
  return (
    <div className={cn('relative w-full flex-1 overflow-hidden', className)}>
      {/* ── Full-bleed 3-column layout ── */}
      <div className="grid h-full min-h-[calc(100dvh-112px)] grid-cols-1 lg:grid-cols-[480px_1fr_minmax(520px,640px)]">

        {/* ── LEFT: Phone mockup ── */}
        <motion.div
          initial={{ opacity: 0, x: -32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:flex items-end justify-center pb-10 pl-10"
        >
          <PhoneMockup />
        </motion.div>

        {/* ── CENTRE: Anatomy hero image with italic tagline ── */}
        <div className="relative hidden lg:block">
          <Image
            src="/body-anatomy.jpg"
            alt="Аарцгийн булчин"
            fill
            className="object-cover object-top"
            priority
          />
          {/* gradient overlays to blend into background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#070b10] via-transparent to-[#070b10]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070b10]/80 via-transparent to-[#070b10]/60" />

          {/* Italic tagline at bottom-left of the image */}
          <div className="absolute bottom-16 left-0 right-0 px-6 text-center">
            <p className="font-serif text-lg italic leading-relaxed text-white/30">
              Илүү хүчтэй
            </p>
            <p className="font-serif text-lg italic leading-relaxed text-white/30">
              Илүү итгэлтэй
            </p>
            <p className="font-serif text-lg italic leading-relaxed text-white/30">
              Илүү сайн амьдрал
            </p>
          </div>
        </div>

        {/* ── RIGHT: Content ── */}
        <div className="flex flex-col justify-center px-8 py-10 lg:px-10 xl:px-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Brand name */}
            <p className="text-lg font-bold tracking-tight">
              <span className="text-[#ff453a]">Tenkhee</span>
              <span className="text-white">Plus</span>
            </p>

            {/* Headline */}
            <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight lg:text-4xl xl:text-[2.6rem]">
              Танд яг юу хэрэгтэйг{' '}
              <span className="text-[#ff453a]">1 минутанд</span> тодорхойлъё.
            </h1>

            {/* Sub-description */}
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/55 sm:text-[0.95rem]">
              Хэдэн асуулт хариулахад хөвчрөлт, дур тавилтын хяналт, аарцгийн
              булчин, давсагны үйл ажиллагаатай холбоотой таны одоогийн түвшинг
              үнэлнэ.
            </p>
          </motion.div>

          {/* Feature cards – 2×2 on narrow, 4 in a row on wide right panel */}
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

          {/* CTA button */}
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
    </div>
  );
}

/* ── Phone mockup component ── */
function PhoneMockup() {
  return (
    <div className="relative aspect-[10/19] w-[220px] overflow-hidden rounded-[2.5rem] border border-white/15 bg-gradient-to-b from-[#141a22] to-[#0a0f14] p-3 shadow-2xl shadow-black/60">
      {/* Notch */}
      <div className="absolute left-1/2 top-3 h-5 w-24 -translate-x-1/2 rounded-full bg-black/70" />

      <div className="flex h-full flex-col overflow-hidden rounded-[2rem] bg-[#0f1419]">
        {/* Status bar */}
        <div className="flex shrink-0 items-center justify-between px-4 pt-7 pb-1 text-[9px] text-white/50">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <span>●●●</span>
            <span>▲</span>
            <span>⬛</span>
          </div>
        </div>

        {/* Header row */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 pb-2 pt-1">
          <p className="text-[11px] font-semibold">Баасан, 8-р сар 18 2026</p>
          <div className="size-5 rounded-full bg-white/10" />
        </div>

        {/* Days row */}
        <div className="flex shrink-0 gap-1 overflow-x-auto px-3 py-2 scrollbar-none">
          {DAYS.map(({ label, num, active }) => (
            <div
              key={num}
              className={cn(
                'flex min-w-[26px] flex-col items-center gap-0.5 rounded-lg py-1 text-[8px]',
                active
                  ? 'bg-[#ff453a] text-white'
                  : 'bg-white/5 text-white/40'
              )}
            >
              <span>{label}</span>
              <span className="font-bold">{num}</span>
            </div>
          ))}
        </div>

        {/* tenkhee + label */}
        <div className="flex shrink-0 items-center justify-between px-4 py-1.5">
          <span className="text-[10px] font-bold">tenkhee +</span>
          <span className="text-[8px] text-white/40">Өнөөдөр харах &gt;</span>
        </div>

        {/* Workout banner card */}
        <div className="mx-3 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#1a0808] to-[#0a0f14]">
          <div className="relative flex items-end gap-2 p-3">
            <div className="absolute inset-0 bg-gradient-to-r from-[#ff453a]/20 to-transparent" />
            <div className="relative z-10">
              <p className="text-[8px] font-semibold uppercase tracking-wide text-[#ff453a]">ЯАК БАЙНА</p>
              <p className="text-[10px] font-bold text-white">Анхан шатны кегел<br />дасгал</p>
              <p className="mt-0.5 text-[7px] text-white/40">Дасгалын хэмж: 0/7</p>
            </div>
          </div>
        </div>

        {/* Section label */}
        <div className="flex shrink-0 items-center justify-between px-4 pt-2 pb-1">
          <span className="text-[10px] font-bold">Дасгалын хөтөлбөр</span>
          <span className="text-[8px] text-white/40">Дэлгэрэнгүй &gt;</span>
        </div>

        {/* Workout list item */}
        <div className="mx-3 flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#ff453a]/20">
            <div className="size-4 rounded-sm bg-[#ff453a]/60" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[9px] font-semibold">Дасгалын хөтөлбөр оппоор</p>
            <button className="mt-1 rounded bg-[#ff453a] px-2 py-0.5 text-[7px] font-bold text-white">
              Эхлэх
            </button>
          </div>
        </div>

        <div className="flex-1" />

        {/* Bottom nav */}
        <div className="flex shrink-0 items-center justify-around border-t border-white/10 bg-[#0f1419]/95 px-2 py-2">
          {BOTTOM_NAV.map((label, i) => (
            <div
              key={label}
              className={cn(
                'flex flex-col items-center gap-0.5',
                i === 0 ? 'text-[#ff453a]' : 'text-white/30'
              )}
            >
              <div
                className={cn(
                  'size-3 rounded-sm',
                  i === 0 ? 'bg-[#ff453a]' : 'bg-white/20'
                )}
              />
              <span className="text-[6px]">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
