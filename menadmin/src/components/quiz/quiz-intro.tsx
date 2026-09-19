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
    body: 'TenkheePlus апп дээр өдөр бүр дагах хөтөлбөр авна.',
  },
  {
    icon: Shield,
    title: '100% нууцлалтай',
    body: 'Таны мэдээлэл бүрэн нууц байгаад анхаарна.',
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
    <div
      className={cn(
        'relative min-h-0 w-full flex-1 overflow-y-auto bg-black lg:overflow-hidden',
        className
      )}
    >
      {/* Full background — object-contain never crops any edge */}
      <Image
        src="/backg.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="pointer-events-none object-contain object-left-bottom"
      />

      {/* Content sits in letterbox / dark-right area; scrolls on small screens */}
      <div className="relative z-10 flex min-h-full flex-col justify-start lg:min-h-0 lg:justify-center">
        <div className="ml-auto flex w-full flex-col px-5 py-6 pb-10 sm:px-6 sm:py-8 lg:w-[58%] lg:max-w-[720px] lg:px-10 lg:py-10 xl:max-w-[780px] xl:pr-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Brand Title */}
            <div className="flex items-center gap-0.5">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                Tenkhee
              </span>
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#FF443D]">
                Plus
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="mt-3 text-3xl font-extrabold leading-[1.15] tracking-tight text-white sm:mt-4 sm:text-4xl lg:text-[2.65rem] xl:text-[3rem]">
              Танд яг юу хэрэгтэйг{' '}
              <span className="text-[#FF443D]">1 минутанд</span> тодорхойлъё.
            </h1>

            {/* Description */}
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#9298A1] sm:mt-4 sm:text-base lg:text-[17px]">
              Хэдэн асуулт хариулаад хөвчрөлт, дур тавилтын хяналт, аарцгийн
              булчин, давсагны үйл ажиллагаатай холбоотой таны одоогийн түвшинг
              үнэлнэ.
            </p>
          </motion.div>

          {/* BENEFIT CARDS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 grid grid-cols-2 gap-3 sm:mt-7 sm:gap-3.5 lg:grid-cols-4"
          >
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="group flex flex-col items-center justify-start rounded-2xl border border-white/[0.08] bg-[#0E1217] p-3.5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FF443D]/40 hover:bg-[#10141C] hover:shadow-[0_8px_20px_rgba(255,68,61,0.12)] sm:p-4"
              >
                <div className="mb-2 flex size-8 items-center justify-center text-[#FF443D] sm:mb-2.5 sm:size-9">
                  <Icon className="size-5 sm:size-6 stroke-[1.8]" />
                </div>
                <p className="text-xs font-bold leading-snug text-white sm:text-[13px]">
                  {title}
                </p>
                <p className="mt-1 text-[10.5px] leading-snug text-[#9298A1] sm:text-[11px]">
                  {body}
                </p>
              </div>
            ))}
          </motion.div>

          {/* SMALL INFO ROW */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 flex flex-wrap items-center justify-center gap-x-3.5 gap-y-2 text-xs font-medium text-[#9298A1] sm:mt-6 sm:gap-x-4 lg:justify-start"
          >
            {META.map(({ icon: Icon, label }, idx) => (
              <div key={label} className="flex items-center gap-3.5">
                <span className="inline-flex items-center gap-1.5">
                  <Icon className="size-4 text-[#FF443D]" />
                  <span>{label}</span>
                </span>
                {idx < META.length - 1 && (
                  <span className="h-3.5 w-[1px] bg-white/15" aria-hidden />
                )}
              </div>
            ))}
          </motion.div>

          {/* PRIMARY CTA & DISCLAIMER */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 sm:mt-7"
          >
            <motion.button
              type="button"
              onClick={onStart}
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 500, damping: 22 }}
              className="group flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#FF443D] px-6 py-4 text-sm font-extrabold uppercase tracking-wider text-white shadow-[0_10px_28px_rgba(255,68,61,0.32)] transition-colors hover:bg-[#E63E35] sm:h-15 sm:text-base"
            >
              <span>МИНИЙ ҮНЭЛГЭЭГ ЭХЛҮҮЛЭХ</span>
              <ArrowRight className="size-5 transition-transform duration-200 group-hover:translate-x-1" />
            </motion.button>

            <div className="mt-3 flex items-start gap-1.5 text-left text-[11px] leading-relaxed text-white/40 sm:mt-4 sm:text-xs">
              <Info className="mt-0.5 size-3.5 shrink-0 text-white/50" />
              <span>
                Энэхүү үнэлгээ нь эмнэлгийн оношлогоо биш бөгөөд TenkheePlus доторх
                тохирох дасгал, мэдээллийн чиглэлийг санал болгох зориулалттай.
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
