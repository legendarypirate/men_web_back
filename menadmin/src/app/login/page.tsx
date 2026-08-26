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

const LOGIN_BG =
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50f?auto=format&fit=crop&w=1920&q=80';

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
    <div className="relative min-h-screen overflow-hidden text-white">
      <div
        aria-hidden
        className="absolute inset-0 scale-105 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${LOGIN_BG}')` }}
      />
      <div className="absolute inset-0 bg-[#070b10]/80" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-0 size-[360px] rounded-full bg-[#ff453a]/25 blur-[100px]" />
        <div className="absolute -right-16 bottom-0 size-[320px] rounded-full bg-[#ff453a]/15 blur-[90px]" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center p-4">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <Link
            href="/"
            className="rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-sm font-medium text-white/80 backdrop-blur-sm transition hover:bg-white/10 hover:text-white"
          >
            ← Нүүр
          </Link>
          <div className="rounded-lg border border-white/10 bg-black/25 backdrop-blur-sm">
            <ThemeSwitcher />
          </div>
        </div>

        <div className="w-full max-w-md">
          <Card className="border-white/10 bg-[#141a22]/85 shadow-2xl shadow-black/50 backdrop-blur-xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2">
                <TenkheeLogo size="lg" className="shadow-lg shadow-black/40" />
              </div>
              <CardTitle className="text-2xl text-white">{SITE.name} Admin</CardTitle>
              <CardDescription className="text-white/55">
                Апп бүрэн удирдах самбар · {SITE.domain}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/80">
                    И-мэйл
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="И-мэйл хаягаа оруулна уу"
                    autoComplete="off"
                    required
                    className="border-white/15 bg-white/5 text-white placeholder:text-white/35 focus-visible:border-[#ff453a]/50 focus-visible:ring-[#ff453a]/25"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white/80">
                    Нууц үг
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Нууц үгээ оруулна уу"
                    autoComplete="new-password"
                    required
                    className="border-white/15 bg-white/5 text-white placeholder:text-white/35 focus-visible:border-[#ff453a]/50 focus-visible:ring-[#ff453a]/25"
                  />
                </div>
                {error && (
                  <Alert variant="destructive" className="border-red-500/30 bg-red-500/10">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    'h-11 w-full bg-[#ff453a] text-base font-semibold text-white hover:bg-[#e63e35]',
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
    </div>
  );
}
