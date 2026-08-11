import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm font-medium text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-primary">{value}</p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

export function LoadingState() {
  return (
    <div className="flex items-center justify-center py-20">
      <Skeleton className="size-8 rounded-full" />
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <Alert variant="destructive">
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  paid: {
    label: 'Төлсөн',
    className: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  },
  active: {
    label: 'Идэвхитэй',
    className: 'bg-[#e8f8f5] text-[#1a8f7a] border-[#c8eee6]',
  },
  true: {
    label: 'Идэвхитэй',
    className: 'bg-[#e8f8f5] text-[#1a8f7a] border-[#c8eee6]',
  },
  pending: {
    label: 'Хүлээгдэж буй',
    className: 'bg-amber-50 text-amber-700 border-amber-100',
  },
  processing: {
    label: 'Боловсруулж байна',
    className: 'bg-sky-50 text-sky-700 border-sky-100',
  },
  shipped: {
    label: 'Илгээсэн',
    className: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  },
  delivered: {
    label: 'Хүргэгдсэн',
    className: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  },
  expired: {
    label: 'Дууссан',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
  },
  cancelled: {
    label: 'Цуцлагдсан',
    className: 'bg-red-50 text-red-600 border-red-100',
  },
  admin: {
    label: 'Админ',
    className: 'bg-violet-50 text-violet-700 border-violet-100',
  },
  user: {
    label: 'Хэрэглэгч',
    className: 'bg-sky-50 text-sky-600 border-sky-100',
  },
  free: {
    label: 'Free',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
  },
  monthly: {
    label: 'Сар бүр',
    className: 'bg-primary/10 text-primary border-primary/20',
  },
  yearly: {
    label: 'Жил бүр',
    className: 'bg-primary/10 text-primary border-primary/20',
  },
  lifetime: {
    label: 'Насан турш',
    className: 'bg-primary/10 text-primary border-primary/20',
  },
  platinum: {
    label: 'Platinum',
    className: 'bg-violet-50 text-violet-700 border-violet-100',
  },
};

export function StatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase();
  const config = statusConfig[key];

  if (config) {
    return (
      <span
        className={cn(
          'inline-flex h-5 items-center rounded-full border px-2 text-[11px] font-semibold leading-none',
          config.className
        )}
      >
        {config.label}
      </span>
    );
  }

  return (
    <Badge variant="outline" className="rounded-full font-semibold">
      {status}
    </Badge>
  );
}
