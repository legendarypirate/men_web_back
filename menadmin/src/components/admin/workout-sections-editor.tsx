'use client';

import { useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2, Upload } from 'lucide-react';
import {
  defaultEnabledForLevel,
  defaultHoldIntervalLabel,
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
  onUploadImage: (file: File) => Promise<string>;
  showDifficultyLevels?: boolean;
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
  onUploadImage,
  showDifficultyLevels = true,
}: Props) {
  const [expanded, setExpanded] = useState<number | null>(0);
  const levelKey = String(activeLevel);
  const activeTimings = levelPresets[levelKey] ?? [];

  function emit(nextSections: WorkoutSectionDefinition[], nextPresets: WorkoutLevelPresets) {
    onChange(nextSections, nextPresets);
  }

  function updateSection(index: number, patch: Partial<WorkoutSectionDefinition>) {
    const nextSections = sections.map((section, i) => {
      if (i !== index) return section;
      const next = { ...section, ...patch };
      if (patch.type && patch.type !== section.type) {
        const oldPreset = SECTION_TYPE_OPTIONS.find((o) => o.value === section.type);
        const newPreset = SECTION_TYPE_OPTIONS.find((o) => o.value === patch.type);
        if (newPreset && (!section.label || section.label === oldPreset?.label)) {
          next.label = newPreset.label;
        }
      }
      return next;
    });
    if (patch.type) {
      const nextPresets = { ...levelPresets };
      for (const { level } of TRAINING_LEVELS) {
        const key = String(level);
        const timings = [...(nextPresets[key] ?? [])];
        if (timings[index]) {
          timings[index] = normalizeSectionTiming(
            {
              ...timings[index],
              holdIntervalLabel: defaultHoldIntervalLabel(patch.type as WorkoutSectionType),
            },
            patch.type as WorkoutSectionType
          );
        }
        nextPresets[key] = timings;
      }
      emit(nextSections, nextPresets);
      return;
    }
    emit(nextSections, levelPresets);
  }

  function updateTiming(index: number, patch: Partial<SectionTiming>) {
    const nextPresets = { ...levelPresets };
    const levels = showDifficultyLevels
      ? [activeLevel]
      : TRAINING_LEVELS.map(({ level }) => level);
    for (const level of levels) {
      const key = String(level);
      const timings = [...(nextPresets[key] ?? [])];
      timings[index] = normalizeSectionTiming(
        {
          ...(timings[index] ?? emptySectionTiming(sections[index]?.type)),
          ...patch,
        },
        sections[index]?.type
      );
      nextPresets[key] = timings;
    }
    emit(sections, nextPresets);
  }

  function toggleSectionEnabled(index: number, enabled: boolean) {
    updateTiming(index, { enabled });
  }

  function addSection() {
    const definition = emptySectionDefinition();
    const nextSections = [...sections, definition];
    const nextPresets = { ...levelPresets };
    for (const { level } of TRAINING_LEVELS) {
      const key = String(level);
      nextPresets[key] = [
        ...(nextPresets[key] ?? []),
        normalizeSectionTiming({
          ...emptySectionTiming(definition.type),
          enabled: showDifficultyLevels ? defaultEnabledForLevel(level) : true,
        }),
      ];
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
      {showDifficultyLevels && (
      <div>
        <Label className="text-sm font-semibold">Түвшин бүрийн тохиргоо</Label>
        <p className="mt-1 text-xs text-muted-foreground">
          Түвшин бүрт ямар хэсэг орж, хугацаа хэд байхыг тохируулна. Хялбар түвшинд зарим хэсгийг
          унтрааж болно.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {TRAINING_LEVELS.map(({ level, label }) => {
            const enabledCount = (levelPresets[String(level)] ?? []).filter(
              (timing) => timing.enabled
            ).length;
            return (
              <Button
                key={level}
                type="button"
                size="sm"
                variant={activeLevel === level ? 'default' : 'outline'}
                className={cn(activeLevel === level && 'bg-[#FF453A] hover:bg-[#e63e35]')}
                onClick={() => onActiveLevelChange(level)}
              >
                {level}. {label}
                <span className="ml-1 opacity-75">({enabledCount})</span>
              </Button>
            );
          })}
        </div>
        <div className="mt-2">
          <Button type="button" variant="ghost" size="sm" onClick={copyActiveLevelToAll}>
            Энэ түвшний тохиргоог бүх түвшинд хуулах
          </Button>
        </div>
      </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <div>
          <Label className="text-sm font-semibold">Дасгалын хэсгүүд</Label>
          <p className="text-xs text-muted-foreground">
            {showDifficultyLevels
              ? `Нэр, төрөл — бүх түвшинд ижил. Доор — зөвхөн ${activeLevel}-р түвшин.`
              : 'Хэсэг бүрийн нэр, төрөл, хугацааг тохируулна.'}
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
          const enabled = timing.enabled !== false;

          return (
            <div
              key={section.id}
              className={cn(
                'overflow-hidden rounded-lg border bg-card shadow-sm',
                !enabled && 'opacity-60'
              )}
            >
              <div className="flex items-center gap-2 px-3 py-2">
                <Checkbox
                  checked={enabled}
                  onCheckedChange={(checked) =>
                    toggleSectionEnabled(index, checked === true)
                  }
                  aria-label={`${section.label} идэвхжүүлэх`}
                />
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
                      {enabled
                        ? `${timing.durationSeconds}с · ${timing.sets} багц · амралт ${timing.relaxSeconds}с`
                        : showDifficultyLevels
                          ? 'Энэ түвшинд идэвхгүй'
                          : 'Идэвхгүй'}
                      {(section.avatarImages?.length || 0) > 0
                        ? ` · ${section.avatarImages!.length} зураг`
                        : ''}
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
                  {showDifficultyLevels && (
                  <div className="flex items-center gap-2 rounded-lg border px-3 py-2.5">
                    <Checkbox
                      id={`enabled-${section.id}-${activeLevel}`}
                      checked={enabled}
                      onCheckedChange={(checked) =>
                        toggleSectionEnabled(index, checked === true)
                      }
                    />
                    <Label htmlFor={`enabled-${section.id}-${activeLevel}`} className="font-normal">
                      Энэ түвшинд оруулах
                    </Label>
                  </div>
                  )}

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

                  <div className={cn('space-y-3', !enabled && 'pointer-events-none opacity-50')}>
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
                    <>
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
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label>Барих/чангалах нэр (тimer дээр)</Label>
                        <Input
                          value={timing.holdIntervalLabel}
                          onChange={(e) =>
                            updateTiming(index, { holdIntervalLabel: e.target.value })
                          }
                          placeholder="Барих"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Амрах нэр (timer дээр)</Label>
                        <Input
                          value={timing.relaxIntervalLabel}
                          onChange={(e) =>
                            updateTiming(index, { relaxIntervalLabel: e.target.value })
                          }
                          placeholder="Амрах"
                        />
                      </div>
                    </div>
                    </>
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

                  </div>

                  <div className="space-y-1.5">
                    <Label>Заавар</Label>
                    <Textarea
                      value={section.instruction}
                      onChange={(e) => updateSection(index, { instruction: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <AvatarImagesField
                    images={section.avatarImages || []}
                    onChange={(avatarImages) => updateSection(index, { avatarImages })}
                    onUpload={onUploadImage}
                  />
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

function AvatarImagesField({
  images,
  onChange,
  onUpload,
}: {
  images: string[];
  onChange: (images: string[]) => void;
  onUpload: (file: File) => Promise<string>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        uploaded.push(await onUpload(file));
      }
      if (uploaded.length) onChange([...images, ...uploaded]);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-3 rounded-lg border bg-[#fafbfc] p-3">
      <div>
        <Label className="text-sm font-semibold">Аватарын зургууд</Label>
        <p className="mt-1 text-xs text-muted-foreground">
          Олон зураг оруулна. Таймер явж байхад апп дээр эдгээр зураг дарааллаар солигдоно.
        </p>
      </div>
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {images.map((url, index) => (
            <div key={`${url}-${index}`} className="overflow-hidden rounded-lg border bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-24 w-full object-cover" />
              <div className="flex items-center justify-between gap-1 border-t px-1 py-1">
                <span className="px-1 text-[11px] font-semibold text-muted-foreground">
                  {index + 1}
                </span>
                <div className="flex">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  >
                    <ChevronUp className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={index === images.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    <ChevronDown className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => onChange(images.filter((_, i) => i !== index))}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="rounded-lg border border-dashed p-4 text-center">
        <p className="mb-3 text-sm text-muted-foreground">
          {images.length === 0 ? 'Зураг байхгүй' : `${images.length} зураг`}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? 'Байршуулж байна...' : 'Зураг нэмэх'}
        </Button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
      />
    </div>
  );
}
