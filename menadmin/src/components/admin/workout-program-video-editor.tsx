'use client';

import { useRef, useState } from 'react';
import { Upload, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  onChange: (patch: { videoUrl?: string | null; thumbnailUrl?: string | null }) => void;
  onUploadVideo: (file: File) => Promise<{ url: string; thumbnailUrl?: string | null }>;
};

export function WorkoutProgramVideoEditor({
  videoUrl,
  thumbnailUrl,
  onChange,
  onUploadVideo,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file?: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      const result = await onUploadVideo(file);
      onChange({
        videoUrl: result.url,
        thumbnailUrl: result.thumbnailUrl ?? null,
      });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div className="rounded-lg border border-[#e8ecef] bg-[#fafbfc] p-4">
      <div className="mb-3 flex items-center gap-2">
        <Video className="size-4 text-[#1abc9c]" />
        <Label className="mb-0 font-semibold">Бүтэн дасгалын видео (Cloudinary)</Label>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        Pelvic Stretching зэрэг бүтэн видео дасгалд ашиглана. Апп HTTP URL-аар татна.
      </p>
      <div className="space-y-2">
        <Input
          value={videoUrl || ''}
          onChange={(e) => onChange({ videoUrl: e.target.value || null })}
          placeholder="https://res.cloudinary.com/.../video/upload/..."
        />
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
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
            <Upload className="size-4" />
            {uploading ? 'Cloudinary руу...' : 'Видео байршуулах'}
          </Button>
          {videoUrl && (
            <>
              <a
                href={videoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-[#1abc9c] hover:underline"
              >
                Видео үзэх
              </a>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => onChange({ videoUrl: null, thumbnailUrl: null })}
              >
                Видео устгах
              </Button>
            </>
          )}
        </div>
        {thumbnailUrl && (
          <p className="text-xs text-muted-foreground">Thumbnail: {thumbnailUrl}</p>
        )}
        {videoUrl && (
          <video
            src={videoUrl}
            controls
            className="mt-2 max-h-48 w-full rounded-md bg-black"
            preload="metadata"
          />
        )}
      </div>
    </div>
  );
}
