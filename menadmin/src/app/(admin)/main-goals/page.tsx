'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { api, MainGoalConfigRecord, MainGoalOptionRecord } from '@/lib/api';

export default function MainGoalsAdminPage() {
  const [config, setConfig] = useState<MainGoalConfigRecord | null>(null);
  const [options, setOptions] = useState<MainGoalOptionRecord[]>([]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await api.mainGoals.get();
    setConfig(res.data.config);
    setOptions(res.data.options);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function updateOption(
    key: string,
    patch: Partial<Pick<MainGoalOptionRecord, 'title' | 'description' | 'active'>>
  ) {
    setOptions((prev) =>
      prev.map((option) => (option.key === key ? { ...option, ...patch } : option))
    );
  }

  async function save() {
    if (!config) return;
    setSaving(true);
    try {
      const res = await api.mainGoals.update({
        screenTitle: config.screenTitle,
        defaultKey: config.defaultKey,
        options,
      });
      setConfig(res.data.config);
      setOptions(res.data.options);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Үндсэн зорилго</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Апп дахь профайл → Үндсэн зорилго сонгох дэлгэцийн гурван сонголтыг
          энд засна. Key өөрчлөхгүй — зөвхөн гарчиг, тайлбар.
        </p>
      </div>

      {config && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Дэлгэцийн гарчиг</h2>
          <div className="mt-4 max-w-xl">
            <Label htmlFor="screenTitle">Гарчиг</Label>
            <Input
              id="screenTitle"
              value={config.screenTitle}
              onChange={(e) =>
                setConfig({ ...config, screenTitle: e.target.value })
              }
              className="mt-2"
            />
          </div>
        </div>
      )}

      <div className="space-y-4">
        {options.map((option, index) => (
          <div
            key={option.key}
            className="rounded-xl border border-border bg-card p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Сонголт {index + 1}
                </p>
                <p className="font-mono text-xs text-muted-foreground/80">
                  key: {option.key}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor={`active-${option.key}`} className="text-sm">
                  Идэвхтэй
                </Label>
                <Switch
                  id={`active-${option.key}`}
                  checked={option.active}
                  onCheckedChange={(active) => updateOption(option.key, { active })}
                />
              </div>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <Label htmlFor={`title-${option.key}`}>Гарчиг</Label>
                <Input
                  id={`title-${option.key}`}
                  value={option.title}
                  onChange={(e) =>
                    updateOption(option.key, { title: e.target.value })
                  }
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor={`description-${option.key}`}>Тайлбар</Label>
                <Textarea
                  id={`description-${option.key}`}
                  rows={3}
                  value={option.description}
                  onChange={(e) =>
                    updateOption(option.key, { description: e.target.value })
                  }
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button onClick={save} disabled={saving || !config}>
        {saving ? 'Хадгалж байна…' : 'Хадгалах'}
      </Button>
    </div>
  );
}
