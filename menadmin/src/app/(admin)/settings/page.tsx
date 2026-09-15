'use client';

import { useEffect, useState } from 'react';
import { api, AppVersionSettings, PaymentSettings } from '@/lib/api';
import { ErrorState, LoadingState, PageHeader } from '@/components/page-ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

export default function SettingsPage() {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [versionSettings, setVersionSettings] = useState<AppVersionSettings | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingPayment, setSavingPayment] = useState(false);
  const [savingVersion, setSavingVersion] = useState(false);
  const [savedPayment, setSavedPayment] = useState(false);
  const [savedVersion, setSavedVersion] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [paymentRes, versionRes] = await Promise.all([
        api.settings.getPayment(),
        api.settings.getAppVersion(),
      ]);
      setSettings(paymentRes.data.settings);
      setVersionSettings(versionRes.data.settings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Алдаа');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function savePayment() {
    if (!settings) return;
    setSavingPayment(true);
    setSavedPayment(false);
    setError('');
    try {
      const res = await api.settings.updatePayment(settings);
      setSettings(res.data.settings);
      setSavedPayment(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Хадгалж чадсангүй');
    } finally {
      setSavingPayment(false);
    }
  }

  async function saveVersion() {
    if (!versionSettings) return;
    setSavingVersion(true);
    setSavedVersion(false);
    setError('');
    try {
      const res = await api.settings.updateAppVersion(versionSettings);
      setVersionSettings(res.data.settings);
      setSavedVersion(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Хадгалж чадсангүй');
    } finally {
      setSavingVersion(false);
    }
  }

  if (loading) return <LoadingState />;
  if (error && !settings && !versionSettings) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="max-w-3xl space-y-8">
      <PageHeader
        title="Тохиргоо"
        subtitle="Төлбөр, нэвтрэлт, апп хувилбарын шинэчлэл"
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      {versionSettings && (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Апп хувилбар — Force update</CardTitle>
            <CardDescription>
              iOS болон Android тус бүрд тусдаа идэвхжүүлнэ. Хэрэглэгчийн
              хувилбар доод хувилбараас бага байвал апп нээгдэхгүй, store
              руу чиглүүлнэ.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4 rounded-lg border p-4">
              <p className="text-sm font-medium">Ерөнхий мессеж</p>
              <div className="space-y-2">
                <Label htmlFor="update-title">Гарчиг</Label>
                <Input
                  id="update-title"
                  value={versionSettings.updateTitle}
                  onChange={(e) =>
                    setVersionSettings((prev) =>
                      prev ? { ...prev, updateTitle: e.target.value } : prev
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="update-message">Тайлбар</Label>
                <Textarea
                  id="update-message"
                  rows={3}
                  value={versionSettings.updateMessage}
                  onChange={(e) =>
                    setVersionSettings((prev) =>
                      prev ? { ...prev, updateMessage: e.target.value } : prev
                    )
                  }
                />
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4 rounded-lg border p-4">
                <p className="text-sm font-semibold">iOS (App Store)</p>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Label htmlFor="ios-force">Force update идэвхжүүлэх</Label>
                    <p className="text-xs text-muted-foreground">
                      Идэвхтэй үед min хувилбараас бага бол блоклоно
                    </p>
                  </div>
                  <Switch
                    id="ios-force"
                    checked={versionSettings.iosForceUpdate}
                    onCheckedChange={(checked) =>
                      setVersionSettings((prev) =>
                        prev ? { ...prev, iosForceUpdate: checked === true } : prev
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ios-min">Доод хувилбар</Label>
                  <Input
                    id="ios-min"
                    value={versionSettings.iosMinVersion}
                    onChange={(e) =>
                      setVersionSettings((prev) =>
                        prev ? { ...prev, iosMinVersion: e.target.value } : prev
                      )
                    }
                    placeholder="4.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ios-store">App Store URL</Label>
                  <Input
                    id="ios-store"
                    value={versionSettings.iosStoreUrl}
                    onChange={(e) =>
                      setVersionSettings((prev) =>
                        prev ? { ...prev, iosStoreUrl: e.target.value } : prev
                      )
                    }
                  />
                </div>
              </div>

              <div className="space-y-4 rounded-lg border p-4">
                <p className="text-sm font-semibold">Android (Google Play)</p>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Label htmlFor="android-force">Force update идэвхжүүлэх</Label>
                    <p className="text-xs text-muted-foreground">
                      Идэвхтэй үед min хувилбараас бага бол блоклоно
                    </p>
                  </div>
                  <Switch
                    id="android-force"
                    checked={versionSettings.androidForceUpdate}
                    onCheckedChange={(checked) =>
                      setVersionSettings((prev) =>
                        prev
                          ? { ...prev, androidForceUpdate: checked === true }
                          : prev
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="android-min">Доод хувилбар</Label>
                  <Input
                    id="android-min"
                    value={versionSettings.androidMinVersion}
                    onChange={(e) =>
                      setVersionSettings((prev) =>
                        prev ? { ...prev, androidMinVersion: e.target.value } : prev
                      )
                    }
                    placeholder="1.0.59"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="android-store">Play Store URL</Label>
                  <Input
                    id="android-store"
                    value={versionSettings.androidStoreUrl}
                    onChange={(e) =>
                      setVersionSettings((prev) =>
                        prev ? { ...prev, androidStoreUrl: e.target.value } : prev
                      )
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={saveVersion} disabled={savingVersion}>
                {savingVersion ? 'Хадгалж байна...' : 'Хувилбарын тохиргоо хадгалах'}
              </Button>
              {savedVersion && (
                <span className="text-sm text-emerald-600">Амжилттай хадгалагдлаа</span>
              )}
            </div>
          </CardContent>
        </Card>
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

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="email-login-enabled">И-мэйл нэвтрэлт</Label>
              <p className="text-xs text-muted-foreground">
                Идэвхтэй үед апп дээр и-мэйл, нууц үгээр нэвтэрнэ
              </p>
            </div>
            <Switch
              id="email-login-enabled"
              checked={settings?.emailLoginEnabled ?? true}
              onCheckedChange={(checked) =>
                setSettings((prev) =>
                  prev ? { ...prev, emailLoginEnabled: checked === true } : prev
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
            <Button onClick={savePayment} disabled={savingPayment || !settings}>
              {savingPayment ? 'Хадгалж байна...' : 'Төлбөрийн тохиргоо хадгалах'}
            </Button>
            {savedPayment && (
              <span className="text-sm text-emerald-600">Амжилттай хадгалагдлаа</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
