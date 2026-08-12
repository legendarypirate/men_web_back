'use client';

import { useEffect, useState } from 'react';
import { api, PaymentSettings } from '@/lib/api';
import { ErrorState, LoadingState, PageHeader } from '@/components/page-ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

export default function SettingsPage() {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await api.settings.getPayment();
      setSettings(res.data.settings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Алдаа');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    if (!settings) return;
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const res = await api.settings.updatePayment(settings);
      setSettings(res.data.settings);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Хадгалж чадсангүй');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;
  if (error && !settings) return <ErrorState message={error} />;

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Тохиргоо"
        subtitle="Төлбөрийн арга — QPay эсвэл банкны данс"
      />

      {error && (
        <p className="mb-4 text-sm text-destructive">{error}</p>
      )}

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Төлбөр</CardTitle>
          <CardDescription>
            QPay идэвхгүй үед Flutter апп дээр Хаан банкны данс харуулна.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="qpay-enabled">QPay идэвхжүүлэх</Label>
              <p className="text-xs text-muted-foreground">
                Идэвхтэй үед апп QR кодоор QPay-ээр төлнө
              </p>
            </div>
            <Switch
              id="qpay-enabled"
              checked={settings?.qpayEnabled ?? true}
              onCheckedChange={(checked) =>
                setSettings((prev) =>
                  prev ? { ...prev, qpayEnabled: checked === true } : prev
                )
              }
            />
          </div>

          <div className="space-y-4 rounded-lg border p-4">
            <p className="text-sm font-medium">Банкны шилжүүлэг (QPay идэвхгүй үед)</p>

            <div className="space-y-2">
              <Label htmlFor="bank-name">Банк</Label>
              <Input
                id="bank-name"
                value={settings?.bankName ?? ''}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev ? { ...prev, bankName: e.target.value } : prev
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank-account">Дансны дугаар</Label>
              <Input
                id="bank-account"
                value={settings?.bankAccountNumber ?? ''}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev ? { ...prev, bankAccountNumber: e.target.value } : prev
                  )
                }
                placeholder="5000123456"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank-holder">Дансны эзэмшигч</Label>
              <Input
                id="bank-holder"
                value={settings?.bankAccountName ?? ''}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev ? { ...prev, bankAccountName: e.target.value } : prev
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transfer-note">Заавар</Label>
              <Textarea
                id="transfer-note"
                rows={3}
                value={settings?.transferNote ?? ''}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev ? { ...prev, transferNote: e.target.value } : prev
                  )
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={save} disabled={saving || !settings}>
              {saving ? 'Хадгалж байна...' : 'Хадгалах'}
            </Button>
            {saved && (
              <span className="text-sm text-emerald-600">Амжилттай хадгалагдлаа</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
