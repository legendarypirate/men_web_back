'use client';

import { useRef, useState } from 'react';
import { Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export type VideoUploadMeta = {
  thumbnailUrl?: string;
  duration?: number;
};

type Props = {
  label: string;
  value?: string | null;
  onChange: (url: string | null, meta?: VideoUploadMeta) => void;
  onUpload: (file: File) => Promise<{ url: string } & VideoUploadMeta>;
};

export function VideoUploadField({ label, value, onChange, onUpload }: Props) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const result = await onUpload(file);
      onChange(result.url, {
        thumbnailUrl: result.thumbnailUrl,
        duration: result.duration,
      });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {value ? (
        <div className="overflow-hidden rounded-lg border">
          <video
            src={value}
            controls
            className="max-h-48 w-full bg-black object-contain"
          />
          <div className="flex gap-2 border-t p-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? 'Байршуулж байна...' : 'Солих'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() => onChange(null)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Устгах
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-6 text-center">
          <p className="mb-3 text-sm text-muted-foreground">Видео байхгүй</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? 'Байршуулж байна...' : 'Видео байршуулах'}
          </Button>
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
