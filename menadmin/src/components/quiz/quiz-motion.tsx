'use client';

import { AnimatePresence, motion, type Transition, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

export type SlideDirection = 1 | -1;

export type AnimationStyle =
  | 'slide'
  | 'rise'
  | 'zoom'
  | 'flip'
  | 'swing'
  | 'drop'
  | 'curtain';

const springSnappy = { type: 'spring' as const, stiffness: 460, damping: 32, mass: 0.8 };
const springBouncy = { type: 'spring' as const, stiffness: 340, damping: 22, mass: 0.9 };
const springSoft = { type: 'spring' as const, stiffness: 280, damping: 28, mass: 1 };

const STYLE_ORDER: AnimationStyle[] = ['slide', 'rise', 'zoom', 'flip', 'swing', 'drop', 'curtain'];

export function getAnimationStyle(seed: number): AnimationStyle {
  return STYLE_ORDER[Math.abs(seed) % STYLE_ORDER.length];
}

type Custom = { direction: SlideDirection; style: AnimationStyle };

function pageTransition(style: AnimationStyle): Transition {
  switch (style) {
    case 'zoom':
      return springBouncy;
    case 'drop':
      return springBouncy;
    case 'flip':
      return { type: 'spring', stiffness: 380, damping: 30 };
    case 'curtain':
      return { duration: 0.48, ease: [0.22, 1, 0.36, 1] };
    default:
      return springSnappy;
  }
}

function buildPageVariants(style: AnimationStyle): Variants {
  const d = (dir: SlideDirection) => (dir > 0 ? 1 : -1);

  switch (style) {
    case 'rise':
      return {
        enter: (c: Custom) => ({
          opacity: 0,
          y: c.direction > 0 ? 90 : -60,
          scale: 0.92,
          filter: 'blur(12px)',
        }),
        center: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
        exit: (c: Custom) => ({
          opacity: 0,
          y: c.direction > 0 ? -50 : 70,
          scale: 0.95,
          filter: 'blur(8px)',
        }),
      };
    case 'zoom':
      return {
        enter: () => ({
          opacity: 0,
          scale: 0.72,
          rotate: -4,
          filter: 'blur(14px)',
        }),
        center: { opacity: 1, scale: 1, rotate: 0, filter: 'blur(0px)' },
        exit: () => ({
          opacity: 0,
          scale: 1.12,
          rotate: 3,
          filter: 'blur(10px)',
        }),
      };
    case 'flip':
      return {
        enter: (c: Custom) => ({
          opacity: 0,
          rotateY: c.direction > 0 ? 72 : -72,
          x: d(c.direction) * 40,
          scale: 0.88,
        }),
        center: { opacity: 1, rotateY: 0, x: 0, scale: 1 },
        exit: (c: Custom) => ({
          opacity: 0,
          rotateY: c.direction > 0 ? -55 : 55,
          x: d(c.direction) * -30,
          scale: 0.9,
        }),
      };
    case 'swing':
      return {
        enter: (c: Custom) => ({
          opacity: 0,
          x: c.direction > 0 ? 100 : -100,
          y: -30,
          rotate: c.direction > 0 ? 8 : -8,
          scale: 0.9,
        }),
        center: { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 },
        exit: (c: Custom) => ({
          opacity: 0,
          x: c.direction > 0 ? -70 : 70,
          y: 20,
          rotate: c.direction > 0 ? -6 : 6,
          scale: 0.94,
        }),
      };
    case 'drop':
      return {
        enter: () => ({
          opacity: 0,
          y: -120,
          scale: 0.85,
          rotate: -2,
        }),
        center: { opacity: 1, y: 0, scale: 1, rotate: 0 },
        exit: () => ({
          opacity: 0,
          y: 80,
          scale: 0.9,
          rotate: 2,
        }),
      };
    case 'curtain':
      return {
        enter: (c: Custom) => ({
          opacity: 0,
          scaleX: 0.12,
          scaleY: 0.94,
          x: c.direction > 0 ? 30 : -30,
          filter: 'blur(8px)',
        }),
        center: { opacity: 1, scaleX: 1, scaleY: 1, x: 0, filter: 'blur(0px)' },
        exit: (c: Custom) => ({
          opacity: 0,
          scaleX: 0.08,
          scaleY: 0.96,
          x: c.direction > 0 ? -40 : 40,
          filter: 'blur(6px)',
        }),
      };
    default:
      return {
        enter: (c: Custom) => ({
          opacity: 0,
          x: d(c.direction) * 80,
          scale: 0.93,
          filter: 'blur(10px)',
        }),
        center: { opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' },
        exit: (c: Custom) => ({
          opacity: 0,
          x: d(c.direction) * -64,
          scale: 0.96,
          filter: 'blur(8px)',
        }),
      };
  }
}

export function getTitleVariants(style: AnimationStyle): Variants {
  switch (style) {
    case 'zoom':
      return {
        hidden: { opacity: 0, scale: 0.82, y: 10 },
        show: { opacity: 1, scale: 1, y: 0, transition: { ...springBouncy, delay: 0.08 } },
      };
    case 'flip':
      return {
        hidden: { opacity: 0, rotateX: 40, y: 12 },
        show: { opacity: 1, rotateX: 0, y: 0, transition: { ...springSnappy, delay: 0.1 } },
      };
    case 'swing':
      return {
        hidden: { opacity: 0, x: -24, rotate: -3 },
        show: { opacity: 1, x: 0, rotate: 0, transition: { ...springSnappy, delay: 0.06 } },
      };
    case 'drop':
      return {
        hidden: { opacity: 0, y: -28 },
        show: { opacity: 1, y: 0, transition: springBouncy },
      };
    case 'curtain':
      return {
        hidden: { opacity: 0, scaleX: 0.4, letterSpacing: '0.08em' },
        show: {
          opacity: 1,
          scaleX: 1,
          letterSpacing: '0em',
          transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.12 },
        },
      };
    case 'rise':
      return {
        hidden: { opacity: 0, y: 32 },
        show: { opacity: 1, y: 0, transition: { ...springSoft, delay: 0.08 } },
      };
    default:
      return {
        hidden: { opacity: 0, y: 18 },
        show: { opacity: 1, y: 0, transition: { ...springSnappy, delay: 0.06 } },
      };
  }
}

export function getLabelVariants(style: AnimationStyle): Variants {
  switch (style) {
    case 'flip':
      return {
        hidden: { opacity: 0, y: -12, rotateX: -30 },
        show: { opacity: 1, y: 0, rotateX: 0, transition: { ...springSnappy, delay: 0.02 } },
      };
    case 'swing':
      return {
        hidden: { opacity: 0, x: 20, letterSpacing: '0.25em' },
        show: {
          opacity: 1,
          x: 0,
          letterSpacing: '0.1em',
          transition: { ...springSnappy, delay: 0.02 },
        },
      };
    default:
      return {
        hidden: { opacity: 0, y: 10, letterSpacing: '0.2em' },
        show: {
          opacity: 1,
          y: 0,
          letterSpacing: '0.1em',
          transition: { ...springSnappy, delay: 0.02 },
        },
      };
  }
}

export function getOptionsContainerVariants(style: AnimationStyle): Variants {
  const stagger =
    style === 'zoom' ? 0.09 : style === 'swing' ? 0.05 : style === 'curtain' ? 0.11 : 0.07;
  const delay =
    style === 'flip' ? 0.2 : style === 'drop' ? 0.1 : style === 'rise' ? 0.16 : 0.14;

  return {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };
}

export function getOptionItemVariants(style: AnimationStyle): Variants {
  switch (style) {
    case 'zoom':
      return {
        hidden: { opacity: 0, scale: 0.6 },
        show: { opacity: 1, scale: 1, transition: springBouncy },
      };
    case 'flip':
      return {
        hidden: { opacity: 0, rotateX: 50, y: 20 },
        show: { opacity: 1, rotateX: 0, y: 0, transition: springSnappy },
      };
    case 'swing':
      return {
        hidden: { opacity: 0, x: 40, rotate: 4 },
        show: { opacity: 1, x: 0, rotate: 0, transition: springSnappy },
      };
    case 'drop':
      return {
        hidden: { opacity: 0, y: -36, scale: 0.95 },
        show: { opacity: 1, y: 0, scale: 1, transition: springBouncy },
      };
    case 'curtain':
      return {
        hidden: { opacity: 0, scaleX: 0.5, x: -20 },
        show: {
          opacity: 1,
          scaleX: 1,
          x: 0,
          transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
        },
      };
    case 'rise':
      return {
        hidden: { opacity: 0, y: 40, scale: 0.97 },
        show: { opacity: 1, y: 0, scale: 1, transition: springSoft },
      };
    default:
      return {
        hidden: { opacity: 0, y: 28, scale: 0.94 },
        show: { opacity: 1, y: 0, scale: 1, transition: springSnappy },
      };
  }
}

export function getMediaRevealVariants(style: AnimationStyle): Variants {
  switch (style) {
    case 'zoom':
      return {
        hidden: { opacity: 0, scale: 0.75, rotate: -2 },
        show: { opacity: 1, scale: 1, rotate: 0, transition: { ...springBouncy, delay: 0.1 } },
      };
    case 'flip':
      return {
        hidden: { opacity: 0, rotateY: 65, scale: 0.9 },
        show: { opacity: 1, rotateY: 0, scale: 1, transition: { ...springSnappy, delay: 0.12 } },
      };
    case 'curtain':
      return {
        hidden: { opacity: 0, scaleX: 0.15, scaleY: 0.92 },
        show: {
          opacity: 1,
          scaleX: 1,
          scaleY: 1,
          transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.08 },
        },
      };
    default:
      return {
        hidden: { opacity: 0, scale: 0.88, y: 24 },
        show: { opacity: 1, scale: 1, y: 0, transition: { ...springSnappy, delay: 0.1 } },
      };
  }
}

export const counterVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1, transition: { ...springSnappy, delay: 0.35 } },
};

type QuizSlideProps = {
  slideKey: string;
  direction: SlideDirection;
  animStyle: AnimationStyle;
  children: ReactNode;
  className?: string;
};

export function QuizSlide({ slideKey, direction, animStyle, children, className }: QuizSlideProps) {
  const custom: Custom = { direction, style: animStyle };
  const needs3D = animStyle === 'flip' || animStyle === 'swing';

  return (
    <AnimatePresence mode="wait" custom={custom}>
      <motion.div
        key={slideKey}
        custom={custom}
        variants={buildPageVariants(animStyle)}
        initial="enter"
        animate="center"
        exit="exit"
        transition={pageTransition(animStyle)}
        className={className}
        style={{
          perspective: needs3D ? 1400 : 1200,
          transformStyle: needs3D ? 'preserve-3d' : undefined,
          transformOrigin: animStyle === 'curtain' ? 'center center' : undefined,
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

const GLOW_GRADIENTS = [
  'radial-gradient(circle at 50% 80%, rgba(255,69,58,0.38), transparent 55%)',
  'radial-gradient(circle at 30% 70%, rgba(255,120,80,0.35), transparent 50%)',
  'radial-gradient(circle at 70% 75%, rgba(255,50,100,0.32), transparent 52%)',
  'radial-gradient(ellipse at 50% 90%, rgba(255,180,100,0.28), transparent 60%)',
  'radial-gradient(circle at 40% 60%, rgba(255,69,58,0.4), transparent 48%)',
  'radial-gradient(circle at 60% 85%, rgba(255,100,60,0.36), transparent 54%)',
  'radial-gradient(circle at 50% 50%, rgba(255,69,58,0.3), transparent 65%)',
];

export function QuizGlowBurst({
  active,
  seed = 0,
}: {
  active: boolean;
  seed?: number;
}) {
  const gradient = GLOW_GRADIENTS[Math.abs(seed) % GLOW_GRADIENTS.length];

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key={`burst-${seed}`}
          initial={{ opacity: 0.75, scale: 0.5 }}
          animate={{ opacity: 0, scale: 2.4 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.58, ease: 'easeOut' }}
          className="pointer-events-none fixed inset-0 z-40"
          style={{ background: gradient }}
        />
      )}
    </AnimatePresence>
  );
}
