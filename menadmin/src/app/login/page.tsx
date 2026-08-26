'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, setToken } from '@/lib/api';
import { SITE } from '@/lib/site-config';
import { TenkheeLogo } from '@/components/brand/tenkhee-logo';
import { ThemeSwitcher } from '@/components/custom/theme-switcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <Link
          href="/"
          className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          ← Нүүр
        </Link>
        <ThemeSwitcher />
      </div>
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-2">
              <TenkheeLogo size="lg" className="shadow-md" />
            </div>
            <CardTitle className="text-2xl">{SITE.name} Admin</CardTitle>
            <CardDescription>Апп бүрэн удирдах самбар · {SITE.domain}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">И-мэйл</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Нууц үг</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button
                type="submit"
                disabled={loading}
                className={cn(
                  'w-full bg-[#ff453a] text-white hover:bg-[#e63e35]',
                  'disabled:opacity-60'
                )}
              >
                {loading ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
