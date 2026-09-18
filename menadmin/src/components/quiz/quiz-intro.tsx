'use client';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Clock,
  Dumbbell,
  Info,
  Lock,
  Shield,
  Tag,
  Target,
} from 'lucide-react';
import { TenkheeLogo } from '@/components/brand/tenkhee-logo';
import { cn } from '@/lib/utils';

const FEATURES = [
  {
    icon: Target,
    title: 'Таны одоогийн түвшин',
    body: 'Юунд анхаарахыг ойлгоно',
  },
  {
    icon: Dumbbell,
    title: 'Танд тохирсон чиглэл',
    body: 'Аль дасгалаас эхлэхээ мэднэ',
  },
  {
    icon: BarChart3,
    title: 'Хувийн төлөвлөгөө',
    body: 'TenkheePlus апп дахь өдөр тутмын төлөвлөгөө',
  },
  {
    icon: Shield,
    title: '100% нууцлалтай',
    body: 'Таны мэдээлэл аюулгүй',
  },
] as const;

const META = [
  { icon: Clock, label: '1–2 минут' },
  { icon: Tag, label: 'Үнэгүй' },
  { icon: Lock, label: 'Хувийн мэдээлэл нууц' },
] as const;

type QuizIntroProps = {
  onStart: () => void;
  className?: string;
};

export function QuizIntro({ onStart, className }: QuizIntroProps) {
  return (
    <div className={cn('relative mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8', className)}>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center lg:gap-12">
        <IntroVisuals />

        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-lg font-bold tracking-tight">
              <span className="text-[#ff453a]">Tenkhee</span>
              <span className="text-white">Plus</span>
            </p>
            <h1 className="mt-4 text-2xl font-extrabold leading-snug tracking-tight sm:text-3xl lg:text-[2rem]">
              Танд яг юу хэрэгтэйг{' '}
              <span className="text-[#ff453a]">1 минутанд</span> тодорхойлъё.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">
              Хэдэн асуултад хариулахад л таны эрекц, Аарцгийн булчин, Аарцгийн уян хатан
              байдал, шээгийн хяналтын одоогийн түвшинг үнэлж, танд тохирсон дасгалын
              чиглэлийг санал болгоно.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 grid gap-3 sm:grid-cols-2"
          >
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-[#ff453a]/25 hover:bg-white/[0.06]"
              >
                <div className="mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-[#ff453a]/15 text-[#ff453a]">
                  <Icon className="size-5" strokeWidth={2} />
                </div>
                <p className="text-sm font-bold text-white">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/50">{body}</p>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/45 sm:text-sm"
          >
            {META.map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-2">
                <Icon className="size-4 text-[#ff453a]/80" />
                {label}
              </span>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8"
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

            <p className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-white/35 sm:text-xs">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              <span>
                Энэ үнэлгээ эмчийн онош биш, зөвхөн TenkheePlus апп дахь тохирох дасгалыг
                сонгоход зориулагдсан.
              </span>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function IntroVisuals() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-md lg:max-w-none"
    >
      <div className="relative flex items-end justify-center gap-4 lg:justify-start">
        <div className="relative z-10 mx-auto aspect-[10/19] w-full max-w-[220px] overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-[#141a22] to-[#0a0f14] p-2.5 shadow-2xl shadow-black/50 sm:max-w-[240px]">
          <div className="h-full overflow-hidden rounded-[1.5rem] bg-[#0f1419]">
            <div className="border-b border-white/10 px-4 pb-3 pt-6">
              <TenkheeLogo size="sm" className="mb-2" />
              <p className="text-[10px] text-white/45">2026 оны 9-р сар</p>
            </div>
            <div className="space-y-2.5 p-3">
              <div className="flex gap-1">
                {['Да', 'Мя', 'Лх', 'Пү', 'Ба'].map((d, i) => (
                  <div
                    key={d}
                    className={cn(
                      'flex size-7 items-center justify-center rounded-lg text-[9px] font-semibold',
                      i === 2 ? 'bg-[#ff453a] text-white' : 'bg-white/5 text-white/40'
                    )}
                  >
                    {d}
                  </div>
                ))}
              </div>
              <div className="overflow-hidden rounded-xl bg-gradient-to-br from-[#ff453a] to-[#c0392b] p-3">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-white/80">
                  Анхан шатны кегел дасгал
                </p>
                <p className="mt-1 text-xs font-bold">Workout Program</p>
                <div className="mt-2 inline-flex rounded-lg bg-white/20 px-2 py-1 text-[9px] font-semibold">
                  Эхлэх
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                <p className="text-[10px] font-semibold">Pelvic Stretching</p>
                <p className="mt-0.5 text-[9px] text-white/45">Beginner · 19 min</p>
              </div>
            </div>
            <div className="absolute bottom-0 inset-x-0 flex items-center justify-around border-t border-white/10 bg-[#0f1419]/95 px-3 py-2.5">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    'size-2 rounded-full',
                    i === 2 ? 'bg-[#ff453a]' : 'bg-white/20'
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="relative hidden h-[280px] w-[140px] shrink-0 sm:block lg:h-[320px] lg:w-[160px]">
          <div className="absolute inset-0 rounded-full bg-[#ff453a]/20 blur-[60px]" />
          <div
            className="relative h-full w-full rounded-3xl bg-gradient-to-b from-white/10 via-white/[0.06] to-[#ff453a]/25"
            style={{
              clipPath:
                'polygon(30% 0%, 70% 0%, 85% 25%, 80% 55%, 65% 100%, 35% 100%, 20% 55%, 15% 25%)',
            }}
          />
          <div className="absolute bottom-[18%] left-1/2 size-16 -translate-x-1/2 rounded-full bg-[#ff453a]/40 blur-xl" />
          <div className="absolute bottom-[22%] left-1/2 h-12 w-20 -translate-x-1/2 rounded-full border-2 border-[#ff453a]/60 bg-[#ff453a]/15 shadow-[0_0_30px_rgba(255,69,58,0.5)]" />
        </div>
      </div>

      <p className="mt-6 text-center font-serif text-lg italic text-white/25 lg:text-left">
        Илүү хүчтэй, Илүү итгэлтэй, Илүү сайн амьдрал
      </p>
    </motion.div>
  );
}
