'use client';

import { useRef, useState } from 'react';
import { ChevronDown, ChevronUp, GripVertical, Plus, Trash2, Upload, Video } from 'lucide-react';
import { WorkoutExercise } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const MOTIONS = [
  'kegelHold',
  'breath',
  'coreBrace',
  'pulse',
  'pushup',
  'endurance',
  'wave',
] as const;

export const emptyExercise = (): WorkoutExercise => ({
  name: '',
  category: '',
  instruction: '',
  durationSeconds: 30,
  sets: 3,
  motion: 'kegelHold',
  motionHint: '',
  videoUrl: '',
  thumbnailUrl: '',
  sortOrder: 0,
});

type Props = {
  exercises: WorkoutExercise[];
  onChange: (exercises: WorkoutExercise[]) => void;
  onUploadVideo: (file: File) => Promise<{ url: string; thumbnailUrl?: string }>;
  onUploadImage: (file: File) => Promise<string>;
};

export function WorkoutExercisesEditor({
  exercises,
  onChange,
  onUploadVideo,
  onUploadImage,
}: Props) {
  const [expanded, setExpanded] = useState<number | null>(0);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadingThumbIndex, setUploadingThumbIndex] = useState<number | null>(null);
  const videoFileRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const thumbFileRefs = useRef<Record<number, HTMLInputElement | null>>({});

  function update(index: number, patch: Partial<WorkoutExercise>) {
    const next = exercises.map((ex, i) => (i === index ? { ...ex, ...patch } : ex));
    onChange(next);
  }

  function addExercise() {
    const next = [...exercises, { ...emptyExercise(), sortOrder: exercises.length }];
    onChange(next);
    setExpanded(next.length - 1);
  }

  function removeExercise(index: number) {
    const next = exercises.filter((_, i) => i !== index).map((ex, i) => ({ ...ex, sortOrder: i }));
    onChange(next);
    setExpanded(null);
  }

  function moveExercise(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= exercises.length) return;
    const next = [...exercises];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((ex, i) => ({ ...ex, sortOrder: i })));
    setExpanded(target);
  }

  async function handleVideoFile(index: number, file: File | undefined) {
    if (!file) return;
    setUploadingIndex(index);
    try {
      const result = await onUploadVideo(file);
      update(index, {
        videoUrl: result.url,
        thumbnailUrl: result.thumbnailUrl || exercises[index].thumbnailUrl,
      });
    } finally {
      setUploadingIndex(null);
    }
  }

  async function handleThumbnailFile(index: number, file: File | undefined) {
    if (!file) return;
    setUploadingThumbIndex(index);
    try {
      const url = await onUploadImage(file);
      update(index, { thumbnailUrl: url });
    } finally {
      setUploadingThumbIndex(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-semibold">Дасгалууд / видеонууд</Label>
          <p className="text-xs text-muted-foreground">
            Дасгал бүрт заавар, хөдөлгөөн, видео URL эсвэл файл байршуулна
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addExercise}>
          <Plus className="size-4" />
          Дасгал нэмэх
        </Button>
      </div>

      {exercises.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#dfe4ea] bg-[#fafbfc] p-8 text-center text-sm text-[#95a5a6]">
          Одоогоор дасгал байхгүй. &quot;Дасгал нэмэх&quot; товч дарна уу.
        </div>
      ) : (
        exercises.map((exercise, index) => {
          const open = expanded === index;
          return (
            <div
              key={index}
              className="overflow-hidden rounded-lg border border-[#e8ecef] bg-white"
            >
              <div className="flex w-full items-center gap-2 px-3 py-2.5">
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-2 rounded-md text-left hover:bg-[#fafbfc]"
                  onClick={() => setExpanded(open ? null : index)}
                >
                  <GripVertical className="size-4 shrink-0 text-[#bdc3c7]" />
                  <span className="flex size-6 shrink-0 items-center justify-center rounded bg-[#e8f8f5] text-xs font-bold text-[#1abc9c]">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#2c3e50]">
                      {exercise.name || 'Шинэ дасгал'}
                    </p>
                    <p className="truncate text-xs text-[#95a5a6]">
                      {exercise.category || 'Ангилал'} · {exercise.sets} багц ·{' '}
                      {exercise.durationSeconds}с
                      {exercise.videoUrl ? ' · 🎬 видео' : ''}
                    </p>
                  </div>
                </button>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={index === 0}
                    onClick={() => moveExercise(index, -1)}
                  >
                    <ChevronUp className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={index === exercises.length - 1}
                    onClick={() => moveExercise(index, 1)}
                  >
                    <ChevronDown className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeExercise(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              {open && (
                <div className="space-y-3 border-t border-[#eef1f4] p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Нэр</Label>
                      <Input
                        value={exercise.name}
                        onChange={(e) => update(index, { name: e.target.value })}
                        placeholder="Кегелийн барих"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Ангилал</Label>
                      <Input
                        value={exercise.category}
                        onChange={(e) => update(index, { category: e.target.value })}
                        placeholder="ААРЦГИЙН ЁРООЛ"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Заавар</Label>
                    <Textarea
                      value={exercise.instruction}
                      onChange={(e) => update(index, { instruction: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-4">
                    <div className="space-y-1.5">
                      <Label>Багц</Label>
                      <Input
                        type="number"
                        min={1}
                        value={exercise.sets}
                        onChange={(e) => update(index, { sets: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Хугацаа (сек)</Label>
                      <Input
                        type="number"
                        min={5}
                        value={exercise.durationSeconds}
                        onChange={(e) =>
                          update(index, { durationSeconds: Number(e.target.value) })
                        }
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label>Хөдөлгөөн</Label>
                      <Select
                        value={exercise.motion}
                        onValueChange={(v) => v && update(index, { motion: v })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MOTIONS.map((m) => (
                            <SelectItem key={m} value={m}>
                              {m}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Хөдөлгөөний зөвлөмж</Label>
                    <Input
                      value={exercise.motionHint}
                      onChange={(e) => update(index, { motionHint: e.target.value })}
                    />
                  </div>

                  <div className="rounded-lg border border-[#e8ecef] bg-[#fafbfc] p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <Video className="size-4 text-[#1abc9c]" />
                      <Label className="mb-0">Дасгалын видео</Label>
                    </div>
                    <div className="space-y-2">
                      <Input
                        value={exercise.videoUrl || ''}
                        onChange={(e) => update(index, { videoUrl: e.target.value })}
                        placeholder="https://... эсвэл файл байршуулна"
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          ref={(el) => {
                            videoFileRefs.current[index] = el;
                          }}
                          type="file"
                          accept="video/mp4,video/webm,video/quicktime"
                          className="hidden"
                          onChange={(e) => handleVideoFile(index, e.target.files?.[0])}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={uploadingIndex === index}
                          onClick={() => videoFileRefs.current[index]?.click()}
                        >
                          <Upload className="size-4" />
                          {uploadingIndex === index
                            ? 'Cloudinary руу...'
                            : 'Видео байршуулах'}
                        </Button>
                        {exercise.videoUrl && (
                          <a
                            href={exercise.videoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-medium text-[#1abc9c] hover:underline"
                          >
                            Видео үзэх
                          </a>
                        )}
                      </div>
                      <Input
                        value={exercise.thumbnailUrl || ''}
                        onChange={(e) => update(index, { thumbnailUrl: e.target.value })}
                        placeholder="Thumbnail URL (Cloudinary эсвэл гаднах холбоос)"
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          ref={(el) => {
                            thumbFileRefs.current[index] = el;
                          }}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          className="hidden"
                          onChange={(e) =>
                            handleThumbnailFile(index, e.target.files?.[0])
                          }
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={uploadingThumbIndex === index}
                          onClick={() => thumbFileRefs.current[index]?.click()}
                        >
                          <Upload className="size-4" />
                          {uploadingThumbIndex === index
                            ? 'Cloudinary руу...'
                            : 'Thumbnail байршуулах'}
                        </Button>
                      </div>
                    </div>
                    {exercise.videoUrl && (
                      <video
                        src={exercise.videoUrl}
                        controls
                        className={cn('mt-3 max-h-40 w-full rounded-md bg-black')}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
