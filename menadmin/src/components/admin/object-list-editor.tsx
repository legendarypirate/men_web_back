'use client';

import { Plus, Trash2 } from 'lucide-react';
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
import { FieldOption, ObjectListFieldDef } from '@/lib/types/fields';

type Props = {
  label?: string;
  hint?: string;
  addLabel?: string;
  items: Record<string, unknown>[];
  itemFields: ObjectListFieldDef[];
  allValues: Record<string, unknown>;
  onChange: (items: Record<string, unknown>[]) => void;
};

function emptyItem(itemFields: ObjectListFieldDef[]) {
  const item: Record<string, unknown> = {};
  for (const field of itemFields) {
    item[field.key] = field.type === 'number' ? '' : '';
  }
  return item;
}

function resolveOptions(
  field: ObjectListFieldDef,
  allValues: Record<string, unknown>
): FieldOption[] {
  if (field.options?.length) return field.options;
  if (!field.optionsFromField) return [];

  const source = allValues[field.optionsFromField];
  if (!Array.isArray(source)) return [];

  const valueKey = field.optionsFromFieldValueKey || 'id';
  const labelKey = field.optionsFromFieldLabelKey || 'name';

  return source
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null;
      const row = entry as Record<string, unknown>;
      const value = String(row[valueKey] ?? '').trim();
      const label = String(row[labelKey] ?? value).trim();
      if (!value) return null;
      return { value, label };
    })
    .filter((option): option is FieldOption => option != null);
}

export function ObjectListEditor({
  label,
  hint,
  addLabel = 'Нэмэх',
  items,
  itemFields,
  allValues,
  onChange,
}: Props) {
  function updateItem(index: number, key: string, value: unknown) {
    onChange(
      items.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    );
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function addItem() {
    onChange([...items, emptyItem(itemFields)]);
  }

  return (
    <div className="space-y-3">
      {label && <Label>{label}</Label>}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
          Одоогоор хоосон байна
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="rounded-lg border bg-muted/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  #{index + 1}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => removeItem(index)}
                  aria-label="Устгах"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {itemFields.map((field) => {
                  const fieldId = `${label}-${index}-${field.key}`;
                  const value = item[field.key];

                  if (field.type === 'textarea') {
                    return (
                      <div key={field.key} className="space-y-1.5 sm:col-span-2">
                        <Label htmlFor={fieldId}>{field.label}</Label>
                        <Textarea
                          id={fieldId}
                          rows={2}
                          placeholder={field.placeholder}
                          value={String(value ?? '')}
                          onChange={(e) => updateItem(index, field.key, e.target.value)}
                        />
                      </div>
                    );
                  }

                  if (field.type === 'select') {
                    const options = resolveOptions(field, allValues);
                    return (
                      <div key={field.key} className="space-y-1.5">
                        <Label htmlFor={fieldId}>{field.label}</Label>
                        <Select
                          value={String(value ?? '')}
                          onValueChange={(next) => updateItem(index, field.key, next)}
                        >
                          <SelectTrigger id={fieldId} className="w-full">
                            <SelectValue placeholder={field.placeholder || 'Сонгох'} />
                          </SelectTrigger>
                          <SelectContent>
                            {options.length === 0 ? (
                              <SelectItem value="__none__" disabled>
                                Сонголт байхгүй
                              </SelectItem>
                            ) : (
                              options.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  }

                  return (
                    <div key={field.key} className="space-y-1.5">
                      <Label htmlFor={fieldId}>{field.label}</Label>
                      <Input
                        id={fieldId}
                        type={field.type === 'number' ? 'number' : 'text'}
                        placeholder={field.placeholder}
                        value={String(value ?? '')}
                        onChange={(e) =>
                          updateItem(
                            index,
                            field.key,
                            field.type === 'number' ? e.target.value : e.target.value
                          )
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <Button type="button" variant="outline" size="sm" onClick={addItem}>
        <Plus className="mr-2 h-4 w-4" />
        {addLabel}
      </Button>
    </div>
  );
}

export function normalizeObjectListItems(
  items: unknown,
  itemFields: ObjectListFieldDef[]
): Record<string, unknown>[] {
  if (!Array.isArray(items)) return [];

  return items
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null;
      const source = entry as Record<string, unknown>;
      const normalized: Record<string, unknown> = {};

      for (const field of itemFields) {
        const raw = source[field.key];
        if (field.type === 'number') {
          const num = Number(raw ?? 0);
          normalized[field.key] = Number.isFinite(num) ? num : 0;
        } else {
          normalized[field.key] = raw == null ? '' : String(raw);
        }
      }

      const hasContent = itemFields.some((field) => {
        const value = normalized[field.key];
        return value !== '' && value !== 0;
      });

      return hasContent ? normalized : null;
    })
    .filter((item): item is Record<string, unknown> => item != null);
}
