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
import { ImageUploadField } from '@/components/admin/image-upload-field';
import { WorkoutPhasesEditor } from '@/components/admin/workout-phases-editor';
import { WorkoutIntroSlidesEditor } from '@/components/admin/workout-intro-slides-editor';
import {
  carouselTabLabels,
  normalizePhases,
  phaseSequenceTotalSeconds,
  primaryHoldDurationSeconds,
  primaryHoldPhaseIndex,
  syncHoldTabDuration,
  templateForMotion,
} from '@/lib/workout-phase-templates';

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
  targetMuscles: '',
  videoUrl: '',
  thumbnailUrl: '',
  introSlides: [],
  sortOrder: 0,
  phases: [],
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
  const videoFileRefs = useRef<Record<number, HTMLInputElement | null>>({});

  function update(index: number, patch: Partial<WorkoutExercise>) {
    const next = exercises.map((ex, i) => {
      if (i !== index) return ex;
      const merged = { ...ex, ...patch };
      if (patch.phases) {
        const phases = normalizePhases(patch.phases);
        merged.phases = phases;
        merged.durationSeconds = phaseSequenceTotalSeconds(phases) || merged.durationSeconds;
      }
      return merged;
    });
    onChange(next);
  }

  function updatePhases(index: number, phases: WorkoutExercise['phases']) {
    const normalized = normalizePhases(phases);
    update(index, {
      phases: normalized,
      durationSeconds: phaseSequenceTotalSeconds(normalized),
    });
  }

  function updateHoldDuration(index: number, holdSeconds: number) {
    const phaseList = normalizePhases(exercises[index].phases);
    if (primaryHoldPhaseIndex(phaseList) >= 0) {
      const synced = syncHoldTabDuration(phaseList, holdSeconds);
      updatePhases(index, synced);
      return;
    }
    update(index, { durationSeconds: holdSeconds });
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

  function removeVideo(index: number) {
    const videoInput = videoFileRefs.current[index];
    if (videoInput) videoInput.value = '';
    update(index, { videoUrl: '', thumbnailUrl: '' });
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
          const phaseList = normalizePhases(exercise.phases);
          const holdDuration =
            primaryHoldDurationSeconds(phaseList) ?? exercise.durationSeconds;
          const tabPreview = carouselTabLabels(phaseList, exercise.name || 'Дасгал');
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
                      {phaseList.length > 0
                        ? ` · ${phaseList.length} таб`
                        : ''}
                      {tabPreview.length > 0
                        ? ` · ${tabPreview.slice(0, 2).join(' → ')}${tabPreview.length > 2 ? '…' : ''}`
                        : ''}
                      {exercise.videoUrl ? ' · 🎬' : ''}
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

                  <div className="space-y-1.5">
                    <Label>Target muscles</Label>
                    <Input
                      value={exercise.targetMuscles || ''}
                      onChange={(e) => update(index, { targetMuscles: e.target.value })}
                      placeholder="Аарцгийн ёроол, Гуяны дотор тал..."
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
                      <Label>
                        {primaryHoldPhaseIndex(phaseList) >= 0
                          ? 'Чангалж барих (сек)'
                          : 'Хугацаа (сек)'}
                      </Label>
                      <Input
                        type="number"
                        min={5}
                        value={holdDuration}
                        onChange={(e) =>
                          updateHoldDuration(index, Number(e.target.value))
                        }
                      />
                      <p className="text-[10px] text-[#95a5a6]">
                        {primaryHoldPhaseIndex(phaseList) >= 0
                          ? `Багцийн нийт: ${phaseSequenceTotalSeconds(phaseList)}с (апп дээр энэ табын ${holdDuration}с харагдана)`
                          : `Таб нэмэхэд автоматаар тооцогдоно (одоо ${phaseSequenceTotalSeconds(phaseList)}с)`}
                      </p>
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

                  <WorkoutPhasesEditor
                    phases={phaseList}
                    exerciseName={exercise.name}
                    motion={exercise.motion}
                    onChange={(phases) => updatePhases(index, phases)}
                  />

                  <WorkoutIntroSlidesEditor
                    title={`${exercise.name || 'Дасгал'} — intro story`}
                    description="Энэ дасгал эхлэхээс өмнөх FB-style story slides (видео/зураг)."
                    slides={exercise.introSlides || []}
                    onChange={(introSlides) => update(index, { introSlides })}
                    onUploadVideo={onUploadVideo}
                    onUploadImage={onUploadImage}
                  />

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
                          <>
                            <a
                              href={exercise.videoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-medium text-[#1abc9c] hover:underline"
                            >
                              Видео үзэх
                            </a>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => removeVideo(index)}
                            >
                              <Trash2 className="size-4" />
                              Видео устгах
                            </Button>
                          </>
                        )}
                      </div>
                      <ImageUploadField
                        label="Thumbnail"
                        value={exercise.thumbnailUrl}
                        onChange={(url) => update(index, { thumbnailUrl: url || '' })}
                        onUpload={onUploadImage}
                      />
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
