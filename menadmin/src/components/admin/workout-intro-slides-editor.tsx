'use client';

import { useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2, Upload, Video } from 'lucide-react';
import { WorkoutIntroSlide } from '@/lib/api';
import { emptyIntroSlide } from '@/lib/workout-intro-slides';
import { ImageUploadField } from '@/components/admin/image-upload-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type Props = {
  title: string;
  description?: string;
  slides: WorkoutIntroSlide[];
  onChange: (slides: WorkoutIntroSlide[]) => void;
  onUploadVideo: (file: File) => Promise<{ url: string; thumbnailUrl?: string }>;
  onUploadImage: (file: File) => Promise<string>;
};

export function WorkoutIntroSlidesEditor({
  title,
  description,
  slides,
  onChange,
  onUploadVideo,
  onUploadImage,
}: Props) {
  const [expanded, setExpanded] = useState<number | null>(slides.length ? 0 : null);
  const [uploadingVideoIndex, setUploadingVideoIndex] = useState<number | null>(null);
  const videoRefs = useRef<Record<number, HTMLInputElement | null>>({});

  function update(index: number, patch: Partial<WorkoutIntroSlide>) {
    onChange(slides.map((slide, i) => (i === index ? { ...slide, ...patch } : slide)));
  }

  function addSlide() {
    const next = [...slides, emptyIntroSlide()];
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

  async function handleVideoUpload(index: number, file: File) {
    setUploadingVideoIndex(index);
    try {
      const result = await onUploadVideo(file);
      update(index, {
        videoUrl: result.url,
        imageUrl: result.thumbnailUrl || slides[index].imageUrl || null,
      });
    } finally {
      setUploadingVideoIndex(null);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border bg-muted/20 p-4">
      <div>
        <h3 className="font-semibold">{title}</h3>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>

      {slides.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Story slide байхгүй. Intro видео/зураг нэмэхийн тулд slide нэмнэ үү.
        </p>
      )}

      {slides.map((slide, index) => {
        const isOpen = expanded === index;
        return (
          <div key={index} className="rounded-lg border bg-background">
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-left"
              onClick={() => setExpanded(isOpen ? null : index)}
            >
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              <span className="flex-1 font-medium">
                Slide {index + 1}: {slide.title || 'Гарчиггүй'}
              </span>
              {slide.videoUrl ? <Video className="h-4 w-4 text-emerald-600" /> : null}
            </button>

            {isOpen && (
              <div className="space-y-3 border-t px-3 py-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Гарчиг</Label>
                    <Input
                      value={slide.title}
                      onChange={(e) => update(index, { title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Дэд гарчиг</Label>
                    <Input
                      value={slide.subtitle || ''}
                      onChange={(e) => update(index, { subtitle: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>Тайлбар</Label>
                  <Textarea
                    value={slide.body || ''}
                    onChange={(e) => update(index, { body: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-4">
                  <div className="space-y-1">
                    <Label>Хугацаа (сек)</Label>
                    <Input
                      type="number"
                      min={2}
                      max={60}
                      value={slide.durationSeconds ?? 5}
                      onChange={(e) =>
                        update(index, { durationSeconds: Number(e.target.value) || 5 })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Gradient 1</Label>
                    <Input
                      value={slide.gradientStart || ''}
                      onChange={(e) => update(index, { gradientStart: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Gradient 2</Label>
                    <Input
                      value={slide.gradientMid || ''}
                      onChange={(e) => update(index, { gradientMid: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Gradient 3</Label>
                    <Input
                      value={slide.gradientEnd || ''}
                      onChange={(e) => update(index, { gradientEnd: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Story видео URL</Label>
                    <Input
                      value={slide.videoUrl || ''}
                      onChange={(e) => update(index, { videoUrl: e.target.value })}
                      placeholder="Cloudinary video URL"
                    />
                    <div className="flex gap-2">
                      <input
                        ref={(el) => {
                          videoRefs.current[index] = el;
                        }}
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void handleVideoUpload(index, file);
                          e.target.value = '';
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingVideoIndex === index}
                        onClick={() => videoRefs.current[index]?.click()}
                      >
                        <Upload className="mr-1 h-4 w-4" />
                        {uploadingVideoIndex === index ? 'Upload...' : 'Видео upload'}
                      </Button>
                      {slide.videoUrl && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => update(index, { videoUrl: null })}
                        >
                          Устгах
                        </Button>
                      )}
                    </div>
                  </div>

                  <ImageUploadField
                    label="Story зураг"
                    value={slide.imageUrl}
                    onChange={(url) => update(index, { imageUrl: url })}
                    onUpload={onUploadImage}
                  />
                </div>

                {(slide.videoUrl || slide.imageUrl) && (
                  <div className="overflow-hidden rounded-lg border">
                    {slide.videoUrl ? (
                      <video
                        src={slide.videoUrl}
                        controls
                        className="max-h-48 w-full bg-black object-contain"
                      />
                    ) : slide.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={slide.imageUrl} alt="" className="max-h-48 w-full object-cover" />
                    ) : null}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => moveSlide(index, -1)}>
                    Дээш
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => moveSlide(index, 1)}>
                    Доош
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeSlide(index)}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Slide устгах
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <Button type="button" variant="outline" size="sm" onClick={addSlide}>
        <Plus className="mr-1 h-4 w-4" />
        Story slide нэмэх
      </Button>
    </div>
  );
}
