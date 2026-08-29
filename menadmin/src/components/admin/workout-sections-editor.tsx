'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import {
  emptySectionDefinition,
  emptySectionTiming,
  normalizeSectionTiming,
  SECTION_TYPE_OPTIONS,
  TRAINING_LEVELS,
  WorkoutSectionDefinition,
  WorkoutSectionType,
} from '@/lib/workout-sections';
import { SectionTiming, WorkoutLevelPresets } from '@/lib/api';
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
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

function parseDigits(value: string): number | null {
  const digits = value.replace(/\D/g, '');
  if (digits === '') return null;
  return parseInt(digits, 10);
}

function NumericInput({
  value,
  onChange,
  min,
  max,
  disabled,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}) {
  return (
    <Input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      disabled={disabled}
      value={value === 0 ? '' : String(value)}
      onChange={(e) => {
        const parsed = parseDigits(e.target.value);
        if (parsed == null) {
          onChange(0);
          return;
        }
        onChange(parsed);
      }}
      onBlur={() => {
        if (min != null && (value === 0 || value < min)) {
          onChange(min);
        }
        if (max != null && value > max) {
          onChange(max);
        }
      }}
    />
  );
}

type Props = {
  sections: WorkoutSectionDefinition[];
  levelPresets: WorkoutLevelPresets;
  activeLevel: number;
  onActiveLevelChange: (level: number) => void;
  onChange: (sections: WorkoutSectionDefinition[], levelPresets: WorkoutLevelPresets) => void;
};

function supportsIntervals(type: WorkoutSectionType) {
  return type === 'kegelHold' || type === 'coreBrace';
}

function supportsVibration(type: WorkoutSectionType) {
  return type !== 'breath' && type !== 'relax';
}

export function WorkoutSectionsEditor({
  sections,
  levelPresets,
  activeLevel,
  onActiveLevelChange,
  onChange,
}: Props) {
  const [expanded, setExpanded] = useState<number | null>(0);
  const levelKey = String(activeLevel);
  const activeTimings = levelPresets[levelKey] ?? [];

  function emit(nextSections: WorkoutSectionDefinition[], nextPresets: WorkoutLevelPresets) {
    onChange(nextSections, nextPresets);
  }

  function updateSection(index: number, patch: Partial<WorkoutSectionDefinition>) {
    const nextSections = sections.map((section, i) =>
      i === index ? { ...section, ...patch } : section
    );
    emit(nextSections, levelPresets);
  }

  function updateTiming(index: number, patch: Partial<SectionTiming>) {
    const nextPresets = { ...levelPresets };
    const timings = [...(nextPresets[levelKey] ?? [])];
    timings[index] = normalizeSectionTiming({
      ...(timings[index] ?? emptySectionTiming()),
      ...patch,
    });
    nextPresets[levelKey] = timings;
    emit(sections, nextPresets);
  }

  function addSection() {
    const definition = emptySectionDefinition();
    const nextSections = [...sections, definition];
    const nextPresets = { ...levelPresets };
    for (const { level } of TRAINING_LEVELS) {
      const key = String(level);
      nextPresets[key] = [...(nextPresets[key] ?? []), emptySectionTiming(definition.type)];
    }
    emit(nextSections, nextPresets);
    setExpanded(nextSections.length - 1);
  }

  function removeSection(index: number) {
    const nextSections = sections.filter((_, i) => i !== index);
    const nextPresets = { ...levelPresets };
    for (const { level } of TRAINING_LEVELS) {
      const key = String(level);
      nextPresets[key] = (nextPresets[key] ?? []).filter((_, i) => i !== index);
    }
    emit(nextSections, nextPresets);
    setExpanded(null);
  }

  function moveSection(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    const nextSections = [...sections];
    [nextSections[index], nextSections[target]] = [nextSections[target], nextSections[index]];
    const nextPresets = { ...levelPresets };
    for (const { level } of TRAINING_LEVELS) {
      const key = String(level);
      const timings = [...(nextPresets[key] ?? [])];
      [timings[index], timings[target]] = [timings[target], timings[index]];
      nextPresets[key] = timings;
    }
    emit(nextSections, nextPresets);
    setExpanded(target);
  }

  function copyActiveLevelToAll() {
    const source = levelPresets[levelKey] ?? [];
    const nextPresets = { ...levelPresets };
    for (const { level } of TRAINING_LEVELS) {
      if (level === activeLevel) continue;
      nextPresets[String(level)] = source.map((timing) => ({ ...timing }));
    }
    emit(sections, nextPresets);
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-semibold">Түвшин бүрийн хугацаа</Label>
        <p className="mt-1 text-xs text-muted-foreground">
          Апп дээр хэрэглэгч сонгосон түвшин (1–6) — түүний дагуу хугацаа, амралт, чичиргээ
          автоматаар ачаална.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {TRAINING_LEVELS.map(({ level, label }) => (
            <Button
              key={level}
              type="button"
              size="sm"
              variant={activeLevel === level ? 'default' : 'outline'}
              className={cn(activeLevel === level && 'bg-[#FF453A] hover:bg-[#e63e35]')}
              onClick={() => onActiveLevelChange(level)}
            >
              {level}. {label}
            </Button>
          ))}
        </div>
        <div className="mt-2">
          <Button type="button" variant="ghost" size="sm" onClick={copyActiveLevelToAll}>
            Энэ түвшний тохиргоог бүх түвшинд хуулах
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          <Label className="text-sm font-semibold">Дасгалын хэсгүүд</Label>
          <p className="text-xs text-muted-foreground">
            Нэр, төрөл — бүх түвшинд ижил. Доорх тоо — зөвхөн {activeLevel}-р түвшин.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addSection}>
          <Plus className="size-4" />
          Хэсэг нэмэх
        </Button>
      </div>

      {sections.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Одоогоор хэсэг байхгүй.
        </div>
      ) : (
        sections.map((section, index) => {
          const timing = activeTimings[index] ?? emptySectionTiming(section.type);
          const open = expanded === index;

          return (
            <div key={section.id} className="overflow-hidden rounded-lg border bg-card shadow-sm">
              <div className="flex items-center gap-2 px-3 py-2">
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-2 rounded-md text-left hover:bg-muted/40"
                  onClick={() => setExpanded(open ? null : index)}
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded bg-primary/10 text-xs font-bold text-primary">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {section.label || 'Шинэ хэсэг'}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {timing.durationSeconds}с · {timing.sets} багц · амралт {timing.relaxSeconds}с
                    </p>
                  </div>
                  <ChevronDown
                    className={cn('size-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')}
                  />
                </button>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={index === 0}
                    onClick={() => moveSection(index, -1)}
                  >
                    <ChevronUp className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={index === sections.length - 1}
                    onClick={() => moveSection(index, 1)}
                  >
                    <ChevronDown className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeSection(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              {open && (
                <div className="space-y-3 border-t p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Төрөл</Label>
                      <Select
                        value={section.type}
                        onValueChange={(value) =>
                          value && updateSection(index, { type: value as WorkoutSectionType })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SECTION_TYPE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Нэр (апп дээрх таб)</Label>
                      <Input
                        value={section.label}
                        onChange={(e) => updateSection(index, { label: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label>Хугацаа (сек)</Label>
                      <NumericInput
                        min={5}
                        value={timing.durationSeconds}
                        onChange={(durationSeconds) =>
                          updateTiming(index, { durationSeconds })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Багц</Label>
                      <NumericInput
                        min={1}
                        value={timing.sets}
                        onChange={(sets) => updateTiming(index, { sets })}
                      />
                    </div>
                    {supportsVibration(section.type) && (
                      <div className="space-y-1.5">
                        <Label>Чичиргээ (ms)</Label>
                        <NumericInput
                          min={40}
                          max={500}
                          disabled={!timing.vibrationEnabled}
                          value={timing.vibrationIntervalMs}
                          onChange={(vibrationIntervalMs) =>
                            updateTiming(index, { vibrationIntervalMs })
                          }
                        />
                      </div>
                    )}
                  </div>

                  {supportsIntervals(section.type) && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label>Чангалах интервал (сек)</Label>
                        <NumericInput
                          min={1}
                          value={timing.holdSeconds}
                          onChange={(holdSeconds) => updateTiming(index, { holdSeconds })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Амрах интервал (сек)</Label>
                        <NumericInput
                          min={1}
                          value={timing.relaxSeconds}
                          onChange={(relaxSeconds) => updateTiming(index, { relaxSeconds })}
                        />
                      </div>
                    </div>
                  )}

                  {supportsVibration(section.type) && (
                    <div className="flex items-center gap-2 rounded-lg border px-3 py-2.5">
                      <Checkbox
                        id={`vibration-${section.id}-${activeLevel}`}
                        checked={timing.vibrationEnabled}
                        onCheckedChange={(checked) =>
                          updateTiming(index, { vibrationEnabled: checked === true })
                        }
                      />
                      <Label
                        htmlFor={`vibration-${section.id}-${activeLevel}`}
                        className="font-normal"
                      >
                        Чичиргээ асаах
                      </Label>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label>Заавар (бүх түвшинд ижил)</Label>
                    <Textarea
                      value={section.instruction}
                      onChange={(e) => updateSection(index, { instruction: e.target.value })}
                      rows={2}
                    />
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
