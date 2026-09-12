import type { QuizStagePayload } from '@/lib/quiz-api';

const warmedUrls = new Set<string>();
const readyPromises = new Map<string, Promise<void>>();

export function collectQuizVideoUrls(stages: QuizStagePayload[]): string[] {
  const urls = new Set<string>();
  for (const stage of stages) {
    for (const item of stage.endMediaItems) {
      if (item.type === 'video' && item.url.trim()) {
        urls.add(item.url.trim());
      }
    }
  }
  return [...urls];
}

/** Warm the browser cache for quiz section-end videos (Cloudinary / CDN). */
export function preloadQuizVideos(urls: string[]) {
  if (typeof document === 'undefined') return;
  for (const url of urls) {
    void ensureVideoReady(url);
  }
}

/** Resolves when enough data is buffered to play smoothly (or on timeout / error). */
export function ensureVideoReady(url: string): Promise<void> {
  const normalized = url.trim();
  if (!normalized) return Promise.resolve();

  const existing = readyPromises.get(normalized);
  if (existing) return existing;

  const promise = new Promise<void>((resolve) => {
    if (warmedUrls.has(normalized)) {
      resolve();
      return;
    }

    warmedUrls.add(normalized);

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'video';
    link.href = normalized;
    document.head.appendChild(link);

    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.src = normalized;

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      video.removeEventListener('canplaythrough', finish);
      video.removeEventListener('loadeddata', finish);
      video.removeEventListener('error', finish);
      video.src = '';
      video.load();
      resolve();
    };

    video.addEventListener('canplaythrough', finish, { once: true });
    video.addEventListener('loadeddata', finish, { once: true });
    video.addEventListener('error', finish, { once: true });
    video.load();

    window.setTimeout(finish, 12_000);
  });

  readyPromises.set(normalized, promise);
  return promise;
}
