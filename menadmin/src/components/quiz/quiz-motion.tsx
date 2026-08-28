'use client';

import { AnimatePresence, motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

export type SlideDirection = 1 | -1;

const spring = { type: 'spring' as const, stiffness: 420, damping: 34, mass: 0.85 };

export const pageVariants: Variants = {
  enter: (direction: SlideDirection) => ({
    opacity: 0,
    x: direction > 0 ? 72 : -72,
    scale: 0.94,
    filter: 'blur(10px)',
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    filter: 'blur(0px)',
  },
  exit: (direction: SlideDirection) => ({
    opacity: 0,
    x: direction > 0 ? -56 : 56,
    scale: 0.96,
    filter: 'blur(8px)',
  }),
};

export const titleVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { ...spring, delay: 0.06 },
  },
};

export const labelVariants: Variants = {
  hidden: { opacity: 0, y: 10, letterSpacing: '0.2em' },
  show: {
    opacity: 1,
    y: 0,
    letterSpacing: '0.1em',
    transition: { ...spring, delay: 0.02 },
  },
};

export const optionsContainerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.14 },
  },
};

export const optionItemVariants: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.94 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: spring,
  },
};

export const mediaRevealVariants: Variants = {
  hidden: { opacity: 0, scale: 0.88, y: 24 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { ...spring, delay: 0.1 },
  },
};

export const counterVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { ...spring, delay: 0.35 },
  },
};

type QuizSlideProps = {
  slideKey: string;
  direction: SlideDirection;
  children: ReactNode;
  className?: string;
};

export function QuizSlide({ slideKey, direction, children, className }: QuizSlideProps) {
  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={slideKey}
        custom={direction}
        variants={pageVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={spring}
        className={className}
        style={{ perspective: 1200 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function QuizGlowBurst({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="burst"
          initial={{ opacity: 0.7, scale: 0.6 }}
          animate={{ opacity: 0, scale: 2.2 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="pointer-events-none fixed inset-0 z-40 bg-[radial-gradient(circle_at_50%_80%,rgba(255,69,58,0.35),transparent_55%)]"
        />
      )}
    </AnimatePresence>
  );
}
