'use client';

import { AlignCenter, AlignLeft, ChevronDown, ChevronUp, Minus, Plus, Sparkles, Trash2, Video } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import {
  ArticleStorySlide,
  TITLE_FONT_MAX,
  TITLE_FONT_MIN,
  TITLE_SIZE_PRESETS,
  BODY_FONT_MAX,
  BODY_FONT_MIN,
  buildStorySlidesFromArticle,
  emptyStorySlide,
  resolvedBodyFontSize,
  resolvedTextAlign,
  resolvedTitleFontSize,
} from '@/lib/article-story-slides';
import { Article } from '@/lib/api';
import { ImageUploadField } from '@/components/admin/image-upload-field';
import { VideoUploadField } from '@/components/admin/video-upload-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type Props = {
  article: Pick<Article, 'title' | 'excerpt' | 'body' | 'imageUrl'>;
  slides: ArticleStorySlide[];
  onChange: (slides: ArticleStorySlide[]) => void;
  onUploadImage: (file: File) => Promise<string>;
  onUploadVideo: (
    file: File
  ) => Promise<{ url: string; thumbnailUrl?: string; duration?: number }>;
};

export function ArticleStorySlidesEditor({
  article,
  slides,
  onChange,
  onUploadImage,
  onUploadVideo,
}: Props) {
  const [expanded, setExpanded] = useState<number | null>(slides.length ? 0 : null);

  function update(index: number, patch: Partial<ArticleStorySlide>) {
    onChange(slides.map((slide, i) => (i === index ? { ...slide, ...patch } : slide)));
  }

  function addSlide(isCover = false) {
    const next = [...slides, emptyStorySlide(isCover)];
    onChange(next);
    setExpanded(next.length - 1);
  }

  function removeSlide(index: number) {
    onChange(slides.filter((_, i) => i !== index));
    setExpanded(null);
  }

  function moveSlide(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= slides.length) return;
    const next = [...slides];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
    setExpanded(target);
  }

  function generateFromArticle() {
    onChange(buildStorySlidesFromArticle(article));
    setExpanded(0);
  }

  return (
    <div className="space-y-3 rounded-xl border bg-muted/20 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">Story slides</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Текст, фонт, байрлалыг энд тохируулна. Утасны preview дээр яг хэрхэн харагдахыг харж болно.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={generateFromArticle}>
          <Sparkles className="mr-2 h-4 w-4" />
          Гарчиг/body-оос үүсгэх
        </Button>
      </div>

      {slides.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Story slide байхгүй. Cover slide нэмэх эсвэл автоматаар үүсгэнэ үү.
        </p>
      )}

      {slides.map((slide, index) => {
        const isOpen = expanded === index;
        const label = slide.isCover
          ? `Cover — ${slide.line2 || slide.accentLine || `#${index + 1}`}`
          : `Slide ${index + 1} — ${slide.line2 || slide.body || 'Агуулга'}`;

        return (
          <div key={index} className="rounded-lg border bg-background">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              onClick={() => setExpanded(isOpen ? null : index)}
            >
              <span className="truncate text-sm font-medium">{label}</span>
              <span className="flex shrink-0 items-center gap-2">
                {slide.videoUrl ? <Video className="h-4 w-4 text-emerald-600" /> : null}
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </span>
            </button>

            {isOpen && (
              <div className="space-y-4 border-t px-4 py-4">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <Label htmlFor={`cover-${index}`}>Cover slide</Label>
                  <Switch
                    id={`cover-${index}`}
                    checked={Boolean(slide.isCover)}
                    onCheckedChange={(checked) => update(index, { isCover: checked })}
                  />
                </div>

                <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_240px]">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{slide.isCover ? 'Дээд жижиг бичиг (улаан)' : 'Дугаар / label'}</Label>
                      <Input
                        value={slide.accentLine || ''}
                        onChange={(e) => update(index, { accentLine: e.target.value })}
                        placeholder={slide.isCover ? 'КЕГЕЛ' : '1'}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{slide.isCover ? 'Гарчиг' : 'Гарчиг'}</Label>
                      <Textarea
                        value={slide.line2 || ''}
                        onChange={(e) => update(index, { line2: e.target.value })}
                        rows={3}
                        placeholder={'КЕГЕЛ ДАСГАЛ ГЭЖ\nЮУ ВЭ?'}
                        className="min-h-[88px] resize-y text-[15px] leading-6"
                      />
                      <p className="text-xs text-muted-foreground">
                        Шинэ мөрөнд шилжихийн тулд Enter дарна уу.
                      </p>
                    </div>

                    {slide.isCover ? (
                      <div className="space-y-2">
                        <Label>Дэд гарчиг</Label>
                        <Textarea
                          value={slide.line3 || ''}
                          onChange={(e) => update(index, { line3: e.target.value })}
                          rows={2}
                          placeholder="Өдөр бүрийн 5–10 минутын дасгал"
                          className="resize-y text-sm"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label>Body текст</Label>
                        <Textarea
                          value={slide.body || ''}
                          onChange={(e) => update(index, { body: e.target.value })}
                          rows={4}
                          className="resize-y text-sm leading-6"
                        />
                      </div>
                    )}

                    <StoryTextStyleControls
                      slide={slide}
                      onChange={(patch) => update(index, patch)}
                    />
                  </div>

                  <StoryTextPreview slide={slide} />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <VideoUploadField
                    label="Slide видео"
                    value={slide.videoUrl}
                    onUpload={onUploadVideo}
                    onChange={(url, meta) => {
                      if (!url) {
                        update(index, { videoUrl: null });
                        return;
                      }
                      update(index, {
                        videoUrl: url,
                        imageUrl: meta?.thumbnailUrl || slide.imageUrl || null,
                        durationSeconds: meta?.duration
                          ? Math.max(2, Math.round(meta.duration))
                          : slide.durationSeconds,
                      });
                    }}
                  />
                  <div className="space-y-2">
                    <ImageUploadField
                      label="Slide зураг"
                      value={slide.imageUrl}
                      onChange={(url) => update(index, { imageUrl: url })}
                      onUpload={onUploadImage}
                    />
                    {article.imageUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => update(index, { imageUrl: article.imageUrl || null })}
                      >
                        Cover зураг ашиглах
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => moveSlide(index, -1)}>
                    Дээш
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => moveSlide(index, 1)}>
                    Доош
                  </Button>
                  <Button type="button" variant="destructive" size="sm" onClick={() => removeSlide(index)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Устгах
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => addSlide(true)}>
          Cover slide
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => addSlide(false)}>
          Content slide
        </Button>
      </div>
    </div>
  );
}

function StoryTextStyleControls({
  slide,
  onChange,
}: {
  slide: ArticleStorySlide;
  onChange: (patch: Partial<ArticleStorySlide>) => void;
}) {
  const titleSize = resolvedTitleFontSize(slide);
  const bodySize = resolvedBodyFontSize(slide);
  const align = resolvedTextAlign(slide);

  return (
    <div className="space-y-3 rounded-lg border p-3">
      <div className="flex items-center justify-between gap-3">
        <Label>Текстийн загвар</Label>
        <div className="flex overflow-hidden rounded-md border">
          <AlignButton
            active={align === 'left'}
            onClick={() => onChange({ textAlign: 'left' })}
            label="Зүүн"
          >
            <AlignLeft className="h-4 w-4" />
          </AlignButton>
          <AlignButton
            active={align === 'center'}
            onClick={() => onChange({ textAlign: 'center' })}
            label="Төв"
          >
            <AlignCenter className="h-4 w-4" />
          </AlignButton>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {TITLE_SIZE_PRESETS.map((preset) => (
          <Button
            key={preset.value}
            type="button"
            size="xs"
            variant={titleSize === preset.value ? 'default' : 'outline'}
            onClick={() => onChange({ titleFontSize: preset.value })}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      <FontSizeStepper
        label="Гарчиг"
        value={titleSize}
        min={TITLE_FONT_MIN}
        max={TITLE_FONT_MAX}
        onChange={(titleFontSize) => onChange({ titleFontSize })}
      />
      <FontSizeStepper
        label={slide.isCover ? 'Дэд гарчиг' : 'Body'}
        value={bodySize}
        min={BODY_FONT_MIN}
        max={BODY_FONT_MAX}
        onChange={(bodyFontSize) => onChange({ bodyFontSize })}
      />
    </div>
  );
}

function AlignButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center',
        active ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'
      )}
    >
      {children}
    </button>
  );
}

function FontSizeStepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs tabular-nums text-muted-foreground">{value}px</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          onClick={() => onChange(Math.max(min, value - 2))}
          disabled={value <= min}
        >
          <Minus />
        </Button>
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-2 w-full cursor-pointer accent-primary"
        />
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          onClick={() => onChange(Math.min(max, value + 2))}
          disabled={value >= max}
        >
          <Plus />
        </Button>
      </div>
    </div>
  );
}

function StoryTextPreview({ slide }: { slide: ArticleStorySlide }) {
  const titleSize = resolvedTitleFontSize(slide);
  const bodySize = resolvedBodyFontSize(slide);
  const align = resolvedTextAlign(slide);
  const scale = 220 / 390;
  const media = slide.imageUrl || '';
  const accent = slide.accentLine?.trim();
  const showAccent = Boolean(accent && !/^\d+$/.test(accent));

  return (
    <div className="lg:sticky lg:top-4">
      <p className="mb-2 text-center text-xs text-muted-foreground">Утасны харагдац</p>
      <div
        className="relative mx-auto aspect-[9/16] w-[220px] overflow-hidden rounded-[1.6rem] border border-black/40 bg-[#14161D] shadow-md"
        style={
          media
            ? {
                backgroundImage: `url(${media})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/20" />
        <div
          className={cn(
            'absolute inset-x-0 bottom-8 px-4 text-white',
            align === 'center' && 'text-center'
          )}
        >
          {showAccent && (
            <div
              className={cn(
                'mb-2 text-[9px] font-bold tracking-[0.22em] text-[#FF453A]',
                align === 'center' && 'justify-center'
              )}
            >
              {accent}
            </div>
          )}
          {slide.line2?.trim() && (
            <div
              className="whitespace-pre-wrap font-extrabold uppercase"
              style={{
                fontSize: Math.max(11, titleSize * scale),
                lineHeight: 1.08,
                letterSpacing: '-0.03em',
              }}
            >
              {slide.line2}
            </div>
          )}
          {(slide.isCover ? slide.line3 : slide.body)?.trim() && (
            <div
              className="mt-2 whitespace-pre-wrap font-medium opacity-95"
              style={{
                fontSize: Math.max(9, bodySize * scale),
                lineHeight: 1.35,
              }}
            >
              {slide.isCover ? slide.line3 : slide.body}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
