'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import { TenkheeLogo } from '@/components/brand/tenkhee-logo';
import { StoreBadges } from '@/components/landing/store-badges';
import { buttonVariants } from '@/components/ui/button';
import {
  buildQuizResult,
  PROCESSING_MESSAGES,
  QUIZ_STEPS,
  type QuizStep,
} from '@/lib/quiz-data';
import { SITE } from '@/lib/site-config';
import { cn } from '@/lib/utils';

type Phase = 'quiz' | 'processing' | 'result';

export function KegelQuiz() {
  const [phase, setPhase] = useState<Phase>('quiz');
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [processingIndex, setProcessingIndex] = useState(0);

  const totalSteps = QUIZ_STEPS.length;
  const currentStep = QUIZ_STEPS[stepIndex];
  const progress = phase === 'quiz' ? ((stepIndex + 1) / totalSteps) * 100 : 100;

  const goNext = useCallback(() => {
    if (stepIndex >= totalSteps - 1) {
      setPhase('processing');
      return;
    }
    setStepIndex((i) => i + 1);
  }, [stepIndex, totalSteps]);

  const goBack = () => {
    if (stepIndex === 0) return;
    setStepIndex((i) => i - 1);
  };

  function selectOption(step: QuizStep, optionId: string) {
    if (step.type !== 'question') return;
    setAnswers((prev) => ({ ...prev, [step.id]: optionId }));
    window.setTimeout(goNext, 280);
  }

  useEffect(() => {
    if (phase !== 'processing') return;

    setProcessingIndex(0);
    const interval = window.setInterval(() => {
      setProcessingIndex((i) => {
        if (i >= PROCESSING_MESSAGES.length - 1) {
          window.clearInterval(interval);
          window.setTimeout(() => setPhase('result'), 600);
          return i;
        }
        return i + 1;
      });
    }, 900);

    return () => window.clearInterval(interval);
  }, [phase]);

  const result = buildQuizResult(answers);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#070b10] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 size-[420px] rounded-full bg-[#ff453a]/15 blur-[120px]" />
        <div className="absolute -right-20 bottom-0 size-[360px] rounded-full bg-[#ff453a]/10 blur-[100px]" />
      </div>

      <header className="relative border-b border-white/10 bg-[#0a0f14]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-2xl items-center gap-4 px-4 sm:px-6">
          {phase === 'quiz' && stepIndex > 0 ? (
            <button
              type="button"
              onClick={goBack}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/5 hover:text-white"
              aria-label="Буцах"
            >
              <ArrowLeft className="size-5" />
            </button>
          ) : (
            <TenkheeLogo href="/" size="sm" className="shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#ff453a] transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            {phase === 'quiz' && (
              <p className="mt-1.5 text-center text-xs text-white/45">
                {stepIndex + 1} / {totalSteps}
              </p>
            )}
          </div>
          <Link
            href="/"
            className="shrink-0 text-xs font-medium text-white/50 hover:text-white sm:text-sm"
          >
            Гарах
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
        {phase === 'quiz' && currentStep && (
          <QuizStepView step={currentStep} onSelect={selectOption} onContinue={goNext} />
        )}

        {phase === 'processing' && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <div className="relative mb-8 size-24">
              <div className="absolute inset-0 animate-ping rounded-full bg-[#ff453a]/20" />
              <div className="relative flex size-24 items-center justify-center rounded-full border border-[#ff453a]/30 bg-[#ff453a]/10">
                <Sparkles className="size-10 text-[#ff453a] animate-pulse" />
              </div>
            </div>
            <h2 className="text-2xl font-bold">Таны төлөвлөгөө бэлтгэгдэж байна</h2>
            <p className="mt-3 min-h-6 text-white/60 transition-all duration-300">
              {PROCESSING_MESSAGES[processingIndex]}
            </p>
            <div className="mt-8 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#ff453a] transition-all duration-700"
                style={{
                  width: `${((processingIndex + 1) / PROCESSING_MESSAGES.length) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {phase === 'result' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
              <div className="mx-auto mb-4 inline-flex size-16 items-center justify-center rounded-full bg-[#ff453a]/15 text-[#ff453a]">
                <CheckCircle2 className="size-8" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Таны хувийн төлөвлөгөө бэлэн!
              </h1>
              <p className="mt-3 text-white/60">
                Хариултуудын дагуу {SITE.name} танд тохирсон Кегел хөтөлбөр санал болголоо.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
              <div className="border-b border-white/10 bg-gradient-to-r from-[#ff453a]/20 to-transparent px-6 py-4">
                <p className="text-sm font-semibold uppercase tracking-wider text-[#ffb4af]">
                  Таны төлөвлөгөө
                </p>
              </div>
              <dl className="divide-y divide-white/10">
                <ResultRow label="Гол зорилго" value={result.goalLabel} />
                <ResultRow label="Түвшин" value={result.level} />
                <ResultRow label="Өдөрт" value={`${result.minutes} минут`} />
                <ResultRow label="Долоо хоногт" value={`${result.sessionsPerWeek} удаа`} />
              </dl>
            </div>

            <div className="rounded-2xl border border-[#ff453a]/25 bg-[#ff453a]/10 p-6 text-center">
              <p className="text-lg font-bold">Апп-аа татаад эхлээрэй</p>
              <p className="mt-2 text-sm text-white/65">
                Tenkhee Plus дотор видео заавар, явц хяналт, pelvic stretching болон premium
                контент бүгд бэлэн.
              </p>
              <StoreBadges className="mt-6 justify-center" size="large" />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/#download"
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'h-12 bg-[#ff453a] px-8 font-semibold text-white hover:bg-[#e63e35]'
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
          </div>
        )}
      </main>
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-4">
      <dt className="text-sm text-white/50">{label}</dt>
      <dd className="text-right text-sm font-semibold text-white">{value}</dd>
    </div>
  );
}

function QuizStepView({
  step,
  onSelect,
  onContinue,
}: {
  step: QuizStep;
  onSelect: (step: QuizStep, optionId: string) => void;
  onContinue: () => void;
}) {
  if (step.type === 'info') {
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-300">
        <h1 className="text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
          {step.title}
        </h1>
        <p className="mt-5 text-base leading-relaxed text-white/70 sm:text-lg">{step.body}</p>
        {step.stat && (
          <p className="mt-6 inline-flex rounded-full border border-[#ff453a]/30 bg-[#ff453a]/10 px-4 py-2 text-sm font-medium text-[#ffb4af]">
            {step.stat}
          </p>
        )}
        <button
          type="button"
          onClick={onContinue}
          className={cn(
            buttonVariants({ size: 'lg' }),
            'mt-10 h-12 w-full bg-[#ff453a] font-semibold text-white hover:bg-[#e63e35] sm:w-auto sm:min-w-[200px]'
          )}
        >
          Үргэлжлүүлэх
        </button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <h1 className="text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
        {step.title}
      </h1>
      {step.subtitle && (
        <p className="mt-3 text-base leading-relaxed text-white/60">{step.subtitle}</p>
      )}
      <ul className="mt-8 space-y-3">
        {step.options.map((option) => (
          <li key={option.id}>
            <button
              type="button"
              onClick={() => onSelect(step, option.id)}
              className="flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-left transition hover:border-[#ff453a]/40 hover:bg-[#ff453a]/10 active:scale-[0.99]"
            >
              {option.emoji && (
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-xl">
                  {option.emoji}
                </span>
              )}
              <span className="text-base font-semibold text-white">{option.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
