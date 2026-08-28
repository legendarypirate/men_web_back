'use client';

import { useEffect, useRef, useState } from 'react';
import { ImageIcon, Loader2, Trash2, Video } from 'lucide-react';
import { api, QuizStageRecord } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

type Props = {
  stages: QuizStageRecord[];
  onChange: () => void;
};

export function QuizStagesPanel({ stages, onChange }: Props) {
  const [drafts, setDrafts] = useState<QuizStageRecord[]>([]);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const imageRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const videoRefs = useRef<Record<number, HTMLInputElement | null>>({});

  useEffect(() => {
    setDrafts(stages.map((stage) => ({ ...stage })));
  }, [stages]);

  function patchDraft(id: number, patch: Partial<QuizStageRecord>) {
    setDrafts((prev) =>
      prev.map((stage) => (stage.id === id ? { ...stage, ...patch } : stage))
    );
  }

  async function saveStage(stage: QuizStageRecord) {
    setSavingId(stage.id);
    try {
      await api.quizStages.update(stage.id, stage);
      onChange();
    } finally {
      setSavingId(null);
    }
  }

  async function uploadMedia(stage: QuizStageRecord, file: File, type: 'image' | 'video') {
    setUploadingId(stage.id);
    try {
      const result =
        type === 'image'
          ? await api.upload.image(file)
          : await api.upload.video(file);
      const updated = {
        ...stage,
        endMediaType: type,
        endMediaUrl: result.url,
      };
      patchDraft(stage.id, updated);
      await api.quizStages.update(stage.id, {
        endMediaType: type,
        endMediaUrl: result.url,
      });
      onChange();
    } finally {
      setUploadingId(null);
    }
  }

  async function removeStage(id: number) {
    if (!confirm('Энэ хэсгийг устгах уu? Асуултууд хамт устана.')) return;
    await api.quizStages.remove(id);
    onChange();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Quiz хэсгүүд</h2>
          <p className="text-sm text-muted-foreground">
            Хэсэг бүрийн төгсгөлд зураг эсвэл богино видео харуулна.
          </p>
        </div>
        <Button
          type="button"
          onClick={async () => {
            await api.quizStages.create({
              label: 'Шинэ хэсэг',
              sortOrder: stages.length + 1,
              endMediaType: 'none',
              active: true,
            });
            onChange();
          }}
        >
          Хэсэг нэмэх
        </Button>
      </div>

      <div className="space-y-4">
        {drafts.map((stage) => (
          <div
            key={stage.id}
            className="rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div>
                  <Label>Хэсгийн нэр</Label>
                  <Input
                    value={stage.label}
                    onChange={(e) => patchDraft(stage.id, { label: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Эрэмбэ</Label>
                    <Input
                      type="number"
                      value={stage.sortOrder}
                      onChange={(e) =>
                        patchDraft(stage.id, { sortOrder: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="flex items-end gap-2 pb-2">
                    <Switch
                      checked={stage.active}
                      onCheckedChange={(checked) =>
                        patchDraft(stage.id, { active: checked })
                      }
                    />
                    <Label>Идэвхтэй</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label>Төгсгөлийн медиа</Label>
                  <Select
                    value={stage.endMediaType}
                    onValueChange={(value) => {
                      if (!value) return;
                      const mediaType = value as QuizStageRecord['endMediaType'];
                      patchDraft(stage.id, {
                        endMediaType: mediaType,
                        ...(mediaType === 'none'
                          ? { endMediaUrl: null, endMediaCaption: null }
                          : {}),
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Байхгүй</SelectItem>
                      <SelectItem value="image">Зураг</SelectItem>
                      <SelectItem value="video">Видео</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {stage.endMediaType !== 'none' && (
                  <>
                    <div>
                      <Label>URL</Label>
                      <Input
                        value={stage.endMediaUrl || ''}
                        onChange={(e) =>
                          patchDraft(stage.id, { endMediaUrl: e.target.value })
                        }
                        placeholder="https://..."
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <input
                        ref={(el) => {
                          imageRefs.current[stage.id] = el;
                        }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadMedia(stage, file, 'image');
                        }}
                      />
                      <input
                        ref={(el) => {
                          videoRefs.current[stage.id] = el;
                        }}
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadMedia(stage, file, 'video');
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingId === stage.id}
                        onClick={() => imageRefs.current[stage.id]?.click()}
                      >
                        {uploadingId === stage.id ? (
                          <Loader2 className="mr-2 size-4 animate-spin" />
                        ) : (
                          <ImageIcon className="mr-2 size-4" />
                        )}
                        Зураг байршуулах
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingId === stage.id}
                        onClick={() => videoRefs.current[stage.id]?.click()}
                      >
                        {uploadingId === stage.id ? (
                          <Loader2 className="mr-2 size-4 animate-spin" />
                        ) : (
                          <Video className="mr-2 size-4" />
                        )}
                        Видео байршуулах
                      </Button>
                    </div>
                    <div>
                      <Label>Тайлбар (сонголттой)</Label>
                      <Textarea
                        rows={2}
                        value={stage.endMediaCaption || ''}
                        onChange={(e) =>
                          patchDraft(stage.id, { endMediaCaption: e.target.value })
                        }
                      />
                    </div>
                    {stage.endMediaUrl && stage.endMediaType === 'image' && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={stage.endMediaUrl}
                        alt=""
                        className="max-h-40 rounded-lg border object-cover"
                      />
                    )}
                    {stage.endMediaUrl && stage.endMediaType === 'video' && (
                      <video
                        src={stage.endMediaUrl}
                        controls
                        className="max-h-48 w-full rounded-lg border"
                      />
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">ID: {stage.id}</span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={savingId === stage.id}
                  onClick={() => saveStage(stage)}
                >
                  {savingId === stage.id ? 'Хадгалж байна...' : 'Хадгалах'}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => removeStage(stage.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
