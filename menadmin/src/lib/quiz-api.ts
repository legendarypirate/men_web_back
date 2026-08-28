import {
  buildQuizResult,
  PROCESSING_MESSAGES,
  QUIZ_QUESTIONS,
  QUIZ_STAGES,
  type QuizOption,
  type QuizQuestion,
} from '@/lib/quiz-data';

export type QuizEndMediaItem = {
  id: string;
  type: 'image' | 'video';
  url: string;
  title?: string;
  caption?: string;
  sortOrder?: number;
};

export type QuizStagePayload = {
  id: number;
  label: string;
  sortOrder?: number;
  endMediaItems: QuizEndMediaItem[];
};

export type QuizConfigPayload = {
  processingTitle: string;
  processingMessages: string[];
};

export type QuizPayload = {
  stages: QuizStagePayload[];
  questions: QuizQuestion[];
  config: QuizConfigPayload;
};

export type QuizStageAdmin = {
  id: number;
  label: string;
  sortOrder: number;
  active: boolean;
  endMediaType: 'none' | 'image' | 'video';
  endMediaUrl?: string | null;
  endMediaCaption?: string | null;
};

export type QuizQuestionAdmin = {
  id: string;
  stageId: number;
  title: string;
  options: QuizOption[];
  sortOrder: number;
  active: boolean;
};

export type QuizConfigAdmin = {
  id: string;
  processingTitle: string;
  processingMessages: string[];
  active: boolean;
};

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export async function fetchPublicQuiz(): Promise<QuizPayload> {
  const res = await fetch('/api/quiz', { cache: 'no-store' });
  const json = (await res.json()) as ApiEnvelope<QuizPayload>;
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Quiz ачаалахад алдаа гарлаа');
  }
  return json.data;
}

export function getQuizFallback(): QuizPayload {
  return {
    stages: QUIZ_STAGES.map((stage) => ({
      id: stage.id,
      label: stage.label,
      endMediaItems: [],
    })),
    questions: QUIZ_QUESTIONS,
    config: {
      processingTitle: 'Таны төлөвлөгөө бэлтгэгдэж байна',
      processingMessages: [...PROCESSING_MESSAGES],
    },
  };
}

export { buildQuizResult };
