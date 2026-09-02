'use client';

import { FormEvent, useEffect, useState } from 'react';
import { WorkoutIntroSlidesEditor } from '@/components/admin/workout-intro-slides-editor';
import { api, OnboardingStory } from '@/lib/api';
import { ErrorState, LoadingState, PageHeader } from '@/components/page-ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function OnboardingStoryPage() {
  const [story, setStory] = useState<OnboardingStory | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadStory() {
    setLoading(true);
    try {
      const res = await api.onboardingStory.get();
      setStory(res.data.story);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Алдаа');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStory();
  }, []);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!story) return;
    setSaving(true);
    try {
      const res = await api.onboardingStory.update(story);
      setStory(res.data.story);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Хадгалахад алдаа');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Нүүр story"
        subtitle="Шинэ хэрэглэгчид нэг удаа автоматаар харагдана. Дараа нь нүүр дээрх info товчоор дахин үзнэ."
      />

      {error && <ErrorState message={error} />}

      {story && (
        <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <h2 className="text-lg font-semibold">Ерөнхий тохиргоо</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Дээд гарчиг</Label>
                <Input
                  value={story.headerTitle}
                  onChange={(e) =>
                    setStory({ ...story, headerTitle: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Дэд гарчиг</Label>
                <Input
                  value={story.headerSubtitle}
                  onChange={(e) =>
                    setStory({ ...story, headerSubtitle: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Сүүлийн товчны текст</Label>
              <Input
                value={story.finalButtonLabel}
                onChange={(e) =>
                  setStory({ ...story, finalButtonLabel: e.target.value })
                }
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="story-active">Идэвхтэй</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Идэвхгүй бол story харагдахгүй
                </p>
              </div>
              <Switch
                id="story-active"
                checked={story.active}
                onCheckedChange={(checked) =>
                  setStory({ ...story, active: checked })
                }
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Хувилбар: v{story.version} — slide өөрчлөхөд автоматаар нэмэгдэнэ
            </p>
          </div>

          <WorkoutIntroSlidesEditor
            title="Story slides"
            description="Зураг эсвэл видео, гарчиг, тайлбар нэмнэ. Дарааллыг дээш/доош товчоор солино."
            slides={story.slides || []}
            onChange={(slides) => setStory({ ...story, slides })}
            onUploadImage={async (file) => {
              const result = await api.upload.image(file);
              return result.url;
            }}
            onUploadVideo={async (file) => {
              const result = await api.upload.video(file);
              return { url: result.url, thumbnailUrl: result.thumbnailUrl };
            }}
          />

          <Button type="submit" disabled={saving}>
            {saving ? 'Хадгалж байна...' : 'Story хадгалах'}
          </Button>
        </form>
      )}
    </div>
  );
}
