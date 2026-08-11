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
import { ErrorState, LoadingState, PageHeader, StatusBadge } from '@/components/page-ui';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function WorkoutsPage() {
  const confirm = useConfirm();
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<WorkoutProgram | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const empty: WorkoutProgram = {
    id: '',
    title: '',
    description: '',
    level: 'Эхлэгч',
    durationMinutes: 10,
    tag: 'ШИНЭ',
    isToday: false,
    sortOrder: 0,
    exercises: [],
  };

  async function load() {
    setLoading(true);
    try {
      const res = await api.workouts.list();
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
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const payload = {
        ...editing,
        exercises: (editing.exercises || []).map((ex, i) => ({
          ...ex,
          sortOrder: i,
          videoUrl: ex.videoUrl || null,
          thumbnailUrl: ex.thumbnailUrl || null,
        })),
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
        subtitle={`${programs.length} хөтөлбөр`}
        action={
          <AddButton
            label="Хөтөлбөр нэмэх"
            onClick={() => {
              setEditing({
                ...empty,
                id: `program_${Date.now()}`,
                exercises: [emptyExercise()],
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
          { key: 'level', label: 'Түвшин' },
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
            render: (p) =>
              p.exercises?.filter((e) => e.videoUrl).length || 0,
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
            exercises: p.exercises?.length ? [...p.exercises] : [emptyExercise()],
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
              <Input
                value={editing?.level || ''}
                onChange={(e) => editing && setEditing({ ...editing, level: e.target.value })}
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
          <div className="grid gap-4 sm:grid-cols-3">
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
              <Label>Tag</Label>
              <Input
                value={editing?.tag || ''}
                onChange={(e) => editing && setEditing({ ...editing, tag: e.target.value })}
              />
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
          )}
        </form>
      </AppDrawer>
    </div>
  );
}
