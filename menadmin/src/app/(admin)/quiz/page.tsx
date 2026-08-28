'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ResourceManager } from '@/components/admin/resource-manager';
import { QuizStagesPanel } from '@/components/admin/quiz-stages-panel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { api, QuizConfigRecord, QuizStageRecord } from '@/lib/api';
import { quizQuestionConfig } from '@/lib/resource-configs';

export default function QuizAdminPage() {
  const [stages, setStages] = useState<QuizStageRecord[]>([]);
  const [config, setConfig] = useState<QuizConfigRecord | null>(null);
  const [messagesText, setMessagesText] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);

  const load = useCallback(async () => {
    const [stagesRes, configRes] = await Promise.all([
      api.quizStages.list(),
      api.quizConfig.get(),
    ]);
    setStages(stagesRes.data.stages);
    setConfig(configRes.data.config);
    setMessagesText((configRes.data.config.processingMessages || []).join('\n'));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const questionConfig = useMemo(() => {
    const stageOptions = stages.map((stage) => ({
      label: stage.label,
      value: String(stage.id),
    }));
    return {
      ...quizQuestionConfig,
      fields: quizQuestionConfig.fields.map((field) =>
        field.key === 'stageId'
          ? {
              ...field,
              options: stageOptions,
            }
          : field
      ),
      columns: quizQuestionConfig.columns.map((column) =>
        column.key === 'stageId'
          ? {
              ...column,
              render: (row: { stageId: number }) =>
                stages.find((stage) => stage.id === row.stageId)?.label ||
                row.stageId,
            }
          : column
      ),
    };
  }, [stages]);

  async function saveConfig() {
    if (!config) return;
    setSavingConfig(true);
    try {
      const processingMessages = messagesText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
      const res = await api.quizConfig.update({
        processingTitle: config.processingTitle,
        processingMessages,
        active: config.active,
      });
      setConfig(res.data.config);
      setMessagesText(res.data.config.processingMessages.join('\n'));
    } finally {
      setSavingConfig(false);
    }
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Quiz удирдлага</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          tenkhee.mn/quiz — хэсэг, асуулт, төгсгөлийн медиа
        </p>
      </div>

      <QuizStagesPanel stages={stages} onChange={load} />

      <ResourceManager
        config={questionConfig}
        api={api.quizQuestions}
        getNewItem={() => ({
          id: `question_${Date.now()}`,
          stageId: stages[0]?.id ?? 1,
        })}
      />

      {config && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Боловсруулалтын дэлгэц</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Quiz дуусахад харагдах ачааллын мессежүүд
          </p>
          <div className="mt-4 space-y-4">
            <div>
              <Label>Гарчиг</Label>
              <Input
                value={config.processingTitle}
                onChange={(e) =>
                  setConfig({ ...config, processingTitle: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Мессежүүд (мөр бүрт нэг)</Label>
              <Textarea
                rows={5}
                value={messagesText}
                onChange={(e) => setMessagesText(e.target.value)}
              />
            </div>
            <Button type="button" onClick={saveConfig} disabled={savingConfig}>
              {savingConfig ? 'Хадгалж байна...' : 'Тохиргоо хадгалах'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
