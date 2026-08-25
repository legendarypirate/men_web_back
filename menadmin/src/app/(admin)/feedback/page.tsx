'use client';

import { useEffect, useState } from 'react';
import { api, Feedback } from '@/lib/api';
import { AppDrawer } from '@/components/custom/app-drawer';
import { AppTable } from '@/components/custom/app-table';
import { formatDate } from '@/components/custom/date-picker';
import { ErrorState, LoadingState, PageHeader, StatusBadge } from '@/components/page-ui';
import { TableIconButton } from '@/components/custom/table-actions';
import { TableSelect } from '@/components/custom/table-select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const statuses = ['new', 'reviewed', 'resolved'] as const;

const statusLabels: Record<(typeof statuses)[number], string> = {
  new: 'Шинэ',
  reviewed: 'Хянасан',
  resolved: 'Шийдсэн',
};

export default function FeedbackPage() {
  const [items, setItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState<Feedback | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await api.feedback.list();
      setItems(res.data.feedback);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Алдаа');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openDetail(item: Feedback) {
    setDetail(item);
    setAdminNotes(item.adminNotes || '');
  }

  async function updateStatus(id: string, status: Feedback['status']) {
    await api.feedback.update(id, { status });
    load();
  }

  async function saveNotes() {
    if (!detail) return;
    setSaving(true);
    try {
      await api.feedback.update(detail.id, { adminNotes });
      setDetail(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Хадгалахад алдаа');
    } finally {
      setSaving(false);
    }
  }

  async function removeItem(id: string) {
    if (!confirm('Энэ санал хүсэлтийг устгах уу?')) return;
    await api.feedback.remove(id);
    if (detail?.id === id) setDetail(null);
    load();
  }

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader title="Санал хүсэлт" subtitle={`${items.length} илгээлт`} />
      {error && (
        <div className="mb-4">
          <ErrorState message={error} />
        </div>
      )}

      <AppTable
        columns={[
          {
            key: 'user',
            label: 'Хэрэглэгч',
            className: 'font-medium',
            render: (r) => r.user?.email || r.user?.name || '—',
          },
          {
            key: 'message',
            label: 'Санал хүсэлт',
            className: 'max-w-md truncate',
            render: (r) => r.message,
          },
          {
            key: 'status',
            label: 'Төлөв',
            render: (r) => (
              <StatusBadge status={statusLabels[r.status] || r.status} />
            ),
          },
          {
            key: 'createdAt',
            label: 'Огноо',
            render: (r) => formatDate(r.createdAt),
          },
        ]}
        rows={items}
        idKey="id"
        actionColumnClassName="min-w-[200px]"
        actions={(row) => (
          <div className="flex items-center gap-1.5">
            <TableIconButton
              variant="edit"
              label="Дэлгэрэнгүй"
              onClick={() => openDetail(row)}
            />
            <TableSelect
              value={row.status}
              options={statuses.map((s) => ({
                value: s,
                label: statusLabels[s],
              }))}
              onValueChange={(value) =>
                updateStatus(row.id, value as Feedback['status'])
              }
            />
            <TableIconButton
              variant="delete"
              label="Устгах"
              onClick={() => removeItem(row.id)}
            />
          </div>
        )}
      />

      <AppDrawer
        open={detail != null}
        onOpenChange={(open) => !open && setDetail(null)}
        title="Санал хүсэлт"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setDetail(null)}>
              Хаах
            </Button>
            <Button type="button" onClick={saveNotes} disabled={saving}>
              {saving ? 'Хадгалж байна...' : 'Тэмдэглэл хадгалах'}
            </Button>
          </>
        }
      >
        {detail && (
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Хэрэглэгч</Label>
              <p className="text-sm">
                {detail.user?.name || '—'} ({detail.user?.email || '—'})
              </p>
            </div>
            <div className="space-y-1">
              <Label>Огноо</Label>
              <p className="text-sm text-muted-foreground">
                {formatDate(detail.createdAt)}
              </p>
            </div>
            <div className="space-y-1">
              <Label>Санал хүсэлт</Label>
              <p className="whitespace-pre-wrap rounded-lg border bg-muted/30 p-3 text-sm">
                {detail.message}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminNotes">Админ тэмдэглэл</Label>
              <Textarea
                id="adminNotes"
                rows={4}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Дотоод тэмдэглэл..."
              />
            </div>
          </div>
        )}
      </AppDrawer>
    </div>
  );
}
