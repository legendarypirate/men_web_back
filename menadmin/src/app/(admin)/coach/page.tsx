'use client';

import { FormEvent, useEffect, useState } from 'react';
import { ResourceManager } from '@/components/admin/resource-manager';
import { ImageUploadField } from '@/components/admin/image-upload-field';
import { api, CoachProgram, CoachSetting } from '@/lib/api';
import { coachProgramConfig } from '@/lib/resource-configs';
import { ErrorState, LoadingState, PageHeader } from '@/components/page-ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

const coachProgramsApi = {
  list: () => api.coach.listPrograms(),
  create: (data: Parameters<typeof api.coach.createProgram>[0]) =>
    api.coach.createProgram(data),
  update: (id: string, data: Parameters<typeof api.coach.updateProgram>[1]) =>
    api.coach.updateProgram(id, data),
  remove: (id: string) => api.coach.removeProgram(id),
};

export default function CoachPage() {
  const [settings, setSettings] = useState<CoachSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadSettings() {
    setLoading(true);
    try {
      const res = await api.coach.getSettings();
      setSettings(res.data.settings);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Алдаа');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  async function handleSaveSettings(e: FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      const res = await api.coach.updateSettings(settings);
      setSettings(res.data.settings);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Хадгалахад алдаа');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-10">
      <PageHeader
        title="Коуч дэлгэц"
        subtitle="Explore дэлгэцийн banner болон хөтөлбөрүүдийг удирдана"
      />

      {error && <ErrorState message={error} />}

      {settings && (
        <form
          onSubmit={handleSaveSettings}
          className="rounded-xl border bg-card p-6 space-y-4 max-w-3xl"
        >
          <h2 className="text-lg font-semibold">Banner тохиргоо</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Дэлгэцийн гарчиг</Label>
              <Input
                value={settings.screenTitle}
                onChange={(e) =>
                  setSettings({ ...settings, screenTitle: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Learn More текст</Label>
              <Input
                value={settings.learnMoreLabel}
                onChange={(e) =>
                  setSettings({ ...settings, learnMoreLabel: e.target.value })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Banner гарчиг</Label>
            <Input
              value={settings.bannerTitle}
              onChange={(e) =>
                setSettings({ ...settings, bannerTitle: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Banner тайлбар</Label>
            <Textarea
              value={settings.bannerSubtitle}
              onChange={(e) =>
                setSettings({ ...settings, bannerSubtitle: e.target.value })
              }
              rows={2}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Коучийн нэр</Label>
              <Input
                value={settings.coachName}
                onChange={(e) =>
                  setSettings({ ...settings, coachName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Коучийн мэргэжил</Label>
              <Input
                value={settings.coachRole}
                onChange={(e) =>
                  setSettings({ ...settings, coachRole: e.target.value })
                }
              />
            </div>
          </div>
          <ImageUploadField
            label="Коучийн зураг"
            value={settings.coachImageUrl}
            onChange={(url) =>
              setSettings({ ...settings, coachImageUrl: url || undefined })
            }
            onUpload={async (file) => {
              const result = await api.upload.image(file);
              return result.url;
            }}
          />
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label htmlFor="coach-active">Идэвхтэй</Label>
            <Switch
              id="coach-active"
              checked={settings.active}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, active: checked })
              }
            />
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? 'Хадгалж байна...' : 'Banner хадгалах'}
          </Button>
        </form>
      )}

      <ResourceManager
        config={coachProgramConfig}
        api={coachProgramsApi}
        getNewItem={(): Partial<CoachProgram> => ({
          id: `coach_${Date.now()}`,
          section: 'recommended',
        })}
      />

    </div>
  );
}
