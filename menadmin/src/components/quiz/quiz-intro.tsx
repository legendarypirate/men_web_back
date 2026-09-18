'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart2,
  BookOpen,
  ChevronRight,
  Clock,
  Dumbbell,
  Home,
  Hourglass,
  Info,
  Lock,
  PlusSquare,
  Shield,
  ShoppingBag,
  Tag,
  Target,
  User,
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
  { label: 'Бя', num: '19' },
  { label: 'Ня', num: '20' },
];

type QuizIntroProps = {
  onStart: () => void;
  className?: string;
};

export function QuizIntro({ onStart, className }: QuizIntroProps) {
  return (
    <div
      className={cn(
        'relative h-full min-h-0 w-full flex-1 bg-[#070b10]',
        className
      )}
    >
      <Image
        src="/backg.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[left_center]"
      />

      <div className="pointer-events-auto absolute inset-0 flex items-center">
        {/* Content over the right side of the background */}
        <div className="relative z-10 ml-auto flex w-full flex-col justify-center px-6 py-8 sm:px-8 lg:w-[62%] lg:max-w-[920px] lg:px-10 lg:pr-10 xl:w-[60%] xl:px-12 xl:pr-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Brand */}
          <p className="text-xl font-extrabold tracking-tight">
            <span className="text-white">Tenkhee</span>
            <span className="text-[#ff453a]">Plus</span>
          </p>

          {/* Headline */}
          <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-[2.6rem]">
            Танд яг юу хэрэгтэйг{' '}
            <span className="text-[#ff453a]">1 минутанд</span> тодорхойлъё.
          </h1>

          {/* Description */}
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/60 sm:text-[0.95rem]">
            Хэдэн асуулт хариулаад хөвчрөлт, дур тавилтын хяналт, аарцгийн
            булчин, давсагны үйл ажиллагаатай холбоотой таны одоогийн түвшинг
            үнэлнэ.
          </p>
        </motion.div>

        {/* Feature cards — 4 in a row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-3.5"
        >
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#121620]/60 p-4 text-center transition hover:border-[#ff453a]/30 hover:bg-[#161c28] lg:p-5"
            >
              <div className="mb-3 flex size-10 items-center justify-center text-[#ff453a]">
                <Icon className="size-7" strokeWidth={1.8} />
              </div>
              <p className="text-sm font-bold text-white leading-snug">{title}</p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-white/50">{body}</p>
            </div>
          ))}
        </motion.div>

        {/* Meta row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-white/50 sm:text-sm lg:justify-start"
        >
          {META.map(({ icon: Icon, label }, index) => (
            <div key={label} className="flex items-center gap-6">
              <span className="inline-flex items-center gap-2">
                <Icon className="size-4 text-[#ff453a]" />
                {label}
              </span>
              {index < META.length - 1 && (
                <span className="h-4 w-[1px] bg-white/15" />
              )}
            </div>
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
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ff453a] to-[#e63e35] px-6 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-[#ff453a]/30 hover:from-[#e63e35] hover:to-[#d63530] sm:text-base"
          >
            МИНИЙ ҮНЭЛГЭЭГ ЭХЛҮҮЛЭХ
            <ArrowRight className="size-5" />
          </motion.button>

          <p className="mt-4 flex items-start justify-center gap-2 text-center text-[11px] leading-relaxed text-white/35 sm:text-xs lg:justify-start lg:text-left">
            <Info className="mt-0.5 size-3.5 shrink-0 text-white/50" />
            <span>
              Энэхүү үнэлгээ нь эмнэлгийн оношилгоо биш бөгөөд TenkheePlus доторх
              тохирох дасгал, мэдээллийн чиглэлийг сонгоход зориулагдана.
            </span>
          </p>
        </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ── Phone mockup matching reference screenshot ── */
function PhoneMockup() {
  return (
    <div className="relative aspect-[9/18.5] w-[270px] sm:w-[285px] xl:w-[300px] overflow-hidden rounded-[2.8rem] border-[5px] border-[#22272e] bg-[#0b0f14] shadow-[0_25px_60px_rgba(0,0,0,0.9)] ring-1 ring-white/15">
      {/* Side buttons simulation */}
      <div className="absolute -left-[9px] top-24 h-7 w-[4px] rounded-l-sm bg-[#333a42]" />
      <div className="absolute -left-[9px] top-36 h-10 w-[4px] rounded-l-sm bg-[#333a42]" />
      <div className="absolute -left-[9px] top-48 h-10 w-[4px] rounded-l-sm bg-[#333a42]" />
      <div className="absolute -right-[9px] top-32 h-14 w-[4px] rounded-r-sm bg-[#333a42]" />

      {/* Dynamic island */}
      <div className="absolute left-1/2 top-2.5 z-30 flex h-4.5 w-24 -translate-x-1/2 items-center justify-end px-2.5 rounded-full bg-black">
        <div className="size-2 rounded-full bg-[#12161f]" />
      </div>

      <div className="flex h-full flex-col justify-between pt-1 pb-1">
        {/* Status bar */}
        <div className="flex shrink-0 items-center justify-between px-6 pt-2.5 pb-1 text-[9px] font-medium text-white/80">
          <span>9:41</span>
          <div className="flex items-center gap-1.5 text-[9px]">
            <span className="text-[10px] font-bold">5G</span>
            <div className="flex gap-0.5">
              <div className="h-2 w-0.5 bg-white rounded-full" />
              <div className="h-2 w-0.5 bg-white rounded-full" />
              <div className="h-2 w-0.5 bg-white rounded-full" />
              <div className="h-2 w-0.5 bg-white/40 rounded-full" />
            </div>
            <div className="h-2.5 w-5 rounded-sm border border-white/60 p-0.5 flex items-center">
              <div className="h-full w-3 bg-white rounded-xs" />
            </div>
          </div>
        </div>

        {/* Date header with info button */}
        <div className="flex shrink-0 items-center justify-between px-5 pt-1 pb-2">
          <span className="text-[11px] font-bold tracking-tight text-white/90">
            Баасан, 9-р сар 18 2026
          </span>
          <button
            type="button"
            className="flex size-5 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 transition"
          >
            <Info className="size-3" />
          </button>
        </div>

        {/* Day selector row */}
        <div className="flex shrink-0 items-center gap-1 px-3 py-1">
          {DAYS.map(({ label, num, active }) => (
            <div
              key={num}
              className={cn(
                'flex flex-1 flex-col items-center justify-center py-1.5 rounded-xl transition',
                active
                  ? 'bg-[#ff453a] text-white shadow-md shadow-[#ff453a]/40 ring-1 ring-[#ff453a]'
                  : 'bg-white/[0.06] text-white/40'
              )}
            >
              <span className="text-[8px] font-medium">{label}</span>
              <span className={cn('text-[10px] font-extrabold mt-0.5', active ? 'text-white' : 'text-white/80')}>
                {num}
              </span>
            </div>
          ))}
        </div>

        {/* Header row 1: tenkhee + */}
        <div className="flex shrink-0 items-center justify-between px-5 pt-2 pb-1.5">
          <span className="text-[13px] font-extrabold tracking-tight text-white">
            tenkhee <span className="text-[#ff453a]">+</span>
          </span>
          <span className="flex items-center gap-0.5 text-[9px] font-medium text-white/40 hover:text-white/70">
            Бүгдийг харах <ChevronRight className="size-3" />
          </span>
        </div>

        {/* Card 1: Workout Banner with photo */}
        <div className="relative mx-3.5 h-[105px] shrink-0 overflow-hidden rounded-2xl border border-white/10">
          <Image
            src="/workout-thumb.jpg"
            alt="workout"
            fill
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

          {/* Badge top right */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 px-2 py-0.5">
            <span className="size-1.5 rounded-full bg-[#ff453a]" />
            <span className="text-[7.5px] font-bold text-white tracking-wide">ЯВЖ БАЙНА</span>
          </div>

          {/* Card info bottom */}
          <div className="absolute inset-x-0 bottom-0 p-3">
            <p className="text-[11px] font-extrabold leading-snug text-white">
              Анхан шатны кегел<br />дасгал
            </p>
            <p className="mt-1 text-[8px] text-white/50">Дасгалын өдөр: 0/7</p>

            {/* Progress bar */}
            <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/20">
              <div className="h-full w-[10%] rounded-full bg-white/80" />
            </div>
          </div>
        </div>

        {/* Header row 2: Дасгалын хөтөлбөр */}
        <div className="flex shrink-0 items-center justify-between px-5 pt-2 pb-1">
          <span className="text-[12px] font-extrabold tracking-tight text-white">
            Дасгалын хөтөлбөр
          </span>
          <span className="flex items-center gap-0.5 text-[9px] font-medium text-white/40 hover:text-white/70">
            Дэлгэрэнгүй <ChevronRight className="size-3" />
          </span>
        </div>

        {/* Card 2: Hourglass Card */}
        <div className="mx-3.5 flex shrink-0 items-center justify-between rounded-2xl border border-white/10 bg-[#161d26]/90 p-3 shadow-lg">
          <div className="flex items-center gap-3">
            {/* Glowing red hourglass icon */}
            <div className="relative flex size-11 shrink-0 items-center justify-center rounded-full bg-red-950/80 border border-red-500/40 shadow-[0_0_15px_rgba(255,69,58,0.4)]">
              <Hourglass className="size-5 text-[#ff453a]" />
            </div>
            <p className="max-w-[110px] text-[10px] font-bold leading-tight text-white">
              Дасгалын хөтөлбөрөө олоорой
            </p>
          </div>
          <button
            type="button"
            className="rounded-full bg-[#ff453a] px-3.5 py-1.5 text-[9.5px] font-bold text-white shadow-md shadow-[#ff453a]/30 hover:bg-[#e63e35] transition"
          >
            Эхлэх
          </button>
        </div>

        {/* Bottom Navigation Bar */}
        <div className="mt-2 mx-2 flex shrink-0 items-center justify-around rounded-2xl border border-white/10 bg-[#11161d]/95 p-1.5 backdrop-blur-md">
          {/* Item 1: Нүүр (Active) */}
          <div className="flex flex-col items-center gap-0.5 rounded-xl bg-white/10 px-2.5 py-1 text-white">
            <Home className="size-3.5 text-white" />
            <span className="text-[7.5px] font-bold">Нүүр</span>
          </div>

          {/* Item 2: Мэдлэг (With badge 5) */}
          <div className="relative flex flex-col items-center gap-0.5 px-2 py-1 text-white/40">
            <div className="relative">
              <BookOpen className="size-3.5 text-white/50" />
              <span className="absolute -top-1.5 -right-2 flex size-3.5 items-center justify-center rounded-full bg-[#ff453a] text-[7px] font-extrabold text-white ring-1 ring-black">
                5
              </span>
            </div>
            <span className="text-[7.5px] font-medium">Мэдлэг</span>
          </div>

          {/* Item 3: Эмнэлэг */}
          <div className="flex flex-col items-center gap-0.5 px-2 py-1 text-white/40">
            <PlusSquare className="size-3.5 text-white/50" />
            <span className="text-[7.5px] font-medium">Эмнэлэг</span>
          </div>

          {/* Item 4: Дэлгүүр */}
          <div className="flex flex-col items-center gap-0.5 px-2 py-1 text-white/40">
            <ShoppingBag className="size-3.5 text-white/50" />
            <span className="text-[7.5px] font-medium">Дэлгүүр</span>
          </div>

          {/* Item 5: Профайл */}
          <div className="flex flex-col items-center gap-0.5 px-2 py-1 text-white/40">
            <User className="size-3.5 text-white/50" />
            <span className="text-[7.5px] font-medium">Профайл</span>
          </div>
        </div>
      </div>
    </div>
  );
}

