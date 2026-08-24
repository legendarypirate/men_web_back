'use client';

import { useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

type Props = {
  images: string[];
  onChange: (images: string[]) => void;
  onUploadImage: (file: File) => Promise<string>;
};

export function ProductImagesEditor({ images, onChange, onUploadImage }: Props) {
  const [uploading, setUploading] = useState(false);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const replaceTargetRef = useRef<number | null>(null);

  function remove(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  async function handleAddFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await onUploadImage(file);
      onChange([...images, url]);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function handleReplaceFile(file: File | undefined) {
    const index = replaceTargetRef.current;
    if (!file || index == null) return;
    setReplacingIndex(index);
    try {
      const url = await onUploadImage(file);
      const next = images.map((img, i) => (i === index ? url : img));
      onChange(next);
    } finally {
      setReplacingIndex(null);
      replaceTargetRef.current = null;
      if (replaceRef.current) replaceRef.current.value = '';
    }
  }

  function startReplace(index: number) {
    replaceTargetRef.current = index;
    replaceRef.current?.click();
  }

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-sm font-semibold">Зургууд</Label>
        <p className="text-xs text-muted-foreground">
          Олон зураг нэмж болно. Эхний зураг нь үндсэн зураг болно.
        </p>
      </div>

      {images.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          Зураг байхгүй — файл байршуулна уу
        </div>
      ) : (
        <div className="space-y-2">
          {images.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="flex items-center gap-3 rounded-lg border bg-muted/20 p-2"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Зураг ${index + 1}`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                {index === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-black/60 py-0.5 text-center text-[10px] text-white">
                    Үндсэн
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-muted-foreground">Зураг {index + 1}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-1 h-8"
                  disabled={replacingIndex === index}
                  onClick={() => startReplace(index)}
                >
                  <Upload className="mr-2 h-3.5 w-3.5" />
                  {replacingIndex === index ? 'Солж байна...' : 'Солих'}
                </Button>
              </div>
              <div className="flex shrink-0 flex-col gap-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={index === images.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void handleAddFile(e.target.files?.[0])}
      />
      <input
        ref={replaceRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void handleReplaceFile(e.target.files?.[0])}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => fileRef.current?.click()}
      >
        <Upload className="mr-2 h-4 w-4" />
        {uploading ? 'Байршуулж байна...' : 'Зураг байршуулах'}
      </Button>
    </div>
  );
}
