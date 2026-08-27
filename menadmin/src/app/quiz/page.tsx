import type { Metadata } from 'next';
import { KegelQuiz } from '@/components/quiz/kegel-quiz';
import { SITE } from '@/lib/site-config';

export const metadata: Metadata = {
  title: `Quiz — ${SITE.name}`,
  description:
    'Эрэгтэчдэд зориулсан Кегелийн үнэлгээ. Хариултаа өгөөд хувийн дасгалын төлөвлөгөө аваарай.',
  robots: { index: true, follow: true },
};

export default function QuizPage() {
  return <KegelQuiz />;
}
