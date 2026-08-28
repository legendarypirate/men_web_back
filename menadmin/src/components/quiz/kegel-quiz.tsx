'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { TenkheeLogo } from '@/components/brand/tenkhee-logo';
import { StoreBadges } from '@/components/landing/store-badges';
import { buttonVariants } from '@/components/ui/button';
import {
  buildQuizResult,
  fetchPublicQuiz,
  getQuizFallback,
  type QuizEndMedia,
  type QuizPayload,
  type QuizStagePayload,
} from '@/lib/quiz-api';
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

  const sectionEndMedia: QuizEndMedia | null =
    sectionStageId != null
      ? stageById.get(sectionStageId)?.endMedia ?? null
      : null;

  function isLastQuestionInStage(index: number) {
    const current = questions[index];
    const next = questions[index + 1];
    if (!current) return false;
    if (!next) return true;
    return next.stage !== current.stage;
  }

  function goNext() {
    if (!selected || !question) return;

    const isLastQuestion = stepIndex >= totalQuestions - 1;
    const endsStage = isLastQuestionInStage(stepIndex);

    if (endsStage) {
      const stage = stageById.get(question.stage);
      if (stage?.endMedia) {
        setSectionStageId(question.stage);
        setPhase('section-end');
        return;
      }
    }

    if (isLastQuestion) {
      setPhase('processing');
      return;
    }

    setStepIndex((i) => i + 1);
  }

  function continueFromSectionEnd() {
    setSectionStageId(null);
    if (stepIndex >= totalQuestions - 1) {
      setPhase('processing');
      return;
    }
    setPhase('quiz');
    setStepIndex((i) => i + 1);
  }

  function goBack() {
    if (phase === 'section-end') {
      setSectionStageId(null);
      setPhase('quiz');
      return;
    }
    if (stepIndex === 0) return;
    setStepIndex((i) => i - 1);
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

          <main className="relative mx-auto flex w-full max-w-xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-10">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-[#ffb4af]">
              {stages.find((s) => s.id === question.stage)?.label}
            </p>
            <h1 className="text-center text-2xl font-bold leading-snug tracking-tight sm:text-[1.75rem]">
              {question.title}
            </h1>

            <ul className="mt-10 space-y-3">
              {question.options.map((option) => {
                const isSelected = selected === option.id;
                return (
                  <li key={option.id}>
                    <button
                      type="button"
                      onClick={() => selectOption(question.id, option.id)}
                      className={cn(
                        'flex w-full items-center justify-between gap-4 rounded-2xl border px-5 py-4 text-left transition active:scale-[0.99]',
                        isSelected
                          ? 'border-[#ff453a]/60 bg-[#ff453a]/15 shadow-lg shadow-[#ff453a]/10'
                          : 'border-white/10 bg-white/[0.04] hover:border-[#ff453a]/30 hover:bg-white/[0.07]'
                      )}
                    >
                      <span className="text-base font-medium text-white">{option.label}</span>
                      <span
                        className={cn(
                          'flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition',
                          isSelected
                            ? 'border-[#ff453a] bg-[#ff453a]'
                            : 'border-white/25 bg-transparent'
                        )}
                      >
                        {isSelected && <Check className="size-3.5 text-white" strokeWidth={3} />}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <p className="mt-8 text-center text-xs text-white/35">
              Асуулт {stepIndex + 1} / {totalQuestions}
            </p>
          </main>

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
          <main className="relative mx-auto flex w-full max-w-xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-10">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-[#ffb4af]">
              {sectionStageId != null
                ? stages.find((s) => s.id === sectionStageId)?.label
                : null}
            </p>
            <h1 className="text-center text-2xl font-bold leading-snug tracking-tight sm:text-[1.75rem]">
              {sectionEndMedia.title?.trim() || 'Хэсэг дууслаа'}
            </h1>
            <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
              {sectionEndMedia.type === 'video' ? (
                <SectionEndVideo src={sectionEndMedia.url} />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={sectionEndMedia.url}
                  alt=""
                  className="max-h-[420px] w-full object-cover"
                />
              )}
            </div>
            {sectionEndMedia.caption?.trim() && (
              <p className="mt-5 text-center text-base leading-relaxed text-white/70">
                {sectionEndMedia.caption}
              </p>
            )}
          </main>
          <QuizFooter backDisabled={false} continueDisabled={false} onBack={goBack} onContinue={continueFromSectionEnd} />
        </>
      )}

      {!loading && phase === 'processing' && (
        <main className="relative mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
          <div className="relative mb-8 size-20">
            <div className="absolute inset-0 animate-ping rounded-full bg-[#ff453a]/20" />
            <div className="relative flex size-20 items-center justify-center rounded-full border border-[#ff453a]/30 bg-[#ff453a]/10">
              <div className="size-10 animate-spin rounded-full border-4 border-[#ff453a]/20 border-t-[#ff453a]" />
            </div>
          </div>
          <h2 className="text-2xl font-bold">{processingTitle}</h2>
          <p className="mt-3 min-h-6 text-white/55">{processingMessages[processingIndex]}</p>
          <div className="mt-8 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[#ff453a] transition-all duration-700"
              style={{
                width: `${((processingIndex + 1) / processingMessages.length) * 100}%`,
              }}
            />
          </div>
        </main>
      )}

      {!loading && phase === 'result' && (
        <main className="relative mx-auto w-full max-w-xl flex-1 px-4 py-10 sm:px-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-[#ff453a]/15 text-[#ff453a]">
              <Check className="size-8" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Таны хувийн төлөвлөгөө бэлэн!</h1>
            <p className="mt-3 text-white/55">
              {SITE.name} танд тохирсон Кегel хөтөлбөр бэлтгэлээ.
            </p>
          </div>

          <dl className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] divide-y divide-white/10">
            <ResultRow label="Гол зорилго" value={result.goalLabel} />
            <ResultRow label="Түвшин" value={result.level} />
            <ResultRow label="Өдөрт" value={`${result.minutes} минут`} />
            <ResultRow label="Долоо хоногт" value={`${result.sessionsPerWeek} удаа`} />
          </dl>

          <div className="mt-8 rounded-2xl border border-[#ff453a]/25 bg-[#ff453a]/10 p-6 text-center">
            <p className="font-bold">Апп-аа татаад эхлээрэй</p>
            <p className="mt-2 text-sm text-white/60">
              Видео заавар, явц хяналт, pelvic stretching — бүгд нэг дор.
            </p>
            <StoreBadges className="mt-6 justify-center" />
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
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
          </div>
        </main>
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
  onBack,
  onContinue,
}: {
  backDisabled: boolean;
  continueDisabled: boolean;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <footer className="sticky bottom-0 border-t border-white/10 bg-[#0a0f14]/90 px-4 py-4 backdrop-blur-xl sm:px-6">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={backDisabled}
          className={cn(
            'inline-flex h-12 items-center gap-1 rounded-xl border px-4 text-sm font-semibold transition',
            backDisabled
              ? 'cursor-not-allowed border-transparent text-white/20'
              : 'border-white/15 text-white/70 hover:border-white/25 hover:bg-white/5 hover:text-white'
          )}
        >
          <ChevronLeft className="size-5" />
          Буцах
        </button>
        <button
          type="button"
          onClick={onContinue}
          disabled={continueDisabled}
          className={cn(
            'inline-flex h-12 min-w-[148px] items-center justify-center gap-1 rounded-xl px-6 text-sm font-semibold text-white transition',
            continueDisabled
              ? 'cursor-not-allowed bg-white/10 text-white/30'
              : 'bg-[#ff453a] shadow-lg shadow-[#ff453a]/25 hover:bg-[#e63e35]'
          )}
        >
          Үргэлжлүүлэх
          <ChevronRight className="size-5" />
        </button>
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
                <div
                  className={cn(
                    'relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300',
                    done && 'border-[#ff453a] bg-[#ff453a] text-white shadow-md shadow-[#ff453a]/30',
                    active &&
                      'border-[#ff453a] bg-[#0a0f14] shadow-[0_0_0_4px_rgba(255,69,58,0.15)]',
                    !done && !active && 'border-white/20 bg-[#0a0f14]'
                  )}
                >
                  {done ? (
                    <Check className="size-4" strokeWidth={3} />
                  ) : (
                    <span
                      className={cn(
                        'size-2.5 rounded-full transition',
                        active ? 'bg-[#ff453a]' : 'bg-transparent'
                      )}
                    />
                  )}
                </div>
                {!isLast && (
                  <div
                    className={cn(
                      'mx-1.5 h-1 min-w-[12px] flex-1 rounded-full transition-colors duration-300 sm:mx-2',
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
                <span
                  className={cn(
                    'text-[9px] font-medium leading-tight sm:text-[10px]',
                    active ? 'text-[#ffb4af]' : done ? 'text-white/50' : 'text-white/30'
                  )}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <dt className="text-sm text-white/50">{label}</dt>
      <dd className="text-right text-sm font-semibold text-white">{value}</dd>
    </div>
  );
}
