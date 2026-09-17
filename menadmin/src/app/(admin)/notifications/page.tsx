'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  api,
  PushNotificationAudience,
  PushNotificationStats,
  SendPushNotificationResult,
} from '@/lib/api';
import { ErrorState, LoadingState, PageHeader, StatCard } from '@/components/page-ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const audienceOptions: { value: PushNotificationAudience; label: string }[] = [
  { value: 'all', label: 'Бүх хэрэглэгч' },
  { value: 'free', label: 'Зөвхөн Free' },
  { value: 'monthly', label: 'Сар бүр (Monthly)' },
  { value: 'quarterly', label: 'Улирал (Quarterly)' },
  { value: 'yearly', label: 'Жил бүр (Yearly)' },
  { value: 'platinum', label: 'Platinum / Lifetime' },
  { value: 'paid', label: 'Бүх төлбөртэй' },
];

function audienceLabel(audience: PushNotificationAudience) {
  return audienceOptions.find((option) => option.value === audience)?.label || audience;
}

export default function NotificationsPage() {
  const [stats, setStats] = useState<PushNotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('Tenkhee');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState<PushNotificationAudience>('all');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendPushNotificationResult | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const audiencePreview = useMemo(() => {
    if (stats?.audienceCounts) {
      return stats.audienceCounts[audience] || { users: 0, devices: 0 };
    }
    if (audience === 'all' && stats) {
      return { users: stats.usersWithTokens, devices: stats.registeredDevices };
    }
    return null;
  }, [stats, audience]);

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

    const recipientText =
      audience === 'all'
        ? 'бүх бүртгэлтэй хэрэглэгчид'
        : `${audienceLabel(audience)} гишүүнчлэлтэй хэрэглэгчид`;

    if (
      !confirm(
        `${recipientText} push мэдэгдэл илгээх үү?\n\nЭнэ үйлдлийг буцаах боломжгүй.`
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
        ...(audience !== 'all' ? { membership: audience } : {}),
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
        subtitle="Гишүүнчлэлээр шүүж FCM push илгээх"
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
          {result?.errors && result.errors.length > 0 && (
            <div className="mt-3 space-y-1 rounded-md border border-red-200 bg-red-50 p-3 text-red-900">
              <p className="font-medium">Алдаатай token-ууд:</p>
              {result.errors.map((item) => (
                <p key={`${item.platform}-${item.tokenSuffix}-${item.code}`} className="font-mono text-xs">
                  {item.platform} · ...{item.tokenSuffix} · {item.code}
                </p>
              ))}
              {result.errors.some((item) => item.platform === 'ios') && (
                <p className="pt-2 text-xs">
                  iOS алдаа ихэвчлэн Firebase Console дээр APNs .p8 key оруулаагүй
                  эсвэл хуучин token байхад гардаг.
                </p>
              )}
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

      {stats?.devices && stats.devices.length > 0 && (
        <div className="mb-6 overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="border-b px-4 py-3 text-sm font-medium">
            Бүртгэлтэй FCM token-ууд
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-2">Хэрэглэгч</th>
                  <th className="px-4 py-2">Platform</th>
                  <th className="px-4 py-2">Token suffix</th>
                  <th className="px-4 py-2">Шинэчлэгдсэн</th>
                </tr>
              </thead>
              <tbody>
                {stats.devices.map((device) => (
                  <tr key={`${device.userId}-${device.tokenSuffix}`} className="border-t">
                    <td className="px-4 py-2">
                      {device.userName || device.userEmail || device.userId}
                    </td>
                    <td className="px-4 py-2">{device.platform}</td>
                    <td className="px-4 py-2 font-mono">...{device.tokenSuffix}</td>
                    <td className="px-4 py-2">
                      {device.updatedAt
                        ? new Date(device.updatedAt).toLocaleString('mn-MN')
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!stats?.fcmConfigured && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-medium">FCM ажиллахгүй байна</p>
          {stats?.fcmInitError && (
            <p className="mt-2 font-mono text-xs break-all">{stats.fcmInitError}</p>
          )}
          {stats?.credentialsPath && (
            <p className="mt-2 font-mono text-xs break-all">
              Хайж байгаа файл: {stats.credentialsPath}
            </p>
          )}
          <p className="mt-3">
            Production сервер дээр Firebase service account JSON файлыг backend root
            folder-т байрлуулна. Жишээ нь:
          </p>
          <p className="mt-1 font-mono text-xs">
            FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
          </p>
          <p className="mt-2">
            Эсвэл нэг мөр JSON:
            <code className="ml-1 rounded bg-amber-100 px-1">
              FIREBASE_SERVICE_ACCOUNT_JSON=
            </code>
          </p>
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

        <div className="space-y-2">
          <Label htmlFor="push-audience">Хүлээн авагч</Label>
          <Select
            value={audience}
            onValueChange={(value) => setAudience(value as PushNotificationAudience)}
          >
            <SelectTrigger id="push-audience" className="w-full max-w-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {audienceOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                  {stats?.audienceCounts?.[option.value] && (
                    <span className="text-muted-foreground">
                      {' '}
                      ({stats.audienceCounts[option.value]?.users} хэрэглэгч,{' '}
                      {stats.audienceCounts[option.value]?.devices} төхөөрөмж)
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {audiencePreview && (
            <p className="text-xs text-muted-foreground">
              Сонгосон бүлэг: {audiencePreview.users} хэрэглэгч,{' '}
              {audiencePreview.devices} төхөөрөмжид илгээнэ.
            </p>
          )}
        </div>

        <div className="rounded-lg bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          Зөвхөн мэдэгдэл идэвхжүүлсэн, admin биш, апп-д нэвтэрч FCM token
          бүртгүүлсэн хэрэглэгчид илгээнэ. Гишүүнчлэл нь хэрэглэгчийн{' '}
          <code className="rounded bg-muted px-1">membership</code> талбараар
          шүүгдэнэ.
        </div>

        <Button
          type="submit"
          disabled={
            sending ||
            !stats?.fcmConfigured ||
            (audiencePreview !== null && audiencePreview.devices === 0) ||
            (audience !== 'all' && !stats?.audienceCounts)
          }
        >
          {sending
            ? 'Илгээж байна...'
            : audience === 'all'
              ? 'Бүх хэрэглэгчид илгээх'
              : `${audienceLabel(audience)} руу илгээх`}
        </Button>
      </form>
    </div>
  );
}
