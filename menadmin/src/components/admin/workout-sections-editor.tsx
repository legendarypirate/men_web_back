'use client';

import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import {
  emptySection,
  SECTION_TYPE_OPTIONS,
  WorkoutSection,
  WorkoutSectionType,
} from '@/lib/workout-sections';
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

type Props = {
  sections: WorkoutSection[];
  onChange: (sections: WorkoutSection[]) => void;
};

function supportsIntervals(type: WorkoutSectionType) {
  return type === 'kegelHold' || type === 'coreBrace';
}

function supportsVibration(type: WorkoutSectionType) {
  return type !== 'breath' && type !== 'relax';
}

export function WorkoutSectionsEditor({ sections, onChange }: Props) {
  function update(index: number, patch: Partial<WorkoutSection>) {
    onChange(
      sections.map((section, i) => {
        if (i !== index) return section;
        const next = { ...section, ...patch };
        if (patch.type && patch.type !== section.type) {
          const oldPreset = SECTION_TYPE_OPTIONS.find((o) => o.value === section.type);
          const newPreset = SECTION_TYPE_OPTIONS.find((o) => o.value === patch.type);
          if (newPreset && (!section.label || section.label === oldPreset?.label)) {
            next.label = newPreset.label;
          }
          if (patch.type === 'breath' || patch.type === 'relax') {
            next.vibrationEnabled = false;
          }
          if (patch.type === 'kegelHold' || patch.type === 'coreBrace') {
            next.vibrationEnabled = true;
          }
        }
        return next;
      })
    );
  }

  function addSection() {
    onChange([...sections, emptySection()]);
  }

  function removeSection(index: number) {
    onChange(sections.filter((_, i) => i !== index));
  }

  function moveSection(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Label className="text-sm font-semibold">Дасгалын хэсгүүд</Label>
          <p className="text-xs text-muted-foreground">
            Апп дээрх таб бүр — жишээ нь Кегелийн барилт, Амрах гэх мэт.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addSection}>
          <Plus className="size-4" />
          Хэсэг нэмэх
        </Button>
      </div>

      {sections.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Одоогоор хэсэг байхгүй. &quot;Хэсэг нэмэх&quot; дарна уу.
        </div>
      ) : (
        sections.map((section, index) => (
          <div
            key={section.id}
            className="rounded-lg border bg-card shadow-sm"
          >
            <div className="flex items-center gap-2 border-b px-3 py-2">
              <span className="flex size-6 shrink-0 items-center justify-center rounded bg-primary/10 text-xs font-bold text-primary">
                {index + 1}
              </span>
              <p className="min-w-0 flex-1 truncate text-sm font-semibold">
                {section.label || 'Шинэ хэсэг'}
              </p>
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

            <div className="space-y-3 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Төрөл</Label>
                  <Select
                    value={section.type}
                    onValueChange={(value) =>
                      value && update(index, { type: value as WorkoutSectionType })
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
                    onChange={(e) => update(index, { label: e.target.value })}
                    placeholder="Кегелийн барилт"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label>Хугацаа (сек)</Label>
                  <Input
                    type="number"
                    min={5}
                    value={section.durationSeconds}
                    onChange={(e) =>
                      update(index, { durationSeconds: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Багц</Label>
                  <Input
                    type="number"
                    min={1}
                    value={section.sets}
                    onChange={(e) => update(index, { sets: Number(e.target.value) })}
                  />
                </div>
                {supportsVibration(section.type) && (
                  <div className="space-y-1.5">
                    <Label>Чичиргээний интервал (ms)</Label>
                    <Input
                      type="number"
                      min={40}
                      max={500}
                      value={section.vibrationIntervalMs}
                      onChange={(e) =>
                        update(index, {
                          vibrationIntervalMs: Number(e.target.value),
                        })
                      }
                      disabled={!section.vibrationEnabled}
                    />
                  </div>
                )}
              </div>

              {supportsIntervals(section.type) && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Чангалах интервал (сек)</Label>
                    <Input
                      type="number"
                      min={1}
                      value={section.holdSeconds}
                      onChange={(e) =>
                        update(index, { holdSeconds: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Амрах интервал (сек)</Label>
                    <Input
                      type="number"
                      min={1}
                      value={section.relaxSeconds}
                      onChange={(e) =>
                        update(index, { relaxSeconds: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>
              )}

              {supportsVibration(section.type) && (
                <div className="flex items-center gap-2 rounded-lg border px-3 py-2.5">
                  <Checkbox
                    id={`vibration-${section.id}`}
                    checked={section.vibrationEnabled}
                    onCheckedChange={(checked) =>
                      update(index, { vibrationEnabled: checked === true })
                    }
                  />
                  <Label htmlFor={`vibration-${section.id}`} className="font-normal">
                    Чичиргээ асаах
                  </Label>
                </div>
              )}

              <div className="space-y-1.5">
                <Label>Заавар (заавал биш)</Label>
                <Textarea
                  value={section.instruction}
                  onChange={(e) => update(index, { instruction: e.target.value })}
                  rows={2}
                  placeholder="Хэрэглэгчид харуулах богино заавар"
                />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
