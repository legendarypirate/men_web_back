'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api, WorkoutProgram } from '@/lib/api';
import { AppDrawer } from '@/components/custom/app-drawer';
import { AppTable } from '@/components/custom/app-table';
import { useConfirm } from '@/components/custom/confirm-provider';
import { AddButton } from '@/components/custom/add-button';
import { WorkoutSectionsEditor } from '@/components/admin/workout-sections-editor';
import {
  emptySection,
  estimateProgramMinutes,
  exercisesFromSections,
  sectionsFromExercises,
  WorkoutSection,
} from '@/lib/workout-sections';
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

const TAG_OPTIONS = [
  'PELVIC STRETCHING',
  'GROIN FITNESS',
  'KEGEL',
  'ӨНӨӨДРИЙН ДАСГАЛ',
] as const;

const LEVEL_OPTIONS = ['Эхлэгч', 'Дунд', 'Ахисан түвшин', 'All Levels'] as const;

type ProgramDraft = WorkoutProgram & { sections: WorkoutSection[] };

function emptyProgram(tag = 'KEGEL'): ProgramDraft {
  return {
    id: '',
    title: '',
    description: '',
    level: 'Эхлэгч',
    durationMinutes: 5,
    equipment: 'None',
    tag,
    isToday: false,
    sortOrder: 0,
    videoUrl: null,
    thumbnailUrl: null,
    introSlides: [],
    exercises: [],
    sections: [emptySection()],
  };
}

function toDraft(program: WorkoutProgram): ProgramDraft {
  const sections = sectionsFromExercises(program.exercises || []);
  return {
    ...program,
    sections: sections.length > 0 ? sections : [emptySection()],
  };
}

export default function WorkoutsPage() {
  const confirm = useConfirm();
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [tagFilter, setTagFilter] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ProgramDraft | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

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
    if (editing.sections.length === 0) {
      setError('Дор хаяж нэг хэсэг нэмнэ үү.');
      return;
    }

    setSaving(true);
    try {
      const exercises = exercisesFromSections(editing.sections);
      const payload: WorkoutProgram = {
        id: editing.id,
        title: editing.title,
        description: editing.description,
        level: editing.level,
        durationMinutes: estimateProgramMinutes(editing.sections),
        equipment: 'None',
        tag: editing.tag,
        isToday: editing.isToday,
        sortOrder: editing.sortOrder,
        videoUrl: null,
        thumbnailUrl: null,
        introSlides: [],
        exercises,
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
                ...emptyProgram(tagFilter || 'KEGEL'),
                id: `program_${Date.now()}`,
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
            key: 'durationMinutes',
            label: 'Минут',
            align: 'center',
            render: (p) => p.durationMinutes,
          },
          {
            key: 'exercises',
            label: 'Хэсэг',
            align: 'center',
            render: (p) => p.exercises?.length || 0,
            sortable: false,
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
          setEditing(toDraft(p));
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
        title={editing?.id && programs.some((p) => p.id === editing.id) ? 'Хөтөлбөр засах' : 'Шинэ хөтөлбөр'}
        size="lg"
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
        {editing && (
          <form id="workout-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>ID</Label>
                <Input
                  value={editing.id}
                  onChange={(e) => setEditing({ ...editing, id: e.target.value })}
                  required
                  disabled={programs.some((p) => p.id === editing.id)}
                />
              </div>
              <div className="space-y-2">
                <Label>Түвшин</Label>
                <Select
                  value={editing.level}
                  onValueChange={(value) => value && setEditing({ ...editing, level: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVEL_OPTIONS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Гарчиг</Label>
              <Input
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Тайлбар</Label>
              <Textarea
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Tag</Label>
                <Select
                  value={editing.tag}
                  onValueChange={(value) => value && setEditing({ ...editing, tag: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TAG_OPTIONS.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Эрэмбэ</Label>
                <Input
                  type="number"
                  value={editing.sortOrder}
                  onChange={(e) =>
                    setEditing({ ...editing, sortOrder: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg border p-3">
              <Checkbox
                id="isToday"
                checked={editing.isToday}
                onCheckedChange={(checked) =>
                  setEditing({ ...editing, isToday: checked === true })
                }
              />
              <Label htmlFor="isToday" className="font-normal">
                Өнөөдрийн дасгал
              </Label>
            </div>

            <WorkoutSectionsEditor
              sections={editing.sections}
              onChange={(sections) =>
                setEditing({
                  ...editing,
                  sections,
                  durationMinutes: estimateProgramMinutes(sections),
                })
              }
            />

            <p className="text-xs text-muted-foreground">
              Тооцоолсон хугацаа: ~{estimateProgramMinutes(editing.sections)} мин ·{' '}
              {editing.sections.map((s) => s.label || 'Хэсэг').join(' → ')}
            </p>
          </form>
        )}
      </AppDrawer>
    </div>
  );
}
