'use client';

import { useEffect, useState } from 'react';
import { api, Payment, formatMnt } from '@/lib/api';
import { AppTable } from '@/components/custom/app-table';
import { formatDate } from '@/components/custom/date-picker';
import { ErrorState, LoadingState, PageHeader, StatusBadge } from '@/components/page-ui';
import { Button } from '@/components/ui/button';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await api.payments.list();
      setPayments(res.data.payments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Алдаа');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function markPaid(id: string) {
    await api.payments.updateStatus(id, 'paid');
    load();
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader title="QPay төлбөрүүд" subtitle={`${payments.length} нэхэмжлэх`} />

      <AppTable
        columns={[
          { key: 'invoiceId', label: 'Invoice', className: 'font-mono text-xs' },
          {
            key: 'user',
            label: 'Хэрэглэгч',
            render: (p) => (
              <div>
                <p>{p.user?.name}</p>
                <p className="text-xs text-muted-foreground">{p.user?.email}</p>
              </div>
            ),
          },
          {
            key: 'planId',
            label: 'Төлөвлөгөө',
            render: (p) => p.plan?.title || p.planId,
          },
          {
            key: 'amountMnt',
            label: 'Дүн',
            render: (p) => (
              <span className="font-semibold text-primary">{formatMnt(p.amountMnt)}</span>
            ),
          },
          {
            key: 'status',
            label: 'Төлөв',
            render: (p) => <StatusBadge status={p.status} />,
          },
          {
            key: 'createdAt',
            label: 'Огноо',
            render: (p) => (
              <span className="text-xs text-muted-foreground">
                {formatDate(p.createdAt, true)}
              </span>
            ),
          },
        ]}
        rows={payments}
        idKey="id"
        emptyMessage="Төлбөр байхгүй байна"
        actions={(p) =>
          p.status === 'pending' ? (
            <Button size="sm" onClick={() => markPaid(p.id)}>
              Төлсөн
            </Button>
          ) : null
        }
      />
    </div>
  );
}
