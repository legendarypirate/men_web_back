import { Article, ArticleStorySlide, StoryTextAlign } from '@/lib/api';

export type { ArticleStorySlide, StoryTextAlign };

export const TITLE_FONT_MIN = 18;
export const TITLE_FONT_MAX = 48;
export const BODY_FONT_MIN = 12;
export const BODY_FONT_MAX = 24;

export const DEFAULT_COVER_TITLE_SIZE = 28;
export const DEFAULT_CONTENT_TITLE_SIZE = 30;
export const DEFAULT_BODY_SIZE = 16;

export const TITLE_SIZE_PRESETS = [
  { label: 'Жижиг', value: 22 },
  { label: 'Дунд', value: 28 },
  { label: 'Том', value: 34 },
  { label: 'Маш том', value: 42 },
] as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function resolvedTitleFontSize(slide: ArticleStorySlide) {
  const fallback = slide.isCover ? DEFAULT_COVER_TITLE_SIZE : DEFAULT_CONTENT_TITLE_SIZE;
  const raw = slide.titleFontSize;
  if (typeof raw !== 'number' || Number.isNaN(raw)) return fallback;
  return clamp(raw, TITLE_FONT_MIN, TITLE_FONT_MAX);
}

export function resolvedBodyFontSize(slide: ArticleStorySlide) {
  const raw = slide.bodyFontSize;
  if (typeof raw !== 'number' || Number.isNaN(raw)) return DEFAULT_BODY_SIZE;
  return clamp(raw, BODY_FONT_MIN, BODY_FONT_MAX);
}

export function resolvedTextAlign(slide: ArticleStorySlide): StoryTextAlign {
  return slide.textAlign === 'center' ? 'center' : 'left';
}

function slidesHaveContent(slides: ArticleStorySlide[]): boolean {
  return slides.some((slide) => {
    const imageUrl = typeof slide.imageUrl === 'string' ? slide.imageUrl.trim() : '';
    const videoUrl = typeof slide.videoUrl === 'string' ? slide.videoUrl.trim() : '';
    if (imageUrl || videoUrl) return true;
    return [slide.line2, slide.line3, slide.body].some(
      (value) => typeof value === 'string' && value.trim().length > 0
    );
  });
}

export { slidesHaveContent };

export function emptyStorySlide(isCover = false): ArticleStorySlide {
  return {
    imageUrl: null,
    videoUrl: null,
    accentLine: isCover ? null : '1',
    line2: null,
    line3: null,
    body: null,
    isCover,
  };
}

export function buildStorySlidesFromArticle(
  article: Pick<Article, 'title' | 'excerpt' | 'body' | 'imageUrl'>
): ArticleStorySlide[] {
  const imageUrl = article.imageUrl || null;
  const words = article.title.trim().split(/\s+/).filter(Boolean);

  const mid = Math.ceil(words.length / 2);
  const coverTitle =
    words.length > 4
      ? `${words.slice(0, mid).join(' ')}\n${words.slice(mid).join(' ')}`
      : article.title.trim();

  const cover: ArticleStorySlide = {
    isCover: true,
    imageUrl,
    titleFontSize: DEFAULT_COVER_TITLE_SIZE,
    bodyFontSize: DEFAULT_BODY_SIZE,
    textAlign: 'center',
    line2: coverTitle || null,
    line3: article.excerpt?.trim() || null,
  };

  const lines = (article.body || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const contentSlides: ArticleStorySlide[] = lines.map((line, index) => {
    const headline = line.split('.')[0]?.trim() || `Зөвлөгөө ${index + 1}`;
    return {
      isCover: false,
      imageUrl,
      accentLine: String(index + 1),
      line2: headline,
      body: line,
    };
  });

  if (contentSlides.length === 0 && article.excerpt.trim()) {
    contentSlides.push({
      isCover: false,
      imageUrl,
      accentLine: '1',
      line2: article.excerpt,
      body: article.excerpt,
    });
  }

  return [cover, ...contentSlides];
}
