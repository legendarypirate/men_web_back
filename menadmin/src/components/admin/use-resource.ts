'use client';

import { useCallback, useEffect, useState } from 'react';
import { useConfirm } from '@/components/custom/confirm-provider';

type ResourceApi<T> = {
  list: () => Promise<{ data: Record<string, T[]> }>;
  create: (data: Partial<T>) => Promise<unknown>;
  update: (id: string, data: Partial<T>) => Promise<unknown>;
  remove: (id: string) => Promise<unknown>;
};

export function useResource<T extends Record<string, unknown>>(
  api: ResourceApi<T>,
  listKey: string
) {
  const confirm = useConfirm();
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.list();
      setItems((res.data[listKey] as T[]) || []);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  }, [api, listKey]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (id: string | undefined, data: Partial<T>) => {
    setSaving(true);
    try {
      if (id) await api.update(id, data);
      else await api.create(data);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string, label = 'энийг') => {
    const ok = await confirm({
      title: 'Устгах уу?',
      description: `Та ${label} устгахдаа итгэлтэй байна уу?`,
      confirmLabel: 'Устгах',
      cancelLabel: 'Болих',
      destructive: true,
    });
    if (!ok) return;
    setSaving(true);
    try {
      await api.remove(id);
      await load();
    } finally {
      setSaving(false);
    }
  };

  return { items, loading, error, saving, load, save, remove, setError };
}
