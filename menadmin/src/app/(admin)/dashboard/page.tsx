'use client';

import { useEffect, useState } from 'react';
import { api, Stats } from '@/lib/api';
import { adminNav } from '@/lib/nav-config';
import { ErrorState, LoadingState, PageHeader, StatCard } from '@/components/page-ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .stats()
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <ErrorState message={error} />;
  if (!stats) return <LoadingState />;

  const quickLinks = adminNav.filter((n) => n.href !== '/dashboard');

  return (
    <div>
      <PageHeader
        title="Хяналтын самбар"
        subtitle="Tenkhee аппын бүх модулийг эндээс удирдана"
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Хэрэглэгч" value={stats.users} hint={`${stats.premiumUsers} premium`} />
        <StatCard label="Дасгалын сесс" value={stats.sessions} />
        <StatCard label="Дэлгүүрийн бараа" value={stats.products} />
        <StatCard label="Захиалга" value={stats.orders} hint={`${stats.pendingOrders} хүлээгдэж буй`} />
        <StatCard label="Нийтлэл" value={stats.articles} />
        <StatCard label="Дасгалын хөтөлбөр" value={stats.programs} />
        <StatCard label="Үнэлгээний асуулт" value={stats.assessmentQuestions} />
        <StatCard label="QPay орлого" value={stats.paidRevenueLabel} />
        <StatCard label="Дэлгүүрийн орлого" value={stats.orderRevenueLabel} />
        <StatCard
          label="Төлбөрүүд"
          value={stats.payments}
          hint={`${stats.pendingPayments} хүлээгдэж буй`}
        />
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Хурдан холбоос</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {quickLinks.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button variant="outline" size="sm" type="button">
                <item.icon className="size-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Удирдах модулууд</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <p>• Хэрэглэгч, гишүүнчлэл, streak</p>
          <p>• Дасгалын хөтөлбөр + өнөөдрийн дасгал</p>
          <p>• Нийтлэл, эрүүл мэндийн зөвлөмж</p>
          <p>• Үнэлгээний асуулт + хариултууд</p>
          <p>• Дэлгүүрийн бүтээгдэхүүн, захиалга</p>
          <p>• Premium төлөвлөгөө, QPay төлбөр</p>
        </CardContent>
      </Card>
    </div>
  );
}
