'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api, WorkoutProgram } from '@/lib/api';
import { AppDrawer } from '@/components/custom/app-drawer';
import { AppTable } from '@/components/custom/app-table';
import { useConfirm } from '@/components/custom/confirm-provider';
import { AddButton } from '@/components/custom/add-button';
import {
  emptyExercise,
  WorkoutExercisesEditor,
} from '@/components/admin/workout-exercises-editor';
import { WorkoutProgramCarouselPreview } from '@/components/admin/workout-program-carousel-preview';
import { WorkoutProgramVideoEditor } from '@/components/admin/workout-program-video-editor';
import { WorkoutIntroSlidesEditor } from '@/components/admin/workout-intro-slides-editor';
import {
  normalizeIntroSlides,
} from '@/lib/workout-intro-slides';
import {
  normalizePhases,
  phaseSequenceTotalSeconds,
} from '@/lib/workout-phase-templates';
import { ErrorState, LoadingState, PageHeader, StatusBadge } from '@/components/page-ui';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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

const WORKOUT_TAGS = [
  { value: '', label: 'Бүгд' },
  { value: 'PELVIC STRETCHING', label: 'Pelvic Stretching' },
  { value: 'GROIN FITNESS', label: 'Groin Fitness' },
  { value: 'KEGEL', label: 'Kegel' },
  { value: 'ӨНӨӨДРИЙН ДАСГАЛ', label: 'Өнөөдрийн дасгал' },
] as const;

const WORKOUT_LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'All Levels',
  'Эхлэгч',
  'Дунд',
  'Ахисан',
] as const;

const TAG_PRESETS = [
  'PELVIC STRETCHING',
  'GROIN FITNESS',
  'KEGEL',
  'ӨНӨӨДРИЙН ДАСГАЛ',
  'ШИНЭ',
] as const;

export default function WorkoutsPage() {
  const confirm = useConfirm();
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [tagFilter, setTagFilter] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<WorkoutProgram | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const empty: WorkoutProgram = {
    id: '',
    title: '',
    description: '',
    level: 'Beginner',
    durationMinutes: 10,
    equipment: 'None',
    tag: 'PELVIC STRETCHING',
    isToday: false,
    sortOrder: 0,
    videoUrl: null,
    thumbnailUrl: null,
    introSlides: [],
    exercises: [],
  };

  async function load(filterTag = tagFilter) {
    setLoading(true);
    try {
      const res = await api.workouts.list(filterTag || undefined);
      setPrograms(res.data.programs);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Алдаа');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagFilter]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const payload = {
        ...editing,
        videoUrl: editing.videoUrl || null,
        thumbnailUrl: editing.thumbnailUrl || null,
        introSlides: normalizeIntroSlides(editing.introSlides).map((slide, j) => ({
          ...slide,
          sortOrder: j,
        })),
        exercises: (editing.exercises || []).map((ex, i) => {
          const phases = normalizePhases(ex.phases).map((ph, j) => ({
            ...ph,
            sortOrder: j,
          }));
          const durationFromPhases = phaseSequenceTotalSeconds(phases);
          return {
            ...ex,
            sortOrder: i,
            videoUrl: ex.videoUrl || null,
            thumbnailUrl: ex.thumbnailUrl || null,
            introSlides: normalizeIntroSlides(ex.introSlides).map((slide, j) => ({
              ...slide,
              sortOrder: j,
            })),
            phases,
            durationSeconds: durationFromPhases > 0 ? durationFromPhases : ex.durationSeconds,
          };
        }),
      };
      if (editing.id && programs.some((p) => p.id === editing.id)) {
        await api.workouts.update(editing.id, payload);
      } else {
        await api.workouts.create(payload);
      }
      setShowForm(false);
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Хадгалахад алдаа');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const ok = await confirm({
      title: 'Хөтөлбөр устгах уу?',
      description: 'Энэ үйлдлийг буцаах боломжгүй.',
      confirmLabel: 'Устгах',
      destructive: true,
    });
    if (!ok) return;
    await api.workouts.remove(id);
    load();
  }

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader
        title="Дасгалын хөтөлбөрүүд"
        subtitle={
          tagFilter
            ? `${programs.length} хөтөлбөр · ${tagFilter}`
            : `${programs.length} хөтөлбөр`
        }
        action={
          <AddButton
            label="Хөтөлбөр нэмэх"
            onClick={() => {
              setEditing({
                ...empty,
                id: `program_${Date.now()}`,
                tag: tagFilter || empty.tag,
                exercises: [emptyExercise()],
              });
              setShowForm(true);
            }}
          />
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {WORKOUT_TAGS.map((item) => (
          <Button
            key={item.label}
            type="button"
            size="sm"
            variant={tagFilter === item.value ? 'default' : 'outline'}
            className={cn(tagFilter === item.value && 'bg-[#FF453A] hover:bg-[#e63e35]')}
            onClick={() => setTagFilter(item.value)}
          >
            {item.label}
          </Button>
        ))}
      </div>
      {error && (
        <div className="mb-4">
          <ErrorState message={error} />
        </div>
      )}

      <AppTable
        columns={[
          { key: 'title', label: 'Нэр', className: 'font-semibold text-[#2c3e50]' },
          { key: 'level', label: 'Түвшин' },
          {
            key: 'tag',
            label: 'Tag',
            render: (p) => (
              <span className="text-xs font-medium text-[#7f8c8d]">{p.tag || '—'}</span>
            ),
          },
          {
            key: 'equipment',
            label: 'Хэрэгсэл',
            render: (p) => p.equipment || 'None',
          },
          {
            key: 'durationMinutes',
            label: 'Минут',
            align: 'center',
            render: (p) => p.durationMinutes,
          },
          {
            key: 'exercises',
            label: 'Дасгал',
            align: 'center',
            render: (p) => p.exercises?.length || 0,
            sortable: false,
          },
          {
            key: 'videos',
            label: 'Видео',
            align: 'center',
            sortable: false,
            render: (p) => {
              const exerciseVideos = p.exercises?.filter((e) => e.videoUrl).length || 0;
              const programVideo = p.videoUrl ? 1 : 0;
              return exerciseVideos + programVideo;
            },
          },
          {
            key: 'isToday',
            label: 'Төлөв',
            render: (p) =>
              p.isToday ? <StatusBadge status="active" /> : <StatusBadge status="expired" />,
          },
          { key: 'sortOrder', label: 'Эрэмбэ', align: 'center' },
        ]}
        rows={programs}
        idKey="id"
        onEdit={(p) => {
          setEditing({
            ...p,
            exercises: p.exercises?.length
              ? p.exercises.map((ex) => {
                  const phases = normalizePhases(ex.phases);
                  const total = phaseSequenceTotalSeconds(phases);
                  return {
                    ...ex,
                    phases,
                    durationSeconds: total > 0 ? total : ex.durationSeconds,
                  };
                })
              : [emptyExercise()],
          });
          setShowForm(true);
        }}
        onDelete={(p) => handleDelete(p.id)}
      />

      <AppDrawer
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setEditing(null);
        }}
        title="Хөтөлбөр засах"
        size="xl"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setEditing(null);
              }}
            >
              Болих
            </Button>
            <Button type="submit" form="workout-form" disabled={saving}>
              {saving ? 'Хадгалж байна...' : 'Хадгалах'}
            </Button>
          </>
        }
      >
        <form id="workout-form" onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>ID</Label>
              <Input
                value={editing?.id || ''}
                onChange={(e) => editing && setEditing({ ...editing, id: e.target.value })}
                required
                disabled={programs.some((p) => p.id === editing?.id)}
              />
            </div>
            <div className="space-y-2">
              <Label>Түвшин</Label>
              <Select
                value={editing?.level || 'Beginner'}
                onValueChange={(value) =>
                  editing && setEditing({ ...editing, level: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Түвшин сонгох" />
                </SelectTrigger>
                <SelectContent>
                  {WORKOUT_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={editing?.level || ''}
                onChange={(e) => editing && setEditing({ ...editing, level: e.target.value })}
                placeholder="Эсвэл өөр түвшин бичих"
                className="text-sm"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Гарчиг</Label>
            <Input
              value={editing?.title || ''}
              onChange={(e) => editing && setEditing({ ...editing, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Тайлбар</Label>
            <Textarea
              value={editing?.description || ''}
              onChange={(e) => editing && setEditing({ ...editing, description: e.target.value })}
              required
              rows={2}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="space-y-2">
              <Label>Минут</Label>
              <Input
                type="number"
                value={editing?.durationMinutes || 0}
                onChange={(e) =>
                  editing && setEditing({ ...editing, durationMinutes: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Хэрэгсэл</Label>
              <Input
                value={editing?.equipment || ''}
                onChange={(e) =>
                  editing && setEditing({ ...editing, equipment: e.target.value })
                }
                placeholder="None, Mat/Towel, Belt/Towel..."
              />
            </div>
            <div className="space-y-2">
              <Label>Tag</Label>
              <Select
                value={
                  TAG_PRESETS.includes((editing?.tag || '') as (typeof TAG_PRESETS)[number])
                    ? editing?.tag || ''
                    : '__custom__'
                }
                onValueChange={(value) => {
                  if (!editing) return;
                  if (value === '__custom__') return;
                  setEditing({ ...editing, tag: value });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tag сонгох" />
                </SelectTrigger>
                <SelectContent>
                  {TAG_PRESETS.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                  <SelectItem value="__custom__">Бусад...</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={editing?.tag || ''}
                onChange={(e) => editing && setEditing({ ...editing, tag: e.target.value })}
                placeholder="PELVIC STRETCHING"
              />
              <p className="text-[11px] text-[#95a5a6]">
                Pelvic stretch түвшнүүд: tag = PELVIC STRETCHING
              </p>
            </div>
            <div className="space-y-2">
              <Label>Эрэмбэ</Label>
              <Input
                type="number"
                value={editing?.sortOrder || 0}
                onChange={(e) =>
                  editing && setEditing({ ...editing, sortOrder: Number(e.target.value) })
                }
              />
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border p-3">
            <Checkbox
              id="isToday"
              checked={editing?.isToday || false}
              onCheckedChange={(checked) =>
                editing && setEditing({ ...editing, isToday: checked === true })
              }
            />
            <Label htmlFor="isToday" className="font-normal">
              Өнөөдрийн дасгал
            </Label>
          </div>

          {editing && (
            <WorkoutProgramVideoEditor
              videoUrl={editing.videoUrl}
              thumbnailUrl={editing.thumbnailUrl}
              onChange={(patch) => setEditing({ ...editing, ...patch })}
              onUploadVideo={async (file) => {
                const result = await api.workouts.uploadVideoWithMeta(file);
                return { url: result.url, thumbnailUrl: result.thumbnailUrl };
              }}
              onUploadImage={async (file) => {
                const result = await api.workouts.uploadImage(file);
                return result.url;
              }}
            />
          )}

          {editing && (
            <WorkoutIntroSlidesEditor
              title="Program intro story (FB-style)"
              description="Pelvic stretching эхлэхээс өмнөх story slides. Видео эсвэл зураг upload хийж болно."
              slides={editing.introSlides || []}
              onChange={(introSlides) => setEditing({ ...editing, introSlides })}
              onUploadVideo={async (file) => {
                const result = await api.workouts.uploadVideoWithMeta(file);
                return { url: result.url, thumbnailUrl: result.thumbnailUrl };
              }}
              onUploadImage={async (file) => {
                const result = await api.workouts.uploadImage(file);
                return result.url;
              }}
            />
          )}

          {editing && (
            <>
              <WorkoutProgramCarouselPreview exercises={editing.exercises || []} />
              <WorkoutExercisesEditor
              exercises={editing.exercises || []}
              onChange={(exercises) => setEditing({ ...editing, exercises })}
              onUploadVideo={async (file) => {
                const result = await api.workouts.uploadVideoWithMeta(file);
                return { url: result.url, thumbnailUrl: result.thumbnailUrl };
              }}
              onUploadImage={async (file) => {
                const result = await api.workouts.uploadImage(file);
                return result.url;
              }}
            />
            </>
          )}
        </form>
      </AppDrawer>
    </div>
  );
}
