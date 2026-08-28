'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { TenkheeLogo } from '@/components/brand/tenkhee-logo';
import { StoreBadges } from '@/components/landing/store-badges';
import { buttonVariants } from '@/components/ui/button';
import {
  buildQuizResult,
  fetchPublicQuiz,
  getQuizFallback,
  type QuizEndMediaItem,
  type QuizPayload,
  type QuizStagePayload,
} from '@/lib/quiz-api';
import {
  counterVariants,
  getAnimationStyle,
  getLabelVariants,
  getMediaRevealVariants,
  getOptionItemVariants,
  getOptionsContainerVariants,
  getTitleVariants,
  QuizGlowBurst,
  QuizSlide,
  type SlideDirection,
} from '@/components/quiz/quiz-motion';
import { SITE } from '@/lib/site-config';
import { cn } from '@/lib/utils';

type Phase = 'quiz' | 'section-end' | 'processing' | 'result';

export function KegelQuiz() {
  const [quiz, setQuiz] = useState<QuizPayload | null>(null);
  const [phase, setPhase] = useState<Phase>('quiz');
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [processingIndex, setProcessingIndex] = useState(0);
  const [sectionStageId, setSectionStageId] = useState<number | null>(null);
  const [sectionMediaIndex, setSectionMediaIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<SlideDirection>(1);
  const [glowBurst, setGlowBurst] = useState(false);
  const [animSeed, setAnimSeed] = useState(0);

  useEffect(() => {
    fetchPublicQuiz()
      .then(setQuiz)
      .catch(() => setQuiz(getQuizFallback()));
  }, []);

  const stages = quiz?.stages ?? getQuizFallback().stages;
  const questions = quiz?.questions ?? getQuizFallback().questions;
  const processingMessages =
    quiz?.config.processingMessages.length
      ? quiz.config.processingMessages
      : getQuizFallback().config.processingMessages;
  const processingTitle =
    quiz?.config.processingTitle ?? getQuizFallback().config.processingTitle;

  const question = questions[stepIndex];
  const selected = question ? answers[question.id] : undefined;
  const totalQuestions = questions.length;

  const stageById = useMemo(() => {
    const map = new Map<number, QuizStagePayload>();
    for (const stage of stages) map.set(stage.id, stage);
    return map;
  }, [stages]);

  const sectionEndItems: QuizEndMediaItem[] =
    sectionStageId != null
      ? stageById.get(sectionStageId)?.endMediaItems ?? []
      : [];

  const sectionEndMedia: QuizEndMediaItem | null =
    sectionEndItems[sectionMediaIndex] ?? null;

  const hasMoreSectionMedia =
    sectionMediaIndex < sectionEndItems.length - 1;

  const quizAnimStyle = getAnimationStyle(stepIndex);
  const sectionAnimStyle = getAnimationStyle(stepIndex * 2 + sectionMediaIndex + 1);
  const processingAnimStyle = getAnimationStyle(totalQuestions + 1);
  const resultAnimStyle = getAnimationStyle(totalQuestions + 2);

  const quizTitleVariants = getTitleVariants(quizAnimStyle);
  const quizLabelVariants = getLabelVariants(quizAnimStyle);
  const quizOptionsContainer = getOptionsContainerVariants(quizAnimStyle);
  const quizOptionItem = getOptionItemVariants(quizAnimStyle);

  const sectionTitleVariants = getTitleVariants(sectionAnimStyle);
  const sectionLabelVariants = getLabelVariants(sectionAnimStyle);
  const sectionMediaVariants = getMediaRevealVariants(sectionAnimStyle);

  function isLastQuestionInStage(index: number) {
    const current = questions[index];
    const next = questions[index + 1];
    if (!current) return false;
    if (!next) return true;
    return next.stage !== current.stage;
  }

  function triggerForward(action: () => void) {
    setSlideDirection(1);
    setAnimSeed((s) => s + 1);
    setGlowBurst(true);
    window.setTimeout(action, 90);
    window.setTimeout(() => setGlowBurst(false), 520);
  }

  function triggerBackward(action: () => void) {
    setSlideDirection(-1);
    action();
  }

  function goNext() {
    if (!selected || !question) return;

    const isLastQuestion = stepIndex >= totalQuestions - 1;
    const endsStage = isLastQuestionInStage(stepIndex);

    triggerForward(() => {
      if (endsStage) {
        const stage = stageById.get(question.stage);
        if (stage?.endMediaItems?.length) {
          setSectionStageId(question.stage);
          setSectionMediaIndex(0);
          setPhase('section-end');
          return;
        }
      }

      if (isLastQuestion) {
        setPhase('processing');
        return;
      }

      setStepIndex((i) => i + 1);
    });
  }

  function advanceSectionEnd() {
    triggerForward(() => {
      if (hasMoreSectionMedia) {
        setSectionMediaIndex((i) => i + 1);
        return;
      }

      setSectionStageId(null);
      setSectionMediaIndex(0);
      if (stepIndex >= totalQuestions - 1) {
        setPhase('processing');
        return;
      }
      setPhase('quiz');
      setStepIndex((i) => i + 1);
    });
  }

  function goBack() {
    if (phase === 'section-end') {
      if (sectionMediaIndex > 0) {
        triggerBackward(() => setSectionMediaIndex((i) => i - 1));
        return;
      }
      triggerBackward(() => {
        setSectionStageId(null);
        setSectionMediaIndex(0);
        setPhase('quiz');
      });
      return;
    }
    if (stepIndex === 0) return;
    triggerBackward(() => setStepIndex((i) => i - 1));
  }

  function selectOption(questionId: string, optionId: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  useEffect(() => {
    if (phase !== 'processing') return;

    setProcessingIndex(0);
    const interval = window.setInterval(() => {
      setProcessingIndex((i) => {
        if (i >= processingMessages.length - 1) {
          window.clearInterval(interval);
          window.setTimeout(() => setPhase('result'), 700);
          return i;
        }
        return i + 1;
      });
    }, 900);

    return () => window.clearInterval(interval);
  }, [phase, processingMessages.length]);

  const result = buildQuizResult(answers);
  const loading = !quiz;

  return (
    <div className="relative flex min-h-screen min-h-[100dvh] flex-col bg-[#070b10] text-white">
      <QuizGlowBurst active={glowBurst} seed={animSeed} />
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 size-[420px] rounded-full bg-[#ff453a]/15 blur-[120px]" />
        <div className="absolute -right-20 bottom-0 size-[360px] rounded-full bg-[#ff453a]/10 blur-[100px]" />
      </div>

      <header className="relative border-b border-white/10 bg-[#0a0f14]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <TenkheeLogo href="/" size="sm" />
            <span className="text-sm font-medium text-white/55">Эрэгтэйчүүдийн эрүүл мэнд</span>
          </div>
          <Link href="/" className="text-xs font-medium text-white/45 hover:text-[#ff453a] sm:text-sm">
            Гарах
          </Link>
        </div>
      </header>

      {loading && (
        <main className="relative mx-auto flex w-full max-w-xl flex-1 items-center justify-center px-4 py-16">
          <div className="size-10 animate-spin rounded-full border-4 border-[#ff453a]/20 border-t-[#ff453a]" />
        </main>
      )}

      {!loading && phase === 'quiz' && question && (
        <>
          <StageProgress stages={stages} currentStage={question.stage} />

          <QuizSlide
            slideKey={`quiz-${stepIndex}`}
            direction={slideDirection}
            animStyle={quizAnimStyle}
            className="relative mx-auto flex w-full max-w-xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-10"
          >
            <motion.p
              variants={quizLabelVariants}
              initial="hidden"
              animate="show"
              className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-[#ffb4af]"
            >
              {stages.find((s) => s.id === question.stage)?.label}
            </motion.p>
            <motion.h1
              variants={quizTitleVariants}
              initial="hidden"
              animate="show"
              className="text-center text-2xl font-bold leading-snug tracking-tight sm:text-[1.75rem]"
            >
              {question.title}
            </motion.h1>

            <motion.ul
              variants={quizOptionsContainer}
              initial="hidden"
              animate="show"
              className="mt-10 space-y-3"
              style={{ perspective: 900 }}
            >
              {question.options.map((option) => {
                const isSelected = selected === option.id;
                return (
                  <motion.li key={option.id} variants={quizOptionItem}>
                    <motion.button
                      type="button"
                      onClick={() => selectOption(question.id, option.id)}
                      whileTap={{ scale: 0.98 }}
                      animate={
                        isSelected
                          ? {
                              borderColor: 'rgba(255,69,58,0.6)',
                              boxShadow: '0 10px 40px rgba(255,69,58,0.15)',
                            }
                          : { borderColor: 'rgba(255,255,255,0.1)', boxShadow: '0 0 0 rgba(0,0,0,0)' }
                      }
                      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                      className={cn(
                        'flex w-full items-center justify-between gap-4 rounded-2xl border px-5 py-4 text-left',
                        isSelected
                          ? 'bg-[#ff453a]/15'
                          : 'border-white/10 bg-white/[0.04] hover:border-[#ff453a]/30 hover:bg-white/[0.07]'
                      )}
                    >
                      <span className="text-base font-medium text-white">{option.label}</span>
                      <motion.span
                        animate={
                          isSelected
                            ? { scale: 1, backgroundColor: '#ff453a', borderColor: '#ff453a' }
                            : { scale: 1, backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.25)' }
                        }
                        transition={{ type: 'spring', stiffness: 600, damping: 22 }}
                        className="flex size-6 shrink-0 items-center justify-center rounded-full border-2"
                      >
                        {isSelected && (
                          <motion.span
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 700, damping: 18 }}
                          >
                            <Check className="size-3.5 text-white" strokeWidth={3} />
                          </motion.span>
                        )}
                      </motion.span>
                    </motion.button>
                  </motion.li>
                );
              })}
            </motion.ul>

            <motion.p
              variants={counterVariants}
              initial="hidden"
              animate="show"
              className="mt-8 text-center text-xs text-white/35"
            >
              Асуулт {stepIndex + 1} / {totalQuestions}
            </motion.p>
          </QuizSlide>

          <QuizFooter
            backDisabled={stepIndex === 0}
            continueDisabled={!selected}
            onBack={goBack}
            onContinue={goNext}
          />
        </>
      )}

      {!loading && phase === 'section-end' && sectionEndMedia && (
        <>
          <StageProgress
            stages={stages}
            currentStage={sectionStageId ?? stages[0]?.id ?? 1}
          />
          <QuizSlide
            slideKey={`section-${sectionStageId}-${sectionMediaIndex}`}
            direction={slideDirection}
            animStyle={sectionAnimStyle}
            className="relative mx-auto flex w-full max-w-xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-10"
          >
            <motion.p
              variants={sectionLabelVariants}
              initial="hidden"
              animate="show"
              className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-[#ffb4af]"
            >
              {sectionStageId != null
                ? stages.find((s) => s.id === sectionStageId)?.label
                : null}
            </motion.p>
            <motion.h1
              variants={sectionTitleVariants}
              initial="hidden"
              animate="show"
              className="text-center text-2xl font-bold leading-snug tracking-tight sm:text-[1.75rem]"
            >
              {sectionEndMedia.title?.trim() || 'Хэсэг дууслаа'}
            </motion.h1>
            <motion.div
              variants={sectionMediaVariants}
              initial="hidden"
              animate="show"
              className="relative mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_20px_60px_rgba(255,69,58,0.12)]"
              style={{ transformStyle: sectionAnimStyle === 'flip' ? 'preserve-3d' : undefined }}
            >
              <motion.div
                aria-hidden
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{ duration: 1.2, delay: 0.15 }}
                className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#ff453a]/20 via-transparent to-transparent"
              />
              {sectionEndMedia.type === 'video' ? (
                <SectionEndVideo src={sectionEndMedia.url} />
              ) : (
                <motion.div
                  initial={{ scale: 1.08 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sectionEndMedia.url}
                    alt=""
                    className="max-h-[420px] w-full object-cover"
                  />
                </motion.div>
              )}
            </motion.div>
            {sectionEndMedia.caption?.trim() && (
              <motion.p
                variants={sectionTitleVariants}
                initial="hidden"
                animate="show"
                className="mt-5 text-center text-base leading-relaxed text-white/70"
              >
                {sectionEndMedia.caption}
              </motion.p>
            )}
            {sectionEndItems.length > 1 && (
              <motion.p
                variants={counterVariants}
                initial="hidden"
                animate="show"
                className="mt-6 text-center text-xs text-white/35"
              >
                {sectionMediaIndex + 1} / {sectionEndItems.length}
              </motion.p>
            )}
          </QuizSlide>
          <QuizFooter
            backDisabled={false}
            continueDisabled={false}
            continueLabel={hasMoreSectionMedia ? 'Дараах' : 'Үргэлжлүүлэх'}
            onBack={goBack}
            onContinue={advanceSectionEnd}
          />
        </>
      )}

      {!loading && phase === 'processing' && (
        <QuizSlide
          slideKey="processing"
          direction={slideDirection}
          animStyle={processingAnimStyle}
          className="relative mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-16 text-center"
        >
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            className="relative mb-8 size-20"
          >
            <div className="absolute inset-0 animate-ping rounded-full bg-[#ff453a]/20" />
            <div className="relative flex size-20 items-center justify-center rounded-full border border-[#ff453a]/30 bg-[#ff453a]/10">
              <div className="size-10 animate-spin rounded-full border-4 border-[#ff453a]/20 border-t-[#ff453a]" />
            </div>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 400, damping: 30 }}
            className="text-2xl font-bold"
          >
            {processingTitle}
          </motion.h2>
          <motion.p
            key={processingIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-3 min-h-6 text-white/55"
          >
            {processingMessages[processingIndex]}
          </motion.p>
          <div className="mt-8 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-[#ff453a]"
              initial={{ width: 0 }}
              animate={{
                width: `${((processingIndex + 1) / processingMessages.length) * 100}%`,
              }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </QuizSlide>
      )}

      {!loading && phase === 'result' && (
        <QuizSlide
          slideKey="result"
          direction={slideDirection}
          animStyle={resultAnimStyle}
          className="relative mx-auto w-full max-w-xl flex-1 px-4 py-10 sm:px-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 18, delay: 0.08 }}
              className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-[#ff453a]/15 text-[#ff453a]"
            >
              <Check className="size-8" strokeWidth={2.5} />
            </motion.div>
            <h1 className="text-3xl font-extrabold tracking-tight">Таны хувийн төлөвлөгөө бэлэн!</h1>
            <p className="mt-3 text-white/55">
              {SITE.name} танд тохирсон Кегel хөтөлбөр бэлтгэлээ.
            </p>
          </motion.div>

          <motion.dl
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
            }}
            className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] divide-y divide-white/10"
          >
            {[
              { label: 'Гол зорилго', value: result.goalLabel },
              { label: 'Түвшин', value: result.level },
              { label: 'Өдөрт', value: `${result.minutes} минут` },
              { label: 'Долоо хоногт', value: `${result.sessionsPerWeek} удаа` },
            ].map((row) => (
              <motion.div
                key={row.label}
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 420, damping: 30 } },
                }}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <dt className="text-sm text-white/50">{row.label}</dt>
                <dd className="text-right text-sm font-semibold text-white">{row.value}</dd>
              </motion.div>
            ))}
          </motion.dl>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, type: 'spring', stiffness: 360, damping: 28 }}
            className="mt-8 rounded-2xl border border-[#ff453a]/25 bg-[#ff453a]/10 p-6 text-center"
          >
            <p className="font-bold">Апп-аа татаад эхлээрэй</p>
            <p className="mt-2 text-sm text-white/60">
              Видео заавар, явц хяналт, pelvic stretching — бүгд нэг дор.
            </p>
            <StoreBadges className="mt-6 justify-center" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, type: 'spring', stiffness: 360, damping: 28 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"
          >
            <Link
              href="/#download"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'h-12 bg-[#ff453a] font-semibold text-white hover:bg-[#e63e35]'
              )}
            >
              Апп татах
            </Link>
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'h-12 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white'
              )}
            >
              Нүүр хуудас
            </Link>
          </motion.div>
        </QuizSlide>
      )}
    </div>
  );
}

function SectionEndVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = true;
    void video.play().catch(() => {});
  }, [src]);

  return (
    <video
      ref={ref}
      src={src}
      autoPlay
      muted
      loop
      playsInline
      controls={false}
      disablePictureInPicture
      controlsList="nodownload nofullscreen noremoteplayback"
      className="pointer-events-none max-h-[420px] w-full bg-black object-contain"
    />
  );
}

function QuizFooter({
  backDisabled,
  continueDisabled,
  continueLabel = 'Үргэлжлүүлэх',
  onBack,
  onContinue,
}: {
  backDisabled: boolean;
  continueDisabled: boolean;
  continueLabel?: string;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <footer className="sticky bottom-0 border-t border-white/10 bg-[#0a0f14]/90 px-4 py-4 backdrop-blur-xl sm:px-6">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
        <motion.button
          type="button"
          onClick={onBack}
          disabled={backDisabled}
          whileTap={backDisabled ? undefined : { scale: 0.96 }}
          className={cn(
            'inline-flex h-12 items-center gap-1 rounded-xl border px-4 text-sm font-semibold transition',
            backDisabled
              ? 'cursor-not-allowed border-transparent text-white/20'
              : 'border-white/15 text-white/70 hover:border-white/25 hover:bg-white/5 hover:text-white'
          )}
        >
          <ChevronLeft className="size-5" />
          Буцах
        </motion.button>
        <motion.button
          type="button"
          onClick={onContinue}
          disabled={continueDisabled}
          whileTap={continueDisabled ? undefined : { scale: 0.95 }}
          whileHover={continueDisabled ? undefined : { scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 500, damping: 22 }}
          className={cn(
            'inline-flex h-12 min-w-[148px] items-center justify-center gap-1 rounded-xl px-6 text-sm font-semibold text-white',
            continueDisabled
              ? 'cursor-not-allowed bg-white/10 text-white/30'
              : 'bg-[#ff453a] shadow-lg shadow-[#ff453a]/25 hover:bg-[#e63e35]'
          )}
        >
          {continueLabel}
          <motion.span
            animate={continueDisabled ? {} : { x: [0, 3, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          >
            <ChevronRight className="size-5" />
          </motion.span>
        </motion.button>
      </div>
    </footer>
  );
}

function StageProgress({
  stages,
  currentStage,
}: {
  stages: QuizStagePayload[];
  currentStage: number;
}) {
  return (
    <div className="relative px-4 pt-6 pb-2 sm:px-6 sm:pt-8">
      <div className="mx-auto max-w-xl">
        <div className="flex items-center">
          {stages.map((stage, index) => {
            const done = stage.id < currentStage;
            const active = stage.id === currentStage;
            const isLast = index === stages.length - 1;

            return (
              <div key={stage.id} className={cn('flex items-center', !isLast && 'flex-1')}>
                <motion.div
                  layout
                  animate={
                    active
                      ? { scale: [1, 1.08, 1], boxShadow: '0 0 0 4px rgba(255,69,58,0.15)' }
                      : { scale: 1, boxShadow: '0 0 0 0px rgba(255,69,58,0)' }
                  }
                  transition={
                    active
                      ? { scale: { repeat: Infinity, duration: 2.4, ease: 'easeInOut' }, boxShadow: { duration: 0.3 } }
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
                    <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 20 }}>
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
                  <motion.div
                    layout
                    animate={{ scaleX: done ? 1 : 0.3, opacity: done ? 1 : 0.4 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    style={{ originX: 0 }}
                    className={cn(
                      'mx-1.5 h-1 min-w-[12px] flex-1 rounded-full sm:mx-2',
                      done ? 'bg-[#ff453a]' : 'bg-white/25'
                    )}
                    aria-hidden
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-2.5 flex">
          {stages.map((stage) => {
            const done = stage.id < currentStage;
            const active = stage.id === currentStage;

            return (
              <div key={stage.id} className="flex-1 px-0.5 text-center">
                <motion.span
                  animate={
                    active
                      ? { opacity: 1, y: 0, color: '#ffb4af' }
                      : { opacity: done ? 0.5 : 0.3, y: 0, color: 'rgba(255,255,255,0.3)' }
                  }
                  transition={{ duration: 0.35 }}
                  className="block text-[9px] font-medium leading-tight sm:text-[10px]"
                >
                  {stage.label}
                </motion.span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
