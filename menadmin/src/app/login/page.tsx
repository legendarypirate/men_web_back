'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setToken } from '@/lib/api';
import { DEMO_ADMIN } from '@/lib/nav-config';
import { ThemeSwitcher } from '@/components/custom/theme-switcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(DEMO_ADMIN.email);
  const [password, setPassword] = useState(DEMO_ADMIN.password);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.login(email, password);
      setToken(res.data.token);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Нэвтрэхэд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  }

  function fillDemo() {
    setEmail(DEMO_ADMIN.email);
    setPassword(DEMO_ADMIN.password);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeSwitcher />
      </div>
      <div className="w-full max-w-md space-y-4">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-2xl bg-primary/15 text-2xl font-bold text-primary">
              V
            </div>
            <CardTitle className="text-2xl">Tenkhee Admin</CardTitle>
            <CardDescription>Апп бүрэн удирдах самбар</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">И-мэйл</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Нууц үг</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Demo админ нэвтрэх</CardTitle>
            <CardDescription>Seed ажиллуулсны дараа ашиглана</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-lg border bg-background p-3 font-mono text-xs">
              <p>
                <span className="text-muted-foreground">Email: </span>
                {DEMO_ADMIN.email}
              </p>
              <p className="mt-1">
                <span className="text-muted-foreground">Password: </span>
                {DEMO_ADMIN.password}
              </p>
            </div>
            <Button type="button" variant="outline" className="w-full" onClick={fillDemo}>
              Demo мэдээлэл оруулах
            </Button>
            <p className="text-xs text-muted-foreground">
              Backend: <code className="text-primary">npm run seed</code> → дараа нь admin panel
              нээнэ.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
