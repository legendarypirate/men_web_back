'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api, WorkoutLevelPresets, WorkoutProgram } from '@/lib/api';
import { AppDrawer } from '@/components/custom/app-drawer';
import { AppTable } from '@/components/custom/app-table';
import { useConfirm } from '@/components/custom/confirm-provider';
import { AddButton } from '@/components/custom/add-button';
import { WorkoutSectionsEditor } from '@/components/admin/workout-sections-editor';
import {
  DEFAULT_TRAINING_LEVEL,
  activeSectionLabels,
  emptySectionDefinition,
  estimateProgramMinutes,
  loadProgramSections,
  syncLevelPresets,
  templateExercisesFromSections,
  TRAINING_LEVELS,
  validateLevelPresets,
  WorkoutSectionDefinition,
} from '@/lib/workout-sections';
import { KIND_DEFAULT_TAG, WorkoutKind } from '@/lib/workout-kinds';
import { ErrorState, LoadingState, PageHeader, StatusBadge } from '@/components/page-ui';
import { ImageUploadField } from '@/components/admin/image-upload-field';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const DEFAULT_PROGRAM_LEVEL = '—';

type ProgramDraft = WorkoutProgram & {
  sections: WorkoutSectionDefinition[];
  levelPresets: WorkoutLevelPresets;
};

type Props = {
  kind: WorkoutKind;
  title: string;
  subtitle: string;
  addLabel: string;
};

function emptyProgram(kind: WorkoutKind): ProgramDraft {
  const sections = [emptySectionDefinition()];
  return {
    id: '',
    title: '',
    description: '',
    level: DEFAULT_PROGRAM_LEVEL,
    durationMinutes: 5,
    equipment: 'None',
    tag: KIND_DEFAULT_TAG[kind],
    kind,
    isToday: kind === 'kegel',
    isLocked: false,
    challengeLevel: kind === 'kegel_challenge' ? 2 : null,
    challengeDays: kind === 'kegel_challenge' ? 14 : null,
    sortOrder: 0,
    videoUrl: null,
    thumbnailUrl: null,
    introSlides: [],
    levelPresets: syncLevelPresets(sections, {}),
    exercises: [],
    sections,
  };
}

function toDraft(program: WorkoutProgram, kind: WorkoutKind): ProgramDraft {
  const { sections, levelPresets } = loadProgramSections(program);
  return {
    ...program,
    kind,
    tag: program.tag || KIND_DEFAULT_TAG[kind],
    isLocked: Boolean(program.isLocked),
    challengeLevel: program.challengeLevel ?? (kind === 'kegel_challenge' ? 2 : null),
    challengeDays: program.challengeDays ?? (kind === 'kegel_challenge' ? 14 : null),
    sections,
    levelPresets,
  };
}

export function WorkoutProgramsManager({ kind, title, subtitle, addLabel }: Props) {
  const confirm = useConfirm();
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ProgramDraft | null>(null);
  const [activeLevel, setActiveLevel] = useState(DEFAULT_TRAINING_LEVEL);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const isChallenge = kind === 'kegel_challenge';
  const isKegel = kind === 'kegel';
  const isHomeWorkout = kind === 'pelvic_stretching' || kind === 'groin_fitness';

  async function load() {
    setLoading(true);
    try {
      const res = await api.workouts.list({ kind });
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
  }, [kind]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const syncedPresets = syncLevelPresets(editing.sections, editing.levelPresets);
    const validationError = validateLevelPresets(editing.sections, syncedPresets);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    try {
      const exercises = templateExercisesFromSections(editing.sections, syncedPresets);
      const payload: WorkoutProgram = {
        id: editing.id,
        title: editing.title,
        description: editing.description,
        level: isChallenge
          ? String(editing.challengeLevel || 1)
          : editing.level?.trim() || DEFAULT_PROGRAM_LEVEL,
        durationMinutes: estimateProgramMinutes(
          editing.sections,
          syncedPresets,
          DEFAULT_TRAINING_LEVEL
        ),
        equipment: 'None',
        tag: isKegel ? editing.tag || KIND_DEFAULT_TAG.kegel : KIND_DEFAULT_TAG[kind],
        kind,
        isToday: isChallenge
          ? Number(editing.challengeLevel) === 1
          : kind === 'pelvic_stretching' || kind === 'groin_fitness'
            ? Boolean(editing.isToday)
            : isKegel
              ? Boolean(editing.isToday)
              : false,
        isLocked: false,
        challengeLevel: isChallenge ? Number(editing.challengeLevel || 1) : null,
        challengeDays: isChallenge ? Number(editing.challengeDays || 14) : null,
        sortOrder: editing.sortOrder,
        videoUrl: editing.videoUrl ?? null,
        thumbnailUrl: editing.thumbnailUrl ?? null,
        introSlides: editing.introSlides ?? [],
        levelPresets: syncedPresets,
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
      title: isChallenge ? 'Сорилт устгах уу?' : 'Хөтөлбөр устгах уу?',
      description: 'Энэ үйлдлийг буцаах боломжгүй.',
      confirmLabel: 'Устгах',
      destructive: true,
    });
    if (!ok) return;
    await api.workouts.remove(id);
    load();
  }

  if (loading) return <LoadingState />;

  const activeLevelLabel =
    TRAINING_LEVELS.find((item) => item.level === activeLevel)?.label ?? '';

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={`${programs.length} ${isChallenge ? 'сорилт' : 'хөтөлбөр'} · ${subtitle}`}
        action={
          <AddButton
            label={addLabel}
            onClick={() => {
              setActiveLevel(DEFAULT_TRAINING_LEVEL);
              setEditing({
                ...emptyProgram(kind),
                id: `${kind}_${Date.now()}`,
                sortOrder: programs.length,
              });
              setShowForm(true);
            }}
          />
        }
      />

      {error && (
        <div className="mb-4">
          <ErrorState message={error} />
        </div>
      )}

      <AppTable
        columns={[
          { key: 'title', label: 'Нэр', className: 'font-semibold text-[#2c3e50]' },
          {
            key: 'thumbnailUrl',
            label: 'Cover',
            sortable: false,
            render: (p) =>
              p.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.thumbnailUrl}
                  alt=""
                  className="h-10 w-16 rounded object-cover"
                />
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              ),
          },
          ...(isKegel
            ? [
                {
                  key: 'tag' as const,
                  label: 'Шошго',
                  render: (p: WorkoutProgram) => (
                    <span className="text-xs font-medium text-[#7f8c8d]">{p.tag || '—'}</span>
                  ),
                },
              ]
            : []),
          ...(isChallenge
            ? [
                {
                  key: 'challengeLevel' as const,
                  label: 'Түвшин',
                  align: 'center' as const,
                  render: (p: WorkoutProgram) => `LEVEL ${p.challengeLevel || p.level || '—'}`,
                },
                {
                  key: 'challengeDays' as const,
                  label: 'Хоног',
                  align: 'center' as const,
                  render: (p: WorkoutProgram) => p.challengeDays || '—',
                },
                {
                  key: 'isLocked' as const,
                  label: 'Нээлт',
                  render: (p: WorkoutProgram) =>
                    Number(p.challengeLevel) === 1 ? (
                      <span className="text-xs font-semibold text-[#1a8f7a]">
                        Өнөөдрийн дасгал
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Өмнөх түвшин · 7 хоног
                      </span>
                    ),
                },
              ]
            : [
                {
                  key: 'durationMinutes' as const,
                  label: 'Минут',
                  align: 'center' as const,
                  render: (p: WorkoutProgram) => p.durationMinutes,
                },
              ]),
          {
            key: 'exercises',
            label: 'Хэсэг',
            align: 'center',
            render: (p) => p.exercises?.length || 0,
            sortable: false,
          },
          ...(isKegel
            ? [
                {
                  key: 'isToday' as const,
                  label: 'Өнөөдөр',
                  render: (p: WorkoutProgram) =>
                    p.isToday ? <StatusBadge status="active" /> : <StatusBadge status="expired" />,
                },
              ]
            : []),
          ...(isHomeWorkout
            ? [
                {
                  key: 'isToday' as const,
                  label: 'Нүүр',
                  render: (p: WorkoutProgram) =>
                    p.isToday ? <StatusBadge status="active" /> : <StatusBadge status="expired" />,
                },
              ]
            : []),
          { key: 'sortOrder', label: 'Эрэмбэ', align: 'center' },
        ]}
        rows={programs}
        idKey="id"
        onEdit={(p) => {
          setActiveLevel(DEFAULT_TRAINING_LEVEL);
          setEditing(toDraft(p, kind));
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
        title={
          editing?.id && programs.some((p) => p.id === editing.id)
            ? isChallenge
              ? 'Сорилт засах'
              : 'Хөтөлбөр засах'
            : isChallenge
              ? 'Шинэ сорилт'
              : 'Шинэ хөтөлбөр'
        }
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

            <ImageUploadField
              label="Cover зураг"
              value={editing.thumbnailUrl}
              onChange={(url) => setEditing({ ...editing, thumbnailUrl: url })}
              onUpload={async (file) => {
                const result = await api.upload.image(file);
                return result.url;
              }}
            />

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

            {isHomeWorkout && (
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <Checkbox
                  id="showOnHome"
                  checked={editing.isToday}
                  onCheckedChange={(checked) =>
                    setEditing({ ...editing, isToday: checked === true })
                  }
                />
                <Label htmlFor="showOnHome" className="font-normal">
                  Нүүр дэлгэцийн карт. Гарчиг, тайлбар, cover, хугацаа, дасгалууд эндээс
                  удирдагдана. Өөр хөтөлбөрийг сонговол энэ нь автоматаар болино.
                </Label>
              </div>
            )}

            {isKegel && (
              <>
                <div className="space-y-2">
                  <Label>Шошго (карт дээр)</Label>
                  <Input
                    value={editing.tag}
                    onChange={(e) => setEditing({ ...editing, tag: e.target.value })}
                    placeholder="ӨНӨӨДРИЙН ДАСГАЛ"
                  />
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
                    Кегел дэлгэцийн өнөөдрийн дасгал. Өөр хөтөлбөрийг сонговол энэ нь автоматаар болино.
                  </Label>
                </div>
              </>
            )}

            {isChallenge && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Түвшин</Label>
                  <Input
                    type="number"
                    min={1}
                    value={editing.challengeLevel ?? 1}
                    onChange={(e) => {
                      const challengeLevel = Number(e.target.value);
                      setEditing({
                        ...editing,
                        challengeLevel,
                        isToday: challengeLevel === 1,
                      });
                    }}
                  />
                  {Number(editing.challengeLevel) === 1 && (
                    <p className="text-xs text-muted-foreground">
                      Түвшин 1 нь кегел дэлгэцийн өнөөдрийн дасгал болно.
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Картын хоног</Label>
                  <Input
                    type="number"
                    min={1}
                    value={editing.challengeDays ?? 14}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        challengeDays: Number(e.target.value),
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Зөвхөн карт дээр харагдана. Дараагийн түвшин өмнөх түвшинг 7 хоног
                    хийсний дараа автоматаар нээгдэнэ.
                  </p>
                </div>
              </div>
            )}

            <WorkoutSectionsEditor
              sections={editing.sections}
              levelPresets={editing.levelPresets}
              activeLevel={activeLevel}
              onActiveLevelChange={setActiveLevel}
              onUploadImage={async (file) => {
                const result = await api.upload.image(file);
                return result.url;
              }}
              onUploadVideo={async (file) => {
                const result = await api.upload.video(file);
                return { url: result.url, thumbnailUrl: result.thumbnailUrl };
              }}
              onChange={(sections, levelPresets) =>
                setEditing({
                  ...editing,
                  sections,
                  levelPresets,
                  durationMinutes: estimateProgramMinutes(
                    sections,
                    levelPresets,
                    DEFAULT_TRAINING_LEVEL
                  ),
                })
              }
            />

            <p className="text-xs text-muted-foreground">
              Түвшин {activeLevel} ({activeLevelLabel}): ~{' '}
              {estimateProgramMinutes(editing.sections, editing.levelPresets, activeLevel)} мин ·{' '}
              {activeSectionLabels(editing.sections, editing.levelPresets, activeLevel).join(
                ' → '
              ) || 'Идэвхтэй хэсэг байхгүй'}
            </p>
          </form>
        )}
      </AppDrawer>
    </div>
  );
}
