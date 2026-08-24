'use client';

import { FieldDef } from '@/lib/types/fields';
import { StringListEditor } from '@/components/admin/string-list-editor';
import { ImageUploadField } from '@/components/admin/image-upload-field';
import { DatePicker } from '@/components/custom/date-picker';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
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
import { api } from '@/lib/api';

type Props = {
  fields: FieldDef[];
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  mode: 'create' | 'edit';
};

export function DynamicForm({ fields, values, onChange, mode }: Props) {
  const visible = fields.filter((f) =>
    mode === 'create' ? f.showOnCreate !== false : f.showOnEdit !== false
  );

  return (
    <div className="space-y-4">
      {visible.map((field) => (
        <div key={field.key} className="space-y-2">
          {field.type !== 'checkbox' &&
            field.type !== 'switch' &&
            field.type !== 'string-list' &&
            field.type !== 'image-upload' && (
            <Label htmlFor={field.key}>{field.label}</Label>
          )}

          {field.type === 'image-upload' ? (
            <ImageUploadField
              label={field.label}
              value={typeof values[field.key] === 'string' ? values[field.key] as string : null}
              onChange={(url) => onChange(field.key, url)}
              onUpload={async (file) => {
                const result = await api.upload.image(file);
                return result.url;
              }}
            />
          ) : field.type === 'string-list' ? (
            <StringListEditor
              label={field.label}
              items={Array.isArray(values[field.key]) ? (values[field.key] as string[]) : []}
              onChange={(items) => onChange(field.key, items)}
              placeholder={field.placeholder}
              addLabel={field.hint || 'Нэмэх'}
            />
          ) : field.type === 'textarea' || field.type === 'json' ? (
            <Textarea
              id={field.key}
              rows={field.rows || (field.type === 'json' ? 6 : 3)}
              placeholder={field.placeholder}
              value={String(values[field.key] ?? (field.type === 'json' ? '[]' : ''))}
              onChange={(e) => onChange(field.key, e.target.value)}
              required={field.required}
              className={field.type === 'json' ? 'font-mono text-xs' : undefined}
            />
          ) : field.type === 'checkbox' ? (
            <div className="flex items-center gap-2">
              <Checkbox
                id={field.key}
                checked={Boolean(values[field.key])}
                onCheckedChange={(checked) => onChange(field.key, checked === true)}
              />
              <Label htmlFor={field.key} className="font-normal">
                {field.hint || field.label}
              </Label>
            </div>
          ) : field.type === 'switch' ? (
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor={field.key}>{field.label}</Label>
                {field.hint && (
                  <p className="text-xs text-muted-foreground">{field.hint}</p>
                )}
              </div>
              <Switch
                id={field.key}
                checked={Boolean(values[field.key])}
                onCheckedChange={(checked) => onChange(field.key, checked === true)}
              />
            </div>
          ) : field.type === 'date' ? (
            <DatePicker
              value={
                values[field.key]
                  ? new Date(String(values[field.key]))
                  : undefined
              }
              onChange={(date) =>
                onChange(field.key, date ? date.toISOString().slice(0, 10) : '')
              }
              placeholder={field.placeholder || 'Огноо сонгох'}
            />
          ) : field.type === 'select' ? (
            <Select
              value={String(values[field.key] ?? '')}
              onValueChange={(v) => onChange(field.key, v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {(field.options || []).map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : field.type === 'readonly' ? (
            <Input id={field.key} value={String(values[field.key] ?? '')} readOnly disabled />
          ) : (
            <Input
              id={field.key}
              type={field.type === 'number' ? 'number' : 'text'}
              placeholder={field.placeholder}
              value={String(values[field.key] ?? '')}
              onChange={(e) =>
                onChange(
                  field.key,
                  field.type === 'number' ? Number(e.target.value) : e.target.value
                )
              }
              required={field.required}
            />
          )}

          {field.hint &&
            field.type !== 'checkbox' &&
            field.type !== 'switch' &&
            field.type !== 'string-list' &&
            field.type !== 'image-upload' && (
            <p className="text-xs text-muted-foreground">{field.hint}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export function serializeFormValues(
  fields: FieldDef[],
  values: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...values };
  for (const field of fields) {
    if (field.type === 'string-list') {
      const raw = values[field.key];
      out[field.key] = Array.isArray(raw)
        ? raw.map((item) => String(item).trim()).filter(Boolean)
        : [];
    }
    if (field.type === 'json') {
      try {
        out[field.key] = JSON.parse(String(values[field.key] || '[]'));
      } catch {
        throw new Error(`${field.label}: JSON буруу байна`);
      }
    }
    if (field.type === 'number') {
      out[field.key] = Number(values[field.key] ?? 0);
    }
    if (field.type === 'checkbox' || field.type === 'switch') {
      out[field.key] = Boolean(values[field.key]);
    }
  }
  return out;
}

export function prepareEditValues(
  fields: FieldDef[],
  item: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...item };
  for (const field of fields) {
    if (field.type === 'string-list') {
      out[field.key] = Array.isArray(out[field.key]) ? out[field.key] : [];
    }
    if (field.type === 'json' && out[field.key] != null) {
      out[field.key] = JSON.stringify(out[field.key], null, 2);
    }
  }
  return out;
}
