'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
  label?: string;
  hint?: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  addLabel?: string;
};

export function StringListEditor({
  label,
  hint,
  items,
  onChange,
  placeholder = 'Утга оруулна уу...',
  addLabel = 'Нэмэх',
}: Props) {
  function update(index: number, value: string) {
    onChange(items.map((item, i) => (i === index ? value : item)));
  }

  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function add() {
    onChange([...items, '']);
  }

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
          Одоогоор хоосон байна
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="w-6 shrink-0 text-center text-xs text-muted-foreground">
                {index + 1}
              </span>
              <Input
                value={item}
                onChange={(e) => update(index, e.target.value)}
                placeholder={placeholder}
                className="h-9"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 text-destructive"
                onClick={() => remove(index)}
                aria-label="Устгах"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Button type="button" variant="outline" size="sm" onClick={add}>
        <Plus className="mr-2 h-4 w-4" />
        {addLabel}
      </Button>
    </div>
  );
}
