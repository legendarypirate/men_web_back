'use client';

import { ProductDetailSection } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type Props = {
  sections: ProductDetailSection[];
  onChange: (sections: ProductDetailSection[]) => void;
};

export function ProductDetailSectionsEditor({ sections, onChange }: Props) {
  function updateSection(index: number, patch: Partial<ProductDetailSection>) {
    const next = sections.map((section, i) =>
      i === index ? { ...section, ...patch } : section
    );
    onChange(next);
  }

  function addSection() {
    onChange([
      ...sections,
      {
        title: `Formula ${String(sections.length + 1).padStart(2, '0')}`,
        description: '',
        dosage: '',
        ingredients: '',
        sortOrder: sections.length,
      },
    ]);
  }

  function removeSection(index: number) {
    onChange(sections.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Formula хэсгүүд</Label>
        <Button type="button" variant="outline" size="sm" onClick={addSection}>
          Хэсэг нэмэх
        </Button>
      </div>

      {sections.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Formula хэсэг байхгүй. Нэмэх товч дарна уу.
        </p>
      )}

      {sections.map((section, index) => (
        <div key={index} className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">Хэсэг {index + 1}</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeSection(index)}
            >
              Устгах
            </Button>
          </div>
          <div className="space-y-2">
            <Label>Гарчиг</Label>
            <Input
              value={section.title}
              onChange={(e) => updateSection(index, { title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Тайлбар</Label>
            <Textarea
              value={section.description}
              onChange={(e) =>
                updateSection(index, { description: e.target.value })
              }
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>DOSAGE</Label>
            <Textarea
              value={section.dosage || ''}
              onChange={(e) => updateSection(index, { dosage: e.target.value })}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>INGREDIENTS</Label>
            <Textarea
              value={section.ingredients || ''}
              onChange={(e) =>
                updateSection(index, { ingredients: e.target.value })
              }
              rows={2}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
