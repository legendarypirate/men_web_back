'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export const QUIZ_FLOW_STEPS = [
  { id: 'start', label: 'Эхлэх' },
  { id: 'questions', label: 'Асуултууд' },
  { id: 'results', label: 'Таны үр дүн' },
  { id: 'next', label: 'Дараагийн алхам' },
] as const;

export type QuizFlowStepId = (typeof QUIZ_FLOW_STEPS)[number]['id'];

export function QuizFlowProgress({ activeStep }: { activeStep: QuizFlowStepId }) {
  const activeIndex = QUIZ_FLOW_STEPS.findIndex((s) => s.id === activeStep);

  return (
    <div className="relative px-4 pt-6 pb-2 sm:px-6 sm:pt-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center">
          {QUIZ_FLOW_STEPS.map((step, index) => {
            const done = index < activeIndex;
            const active = index === activeIndex;
            const isLast = index === QUIZ_FLOW_STEPS.length - 1;

            return (
              <div key={step.id} className="contents">
                <motion.div
                  layout
                  animate={
                    active
                      ? { scale: [1, 1.08, 1], boxShadow: '0 0 0 4px rgba(255,69,58,0.15)' }
                      : { scale: 1, boxShadow: '0 0 0 0px rgba(255,69,58,0)' }
                  }
                  transition={
                    active
                      ? {
                          scale: { repeat: Infinity, duration: 2.4, ease: 'easeInOut' },
                          boxShadow: { duration: 0.3 },
                        }
                      : { duration: 0.3 }
                  }
                  className={cn(
                    'relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border-2',
                    done && 'border-[#ff453a] bg-[#ff453a] text-white shadow-md shadow-[#ff453a]/30',
                    active && 'border-[#ff453a] bg-[#0a0f14]',
                    !done && !active && 'border-white/20 bg-[#0a0f14]'
                  )}
                >
                  {done ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                    >
                      <Check className="size-4" strokeWidth={3} />
                    </motion.div>
                  ) : (
                    <span
                      className={cn(
                        'size-2.5 rounded-full transition',
                        active ? 'bg-[#ff453a]' : 'bg-transparent'
                      )}
                    />
                  )}
                </motion.div>

                {!isLast && (
                  <div className="relative mx-1.5 h-1 min-w-0 flex-1 self-center sm:mx-2">
                    <div className="absolute inset-0 rounded-full bg-white/20" aria-hidden />
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full bg-[#ff453a] shadow-[0_0_8px_rgba(255,69,58,0.45)]"
                      initial={false}
                      animate={{ width: done ? '100%' : active ? '50%' : '0%' }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      aria-hidden
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-2.5 flex items-start">
          {QUIZ_FLOW_STEPS.map((step, index) => {
            const done = index < activeIndex;
            const active = index === activeIndex;
            const isLast = index === QUIZ_FLOW_STEPS.length - 1;

            return (
              <div key={`label-${step.id}`} className="contents">
                <div className="flex w-9 shrink-0 justify-center sm:w-auto sm:min-w-[4.5rem]">
                  <motion.span
                    animate={
                      active
                        ? { opacity: 1, color: '#ffb4af' }
                        : { opacity: done ? 0.55 : 0.35, color: 'rgba(255,255,255,0.35)' }
                    }
                    transition={{ duration: 0.35 }}
                    className="max-w-[4.5rem] text-center text-[9px] font-medium leading-tight sm:max-w-none sm:text-[10px]"
                  >
                    {step.label}
                  </motion.span>
                </div>
                {!isLast && <div className="min-w-0 flex-1" aria-hidden />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
