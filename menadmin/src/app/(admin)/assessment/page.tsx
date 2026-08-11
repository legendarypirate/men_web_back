'use client';

import { useEffect, useState } from 'react';
import { ResourceManager } from '@/components/admin/resource-manager';
import { AppTable } from '@/components/custom/app-table';
import { formatDate } from '@/components/custom/date-picker';
import { api, AssessmentAnswerRow } from '@/lib/api';
import { assessmentConfig } from '@/lib/resource-configs';

export default function AssessmentPage() {
  const [answers, setAnswers] = useState<AssessmentAnswerRow[]>([]);

  useEffect(() => {
    api.assessmentAnswers.list().then((res) => setAnswers(res.data.answers));
  }, []);

  return (
      <div className="space-y-8">
      <ResourceManager
        config={assessmentConfig}
        api={api.assessmentQuestions}
        getNewItem={() => ({ id: `q_${Date.now()}`, questionKey: `question_${Date.now()}` })}
      />

      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Хэрэглэгчийн хариултууд</h2>
        <AppTable
            columns={[
              {
                key: 'user',
                label: 'Хэрэглэгч',
                render: (r) => r.user?.name || r.userId,
              },
              {
                key: 'questionKey',
                label: 'Асуулт',
                className: 'font-mono text-xs',
              },
              {
                key: 'answerLabel',
                label: 'Хариулт',
                render: (r) => r.answerLabel || r.answerKey,
              },
              {
                key: 'createdAt',
                label: 'Огноо',
                render: (r) => formatDate(r.createdAt),
              },
            ]}
            rows={answers}
            idKey="id"
            emptyMessage="Хариулт байхгүй"
          />
      </div>
    </div>
  );
}
