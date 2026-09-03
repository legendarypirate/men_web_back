'use client';

import { useEffect, useState } from 'react';
import { api, User } from '@/lib/api';
import { AppTable } from '@/components/custom/app-table';
import { TableSelect } from '@/components/custom/table-select';
import { ErrorState, LoadingState, PageHeader, StatusBadge } from '@/components/page-ui';
import { useConfirm } from '@/components/custom/confirm-provider';

const premiumMemberships = new Set(['monthly', 'yearly']);
const userMembershipOptions = ['free', 'monthly', 'yearly'] as const;

function membershipAllowsDates(membership: string) {
  return premiumMemberships.has(membership);
}

const membershipLabels: Record<string, string> = {
  free: 'Free',
  monthly: 'Сар бүр',
  yearly: 'Жил бүр',
};

function isAdminUser(user: User) {
  return user.role === 'admin';
}

function isAssignableMembership(
  membership: string
): membership is (typeof userMembershipOptions)[number] {
  return userMembershipOptions.includes(
    membership as (typeof userMembershipOptions)[number]
  );
}

function toDateInput(value?: string | null) {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
}

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
    const current = users.find((u) => u.id === id);
    if (current && isAdminUser(current)) return;
    await api.users.update(id, { membership } as Partial<User>);
    load();
  }

  async function handleDate(
    id: string,
    field: 'membershipStartedAt' | 'membershipExpiresAt',
    value: string
  ) {
    const current = users.find((u) => u.id === id);
    if (current && isAdminUser(current)) return;
    if (current && !membershipAllowsDates(current.membership)) {
      setError('Эхлээд гишүүнчлэлийг free-ээс өөр сонгоно уу');
      return;
    }
    try {
      await api.users.update(id, {
        [field]: value ? new Date(`${value}T00:00:00`).toISOString() : null,
      } as Partial<User>);
      setError('');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Алдаа');
    }
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
            render: (u) => {
              if (isAdminUser(u)) {
                return <StatusBadge status="platinum" />;
              }
              if (!isAssignableMembership(u.membership)) {
                return <StatusBadge status={u.membership} />;
              }
              return (
                <TableSelect
                  value={u.membership}
                  onValueChange={(v) => handleMembership(u.id, v)}
                  options={userMembershipOptions.map((m) => ({
                    value: m,
                    label: membershipLabels[m] || m,
                  }))}
                />
              );
            },
          },
          {
            key: 'membershipStartedAt',
            label: 'Эхлэх',
            render: (u) =>
              isAdminUser(u) ? (
                <input
                  type="date"
                  className="h-8 rounded border border-[#dfe6e9] px-2 text-[12px] text-[#2c3e50] disabled:cursor-not-allowed disabled:opacity-50"
                  value={toDateInput(u.membershipStartedAt)}
                  disabled
                  title="Админ гишүүнчлэлийг засах боломжгүй"
                />
              ) : (
                <input
                  type="date"
                  className="h-8 rounded border border-[#dfe6e9] px-2 text-[12px] text-[#2c3e50] disabled:cursor-not-allowed disabled:opacity-50"
                  value={toDateInput(u.membershipStartedAt)}
                  disabled={!membershipAllowsDates(u.membership)}
                  title={
                    membershipAllowsDates(u.membership)
                      ? undefined
                      : 'Эхлээд гишүүнчлэл сонгоно уу'
                  }
                  onChange={(e) =>
                    handleDate(u.id, 'membershipStartedAt', e.target.value)
                  }
                />
              ),
          },
          {
            key: 'membershipExpiresAt',
            label: 'Дуусах',
            render: (u) =>
              isAdminUser(u) ? (
                <span className="text-[12px] text-[#95a5a6]">—</span>
              ) : (
                <input
                  type="date"
                  className="h-8 rounded border border-[#dfe6e9] px-2 text-[12px] text-[#2c3e50] disabled:cursor-not-allowed disabled:opacity-50"
                  value={toDateInput(u.membershipExpiresAt)}
                  disabled={!membershipAllowsDates(u.membership)}
                  title={
                    membershipAllowsDates(u.membership)
                      ? undefined
                      : 'Эхлээд гишүүнчлэл сонгоно уу'
                  }
                  onChange={(e) =>
                    handleDate(u.id, 'membershipExpiresAt', e.target.value)
                  }
                />
              ),
          },
          {
            key: 'hasActivePremium',
            label: 'Premium',
            align: 'center',
            render: (u) => (
              <StatusBadge
                status={u.hasActivePremium ? 'paid' : 'free'}
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
