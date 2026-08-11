'use client';

import { useEffect, useState } from 'react';
import { api, WorkoutSession } from '@/lib/api';
import { AppTable } from '@/components/custom/app-table';
import { formatDate } from '@/components/custom/date-picker';
import { ErrorState, LoadingState, PageHeader } from '@/components/page-ui';

export default function SessionsPage() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.sessions
      .list()
      .then((res) => setSessions(res.data.sessions))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader
        title="Дасгалын сессүүд"
        subtitle={`Сүүлийн ${sessions.length} сесс (app-аас бүртгэгдсэн)`}
      />
      <AppTable
        columns={[
          {
            key: 'user',
            label: 'Хэрэглэгч',
            render: (r) => r.user?.name || r.userId,
            className: 'font-medium',
          },
          {
            key: 'program',
            label: 'Хөтөлбөр',
            render: (r) => r.program?.title || r.programId,
          },
          {
            key: 'durationSeconds',
            label: 'Хугацаа',
            render: (r) => `${Math.round(r.durationSeconds / 60)} мин`,
          },
          { key: 'completedSets', label: 'Set' },
          {
            key: 'consistencyPercent',
            label: 'Тогтвортой %',
            render: (r) => `${r.consistencyPercent}%`,
          },
          {
            key: 'createdAt',
            label: 'Огноо',
            render: (r) => formatDate(r.createdAt, true),
          },
        ]}
        rows={sessions}
        idKey="id"
        emptyMessage="Одоогоор сесс бүртгэгдээгүй байна"
      />
    </div>
  );
}
