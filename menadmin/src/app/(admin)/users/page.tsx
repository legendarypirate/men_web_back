'use client';

import { useEffect, useState } from 'react';
import { api, User } from '@/lib/api';
import { AppTable } from '@/components/custom/app-table';
import { TableSelect } from '@/components/custom/table-select';
import { ErrorState, LoadingState, PageHeader, StatusBadge } from '@/components/page-ui';
import { useConfirm } from '@/components/custom/confirm-provider';

const membershipLabels: Record<string, string> = {
  free: 'Free',
  monthly: 'Сар бүр',
  yearly: 'Жил бүр',
  lifetime: 'Насан турш',
  platinum: 'Platinum',
};

export default function UsersPage() {
  const confirm = useConfirm();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await api.users.list();
      setUsers(res.data.users);
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

  async function handleMembership(id: string, membership: string) {
    await api.users.update(id, { membership } as Partial<User>);
    load();
  }

  async function handleDelete(id: string, name: string) {
    const ok = await confirm({
      title: 'Хэрэглэгч устгах уу?',
      description: `${name} хэрэглэгчийг устгахдаа итгэлтэй байна уу?`,
      confirmLabel: 'Устгах',
      destructive: true,
    });
    if (!ok) return;
    await api.users.remove(id);
    load();
  }

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader title="Хэрэглэгчид" subtitle={`${users.length} хэрэглэгч`} />
      {error && (
        <div className="mb-4">
          <ErrorState message={error} />
        </div>
      )}

      <AppTable
        columns={[
          { key: 'name', label: 'Нэр', className: 'font-semibold text-[#2c3e50]' },
          { key: 'email', label: 'И-мэйл', className: 'text-[#5d6d7e]' },
          {
            key: 'role',
            label: 'Эрх',
            render: (u) => <StatusBadge status={u.role} />,
          },
          {
            key: 'membership',
            label: 'Гишүүнчлэл',
            render: (u) => (
              <TableSelect
                value={u.membership}
                onValueChange={(v) => handleMembership(u.id, v)}
                options={['free', 'monthly', 'yearly', 'lifetime', 'platinum'].map((m) => ({
                  value: m,
                  label: membershipLabels[m] || m,
                }))}
              />
            ),
          },
          { key: 'vitalityScore', label: 'Оноо', align: 'center' },
          {
            key: 'streakDays',
            label: 'Streak',
            align: 'center',
            render: (u) => `${u.streakDays} өдөр`,
          },
        ]}
        rows={users}
        idKey="id"
        onDelete={(u) => handleDelete(u.id, u.name)}
        canDelete={(u) => u.role !== 'admin'}
      />
    </div>
  );
}
