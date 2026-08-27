'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { TenkheeLogo } from '@/components/brand/tenkhee-logo';
import { StoreBadges } from '@/components/landing/store-badges';
import { buttonVariants } from '@/components/ui/button';
import {
  buildQuizResult,
  PROCESSING_MESSAGES,
  QUIZ_QUESTIONS,
  QUIZ_STAGES,
  type QuizQuestion,
} from '@/lib/quiz-data';
import { SITE } from '@/lib/site-config';
import { cn } from '@/lib/utils';

type Phase = 'quiz' | 'processing' | 'result';

export function KegelQuiz() {
  const [phase, setPhase] = useState<Phase>('quiz');
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [processingIndex, setProcessingIndex] = useState(0);

  const question = QUIZ_QUESTIONS[stepIndex];
  const selected = question ? answers[question.id] : undefined;
  const totalQuestions = QUIZ_QUESTIONS.length;

  function goNext() {
    if (!selected) return;
    if (stepIndex >= totalQuestions - 1) {
      setPhase('processing');
      return;
    }
    setStepIndex((i) => i + 1);
  }

  function goBack() {
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
        if (i >= PROCESSING_MESSAGES.length - 1) {
          window.clearInterval(interval);
          window.setTimeout(() => setPhase('result'), 700);
          return i;
        }
        return i + 1;
      });
    }, 900);

    return () => window.clearInterval(interval);
  }, [phase]);

  const result = buildQuizResult(answers);

  return (
    <div className="flex min-h-screen min-h-[100dvh] flex-col bg-white text-[#1a1a1a]">
      <header className="border-b border-[#ececec] px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <TenkheeLogo href="/" size="sm" />
          <span className="text-sm font-medium text-[#6b7280]">Эрэгтэйчүүдийн эрүүл мэнд</span>
        </div>
      </header>

      {phase === 'quiz' && question && (
        <>
          <StageProgress currentStage={question.stage} />

          <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-10">
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
                        'flex w-full items-center justify-between gap-4 rounded-2xl px-5 py-4 text-left transition',
                        isSelected
                          ? 'bg-[#ddd6f3] ring-2 ring-[#1a1a1a]/20'
                          : 'bg-[#ebe7f5] hover:bg-[#e3ddf0]'
                      )}
                    >
                      <span className="text-base font-medium text-[#1a1a1a]">{option.label}</span>
                      <span
                        className={cn(
                          'flex size-6 shrink-0 items-center justify-center rounded-full border-2 bg-white transition',
                          isSelected ? 'border-[#1a1a1a]' : 'border-[#c4c4c4]'
                        )}
                      >
                        {isSelected && <span className="size-3 rounded-full bg-[#1a1a1a]" />}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <p className="mt-6 text-center text-xs text-[#9ca3af]">
              {stepIndex + 1} / {totalQuestions}
            </p>
          </main>

          <footer className="sticky bottom-0 border-t border-[#ececec] bg-white px-4 py-4 sm:px-6">
            <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
              <button
                type="button"
                onClick={goBack}
                disabled={stepIndex === 0}
                className={cn(
                  'inline-flex h-12 items-center gap-1 rounded-xl px-4 text-sm font-semibold transition',
                  stepIndex === 0
                    ? 'cursor-not-allowed text-[#d1d5db]'
                    : 'text-[#374151] hover:bg-[#f3f4f6]'
                )}
              >
                <ChevronLeft className="size-5" />
                Буцах
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={!selected}
                className={cn(
                  'inline-flex h-12 min-w-[140px] items-center justify-center gap-1 rounded-xl px-6 text-sm font-semibold text-white transition',
                  selected
                    ? 'bg-[#1a1a1a] hover:bg-[#333]'
                    : 'cursor-not-allowed bg-[#d1d5db]'
                )}
              >
                Үргэлжлүүлэх
                <ChevronRight className="size-5" />
              </button>
            </div>
          </footer>
        </>
      )}

      {phase === 'processing' && (
        <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
          <div className="mb-8 size-16 animate-spin rounded-full border-4 border-[#ebe7f5] border-t-[#1a1a1a]" />
          <h2 className="text-2xl font-bold">Таны төлөвлөгөө бэлтгэгдэж байна</h2>
          <p className="mt-3 min-h-6 text-[#6b7280]">{PROCESSING_MESSAGES[processingIndex]}</p>
        </main>
      )}

      {phase === 'result' && (
        <main className="mx-auto w-full max-w-xl flex-1 px-4 py-10 sm:px-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-[#ebe7f5]">
              <Check className="size-8 text-[#1a1a1a]" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Таны хувийн төлөвлөгөө бэлэн!</h1>
            <p className="mt-3 text-[#6b7280]">
              {SITE.name} танд тохирсон Кегel хөтөлбөр бэлтгэлээ.
            </p>
          </div>

          <dl className="mt-8 overflow-hidden rounded-2xl border border-[#ececec] divide-y divide-[#ececec]">
            <ResultRow label="Гол зорилго" value={result.goalLabel} />
            <ResultRow label="Түвшин" value={result.level} />
            <ResultRow label="Өдөрт" value={`${result.minutes} минут`} />
            <ResultRow label="Долоо хоногт" value={`${result.sessionsPerWeek} удаа`} />
          </dl>

          <div className="mt-8 rounded-2xl bg-[#ebe7f5] p-6 text-center">
            <p className="font-bold">Апп-аа татаад эхлээрэй</p>
            <p className="mt-2 text-sm text-[#6b7280]">
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
              className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-12')}
            >
              Нүүр хуудас
            </Link>
          </div>
        </main>
      )}
    </div>
  );
}

function StageProgress({ currentStage }: { currentStage: number }) {
  return (
    <div className="px-4 pt-8 sm:px-6">
      <div className="mx-auto flex max-w-xl items-center">
        {QUIZ_STAGES.map((stage, index) => {
          const done = stage.id < currentStage;
          const active = stage.id === currentStage;
          const pending = stage.id > currentStage;

          return (
            <div key={stage.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex size-9 items-center justify-center rounded-full border-2 transition',
                    done && 'border-[#1a1a1a] bg-[#1a1a1a] text-white',
                    active && 'border-[#1a1a1a] bg-white',
                    pending && 'border-[#d1d5db] bg-white'
                  )}
                >
                  {done ? (
                    <Check className="size-4" strokeWidth={3} />
                  ) : (
                    <span
                      className={cn(
                        'size-2.5 rounded-full',
                        active ? 'bg-[#1a1a1a]' : 'bg-transparent'
                      )}
                    />
                  )}
                </div>
                <span
                  className={cn(
                    'mt-2 hidden text-[10px] font-medium sm:block',
                    active ? 'text-[#1a1a1a]' : 'text-[#9ca3af]'
                  )}
                >
                  {stage.label}
                </span>
              </div>
              {index < QUIZ_STAGES.length - 1 && (
                <div
                  className={cn(
                    'mx-1 h-1 flex-1 rounded-full sm:mx-2',
                    done ? 'bg-[#1a1a1a]' : 'bg-[#e5e7eb]'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <dt className="text-sm text-[#6b7280]">{label}</dt>
      <dd className="text-right text-sm font-semibold">{value}</dd>
    </div>
  );
}
