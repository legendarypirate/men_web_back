import { Article } from '@/lib/api';

export type ArticleStorySlide = {
  imageUrl?: string | null;
  accentLine?: string | null;
  line2?: string | null;
  line3?: string | null;
  body?: string | null;
  isCover?: boolean;
};

function slidesHaveContent(slides: ArticleStorySlide[]): boolean {
  return slides.some((slide) =>
    [slide.accentLine, slide.line2, slide.line3, slide.body].some(
      (value) => typeof value === 'string' && value.trim().length > 0
    )
  );
}

export { slidesHaveContent };

export function emptyStorySlide(isCover = false): ArticleStorySlide {
  return {
    imageUrl: null,
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

  const cover: ArticleStorySlide = {
    isCover: true,
    imageUrl,
    accentLine: words[0]?.toUpperCase() || null,
    line2:
      words.length > 1
        ? words.slice(1, Math.max(2, Math.ceil(words.length / 2))).join(' ').toUpperCase()
        : article.title.toUpperCase(),
    line3:
      words.length > 2
        ? words.slice(Math.max(2, Math.ceil(words.length / 2))).join(' ').toUpperCase()
        : null,
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
