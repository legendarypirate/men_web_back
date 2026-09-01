'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api, PushNotificationStats, SendPushNotificationResult } from '@/lib/api';
import { ErrorState, LoadingState, PageHeader, StatCard } from '@/components/page-ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function NotificationsPage() {
  const [stats, setStats] = useState<PushNotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('Tenkhee');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendPushNotificationResult | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  async function loadStats() {
    setLoading(true);
    try {
      const res = await api.notifications.stats();
      setStats(res.data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Алдаа');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  async function handleSend(event: FormEvent) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();
    if (!trimmedTitle || !trimmedBody) {
      setError('Гарчиг болон мессеж оруулна уу');
      return;
    }

    if (
      !confirm(
        'Бүх бүртгэлтэй хэрэглэгчид push мэдэгдэл илгээх үү?\n\nЭнэ үйлдлийг буцаах боломжгүй.'
      )
    ) {
      return;
    }

    setSending(true);
    setError('');
    setSuccessMessage('');
    setResult(null);

    try {
      const res = await api.notifications.send({
        title: trimmedTitle,
        body: trimmedBody,
        target: 'all',
        data: { type: 'admin_broadcast' },
      });
      setResult(res.data);
      setSuccessMessage(res.message);
      setBody('');
      await loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Илгээхэд алдаа гарлаа');
    } finally {
      setSending(false);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader
        title="Push мэдэгдэл"
        subtitle="Бүх хэрэглэгчид FCM push илгээх"
      />

      {error && (
        <div className="mb-4">
          <ErrorState message={error} />
        </div>
      )}

      {successMessage && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {successMessage}
          {result && (
            <div className="mt-1 text-emerald-700">
              Амжилттай: {result.sent} · Алдаатай: {result.failed} · Хэрэглэгч:{' '}
              {result.recipientCount} · Төхөөрөмж: {result.tokenCount}
            </div>
          )}
        </div>
      )}

      {stats && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="FCM тохиргоо"
            value={stats.fcmConfigured ? 'Бэлэн' : 'Байхгүй'}
          />
          <StatCard label="Бүртгэлтэй төхөөрөмж" value={stats.registeredDevices} />
          <StatCard label="Хэрэглэгч (token)" value={stats.usersWithTokens} />
          <StatCard
            label="iOS / Android"
            value={`${stats.iosDevices} / ${stats.androidDevices}`}
          />
        </div>
      )}

      {!stats?.fcmConfigured && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Backend дээр Firebase service account тохируулаагүй байна.{' '}
          <code className="rounded bg-amber-100 px-1">FIREBASE_SERVICE_ACCOUNT_PATH</code>{' '}
          эсвэл{' '}
          <code className="rounded bg-amber-100 px-1">FIREBASE_SERVICE_ACCOUNT_JSON</code>{' '}
          .env-д нэмнэ үү.
        </div>
      )}

      <form
        onSubmit={handleSend}
        className="max-w-2xl space-y-5 rounded-xl border bg-card p-6 shadow-sm"
      >
        <div className="space-y-2">
          <Label htmlFor="push-title">Гарчиг</Label>
          <Input
            id="push-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tenkhee"
            maxLength={120}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="push-body">Мессеж</Label>
          <Textarea
            id="push-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Мэдэгдлийн текст..."
            rows={5}
            maxLength={500}
            required
          />
          <p className="text-xs text-muted-foreground">{body.length}/500</p>
        </div>

        <div className="rounded-lg bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          Зөвхөн мэдэгдэл идэвхжүүлсэн, admin биш, апп-д нэвтэрч FCM token
          бүртгүүлсэн хэрэглэгчид илгээнэ.
        </div>

        <Button
          type="submit"
          disabled={sending || !stats?.fcmConfigured || stats.registeredDevices === 0}
        >
          {sending ? 'Илгээж байна...' : 'Бүх хэрэглэгчид илгээх'}
        </Button>
      </form>
    </div>
  );
}
