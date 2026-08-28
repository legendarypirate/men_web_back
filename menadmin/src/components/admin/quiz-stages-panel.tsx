'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ImageIcon, Loader2, Trash2, Video } from 'lucide-react';
import { api, QuizEndMediaItem, QuizStageRecord } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

type Props = {
  stages: QuizStageRecord[];
  onChange: () => void;
};

function getStageMediaItems(stage: QuizStageRecord): QuizEndMediaItem[] {
  if (stage.endMediaItems?.length) {
    return [...stage.endMediaItems].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    );
  }
  if (stage.endMediaType !== 'none' && stage.endMediaUrl) {
    return [
      {
        id: `legacy-${stage.id}`,
        type: stage.endMediaType,
        url: stage.endMediaUrl,
        title: stage.endMediaTitle || '',
        caption: stage.endMediaCaption || '',
        sortOrder: 0,
      },
    ];
  }
  return [];
}

function newMediaItem(type: 'image' | 'video', url: string, sortOrder: number): QuizEndMediaItem {
  return {
    id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type,
    url,
    title: '',
    caption: '',
    sortOrder,
  };
}

export function QuizStagesPanel({ stages, onChange }: Props) {
  const [drafts, setDrafts] = useState<QuizStageRecord[]>([]);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const imageRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const videoRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    setDrafts(
      stages.map((stage) => ({
        ...stage,
        endMediaItems: getStageMediaItems(stage),
      }))
    );
  }, [stages]);

  function patchDraft(id: number, patch: Partial<QuizStageRecord>) {
    setDrafts((prev) =>
      prev.map((stage) => (stage.id === id ? { ...stage, ...patch } : stage))
    );
  }

  function patchMediaItems(stageId: number, items: QuizEndMediaItem[]) {
    const normalized = items.map((item, index) => ({ ...item, sortOrder: index }));
    patchDraft(stageId, { endMediaItems: normalized });
  }

  async function saveStage(stage: QuizStageRecord) {
    setSavingId(stage.id);
    try {
      const items = getStageMediaItems(stage);
      await api.quizStages.update(stage.id, {
        label: stage.label,
        sortOrder: stage.sortOrder,
        active: stage.active,
        endMediaItems: items,
      });
      onChange();
    } finally {
      setSavingId(null);
    }
  }

  async function uploadMedia(
    stage: QuizStageRecord,
    file: File,
    type: 'image' | 'video'
  ) {
    const key = `${stage.id}-${type}`;
    setUploadingKey(key);
    try {
      const result =
        type === 'image'
          ? await api.upload.image(file)
          : await api.upload.video(file);
      const items = getStageMediaItems(stage);
      patchMediaItems(stage.id, [
        ...items,
        newMediaItem(type, result.url, items.length),
      ]);
    } finally {
      setUploadingKey(null);
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
            Хэсэг бүрийн төгсгөлд нэг буюу олон зураг, видео нэмж болно. Хэрэглэгч &quot;Дараах&quot;
            товчоор дараалан үзнэ.
          </p>
        </div>
        <Button
          type="button"
          onClick={async () => {
            await api.quizStages.create({
              label: 'Шинэ хэсэг',
              sortOrder: stages.length + 1,
              endMediaType: 'none',
              endMediaItems: [],
              active: true,
            });
            onChange();
          }}
        >
          Хэсэг нэмэх
        </Button>
      </div>

      <div className="space-y-4">
        {drafts.map((stage) => {
          const items = getStageMediaItems(stage);

          return (
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
                  <div className="flex items-center justify-between gap-2">
                    <Label>Төгсгөлийн медиа ({items.length})</Label>
                    <div className="flex gap-2">
                      <input
                        ref={(el) => {
                          imageRefs.current[`${stage.id}-add`] = el;
                        }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadMedia(stage, file, 'image');
                          e.target.value = '';
                        }}
                      />
                      <input
                        ref={(el) => {
                          videoRefs.current[`${stage.id}-add`] = el;
                        }}
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadMedia(stage, file, 'video');
                          e.target.value = '';
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingKey === `${stage.id}-image`}
                        onClick={() => imageRefs.current[`${stage.id}-add`]?.click()}
                      >
                        {uploadingKey === `${stage.id}-image` ? (
                          <Loader2 className="mr-1 size-4 animate-spin" />
                        ) : (
                          <ImageIcon className="mr-1 size-4" />
                        )}
                        Зураг
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingKey === `${stage.id}-video`}
                        onClick={() => videoRefs.current[`${stage.id}-add`]?.click()}
                      >
                        {uploadingKey === `${stage.id}-video` ? (
                          <Loader2 className="mr-1 size-4 animate-spin" />
                        ) : (
                          <Video className="mr-1 size-4" />
                        )}
                        Видео
                      </Button>
                    </div>
                  </div>

                  {items.length === 0 && (
                    <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
                      Медиа байхгүй. Зураг эсвэл видео нэмнэ үү.
                    </p>
                  )}

                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <div
                        key={item.id}
                        className="rounded-lg border border-border bg-muted/30 p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-muted-foreground">
                            #{index + 1} · {item.type === 'video' ? 'Видео' : 'Зураг'}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              disabled={index === 0}
                              onClick={() => {
                                const next = [...items];
                                [next[index - 1], next[index]] = [next[index], next[index - 1]];
                                patchMediaItems(stage.id, next);
                              }}
                            >
                              <ArrowUp className="size-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              disabled={index === items.length - 1}
                              onClick={() => {
                                const next = [...items];
                                [next[index], next[index + 1]] = [next[index + 1], next[index]];
                                patchMediaItems(stage.id, next);
                              }}
                            >
                              <ArrowDown className="size-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-7 text-destructive"
                              onClick={() => {
                                patchMediaItems(
                                  stage.id,
                                  items.filter((i) => i.id !== item.id)
                                );
                              }}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs">Гарчиг</Label>
                          <Input
                            value={item.title || ''}
                            onChange={(e) => {
                              const next = items.map((i) =>
                                i.id === item.id ? { ...i, title: e.target.value } : i
                              );
                              patchMediaItems(stage.id, next);
                            }}
                            placeholder="Жишээ: Маш сайн!"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Нэмэлт текст</Label>
                          <Textarea
                            rows={2}
                            value={item.caption || ''}
                            onChange={(e) => {
                              const next = items.map((i) =>
                                i.id === item.id ? { ...i, caption: e.target.value } : i
                              );
                              patchMediaItems(stage.id, next);
                            }}
                            placeholder="Зураг эсвэл видеоны доор харагдах тайлбар..."
                          />
                        </div>
                        <div>
                          <Label className="text-xs">URL</Label>
                          <Input
                            value={item.url}
                            onChange={(e) => {
                              const next = items.map((i) =>
                                i.id === item.id ? { ...i, url: e.target.value } : i
                              );
                              patchMediaItems(stage.id, next);
                            }}
                            placeholder="https://..."
                          />
                        </div>

                        {item.type === 'image' && item.url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.url}
                            alt=""
                            className="max-h-32 rounded-lg border object-cover"
                          />
                        )}
                        {item.type === 'video' && item.url && (
                          <video
                            src={item.url}
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="max-h-36 w-full rounded-lg border object-cover"
                          />
                        )}
                      </div>
                    ))}
                  </div>
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
          );
        })}
      </div>
    </div>
  );
}
