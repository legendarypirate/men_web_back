'use client';

import { useEffect, useState } from 'react';
import { api, Order } from '@/lib/api';
import { AppDrawer } from '@/components/custom/app-drawer';
import { AppTable } from '@/components/custom/app-table';
import { formatDate } from '@/components/custom/date-picker';
import { ErrorState, LoadingState, PageHeader, StatusBadge } from '@/components/page-ui';
import { formatMnt } from '@/lib/api';
import { TableIconButton } from '@/components/custom/table-actions';
import { TableSelect } from '@/components/custom/table-select';

const statuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'] as const;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState<Order | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await api.orders.list();
      setOrders(res.data.orders);
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

  async function updateStatus(id: string, status: Order['status']) {
    await api.orders.update(id, { status });
    load();
  }

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader title="Захиалгууд" subtitle={`${orders.length} захиалга`} />
      {error && (
        <div className="mb-4">
          <ErrorState message={error} />
        </div>
      )}

      <AppTable
        columns={[
          { key: 'orderNumber', label: 'Дугаар', className: 'font-mono text-xs' },
          { key: 'customerName', label: 'Худалдан авагч' },
          { key: 'customerPhone', label: 'Утас', className: 'font-mono text-xs' },
          { key: 'totalMnt', label: 'Дүн', render: (r) => formatMnt(r.totalMnt) },
          {
            key: 'status',
            label: 'Төлөв',
            render: (r) => <StatusBadge status={r.status} />,
          },
          {
            key: 'createdAt',
            label: 'Огноо',
            render: (r) => formatDate(r.createdAt),
          },
        ]}
        rows={orders}
        idKey="id"
        actionColumnClassName="min-w-[200px]"
        actions={(row) => (
          <div className="flex items-center gap-1.5">
            <TableIconButton
              variant="edit"
              label="Дэлгэрэнгүй"
              onClick={() => setDetail(row)}
            />
            <TableSelect
              value={row.status}
              onValueChange={(v) => updateStatus(row.id, v as Order['status'])}
              className="w-28"
              options={statuses.map((s) => ({ value: s, label: s }))}
            />
          </div>
        )}
      />

      <AppDrawer
        open={!!detail}
        onOpenChange={() => setDetail(null)}
        title={`Захиалга ${detail?.orderNumber ?? ''}`}
        size="md"
      >
        {detail && (
          <div className="space-y-3 text-sm">
            <p>
              <span className="text-muted-foreground">Худалдан авагч:</span> {detail.customerName}
            </p>
            <p>
              <span className="text-muted-foreground">Утас:</span> {detail.customerPhone || '—'}
            </p>
            <p>
              <span className="text-muted-foreground">И-мэйл:</span> {detail.customerEmail || '—'}
            </p>
            <p>
              <span className="text-muted-foreground">Хаяг:</span> {detail.shippingAddress || '—'}
            </p>
            <p>
              <span className="text-muted-foreground">Нийт:</span> {formatMnt(detail.totalMnt)}
            </p>
            <div className="rounded-lg border p-3">
              <p className="mb-2 font-medium">Бараанууд</p>
              {(detail.items || []).map((item) => (
                <div key={item.id} className="flex justify-between py-1">
                  <span>
                    {item.productName} × {item.quantity}
                  </span>
                  <span>{formatMnt(item.lineTotalMnt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </AppDrawer>
    </div>
  );
}
