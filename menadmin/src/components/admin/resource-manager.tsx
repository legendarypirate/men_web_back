'use client';

import { FormEvent, useState } from 'react';
import { ResourceConfig } from '@/lib/types/fields';
import { useResource } from '@/components/admin/use-resource';
import {
  DynamicForm,
  prepareEditValues,
  serializeFormValues,
} from '@/components/admin/dynamic-form';
import { DataTable } from '@/components/admin/data-table';
import { AddButton } from '@/components/custom/add-button';
import { AppDrawer } from '@/components/custom/app-drawer';
import { ErrorState, LoadingState, PageHeader } from '@/components/page-ui';
import { Button } from '@/components/ui/button';

type ResourceApi<T> = {
  list: () => Promise<{ data: Record<string, T[]> }>;
  create: (data: Partial<T>) => Promise<unknown>;
  update: (id: string, data: Partial<T>) => Promise<unknown>;
  remove: (id: string) => Promise<unknown>;
};

type Props<T extends Record<string, unknown>> = {
  config: ResourceConfig<T>;
  api: ResourceApi<T>;
  canDelete?: boolean;
  getNewItem?: () => Partial<T>;
};

export function ResourceManager<T extends Record<string, unknown>>({
  config,
  api,
  canDelete = true,
  getNewItem,
}: Props<T>) {
  const { items, loading, error, saving, save, remove, setError } = useResource(
    api,
    config.listKey
  );
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [form, setForm] = useState<Record<string, unknown>>({});
  const formId = `resource-form-${config.listKey}`;

  function openCreate() {
    setMode('create');
    setForm({
      ...config.emptyDefaults,
      ...(getNewItem?.() || {}),
    });
    setOpen(true);
  }

  function openEdit(row: T) {
    setMode('edit');
    setForm(prepareEditValues(config.fields, row));
    setOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const payload = serializeFormValues(config.fields, form) as Partial<T>;
      const id = mode === 'edit' ? String(form[config.idKey as string]) : undefined;
      await save(id, payload);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Хадгалахад алдаа');
    }
  }

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader
        title={config.title}
        subtitle={config.subtitle || `${items.length} ${config.itemLabel}`}
        action={
          <AddButton
            label={`${config.itemLabel} нэмэх`}
            onClick={openCreate}
            disabled={saving}
          />
        }
      />
      {error && (
        <div className="mb-4">
          <ErrorState message={error} />
        </div>
      )}

      <DataTable
        columns={config.columns}
        rows={items}
        idKey={config.idKey}
        onEdit={openEdit}
        onDelete={
          canDelete
            ? (row) => remove(String(row[config.idKey]), config.itemLabel)
            : undefined
        }
      />

      <AppDrawer
        open={open}
        onOpenChange={setOpen}
        title={`${mode === 'create' ? 'Шинэ' : 'Засах'} — ${config.itemLabel}`}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Болих
            </Button>
            <Button type="submit" form={formId} disabled={saving}>
              {saving ? 'Хадгалж байна...' : 'Хадгалах'}
            </Button>
          </>
        }
      >
        <form id={formId} onSubmit={handleSubmit} className="space-y-4">
          <DynamicForm
            fields={config.fields}
            values={form}
            mode={mode}
            onChange={(key, value) => setForm((prev) => ({ ...prev, [key]: value }))}
          />
        </form>
      </AppDrawer>
    </div>
  );
}
