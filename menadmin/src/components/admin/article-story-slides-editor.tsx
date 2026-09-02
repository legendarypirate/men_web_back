'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Sparkles, Trash2, Video } from 'lucide-react';
import {
  ArticleStorySlide,
  buildStorySlidesFromArticle,
  emptyStorySlide,
} from '@/lib/article-story-slides';
import { Article } from '@/lib/api';
import { ImageUploadField } from '@/components/admin/image-upload-field';
import { VideoUploadField } from '@/components/admin/video-upload-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

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
            Мэдлэг/FAQ story слайдууд. Слайд бүрт зураг эсвэл видео байршуулж болно.
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

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>{slide.isCover ? 'Accent (улаан)' : 'Дугаар'}</Label>
                    <Input
                      value={slide.accentLine || ''}
                      onChange={(e) => update(index, { accentLine: e.target.value })}
                      placeholder={slide.isCover ? 'УРТ' : '1'}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>{slide.isCover ? 'Line 2 (цагаан)' : 'Гарчиг'}</Label>
                    <Input
                      value={slide.line2 || ''}
                      onChange={(e) => update(index, { line2: e.target.value })}
                    />
                  </div>
                </div>

                {slide.isCover ? (
                  <div className="space-y-2">
                    <Label>Line 3 (том цагаан)</Label>
                    <Input
                      value={slide.line3 || ''}
                      onChange={(e) => update(index, { line3: e.target.value })}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Body текст</Label>
                    <Textarea
                      value={slide.body || ''}
                      onChange={(e) => update(index, { body: e.target.value })}
                      rows={3}
                    />
                  </div>
                )}

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
          <Plus className="mr-2 h-4 w-4" />
          Cover slide
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => addSlide(false)}>
          <Plus className="mr-2 h-4 w-4" />
          Content slide
        </Button>
      </div>
    </div>
  );
}
