'use client';

import { WorkoutExercisePhase } from '@/lib/api';
import {
  carouselTabLabels,
  emptyPhase,
  normalizePhases,
  phaseSequenceTotalSeconds,
  PHASE_TYPE_LABELS,
  templateForMotion,
} from '@/lib/workout-phase-templates';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronDown, ChevronUp, Copy, Plus, Trash2 } from 'lucide-react';

const PHASE_TYPES = Object.entries(PHASE_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

type Props = {
  phases: WorkoutExercisePhase[];
  exerciseName: string;
  motion: string;
  onChange: (phases: WorkoutExercisePhase[]) => void;
};

export function WorkoutPhasesEditor({ phases, exerciseName, motion, onChange }: Props) {
  const normalized = normalizePhases(phases);
  const totalSec = phaseSequenceTotalSeconds(normalized);
  const carouselLabels = carouselTabLabels(normalized, exerciseName);

  function emit(next: WorkoutExercisePhase[]) {
    onChange(normalizePhases(next));
  }

  function update(index: number, patch: Partial<WorkoutExercisePhase>) {
    const next = normalized.map((p, i) => {
      if (i !== index) return p;
      const merged = { ...p, ...patch };
      if (patch.phaseType) {
        const isHold = patch.phaseType === 'hold' || patch.phaseType === 'contract';
        if (!isHold) {
          merged.holdSeconds = 0;
          merged.relaxSeconds = 0;
        } else if (!merged.holdSeconds) {
          merged.holdSeconds = 5;
          merged.relaxSeconds = 5;
        }
        if (patch.phaseType === 'warmup') {
          merged.showInCarousel = false;
          merged.vibrationEnabled = false;
        }
        if (patch.phaseType === 'relax' || patch.phaseType === 'breath') {
          merged.vibrationEnabled = false;
        }
      }
      return normalizePhase(merged, i);
    });
    emit(next);
  }

  function normalizePhase(p: WorkoutExercisePhase, sortOrder: number): WorkoutExercisePhase {
    return normalizePhases([p])[0] ?? emptyPhase(sortOrder);
  }

  function addPhase() {
    emit([...normalized, emptyPhase(normalized.length)]);
  }

  function duplicatePhase(index: number) {
    const copy = { ...normalized[index], label: `${normalized[index].label} (хуулбар)` };
    const next = [...normalized];
    next.splice(index + 1, 0, copy);
    emit(next);
  }

  function removePhase(index: number) {
    emit(normalized.filter((_, i) => i !== index));
  }

  function movePhase(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= normalized.length) return;
    const next = [...normalized];
    [next[index], next[target]] = [next[target], next[index]];
    emit(next);
  }

  function applyTemplate() {
    emit(templateForMotion(motion));
  }

  return (
    <div className="space-y-3 rounded-lg border border-[#e8ecef] bg-[#fafbfc] p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <Label className="text-sm font-semibold">Табууд / үе шатууд</Label>
          <p className="text-xs text-muted-foreground max-w-xl">
            Апп дээрх доод таб, хугацаа, чичиргээ эндээс тохируулна. Hold таб дотор hold/амрах
            давтана. Warmup нь дотоод — carousel-д харагдахгүй.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={applyTemplate}>
            Загвар ({motion})
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={addPhase}>
            <Plus className="size-4" />
            Таб нэмэх
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 rounded-md border border-[#eef1f4] bg-white px-3 py-2 text-xs text-[#5d6d7e]">
        <span>
          Нийт: <strong className="text-[#2c3e50]">{totalSec}с</strong>
        </span>
        <span>
          Таб: <strong className="text-[#2c3e50]">{normalized.length}</strong>
        </span>
        <span>
          Carousel:{' '}
          <strong className="text-[#1abc9c]">
            {carouselLabels.length ? carouselLabels.join(' → ') : '—'}
          </strong>
        </span>
      </div>

      {normalized.length === 0 ? (
        <p className="py-6 text-center text-xs text-[#95a5a6]">
          Таб байхгүй — &quot;Таб нэмэх&quot; эсвэл &quot;Загвар&quot; дарна уу
        </p>
      ) : (
        normalized.map((phase, index) => {
          const isHold = phase.phaseType === 'hold' || phase.phaseType === 'contract';
          const inCarousel = phase.showInCarousel !== false && phase.phaseType !== 'warmup';
          return (
            <div
              key={index}
              className="space-y-3 rounded-md border border-[#eef1f4] bg-white p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-full bg-[#e8f8f5] text-xs font-bold text-[#1abc9c]">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-[#2c3e50]">
                    {phase.label || PHASE_TYPE_LABELS[phase.phaseType] || 'Таб'}
                  </span>
                  {!inCarousel && (
                    <span className="rounded bg-[#f0f3f6] px-1.5 py-0.5 text-[10px] text-[#95a5a6]">
                      дотоод
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button type="button" variant="ghost" size="icon-sm" disabled={index === 0} onClick={() => movePhase(index, -1)}>
                    <ChevronUp className="size-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon-sm" disabled={index === normalized.length - 1} onClick={() => movePhase(index, 1)}>
                    <ChevronDown className="size-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon-sm" onClick={() => duplicatePhase(index)}>
                    <Copy className="size-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive" onClick={() => removePhase(index)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1">
                  <Label className="text-xs">Табын нэр (апп)</Label>
                  <Input
                    value={phase.label}
                    onChange={(e) => update(index, { label: e.target.value })}
                    placeholder="Чангалж барих"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Төрөл</Label>
                  <Select value={phase.phaseType} onValueChange={(v) => v && update(index, { phaseType: v })}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PHASE_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Tab хугацаа (сек)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={phase.durationSeconds}
                    onChange={(e) => update(index, { durationSeconds: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Carousel таб</Label>
                  <label className="flex h-9 items-center gap-2 rounded-md border border-input px-3">
                    <Checkbox
                      checked={phase.showInCarousel !== false}
                      onCheckedChange={(v) => update(index, { showInCarousel: v === true })}
                    />
                    <span className="text-xs">Апп таб-д харуулах</span>
                  </label>
                </div>
              </div>

              {isHold && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Дотор hold (сек)</Label>
                    <Input
                      type="number"
                      min={1}
                      value={phase.holdSeconds ?? 5}
                      onChange={(e) => update(index, { holdSeconds: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Дотор амрах (сек)</Label>
                    <Input
                      type="number"
                      min={1}
                      value={phase.relaxSeconds ?? 5}
                      onChange={(e) => update(index, { relaxSeconds: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Чичиргээ</Label>
                    <Select
                      value={phase.vibrationEnabled ? 'on' : 'off'}
                      onValueChange={(v) => update(index, { vibrationEnabled: v === 'on' })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="on">ON</SelectItem>
                        <SelectItem value="off">OFF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Чичиргээ хурд (ms)</Label>
                    <Input
                      type="number"
                      min={40}
                      max={500}
                      disabled={!phase.vibrationEnabled}
                      value={phase.vibrationIntervalMs}
                      onChange={(e) => update(index, { vibrationIntervalMs: Number(e.target.value) })}
                    />
                  </div>
                </div>
              )}

              {!isHold && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Чичиргээ</Label>
                    <Select
                      value={phase.vibrationEnabled ? 'on' : 'off'}
                      onValueChange={(v) => update(index, { vibrationEnabled: v === 'on' })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="on">ON</SelectItem>
                        <SelectItem value="off">OFF</SelectItem>
                      </SelectContent>
                    </Select>
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

export { emptyPhase } from '@/lib/workout-phase-templates';
