'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { FieldOption } from '@/lib/types/fields';

type Props = {
  label: string;
  options: FieldOption[];
  values: string[];
  onChange: (values: string[]) => void;
};

export function MultiSelectEditor({ label, options, values, onChange }: Props) {
  function toggle(value: string, checked: boolean) {
    if (checked) {
      onChange(Array.from(new Set([...values, value])));
      return;
    }
    onChange(values.filter((item) => item !== value));
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="space-y-2 rounded-lg border p-3">
        {options.length === 0 ? (
          <p className="text-sm text-muted-foreground">Эхлээд эмнэлгийн төрөл нэмнэ үү.</p>
        ) : (
          options.map((option) => {
            const checked = values.includes(option.value);
            return (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 hover:bg-muted/40"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(next) => toggle(option.value, next === true)}
                />
                <span className="text-sm">{option.label}</span>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}
