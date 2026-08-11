'use client';

import { useRef, useState } from 'react';
import { ChevronDown, ChevronUp, ImagePlus, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
  images: string[];
  onChange: (images: string[]) => void;
  onUploadImage: (file: File) => Promise<string>;
};

export function ProductImagesEditor({ images, onChange, onUploadImage }: Props) {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function update(index: number, url: string) {
    const next = images.map((img, i) => (i === index ? url : img));
    onChange(next);
  }

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

  function addUrl() {
    const url = urlInput.trim();
    if (!url) return;
    onChange([...images, url]);
    setUrlInput('');
  }

  async function handleFile(file: File | undefined) {
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
          Зураг байхгүй — Cloudinary-аар байршуулна уу
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
              <Input
                value={url}
                onChange={(e) => update(index, e.target.value)}
                className="h-9 flex-1 text-xs"
                placeholder="https://..."
              />
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

      <div className="flex flex-wrap gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
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

      <div className="flex gap-2">
        <Input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="URL-ээр нэмэх..."
          className="h-9"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addUrl();
            }
          }}
        />
        <Button type="button" variant="secondary" size="sm" onClick={addUrl}>
          <ImagePlus className="mr-2 h-4 w-4" />
          Нэмэх
        </Button>
      </div>
    </div>
  );
}
