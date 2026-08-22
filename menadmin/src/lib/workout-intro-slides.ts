export type WorkoutIntroSlide = {
  sortOrder?: number;
  title: string;
  subtitle?: string;
  body?: string;
  videoUrl?: string | null;
  imageUrl?: string | null;
  durationSeconds?: number;
  gradientStart?: string;
  gradientMid?: string;
  gradientEnd?: string;
};

export const emptyIntroSlide = (): WorkoutIntroSlide => ({
  title: '',
  subtitle: '',
  body: '',
  videoUrl: '',
  imageUrl: '',
  durationSeconds: 5,
  gradientStart: '#1A0A2E',
  gradientMid: '#2D1B69',
  gradientEnd: '#11022A',
});

export function normalizeIntroSlides(
  slides: WorkoutIntroSlide[] | undefined
): WorkoutIntroSlide[] {
  return (slides || []).map((slide, index) => ({
    ...slide,
    sortOrder: slide.sortOrder ?? index,
    durationSeconds: slide.durationSeconds ?? 5,
    videoUrl: slide.videoUrl || null,
    imageUrl: slide.imageUrl || null,
  }));
}
